import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { notes } from '@/db/schema';
import { getSignedInUserId } from '@/lib/supabase/server';
import { planNoteWrites } from '@/app/(Primary.pages)/Notes/utils/notesCore';
import { getProStatus } from '@/db/billingStore';
import { cloudNoteLimit } from '@/app/utils/proLimits';

const MAX_BODY_BYTES = 4 * 1024 * 1024;

/**
 * POST /api/notes/sync (NETZ_LAUNCH_PLAN.md 4.4)
 * Body: { pushes: [{ id, data, changedAt }], deletions: [{ id, changedAt }], since: cursor | null }
 * Stores the newer versions, then returns every note that changed on the server since `since`.
 */
export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  // The cursor is Postgres time as text with microseconds (a JS Date would cut it to milliseconds)
  const limit = cloudNoteLimit((await getProStatus(userId)).pro);
  const since = typeof body.since === 'string' && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(body.since) ? body.since : null;

  const result = await getDb().transaction(async (tx) => {
    // One notes sync per student at a time, so the cloud-note count cannot be raced
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const stored = await tx.select({ id: notes.id, changedAt: notes.changedAt, deleted: notes.deleted })
      .from(notes).where(eq(notes.userId, userId));
    const existing = new Map(stored.map((n) => [n.id, n]));
    const plan = planNoteWrites(existing, body.pushes, body.deletions, limit ?? Infinity);

    for (const w of plan.writes) {
      await tx.insert(notes)
        .values({ userId, id: w.id, data: w.data, changedAt: w.changedAt, deleted: w.deleted, serverUpdatedAt: sql`now()` })
        .onConflictDoUpdate({
          target: [notes.userId, notes.id],
          set: { data: w.data, changedAt: w.changedAt, deleted: w.deleted, serverUpdatedAt: sql`now()` },
        });
    }

    const changed = await tx.select().from(notes).where(
      since ? and(eq(notes.userId, userId), sql`${notes.serverUpdatedAt} > ${since}::timestamptz`) : eq(notes.userId, userId),
    );
    const [{ cursor }] = await tx.execute(sql`select to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as cursor`);
    return { plan, changed, cursor };
  });

  return NextResponse.json({
    notes: result.changed
      .filter((n) => since || !n.deleted)
      .map((n) => ({ id: n.id, data: n.deleted ? null : n.data, changedAt: n.changedAt, deleted: n.deleted })),
    cursor: result.cursor,
    overLimit: result.plan.overLimit,
    rejected: result.plan.rejected,
    limit,
  });
}
