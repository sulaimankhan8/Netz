import { launch, openPlayground, sleep } from './lib.mjs';
import { createShape } from '../../src/app/(Primary.pages)/Playground/utils/shapes/shapeModel.js';
import { allGalleryItems } from '../../src/app/(Primary.pages)/Playground/utils/shapes/shapeGallery.js';

// A page with many shapes (default 1,000, every gallery shape, some rotated, styled and with
// text): how long it takes to show, to pan and to zoom, against the same page without shapes.
//   node shapes-perf.mjs [count]
const count = Number(process.argv[2] || 1000);

function makeShapes(n) {
  let seed = 4242;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const items = allGalleryItems();
  const shapes = [];
  for (let i = 0; i < n; i++) {
    const item = items[i % items.length];
    const w = 60 + rand() * 160;
    const h = item.size && item.size.h === 0 ? 0 : 50 + rand() * 120;
    let s = createShape(item, { x: rand() * 6000, y: rand() * 4500, w, h });
    s = { ...s, id: `perf_${i}`, rot: i % 5 === 0 ? Math.round(rand() * 360) : 0 };
    const closed = item.size && item.size.h > 0 && !item.textBox;
    if (i % 7 === 0) s.shadow = { preset: 'outerBottomRight' };
    if (i % 9 === 0 && closed) s.fill = { type: 'gradient', stops: ['#FFFFFF', '#4472C4'], angle: 90, color: '#4472C4', alpha: 1 };
    if (i % 4 === 0 && closed) s.text = { value: `Shape ${i}`, size: 14, color: '#FFFFFF', align: 'center', valign: 'middle' };
    shapes.push(s);
  }
  return shapes;
}

async function seed(page, shapes) {
  await page.evaluate((shapes) => new Promise((resolve) => {
    const sessionObj = { sessionId: 'default_session', pages: [{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [], shapes }], currentPageIndex: 0, blocks: [], links: [], updatedAt: Date.now() + 1e7 };
    localStorage.removeItem('NETZ_PLAYGROUND_SESSION_BACKUP');
    Storage.prototype.setItem = function () {};
    const req = indexedDB.open('NETZ_PLAYGROUND_DB', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('sessions', { keyPath: 'sessionId' });
    req.onsuccess = () => {
      const tx = req.result.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put(sessionObj);
      tx.oncomplete = () => { indexedDB.open = () => ({}); resolve(); };
    };
  }), shapes);
}

async function measure(label, shapes) {
  const { browser, page, errors } = await launch({ width: 1366, height: 768 });
  await openPlayground(page);
  await seed(page, shapes);
  const t0 = Date.now();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none');
  await page.waitForFunction((n) => n === 0 || document.querySelectorAll('svg[data-shape-layer] g[data-shape-id]').length > 0, { timeout: 60000 }, shapes.length);
  const shown = Date.now() - t0;
  await sleep(1500);
  const drawn = await page.evaluate(() => document.querySelectorAll('svg[data-shape-layer] g[data-shape-id]').length);

  // 20 pan steps, then 10 zoom steps: wall time with a frame after each step
  const timing = await page.evaluate(async () => {
    const box = document.querySelector('.touch-canvas-surface');
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const run = async (make) => {
      const start = performance.now();
      let worst = 0;
      for (let i = 0; i < 20; i++) {
        const s = performance.now();
        box.dispatchEvent(make(i));
        await frame();
        worst = Math.max(worst, performance.now() - s);
      }
      return { total: Math.round(performance.now() - start), worst: Math.round(worst) };
    };
    const pan = await run((i) => new WheelEvent('wheel', { deltaX: 60, deltaY: i % 2 ? 40 : -20, clientX: 683, clientY: 384, bubbles: true, cancelable: true }));
    const zoom = await run((i) => new WheelEvent('wheel', { deltaY: i < 10 ? 100 : -100, ctrlKey: true, clientX: 683, clientY: 384, bubbles: true, cancelable: true }));
    return { pan, zoom };
  });
  console.log(`${label.padEnd(14)} shown after ${shown} ms, ${drawn} on screen | 20 pans: ${timing.pan.total} ms (slowest ${timing.pan.worst} ms) | 20 zooms: ${timing.zoom.total} ms (slowest ${timing.zoom.worst} ms)${errors.length ? ` | errors: ${errors[0]}` : ''}`);
  await browser.close();
  return timing;
}

await measure('no shapes', []);
await measure(`${count} shapes`, makeShapes(count));
