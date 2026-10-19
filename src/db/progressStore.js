import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { getDb } from './index';
import { gemLedger, progress } from './schema';

/**
 * Changes one student's stored progress inside a transaction with their row locked, so two
 * requests at once (two tabs, a double tap) cannot both spend the same gems.
 *
 * `change(state)` edits the state and returns { ok, error?, ledger? }. Nothing is saved unless ok.
 * Returns { ok, error?, state }.
 */
export async function changeProgress(userId, change) {
  return getDb().transaction(async (tx) => {
    const rows = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    if (!rows[0]) return { ok: false, error: 'no_progress_yet' };
    const state = rows[0].state;
    const result = change(state);
    if (!result.ok) return { ok: false, error: result.error, state };

    if (result.ledger) {
      await tx.insert(gemLedger).values({ userId, amount: result.ledger.amount, reason: result.ledger.reason });
    }
    await tx.update(progress).set({ state, updatedAt: sql`now()` }).where(eq(progress.userId, userId));
    return { ok: true, state };
  });
}
