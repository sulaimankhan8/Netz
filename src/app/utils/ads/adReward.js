/**
 * Gems for a watched rewarded ad (NETZ_LAUNCH_PLAN.md 6.4), applied on the server's copy of the
 * student's progress. Pure, like shop.js: changes `state` and returns { ok, error?, ledger? }.
 * The ledger reason is unique per day and ad, so the same reward can never be written twice.
 */

import { AD_REWARD } from './adsPolicy.js';

export function adRewardsLeft(state, today) {
  const used = state.adRewards?.day === today ? state.adRewards.count : 0;
  return Math.max(0, AD_REWARD.perDay - used);
}

export function grantAdReward(state, today) {
  if (adRewardsLeft(state, today) <= 0) return { ok: false, error: 'limit_reached' };
  const count = (state.adRewards?.day === today ? state.adRewards.count : 0) + 1;
  state.adRewards = { day: today, count };
  state.gems += AD_REWARD.gems;
  return { ok: true, ledger: { amount: AD_REWARD.gems, reason: `ad.reward:${today}:${count}` } };
}
