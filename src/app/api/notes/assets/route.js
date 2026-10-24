import { NextResponse } from 'next/server';
import { and, eq, ne, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { noteAssets } from '@/db/schema';
import { getSignedInUserId, getSupabaseServer } from '@/lib/supabase/server';
import { getProStatus } from '@/db/billingStore';
import { ASSET_ID_RE, ASSET_KINDS, ASSET_MAX_BYTES, assetQuota, assetStoragePath } from '@/app/(Primary.pages)/Notes/utils/assetCore';

/**
 * The cloud copy of the Notes Studio Assets library (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, 2b).
 * The files never pass through here: Vercel takes ~4.5 MB a request at most. This route checks
 * the student and their storage limit, and keeps the list; the browser uploads the files straight
 * to the private Storage bucket, which only accepts them into a folder reserved here.
 *
 * GET                                  → { assets, used, quota }
 * POST { action: 'reserve', id, kind, title, mime, ext, bytes, pageCount } → { paths, used, quota }
 * POST { action: 'confirm', id }       → { asset, used, quota }   (sizes measured from Storage)
 * POST { action: 'rename', id, title } → { ok }
 * DELETE ?id=…                         → { ok }
 */

const BUCKET = 'note-assets';
const MAX_BODY_BYTES = 16 * 1024;

const text = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

async function context() {
  if (!isDatabaseConfigured()) return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  const userId = await getSignedInUserId();
  if (!userId) return { error: NextResponse.json({ error: 'signed_out' }, { status: 401 }) };
  const pro = (await getProStatus(userId)).pro;
  return { userId, quota: assetQuota(pro), db: getDb() };
}

async function usedBytes(db, userId, exceptId = null) {
  const where = exceptId ? and(eq(noteAssets.userId, userId), ne(noteAssets.id, exceptId)) : eq(noteAssets.userId, userId);
  const [row] = await db.select({ total: sql`coalesce(sum(${noteAssets.bytes}), 0)` }).from(noteAssets).where(where);
  return Number(row?.total || 0);
}

const publicRow = (r) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  mime: r.mime,
  ext: r.ext,
  bytes: r.bytes,
  pageCount: r.pageCount,
  updatedAt: r.updatedAt,
});

export async function GET() {
  const ctx = await context();
  if (ctx.error) return ctx.error;
  const rows = await ctx.db.select().from(noteAssets).where(and(eq(noteAssets.userId, ctx.userId), eq(noteAssets.status, 'ready')));
  return NextResponse.json({ assets: rows.map(publicRow), used: await usedBytes(ctx.db, ctx.userId), quota: ctx.quota });
}

export async function POST(request) {
  const ctx = await context();
  if (ctx.error) return ctx.error;
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const id = String(body.id || '');
  if (!ASSET_ID_RE.test(id)) return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  const { db, userId, quota } = ctx;

  if (body.action === 'reserve') {
    const kind = ASSET_KINDS.includes(body.kind) ? body.kind : null;
    const bytes = Math.max(0, Math.round(Number(body.bytes) || 0));
    if (!kind) return NextResponse.json({ error: 'bad_kind' }, { status: 400 });
    if (bytes > ASSET_MAX_BYTES[kind] + 2 * 1024 * 1024) return NextResponse.json({ error: 'item_too_big' }, { status: 413 });
    const used = await usedBytes(db, userId, id);
    if (used + bytes > quota) return NextResponse.json({ error: 'full', used, quota }, { status: 409 });
    const ext = text(body.ext, 12).replace(/[^a-z0-9.]/gi, '');
    const values = {
      userId,
      id,
      kind,
      title: text(body.title, 200),
      mime: text(body.mime, 120),
      ext,
      bytes,
      pageCount: Math.max(0, Math.round(Number(body.pageCount) || 0)),
      status: 'pending',
      updatedAt: new Date(),
    };
    await db.insert(noteAssets).values(values).onConflictDoUpdate({
      target: [noteAssets.userId, noteAssets.id],
      set: { kind: values.kind, title: values.title, mime: values.mime, ext: values.ext, bytes, pageCount: values.pageCount, status: 'pending', updatedAt: values.updatedAt },
    });
    return NextResponse.json({
      paths: { main: assetStoragePath(userId, id, 'main', ext), preview: assetStoragePath(userId, id, 'preview') },
      used: used + bytes,
      quota,
    });
  }

  if (body.action === 'confirm') {
    // Sizes come from Storage itself, not from what the browser said
    const supabase = await getSupabaseServer();
    const { data: files, error } = await supabase.storage.from(BUCKET).list(`${userId}/${id}`, { limit: 10 });
    if (error) return NextResponse.json({ error: 'storage_unavailable' }, { status: 502 });
    const actual = (files || []).reduce((sum, f) => sum + (Number(f.metadata?.size) || 0), 0);
    const used = await usedBytes(db, userId, id);
    if (actual === 0 || used + actual > quota) {
      await supabase.storage.from(BUCKET).remove((files || []).map((f) => `${userId}/${id}/${f.name}`));
      await db.delete(noteAssets).where(and(eq(noteAssets.userId, userId), eq(noteAssets.id, id)));
      return NextResponse.json({ error: actual === 0 ? 'nothing_uploaded' : 'full', used, quota }, { status: 409 });
    }
    const [row] = await db.update(noteAssets).set({ bytes: actual, status: 'ready', updatedAt: new Date() })
      .where(and(eq(noteAssets.userId, userId), eq(noteAssets.id, id))).returning();
    if (!row) return NextResponse.json({ error: 'not_reserved' }, { status: 404 });
    return NextResponse.json({ asset: publicRow(row), used: used + actual, quota });
  }

  if (body.action === 'rename') {
    await db.update(noteAssets).set({ title: text(body.title, 200), updatedAt: new Date() })
      .where(and(eq(noteAssets.userId, userId), eq(noteAssets.id, id)));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'bad_action' }, { status: 400 });
}

export async function DELETE(request) {
  const ctx = await context();
  if (ctx.error) return ctx.error;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!ASSET_ID_RE.test(id)) return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  const supabase = await getSupabaseServer();
  const { data: files } = await supabase.storage.from(BUCKET).list(`${ctx.userId}/${id}`, { limit: 10 });
  if (files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => `${ctx.userId}/${id}/${f.name}`));
  await ctx.db.delete(noteAssets).where(and(eq(noteAssets.userId, ctx.userId), eq(noteAssets.id, id)));
  return NextResponse.json({ ok: true });
}
