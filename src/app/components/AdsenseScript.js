'use client';

import { useEffect } from 'react';
import { isProOnDevice } from '@/app/utils/proClient';
import useAdsAllowed from '@/app/utils/ads/useAdsAllowed';

const SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3746721364737268';

/**
 * Loads the AdSense script when the browser is idle, the first time the student is on a page where
 * ads are allowed (utils/ads/adsPolicy.js), and never for Pro (NETZ_LAUNCH_PLAN.md 6.1: "for Pro
 * users the ad script is not even loaded"). Renders nothing.
 */
export default function AdsenseScript() {
  const allowed = useAdsAllowed();
  useEffect(() => {
    if (!allowed || isProOnDevice() || document.querySelector(`script[src="${SRC}"]`)) return undefined;
    const load = () => {
      if (isProOnDevice()) return;
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(load, 2000);
    return () => clearTimeout(t);
  }, [allowed]);
  return null;
}
