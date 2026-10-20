import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { publishNote } from '@/db/publicNotesStore';
import { getSignedInUserId } from '@/lib/supabase/server';

const MAX_BODY_BYTES = 512 * 1024;

/**
 * POST /api/notes/publish  { note, tz } → { note: { slug, … }, used, limit, state }
 * Publishes the note at /p/<slug>, or updates its public copy if already published.
 */
export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const result = await publishNote(userId, body.note, body.tz);
  if (!result.ok) return NextResponse.json(result, { status: result.error === 'limit_reached' ? 409 : 400 });
  return NextResponse.json(result);
}
