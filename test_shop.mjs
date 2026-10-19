/** The gem shop (src/app/utils/progress/shop.js): prices, balances, ownership, freezes, wearing. */

const { buyItem, equipItem, ownedBanners, equippedBanner, BANNERS, FREEZE_PRICE } = await import('./src/app/utils/progress/shop.js');
const { newProgressState } = await import('./src/app/utils/progress/engine.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const s = newProgressState();
s.gems = 700;

expect('8 banners, one free, one Pro', BANNERS.length === 8 && BANNERS.filter((b) => b.price === 0).length === 1 && BANNERS.filter((b) => b.price === null).length === 1);
expect('free banner owned and worn from the start (old record id too)', ownedBanners(s).includes('banner.sunset-bands') && equippedBanner(s) === 'banner.sunset-bands');

let r = buyItem(s, 'banner.hex-net');
expect('buy Hex Net', r.ok && s.gems === 450 && r.ledger.amount === -250 && r.ledger.reason === 'shop:banner.hex-net');
r = buyItem(s, 'banner.hex-net');
expect('cannot buy twice', !r.ok && r.error === 'already_owned' && s.gems === 450);
r = buyItem(s, 'banner.orbit');
expect('not enough gems', !r.ok && r.error === 'not_enough_gems' && s.gems === 450);
r = buyItem(s, 'banner.circuit-night');
expect('Pro banner not for sale', !r.ok && r.error === 'not_for_sale');
r = buyItem(s, 'banner.made-up');
expect('unknown item', !r.ok && r.error === 'unknown_item');

r = equipItem(s, 'banner.orbit');
expect('cannot wear what you do not own', !r.ok && equippedBanner(s) === 'banner.sunset-bands');
r = equipItem(s, 'banner.hex-net');
expect('wear an owned banner', r.ok && equippedBanner(s) === 'banner.hex-net');

r = buyItem(s, 'freeze', 1);
expect('buy a freeze', r.ok && s.streak.freezes === 1 && s.gems === 450 - FREEZE_PRICE && r.ledger.reason === 'shop:freeze:1');
s.gems = 1000;
buyItem(s, 'freeze', 2);
r = buyItem(s, 'freeze', 3);
expect('at most 2 freezes', !r.ok && r.error === 'freezes_full' && s.streak.freezes === 2 && s.gems === 800);

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
