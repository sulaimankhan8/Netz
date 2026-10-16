import { launch, openPlayground, drawStroke, sleep, clickTitle, shot } from './lib.mjs';

const { browser, page, errors } = await launch();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const saved = () => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return ((s.pages && s.pages[0].strokes) || []).map((st) => ({
    id: st.id, color: st.color, width: st.width,
    x0: Math.round(st.bbox.minX), y0: Math.round(st.bbox.minY), x1: Math.round(st.bbox.maxX), y1: Math.round(st.bbox.maxY),
  }));
});
const hasToolbar = () => page.evaluate(() => Boolean(document.querySelector('button[title="Duplicate selection"]')));
const regionInk = (x, y, r, sel = 'canvas.z-10') => page.evaluate(({ x, y, r, sel }) => {
  const c = document.querySelector(sel);
  const d = c.getContext('2d').getImageData(x - r, y - r, 2 * r, 2 * r).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
}, { x, y, r, sel });
const lassoAround = (x0, y0, x1, y1) => drawStroke(page, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0 + 4]], { steps: 10 });
const drag = async (from, to) => {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, { steps: 6 });
  await page.mouse.move(to[0], to[1], { steps: 6 });
  await page.mouse.up();
  await sleep(250);
};

try {
  await openPlayground(page);
  // A small "V" (two strokes) and, far away, a separate line
  await drawStroke(page, [[300, 280], [330, 340]]);
  await drawStroke(page, [[330, 340], [360, 280]]);
  await drawStroke(page, [[700, 500], [800, 500]]);
  await sleep(200);
  check('three strokes drawn', (await saved()).length === 3);

  await clickTitle(page, 'Lasso Select');
  await lassoAround(270, 250, 390, 370);
  await sleep(500);
  check('lasso shows the selection toolbar', await hasToolbar());
  check('lasso draws a selection box', (await regionInk(330, 310, 60, 'canvas.z-20')) > 0);

  // Move: drag from inside the selection
  await drag([330, 310], [480, 410]);
  let s = await saved();
  check('dragging the selection moves both of its strokes by (+150, +100)', s[0].x0 === 450 && s[0].y0 === 380 && s[1].x1 === 510, JSON.stringify(s.slice(0, 2)));
  check('the stroke outside the selection did not move', s[2].x0 === 700 && s[2].y0 === 500);
  check('ink is at the new place and gone from the old', (await regionInk(480, 410, 40)) > 0 && (await regionInk(330, 310, 40)) === 0);
  check('stroke ids are kept when moving', s.length === 3);
  check('the toolbar is still there after the move', await hasToolbar());

  // Undo puts it back (one step)
  await clickTitle(page, 'Undo');
  await sleep(250);
  s = await saved();
  check('one undo moves it back', s[0].x0 === 300 && s[0].y0 === 280, JSON.stringify(s[0]));
  check('undo lets go of the selection', !(await hasToolbar()));

  // Resize: drag the corner handle
  await lassoAround(270, 250, 390, 370);
  await sleep(500);
  await drag([368, 348], [428, 408]); // handle sits 8 px outside the bottom-right corner (360, 340)
  s = await saved();
  check('dragging the handle enlarges the selection from its top-left corner', s[0].x0 === 300 && s[0].y0 === 280 && s[1].x1 > 400, JSON.stringify(s.slice(0, 2)));
  check('line thickness scales with it', s[0].width > 3, s[0].width);
  await clickTitle(page, 'Undo');
  await sleep(250);

  // Duplicate: the copies become the selection
  await lassoAround(270, 250, 390, 370);
  await sleep(500);
  await page.evaluate(() => document.querySelector('button[title="Duplicate selection"]').click());
  await sleep(300);
  s = await saved();
  check('duplicate adds a copy of both strokes', s.length === 5, s.length);
  check('the copy is offset from the original', s[3].x0 === 324 && s[3].y0 === 304, JSON.stringify(s[3]));
  check('copies have their own ids', new Set(s.map((x) => x.id)).size === 5);

  // Delete key removes what is selected (the copies)
  await page.keyboard.press('Delete');
  await sleep(300);
  s = await saved();
  check('Delete removes the selected copies only', s.length === 3 && s[0].x0 === 300, s.length);
  check('the toolbar goes away after deleting', !(await hasToolbar()));

  // Recolour with the current pen colour
  await clickTitle(page, 'Stroke & Canvas Settings');
  await page.evaluate(() => document.querySelector('button[aria-label="Pink"]').click());
  await sleep(150);
  await clickTitle(page, 'Stroke & Canvas Settings');
  await lassoAround(270, 250, 390, 370);
  await sleep(500);
  await page.evaluate(() => document.querySelector('button[title="Apply the current pen colour to the selection"]').click());
  await sleep(300);
  s = await saved();
  check('recolour applies the pen colour to the selection only', s[0].color === '#F43F5E' && s[1].color === '#F43F5E' && s[2].color === '#3B82F6', JSON.stringify(s.map((x) => x.color)));
  await shot(page, 'lasso-selected');

  // Letting go
  await page.mouse.click(900, 200);
  await sleep(300);
  check('pressing elsewhere lets go of the selection', !(await hasToolbar()));
  await lassoAround(270, 250, 390, 370);
  await sleep(500);
  await clickTitle(page, 'Pen');
  await sleep(250);
  check('switching tool lets go of the selection', !(await hasToolbar()) && (await regionInk(330, 310, 70, 'canvas.z-20')) === 0);

  // Toolbar button delete
  await clickTitle(page, 'Lasso Select');
  await lassoAround(670, 470, 830, 530);
  await sleep(500);
  await page.evaluate(() => document.querySelector('button[title="Delete selection (Delete key)"]').click());
  await sleep(300);
  check('the toolbar delete button removes the selection', (await saved()).length === 2);
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} lasso checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
