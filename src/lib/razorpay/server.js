import 'server-only';
import crypto from 'node:crypto';

/**
 * Razorpay on the server (NETZ_LAUNCH_PLAN.md 5.2): its REST API through fetch (no SDK), and the
 * webhook signature check. Keys come from .env.local; the secret never reaches the browser.
 * Plans for monthly and yearly are made once in the Razorpay dashboard and their ids put in env.
 */

const API = 'https://api.razorpay.com/v1';

const KEY_ID = () => process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const KEY_SECRET = () => process.env.RAZORPAY_KEY_SECRET || '';
const WEBHOOK_SECRET = () => process.env.RAZORPAY_WEBHOOK_SECRET || '';

const PLAN_ENV = {
  monthly: { INR: 'RAZORPAY_PLAN_MONTHLY_INR', USD: 'RAZORPAY_PLAN_MONTHLY_USD' },
  yearly: { INR: 'RAZORPAY_PLAN_YEARLY_INR', USD: 'RAZORPAY_PLAN_YEARLY_USD' },
};

// How many renewals a subscription allows before Razorpay asks again (10 years either way)
const TOTAL_COUNT = { monthly: 120, yearly: 10 };

export function isRazorpayConfigured() {
  return Boolean(KEY_ID() && KEY_SECRET() && WEBHOOK_SECRET());
}

export function razorpayKeyId() {
  return KEY_ID();
}

/** The Razorpay plan id for a subscription plan, or '' when it has not been set up. */
export function razorpayPlanId(plan, currency) {
  const name = PLAN_ENV[plan]?.[currency];
  return name ? process.env[name] || '' : '';
}

async function call(path, body) {
  const auth = Buffer.from(`${KEY_ID()}:${KEY_SECRET()}`).toString('base64');
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data?.error?.description || `HTTP ${response.status}`;
    throw new Error(`Razorpay ${path}: ${reason}`);
  }
  return data;
}

/** A monthly or yearly subscription; the student authorises it in Razorpay Checkout. */
export function createSubscription({ plan, currency, notes }) {
  return call('/subscriptions', {
    plan_id: razorpayPlanId(plan, currency),
    total_count: TOTAL_COUNT[plan],
    customer_notify: 1,
    notes,
  });
}

/** A one-time order, for lifetime. */
export function createOrder({ amount, currency, receipt, notes }) {
  return call('/orders', { amount, currency, receipt, notes });
}

/** Stops renewing at the end of the period already paid for. */
export function cancelSubscriptionAtPeriodEnd(subscriptionId) {
  return call(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, { cancel_at_cycle_end: 1 });
}

/** True when `signature` (the X-Razorpay-Signature header) was made from this exact body with the webhook secret. */
export function isValidWebhookSignature(rawBody, signature) {
  const secret = WEBHOOK_SECRET();
  if (!secret || typeof signature !== 'string' || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
