/** Where ads may show, the 15-minute clock, and rewarded-ad gems (NETZ_LAUNCH_PLAN.md section 6). */

const { adsAllowedAt, AD_REWARD, TIMED_AD } = await import('./src/app/utils/ads/adsPolicy.js');
const { freshClock, tickClock, timedAdDue } = await import('./src/app/utils/ads/activeClock.js');
const { adRewardsLeft, grantAdReward } = await import('./src/app/utils/ads/adReward.js');
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

// Where
expect('ads on home, algorithms, hub, notes, profile', ['/', '/bisection-method', '/Algorithems', '/Notes', '/Profile'].every((p) => adsAllowedAt(p)));
expect('never in the Playground, Pricing or shared notes', ['/Playground', '/Pricing', '/p/newton-raphson-x7k2'].every((p) => !adsAllowedAt(p)));
expect('a page that only starts the same is not blocked', adsAllowedAt('/Privacy') && adsAllowedAt('/Profile') && adsAllowedAt('/pricing-old'));
expect('never for Pro', !adsAllowedAt('/', { pro: true }));
expect('never offline', !adsAllowedAt('/', { online: false }));

// The clock
let c = freshClock(null, '2026-10-20');
expect('starts at zero', c.minutes === 0 && c.shown === 0);
for (let i = 0; i < 59; i++) c = tickClock(c, 15000);
expect('14¾ active minutes: not yet', !timedAdDue(c));
c = tickClock(c, 15000);
expect(`${TIMED_AD.activeMinutes} active minutes: due`, timedAdDue(c));
expect('after 4 today: no more', !timedAdDue({ ...c, shown: TIMED_AD.perDay }));
const nextDay = freshClock({ ...c, shown: TIMED_AD.perDay }, '2026-10-21');
expect('a new day: the daily count starts again, minutes carry on', nextDay.shown === 0 && timedAdDue(nextDay));
expect('a stored clock of today is kept', freshClock({ minutes: 3, day: '2026-10-20', shown: 2 }, '2026-10-20').shown === 2);

// Rewarded gems
const s = newProgressState();
const day = '2026-10-20';
expect('3 a day at the start', adRewardsLeft(s, day) === AD_REWARD.perDay);
const rewards = [1, 2, 3, 4].map(() => grantAdReward(s, day));
expect('three rewards of 10 gems, the fourth refused', rewards.slice(0, 3).every((r) => r.ok) && !rewards[3].ok && rewards[3].error === 'limit_reached' && s.gems === 30);
expect('ledger reasons are unique per ad', new Set(rewards.slice(0, 3).map((r) => r.ledger.reason)).size === 3 && rewards[0].ledger.reason === 'ad.reward:2026-10-20:1');
expect('next day: 3 again', adRewardsLeft(s, '2026-10-21') === 3 && grantAdReward(s, '2026-10-21').ledger.reason === 'ad.reward:2026-10-21:1');

// The AdSense account comes from settings (utils/ads/adsenseConfig.js), never from the code
const { normaliseClient, adsTxt, ADSENSE_ON, adSlotFor } = await import('./src/app/utils/ads/adsenseConfig.js');
expect('pub id is written as ca-pub', normaliseClient('pub-1234567890123456') === 'ca-pub-1234567890123456' && normaliseClient(' ca-pub-1234567890123456 ') === 'ca-pub-1234567890123456');
expect('anything else is no account', normaliseClient('') === '' && normaliseClient('1234567890123456') === '' && normaliseClient('ca-pub-12ab') === '');
expect('ads.txt line from the account', adsTxt('ca-pub-1234567890123456', '') === 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
expect('ads.txt adds extra lines', adsTxt('ca-pub-1234567890123456', 'google.com, pub-1, RESELLER, x | other.com, 2, DIRECT').split('\n').filter(Boolean).length === 3);
expect('no account: ads.txt says so, no AdSense line', !/google\.com/.test(adsTxt('', '')));
expect('with no settings, AdSense is off and no place has a unit', process.env.NEXT_PUBLIC_ADSENSE_CLIENT || (!ADSENSE_ON && adSlotFor('landing') === '' && adSlotFor('notes') === ''));

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
