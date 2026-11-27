import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { noteAssets } from '@/db/schema';
import { getProStatus } from '@/db/billingStore';
import { cancelSubscriptionAtPeriodEnd, isRazorpayConfigured } from '@/lib/razorpay/server';
import { getSignedInUserId, getSupabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/account/delete  { confirm: 'delete' } → deletes the signed-in student's account (Privacy page,
 * docs/launch/NETZ_ROADMAP.md task 1.2). In order:
 *   1. a monthly or yearly plan stops renewing, so nothing is charged again;
 *   2. the student's files in the private `note-assets` Storage bucket are removed (while their rows still exist);
 *   3. the auth user is deleted. Every table that refers to it (profiles, progress, activity_log, gem_ledger, notes,
 *      public_notes, purchases, note_assets) is removed with it by `on delete cascade`. The `payments` table has no
 *      link to the user on purpose: payment records are kept for accounts and tax, as the Privacy page says.
 * Notes and progress kept in the browser are not touched here; the Profile page offers to clear them too.
 */

const BUCKET = 'note-assets';

export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body?.confirm !== 'delete') return NextResponse.json({ error: 'not_confirmed' }, { status: 400 });

  // 1. Stop a renewing plan first: if this fails, stop here, so the student is never charged after deleting
  const status = await getProStatus(userId);
  if (status.renews && status.purchaseId) {
    if (!isRazorpayConfigured()) return NextResponse.json({ error: 'billing_unavailable' }, { status: 503 });
    try {
      await cancelSubscriptionAtPeriodEnd(status.purchaseId);
    } catch (error) {
      console.error('[account/delete] cancel', error);
      return NextResponse.json({ error: 'cancel_failed' }, { status: 502 });
    }
  }

  const db = getDb();
  const supabase = await getSupabaseServer();

  // 2. Files in Storage (the student's own folder; the bucket's "delete own" rule allows this)
  try {
    const rows = await db.select({ id: noteAssets.id }).from(noteAssets).where(eq(noteAssets.userId, userId));
    for (const { id } of rows) {
      const { data: files } = await supabase.storage.from(BUCKET).list(`${userId}/${id}`, { limit: 10 });
      if (files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => `${userId}/${id}/${f.name}`));
    }
  } catch (error) {
    // Not fatal: the rows go with the account, and any file left behind has no owner who can read it
    console.error('[account/delete] storage', error);
  }

  // 3. The account itself, and everything that cascades from it
  try {
    await db.execute(sql`delete from auth.users where id = ${userId}`);
  } catch (error) {
    console.error('[account/delete] user', error);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  // Clear the session cookies; the user no longer exists, so a failure here does not matter
  try { await supabase.auth.signOut(); } catch { /* already gone */ }
  return NextResponse.json({ ok: true });
}
