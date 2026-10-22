/**
 * The gem shop (NETZ_LAUNCH_PLAN.md 2.5; banners from board artboard 7, robot skins from
 * artboard 13). Pure: the server runs buyItem / equipItem on its own copy of the progress state, so
 * prices and balances cannot be changed from the browser.
 */

import { MAX_FREEZES } from './catalog.js';

export const FREEZE_PRICE = 200;

// The year badge: free for everyone, bought with gems during its own year (owner's choice, 2026-10-21)
export const YEAR_BADGE_PRICE = 1500;
export const yearBadgeId = (year) => `year.${year}`;
/** The badge on sale now (this calendar year, by the server's clock on the server). */
export const yearBadgeOnSale = (now = Date.now()) => yearBadgeId(new Date(now).getUTCFullYear());

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

export const SKINS = [
  { id: 'skin.classic', name: 'Classic', price: 0, idea: 'The robot as it comes.' },
  { id: 'skin.lab-coat', name: 'Lab Coat', price: 400, idea: 'White coat with a pen in the pocket.' },
  { id: 'skin.winter', name: 'Winter', price: 450, idea: 'Beanie with a pompom and a striped scarf.' },
  { id: 'skin.grad-cap', name: 'Graduation Cap', price: 500, idea: 'Mortarboard with an amber tassel.' },
  { id: 'skin.headphones', name: 'Headphones', price: 600, idea: 'Navy headphones over the ear lights.' },
  { id: 'skin.neon-night', name: 'Neon Night', price: 700, idea: 'Night-navy body with a glowing edge.' },
  { id: 'skin.wizard', name: 'Wizard', price: 900, idea: 'A starry purple hat.' },
  { id: 'skin.astronaut', name: 'Astronaut', price: 1200, idea: 'Glass space helmet and collar ring.' },
  // Pro Season 1: earned with 6 Pro tasks, never sold, kept forever
  { id: 'skin.circuit-2026', name: 'Circuit 2026', price: null, pro: 'Season 1 · 6 Pro tasks', idea: 'Gold body with circuit traces.' },
];

export const BANNER_BY_ID = Object.fromEntries(BANNERS.map((b) => [b.id, b]));
export const SKIN_BY_ID = Object.fromEntries(SKINS.map((s) => [s.id, s]));
export const DEFAULT_BANNER = 'banner.sunset-bands';
export const DEFAULT_SKIN = 'skin.classic';

// Older device records stored 'sunset-bands' and 'default'
const fullBannerId = (id) => (id.startsWith('banner.') ? id : `banner.${id}`);
const fullSkinId = (id) => (id === 'default' ? DEFAULT_SKIN : id.startsWith('skin.') ? id : `skin.${id}`);

/** Banner ids the student owns (the free one always). */
export function ownedBanners(state) {
  const list = (state.owned?.banners || []).map(fullBannerId);
  return Array.from(new Set([DEFAULT_BANNER, ...list]));
}

export function equippedBanner(state) {
  const full = fullBannerId(state.equipped?.banner || DEFAULT_BANNER);
  return ownedBanners(state).includes(full) ? full : DEFAULT_BANNER;
}

/** Skin ids the student owns (Classic always). */
export function ownedSkins(state) {
  const list = (state.owned?.skins || []).map(fullSkinId);
  return Array.from(new Set([DEFAULT_SKIN, ...list]));
}

export function equippedSkin(state) {
  const full = fullSkinId(state?.equipped?.skin || DEFAULT_SKIN);
  return state && ownedSkins(state).includes(full) ? full : DEFAULT_SKIN;
}

function shelf(itemId) {
  if (BANNER_BY_ID[itemId]) return { item: BANNER_BY_ID[itemId], key: 'banners', owned: ownedBanners };
  if (SKIN_BY_ID[itemId]) return { item: SKIN_BY_ID[itemId], key: 'skins', owned: ownedSkins };
  return null;
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

  if (/^year\.\d{4}$/.test(itemId)) {
    if (itemId !== yearBadgeOnSale(now)) return { ok: false, error: 'not_for_sale' };
    if (state.medals?.[itemId]) return { ok: false, error: 'already_owned' };
    if (state.gems < YEAR_BADGE_PRICE) return { ok: false, error: 'not_enough_gems' };
    state.gems -= YEAR_BADGE_PRICE;
    state.medals = { ...state.medals, [itemId]: new Date(now).toISOString().slice(0, 10) };
    return { ok: true, ledger: { amount: -YEAR_BADGE_PRICE, reason: `shop:${itemId}` } };
  }

  const s = shelf(itemId);
  if (!s) return { ok: false, error: 'unknown_item' };
  if (s.item.price === null) return { ok: false, error: 'not_for_sale' };
  if (s.owned(state).includes(itemId)) return { ok: false, error: 'already_owned' };
  if (state.gems < s.item.price) return { ok: false, error: 'not_enough_gems' };
  state.gems -= s.item.price;
  state.owned = { ...state.owned, [s.key]: [...s.owned(state), itemId] };
  return { ok: true, ledger: { amount: -s.item.price, reason: `shop:${itemId}` } };
}

/** Wears an owned banner or skin. */
export function equipItem(state, itemId) {
  const s = shelf(itemId);
  if (!s) return { ok: false, error: 'unknown_item' };
  if (!s.owned(state).includes(itemId)) return { ok: false, error: 'not_owned' };
  state.equipped = { ...state.equipped, [s.key === 'banners' ? 'banner' : 'skin']: itemId };
  return { ok: true };
}
