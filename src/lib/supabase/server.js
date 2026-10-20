import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from './config';

/** A Supabase client for route handlers and server components, reading the session cookies. */
export async function getSupabaseServer() {
  if (!SUPABASE_CONFIGURED) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a server component, where cookies are read-only; the proxy refreshes them instead
        }
      },
    },
  });
}

/**
 * The signed-in user's id, checked on the server (the token's signature, not just the cookie).
 * Null when nobody is signed in or Supabase is not set up.
 */
export async function getSignedInUserId() {
  return (await getSignedInUser())?.id || null;
}

/** The signed-in user's id and email (checked as above), or null. */
export async function getSignedInUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: typeof data.claims.email === 'string' ? data.claims.email : '' };
}
