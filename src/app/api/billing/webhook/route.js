import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { applyBillingEvent } from '@/db/billingStore';
import { isValidWebhookSignature } from '@/lib/razorpay/server';

/**
 * POST /api/billing/webhook  ← Razorpay (NETZ_LAUNCH_PLAN.md 5.2)
 * The only place a payment turns Pro on. The signature is checked against the exact raw body
 * with RAZORPAY_WEBHOOK_SECRET; anything unsigned is refused. Each event id is handled once.
 *
 * Razorpay dashboard → Webhooks → URL https://<site>/api/billing/webhook, with the events:
 * subscription.activated, .charged, .pending, .halted, .cancelled, .completed, order.paid,
 * refund.processed.
 */
export async function POST(request) {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const eventId = request.headers.get('x-razorpay-event-id') || `${event?.event}:${event?.created_at}:${event?.payload?.payment?.entity?.id || event?.payload?.subscription?.entity?.id || ''}`;

  try {
    const result = await applyBillingEvent(eventId, event);
    if (!result.applied && result.reason !== 'duplicate') console.warn('[billing/webhook] not applied', event?.event, result.reason);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // A 5xx makes Razorpay try again later; the transaction left nothing half done
    console.error('[billing/webhook]', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
