import { launch, openPlayground, drawStroke, sleep, clickTitle, shot } from './lib.mjs';

// Finger, two-finger and pen input, emulated through the Chrome DevTools protocol.
const { browser, page, errors } = await launch();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1, hasTouch: true });
const client = await page.createCDPSession();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const touch = (type, pts) => client.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id, radiusX: 18, radiusY: 18, force: 0.5 })) });
const pen = (type, x, y) => client.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'pen', force: 0.5 });

async function fingerDrag(from, to, steps = 10) {
  await touch('touchStart', [from]);
  for (let s = 1; s <= steps; s++) await touch('touchMove', [[from[0] + ((to[0] - from[0]) * s) / steps, from[1] + ((to[1] - from[1]) * s) / steps]]);
  await touch('touchEnd', []);
  await sleep(120);
}
async function twoFingers(a0, b0, a1, b1, steps = 10) {
  await touch('touchStart', [a0]);
  await sleep(30);
  await touch('touchStart', [a0, b0]);
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    await touch('touchMove', [[a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t], [b0[0] + (b1[0] - b0[0]) * t, b0[1] + (b1[1] - b0[1]) * t]]);
  }
  await touch('touchEnd', [[a1[0], a1[1]]]);
  await sleep(30);
  await touch('touchEnd', []);
  await sleep(200);
}
const strokeCount = () => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return ((s.pages && s.pages[0].strokes) || []).length;
});
const zoomLabel = () => page.evaluate(() => [...document.querySelectorAll('button[title]')].find((b) => b.title.startsWith('Reset Zoom'))?.innerText);
const regionInk = (x, y, r) => page.evaluate(({ x, y, r }) => {
  const c = document.querySelector('canvas.z-10');
  const d = c.getContext('2d').getImageData(x - r, y - r, 2 * r, 2 * r).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
}, { x, y, r });

try {
  await openPlayground(page);

  // A finger draws, like a mouse
  await fingerDrag([300, 300], [420, 300]);
  check('one finger draws a stroke', (await strokeCount()) === 1, await strokeCount());
  await touch('touchStart', [[500, 300]]);
  await touch('touchEnd', []);
  await sleep(150);
  check('a finger tap draws a dot', (await strokeCount()) === 2, await strokeCount());

  // The mouse still draws
  await drawStroke(page, [[300, 360], [420, 360]]);
  await sleep(150);
  check('the mouse cursor draws', (await strokeCount()) === 3, await strokeCount());

  // Two fingers: pinch out to zoom, and no stray mark
  await twoFingers([560, 500], [720, 500], [480, 500], [800, 500]);
  check('pinch out zooms to 200%', (await zoomLabel()) === '200%', await zoomLabel());
  check('pinching leaves no stroke', (await strokeCount()) === 3, await strokeCount());

  // Pinch back, then pan with two fingers
  await twoFingers([480, 500], [800, 500], [560, 500], [720, 500]);
  check('pinch in returns to 100%', (await zoomLabel()) === '100%', await zoomLabel());
  check('first stroke is where it was drawn', (await regionInk(360, 300, 14)) > 0);
  await twoFingers([560, 500], [720, 500], [660, 560], [820, 560]);
  check('two-finger drag keeps the zoom', (await zoomLabel()) === '100%', await zoomLabel());
  check('two-finger drag moved the page (+100, +60)', (await regionInk(460, 360, 14)) > 0 && (await regionInk(360, 300, 14)) === 0);
  check('panning leaves no stroke', (await strokeCount()) === 3, await strokeCount());

  // Pen: draws, and the resting palm does not
  await pen('mousePressed', 300, 520);
  for (let s = 1; s <= 8; s++) await pen('mouseMoved', 300 + s * 15, 520);
  await touch('touchStart', [[700, 620]]); // palm lands while the pen is writing
  for (let s = 1; s <= 6; s++) await touch('touchMove', [[700 + s * 10, 620]]);
  await touch('touchEnd', []);
  await pen('mouseReleased', 420, 520);
  await sleep(150);
  check('pen stroke drawn, palm ignored while the pen is down', (await strokeCount()) === 4, await strokeCount());

  await fingerDrag([700, 650], [760, 650], 5); // palm brushing right after the pen lifts
  check('touch just after the pen lifts is ignored', (await strokeCount()) === 4, await strokeCount());
  await sleep(900);
  await fingerDrag([700, 680], [760, 680], 5);
  check('a moment later the finger draws again', (await strokeCount()) === 5, await strokeCount());

  // Palm lands BEFORE the pen: its stroke is dropped when the pen arrives
  await sleep(900);
  await touch('touchStart', [[800, 620]]);
  for (let s = 1; s <= 4; s++) await touch('touchMove', [[800 + s * 8, 620]]);
  await pen('mousePressed', 300, 580);
  for (let s = 1; s <= 8; s++) await pen('mouseMoved', 300 + s * 15, 580);
  await pen('mouseReleased', 420, 580);
  await touch('touchEnd', []);
  await sleep(200);
  check('palm that landed first leaves nothing; the pen stroke is kept', (await strokeCount()) === 6, await strokeCount());

  // Optional setting: one finger moves the page
  await sleep(900);
  await clickTitle(page, 'Stroke & Canvas Settings');
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Moves page').click());
  await sleep(200);
  const before = await strokeCount();
  await fingerDrag([600, 200], [700, 240]);
  check('"finger moves page": one finger does not draw', (await strokeCount()) === before, await strokeCount());
  check('"finger moves page": the page moved (+100, +40 more)', (await regionInk(560, 400, 14)) > 0, await regionInk(560, 400, 14));
  await drawStroke(page, [[900, 300], [960, 300]]);
  await sleep(150);
  check('"finger moves page": the mouse still draws', (await strokeCount()) === before + 1, await strokeCount());
  await pen('mousePressed', 900, 340);
  for (let s = 1; s <= 6; s++) await pen('mouseMoved', 900 + s * 10, 340);
  await pen('mouseReleased', 960, 340);
  await sleep(150);
  check('"finger moves page": the pen still draws', (await strokeCount()) === before + 2, await strokeCount());
  await sleep(900); // past the palm guard that follows the pen stroke above
  await twoFingers([560, 500], [720, 500], [480, 500], [800, 500]);
  check('"finger moves page": two fingers still zoom', (await zoomLabel()) === '200%', await zoomLabel());

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas.touch-none', { timeout: 120000 });
  await sleep(2000);
  await clickTitle(page, 'Stroke & Canvas Settings');
  const remembered = await page.evaluate(() => /font-semibold/.test([...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Moves page').className));
  check('the finger setting is remembered after a reload', remembered);
  await shot(page, 'touch-final');
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} input checks passed | console errors: ${errors.length ? errors.slice(0, 5).join(' || ') : 'none'}`);
await browser.close();
