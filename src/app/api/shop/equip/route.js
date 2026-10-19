import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { changeProgress } from '@/db/progressStore';
import { getSignedInUserId } from '@/lib/supabase/server';
import { equipItem } from '@/app/utils/progress/shop';

/** POST /api/shop/equip  { itemId }  → { state } or { error }. Only owned items can be worn. */
export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  let itemId = '';
  try {
    itemId = String((await request.json())?.itemId || '').slice(0, 80);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const result = await changeProgress(userId, (state) => equipItem(state, itemId));
  if (!result.ok) return NextResponse.json({ error: result.error, state: result.state || null }, { status: 409 });
  return NextResponse.json({ state: result.state });
}
