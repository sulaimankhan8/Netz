import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { getProStatus, markCancelAtEnd } from '@/db/billingStore';
import { cancelSubscriptionAtPeriodEnd, isRazorpayConfigured } from '@/lib/razorpay/server';
import { getSignedInUserId } from '@/lib/supabase/server';

/**
 * POST /api/billing/cancel → stops the student's monthly or yearly plan from renewing.
 * Pro stays on until the end of the period already paid for (Refund page, Terms).
 */
export async function POST() {
  if (!isDatabaseConfigured() || !isRazorpayConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  const status = await getProStatus(userId);
  if (!status.renews || !status.purchaseId) return NextResponse.json({ error: 'nothing_to_cancel' }, { status: 409 });

  try {
    await cancelSubscriptionAtPeriodEnd(status.purchaseId);
  } catch (error) {
    console.error('[billing/cancel]', error);
    return NextResponse.json({ error: 'razorpay_failed' }, { status: 502 });
  }
  await markCancelAtEnd(userId, status.purchaseId);
  return NextResponse.json({ ok: true, until: status.until ? status.until.toISOString() : null });
}
