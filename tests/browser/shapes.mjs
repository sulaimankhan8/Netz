import { launch, openPlayground, drawStroke, shot, inkPixels, sleep, clickTitle } from './lib.mjs';

// Shape tool in the real app: triangle, rectangle, circle, line; eraser hits a shape mid-edge; shapes are not recognised as writing.
const { browser, page, errors } = await launch();
const out = {};
const saved = () =>
  page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
    return ((s.pages && s.pages[0].strokes) || []).map((st) => st.shape || 'ink');
  });
try {
  await openPlayground(page);
  await clickTitle(page, 'Shape Tool');
  // wobbly triangle
  await drawStroke(page, [[300, 200], [382, 331], [221, 328], [298, 204]], { steps: 14 });
  // wobbly rectangle, started mid-edge
  await drawStroke(page, [[520, 204], [640, 198], [644, 300], [462, 304], [458, 202], [515, 201]], { steps: 14 });
  // circle
  const circle = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2 * 0.98; circle.push([800 + 60 * Math.cos(a), 250 + 60 * Math.sin(a)]); }
  await drawStroke(page, circle, { steps: 2 });
  // nearly level line
  await drawStroke(page, [[250, 420], [600, 427]], { steps: 20 });
  await sleep(300);
  out.shapes = await saved();
  await shot(page, 'shapes-1');
  const before = await inkPixels(page);

  // Erase by touching the MIDDLE of the rectangle's top edge (far from any corner)
  await clickTitle(page, 'Eraser');
  await drawStroke(page, [[550, 185], [550, 215]], { steps: 6 });
  await sleep(250);
  out.afterErase = await saved();
  out.eraseRemovedInk = (await inkPixels(page)) < before;

  // Lasso everything: shapes must not be sent to handwriting recognition
  await clickTitle(page, 'Lasso Select');
  await drawStroke(page, [[180, 150], [900, 150], [900, 470], [180, 470], [180, 155]], { steps: 12 });
  await sleep(1500);
  out.pillAfterLassoingShapes = await page.evaluate(() => document.querySelector('.z-30 .pointer-events-auto')?.innerText ?? '(no pill)');
} catch (e) {
  out.exception = String((e && e.stack) || e).slice(0, 500);
}
out.errors = errors.slice(0, 6);
console.log(JSON.stringify(out, null, 2));
await browser.close();
