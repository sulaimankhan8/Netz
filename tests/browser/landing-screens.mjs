import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// The landing page on a phone, one screenful at a time (for design review), plus section heights.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const W = Number(process.env.W || 390), H = Number(process.env.H || 844);
const TAG = process.env.TAG || 'now';
const OUT = path.resolve('shots/landing-phone');
fs.mkdirSync(OUT, { recursive: true });
const { browser, page } = await launch({ width: W, height: H });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await page.evaluateOnNewDocument(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent = 'nextjs-portal{display:none!important}';
    document.head.appendChild(s);
  });
});
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(1500);
// Show every reveal-on-scroll block, so screenshots are not blank
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
const sections = await page.evaluate(() => [...document.querySelectorAll('.ld-wrap > *')].map((el) => {
  const r = el.getBoundingClientRect();
  return `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0, 2).join('.')} top ${Math.round(r.top + scrollY)} h ${Math.round(r.height)}`;
}));
console.log(sections.join('\n'));
const total = await page.evaluate(() => document.documentElement.scrollHeight);
console.log('page height', total, '=', (total / H).toFixed(1), 'screens');
let i = 0;
for (let y = 0; y < total; y += H - 120) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await sleep(700);
  await page.screenshot({ path: path.join(OUT, `${TAG}-${String(i++).padStart(2, '0')}.png`) });
}
await browser.close();
