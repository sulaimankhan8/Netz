import fs from 'fs';
import os from 'os';
import path from 'path';
import { launch, openPlayground, drawStroke, sleep, settle, clickTitle, shot } from './lib.mjs';

// Handoff Phase C (2026-11-10): C3 graph pan and zoom with the view saved, C6 straight highlighter,
// C8 picture crop and replace, C7 every page in one PDF, C4 one stored record per page (and an old
// single-record save still loads), C11 recognition in a worker giving the same reading as in the page.
// Run with the app on port 3210 (or NETZ_URL): node phase-c.mjs
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const savedSession = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}'));
const blockOfType = async (page, type) => ((await savedSession(page)).pages || []).flatMap((p) => p.blocks || []).find((b) => b.type === type);
const clickLabel = (page, label) => page.evaluate((l) => {
  const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === l);
  if (b) b.click();
  return Boolean(b);
}, label);
const dblclickBlock = async (page, type) => {
  const box = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('[data-block-id]')].find((n) => n.querySelector(t === 'graph' ? 'svg[data-graph-plot]' : 'img'));
    const r = el && el.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  }, type);
  if (box) await page.mouse.click(box.x, box.y, { clickCount: 2 });
  await sleep(500);
  return box;
};

/** IndexedDB: the session index and the per-page records. */
const readDb = (page) => page.evaluate(() => new Promise((resolve) => {
  const req = indexedDB.open('NETZ_PLAYGROUND_DB');
  req.onsuccess = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('pages')) return resolve({ version: db.version, noPagesStore: true });
    const tx = db.transaction(['sessions', 'pages'], 'readonly');
    const s = tx.objectStore('sessions').get('default_session');
    const p = tx.objectStore('pages').getAll();
    tx.oncomplete = () => resolve({ version: db.version, index: s.result || null, pages: (p.result || []).map((r) => ({ key: r.key, strokes: (r.page.strokes || []).length, blocks: (r.page.blocks || []).length })) });
  };
  req.onerror = () => resolve({ error: true });
}));

/** A plain picture as a PNG file, w × h. */
async function pngFile(page, w, h, colour, name) {
  const dataUrl = await page.evaluate(({ w, h, colour }) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = colour;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    g.fillRect(w / 4, h / 4, w / 2, h / 2);
    return c.toDataURL('image/png');
  }, { w, h, colour });
  const file = path.join(os.tmpdir(), name);
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return file;
}

// ── Laptop: graph, highlighter, picture, PDF, storage ─────────────────────────
{
  const { browser, page, errors } = await launch({ width: 1366, height: 820 });
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'netz-pdf-'));
  try {
    const cdp = await page.createCDPSession();
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads }).catch(() => cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads }));
    await openPlayground(page);
    await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('NETZ_PLAYGROUND_DB'); });
    await openPlayground(page);

    // C3: a graph block, edited, dragged and zoomed. Graphs sit under the ink: the Select tool reaches them
    await page.keyboard.press('l');
    await clickTitle(page, 'Blocks: Graph');
    await sleep(300);
    await clickLabel(page, 'Add Graph Block');
    await sleep(800);
    await dblclickBlock(page, 'graph');
    const plotBox = await page.evaluate(() => {
      const r = document.querySelector('[data-graph-view]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, view: document.querySelector('[data-graph-view]').getAttribute('data-graph-view') };
    });
    const v0 = plotBox.view.split(',').map(Number);
    await page.mouse.move(plotBox.x, plotBox.y);
    await page.mouse.down();
    await page.mouse.move(plotBox.x - 80, plotBox.y + 40, { steps: 8 });
    await page.mouse.up();
    await sleep(300);
    const v1 = (await page.evaluate(() => document.querySelector('[data-graph-view]').getAttribute('data-graph-view'))).split(',').map(Number);
    check('graph: dragging the plot moves the view (x to the right, y down)', v1[0] > v0[0] && v1[1] > v0[1] && Math.abs((v1[1] - v1[0]) - (v0[1] - v0[0])) < 1e-6, JSON.stringify([v0, v1]));
    await page.mouse.move(plotBox.x, plotBox.y);
    await page.mouse.wheel({ deltaY: -400 });
    await sleep(600);
    const v2 = (await page.evaluate(() => document.querySelector('[data-graph-view]').getAttribute('data-graph-view'))).split(',').map(Number);
    check('graph: the wheel zooms in about the pointer', v2[1] - v2[0] < (v1[1] - v1[0]) * 0.8, JSON.stringify([v1, v2]));
    check('graph: a Reset button appears once the view moved', await page.evaluate(() => Boolean(document.querySelector('[data-graph-reset]'))));
    await settle(page);
    const savedView = (await blockOfType(page, 'graph'))?.content?.view;
    check('graph: the view is saved in the block', savedView && Math.abs(savedView.x0 - v2[0]) < 1e-6 && Math.abs(savedView.x1 - v2[1]) < 1e-6, JSON.stringify(savedView));
    await page.keyboard.press('Escape');
    await sleep(300);

    // C6: a wobbly highlighter stroke snaps straight
    await page.mouse.click(700, 120);
    await page.keyboard.press('h');
    await sleep(200);
    await drawStroke(page, [[200, 620], [260, 624], [320, 617], [380, 623], [440, 619], [500, 622]]);
    await settle(page);
    const hl = ((await savedSession(page)).pages || [])[0]?.strokes?.filter((s) => s.tool === 'highlighter').pop();
    const ys = hl ? hl.points.map((p) => p.y) : [];
    check('highlighter: a roughly straight stroke becomes a level straight band', hl && Math.max(...ys) - Math.min(...ys) < 0.01, JSON.stringify(ys.slice(0, 4)));
    await page.keyboard.press('l');

    // C8: a picture, cropped and then replaced (with the Select tool, as pictures sit under the ink)
    const wide = await pngFile(page, 400, 200, '#2563eb', 'netz-c8-wide.png');
    const tall = await pngFile(page, 150, 300, '#16a34a', 'netz-c8-tall.png');
    const pictureInput = await page.$('input[type="file"][accept="image/*"]');
    await pictureInput.uploadFile(wide);
    await sleep(1500);
    await dblclickBlock(page, 'image');
    await page.evaluate(() => document.querySelector('[data-image-crop-start]')?.click());
    await sleep(300);
    const handle = await page.evaluate(() => {
      const r = document.querySelector('[data-crop-handle="se"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(handle.x, handle.y);
    await page.mouse.down();
    await page.mouse.move(handle.x - 60, handle.y, { steps: 6 });
    await page.mouse.up();
    await page.evaluate(() => document.querySelector('[data-crop-apply]')?.click());
    await sleep(1200);
    await settle(page);
    const cropped = (await blockOfType(page, 'image'))?.content;
    check('picture: Crop keeps the chosen part (the picture gets narrower)', cropped && cropped.aspectRatio < 2 && cropped.aspectRatio > 1, cropped && cropped.aspectRatio);
    const replaceInput = await page.$('[data-block-id] input[type="file"]');
    await replaceInput.uploadFile(tall);
    await sleep(1500);
    await settle(page);
    const replaced = (await blockOfType(page, 'image'))?.content;
    check('picture: Replace swaps in the new picture and its shape', replaced && Math.abs(replaced.aspectRatio - 0.5) < 0.01 && replaced.imageUrl !== cropped.imageUrl, replaced && replaced.aspectRatio);
    await page.keyboard.press('Escape');
    await sleep(300);

    // A second page with ink, then every page in one PDF
    await page.keyboard.press('p');
    await clickLabel(page, 'Add page');
    await sleep(800);
    await drawStroke(page, [[400, 400], [500, 450], [600, 400]]);
    await settle(page);
    await clickLabel(page, 'Page');
    await sleep(400);
    const pdfAll = await clickLabel(page, 'Export as PDF, all pages');
    check('PDF: the page menu offers "PDF, all pages" with two pages', pdfAll);
    let pdf = null;
    for (let i = 0; i < 60 && !pdf; i++) {
      await sleep(500);
      pdf = fs.readdirSync(downloads).find((f) => f.endsWith('.pdf'));
    }
    const pdfText = pdf ? fs.readFileSync(path.join(downloads, pdf), 'latin1') : '';
    const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) || []).length;
    check('PDF: one file with both pages', pageCount === 2, `${pdf} pages=${pageCount}`);
    await shot(page, 'phase-c-laptop');

    // C4: one stored record per page
    await settle(page);
    await sleep(500);
    const db = await readDb(page);
    check('storage: the database is version 2 with a pages store', db.version >= 2 && !db.noPagesStore, JSON.stringify(db).slice(0, 200));
    check('storage: the session record is an index (page order, no pages inside)', db.index && Array.isArray(db.index.pageIds) && db.index.pageIds.length === 2 && !db.index.pages, JSON.stringify(db.index && Object.keys(db.index)));
    check('storage: each page is its own record', db.pages && db.pages.length === 2 && db.pages.some((p) => p.blocks >= 2), JSON.stringify(db.pages));

    // Reload: both pages come back (the localStorage copy is removed so IndexedDB is what loads)
    await page.evaluate(() => localStorage.removeItem('NETZ_PLAYGROUND_SESSION_BACKUP'));
    await openPlayground(page);
    await sleep(1500);
    await settle(page);
    const back = await savedSession(page);
    check('storage: after a reload from IndexedDB both pages are there, with their content', (back.pages || []).length === 2 && (back.pages[0].blocks || []).length >= 2 && (back.pages[1].strokes || []).length >= 1, JSON.stringify((back.pages || []).map((p) => [(p.strokes || []).length, (p.blocks || []).length])));

    // An old single-record save (pages inside) still loads, and becomes per-page on the next save
    await page.evaluate(() => new Promise((resolve) => {
      localStorage.removeItem('NETZ_PLAYGROUND_SESSION_BACKUP');
      const req = indexedDB.open('NETZ_PLAYGROUND_DB');
      req.onsuccess = () => {
        const tx = req.result.transaction(['sessions', 'pages'], 'readwrite');
        tx.objectStore('pages').clear();
        tx.objectStore('sessions').put({
          sessionId: 'default_session',
          updatedAt: Date.now(),
          currentPageIndex: 0,
          blocks: [],
          links: [],
          pages: [{ id: 'page_old', title: 'Old page', strokes: [{ id: 'old_1', color: '#18181B', width: 3, tool: 'pen', points: [{ x: 100, y: 100, pressure: 0.5, timestamp: 1 }, { x: 200, y: 160, pressure: 0.5, timestamp: 2 }], bbox: { minX: 100, minY: 100, maxX: 200, maxY: 160 } }], blocks: [], links: [], shapes: [] }],
        });
        tx.oncomplete = () => resolve();
      };
    }));
    await openPlayground(page);
    await sleep(1000);
    await drawStroke(page, [[500, 500], [560, 520]]);
    await settle(page);
    await sleep(500);
    const migrated = await readDb(page);
    check('storage: an old save loads and is stored per page after the next change', migrated.index && Array.isArray(migrated.index.pageIds) && !migrated.index.pages && migrated.pages.some((p) => p.key.endsWith(':page_old') && p.strokes === 2), JSON.stringify(migrated).slice(0, 300));
  } catch (e) {
    check('laptop run finished', false, String((e && e.stack) || e).slice(0, 500));
  }
  check('laptop: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── Phone, finger: pinch the graph ────────────────────────────────────────────
{
  const { browser, page, errors } = await launch({ width: 390, height: 844, deviceScaleFactor: 2 });
  try {
    await page.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: await browser.userAgent() });
    await openPlayground(page);
    // The graph made on the laptop is on page 1 of this session's storage only in that browser: add one here
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Add Graph Block/.test(b.getAttribute('aria-label') || ''))?.click());
    if (!(await page.evaluate(() => Boolean(document.querySelector('svg[data-graph-plot]'))))) {
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^(Add|More)/.test(b.getAttribute('aria-label') || ''))?.click());
      await sleep(400);
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Graph/.test(b.getAttribute('aria-label') || ''))?.click());
    }
    await sleep(800);
    const el = await page.evaluate(() => {
      const r = [...document.querySelectorAll('[data-block-id]')].find((n) => n.querySelector('svg[data-graph-plot]'))?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + 24 } : null;
    });
    if (el) {
      // The Select tool reaches blocks under the ink; then double tap to edit
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Lasso/.test(b.getAttribute('aria-label') || ''))?.click());
      await sleep(200);
      await page.touchscreen.tap(el.x, el.y);
      await sleep(120);
      await page.touchscreen.tap(el.x, el.y);
      await sleep(600);
    }
    const plot = await page.evaluate(() => {
      const n = document.querySelector('[data-graph-view]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, view: n.getAttribute('data-graph-view'), touchNone: getComputedStyle(n).touchAction === 'none' };
    });
    check('phone: the graph opens for editing with touch, and its plot takes touch gestures', plot && plot.touchNone, JSON.stringify(plot));
    if (plot) {
      const cdp = await page.createCDPSession();
      const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
      await touch('touchStart', [[plot.x - 30, plot.y], [plot.x + 30, plot.y]]);
      for (let s = 1; s <= 6; s++) await touch('touchMove', [[plot.x - 30 - s * 10, plot.y], [plot.x + 30 + s * 10, plot.y]]);
      await touch('touchEnd', []);
      await sleep(500);
      const after = (await page.evaluate(() => document.querySelector('[data-graph-view]')?.getAttribute('data-graph-view'))).split(',').map(Number);
      const before = plot.view.split(',').map(Number);
      check('phone: pinching the plot apart zooms in', after[1] - after[0] < (before[1] - before[0]) * 0.8, JSON.stringify([before, after]));
    }
  } catch (e) {
    check('phone run finished', false, String((e && e.stack) || e).slice(0, 500));
  }
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
}

// ── C11: the same reading in the worker and in the page ───────────────────────
async function readOnePlusOne(inPage) {
  const { browser, page, errors } = await launch({ width: 1280, height: 800 });
  const workers = [];
  page.on('workercreated', (w) => workers.push(w.url()));
  if (inPage) await page.evaluateOnNewDocument(() => { window.__NETZ_RECOGNITION_IN_PAGE__ = true; });
  let pill = null;
  try {
    await openPlayground(page);
    await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('NETZ_PLAYGROUND_DB'); });
    await openPlayground(page);
    await clickTitle(page, 'Switch to Notes Mode');
    await drawStroke(page, [[300, 300], [300, 360]]);
    await sleep(200);
    await drawStroke(page, [[340, 330], [380, 330]]);
    await drawStroke(page, [[360, 310], [360, 350]]);
    await sleep(200);
    await drawStroke(page, [[420, 300], [420, 360]]);
    for (let i = 0; i < 90; i++) {
      await sleep(1000);
      pill = await page.evaluate(() => {
        const p = document.querySelector('[data-reading-pill]');
        return p ? p.innerText.replace(/\s+/g, ' ').trim() : null;
      });
      if (pill && !/Recogni|Reading/i.test(pill)) break;
    }
  } catch (e) {
    pill = `error: ${String(e).slice(0, 120)}`;
  }
  await browser.close();
  return { pill, workers, errors };
}
const viaWorker = await readOnePlusOne(false);
const viaPage = await readOnePlusOne(true);
check('recognition runs in a worker', viaWorker.workers.length >= 1, JSON.stringify(viaWorker.workers.map((u) => u.slice(-60))));
check('with the worker switched off, no recognition worker starts', viaPage.workers.length === 0, JSON.stringify(viaPage.workers));
check('the worker reads the ink exactly as the page does', viaWorker.pill && viaWorker.pill === viaPage.pill, JSON.stringify([viaWorker.pill, viaPage.pill]));
check('recognition: no console errors either way', viaWorker.errors.length === 0 && viaPage.errors.length === 0, [...viaWorker.errors, ...viaPage.errors].slice(0, 3).join(' | '));

const passed = results.filter((r) => r.ok).length;
for (const r of results) if (!r.ok) console.log(`FAIL ${r.name} :: ${r.detail}`);
console.log(`phase-c: ${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
