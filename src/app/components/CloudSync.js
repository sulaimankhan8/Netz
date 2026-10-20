'use client';

import { useEffect } from 'react';
import useAccount from '@/app/utils/progress/useAccount';
import { flushSoon, setAccount } from '@/app/utils/progress/cloudSync';
import { syncNotesSoon } from '@/app/(Primary.pages)/Notes/utils/notesCloud';
import { refreshPro } from '@/app/utils/proClient';

const RETRY_MS = 60 * 1000;

/**
 * Keeps progress in step with the student's account: starts syncing when they sign in, stops when
 * they sign out, and retries when the tab comes back or the network returns. Also keeps the
 * device's copy of their Pro status fresh (utils/proClient.js). Renders nothing.
 */
export default function CloudSync() {
  const { user, loading } = useAccount();

  useEffect(() => {
    if (loading) return;
    setAccount(user?.id || null);
    refreshPro(user?.id || null);
  }, [user, loading]);

  useEffect(() => {
    if (!user) return undefined;
    syncNotesSoon(0);
    const kick = () => {
      flushSoon(0);
      syncNotesSoon(0);
      refreshPro(user.id);
    };
    const onVisible = () => { if (document.visibilityState === 'visible') kick(); };
    window.addEventListener('online', kick);
    document.addEventListener('visibilitychange', onVisible);
    const retry = setInterval(kick, RETRY_MS);
    return () => {
      window.removeEventListener('online', kick);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(retry);
    };
  }, [user]);

  return null;
}
