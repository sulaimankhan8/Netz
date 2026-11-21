// Pictures of the calculator card for the owner: Normal mode, the Demo part-way through, and Guide mode.
// Usage: NETZ_URL=http://localhost:3211 node help-sample.mjs [slug]
import { launch, BASE, sleep } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const OUT = path.resolve('shots/help-sample');
fs.mkdirSync(OUT, { recursive: true });
const slug = process.argv[2] || 'sor-method';
const { browser, page } = await launch({ width: 1366, height: 900 });

const snap = async (name) => {
  const box = await page.evaluate(() => {
    const r = document.querySelector('[data-calc-card]').getBoundingClientRect();
    return { x: 0, y: r.top + window.scrollY - 10, width: window.innerWidth, height: Math.min(r.height + 20, 2400) };
  });
  await page.screenshot({ path: path.join(OUT, `${slug}-${name}.png`), clip: box, captureBeyondViewport: true });
};

await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle2', timeout: 180000 });
await page.evaluate(() => { try { localStorage.removeItem('netz_calc_guide'); } catch {} });
await page.reload({ waitUntil: 'networkidle2' });
await sleep(1200);
await snap('1-normal');

await page.evaluate(() => document.querySelector('[data-calc-card] [data-demo]').click());
await sleep(2600);
await snap('2-demo-typing');

for (let i = 0; i < 60; i += 1) {
  await sleep(500);
  if (await page.evaluate(() => document.querySelector('[data-calc-card] [data-demo]')?.textContent.trim() === 'Demo')) break;
}
await page.evaluate(() => [...document.querySelectorAll('[data-calc-card] button')].find((b) => b.textContent.trim() === 'Guide')?.click());
await sleep(300);
await snap('3-guide');
await browser.close();
console.log('saved to', OUT);
