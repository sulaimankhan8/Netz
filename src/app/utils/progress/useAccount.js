'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { SUPABASE_CONFIGURED } from '@/lib/supabase/config';
import { setAccount } from './cloudSync.js';

/**
 * Who is signed in (Supabase Auth with Google). `configured` is false until the Supabase keys are
 * set, and the sign-in buttons then say "soon".
 */
export default function useAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(SUPABASE_CONFIGURED);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const next = `${window.location.pathname}${window.location.search}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccount(null);
    setUser(null);
  }, []);

  return { configured: SUPABASE_CONFIGURED, user, loading, signIn, signOut };
}
