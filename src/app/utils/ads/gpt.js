/**
 * Google Ad Manager (GPT) for the two ad formats AdSense units cannot do (NETZ_LAUNCH_PLAN.md 6.3,
 * 6.4): the full-screen "web interstitial" and "rewarded" ads. Both are Google's own formats, so
 * NETZ never puts an ad in a pop-up of its own. Nothing loads until the owner sets the ad unit paths.
 */

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';

export const INTERSTITIAL_UNIT = process.env.NEXT_PUBLIC_GAM_INTERSTITIAL_UNIT || '';
export const REWARDED_UNIT = process.env.NEXT_PUBLIC_GAM_REWARDED_UNIT || '';

let loading = null;
function loadGpt() {
  if (!loading) {
    window.googletag = window.googletag || { cmd: [] };
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GPT_SRC;
      s.async = true;
      s.onload = () => resolve(window.googletag);
      s.onerror = () => {
        loading = null;
        reject(new Error('gpt_blocked'));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/**
 * Arms one full-screen ad: Google shows it when the student next changes page (a natural break,
 * never in the middle of drawing or a calculation). `onShown` runs when it really showed.
 * Resolves to a function that removes it again, or null when it cannot be armed.
 */
export async function armInterstitial(onShown) {
  if (!INTERSTITIAL_UNIT) return null;
  try {
    await loadGpt();
  } catch {
    return null;
  }
  return new Promise((resolve) => {
    window.googletag.cmd.push(() => {
      const googletag = window.googletag;
      const slot = googletag.defineOutOfPageSlot(INTERSTITIAL_UNIT, googletag.enums.OutOfPageFormat.INTERSTITIAL);
      if (!slot) {
        resolve(null); // this page or browser does not support it
        return;
      }
      slot.addService(googletag.pubads());
      const onLoad = (e) => {
        if (e.slot !== slot) return;
        googletag.pubads().removeEventListener('slotOnload', onLoad);
        onShown();
      };
      googletag.pubads().addEventListener('slotOnload', onLoad);
      googletag.enableServices();
      googletag.display(slot);
      resolve(() => {
        googletag.pubads().removeEventListener('slotOnload', onLoad);
        googletag.destroySlots([slot]);
      });
    });
  });
}

/**
 * Plays one rewarded ad. Resolves 'granted' when Google says it was watched to the end,
 * 'closed' when the student closed it early, 'none' when no ad was available, 'blocked' when the
 * ad script could not load (often an ad blocker).
 */
export async function playRewarded() {
  if (!REWARDED_UNIT) return 'none';
  try {
    await loadGpt();
  } catch {
    return 'blocked';
  }
  return new Promise((resolve) => {
    window.googletag.cmd.push(() => {
      const googletag = window.googletag;
      const slot = googletag.defineOutOfPageSlot(REWARDED_UNIT, googletag.enums.OutOfPageFormat.REWARDED);
      if (!slot) {
        resolve('none');
        return;
      }
      slot.addService(googletag.pubads());
      const pubads = googletag.pubads();
      let result = 'closed';
      const handlers = {
        rewardedSlotReady: (e) => { if (e.slot === slot) e.makeRewardedVisible(); },
        rewardedSlotGranted: (e) => { if (e.slot === slot) result = 'granted'; },
        rewardedSlotClosed: (e) => { if (e.slot === slot) finish(); },
        slotRenderEnded: (e) => {
          if (e.slot === slot && e.isEmpty) {
            result = 'none';
            finish();
          }
        },
      };
      function finish() {
        Object.entries(handlers).forEach(([name, fn]) => pubads.removeEventListener(name, fn));
        googletag.destroySlots([slot]);
        resolve(result);
      }
      Object.entries(handlers).forEach(([name, fn]) => pubads.addEventListener(name, fn));
      googletag.enableServices();
      googletag.display(slot);
    });
  });
}
