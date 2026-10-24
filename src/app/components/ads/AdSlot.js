'use client';

import useAdsAllowed from '@/app/utils/ads/useAdsAllowed';
import AdUnit from './AdUnit';
import { adSlotFor } from '@/app/utils/ads/adsenseConfig';

/**
 * A labelled ad place for the app's pages (NETZ_LAUNCH_PLAN.md 6.2): algorithm pages, the
 * Algorithms hub, the Notes list and Profile. Shows nothing for Pro, offline, or where ads are not
 * allowed. `place` picks this place's AdSense ad unit (utils/ads/adsenseConfig.js); no unit, no box.
 */
export default function AdSlot({ place = 'landing', className = '', compact = false }) {
  const allowed = useAdsAllowed();
  const slot = adSlotFor(place);
  if (!allowed || !slot) return null;
  return (
    <aside
      aria-label="Advertisement"
      className={`flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-black/15 dark:border-white/15 px-3 pb-3 pt-2 ${compact ? 'min-h-[120px]' : 'min-h-[150px]'} ${className}`}
    >
      <span className="text-[11px] font-bold tracking-[0.06em] text-black/50 dark:text-white/50">ADVERTISEMENT</span>
      <div className={`w-full ${compact ? 'min-h-[90px]' : 'min-h-[100px]'}`}>
        <AdUnit slot={slot} />
      </div>
    </aside>
  );
}
