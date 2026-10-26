import { launch, sleep } from './lib.mjs';
import fs from 'fs';
import path from 'path';

// Phone screenshots of the app's navigation (before/after the redesign).
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const TAG = process.env.TAG || 'before';
const OUT = path.resolve('shots/nav-phone');
fs.mkdirSync(OUT, { recursive: true });
const { browser, page } = await launch({ width: 390, height: 844 });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
for (const route of ['/', '/bisection-method', '/Algorithems', '/Notes', '/Playground', '/Profile']) {
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 180000 });
  await sleep(1500);
  const name = route.replace(/\W+/g, '_') || 'root';
  await page.screenshot({ path: path.join(OUT, `${TAG}-${name}.png`) });
  const menu = await page.$('button[aria-label="Open menu"]');
  if (menu) {
    await menu.click();
    await sleep(600);
    await page.screenshot({ path: path.join(OUT, `${TAG}-${name}-menu.png`) });
  }
}
await browser.close();
