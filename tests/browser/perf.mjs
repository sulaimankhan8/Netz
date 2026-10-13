import { launch, openPlayground, drawStroke, sleep, inkPixels, seedStrokes } from './lib.mjs';

// How much drawing work a large page costs: one more stroke, and moving around while zoomed in.
// Prints numbers; run before and after a rendering change to compare. `node perf.mjs 3000`
const STROKES = Number(process.argv[2] || 3000);
const { browser, page, errors } = await launch();
const out = { strokes: STROKES };
try {
  await openPlayground(page);
  // A page of handwriting-sized strokes spread over a 6000 x 4500 area (about 5 x 5 screens)
  await seedStrokes(page, STROKES);
  await page.goto('about:blank');

  // Count and time what is drawn on the committed-ink canvas
  await page.evaluateOnNewDocument(() => {
    window.__draw = { calls: 0, redraws: 0, ms: 0, t0: 0 };
    const isInk = (ctx) => ctx.canvas && ctx.canvas.classList && ctx.canvas.classList.contains('z-10');
    const proto = CanvasRenderingContext2D.prototype;
    const clearRect = proto.clearRect;
    proto.clearRect = function (...a) {
      if (isInk(this)) { window.__draw.redraws++; window.__draw.t0 = performance.now(); }
      return clearRect.apply(this, a);
    };
    for (const name of ['stroke', 'fill']) {
      const original = proto[name];
      proto[name] = function (...a) {
        const r = original.apply(this, a);
        if (isInk(this)) {
          window.__draw.calls++;
          if (window.__draw.t0) { window.__draw.ms += performance.now() - window.__draw.t0; window.__draw.t0 = performance.now(); }
        }
        return r;
      };
    }
  });
  await openPlayground(page);
  await sleep(1500);
  const reset = () => page.evaluate(() => { window.__draw.calls = 0; window.__draw.redraws = 0; window.__draw.ms = 0; window.__draw.t0 = 0; });
  const read = () => page.evaluate(() => ({ calls: window.__draw.calls, redraws: window.__draw.redraws, ms: Math.round(window.__draw.ms * 10) / 10 }));
  out.inkOnScreen = (await inkPixels(page)) > 0;

  // 1. One more stroke on the full page
  await reset();
  const t0 = Date.now();
  await drawStroke(page, [[400, 300], [520, 330], [600, 300]], { steps: 6 });
  await sleep(300);
  out.oneMoreStroke = { ...(await read()), wallMs: Date.now() - t0 - 300 };

  // 2. Twenty pans with the wheel at 100%
  await reset();
  for (let i = 0; i < 20; i++) { await page.mouse.wheel({ deltaX: 15, deltaY: 20 }); await sleep(30); }
  await sleep(200);
  out.twentyPansAt100 = await read();

  // 3. Zoom in to 300% and pan twenty times (most of the page is off screen)
  await page.keyboard.down('Control');
  for (let i = 0; i < 15; i++) { await page.mouse.wheel({ deltaY: -100 }); await sleep(20); }
  await page.keyboard.up('Control');
  await sleep(300);
  out.zoom = await page.evaluate(() => [...document.querySelectorAll('button[title]')].find((b) => b.title.startsWith('Reset Zoom'))?.innerText.trim());
  await reset();
  for (let i = 0; i < 20; i++) { await page.mouse.wheel({ deltaX: 15, deltaY: 20 }); await sleep(30); }
  await sleep(200);
  out.twentyPansZoomedIn = await read();
  out.inkPixelsZoomedIn = await inkPixels(page);
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 400);
}
out.errors = errors.slice(0, 4);
console.log(JSON.stringify(out, null, 1));
await browser.close();
