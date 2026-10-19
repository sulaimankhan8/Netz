'use client';

import { useEffect } from 'react';
import useAccount from '@/app/utils/progress/useAccount';
import { flushSoon, setAccount } from '@/app/utils/progress/cloudSync';

const RETRY_MS = 60 * 1000;

/**
 * Keeps progress in step with the student's account: starts syncing when they sign in, stops when
 * they sign out, and retries when the tab comes back or the network returns. Renders nothing.
 */
export default function CloudSync() {
  const { user, loading } = useAccount();

  useEffect(() => {
    if (loading) return;
    setAccount(user?.id || null);
  }, [user, loading]);

  useEffect(() => {
    if (!user) return undefined;
    const kick = () => flushSoon(0);
    const onVisible = () => { if (document.visibilityState === 'visible') kick(); };
    window.addEventListener('online', kick);
    document.addEventListener('visibilitychange', onVisible);
    const retry = setInterval(() => flushSoon(0), RETRY_MS);
    return () => {
      window.removeEventListener('online', kick);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(retry);
    };
  }, [user]);

  return null;
}
