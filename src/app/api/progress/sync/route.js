import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { activityLog, profiles, progress } from '@/db/schema';
import { getSignedInUserId } from '@/lib/supabase/server';
import { syncProgress } from '@/app/utils/progress/syncCore';

const MAX_BODY_BYTES = 256 * 1024;

/**
 * POST /api/progress/sync (NETZ_LAUNCH_PLAN.md 4.4)
 * Body: { activities: [{ kind, details, at }], tz, profile, device? }
 * The server re-counts the activities with the shared engine and returns the true progress state.
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

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    // Lock this student's row so two tabs syncing at once cannot double-count
    const rows = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    const stored = rows[0]?.state || null;

    const out = syncProgress({
      stored,
      activities: body.activities,
      device: stored ? null : body.device,
      profile: body.profile,
      tz: body.tz,
      now: Date.now(),
    });

    if (out.isNew) {
      await tx.insert(profiles).values({
        id: userId,
        displayName: out.state.displayName || '',
        robotName: out.state.robotName || '',
      }).onConflictDoNothing();
    } else if (body.profile) {
      await tx.update(profiles)
        .set({ displayName: out.state.displayName || '', robotName: out.state.robotName || '' })
        .where(eq(profiles.id, userId));
    }

    await tx.insert(progress)
      .values({ userId, state: out.state, updatedAt: sql`now()` })
      .onConflictDoUpdate({ target: progress.userId, set: { state: out.state, updatedAt: sql`now()` } });

    if (out.logRows.length) {
      await tx.insert(activityLog).values(out.logRows.map((r) => ({ ...r, userId })));
    }
    return out;
  });

  return NextResponse.json({ state: result.state, events: result.events, isNew: result.isNew });
}
