import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

/**
 * Google sends the student back here after sign-in. The one-time code becomes a session cookie,
 * then the student returns to the page they started from (only paths on this site are allowed).
 */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/Profile';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/Profile';

  const supabase = await getSupabaseServer();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`${safeNext}${safeNext.includes('?') ? '&' : '?'}signedIn=1`, url.origin));
  }
  return NextResponse.redirect(new URL('/Profile?signInError=1', url.origin));
}
