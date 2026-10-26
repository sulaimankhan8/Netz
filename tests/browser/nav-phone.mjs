import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// Phone navigation check: top bar, five bottom buttons, Pages and Personalize sheets, and that
// page controls (Playground dock, Notes button) stay clear of the bottom buttons.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const OUT = path.resolve('shots/nav-phone');
fs.mkdirSync(OUT, { recursive: true });
const W = Number(process.env.W || 390), H = Number(process.env.H || 844);
const { browser, page, errors } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, hasTouch: true, isMobile: true });

let pass = 0, fail = 0;
const check = (name, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? '  ' + info : ''}`); };
const shot = (n) => page.screenshot({ path: path.join(OUT, `after-${W}-${n}.png`) });
const open = async (route) => { await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 }); await sleep(1500); };
const tabs = () => page.evaluate(() => {
  const nav = document.querySelector('nav[data-app-tabs]');
  if (!nav) return null;
  const r = nav.getBoundingClientRect();
  return {
    top: r.top, bottom: r.bottom, h: r.height,
    labels: [...nav.querySelectorAll('a, button')].map((b) => b.innerText.trim()),
    current: nav.querySelector('[aria-current="page"]')?.innerText.trim() || null,
    small: [...nav.querySelectorAll('a, button')].filter((b) => { const q = b.getBoundingClientRect(); return q.width < 44 || q.height < 44; }).length,
    docW: document.documentElement.scrollWidth,
  };
});

// Home
await open('/');
let t = await tabs();
check('bottom row present on Home', !!t && t.labels.join(',') === 'PAGES,HOME,PLAY,NOTES,PERSONALIZE', t && t.labels.join(','));
check('bottom row sits on the screen bottom', t && Math.abs(t.bottom - H) < 2, t && `bottom ${t.bottom}`);
check('Home is marked current', t?.current === 'HOME');
check('all buttons at least 44 px', t?.small === 0);
check('no sideways scroll', t?.docW <= W);
check('top bar shown', await page.$('header[data-app-nav]') !== null);
await shot('home');

// Solver page: title in the top bar, Pages lit
await open('/bisection-method');
t = await tabs();
const title = await page.$eval('header[data-app-nav]', (h) => h.innerText);
check('solver title in top bar', /Bisection Method/.test(title) && /Unit 1/.test(title), title.replace(/\n/g, ' | '));
check('Pages lit on a solver page', t?.current === 'PAGES');
// End of page is reachable above the bottom row
const endClear = await page.evaluate(async () => {
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((r) => setTimeout(r, 300));
  const nav = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  const content = document.querySelector('[data-rail]').children;
  const main = [...content].find((c) => c.style.paddingBottom);
  return main ? getComputedStyle(main).paddingBottom : 'none';
});
check('page leaves room for the bottom row', endClear !== 'none' && parseFloat(endClear) >= 60, endClear);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('solver');

// Pages sheet
await page.$eval('nav[data-app-tabs] button[aria-haspopup]', (b) => b.click());
await sleep(500);
let sheet = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"][aria-label="Pages"]');
  if (!d) return null;
  const r = d.getBoundingClientRect();
  const nav = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  return { above: r.bottom <= nav.top, top: r.top, text: d.innerText, current: d.querySelector('a.bg-neutral-900, a[class*="dark:bg-white"]')?.innerText };
});
check('Pages sheet opens above the bottom row', sheet?.above, sheet && `top ${Math.round(sheet.top)}`);
check('Pages sheet has search, Hub and units', sheet && /Algorithms Hub/.test(sheet.text) && /Unit 5/.test(sheet.text) && !!(await page.$('[role="dialog"] input[type="search"]')));
check('current unit open with Bisection highlighted', sheet && /Bisection Method/.test(sheet.text));
await shot('pages-sheet');
await page.type('[role="dialog"] input[type="search"]', 'newton');
await sleep(300);
const results = await page.$$eval('[role="dialog"] a[href]', (as) => as.map((a) => a.getAttribute('href')));
check('search finds the Newton methods', ['/newton-raphson-method', '/newton-forward', '/newton-backward', '/newton-divided'].every((h) => results.includes(h)), results.join(' '));
await shot('pages-search');
// Go to a result
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), page.click('[role="dialog"] a[href="/newton-forward"]')]);
await sleep(1200);
check('search result opens the page and closes the sheet', page.url().endsWith('/newton-forward') && !(await page.$('[role="dialog"][aria-label="Pages"]')), page.url());

// Personalize sheet
const meBtn = await page.$$('nav[data-app-tabs] button[aria-haspopup]');
await meBtn[1].evaluate((b) => b.click());
await sleep(500);
const me = await page.evaluate(() => document.querySelector('[role="dialog"][aria-label="Personalize"]')?.innerText || '');
check('Personalize sheet lists Profile, Settings, Pricing', /Profile/.test(me) && /Settings/.test(me) && /Pricing/.test(me));
await shot('personalize-sheet');
// Escape closes
await page.keyboard.press('Escape');
await sleep(300);
check('Escape closes the sheet', !(await page.$('[role="dialog"][aria-label="Personalize"]')));
// Tap on backdrop closes
await meBtn[1].evaluate((b) => b.click());
await sleep(300);
await page.mouse.click(3, 12);
await sleep(300);
check('tap outside closes the sheet', !(await page.$('[role="dialog"][aria-label="Personalize"]')));

// Settings page lights Personalize
await open('/Setting');
t = await tabs();
check('Personalize lit on Settings', t?.current === 'PERSONALIZE');

// Playground: no top bar, dock above the bottom row
await page.goto(BASE + '/Playground', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
await sleep(1800);
t = await tabs();
const pg = await page.evaluate(() => {
  const dock = [...document.querySelectorAll('div.fixed')].find((d) => d.querySelector('button[title^="Pen"]'));
  const r = dock?.getBoundingClientRect();
  return { hasTop: !!document.querySelector('header[data-app-nav]'), dockBottom: r?.bottom, docH: document.documentElement.scrollHeight, vh: innerHeight };
});
check('Playground: no app top bar', !pg.hasTop);
check('Playground: Play lit', t?.current === 'PLAY');
check('Playground: dock sits above the bottom row', pg.dockBottom && pg.dockBottom <= t.top - 4, `dock ${Math.round(pg.dockBottom)} row ${Math.round(t?.top)}`);
check('Playground: page does not scroll', pg.docH <= pg.vh + 1, `${pg.docH}/${pg.vh}`);
await shot('playground');

// Notes: fits between the bars
await open('/Notes');
const nt = await page.evaluate(() => {
  const root = document.querySelector('[class*="app-tab-h"]');
  const r = root?.getBoundingClientRect();
  const nav = document.querySelector('nav[data-app-tabs]').getBoundingClientRect();
  return { bottom: r?.bottom, navTop: nav.top, docH: document.documentElement.scrollHeight, vh: innerHeight };
});
check('Notes ends where the bottom row starts', nt.bottom && Math.abs(nt.bottom - nt.navTop) <= 2, `notes ${Math.round(nt.bottom)} row ${Math.round(nt.navTop)}`);
check('Notes page does not scroll', nt.docH <= nt.vh + 1, `${nt.docH}/${nt.vh}`);
await shot('notes');

// Light theme
await open('/');
await page.evaluate(() => { document.documentElement.classList.remove('dark'); });
await sleep(300);
await shot('home-light');

const real = errors.filter((e) => !/hydrat|Hydration/i.test(e));
check('no page errors', real.length === 0, real.slice(0, 3).join(' || '));
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
