/**
 * Where NETZ may show ads (NETZ_LAUNCH_PLAN.md 6.1). Pure, so it can be tested on its own.
 * Never for Pro, never offline (the slot just hides and the PWA keeps working), and never in the
 * Playground, on Pricing or on a shared public note.
 */

// A page and everything under it
const NO_AD_SECTIONS = ['/Playground', '/Pricing', '/p'];

export function adsAllowedAt(pathname, { pro = false, online = true } = {}) {
  if (pro || !online) return false;
  const path = String(pathname || '/');
  return !NO_AD_SECTIONS.some((section) => path === section || path.startsWith(`${section}/`));
}

// Rewarded ads: gems per ad and ads per day (plan 6.4)
export const AD_REWARD = { gems: 10, perDay: 3 };

// Full-screen ads: at most one per 15 active minutes and 4 a day (plan 6.3)
export const TIMED_AD = { activeMinutes: 15, perDay: 4 };
