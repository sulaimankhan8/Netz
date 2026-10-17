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
    // Third-party noise (Google's ads, analytics and frame policy) is not the Playground's
    if (m.type() === 'error' && !/favicon|Failed to load resource|adsbygoogle|googletagmanager|net::ERR|Framing 'https:\/\/www\.google\.com/i.test(text)) errors.push('console.error: ' + text.slice(0, 300));
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

// Controls that moved into a menu (PLAYGROUND_UX_FIX_PLAN.md, then PLAYGROUND_VISUAL_REDESIGN_PLAN.md):
// the old name, then the steps that reach it now. '@blocks' opens Blocks (laptop, tablet) or the
// phone's + "Add to page" sheet; '@page' opens the page menu (the ⋯ "Page" button in the top bars,
// on every screen size); '@toolOptions' opens the active tool's options (the pen chip, or ● on phones).
const MOVED = {
  'More Tools': ['=Add to page'],
  More: ['=Add to page'],
  'Stroke & Canvas Settings': ['@toolOptions'],
  'Delete page': ['@page', '=Delete page'],
  'Clear page': ['@page', '=Clear page'],
  'Duplicate page': ['@page', '=Duplicate page'],
  'Add Theory': ['@blocks', '=Add Text Block'],
  'Add Theory Block': ['@blocks', '=Add Text Block'],
  'Add Graph Block': ['@blocks', '=Add Graph Block'],
  'Record Voice Note': ['@blocks', '=Record a voice memo'],
  'Stop Voice Recording': ['@blocks', '=Stop recording'],
  'Sync Whiteboard to Notes Workspace': ['@sendToNotes'],
  'Switch to Notes Mode': ['@page', '=Writing mode'],
  'Switch to Whiteboard Mode': ['@page', '=Writing mode'],
  'Export Canvas': ['@page'],
  Preferences: ['@page', '=Preferences'],
  'Add Fresh Blank Page': ['=Add page'],
  'Clear Current Page': ['@page', '=Clear page'],
};

// Clicks the first visible button whose title starts with `name`, or (when exact) whose
// accessible name is `name`, or (otherwise) whose accessible name starts with it
async function clickNamed(page, name, exact = false) {
  return page.evaluate((t, ex) => {
    const visible = (b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !b.disabled;
    };
    const buttons = [...document.querySelectorAll('button')].filter(visible);
    const el = ex
      ? buttons.find((b) => b.getAttribute('aria-label') === t)
      : buttons.find((b) => b.title && b.title.startsWith(t)) || buttons.find((b) => (b.getAttribute('aria-label') || '').startsWith(t));
    if (!el) return false;
    el.click();
    return true;
  }, name, exact);
}

/** Clicks the dock button whose title (or accessible name) starts with the given text. */
export async function clickTitle(page, titleStart) {
  let ok = await clickNamed(page, titleStart);
  if (!ok && MOVED[titleStart]) {
    ok = true;
    for (const step of MOVED[titleStart]) {
      let done;
      // (while recording, the Blocks button is "Blocks, recording": match the start of its name)
      if (step === '@blocks') done = (await clickNamed(page, 'Blocks')) || (await clickNamed(page, 'Add to page', true));
      else if (step === '@page') done = await clickNamed(page, 'Page', true);
      // Send to Notes is a button in the top-right bar (laptop, tablet), or in the page menu (phone)
      else if (step === '@sendToNotes') {
        done = await clickNamed(page, 'Send to Notes', true);
        if (!done && (await clickNamed(page, 'Page', true))) {
          await sleep(250);
          done = await clickNamed(page, 'Send to Notes', true);
        }
      }
      else if (step === '@toolOptions') done = await page.evaluate(() => {
        const b = document.querySelector('button[data-tool-options]');
        if (b) b.click();
        return Boolean(b);
      });
      else done = await clickNamed(page, step.replace(/^=/, ''), step.startsWith('='));
      if (!done) {
        ok = false;
        break;
      }
      await sleep(250);
    }
  }
  if (!ok) throw new Error('button not found: ' + titleStart);
  await sleep(150);
}

/** The zoom level shown ("100%"): on the Zoom button of the top-right bar, or (phones, where the
 *  zoom row is inside the page menu) the level the Playground root records. */
export async function zoomLabel(page) {
  return page.evaluate(() => {
    const zoom = [...document.querySelectorAll('button[aria-label="Zoom"]')].find((b) => /%/.test(b.innerText));
    if (zoom) return zoom.innerText.trim();
    return document.querySelector('[data-playground]')?.getAttribute('data-zoom-level') || undefined;
  });
}

/** Opens the active tool's options (pen, highlighter, eraser), runs fn, then closes them. */
export async function withToolOptions(page, fn) {
  await clickTitle(page, 'Stroke & Canvas Settings'); // the pen chip, through MOVED
  await sleep(150);
  await fn();
  await page.keyboard.press('Escape');
  await sleep(150);
}

/** Sets the pen width slider in the open pen options. */
export async function setPenWidth(page, px) {
  await page.evaluate((value) => {
    const input = document.querySelector('input[aria-label="Pen width"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, px);
}

/**
 * Insert > Equation > Insert New Equation, however this screen offers it: the Equation button on
 * a laptop; the Equation menu on a touch screen (in the dock, the tablet's Insert menu, or the
 * phone's + "Add to page" sheet).
 */
export async function addEquationBlock(page) {
  const clickFirst = (selectors) => page.evaluate((list) => {
    for (const sel of list) {
      const el = [...document.querySelectorAll(sel.css)].find((b) => !sel.text || b.innerText.trim().endsWith(sel.text));
      if (el) {
        el.click();
        return true;
      }
    }
    return false;
  }, selectors);
  if (await clickFirst([{ css: 'button[title^="Equation: Insert New Equation"]' }])) {
    await sleep(600);
    return;
  }
  if (!(await clickFirst([{ css: 'button[aria-label="Equation"]' }]))) {
    if (await clickFirst([{ css: 'button[aria-label="Add to page"]' }])) {
      await sleep(300);
      await clickFirst([{ css: 'button[aria-label="Insert Equation"]' }]);
    } else {
      await clickFirst([{ css: 'button[title^="Insert ("]' }]);
      await sleep(250);
      await clickFirst([{ css: '[role="menuitem"]', text: 'Equation' }]);
    }
  }
  await sleep(300);
  if (!(await clickFirst([{ css: '[data-equation-menu] button', text: 'Insert New Equation' }]))) throw new Error('Insert New Equation not found');
  await sleep(600);
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
