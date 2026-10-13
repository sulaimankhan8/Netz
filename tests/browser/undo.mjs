import { launch, openPlayground, drawStroke, shot, inkPixels, sleep, clickTitle } from './lib.mjs';

const { browser, page, errors } = await launch();
page.on('dialog', (d) => d.accept());
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const near = (a, b) => Math.abs(a - b) <= Math.max(6, b * 0.02);
const blockCount = () => page.evaluate(() => document.querySelectorAll('div.absolute.top-0.left-0.group').length);
const disabled = (titleStart) => page.evaluate((t) => [...document.querySelectorAll('button[title]')].find((b) => b.title.startsWith(t))?.disabled, titleStart);
const regionInk = (x, y, r) =>
  page.evaluate(({ x, y, r }) => {
    const c = document.querySelector('canvas.z-10');
    const k = c.width / c.clientWidth;
    const d = c.getContext('2d').getImageData(Math.round((x - r) * k), Math.round((y - r) * k), Math.round(2 * r * k), Math.round(2 * r * k)).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  }, { x, y, r });

try {
  await openPlayground(page);

  // ── Undo / redo of strokes ──
  check('undo disabled on an empty page', await disabled('Undo'));
  await drawStroke(page, [[300, 250], [420, 250]]);
  await sleep(120);
  const p1 = await inkPixels(page);
  await drawStroke(page, [[300, 300], [420, 300]]);
  await sleep(120);
  const p2 = await inkPixels(page);
  await drawStroke(page, [[300, 350], [420, 350]]);
  await sleep(120);
  const p3 = await inkPixels(page);
  check('three strokes drawn', p1 > 0 && p2 > p1 && p3 > p2, `${p1} ${p2} ${p3}`);

  await clickTitle(page, 'Undo');
  check('undo button removes the last stroke', near(await inkPixels(page), p2), await inkPixels(page));
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await sleep(150);
  check('Ctrl+Z removes the next stroke', near(await inkPixels(page), p1), await inkPixels(page));
  await clickTitle(page, 'Redo');
  check('redo button restores it', near(await inkPixels(page), p2), await inkPixels(page));
  await page.keyboard.down('Control'); await page.keyboard.down('Shift'); await page.keyboard.press('z'); await page.keyboard.up('Shift'); await page.keyboard.up('Control');
  await sleep(150);
  check('Ctrl+Shift+Z restores the last one', near(await inkPixels(page), p3), await inkPixels(page));
  check('redo disabled at the newest state', await disabled('Redo'));

  await clickTitle(page, 'Undo'); await clickTitle(page, 'Undo'); await clickTitle(page, 'Undo');
  check('undo all the way back: empty page', (await inkPixels(page)) === 0, await inkPixels(page));
  check('undo disabled at the oldest state', await disabled('Undo'));
  await clickTitle(page, 'Redo'); await clickTitle(page, 'Redo');
  await drawStroke(page, [[500, 250], [600, 330]]);
  await sleep(120);
  check('a new stroke clears the redo side', await disabled('Redo'));
  const p4 = await inkPixels(page);

  // ── Eraser is undoable ──
  await clickTitle(page, 'Eraser');
  await drawStroke(page, [[360, 220], [360, 320]]);
  await sleep(150);
  const erased = await inkPixels(page);
  check('eraser removed ink', erased < p4, `${p4} -> ${erased}`);
  await clickTitle(page, 'Undo'); // one eraser drag is one undo step
  check('undo brings erased strokes back', near(await inkPixels(page), p4), await inkPixels(page));
  await clickTitle(page, 'Pen');

  // ── Blocks are undoable ──
  const b0 = await blockCount();
  await clickTitle(page, 'Add Equation Block');
  await sleep(700);
  check('block added', (await blockCount()) === b0 + 1, await blockCount());
  await clickTitle(page, 'Undo');
  await sleep(200);
  check('undo removes the block', (await blockCount()) === b0, await blockCount());
  check('undoing the block left the ink alone', near(await inkPixels(page), p4), await inkPixels(page));
  await clickTitle(page, 'Redo');
  await sleep(200);
  check('redo puts the block back', (await blockCount()) === b0 + 1, await blockCount());
  await clickTitle(page, 'Undo');
  await sleep(200);

  // ── Clear page is one undoable step ──
  await clickTitle(page, 'Clear Current Page');
  await sleep(700);
  check('page cleared', (await inkPixels(page)) === 0);
  await clickTitle(page, 'Undo');
  await sleep(200);
  check('undo restores a cleared page', near(await inkPixels(page), p4), await inkPixels(page));

  // ── Adding a page must not erase the page before it ──
  await clickTitle(page, 'Add Fresh Blank Page');
  await sleep(400);
  check('new page starts empty', (await inkPixels(page)) === 0);
  check('new page starts with no undo history', await disabled('Undo'));
  await drawStroke(page, [[700, 200], [780, 260]]);
  await sleep(200);
  const page2 = await inkPixels(page);
  await clickTitle(page, 'Previous Page');
  await sleep(400);
  check('first page still has its ink after adding a page', near(await inkPixels(page), p4), await inkPixels(page));
  await clickTitle(page, 'Next Page');
  await sleep(400);
  check('second page still has its ink', near(await inkPixels(page), page2), await inkPixels(page));
  await clickTitle(page, 'Previous Page');
  await sleep(700);

  // ── Survives a reload ──
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
  await sleep(2500);
  check('ink survives a reload', near(await inkPixels(page), p4), await inkPixels(page));
  check('undo after reload cannot wipe the restored page', await disabled('Undo'));
  await clickTitle(page, 'Next Page');
  await sleep(500);
  check('second page survives a reload', near(await inkPixels(page), page2), await inkPixels(page));

  // ── Zoom keeps the anchor point still ──
  await clickTitle(page, 'Add Fresh Blank Page');
  await sleep(400);
  await drawStroke(page, [[636, 400], [644, 400]]); // small mark at the screen centre (640, 400)
  await sleep(150);
  check('mark drawn at the centre', (await regionInk(640, 400, 14)) > 0);
  await clickTitle(page, 'Zoom In'); await clickTitle(page, 'Zoom In'); await clickTitle(page, 'Zoom In');
  await sleep(200);
  check('zoom-in button keeps the centre mark at the centre', (await regionInk(640, 400, 22)) > 0, await regionInk(640, 400, 22));
  const zoomLabel = await page.evaluate(() => [...document.querySelectorAll('button[title]')].find((b) => b.title.startsWith('Reset Zoom'))?.innerText);
  check('zoom label shows 173%', zoomLabel === '173%', zoomLabel);
  await clickTitle(page, 'Reset Zoom');
  await sleep(200);
  check('reset zoom keeps the centre mark at the centre', (await regionInk(640, 400, 14)) > 0);

  await drawStroke(page, [[296, 300], [304, 300]]); // mark at (300, 300)
  await sleep(150);
  await page.mouse.move(300, 300);
  await page.keyboard.down('Control');
  for (let i = 0; i < 6; i++) { await page.mouse.wheel({ deltaY: -100 }); await sleep(30); }
  await page.keyboard.up('Control');
  await sleep(250);
  check('Ctrl+wheel zoom keeps the mark under the cursor', (await regionInk(300, 300, 22)) > 0, await regionInk(300, 300, 22));
  await shot(page, 'undo-final');
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed | console errors: ${errors.length ? errors.slice(0, 5).join(' || ') : 'none'}`);
await browser.close();
process.exit(failed.length || errors.length ? 1 : 0);
