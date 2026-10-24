'use client';

import useAdsAllowed from '@/app/utils/ads/useAdsAllowed';
import AdUnit from '../ads/AdUnit';
import { adSlotFor } from '@/app/utils/ads/adsenseConfig';

/**
 * The landing page's labelled AdSense block, with its height reserved so nothing on the page moves
 * when it fills. The script loads when the page is idle (AdsenseScript.js). Pro sees no slot at all.
 */
export default function AdSlot() {
  const allowed = useAdsAllowed();
  const slot = adSlotFor('landing');
  if (!allowed || !slot) return null;
  return (
    <aside className="ld-ad" aria-label="Advertisement">
      <span className="ld-ad-label">ADVERTISEMENT</span>
      <AdUnit slot={slot} />
    </aside>
  );
}
