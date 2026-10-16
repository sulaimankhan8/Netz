import { launch, openPlayground, drawStroke, sleep, clickTitle, shot, withToolOptions } from './lib.mjs';

const { browser, page, errors } = await launch();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const strokeCount = () => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return ((s.pages && s.pages[0].strokes) || []).length;
});
const regionInk = (x, y, r, sel = 'canvas.z-10') => page.evaluate(({ x, y, r, sel }) => {
  const c = document.querySelector(sel);
  const d = c.getContext('2d').getImageData(x - r, y - r, 2 * r, 2 * r).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
}, { x, y, r, sel });
const clickText = (text) => page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === t).click(), text);

try {
  await openPlayground(page);
  for (const y of [260, 300, 340]) { await drawStroke(page, [[300, y], [700, y]]); await sleep(100); }
  check('three lines drawn', (await strokeCount()) === 3);

  // Whole-stroke mode (default): one drag across all three
  await clickTitle(page, 'Eraser');
  await sleep(150);
  let optionsShown = false;
  await withToolOptions(page, async () => {
    optionsShown = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.innerText.trim() === 'Part of stroke'));
  });
  check('with the eraser selected, its options button opens the eraser options', optionsShown);
  await page.mouse.move(450, 200);
  await sleep(100);
  check('hovering shows the eraser circle', (await regionInk(450, 200, 24, 'canvas.z-20')) > 0);
  await drawStroke(page, [[500, 230], [500, 370]], { steps: 10 });
  await sleep(200);
  check('whole-stroke eraser: one drag removes all three lines', (await strokeCount()) === 0, await strokeCount());
  await clickTitle(page, 'Undo');
  await sleep(200);
  check('one undo brings all three back (the drag is one step)', (await strokeCount()) === 3, await strokeCount());

  // Part-of-stroke mode
  await withToolOptions(page, () => clickText('Part of stroke'));
  await drawStroke(page, [[500, 230], [500, 370]], { steps: 10 });
  await sleep(200);
  check('partial eraser: each line is cut in two', (await strokeCount()) === 6, await strokeCount());
  check('partial eraser: the crossing is gone', (await regionInk(500, 300, 8)) === 0, await regionInk(500, 300, 8));
  check('partial eraser: the rest of the line is still there', (await regionInk(360, 300, 8)) > 0 && (await regionInk(640, 300, 8)) > 0);
  await shot(page, 'eraser-partial');
  await clickTitle(page, 'Undo');
  await sleep(200);
  check('one undo restores the three whole lines', (await strokeCount()) === 3, await strokeCount());
  check('the crossing is back', (await regionInk(500, 300, 8)) > 0);

  // Size: the eraser reach follows its own setting, not the pen width
  await withToolOptions(page, () => page.evaluate(() => document.querySelector('button[title="Small eraser"]').click()));
  await sleep(100);
  await drawStroke(page, [[400, 318], [400, 322]], { steps: 2 }); // 18 px below the middle line: outside a small eraser
  await sleep(200);
  check('small eraser 18 px away does not touch the line', (await strokeCount()) === 3, await strokeCount());
  await withToolOptions(page, () => page.evaluate(() => document.querySelector('button[title="Large eraser"]').click()));
  await sleep(100);
  await drawStroke(page, [[400, 318], [400, 322]], { steps: 2 });
  await sleep(200);
  check('large eraser at the same spot does', (await strokeCount()) > 3, await strokeCount());

  // Leaving the eraser clears its circle
  await clickTitle(page, 'Pen');
  await page.mouse.move(800, 500);
  await sleep(150);
  check('switching tool removes the eraser circle', (await regionInk(400, 320, 40, 'canvas.z-20')) === 0, await regionInk(400, 320, 40, 'canvas.z-20'));
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} eraser checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
