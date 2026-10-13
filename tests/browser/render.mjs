import { launch, openPlayground, drawStroke, sleep, clickTitle, seedStrokes, inkPixels } from './lib.mjs';

// Painting only the new stroke, and skipping off-screen ink, must give exactly the picture a full repaint gives.
// Chrome moves a canvas from GPU to software drawing after a few pixel read-backs, and the two
// anti-alias differently. Software drawing from the start keeps every comparison like for like.
const { browser, page, errors } = await launch({ extraArgs: ['--disable-accelerated-2d-canvas', '--disable-gpu'] });
const client = await page.createCDPSession();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const clickText = (text) => page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === t).click(), text);
// A fingerprint of every pixel on the committed-ink canvas
const fingerprint = () => page.evaluate(() => {
  const c = document.querySelector('canvas.z-10');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let h = 2166136261;
  let inked = 0;
  for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619); if ((i & 3) === 3 && d[i] > 0) inked++; }
  return `${h >>> 0}:${inked}`;
});
async function penLine(x0, y0, x1, y1, forceFrom, forceTo) {
  const send = (type, x, y, force) => client.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'pen', force });
  await send('mousePressed', x0, y0, forceFrom);
  for (let s = 1; s <= 30; s++) await send('mouseMoved', x0 + ((x1 - x0) * s) / 30, y0 + ((y1 - y0) * s) / 30 + Math.sin(s / 3) * 12, forceFrom + ((forceTo - forceFrom) * s) / 30);
  await send('mouseReleased', x1, y1, forceTo);
  await sleep(120);
}
// Undo then redo reloads the same strokes, which repaints the whole layer from scratch
async function fullRepaint() {
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await sleep(150);
  await page.keyboard.down('Control'); await page.keyboard.down('Shift'); await page.keyboard.press('z'); await page.keyboard.up('Shift'); await page.keyboard.up('Control');
  await sleep(200);
}
async function compare(name) {
  const incremental = await fingerprint();
  await fullRepaint();
  const full = await fingerprint();
  check(name, incremental === full && Number(full.split(':')[1]) > 0, `incremental ${incremental} vs full ${full}`);
}

try {
  await openPlayground(page);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());

  // Plain strokes crossing each other
  await drawStroke(page, [[200, 200], [400, 260], [300, 380], [520, 300]], { steps: 10 });
  await drawStroke(page, [[220, 360], [480, 180]], { steps: 10 });
  await compare('plain strokes: the same picture as a full repaint');

  // Pressure-sensitive pen ink over them
  await penLine(180, 300, 560, 320, 0.1, 0.95);
  await compare('pressure ink: the same picture as a full repaint');

  // Translucent ink (Pencil, Marker) blends with what is underneath, so order matters
  await clickTitle(page, 'Stroke & Canvas Settings');
  await clickText('Pencil');
  await sleep(100);
  await drawStroke(page, [[240, 180], [460, 400]], { steps: 10 });
  await clickText('Marker');
  await sleep(100);
  await drawStroke(page, [[200, 250], [540, 250]], { steps: 10 });
  await compare('translucent ink over other ink: the same picture as a full repaint');
  await clickText('Ballpoint');
  await clickTitle(page, 'Stroke & Canvas Settings');
  await sleep(100);

  // A snapped shape
  await page.keyboard.press('s');
  await drawStroke(page, [[700, 200], [900, 200], [900, 360], [700, 360], [700, 200]], { steps: 10 });
  await sleep(100);
  await compare('a snapped shape: the same picture as a full repaint');

  // Highlighter: goes beneath the writing (this one always repaints)
  await page.keyboard.press('h');
  await drawStroke(page, [[190, 300], [560, 300]], { steps: 10 });
  await sleep(100);
  await compare('a highlighter mark under the ink: the same picture as a full repaint');
  await page.keyboard.press('p');

  // Zoomed and panned: new ink lands in the right place at the right size
  await page.keyboard.down('Control');
  for (let i = 0; i < 6; i++) { await page.mouse.wheel({ deltaY: -100 }); await sleep(20); }
  await page.keyboard.up('Control');
  for (let i = 0; i < 4; i++) { await page.mouse.wheel({ deltaX: 37, deltaY: 23 }); await sleep(20); }
  await sleep(200);
  await drawStroke(page, [[300, 300], [520, 420], [640, 280]], { steps: 10 });
  await penLine(260, 500, 700, 520, 0.2, 0.9);
  await compare('zoomed in and panned: the same picture as a full repaint');

  await page.keyboard.down('Control');
  for (let i = 0; i < 14; i++) { await page.mouse.wheel({ deltaY: 100 }); await sleep(20); }
  await page.keyboard.up('Control');
  await sleep(200);
  await drawStroke(page, [[500, 380], [620, 420]], { steps: 10 });
  await compare('zoomed far out: the same picture as a full repaint');

  // Skipping off-screen ink never changes what is on screen. The same page is shown twice: once as
  // saved, and once with every stroke given a box so large that nothing is ever skipped.
  const views = [
    ['at 100%', async () => {}],
    ['panned', async () => { for (let i = 0; i < 6; i++) { await page.mouse.wheel({ deltaX: 310, deltaY: 170 }); await sleep(20); } }],
    ['zoomed in on a corner', async () => { await page.mouse.move(900, 600); await page.keyboard.down('Control'); for (let i = 0; i < 12; i++) { await page.mouse.wheel({ deltaY: -100 }); await sleep(20); } await page.keyboard.up('Control'); }],
    ['panned while zoomed in', async () => { for (let i = 0; i < 5; i++) { await page.mouse.wheel({ deltaX: -260, deltaY: 140 }); await sleep(20); } }],
    ['zoomed far out', async () => { await page.keyboard.down('Control'); for (let i = 0; i < 40; i++) { await page.mouse.wheel({ deltaY: 100 }); await sleep(20); } await page.keyboard.up('Control'); }],
  ];
  const drawCalls = () => page.evaluate(() => window.__calls);
  async function tour(hugeBoxes) {
    await seedStrokes(page, 1500, { hugeBoxes });
    await page.goto('about:blank');
    await openPlayground(page);
    await sleep(1200);
    await page.evaluate(() => {
      window.__calls = 0;
      const proto = CanvasRenderingContext2D.prototype;
      for (const name of ['stroke', 'fill']) {
        const original = proto[name];
        proto[name] = function (...a) { if (this.canvas.classList.contains('z-10')) window.__calls++; return original.apply(this, a); };
      }
    });
    const seen = [];
    for (const [, go] of views) {
      await go();
      await sleep(250);
      await page.evaluate(() => { window.__calls = 0; });
      await page.mouse.wheel({ deltaX: 1, deltaY: 0 }); // one more repaint, counted
      await sleep(150);
      seen.push({ print: await fingerprint(), calls: await drawCalls() });
    }
    return seen;
  }
  const skipping = await tour(false);
  const drawingAll = await tour(true);
  for (let i = 0; i < views.length; i++) {
    const same = skipping[i].print === drawingAll[i].print;
    check(`skipping off-screen ink, ${views[i][0]}: the same picture as drawing everything`, same, `${skipping[i].print} vs ${drawingAll[i].print}`);
    results[results.length - 1].note = `${skipping[i].calls} strokes painted instead of ${drawingAll[i].calls}`;
  }
  check('zoomed in, most of the page is skipped', skipping[2].calls < drawingAll[2].calls / 10, `${skipping[2].calls} vs ${drawingAll[2].calls}`);
  check('zoomed far out, more of the page is drawn than at 100%', skipping[4].calls > skipping[0].calls * 3, `${skipping[4].calls} vs ${skipping[0].calls}`);
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 500));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? (r.note ? '   [' + r.note + ']' : '') : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} rendering checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
