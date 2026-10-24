'use client';

import { useEffect, useRef } from 'react';
import { isProOnDevice } from '@/app/utils/proClient';

import { AD_CLIENT, adSlotFor } from '@/app/utils/ads/adsenseConfig';

/**
 * One responsive AdSense block. The parent decides whether ads are allowed (useAdsAllowed) and
 * reserves the height, so the page never jumps. Pushing before the script has loaded only queues it.
 */
export default function AdUnit({ slot = adSlotFor('landing') }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current || isProOnDevice()) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // An ad that cannot load leaves the reserved space empty; nothing else depends on it.
    }
  }, []);

  if (!AD_CLIENT || !slot) return null;
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%' }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
