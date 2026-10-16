import { register } from 'node:module';

// The Playground utils use extensionless relative imports (resolved by the Next.js bundler).
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (specifier.startsWith('.') && !/\\.[cm]?js$/.test(specifier)) {
            return next(specifier + '.js', context);
          }
          throw err;
        }
      }
    `)
);

const base = './src/app/(Primary.pages)/Playground/utils/';
const { createHistoryStack } = await import(base + 'historyStack.js');
const { zoomAtPoint, MIN_ZOOM, MAX_ZOOM, visibleWorldRect, boxTouchesRect, fitViewToBox } = await import(base + 'viewportMath.js');
const { extractExpressionFromLatex, generateGraphDatasetFromLatex, upsertCurveForSource } = await import(base + 'equationToGraph.js');
const { create, all } = await import('mathjs');
const math = create(all);

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const close = (a, b) => Math.abs(a - b) < 1e-6;

// ── Undo / redo history ──────────────────────────────────────────────────────
{
  const snap = (strokes, blocks = [], links = []) => ({ strokes, blocks, links });
  const empty = snap([]);
  const s1 = snap(['a']);
  const s2 = snap(['a', 'b']);
  const s3 = snap(['a', 'b', 'c']);

  const h = createHistoryStack(3);
  h.reset(empty);
  expect('history: nothing to undo at the start', !h.canUndo() && !h.canRedo());
  expect('history: commit records a step', h.commit(s1) === true && h.canUndo());
  expect('history: committing the same state again is ignored', h.commit(s1) === false);
  expect('history: two empty pages count as the same state', createHistoryStack().commit(empty) === true && (() => { const x = createHistoryStack(); x.reset(snap([])); return x.commit(snap([])) === false; })());
  h.commit(s2);
  expect('history: undo returns the previous state', h.undo() === s1 && h.canRedo());
  expect('history: redo returns the newer state', h.redo() === s2 && !h.canRedo());
  h.undo();
  expect('history: a new commit clears redo', h.commit(s3) === true && !h.canRedo());
  expect('history: undo walks back in order', h.undo() === s1 && h.undo() === empty && h.undo() === null);
  expect('history: undo past the start returns null and keeps the state', h.current() === empty);

  const capped = createHistoryStack(3);
  capped.reset(empty);
  for (let i = 1; i <= 10; i++) capped.commit(snap([i]));
  let steps = 0;
  while (capped.undo()) steps++;
  expect('history: limited to the configured number of steps', steps === 3, `(${steps})`);

  const blocksA = [{ id: 1 }];
  const hb = createHistoryStack();
  hb.reset(snap(['a'], blocksA));
  expect('history: a block change alone is a step', hb.commit(snap(['a'], [{ id: 1 }, { id: 2 }])) === true);
}

// ── Anchored zoom ────────────────────────────────────────────────────────────
{
  const canvasPointAt = (screen, pan, zoom) => ({ x: (screen.x - pan.x) / zoom, y: (screen.y - pan.y) / zoom });
  const anchor = { x: 640, y: 400 };
  let view = { pan: { x: 35, y: -120 }, zoom: 1 };
  const before = canvasPointAt(anchor, view.pan, view.zoom);
  for (const target of [1.2, 1.44, 3, 5, 0.5, 0.2, 1]) {
    view = zoomAtPoint(view.pan, view.zoom, target, anchor);
    const after = canvasPointAt(anchor, view.pan, view.zoom);
    expect(`zoom to ${target}: point under the anchor stays put`, close(before.x, after.x) && close(before.y, after.y), JSON.stringify(after));
  }
  expect('zoom: back at 100% the pan is what it was', close(view.pan.x, 35) && close(view.pan.y, -120), JSON.stringify(view.pan));
  expect('zoom: clamped at the maximum', zoomAtPoint({ x: 0, y: 0 }, 4, 99, anchor).zoom === MAX_ZOOM);
  expect('zoom: clamped at the minimum', zoomAtPoint({ x: 0, y: 0 }, 1, 0.001, anchor).zoom === MIN_ZOOM);
  const same = { x: 7, y: 9 };
  expect('zoom: no change returns the same pan', zoomAtPoint(same, 5, 9, anchor).pan === same);
}

// ── Equation -> graph conversion ─────────────────────────────────────────────
{
  // [latex, reference function, sample x values]
  const cases = [
    ['y = x^2 - 4x + 3', (x) => x * x - 4 * x + 3, [-2, 0, 1.5, 4]],
    ['y=2x+1', (x) => 2 * x + 1, [-1, 0, 3]],
    ['y=x(x+1)', (x) => x * (x + 1), [-2, 2]],
    ['y=(x+1)(x-1)', (x) => (x + 1) * (x - 1), [0, 3]],
    ['y=x^{2}', (x) => x * x, [-3, 2]],
    ['y=x^{2}+3x-4', (x) => x * x + 3 * x - 4, [-1, 2]],
    ['y=\\sin(x)', Math.sin, [0, 1, 2]],
    ['y=\\cos x', Math.cos, [0, 1]],
    ['y=\\sin 2x', (x) => Math.sin(2 * x), [0.5, 1]],
    ['y=3\\cos x+1', (x) => 3 * Math.cos(x) + 1, [0, 2]],
    ['y=\\ln x', Math.log, [2, 5]],
    ['y=\\sin^{2}(x)', (x) => Math.sin(x) ** 2, [0.5, 2]],
    ['y=\\sqrt{x}', Math.sqrt, [1, 4, 9]],
    ['y=\\sqrt[3]{x}', Math.cbrt, [1, 8]],
    ['y=\\frac{1}{x}', (x) => 1 / x, [1, 4]],
    ['y=e^{-x}', (x) => Math.exp(-x), [0, 1, 2]],
    ['y=\\ln(x)', Math.log, [1, 5]],
    ['y=|x|', Math.abs, [-3, 2]],
    ['y=2\\cdot x', (x) => 2 * x, [3]],
    ['y=\\pi x', (x) => Math.PI * x, [2]],
    // D10: \log is base 10, and its "10" must not be read as a number to multiply by
    ['y=\\log(x)', Math.log10, [1, 10, 50]],
    ['y=2\\log(x)', (x) => 2 * Math.log10(x), [10, 100]],
    // D11: nested structure in any combination
    ['y=\\frac{x^{2}}{4}', (x) => (x * x) / 4, [-2, 3]],
    ['y=\\frac{\\sqrt{x}}{2}', (x) => Math.sqrt(x) / 2, [4, 9]],
    ['y=\\sqrt{\\frac{x}{4}}', (x) => Math.sqrt(x / 4), [4, 16]],
    ['y=\\frac{1}{\\frac{1}{x}}', (x) => x, [2, 5]],
    ['y=\\frac{x^{2}+1}{x^{2}-9}', (x) => (x * x + 1) / (x * x - 9), [0, 1, 5]],
    ['y=e^{\\frac{x}{2}}', (x) => Math.exp(x / 2), [0, 2]],
    ['y=x^{\\frac{1}{2}}', Math.sqrt, [4, 9]],
    ['y=\\frac{\\sin(x)}{x}', (x) => Math.sin(x) / x, [1, 2]],
  ];
  for (const [latex, reference, xs] of cases) {
    const expr = extractExpressionFromLatex(latex);
    let ok = true;
    let detail = `-> ${expr}`;
    try {
      const compiled = math.compile(expr);
      for (const x of xs) {
        const got = compiled.evaluate({ x, e: Math.E, pi: Math.PI });
        if (!(typeof got === 'number' && Math.abs(got - reference(x)) < 1e-9)) {
          ok = false;
          detail += ` | at x=${x} got ${got}, want ${reference(x)}`;
          break;
        }
      }
    } catch (err) {
      ok = false;
      detail += ` | ${err.message}`;
    }
    expect(`graph conversion: ${latex}`, ok, detail);
  }

  const plotted = generateGraphDatasetFromLatex('y=\\frac{x^{2}}{4}', 'f', [-10, 10], 0);
  expect('graph: nested fraction produces plottable points', plotted && plotted.data.filter((p) => p.y !== null).length === 401);
}

// ── Curves that follow an Equation Block ─────────────────────────────────────
{
  const first = upsertCurveForSource([], 'eq1', 'y=x^2');
  expect('curves: first curve is added and tagged', first.length === 1 && first[0].sourceBlockId === 'eq1');

  const manual = generateGraphDatasetFromLatex('y=\\sin(x)', 'y=sin(x)', [-10, 10], 1);
  const two = [...first, manual];
  const edited = upsertCurveForSource(two, 'eq1', 'y=x^3');
  expect('curves: editing the equation keeps the other curve', edited.length === 2 && edited[1] === manual);
  expect('curves: the equation curve is updated in place', edited[0].latex === 'y=x^3' && edited[0].sourceBlockId === 'eq1');
  expect('curves: the equation curve keeps its colour', edited[0].borderColor === first[0].borderColor);

  const hidden = upsertCurveForSource([{ ...first[0], hidden: true }], 'eq1', 'y=2x');
  expect('curves: a hidden curve stays hidden when edited', hidden[0].hidden === true);

  const second = upsertCurveForSource(edited, 'eq2', 'y=x+1');
  expect('curves: a second equation adds a third curve', second.length === 3 && second[2].sourceBlockId === 'eq2');
  expect('curves: a second equation gets its own colour', second[2].borderColor !== second[0].borderColor);

  const legacy = [generateGraphDatasetFromLatex('y=x', 'y=x', [-10, 10], 0)];
  const upgraded = upsertCurveForSource(legacy, 'eq1', 'y=2x');
  expect('curves: an old single-curve graph is updated, not doubled', upgraded.length === 1 && upgraded[0].sourceBlockId === 'eq1');

  expect('curves: an equation that cannot be plotted changes nothing', upsertCurveForSource(two, 'eq1', '\\alpha\\beta{') === null);
}

// ── What is on screen (off-screen ink is not drawn) ───────────────────────────
{
  let view = visibleWorldRect({ x: 0, y: 0 }, 1, 1280, 800);
  expect('view: at 100% with no pan the world rect is the screen', view.minX === 0 && view.minY === 0 && view.maxX === 1280 && view.maxY === 800);

  view = visibleWorldRect({ x: -500, y: -200 }, 1, 1280, 800);
  expect('view: panning moves the rect the other way', view.minX === 500 && view.minY === 200 && view.maxX === 1780 && view.maxY === 1000);

  view = visibleWorldRect({ x: 0, y: 0 }, 2, 1280, 800);
  expect('view: at 200% half as much world is visible', view.maxX === 640 && view.maxY === 400);

  view = visibleWorldRect({ x: 100, y: 50 }, 0.5, 1000, 600);
  expect('view: zoomed out with a pan', view.minX === -200 && view.minY === -100 && view.maxX === 1800 && view.maxY === 1100);

  // Every screen corner maps back into the rect, whatever the zoom and pan
  for (const [pan, zoom] of [[{ x: -333, y: 721 }, 0.2], [{ x: 4000, y: -2500 }, 3.17], [{ x: 12.5, y: -0.25 }, 5]]) {
    const r = visibleWorldRect(pan, zoom, 1280, 800);
    const ok = [[0, 0], [1280, 0], [0, 800], [1280, 800], [640, 400]].every(([sx, sy]) => {
      const wx = (sx - pan.x) / zoom;
      const wy = (sy - pan.y) / zoom;
      return wx >= r.minX - 1e-9 && wx <= r.maxX + 1e-9 && wy >= r.minY - 1e-9 && wy <= r.maxY + 1e-9;
    });
    expect(`view: every screen point is inside the rect at zoom ${zoom}`, ok);
  }

  const screen = { minX: 0, minY: 0, maxX: 1280, maxY: 800 };
  const box = (minX, minY, maxX, maxY) => ({ minX, minY, maxX, maxY });
  expect('visible: a box in the middle', boxTouchesRect(box(100, 100, 200, 200), screen));
  expect('visible: a box crossing the left edge', boxTouchesRect(box(-50, 100, 20, 200), screen));
  expect('visible: a box larger than the screen', boxTouchesRect(box(-5000, -5000, 5000, 5000), screen));
  expect('visible: a box touching the corner exactly', boxTouchesRect(box(1280, 800, 1300, 820), screen));
  expect('hidden: a box to the right', !boxTouchesRect(box(1300, 100, 1400, 200), screen));
  expect('hidden: a box above', !boxTouchesRect(box(100, -300, 200, -10), screen));
  expect('hidden: a box below', !boxTouchesRect(box(100, 810, 200, 900), screen));
  expect('hidden: a box to the left', !boxTouchesRect(box(-400, 100, -10, 200), screen));
  expect('hidden: off the corner, though inside both the row and the column bands separately', !boxTouchesRect(box(1300, 820, 1400, 900), screen));
  expect('margin: a thick stroke just off screen still counts', boxTouchesRect(box(1290, 100, 1400, 200), screen, 12));
  expect('margin: but not when further away than the margin', !boxTouchesRect(box(1300, 100, 1400, 200), screen, 12));
  expect('a dot (zero-size box) on screen is visible', boxTouchesRect(box(640, 400, 640, 400), screen));
  expect('a stroke without a box is always drawn', boxTouchesRect(undefined, screen) && boxTouchesRect(null, screen));
  expect('a box with a broken number is always drawn', boxTouchesRect(box(NaN, 0, 10, 10), screen) && boxTouchesRect({ minX: 1, minY: 2 }, screen) && boxTouchesRect(box(Infinity, 0, -Infinity, 0), screen));

  // Nothing visible is ever skipped: compare against a point-by-point test on random boxes
  let seed = 99;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let wronglyHidden = 0;
  let hidden = 0;
  for (let i = 0; i < 2000; i++) {
    const pan = { x: rand() * 6000 - 3000, y: rand() * 6000 - 3000 };
    const zoom = 0.2 + rand() * 4.8;
    const r = visibleWorldRect(pan, zoom, 1280, 800);
    const x = rand() * 8000 - 4000;
    const y = rand() * 8000 - 4000;
    const b = box(x, y, x + rand() * 300, y + rand() * 300);
    const touches = boxTouchesRect(b, r, 4);
    if (!touches) {
      hidden++;
      // Is any corner or the centre of the box on screen?
      const pts = [[b.minX, b.minY], [b.maxX, b.minY], [b.minX, b.maxY], [b.maxX, b.maxY], [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2]];
      if (pts.some(([wx, wy]) => { const sx = wx * zoom + pan.x; const sy = wy * zoom + pan.y; return sx >= 0 && sx <= 1280 && sy >= 0 && sy <= 800; })) wronglyHidden++;
    }
  }
  expect('2000 random views: no box with a point on screen is ever skipped', wronglyHidden === 0, `(${wronglyHidden} wrongly hidden)`);
  expect('2000 random views: off-screen boxes really are skipped', hidden > 500, `(${hidden} hidden)`);
}

// ── Fit to content (fitViewToBox) ─────────────────────────────────────────────
{
  const W = 1280, H = 800;
  const insets = { top: 72, bottom: 88 };
  const onScreen = (view, x, y) => ({ x: x * view.zoom + view.pan.x, y: y * view.zoom + view.pan.y });

  const empty = fitViewToBox(null, W, H, insets);
  expect('fit: an empty page goes back to 100%', empty.zoom === 1);

  // A large drawing: every corner ends up inside the free area, with the margin
  const big = { minX: -500, minY: -300, maxX: 3500, maxY: 2200 };
  const v1 = fitViewToBox(big, W, H, insets, { margin: 24, maxZoom: 2 });
  const tl = onScreen(v1, big.minX, big.minY);
  const br = onScreen(v1, big.maxX, big.maxY);
  expect('fit: a big drawing is zoomed out', v1.zoom < 1, `(zoom ${v1.zoom})`);
  expect('fit: its top-left corner is clear of the top bar', tl.x >= 23.9 && tl.y >= 72 + 23.9, `(${tl.x}, ${tl.y})`);
  expect('fit: its bottom-right corner is clear of the dock', br.x <= W - 23.9 && br.y <= H - 88 - 23.9, `(${br.x}, ${br.y})`);
  const cx = (tl.x + br.x) / 2;
  const cy = (tl.y + br.y) / 2;
  expect('fit: it is centred in the free area', Math.abs(cx - W / 2) < 1 && Math.abs(cy - (72 + (H - 72 - 88) / 2)) < 1, `(${cx}, ${cy})`);

  // A small drawing is not blown up past maxZoom
  const small = { minX: 10, minY: 10, maxX: 40, maxY: 30 };
  expect('fit: a tiny drawing stops at maxZoom', fitViewToBox(small, W, H, insets, { maxZoom: 2 }).zoom === 2);
  expect('fit: by default it stops at 100%', fitViewToBox(small, W, H, insets).zoom === 1);

  // A gigantic drawing is not zoomed out past MIN_ZOOM
  const huge = { minX: 0, minY: 0, maxX: 1e6, maxY: 1e6 };
  expect('fit: a gigantic drawing stops at MIN_ZOOM', fitViewToBox(huge, W, H, insets).zoom === MIN_ZOOM);

  // A box that is not made of numbers counts as empty
  expect('fit: a broken box counts as an empty page', fitViewToBox({ minX: NaN, minY: 0, maxX: 1, maxY: 1 }, W, H).zoom === 1);
}

if (failed > 0) {
  console.error(`\n ${failed}/${checks} canvas helper checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} canvas helper checks passed!`);
