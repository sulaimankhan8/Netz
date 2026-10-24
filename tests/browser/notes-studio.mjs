// Notes Studio (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md): Save to Notes Studio, the Assets
// library, inserting a board into a note, opening a board in the Playground, Writing mode reading
// each line (and saving it to Training data), Insert from file, and Insert > Table.
// Run against a server, e.g. NETZ_URL=http://localhost:3211 node notes-studio.mjs
import { launch, sleep, BASE, drawStroke, openPlayground, shot } from './lib.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const { browser, page, errors } = await launch({ width: 1440, height: 900 });

// What the library holds (IndexedDB NETZ_NOTES_ASSETS)
const library = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('NETZ_NOTES_ASSETS');
        req.onupgradeneeded = () => {
          req.result.createObjectStore('assets', { keyPath: 'id' });
          req.result.createObjectStore('training', { keyPath: 'id' });
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['assets', 'training'], 'readonly');
          const a = tx.objectStore('assets').getAll();
          const t = tx.objectStore('training').getAll();
          tx.oncomplete = () => {
            db.close();
            resolve({
              assets: a.result.map((x) => ({ id: x.id, kind: x.kind, title: x.title, pageCount: x.pageCount, preview: x.previewBlob ? x.previewBlob.size : 0, main: x.mainBlob ? x.mainBlob.size : 0 })),
              training: t.result.map((x) => ({ id: x.id, readText: x.readText, strokes: x.strokes.length, converted: x.converted })),
            });
          };
        };
      })
  );
const session = () => page.evaluate(() => JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || 'null'));
const clickLabel = (label) =>
  page.evaluate((label) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === label || x.textContent.trim() === label);
    if (b) b.click();
    return Boolean(b);
  }, label);
const openPageMenu = async () => {
  await clickLabel('Page');
  await sleep(400);
};

// ── 1. Save a board to Notes Studio ──
await openPlayground(page);
for (let i = 0; i < 3; i++) {
  await drawStroke(page, [[300 + i * 120, 400], [340 + i * 120, 360], [380 + i * 120, 420], [420 + i * 120, 380]]);
  await sleep(150);
}
await sleep(800);
check('ink drawn', ((await session())?.pages?.[0]?.strokes || []).length === 3);
await openPageMenu();
check('page menu has Save to Notes Studio', await clickLabel('Save to Notes Studio'));
await sleep(3500);
let lib = await library();
const board = lib.assets.find((a) => a.kind === 'board');
check('board saved to the library', Boolean(board), JSON.stringify(lib.assets));
check('board has a preview picture', board && board.preview > 500, String(board?.preview));
check('board keeps its pages', board && board.pageCount === 1 && board.main > 100);
let s = await session();
check('page remembers its board', s?.pages?.[0]?.boardId === board?.id);
await openPageMenu();
check('second save updates the same card', await clickLabel('Update this board in Notes Studio'));
await sleep(3000);
lib = await library();
check('still one board', lib.assets.filter((a) => a.kind === 'board').length === 1);

// ── 2. Insert > Table ──
await page.evaluate(() => document.querySelector('button[aria-label="Table"]')?.click());
await sleep(500);
check('table size grid', (await page.$$('[data-table-size]')).length === 80);
await page.click('[data-table-size="2x3"]');
await sleep(1200);
check('table block on the page', (await page.$$('[data-table-block] [data-cell]')).length === 6);
await shot(page, 'notes-studio-playground');

// ── 3. The library in Notes, and a board in a note ──
await page.goto(`${BASE}/Notes?assets=1`, { waitUntil: 'networkidle2', timeout: 120000 });
await page.waitForSelector('[role="dialog"][aria-label="Assets"]', { timeout: 60000 });
await sleep(1500);
check('?assets=1 opens the library', true);
check('board card with preview', await page.evaluate(() => Boolean(document.querySelector('[data-asset-card="board"] img'))));
await page.evaluate(() => document.querySelector('[data-asset-card="board"] button[aria-haspopup="menu"]')?.click());
await sleep(400);
const inserted = await page.evaluate(() => {
  const item = [...document.querySelectorAll('[role="menuitem"], [role="menu"] button')].find((b) => b.textContent.includes('Insert into note'));
  if (item) item.click();
  return Boolean(item);
});
check('card menu: Insert into note', inserted);
await sleep(1500);
check('board block with preview in the note', await page.evaluate(() => Boolean(document.querySelector('[data-asset-block="board"] img'))));
await shot(page, 'notes-studio-note');
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Training data')?.click());
await sleep(800);
check('Training data folder opens', await page.evaluate(() => Boolean(document.querySelector('[role="dialog"][aria-label="Training data"]'))));
await page.keyboard.press('Escape');
await sleep(300);

// ── 4. A board from a file opens in the Playground as new pages ──
const docFile = JSON.stringify({
  netz: 1,
  kind: 'document',
  document: {
    title: 'From a friend',
    pages: [
      { id: 'p1', title: 'Friend page 1', strokes: [{ id: 's1', color: '#000', width: 3, tool: 'pen', points: [{ x: 10, y: 10 }, { x: 200, y: 60 }] }], blocks: [], shapes: [] },
      { id: 'p2', title: 'Friend page 2', strokes: [], blocks: [{ blockId: 'b1', type: 'equation', content: { latex: 'a^2+b^2=c^2' }, position: { x: 40, y: 40 }, size: { width: 300, height: 100 } }], shapes: [] },
    ],
  },
});
await page.evaluate((text) => {
  const file = new File([text], 'friend-board.netz', { type: 'application/json' });
  const orig = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function () {
    if (this.type === 'file' && this.accept.includes('.netz')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      this.files = dt.files;
      setTimeout(() => this.onchange && this.onchange(), 10);
      HTMLInputElement.prototype.click = orig;
      return;
    }
    return orig.call(this);
  };
}, docFile);
await page.evaluate(() => document.querySelector('button[aria-label="Open a .netz file"]')?.click());
await sleep(3500);
lib = await library();
const friend = lib.assets.find((a) => a.title === 'From a friend');
check('board file becomes a library board', Boolean(friend) && friend.pageCount === 2);
check('…and a new note showing it', await page.evaluate(() => Boolean(document.querySelector('[data-asset-block="board"]'))));
await page.goto(`${BASE}/Playground?asset=${friend?.id}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
await sleep(4000);
s = await session();
check('Open in Playground adds its pages', s?.pages?.length === 3, String(s?.pages?.length));
check('…and opens the first of them', s?.pages?.[s.currentPageIndex]?.title === 'Friend page 1');
check('…linked to the library board', s?.pages?.[1]?.boardId === friend?.id && s?.pages?.[2]?.boardId === friend?.id);
check('address cleaned up', !page.url().includes('asset='));
await page.goto(`${BASE}/Playground?asset=${friend?.id}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
await sleep(4000);
check('opening it again does not add pages twice', (await session())?.pages?.length === 3);

// ── 5. Insert from file in the Playground ──
await page.evaluate((text) => {
  const file = new File([text], 'friend-board.netz', { type: 'application/json' });
  const orig = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function () {
    if (this.type === 'file' && this.accept.includes('.netz')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      this.files = dt.files;
      setTimeout(() => this.onchange && this.onchange(), 10);
      HTMLInputElement.prototype.click = orig;
      return;
    }
    return orig.call(this);
  };
}, docFile);
await openPageMenu();
check('page menu has Insert from file', await clickLabel('Insert from a .netz file'));
await sleep(1500);
check('asks: new pages or this page', await page.evaluate(() => Boolean([...document.querySelectorAll('button')].find((b) => b.textContent.includes('Onto this page')))));
const strokesBefore = ((await session())?.pages || []).reduce((n, p) => n + (p.strokes || []).length, 0);
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Onto this page'))?.click());
await sleep(2000);
const after = await session();
const strokesAfter = (after?.pages || []).reduce((n, p) => n + (p.strokes || []).length, 0);
check('onto this page: ink added, no new page', strokesAfter === strokesBefore + 1 && after.pages.length === 3, `${strokesBefore} → ${strokesAfter}, pages ${after?.pages?.length}`);

// ── 6. Writing mode reads each finished line ──
await openPageMenu();
await page.evaluate(() => document.querySelector('[role="switch"][aria-label="Writing mode"]')?.click());
await sleep(600);
const y1 = 420;
for (let i = 0; i < 4; i++) {
  await drawStroke(page, [[400 + i * 40, y1 + 8], [410 + i * 40, y1 - 12], [420 + i * 40, y1 + 8], [430 + i * 40, y1 - 4]], { steps: 4 });
  await sleep(60);
}
// Move down a line: the line above is finished
await drawStroke(page, [[400, y1 + 72], [440, y1 + 60], [480, y1 + 72]], { steps: 4 });
let lines = 0;
for (let i = 0; i < 90 && lines === 0; i++) {
  await sleep(1000);
  lines = (await library()).training.length;
}
check('a finished line is read and saved to Training data', lines >= 1, `${lines} line(s)`);
await sleep(4000);
const samples = (await library()).training;
// Only the 5 strokes written after Writing mode came on are read, never the ink already there
check('ink already on the page is not read', samples.reduce((n, t) => n + t.strokes, 0) <= 5, JSON.stringify(samples.map((t) => t.strokes)));
const pills = await page.evaluate(() => document.querySelectorAll('[data-reading-pill]').length);
check('its reading shows on the page', pills >= 1, String(pills));
await shot(page, 'notes-studio-writing');

check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
