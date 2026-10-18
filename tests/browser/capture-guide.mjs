import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, sleep, BASE } from './lib.mjs';

/*
 * Takes the screenshots for the landing page's step-by-step guide ("Every step, shown") from the
 * real Gauss–Seidel page, light and dark, and measures where each numbered pin goes.
 *
 *   NETZ_URL=http://localhost:3213 node capture-guide.mjs
 *
 * Writes public/landing/guide-<step>-<theme>.webp and src/app/components/landing/guideShots.json
 * (each image's size and its pins as percentages). Run it again whenever the method page changes.
 */
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const OUT_IMG = path.join(ROOT, 'public', 'landing');
const OUT_JSON = path.join(ROOT, 'src', 'app', 'components', 'landing', 'guideShots.json');
fs.mkdirSync(OUT_IMG, { recursive: true });

const WIDTH = 960; // narrow enough that the page content is large in the landing frame
const SCALE = 2;
const MAX_RATIO = 0.66; // crops are at most this tall for their width, so every frame has a similar shape

// Each step: the area to crop, and the parts to pin (CSS selector or { text } inside the area)
const STEPS = [
  {
    id: 'idea',
    area: () => {
      const h1 = document.querySelector('h1');
      const p = document.querySelector('.step-intro-1');
      const badge = h1.parentElement.querySelector('div');
      return [badge || h1, h1, p];
    },
    pins: [
      { id: 'title', find: () => document.querySelector('h1') },
      { id: 'idea', find: () => document.querySelector('.step-intro-1') },
    ],
  },
  {
    id: 'formula',
    area: () => [document.querySelector('.step-intro-2')],
    pins: [
      { id: 'system', find: () => document.querySelector('.step-intro-2 .katex-display') || document.querySelector('.step-intro-2 .katex') },
      { id: 'condition', find: () => [...document.querySelectorAll('.step-intro-2 *')].find((e) => e.children.length === 0 && /diagonal dominance/i.test(e.textContent) && e.textContent.length < 40) },
      { id: 'rules', find: () => [...document.querySelectorAll('.step-intro-2 *')].find((e) => /^1\.\s*Diagonal/i.test(e.textContent.trim()) && e.children.length <= 3) },
    ],
  },
  {
    id: 'procedure',
    area: () => [document.querySelector('.step-intro-3')],
    pins: [
      { id: 'heading', find: () => document.querySelector('.step-intro-3 h2') },
      { id: 'example', find: () => document.querySelector('.step-intro-4') },
    ],
  },
  {
    id: 'calculator',
    area: () => {
      const h3 = [...document.querySelectorAll('h3')].find((e) => /Interactive Engine/i.test(e.textContent));
      return [h3.closest('.rounded-2xl')];
    },
    pins: [
      { id: 'demo', find: () => [...document.querySelectorAll('button')].find((b) => /Quick Demo/i.test(b.textContent)) },
      { id: 'inputs', find: () => document.querySelector('form input') },
      { id: 'solve', find: () => [...document.querySelectorAll('button')].find((b) => /Solve Vector System/i.test(b.textContent)) },
      { id: 'answer', find: () => [...document.querySelectorAll('span')].find((s) => /Convergence Reached/i.test(s.textContent))?.parentElement },
    ],
  },
  {
    id: 'table',
    before: () => [...document.querySelectorAll('button')].find((b) => /Vector Log/i.test(b.textContent))?.click(),
    area: () => [document.querySelector('#gauss-seidel-results-container')],
    pins: [
      { id: 'tabs', find: () => [...document.querySelectorAll('button')].find((b) => /Vector Log/i.test(b.textContent)) },
      { id: 'rows', find: () => document.querySelector('#gauss-seidel-results-container table thead') },
      { id: 'last', find: () => [...document.querySelectorAll('#gauss-seidel-results-container table tbody tr')].pop() },
    ],
  },
  {
    id: 'graph',
    before: () => [...document.querySelectorAll('button')].find((b) => /Convergence Curve/i.test(b.textContent))?.click(),
    area: () => [document.querySelector('#gauss-seidel-results-container')],
    pins: [
      {
        id: 'plot',
        find: () =>
          document.querySelector('#gauss-seidel-results-container canvas') ||
          [...document.querySelectorAll('#gauss-seidel-results-container svg')].find((s) => s.getBoundingClientRect().width > 200),
      },
      { id: 'export', find: () => [...document.querySelectorAll('#gauss-seidel-results-container button')].find((b) => /Export Graph/i.test(b.textContent)) },
    ],
  },
];

const manifest = {};
const { browser, page, errors } = await launch({ width: WIDTH, height: 900, deviceScaleFactor: SCALE });
try {
  for (const theme of ['light', 'dark']) {
    await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme);
    await page.goto(BASE + '/Gauss-seidal', { waitUntil: 'load', timeout: 180000 });
    await page.evaluate((t) => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
    await sleep(1500);

    // Run the page's own Quick Demo so the calculator, table and graph have real results
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Quick Demo/i.test(b.textContent))?.click());
    await page.waitForSelector('#gauss-seidel-results-container', { timeout: 60000 });
    await sleep(2500);

    for (const step of STEPS) {
      if (step.before) {
        await page.evaluate(`(${step.before.toString()})()`);
        await sleep(900);
      }
      const box = await page.evaluate(
        (areaSrc, pinSrcs, maxRatio) => {
          const area = eval(`(${areaSrc})`)().filter(Boolean);
          const rects = area.map((e) => e.getBoundingClientRect());
          const pad = 16;
          let left = Math.min(...rects.map((r) => r.left)) - pad;
          let right = Math.max(...rects.map((r) => r.right)) + pad;
          let top = Math.min(...rects.map((r) => r.top)) - pad;
          let bottom = Math.max(...rects.map((r) => r.bottom)) + pad;
          const width = right - left;
          const pins = pinSrcs.map(({ id, src }) => {
            const el = eval(`(${src})`)();
            if (!el) return { id, missing: true };
            const r = el.getBoundingClientRect();
            return { id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, left: r.left, top: r.top };
          });
          // Tall areas: keep a window that holds all the pins
          const maxHeight = width * maxRatio;
          if (bottom - top > maxHeight) {
            const ys = pins.filter((p) => !p.missing).map((p) => p.y);
            const mid = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : top + maxHeight / 2;
            top = Math.max(top, Math.min(mid - maxHeight / 2, bottom - maxHeight));
            bottom = top + maxHeight;
          }
          return {
            clip: { x: left + window.scrollX, y: top + window.scrollY, width, height: bottom - top },
            pins: pins.map((p) =>
              p.missing
                ? p
                : { id: p.id, x: +(((p.x - left) / width) * 100).toFixed(2), y: +(((p.y - top) / (bottom - top)) * 100).toFixed(2) }
            ),
          };
        },
        step.area.toString(),
        step.pins.map((p) => ({ id: p.id, src: p.find.toString() })),
        MAX_RATIO
      );
      const png = await page.screenshot({ clip: box.clip, type: 'png', captureBeyondViewport: true });
      const file = `guide-${step.id}-${theme}.webp`;
      const out = sharp(png).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78 });
      const info = await out.toFile(path.join(OUT_IMG, file));
      manifest[step.id] = manifest[step.id] || { pins: box.pins };
      manifest[step.id][theme] = { src: `/landing/${file}`, width: info.width, height: info.height, kb: Math.round(info.size / 1024) };
      if (theme === 'light') manifest[step.id].pins = box.pins;
      console.log(`${theme} ${step.id}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB, pins ${box.pins.map((p) => (p.missing ? `${p.id}?` : p.id)).join(' ')}`);
    }
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 2) + '\n');
  console.log('wrote', OUT_JSON);
  if (errors.length) console.log('page errors:', errors.join(' | '));
} finally {
  await browser.close();
}
