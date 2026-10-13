// Shared helpers for driving the NETZ Playground in headless Chrome.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

export const BASE = process.env.NETZ_URL || 'http://localhost:3210';
export const SHOTS = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

export async function launch({ width = 1280, height = 800, deviceScaleFactor = 1, extraArgs = [] } = {}) {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-first-run', '--disable-extensions', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--window-size=${width},${height}`, ...extraArgs],
    defaultViewport: { width, height, deviceScaleFactor },
  });
  const page = await browser.newPage();
  // The app saves a moment after the last change. Any check that reads the saved session waits for that save first.
  const rawEvaluate = page.evaluate.bind(page);
  page.evaluate = async (fn, ...args) => {
    if (typeof fn === 'function' && fn.toString().includes('SESSION_BACKUP')) await settle(page, rawEvaluate);
    return rawEvaluate(fn, ...args);
  };
  const errors = [];
  const logs = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    const text = m.text();
    logs.push(`[${m.type()}] ${text}`);
    if (m.type() === 'error' && !/favicon|Failed to load resource|adsbygoogle|googletagmanager|net::ERR/i.test(text)) errors.push('console.error: ' + text.slice(0, 300));
  });
  return { browser, page, errors, logs };
}

export async function openPlayground(page) {
  await page.goto(BASE + '/Playground', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await new Promise((r) => setTimeout(r, 1500));
}

/** Draws one stroke through the given screen points with the mouse (or pen, via CDP). */
export async function drawStroke(page, points, { steps = 6, pointerType = 'mouse', pause = 8 } = {}) {
  if (pointerType === 'mouse') {
    await page.mouse.move(points[0][0], points[0][1]);
    await page.mouse.down();
    for (let i = 1; i < points.length; i++) {
      await page.mouse.move(points[i][0], points[i][1], { steps });
    }
    await page.mouse.up();
  } else {
    const client = await page.createCDPSession();
    const send = (type, x, y, extra = {}) =>
      client.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType, ...extra });
    await send('mousePressed', points[0][0], points[0][1], { force: 0.5 });
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      for (let s = 1; s <= steps; s++) {
        await send('mouseMoved', x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, { force: 0.5 });
      }
    }
    await send('mouseReleased', points[points.length - 1][0], points[points.length - 1][1]);
    await client.detach();
  }
  await new Promise((r) => setTimeout(r, pause));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function shot(page, name) {
  const file = path.join(SHOTS, name + '.png');
  await page.screenshot({ path: file });
  return file;
}

/** Clicks the dock button whose title starts with the given text. */
export async function clickTitle(page, titleStart) {
  const ok = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('button[title]')].find((b) => b.title.startsWith(t));
    if (!el) return false;
    el.click();
    return true;
  }, titleStart);
  if (!ok) throw new Error('button not found: ' + titleStart);
  await sleep(150);
}

/** Number of non-transparent pixels on the committed-ink canvas (the first canvas with pointer-events-none and z-10). */
export async function inkPixels(page) {
  return page.evaluate(() => {
    const c = document.querySelector('canvas.z-10');
    if (!c) return -1;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
}

/** Stores a page of `count` handwriting-sized strokes (spread over about 5 x 5 screens) as the saved session. Reload to see it. */
export async function seedStrokes(page, count, { hugeBoxes = false } = {}) {
  await page.evaluate(({ count, hugeBoxes }) => new Promise((resolve) => {
    let seed = 12345;
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const strokes = [];
    for (let i = 0; i < count; i++) {
      const cx = rand() * 6000;
      const cy = rand() * 4500;
      const points = [];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let j = 0; j < 30; j++) {
        const x = cx + Math.cos(j / 4) * 18 + j * 1.5;
        const y = cy + Math.sin(j / 3) * 14;
        points.push({ x, y, pressure: 0.5, timestamp: i * 400 + j * 8, pointerType: 'mouse' });
        if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
      strokes.push({ id: 'seed_' + i, color: '#3B82F6', width: 3, tool: 'pen', points, bbox: hugeBoxes ? { minX: -1e7, minY: -1e7, maxX: 1e7, maxY: 1e7 } : { minX, minY, maxX, maxY } });
    }
    const sessionObj = { sessionId: 'default_session', pages: [{ id: 'page_1', title: 'Page 1', strokes, blocks: [], links: [] }], currentPageIndex: 0, blocks: [], links: [], updatedAt: Date.now() + 1e7 };
    localStorage.removeItem('NETZ_PLAYGROUND_SESSION_BACKUP');
    Storage.prototype.setItem = function () {}; // this page must not save over the seed on its way out
    const req = indexedDB.open('NETZ_PLAYGROUND_DB', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('sessions', { keyPath: 'sessionId' });
    req.onsuccess = () => {
      const tx = req.result.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put(sessionObj);
      tx.oncomplete = () => { indexedDB.open = () => ({}); resolve(); };
    };
  }), { count, hugeBoxes });
}

/** Waits until the app has written any save that is still pending. */
export async function settle(page, evaluate = page.evaluate.bind(page)) {
  await new Promise((r) => setTimeout(r, 80));
  for (let i = 0; i < 100; i++) {
    const pending = await evaluate(() => Boolean(window.__NETZ_PLAYGROUND_SAVE_PENDING__)).catch(() => false);
    if (!pending) return;
    await new Promise((r) => setTimeout(r, 50));
  }
}
