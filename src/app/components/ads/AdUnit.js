'use client';

import { useEffect, useRef } from 'react';
import { isProOnDevice } from '@/app/utils/proClient';

export const AD_CLIENT = 'ca-pub-3746721364737268';
// The landing page's ad unit; other places use their own unit when the owner has made one
export const DEFAULT_AD_SLOT = '1328005139';

/**
 * One responsive AdSense block. The parent decides whether ads are allowed (useAdsAllowed) and
 * reserves the height, so the page never jumps. Pushing before the script has loaded only queues it.
 */
export default function AdUnit({ slot = DEFAULT_AD_SLOT }) {
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

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%' }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot || DEFAULT_AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
