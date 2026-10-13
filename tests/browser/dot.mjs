import { launch, openPlayground, drawStroke, inkPixels, sleep } from './lib.mjs';

// A tap must leave a dot, and a stroke must start where the pen went down.
const { browser, page, errors } = await launch();
await openPlayground(page);
await page.mouse.click(400, 300);
await sleep(250);
const dot = await inkPixels(page);
await drawStroke(page, [[500, 300], [620, 300]]);
await sleep(250);
const saved = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return ((s.pages && s.pages[0].strokes) || []).map((st) => ({ points: st.points.length, firstX: st.points[0].x, firstY: st.points[0].y }));
});
console.log('ink pixels after one tap:', dot, dot > 0 ? '(dot drawn)' : '(NO DOT)');
console.log('saved strokes:', JSON.stringify(saved));
console.log('line starts at pen-down point (500,300):', saved[1] && saved[1].firstX === 500 && saved[1].firstY === 300);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
