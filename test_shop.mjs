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

// Robot skins (artboard 13)
const { SKINS, ownedSkins, equippedSkin } = await import('./src/app/utils/progress/shop.js');
const k = newProgressState();
k.gems = 1000;
expect('9 skins, one free, one Pro', SKINS.length === 9 && SKINS.filter((x) => x.price === 0).length === 1 && SKINS.filter((x) => x.price === null).length === 1);
expect('old record "default" reads as Classic, worn', ownedSkins(k).includes('skin.classic') && equippedSkin(k) === 'skin.classic');
r = buyItem(k, 'skin.wizard');
expect('buy Wizard', r.ok && k.gems === 100 && r.ledger.reason === 'shop:skin.wizard' && ownedSkins(k).includes('skin.wizard'));
expect('buying a skin leaves banners alone', ownedBanners(k).length === 1);
expect('Pro skin not for sale', buyItem(k, 'skin.circuit-2026').error === 'not_for_sale');
expect('cannot wear an unowned skin', !equipItem(k, 'skin.astronaut').ok && equippedSkin(k) === 'skin.classic');
r = equipItem(k, 'skin.wizard');
expect('wear Wizard, banner unchanged', r.ok && equippedSkin(k) === 'skin.wizard' && equippedBanner(k) === 'banner.sunset-bands');

// Year badge: free for everyone, 1,500 gems, only during its own year
const { YEAR_BADGE_PRICE } = await import('./src/app/utils/progress/shop.js');
const y = newProgressState();
y.gems = 1600;
const midYear = Date.UTC(2026, 10, 1);
expect('year badge costs 1,500', YEAR_BADGE_PRICE === 1500);
expect('last year badge not for sale', buyItem(y, 'year.2025', midYear).error === 'not_for_sale' && y.gems === 1600);
expect('next year badge not for sale', buyItem(y, 'year.2027', midYear).error === 'not_for_sale');
r = buyItem(y, 'year.2026', midYear);
expect('buy 2026 badge', r.ok && y.gems === 100 && y.medals['year.2026'] === '2026-11-01' && r.ledger.reason === 'shop:year.2026');
y.gems = 5000;
expect('year badge only once', buyItem(y, 'year.2026', midYear).error === 'already_owned' && y.gems === 5000);
const poor = newProgressState();
poor.gems = 1499;
expect('year badge needs 1,500 gems', buyItem(poor, 'year.2026', midYear).error === 'not_enough_gems' && !poor.medals['year.2026']);

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
