import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { unpublishNote } from '@/db/publicNotesStore';
import { getSignedInUserId } from '@/lib/supabase/server';

/** POST /api/notes/unpublish  { noteId } → { ok }. The link stops working straight away. */
export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  let noteId = '';
  try {
    noteId = String((await request.json())?.noteId || '').slice(0, 80);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  return NextResponse.json(await unpublishNote(userId, noteId));
}
