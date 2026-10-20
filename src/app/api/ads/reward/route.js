import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { changeProgress } from '@/db/progressStore';
import { getProStatus } from '@/db/billingStore';
import { getSignedInUserId } from '@/lib/supabase/server';
import { grantAdReward } from '@/app/utils/ads/adReward';
import { dayAt } from '@/app/utils/progress/syncCore';

/**
 * POST /api/ads/reward  { tz }  → { state } after a rewarded ad was watched (NETZ_LAUNCH_PLAN.md 6.4).
 * Google's web rewarded ads cannot be confirmed from the server, so the limit is what protects it:
 * at most 3 rewards (30 gems) a day per account, each written once to gem_ledger.
 */
export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  let tz = 0;
  try {
    tz = Number((await request.json())?.tz) || 0;
  } catch {
    tz = 0;
  }
  // Pro has no ads, so no ad rewards either
  if ((await getProStatus(userId)).pro) return NextResponse.json({ error: 'pro_has_no_ads' }, { status: 409 });

  const today = dayAt(Date.now(), tz);
  const result = await changeProgress(userId, (state) => grantAdReward(state, today));
  if (!result.ok) return NextResponse.json({ error: result.error, state: result.state || null }, { status: 409 });
  return NextResponse.json({ state: result.state });
}
