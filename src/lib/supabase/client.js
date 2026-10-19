'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from './config';

let browserClient = null;

/** The browser's Supabase client (session kept in cookies, so the server sees it too). Null if not set up. */
export function getSupabaseBrowser() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!browserClient) browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
