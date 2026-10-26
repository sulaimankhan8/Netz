import { launch, sleep } from './lib.mjs';
import path from 'path';
import fs from 'fs';

// Screenshots of the laptop side bar, closed and open, for design reference.
const BASE = process.env.NETZ_URL || 'http://localhost:3211';
const OUT = path.resolve('shots/nav-phone');
fs.mkdirSync(OUT, { recursive: true });
const { browser, page } = await launch({ width: 1280, height: 800 });
await page.goto(BASE + '/bisection-method', { waitUntil: 'networkidle2', timeout: 180000 });
await sleep(1500);
await page.screenshot({ path: path.join(OUT, 'desktop-rail.png'), clip: { x: 0, y: 0, width: 420, height: 800 } });
await page.click('aside[data-app-sidebar] [aria-label="Expand sidebar"]');
await sleep(900);
await page.screenshot({ path: path.join(OUT, 'desktop-open.png'), clip: { x: 0, y: 0, width: 420, height: 800 } });
// Light theme too
await page.evaluate(() => { document.documentElement.classList.remove('dark'); });
await sleep(400);
await page.screenshot({ path: path.join(OUT, 'desktop-open-light.png'), clip: { x: 0, y: 0, width: 420, height: 800 } });
await browser.close();
