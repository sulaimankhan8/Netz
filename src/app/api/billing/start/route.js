import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { getProStatus, recordStartedPurchase } from '@/db/billingStore';
import { createOrder, createSubscription, isRazorpayConfigured, razorpayKeyId, razorpayPlanId } from '@/lib/razorpay/server';
import { getSignedInUser } from '@/lib/supabase/server';
import { purchaseNotes } from '@/app/utils/billingCore';
import { PLANS } from '@/app/utils/pricing';

/**
 * POST /api/billing/start  { plan, currency }  → what Razorpay Checkout needs to open.
 * The amount comes from utils/pricing.js, never from the browser. Nothing is unlocked here:
 * only the webhook (api/billing/webhook) turns Pro on.
 */
export async function POST(request) {
  if (!isDatabaseConfigured() || !isRazorpayConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const user = await getSignedInUser();
  if (!user) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  let plan = '';
  let currency = '';
  try {
    const body = await request.json();
    plan = String(body?.plan || '');
    currency = String(body?.currency || '');
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const amount = PLANS[plan]?.[currency];
  if (!amount) return NextResponse.json({ error: 'unknown_plan' }, { status: 400 });

  const status = await getProStatus(user.id);
  if (status.lifetime) return NextResponse.json({ error: 'already_lifetime' }, { status: 409 });
  if (status.renews && plan !== 'lifetime') return NextResponse.json({ error: 'already_pro' }, { status: 409 });

  const notes = purchaseNotes(user.id, plan, currency);
  try {
    if (plan === 'lifetime') {
      const order = await createOrder({ amount, currency, receipt: `life-${Date.now()}`, notes });
      await recordStartedPurchase({ id: order.id, userId: user.id, plan, currency, amount });
      return NextResponse.json({ keyId: razorpayKeyId(), orderId: order.id, amount, currency, email: user.email });
    }
    if (!razorpayPlanId(plan, currency)) return NextResponse.json({ error: 'plan_not_set_up' }, { status: 503 });
    const subscription = await createSubscription({ plan, currency, notes });
    await recordStartedPurchase({ id: subscription.id, userId: user.id, plan, currency, amount });
    return NextResponse.json({ keyId: razorpayKeyId(), subscriptionId: subscription.id, amount, currency, email: user.email });
  } catch (error) {
    console.error('[billing/start]', error);
    return NextResponse.json({ error: 'razorpay_failed' }, { status: 502 });
  }
}
