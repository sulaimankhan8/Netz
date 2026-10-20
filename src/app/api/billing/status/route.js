import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { getProStatus } from '@/db/billingStore';
import { getSignedInUserId } from '@/lib/supabase/server';

/** GET /api/billing/status → { pro, plan, lifetime, until, renews } for the signed-in student. */
export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const s = await getProStatus(userId);
  return NextResponse.json(
    { pro: s.pro, plan: s.plan, lifetime: s.lifetime, until: s.until ? s.until.toISOString() : null, renews: s.renews },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
