import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health: "ok" plus one tiny database query. The daily GitHub Actions job calls it so the
 * free Supabase project never sits idle long enough to pause; deploy checks use it too.
 */
export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: true, database: 'not_configured' });
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true, database: 'up' });
  } catch {
    return NextResponse.json({ ok: false, database: 'down' }, { status: 503 });
  }
}
