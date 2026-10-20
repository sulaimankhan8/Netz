/** NETZ Pro billing rules (src/app/utils/billingCore.js) and prices (src/app/utils/pricing.js). */

const { proStatus, readEvent, mergePurchase, purchaseNotes, RENEWAL_GRACE_MS } = await import('./src/app/utils/billingCore.js');
const { PLANS, formatPrice, yearlySaving, yearlyPerMonth } = await import('./src/app/utils/pricing.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const DAY = 86400000;
const now = Date.parse('2026-10-20T12:00:00Z');
const sec = (ms) => Math.floor(ms / 1000);
const user = '11111111-1111-4111-8111-111111111111';

// Prices
expect('prices', formatPrice(PLANS.yearly.INR, 'INR') === '₹1,499' && formatPrice(PLANS.monthly.USD, 'USD') === '$2.99' && formatPrice(PLANS.lifetime.INR, 'INR') === '₹3,499');
expect('savings', yearlySaving('INR') === 37 && yearlySaving('USD') === 44);
expect('per month', yearlyPerMonth('INR') === '₹125' && yearlyPerMonth('USD') === '$1.67', `${yearlyPerMonth('INR')} ${yearlyPerMonth('USD')}`);

// proStatus
expect('no purchases: not Pro', !proStatus([], now).pro);
expect('started but unpaid: not Pro', !proStatus([{ id: 'sub_1', plan: 'monthly', status: 'created', paidUntil: null }], now).pro);
const monthly = { id: 'sub_1', plan: 'monthly', currency: 'INR', status: 'active', paidUntil: new Date(now + 10 * DAY), cancelAtEnd: false };
let s = proStatus([monthly], now);
expect('active monthly: Pro, renews', s.pro && s.renews && s.plan === 'monthly' && s.purchaseId === 'sub_1');
s = proStatus([{ ...monthly, paidUntil: new Date(now - DAY) }], now);
expect('renewal webhook late: still Pro in the grace days', s.pro && RENEWAL_GRACE_MS >= DAY);
expect('long past the end: not Pro', !proStatus([{ ...monthly, paidUntil: new Date(now - 5 * DAY) }], now).pro);
s = proStatus([{ ...monthly, cancelAtEnd: true }], now);
expect('cancelled: Pro until the end, not renewing', s.pro && !s.renews);
expect('cancelled and ended: no grace', !proStatus([{ ...monthly, status: 'cancelled', paidUntil: new Date(now - DAY) }], now).pro);
expect('refunded: not Pro', !proStatus([{ ...monthly, status: 'refunded' }], now).pro);
s = proStatus([monthly, { id: 'order_1', plan: 'lifetime', currency: 'INR', status: 'paid', paidUntil: null }], now);
expect('lifetime wins', s.pro && s.lifetime && s.purchaseId === 'order_1');
expect('unpaid lifetime order: not Pro', !proStatus([{ id: 'order_2', plan: 'lifetime', status: 'created' }], now).pro);

// readEvent
const subEvent = (event, extra = {}) => ({
  event,
  payload: {
    subscription: { entity: { id: 'sub_1', status: 'active', current_end: sec(now + 30 * DAY), notes: purchaseNotes(user, 'monthly', 'INR'), ...extra } },
    payment: { entity: { id: 'pay_1', amount: 19900, currency: 'INR', method: 'upi', created_at: sec(now) } },
  },
});
let r = readEvent(subEvent('subscription.charged'));
expect('charged: active, paid until current_end, payment kept', r.purchase.status === 'active' && r.purchase.paidUntil.getTime() === sec(now + 30 * DAY) * 1000 && r.payment.id === 'pay_1' && r.purchase.userId === user && r.purchase.amount === 19900);
expect('activated: no payment row', readEvent(subEvent('subscription.activated')).payment === null);
expect('authenticated: nothing paid yet', readEvent(subEvent('subscription.authenticated')).ignore === 'nothing_paid_yet');
expect('halted', readEvent(subEvent('subscription.halted')).purchase.status === 'halted');
expect('cancelled', readEvent(subEvent('subscription.cancelled')).purchase.status === 'cancelled');
expect('unknown plan in notes ignored', readEvent(subEvent('subscription.charged', { notes: { user_id: user, plan: 'weekly', currency: 'INR' } })).ignore === 'unknown_plan');
expect('other events ignored', readEvent({ event: 'payment.authorized', payload: {} }).ignore === 'not_handled');

const orderEvent = (amount) => ({
  event: 'order.paid',
  payload: {
    order: { entity: { id: 'order_1', amount: 349900, amount_paid: amount, notes: purchaseNotes(user, 'lifetime', 'INR') } },
    payment: { entity: { id: 'pay_9', amount, currency: 'INR', method: 'card', created_at: sec(now) } },
  },
});
r = readEvent(orderEvent(349900));
expect('order.paid: lifetime paid', r.purchase.plan === 'lifetime' && r.purchase.status === 'paid' && r.purchase.paidAmount === 349900 && r.payment.id === 'pay_9');
expect('order.paid underpaid is flagged', readEvent(orderEvent(100)).purchase.paidAmount < PLANS.lifetime.INR);

r = readEvent({ event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_1', amount: 19900 } }, payment: { entity: { id: 'pay_1', amount: 19900, amount_refunded: 19900 } } } });
expect('refund read', r.refund.paymentId === 'pay_1' && r.refund.refunded === 19900);

// mergePurchase
const stored = { ...monthly, userId: user, amount: 19900, paidUntil: new Date(now + 30 * DAY) };
let m = mergePurchase(stored, { ...stored, status: 'active', paidUntil: new Date(now + 10 * DAY) });
expect('an older event never moves the date back', m.paidUntil.getTime() === now + 30 * DAY);
m = mergePurchase(stored, { ...stored, status: 'active', paidUntil: new Date(now + 60 * DAY) });
expect('a renewal moves it forward', m.paidUntil.getTime() === now + 60 * DAY);
m = mergePurchase({ ...stored, status: 'refunded' }, { ...stored, status: 'active' });
expect('refunded stays refunded', m.status === 'refunded');
m = mergePurchase({ ...stored, cancelAtEnd: true }, { ...stored, status: 'active' });
expect('cancel at end is kept', m.cancelAtEnd);
expect('first event creates it', mergePurchase(null, { ...stored, status: 'active' }).status === 'active');

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
