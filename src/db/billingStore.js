import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb } from './index';
import { billingEvents, payments, purchases } from './schema';
import { mergePurchase, proStatus, readEvent } from '@/app/utils/billingCore';

/** The student's purchases, for proStatus(). */
export async function listPurchases(userId, db = getDb()) {
  return db.select().from(purchases).where(eq(purchases.userId, userId));
}

/** Whether the student is Pro right now. */
export async function getProStatus(userId, now = Date.now()) {
  return proStatus(await listPurchases(userId), now);
}

/** Remembers a purchase the student has started (not paid yet). */
export async function recordStartedPurchase({ id, userId, plan, currency, amount }) {
  await getDb().insert(purchases).values({ id, userId, plan, currency, amount, status: 'created' }).onConflictDoNothing();
}

/** Marks a subscription as stopping at the end of its paid period (the webhook confirms it later). */
export async function markCancelAtEnd(userId, purchaseId) {
  await getDb().update(purchases).set({ cancelAtEnd: true, updatedAt: sql`now()` })
    .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, userId)));
}

/**
 * Applies one verified webhook event, once. `eventId` is Razorpay's X-Razorpay-Event-Id header.
 * Returns { applied, reason? }. Everything happens in one transaction, so a crash half way leaves
 * nothing behind and Razorpay's retry starts clean.
 */
export async function applyBillingEvent(eventId, event, db = getDb()) {
  const read = readEvent(event);
  return db.transaction(async (tx) => {
    const fresh = await tx.insert(billingEvents)
      .values({ id: String(eventId), type: String(event?.event || '') })
      .onConflictDoNothing()
      .returning({ id: billingEvents.id });
    if (!fresh.length) return { applied: false, reason: 'duplicate' };
    if (read.ignore) return { applied: false, reason: read.ignore };

    if (read.purchase) {
      const incoming = read.purchase;
      const [stored] = await tx.select().from(purchases).where(eq(purchases.id, incoming.id)).for('update');
      const userId = stored?.userId || incoming.userId;
      if (!userId) return { applied: false, reason: 'no_user' };
      if (stored && incoming.userId && stored.userId !== incoming.userId) return { applied: false, reason: 'user_mismatch' };
      if (incoming.plan === 'lifetime' && incoming.paidAmount < incoming.amount) return { applied: false, reason: 'underpaid' };

      const next = mergePurchase(stored, { ...incoming, userId });
      const row = {
        userId,
        plan: next.plan,
        currency: next.currency,
        amount: next.amount,
        status: next.status,
        paidUntil: next.paidUntil ? new Date(next.paidUntil) : null,
        cancelAtEnd: next.cancelAtEnd,
      };
      await tx.insert(purchases).values({ id: incoming.id, ...row })
        .onConflictDoUpdate({ target: purchases.id, set: { ...row, updatedAt: sql`now()` } });

      if (read.payment) {
        await tx.insert(payments).values({ ...read.payment, userId }).onConflictDoNothing();
      }
    }

    if (read.refund) {
      const [payment] = await tx.select().from(payments).where(eq(payments.id, read.refund.paymentId)).for('update');
      if (!payment) return { applied: false, reason: 'unknown_payment' };
      const refunded = Math.max(payment.refunded, read.refund.refunded);
      await tx.update(payments).set({ refunded }).where(eq(payments.id, payment.id));
      // A full refund ends the Pro it paid for (NETZ_LAUNCH_PLAN.md 5.3; Refund page)
      if (refunded >= payment.amount) {
        await tx.update(purchases).set({ status: 'refunded', cancelAtEnd: true, updatedAt: sql`now()` })
          .where(eq(purchases.id, payment.purchaseId));
      }
    }

    return { applied: true };
  });
}
