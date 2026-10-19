/**
 * The gem shop (NETZ_LAUNCH_PLAN.md 2.5, banners from board artboard 7). Pure: the server runs
 * buyItem / equipItem on its own copy of the progress state, so prices and balances cannot be
 * changed from the browser.
 */

import { MAX_FREEZES } from './catalog.js';

export const FREEZE_PRICE = 200;

export const BANNERS = [
  { id: 'banner.sunset-bands', name: 'Sunset Bands', price: 0 },
  { id: 'banner.hex-net', name: 'Hex Net', price: 250 },
  { id: 'banner.graph-paper', name: 'Graph Paper', price: 300 },
  { id: 'banner.sine-dunes', name: 'Sine Dunes', price: 400 },
  { id: 'banner.dusk-peaks', name: 'Dusk Peaks', price: 500 },
  { id: 'banner.origami', name: 'Origami', price: 700 },
  { id: 'banner.orbit', name: 'Orbit', price: 900 },
  // Pro Season 1: earned with 3 Pro tasks, never sold
  { id: 'banner.circuit-night', name: 'Circuit Night', price: null, pro: 'Season 1 · 3 Pro tasks' },
];

export const BANNER_BY_ID = Object.fromEntries(BANNERS.map((b) => [b.id, b]));
export const DEFAULT_BANNER = 'banner.sunset-bands';

/** Banner ids the student owns (the free one always). Older records stored 'sunset-bands'. */
export function ownedBanners(state) {
  const list = (state.owned?.banners || []).map((id) => (id.startsWith('banner.') ? id : `banner.${id}`));
  return Array.from(new Set([DEFAULT_BANNER, ...list]));
}

export function equippedBanner(state) {
  const id = state.equipped?.banner || DEFAULT_BANNER;
  const full = id.startsWith('banner.') ? id : `banner.${id}`;
  return ownedBanners(state).includes(full) ? full : DEFAULT_BANNER;
}

/**
 * Buys one item. Returns { ok, error?, ledger? } and changes `state` only when ok.
 * ledger is { amount, reason } for the gem_ledger table; reason is unique per student.
 */
export function buyItem(state, itemId, now = Date.now()) {
  if (itemId === 'freeze') {
    if (state.streak.freezes >= MAX_FREEZES) return { ok: false, error: 'freezes_full' };
    if (state.gems < FREEZE_PRICE) return { ok: false, error: 'not_enough_gems' };
    state.gems -= FREEZE_PRICE;
    state.streak.freezes += 1;
    return { ok: true, ledger: { amount: -FREEZE_PRICE, reason: `shop:freeze:${now}` } };
  }

  const banner = BANNER_BY_ID[itemId];
  if (!banner) return { ok: false, error: 'unknown_item' };
  if (banner.price === null) return { ok: false, error: 'not_for_sale' };
  if (ownedBanners(state).includes(itemId)) return { ok: false, error: 'already_owned' };
  if (state.gems < banner.price) return { ok: false, error: 'not_enough_gems' };
  state.gems -= banner.price;
  state.owned = { ...state.owned, banners: [...ownedBanners(state), itemId] };
  return { ok: true, ledger: { amount: -banner.price, reason: `shop:${itemId}` } };
}

/** Wears an owned banner. */
export function equipItem(state, itemId) {
  if (!BANNER_BY_ID[itemId]) return { ok: false, error: 'unknown_item' };
  if (!ownedBanners(state).includes(itemId)) return { ok: false, error: 'not_owned' };
  state.equipped = { ...state.equipped, banner: itemId };
  return { ok: true };
}
