import { launch, openPlayground, drawStroke, sleep, clickTitle, shot, withToolOptions, setPenWidth } from './lib.mjs';

const { browser, page, errors } = await launch();
const client = await page.createCDPSession();
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: String(detail) });
const saved = () => page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP') || '{}');
  return ((s.pages && s.pages[0].strokes) || []).map((st) => ({
    tool: st.tool, color: st.color, width: st.width, opacity: st.opacity, hasPressure: st.hasPressure,
    tilt: st.points.some((p) => p.tiltX || p.tiltY), n: st.points.length,
  }));
});
// Thickness of the ink at a column: number of inked pixels in a vertical strip
const thicknessAt = (x, y0, y1) => page.evaluate(({ x, y0, y1 }) => {
  const c = document.querySelector('canvas.z-10');
  const d = c.getContext('2d').getImageData(x, y0, 1, y1 - y0).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++;
  return n;
}, { x, y0, y1 });
const pixelAlpha = (x, y) => page.evaluate(({ x, y }) => document.querySelector('canvas.z-10').getContext('2d').getImageData(x, y, 1, 1).data[3], { x, y });
const clickText = (text) => page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === t).click(), text);

// A pen stroke whose pressure rises from light to hard along a horizontal line
async function penLine(x0, x1, y, forceFrom, forceTo, tilt = 0) {
  const send = (type, x, force) => client.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'pen', force, tiltX: tilt, tiltY: 0 });
  await send('mousePressed', x0, forceFrom);
  const steps = 40;
  for (let s = 1; s <= steps; s++) await send('mouseMoved', x0 + ((x1 - x0) * s) / steps, forceFrom + ((forceTo - forceFrom) * s) / steps);
  await send('mouseReleased', x1, forceTo);
  await sleep(200);
}

try {
  await openPlayground(page);
  await withToolOptions(page, () => setPenWidth(page, 8)); // 8 px, so thickness differences are easy to measure

  // Pressure
  await penLine(300, 700, 250, 0.1, 0.95, 30);
  let s = await saved();
  check('a pen stroke with varying pressure is marked pressure-sensitive', s[0].hasPressure === true, JSON.stringify(s[0]));
  check('pen tilt is recorded with the stroke', s[0].tilt === true);
  const thin = await thicknessAt(330, 230, 270);
  const thick = await thicknessAt(670, 230, 270);
  check('the line is thin where the press was light and thick where it was hard', thick >= thin * 2 && thin >= 2, `light ${thin}px, hard ${thick}px`);

  // A mouse stroke stays uniform
  await drawStroke(page, [[300, 320], [700, 320]], { steps: 20 });
  await sleep(150);
  s = await saved();
  check('a mouse stroke is not pressure-sensitive', !s[1].hasPressure);
  const m1 = await thicknessAt(330, 300, 340);
  const m2 = await thicknessAt(670, 300, 340);
  check('a mouse stroke has the same width along its length', Math.abs(m1 - m2) <= 1 && m1 >= 7, `${m1}px, ${m2}px`);

  // Presets differ
  await withToolOptions(page, () => clickText('Pencil'));
  await drawStroke(page, [[300, 390], [700, 390]], { steps: 20 });
  await sleep(150);
  s = await saved();
  check('Pencil preset: 3 px and 70% opaque', s[2].width === 3 && s[2].opacity === 0.7, JSON.stringify(s[2]));
  const pencilAlpha = await pixelAlpha(500, 390);
  check('Pencil ink is drawn translucent', pencilAlpha > 120 && pencilAlpha < 215, pencilAlpha);
  await withToolOptions(page, () => clickText('Marker'));
  await drawStroke(page, [[300, 450], [700, 450]], { steps: 20 });
  await sleep(150);
  s = await saved();
  check('Marker preset: 10 px and 85% opaque', s[3].width === 10 && s[3].opacity === 0.85, JSON.stringify(s[3]));
  await withToolOptions(page, () => clickText('Ballpoint'));
  await drawStroke(page, [[300, 500], [700, 500]], { steps: 20 });
  await sleep(150);
  s = await saved();
  check('Ballpoint preset: 2 px and fully opaque', s[4].width === 2 && s[4].opacity === undefined, JSON.stringify(s[4]));

  // Colours: black swatch and the custom picker
  await withToolOptions(page, () => page.evaluate(() => document.querySelector('button[aria-label="Black"]').click()));
  await drawStroke(page, [[300, 550], [700, 550]], { steps: 10 });
  await sleep(150);
  s = await saved();
  check('black is in the palette', s[5].color === '#18181B', s[5].color);
  await withToolOptions(page, () => page.evaluate(() => {
    const input = document.querySelector('input[type="color"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, '#12ab9c');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }));
  await drawStroke(page, [[300, 600], [700, 600]], { steps: 10 });
  await sleep(150);
  s = await saved();
  check('the colour picker sets any colour', s[6].color === '#12AB9C', s[6].color);

  // Highlighter goes under the ink
  await clickTitle(page, 'Highlighter');
  await drawStroke(page, [[300, 320], [700, 320]], { steps: 10 }); // over the 8 px mouse line
  await sleep(200);
  const inkPixel = await page.evaluate(() => [...document.querySelector('canvas.z-10').getContext('2d').getImageData(500, 320, 1, 1).data]);
  check('ink keeps its full colour under a highlighter stroke drawn later', inkPixel[0] === 59 && inkPixel[1] === 130 && inkPixel[2] === 246 && inkPixel[3] === 255, inkPixel.join(','));
  await shot(page, 'pen-final');
} catch (e) {
  check('script ran to the end', false, String((e && e.stack) || e).slice(0, 400));
}
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} pen checks passed | console errors: ${errors.length ? errors.slice(0, 4).join(' || ') : 'none'}`);
await browser.close();
