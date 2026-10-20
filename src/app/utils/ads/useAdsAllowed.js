'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useIsPro from '../useIsPro';
import { adsAllowedAt } from './adsPolicy';

/** Whether ads may show on this page right now (plan 6.6 step 2). False until the browser has checked. */
export default function useAdsAllowed() {
  const pathname = usePathname();
  const pro = useIsPro();
  const [online, setOnline] = useState(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online !== null && adsAllowedAt(pathname, { pro, online });
}
