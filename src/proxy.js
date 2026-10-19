import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from './lib/supabase/config';

/**
 * Keeps a signed-in student's Supabase session fresh before pages and API routes run
 * (Next 16 calls this file "proxy"; it used to be "middleware"). Does nothing until Supabase is set
 * up, and only runs when a Supabase session cookie is present, so visitors who never sign in pay nothing.
 */
export async function proxy(request) {
  const response = NextResponse.next({ request });
  if (!SUPABASE_CONFIGURED) return response;
  if (!request.cookies.getAll().some((c) => c.name.startsWith('sb-'))) return response;

  let out = response;
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        out = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => out.cookies.set(name, value, options));
        Object.entries(headers || {}).forEach(([key, value]) => out.headers.set(key, value));
      },
    },
  });

  // Refreshes the token if needed (and writes the new cookies through setAll)
  await supabase.auth.getClaims();
  return out;
}

export const config = {
  // Pages and API routes only: never the big Playground models, the ONNX runtime, fonts or images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|models/|onnx/|audio/|mathlive/|landing/|image/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json|js|mjs|wasm|onnx|mp3|txt|xml|webmanifest)$).*)',
  ],
};
