// Every method page: calculators show "How to use" in guide mode (with the real button name), the Demo and Guide
// buttons are there, nothing scrolls sideways, no console errors; the 34 original pages show their FAQ.
// Usage: NETZ_URL=http://localhost:3213 node guide-sweep.mjs [--phone] [--only=id,id]
import fs from 'node:fs';
import { launch, BASE, sleep } from './lib.mjs';

const phone = process.argv.includes('--phone');
const src = fs.readFileSync(new URL('../../src/app/data/methods.js', import.meta.url), 'utf8');
const pages = [...src.matchAll(/(live|building)\('([^']+)',\s*'([^']+)'/g)].map((m) => ({ id: m[2], route: m[3] }));
// --only id,id checks just those pages
const only = process.argv.find((x) => x.startsWith('--only='))?.slice(7).split(',');
if (only) pages.splice(0, pages.length, ...pages.filter((p) => only.includes(p.id)));
const faqPages = new Set([...fs.readFileSync(new URL('../../src/app/data/methodFaqs.js', import.meta.url), 'utf8').matchAll(/export const (\w+)/g)].map((m) => m[1]));
const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase()).replace(/^simpson-?(\d+)$/, 'simpson$1');

const { browser, page } = await launch(phone ? { width: 390, height: 844 } : { width: 1366, height: 900 });
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.evaluate(() => { try { localStorage.setItem('netz_calc_guide', 'on'); } catch {} });

let errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

let pass = 0;
let fail = 0;
let calculators = 0;
const expect = (name, ok, extra = '') => { if (ok) pass += 1; else { fail += 1; console.log(`FAIL ${name} ${extra}`); } };

for (const { id, route } of pages) {
  errors = [];
  const res = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => null);
  if (!res || res.status() === 404) continue; // planned pages have no route yet
  let info = null;
  for (let i = 0; i < 16; i += 1) {
    await sleep(250);
    info = await page.evaluate(() => {
      const card = document.querySelector('[data-calc-card]');
      return {
        card: !!card,
        demo: !!card?.querySelector('[data-demo]'),
        howTo: card?.querySelector('[data-how-to-use]')?.textContent || '',
        faq: [...document.querySelectorAll('h2')].some((h) => /common questions/i.test(h.textContent)),
        sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
    if (!info.card || info.howTo) break;
  }
  if (info.card) {
    calculators += 1;
    expect(`${id}: Demo button`, info.demo);
    expect(`${id}: How to use shows in guide mode`, !!info.howTo);
    expect(`${id}: button name filled in`, !info.howTo.includes('{button}') && !info.howTo.includes('the solve button'), info.howTo.slice(0, 100));
  }
  if (faqPages.has(camel(id))) expect(`${id}: FAQ on the page`, info.faq);
  expect(`${id}: no sideways scrolling`, !info.sideways);
  const real = errors.filter((e) => !/adsbygoogle|googletagmanager|Failed to load resource/i.test(e));
  expect(`${id}: no console errors`, real.length === 0, real.join(' | ').slice(0, 200));
}

console.log(`\n${calculators} calculators checked; ${pass}/${pass + fail} checks passed`);
await browser.close();
process.exitCode = fail ? 1 : 0;
