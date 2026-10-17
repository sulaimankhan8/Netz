import { launch, openPlayground, drawStroke, sleep, clickTitle, shot, inkPixels, settle, BASE, zoomLabel as readZoomLabel } from './lib.mjs';

// Blocks moved by finger / pen / mouse, saving behaviour, pictures, storage safety, keyboard shortcuts.
const { browser, page, errors } = await launch();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1, hasTouch: true });
const client = await page.createCDPSession();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const near = (a, b, tol = 3) => Math.abs(a - b) <= tol;

const touch = (type, pts) => client.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id, radiusX: 18, radiusY: 18, force: 0.5 })) });
const pen = (type, x, y) => client.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'pen', force: 0.5 });
async function fingerDrag(from, to, steps = 12) {
  await touch('touchStart', [from]);
  for (let s = 1; s <= steps; s++) await touch('touchMove', [[from[0] + ((to[0] - from[0]) * s) / steps, from[1] + ((to[1] - from[1]) * s) / steps]]);
  await touch('touchEnd', []);
  await sleep(120);
}
async function penDrag(from, to, steps = 12) {
  await pen('mousePressed', from[0], from[1]);
  for (let s = 1; s <= steps; s++) await pen('mouseMoved', from[0] + ((to[0] - from[0]) * s) / steps, from[1] + ((to[1] - from[1]) * s) / steps);
  await pen('mouseReleased', to[0], to[1]);
  await sleep(120);
}
async function mouseDrag(from, to, steps = 12) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps });
  await page.mouse.up();
  await sleep(120);
}
// Screen rectangle and world size of every block, in page order
const blocks = () => page.evaluate(() => [...document.querySelectorAll('[data-block-id]')].map((b) => {
  const r = b.getBoundingClientRect();
  return { id: b.getAttribute('data-block-id'), x: r.left, y: r.top, w: r.width, h: r.height, editing: b.getAttribute('data-editing') === 'true' };
}));
const handleCentre = (index, selector) => page.evaluate(({ index, selector }) => {
  const b = [...document.querySelectorAll('[data-block-id]')][index];
  const el = b && b.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height];
}, { index, selector });
const backup = () => page.evaluate(() => JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || 'null'));
const idbSession = async () => { await settle(page); return idbRead(); };
const idbRead = () => page.evaluate(() => new Promise((resolve) => {
  const req = indexedDB.open('NETZ_PLAYGROUND_DB', 1);
  req.onsuccess = () => {
    const get = req.result.transaction('sessions', 'readonly').objectStore('sessions').get('default_session');
    get.onsuccess = () => resolve(get.result || null);
    get.onerror = () => resolve(null);
  };
  req.onerror = () => resolve(null);
}));
const savedStrokes = async () => (((await backup()) || {}).pages || [{ strokes: [] }])[0].strokes;
const zoomLabel = () => readZoomLabel(page);
const clickButtonText = (text) => page.evaluate((t) => {
  const el = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === t);
  if (el) el.click();
  return Boolean(el);
}, text);
// Pastes a generated picture (noise compresses badly, like a photo), as Ctrl+V would
const pasteImage = (width, height, kind) => page.evaluate(async ({ width, height, kind }) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (kind === 'noise') {
    const img = ctx.createImageData(width, height);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = Math.random() * 255; img.data[i + 1] = Math.random() * 255; img.data[i + 2] = Math.random() * 255; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  } else {
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(width / 4, height / 4, width / 2, height / 2);
  }
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const dt = new DataTransfer();
  dt.items.add(new File([blob], 'picture.png', { type: 'image/png' }));
  window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
  return blob.size;
}, { width, height, kind });
const imageInfo = (index) => page.evaluate((index) => {
  const imgs = [...document.querySelectorAll('[data-block-id] img')];
  const img = imgs[index];
  if (!img) return null;
  return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, type: img.src.slice(5, img.src.indexOf(';')), chars: img.src.length };
}, index);

try {
  await openPlayground(page);

  // ---------------------------------------------------------------- Moving blocks: mouse, finger, pen
  await clickTitle(page, 'Add Theory');
  await sleep(500);
  await page.keyboard.type('Move me');
  let b = await blocks();
  check('a block is on the page, open for editing', b.length === 1 && b[0].editing, JSON.stringify(b));

  let grab = await handleCentre(0, '.cursor-grab');
  const start = b[0];
  await mouseDrag([grab[0], grab[1]], [grab[0] + 120, grab[1] + 60]);
  b = await blocks();
  check('the mouse drags a block by its header', near(b[0].x, start.x + 120) && near(b[0].y, start.y + 60), `${b[0].x - start.x}, ${b[0].y - start.y}`);

  grab = await handleCentre(0, '.cursor-grab');
  let prev = b[0];
  await fingerDrag([grab[0], grab[1]], [grab[0] - 200, grab[1] + 90]);
  b = await blocks();
  check('a finger drags a block by its header', near(b[0].x, prev.x - 200) && near(b[0].y, prev.y + 90), `${b[0].x - prev.x}, ${b[0].y - prev.y}`);
  check('dragging a block with a finger draws no ink', (await inkPixels(page)) === 0, await inkPixels(page));

  grab = await handleCentre(0, '.cursor-grab');
  prev = b[0];
  await penDrag([grab[0], grab[1]], [grab[0] + 150, grab[1] - 70]);
  b = await blocks();
  check('a pen drags a block by its header', near(b[0].x, prev.x + 150) && near(b[0].y, prev.y - 70), `${b[0].x - prev.x}, ${b[0].y - prev.y}`);
  check('dragging a block with a pen draws no ink', (await inkPixels(page)) === 0, await inkPixels(page));

  // ---------------------------------------------------------------- Resizing
  let handle = await handleCentre(0, '[data-resize-handle]');
  check('the resize handle is finger-sized', handle && handle[2] >= 30 && handle[3] >= 30, JSON.stringify(handle));
  const handleOpacity = await page.evaluate(() => getComputedStyle(document.querySelector('[data-block-id] [data-resize-handle]')).opacity);
  check('the resize handle is visible while editing, without hovering', handleOpacity === '1', handleOpacity);
  prev = b[0];
  await fingerDrag([handle[0], handle[1]], [handle[0] + 80, handle[1] + 50]);
  b = await blocks();
  check('a finger resizes a block from its corner', near(b[0].w, prev.w + 80, 4) && near(b[0].h, prev.h + 50, 4), `${b[0].w - prev.w}, ${b[0].h - prev.h}`);
  handle = await handleCentre(0, '[data-resize-handle]');
  prev = b[0];
  await penDrag([handle[0], handle[1]], [handle[0] - 40, handle[1] + 30]);
  b = await blocks();
  check('a pen resizes a block from its corner', near(b[0].w, prev.w - 40, 4) && near(b[0].h, prev.h + 30, 4), `${b[0].w - prev.w}, ${b[0].h - prev.h}`);
  check('the block stayed where it was while resizing', near(b[0].x, prev.x) && near(b[0].y, prev.y));

  // ---------------------------------------------------------------- Saving while dragging
  await sleep(500);
  await page.evaluate(() => {
    window.__saves = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'NETZ_PLAYGROUND_SESSION_BACKUP') window.__saves++;
      return original.call(this, key, value);
    };
  });
  grab = await handleCentre(0, '.cursor-grab');
  prev = b[0];
  await mouseDrag([grab[0], grab[1]], [grab[0] + 90, grab[1] + 90], 40);
  const savesDuringDrag = await page.evaluate(() => window.__saves);
  check('a 40-step drag does not write the session 40 times', savesDuringDrag <= 2, `${savesDuringDrag} writes`);
  await sleep(500);
  const savesAfter = await page.evaluate(() => window.__saves);
  check('the session is written once the drag settles', savesAfter >= 1 && savesAfter <= 3, `${savesAfter} writes`);
  let saved = await backup();
  b = await blocks();
  check('the saved copy holds the final position', saved && near(saved.pages[0].blocks[0].position.x, b[0].x) && near(saved.pages[0].blocks[0].position.y, b[0].y), JSON.stringify(saved && saved.pages[0].blocks[0].position));
  check('the saved copy is timestamped', saved && saved.updatedAt > Date.now() - 60000, saved && saved.updatedAt);

  // Reload straight after a drag: the pending save must not be lost
  grab = await handleCentre(0, '.cursor-grab');
  await page.mouse.move(grab[0], grab[1]);
  await page.mouse.down();
  await page.mouse.move(grab[0] - 300, grab[1] + 40, { steps: 10 });
  await page.mouse.up();
  const beforeReload = (await blocks())[0];
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await sleep(1800);
  b = await blocks();
  check('a block moved just before a reload comes back where it was left', b.length === 1 && near(b[0].x, beforeReload.x) && near(b[0].y, beforeReload.y), `${JSON.stringify(b[0])} vs ${beforeReload.x},${beforeReload.y}`);
  const text = await page.evaluate(() => document.querySelector('[data-block-id]').innerText);
  check('with its text', /Move me/.test(text), text.slice(0, 60));

  // ---------------------------------------------------------------- Keyboard shortcuts
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); // keys go to the page, not a field
  await page.keyboard.press('h');
  await drawStroke(page, [[820, 160], [1040, 160]], { steps: 8 });
  await sleep(200);
  let strokes = await savedStrokes();
  check('H picks the highlighter', strokes.length === 1 && strokes[0].tool === 'highlighter', JSON.stringify(strokes.map((s) => s.tool)));
  await page.keyboard.press('p');
  await drawStroke(page, [[820, 200], [1040, 200]], { steps: 8 });
  await sleep(200);
  strokes = await savedStrokes();
  check('P picks the pen', strokes.length === 2 && strokes[1].tool === 'pen', JSON.stringify(strokes.map((s) => s.tool)));
  await page.keyboard.press('e');
  await drawStroke(page, [[930, 180], [930, 220]], { steps: 8 });
  await sleep(250);
  strokes = await savedStrokes();
  check('E picks the eraser', strokes.filter((s) => s.tool === 'pen').length !== 1 && strokes.some((s) => s.tool === 'highlighter'), JSON.stringify(strokes.map((s) => [s.tool, s.points.length])));
  await page.keyboard.press('p');

  await page.keyboard.down('Control');
  await page.keyboard.press('=');
  await page.keyboard.up('Control');
  await sleep(150);
  check('Ctrl + zooms the page in', (await zoomLabel()) === '120%', await zoomLabel());
  await page.keyboard.down('Control');
  await page.keyboard.press('-');
  await page.keyboard.press('-');
  await page.keyboard.up('Control');
  await sleep(150);
  check('Ctrl - zooms the page out', (await zoomLabel()) === '83%', await zoomLabel());
  await page.keyboard.down('Control');
  await page.keyboard.press('0');
  await page.keyboard.up('Control');
  await sleep(150);
  check('Ctrl 0 returns to 100%', (await zoomLabel()) === '100%', await zoomLabel());
  const browserZoom = await page.evaluate(() => window.devicePixelRatio);
  check('the browser itself did not zoom', browserZoom === 1, browserZoom);

  // Letters typed into a block do not switch tools
  await page.evaluate(() => document.querySelector('[data-block-id] [data-block-body]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))); // a double click opens a block
  await sleep(300);
  await page.keyboard.type(' hello');
  await clickButtonText('Done');
  await sleep(300);
  const countBefore = (await savedStrokes()).length;
  await drawStroke(page, [[820, 250], [1040, 250]], { steps: 8 });
  await sleep(200);
  strokes = await savedStrokes();
  check('typing "hello" in a block does not change the tool', strokes.length === countBefore + 1 && strokes[strokes.length - 1].tool === 'pen', JSON.stringify(strokes.map((s) => s.tool)));
  const typed = await page.evaluate(() => document.querySelector('[data-block-id]').innerText);
  check('and the letters went into the block', /hello/.test(typed), typed.slice(0, 60));

  // M + pen: the pen moves the page
  await page.keyboard.press('m');
  prev = (await blocks())[0];
  const inkBefore = (await savedStrokes()).length;
  await penDrag([900, 600], [800, 520]);
  b = await blocks();
  check('with the Move tool a pen moves the page', near(b[0].x, prev.x - 100) && near(b[0].y, prev.y - 80), `${b[0].x - prev.x}, ${b[0].y - prev.y}`);
  check('and draws nothing', (await savedStrokes()).length === inkBefore);
  await mouseDrag([800, 520], [900, 600]);
  b = await blocks();
  check('the mouse still moves the page with the Move tool', near(b[0].x, prev.x) && near(b[0].y, prev.y), `${b[0].x - prev.x}, ${b[0].y - prev.y}`);
  await page.keyboard.press('p');

  // ---------------------------------------------------------------- Pictures
  const smallBytes = await pasteImage(600, 400, 'flat');
  await sleep(700);
  b = await blocks();
  let img = await imageInfo(0);
  check('a pasted picture becomes a block', b.length === 2 && img, JSON.stringify(b.length));
  check('a small picture is stored untouched', img && img.naturalWidth === 600 && img.naturalHeight === 400 && img.type === 'image/png', JSON.stringify(img));
  check('its block has the picture\'s proportions (3:2)', near(b[1].w, 360, 2) && near(b[1].h, 240, 2), `${b[1].w} x ${b[1].h}`);

  const bigBytes = await pasteImage(3000, 2000, 'noise');
  // Reading, scaling and re-encoding a 20 MB picture takes 2.5 to 3.5 s on this machine: wait for the block
  const pasteStart = Date.now();
  await page.waitForFunction(() => document.querySelectorAll('[data-block-id] img').length >= 2, { timeout: 8000 }).catch(() => {});
  const pasteMs = Date.now() - pasteStart;
  await sleep(300);
  b = await blocks();
  img = await imageInfo(1);
  check('a large photo becomes a block too', b.length === 3 && img, `${b.length} blocks after ${pasteMs} ms`);
  check('it is scaled down to 1600 px on the long side', img && img.naturalWidth === 1600 && img.naturalHeight === 1067, JSON.stringify(img));
  check('and stored much smaller than the original', img && img.chars < bigBytes * 0.5, `${img && Math.round(img.chars / 1024)} KB of text vs ${Math.round(bigBytes / 1024)} KB original`);
  check('new blocks do not land exactly on top of each other', !(near(b[1].x, b[2].x, 1) && near(b[1].y, b[2].y, 1)), `${b[1].x},${b[1].y} / ${b[2].x},${b[2].y}`);

  // Caption can be edited (the block's edit state reaches the picture)
  await page.evaluate(() => [...document.querySelectorAll('[data-block-id]')][1].querySelector('[data-block-body]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  await sleep(300);
  const captionField = await page.evaluate(() => Boolean([...document.querySelectorAll('[data-block-id]')][1].querySelector('input[type="text"]')));
  check('a picture\'s caption can be edited', captionField);
  // Resizing a picture keeps its proportions
  handle = await handleCentre(1, '[data-resize-handle]');
  await mouseDrag([handle[0], handle[1]], [handle[0] + 90, handle[1] + 5]);
  b = await blocks();
  const savedImage = ((await backup()) || (await idbSession())).pages[0].blocks.find((x) => x.type === 'image');
  await sleep(400);
  const imageSize = ((await backup()) || (await idbSession())).pages[0].blocks.find((x) => x.type === 'image').size;
  check('resizing a picture keeps its proportions', near(imageSize.width, 450, 3) && near(imageSize.height, 300, 3), JSON.stringify(imageSize));
  check('the picture remembers its aspect ratio', savedImage && near(savedImage.content.aspectRatio, 1.5, 0.01), savedImage && savedImage.content.aspectRatio);
  await clickButtonText('Done');
  await sleep(200);
  await shot(page, 'workspace-images');

  // ---------------------------------------------------------------- Storage safety
  // 1. IndexedDB holds a later save than the backup: IndexedDB wins.
  await sleep(600);
  const truth = await idbSession();
  check('IndexedDB holds the session, timestamped', truth && truth.updatedAt > 0 && truth.pages[0].blocks.length === 3, truth && truth.pages[0].blocks.length);
  await page.evaluate(() => {
    // An older copy with nothing on it, as left behind by a failed backup write
    localStorage.setItem('NETZ_PLAYGROUND_SESSION_BACKUP', JSON.stringify({ pages: [{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [] }], currentPageIndex: 0, blocks: [], links: [], updatedAt: 5 }));
  });
  // Navigate away without letting the page save again
  await page.evaluate(() => { Storage.prototype.setItem = function () {}; });
  await page.goto('about:blank');
  await page.goto(BASE + '/Playground', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await sleep(2500);
  b = await blocks();
  check('when IndexedDB is newer than the backup, the newer session is shown', b.length === 3, `${b.length} blocks`);
  check('with its ink', (await inkPixels(page)) > 0, await inkPixels(page));

  // 2. The backup is newer (IndexedDB write lost): the backup wins.
  await page.keyboard.press('p');
  await drawStroke(page, [[150, 150], [260, 170]], { steps: 8 });
  await sleep(400);
  const withExtra = await backup();
  const strokesWithExtra = withExtra.pages[0].strokes.length;
  await page.evaluate(() => new Promise((resolve) => {
    // Put IndexedDB back to an older state by hand
    const req = indexedDB.open('NETZ_PLAYGROUND_DB', 1);
    req.onsuccess = () => {
      const tx = req.result.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').put({ sessionId: 'default_session', pages: [{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [] }], currentPageIndex: 0, blocks: [], links: [], updatedAt: 7 });
      tx.oncomplete = () => resolve();
    };
  }));
  await page.evaluate(() => { Storage.prototype.setItem = function () {}; indexedDB.open = () => ({}); });
  await page.goto('about:blank');
  await page.goto(BASE + '/Playground', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await sleep(2500);
  b = await blocks();
  check('when the backup is newer than IndexedDB, the backup is shown', b.length === 3, `${b.length} blocks`);
  await sleep(600);

  // 3. The session outgrows localStorage: the stale backup is removed and nothing is lost.
  for (let i = 0; i < 4; i++) {
    await pasteImage(2400, 1800, 'noise');
    await sleep(2200);
  }
  await sleep(1200);
  b = await blocks();
  const afterBig = await idbSession();
  const sessionChars = JSON.stringify(afterBig).length;
  const backupLeft = await page.evaluate(() => localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') !== null);
  check('four more photos are on the page', b.length === 7, `${b.length} blocks`);
  check('IndexedDB holds all of them', afterBig && afterBig.pages[0].blocks.length === 7, afterBig && afterBig.pages[0].blocks.length);
  if (sessionChars > 5.3e6) {
    check('the session is now larger than localStorage allows, and the stale backup was removed', backupLeft === false, `${(sessionChars / 1e6).toFixed(1)} MB, backup present: ${backupLeft}`);
  } else {
    check('the session still fits in localStorage, so the backup is kept up to date', backupLeft === true, `${(sessionChars / 1e6).toFixed(1)} MB`);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 180000 });
  await sleep(3000);
  b = await blocks();
  check(`everything comes back after a reload (session ${(sessionChars / 1e6).toFixed(1)} MB)`, b.length === 7, `${b.length} blocks`);
  check('including the ink', (await inkPixels(page)) > 0);
  strokes = (await idbSession()).pages[0].strokes;
  check('and the stroke drawn last', strokes.length === strokesWithExtra, `${strokes.length} vs ${strokesWithExtra}`);
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 500));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} workspace checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
