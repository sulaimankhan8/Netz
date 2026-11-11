import { launch, sleep } from './lib.mjs';

// Unit 6–15 tasks and medals: solving a live page earns its medal, and the Profile lists the units that
// have live pages (split two-colour hexagons). Run with the dev server on 3211:
//   NETZ_URL=http://localhost:3211 node tests/browser/medals-check.mjs
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const { METHODS } = await import('../../src/app/data/methods.js');
const liveNew = METHODS.filter((m) => m.unit >= 6 && m.status === 'live');
const LIVE = liveNew.length;
const LIVE_UNITS = new Set(liveNew.map((m) => m.unit));
const { browser, page, errors } = await launch({ width: 1280, height: 900 });
let bad = 0;
const check = (ok, what) => {
  console.log(ok ? 'ok  ' : 'FAIL', what);
  if (!ok) bad++;
};

const hydrate = () => page.waitForFunction(() => document.body.dataset.pageHydrated, { timeout: 120000 }).catch(() => {});

// 1. Solve a live Unit 7 page
await page.goto(`${BASE}/quadratic-equation`, { waitUntil: 'load', timeout: 180000 });
await hydrate();
// This older page has no data-solve hook: click its "Solve Equation" button
const solve = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => /Solve Equation/.test(b.textContent)));
await solve.click();
await sleep(2500);
// A fresh browser also earns "First Spark" and the 1-day streak medal here; the streak outranks the
// rest for the toast, so any medal toast counts
const toast = await page.evaluate(() => document.body.innerText.match(/New medal: [^\n]+|\d+-day streak[^\n]*/)?.[0] || '');
check(!!toast, `a medal toast appears (${toast})`);

// 2. The Profile lists it
await page.goto(`${BASE}/Profile`, { waitUntil: 'load', timeout: 180000 });
await hydrate();
await sleep(1500);
await page.keyboard.press('Escape');
const info = await page.evaluate(() => {
  const all = [...document.querySelectorAll('h2')].map((h) => h.textContent).find((t) => /^All \d+ tasks$/.test(t));
  const groups = [...document.querySelectorAll('details summary')].map((s) => s.querySelector('span')?.textContent.trim());
  const u7 = [...document.querySelectorAll('details')].find((d) => d.querySelector('summary')?.textContent.includes('Unit 7'));
  if (u7) u7.open = true;
  const done = u7 ? [...u7.querySelectorAll('li')].filter((li) => li.textContent.includes('Done')).map((li) => li.textContent) : [];
  const split = u7 ? u7.querySelectorAll('li svg polygon').length : 0;
  return { all, groups, done, split };
});
check(info.all === `All ${50 + LIVE} tasks`, `task count: ${info.all} (50 + ${LIVE} live Unit 6–15 pages)`);
for (let u = 6; u <= 15; u++) {
  const live = LIVE_UNITS.has(u);
  check(info.groups.includes(`Unit ${u}`) === live, `Unit ${u} ${live ? 'listed' : 'hidden (no live page yet)'}`);
}
check(info.done.some((t) => t.includes('Root Cracker')), 'Root Cracker shows as done');
check(errors.length === 0, `no page errors ${errors.slice(0, 3).join(' | ')}`);

await page.screenshot({ path: process.env.SHOT || 'tests/browser/shots/medals-profile.png', fullPage: true });
await browser.close();
process.exit(bad ? 1 : 0);
