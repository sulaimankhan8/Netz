'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useAdsAllowed from '@/app/utils/ads/useAdsAllowed';
import { isTimedAdDue, markTimedAdShown, startActiveClock } from '@/app/utils/ads/activeClock';
import { INTERSTITIAL_UNIT, armInterstitial } from '@/app/utils/ads/gpt';

const CHECK_MS = 30 * 1000;

/**
 * The "about every 15 minutes" ad (NETZ_LAUNCH_PLAN.md 6.3). Counts active minutes on pages where
 * ads are allowed; once enough have passed it arms Google's full-screen ad, which Google shows at
 * the next page change. Off until the owner sets NEXT_PUBLIC_GAM_INTERSTITIAL_UNIT. Renders nothing.
 */
export default function TimedAds() {
  const allowed = useAdsAllowed();
  const pathname = usePathname();
  const disarm = useRef(null);
  const shown = useRef(false);

  // After an ad has shown, take it away at the next page change so it cannot show twice
  useEffect(() => {
    if (shown.current && disarm.current) {
      disarm.current();
      disarm.current = null;
      shown.current = false;
    }
  }, [pathname]);

  useEffect(() => {
    if (!allowed || !INTERSTITIAL_UNIT) return undefined;
    let alive = true;
    const stopClock = startActiveClock();
    const check = async () => {
      if (disarm.current || !isTimedAdDue()) return;
      const remove = await armInterstitial(() => {
        shown.current = true;
        markTimedAdShown();
      });
      if (alive) disarm.current = remove;
      else if (remove) remove();
    };
    check();
    const timer = setInterval(check, CHECK_MS);
    return () => {
      alive = false;
      stopClock();
      clearInterval(timer);
      // Going to a page without ads (Playground, Pricing): nothing may stay armed
      if (disarm.current && !shown.current) {
        disarm.current();
        disarm.current = null;
      }
    };
  }, [allowed]);

  return null;
}
