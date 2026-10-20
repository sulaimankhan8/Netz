/**
 * NETZ Pro billing rules without the database or Razorpay around them (NETZ_LAUNCH_PLAN.md 5.2), so
 * they can be tested on their own: who is Pro right now, and what a Razorpay webhook event changes.
 */

import { PLANS } from './pricing.js';

// A renewal is charged at the end of the paid period; its webhook can come a little after that
export const RENEWAL_GRACE_MS = 2 * 24 * 60 * 60 * 1000;

const SUBSCRIPTION_STATUS = {
  'subscription.authenticated': null, // mandate set up, nothing paid yet
  'subscription.activated': 'active',
  'subscription.charged': 'active',
  'subscription.pending': 'active', // a renewal failed and Razorpay is retrying; paid time still counts
  'subscription.halted': 'halted',
  'subscription.cancelled': 'cancelled',
  'subscription.completed': 'completed',
};

const toDate = (unixSeconds) => (unixSeconds ? new Date(unixSeconds * 1000) : null);

/**
 * Whether a student is Pro now, from all their purchases.
 * Returns { pro, plan, lifetime, until (Date | null), renews, purchaseId, currency }.
 */
export function proStatus(purchases, now = Date.now()) {
  let best = null;
  for (const p of purchases || []) {
    if (p.plan === 'lifetime') {
      if (p.status === 'paid') return { pro: true, plan: 'lifetime', lifetime: true, until: null, renews: false, purchaseId: p.id, currency: p.currency };
      continue;
    }
    if (!p.paidUntil || p.status === 'created' || p.status === 'refunded') continue;
    const until = new Date(p.paidUntil);
    const renews = p.status === 'active' && !p.cancelAtEnd;
    if (until.getTime() + (renews ? RENEWAL_GRACE_MS : 0) <= now) continue;
    if (!best || until > best.until) best = { pro: true, plan: p.plan, lifetime: false, until, renews, purchaseId: p.id, currency: p.currency };
  }
  return best || { pro: false, plan: null, lifetime: false, until: null, renews: false, purchaseId: null, currency: null };
}

/** What NETZ sends Razorpay in `notes`, and reads back from every event. */
export function purchaseNotes(userId, plan, currency) {
  return { user_id: userId, plan, currency };
}

function paymentFrom(entity, purchaseId) {
  if (!entity?.id) return null;
  return {
    id: entity.id,
    purchaseId,
    amount: Number(entity.amount) || 0,
    currency: entity.currency || '',
    method: entity.method || '',
    paidAt: toDate(entity.created_at) || new Date(),
  };
}

/**
 * Reads one verified Razorpay webhook event. Returns what to change, or { ignore: reason }:
 * - purchase: { id, userId, plan, currency, amount, status, paidUntil? } to create or update
 * - payment: a payment to record
 * - refund: { paymentId, refunded } (total refunded so far on that payment)
 */
export function readEvent(event) {
  const type = event?.event || '';
  const payload = event?.payload || {};

  if (type in SUBSCRIPTION_STATUS) {
    const sub = payload.subscription?.entity;
    if (!sub?.id) return { ignore: 'no_subscription' };
    const notes = sub.notes || {};
    const status = SUBSCRIPTION_STATUS[type];
    if (!status) return { ignore: 'nothing_paid_yet' };
    const plan = notes.plan;
    if (!['monthly', 'yearly'].includes(plan) || !PLANS[plan]?.[notes.currency]) return { ignore: 'unknown_plan' };
    return {
      type,
      purchase: {
        id: sub.id,
        userId: notes.user_id || null,
        plan,
        currency: notes.currency,
        amount: PLANS[plan][notes.currency],
        status,
        paidUntil: toDate(sub.current_end),
      },
      payment: type === 'subscription.charged' ? paymentFrom(payload.payment?.entity, sub.id) : null,
      refund: null,
    };
  }

  if (type === 'order.paid') {
    const order = payload.order?.entity;
    const payment = payload.payment?.entity;
    if (!order?.id) return { ignore: 'no_order' };
    const notes = order.notes || {};
    if (notes.plan !== 'lifetime' || !PLANS.lifetime[notes.currency]) return { ignore: 'unknown_plan' };
    return {
      type,
      purchase: {
        id: order.id,
        userId: notes.user_id || null,
        plan: 'lifetime',
        currency: notes.currency,
        amount: PLANS.lifetime[notes.currency],
        status: 'paid',
        paidUntil: null,
        // The price is NETZ's, not the browser's: a smaller payment never unlocks lifetime
        paidAmount: Number(payment?.amount ?? order.amount_paid) || 0,
      },
      payment: paymentFrom(payment, order.id),
      refund: null,
    };
  }

  if (type === 'refund.processed' || type === 'refund.created' || type === 'payment.refunded') {
    const payment = payload.payment?.entity;
    const refund = payload.refund?.entity;
    const paymentId = refund?.payment_id || payment?.id;
    if (!paymentId) return { ignore: 'no_payment' };
    const refunded = Number(payment?.amount_refunded ?? refund?.amount) || 0;
    return { type, purchase: null, payment: null, refund: { paymentId, refunded } };
  }

  return { ignore: 'not_handled' };
}

/**
 * The purchase after an event, given the stored one (or null). Never moves the paid-until date
 * back, never revives a refunded purchase, and keeps "cancel at period end" once asked for.
 */
export function mergePurchase(stored, incoming) {
  if (!stored) return { ...incoming, cancelAtEnd: incoming.status === 'cancelled' };
  if (stored.status === 'refunded') return { ...stored };
  const keepLaterDate = stored.paidUntil && incoming.paidUntil && new Date(stored.paidUntil) > new Date(incoming.paidUntil);
  return {
    ...stored,
    status: incoming.status,
    paidUntil: incoming.plan === 'lifetime' ? null : keepLaterDate ? stored.paidUntil : incoming.paidUntil || stored.paidUntil,
    cancelAtEnd: stored.cancelAtEnd || incoming.status === 'cancelled',
  };
}
