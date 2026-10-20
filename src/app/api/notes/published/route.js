import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { listPublished } from '@/db/publicNotesStore';
import { getSignedInUserId } from '@/lib/supabase/server';
import { getProStatus } from '@/db/billingStore';
import { publicNoteLimit } from '@/app/utils/proLimits';

export const dynamic = 'force-dynamic';

/** GET /api/notes/published → { notes: [{ noteId, slug, title, publishedAt, updatedAt, views }], limit } */
export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const userId = await getSignedInUserId();
  if (!userId) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const { pro } = await getProStatus(userId);
  return NextResponse.json({ notes: await listPublished(userId), limit: publicNoteLimit(pro) });
}
