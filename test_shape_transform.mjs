import {
  createShape, localToWorld, worldToLocal, worldToFrame, frameToWorld, shapeWorldBounds, boundsOfShapes,
  boxFromDrag, resizeShape, rotateShape, rotateBy, flipShape, moveShape, duplicateShape, adjustShape,
  lineEndpoints, moveLineEnd, snapLineAngle, hitTestShape, hitTestShapes, styleShape, shapeGeometry, isLineShape,
} from './src/app/(Primary.pages)/Playground/utils/shapes/shapeModel.js';
import { getGalleryItem } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeGallery.js';

/**
 * Editing shapes: coordinate spaces, drawing by drag, resizing from every handle (also when
 * rotated or mirrored), rotating, line end points, adjustment handles, and hit testing.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
const nearPt = (p, q, tol = 0.01) => near(p.x, q.x, tol) && near(p.y, q.y, tol);
const fmt = (p) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;

const rectItem = getGalleryItem('rect');
const base = createShape(rectItem, { x: 100, y: 100, w: 200, h: 100 });

// ── Coordinate spaces ────────────────────────────────────────────────────────
for (const variant of [
  { rot: 0 }, { rot: 30 }, { rot: 90, flipH: true }, { rot: 217, flipV: true }, { rot: 45, flipH: true, flipV: true },
]) {
  const s = { ...base, ...variant };
  const p = { x: 37, y: 81 };
  expect(`local -> world -> local is exact (${JSON.stringify(variant)})`, nearPt(worldToLocal(s, localToWorld(s, p)), p), fmt(worldToLocal(s, localToWorld(s, p))));
  expect(`frame -> world -> frame is exact (${JSON.stringify(variant)})`, nearPt(worldToFrame(s, frameToWorld(s, p)), p));
  expect(`the box centre does not move with rotation or flips (${JSON.stringify(variant)})`, nearPt(localToWorld(s, { x: 100, y: 50 }), { x: 200, y: 150 }));
}
expect('unrotated: local (0,0) is the top-left of the box', nearPt(localToWorld(base, { x: 0, y: 0 }), { x: 100, y: 100 }));
expect('mirrored left-right: local (0,0) is at the top-right', nearPt(localToWorld({ ...base, flipH: true }, { x: 0, y: 0 }), { x: 300, y: 100 }));
expect('rotated 90°: the top-left corner swings to the top-right of the centre', nearPt(localToWorld({ ...base, rot: 90 }, { x: 0, y: 0 }), { x: 250, y: 50 }), fmt(localToWorld({ ...base, rot: 90 }, { x: 0, y: 0 })));

// ── Bounds ───────────────────────────────────────────────────────────────────
let b = shapeWorldBounds(base);
expect('bounds of an unrotated rectangle are its box plus half the outline', near(b.minX, 100 - 0.665) && near(b.maxY, 200 + 0.665), JSON.stringify(b));
b = shapeWorldBounds({ ...base, rot: 90 });
expect('a rectangle rotated 90° is tall instead of wide', near(b.maxX - b.minX, 100 + 1.33) && near(b.maxY - b.minY, 200 + 1.33), JSON.stringify(b));
b = boundsOfShapes([base, moveShape(base, 500, 0)]);
expect('bounds of several shapes', near(b.maxX, 800.665), JSON.stringify(b));

// ── Drawing by drag or tap ───────────────────────────────────────────────────
let box = boxFromDrag(rectItem, { x: 10, y: 10 }, { x: 110, y: 60 });
expect('drag draws corner to corner', box.x === 10 && box.y === 10 && box.w === 100 && box.h === 50, JSON.stringify(box));
box = boxFromDrag(rectItem, { x: 110, y: 60 }, { x: 10, y: 10 });
expect('drag backwards draws the same box', box.x === 10 && box.y === 10 && box.w === 100 && box.h === 50, JSON.stringify(box));
box = boxFromDrag(rectItem, { x: 10, y: 10 }, { x: 110, y: 60 }, { keepRatio: true });
expect('Shift draws a square', box.w === 100 && box.h === 100, JSON.stringify(box));
box = boxFromDrag(rectItem, { x: 100, y: 100 }, { x: 130, y: 120 }, { fromCentre: true });
expect('Ctrl draws from the centre', box.x === 70 && box.y === 80 && box.w === 60 && box.h === 40, JSON.stringify(box));
box = boxFromDrag(getGalleryItem('ellipse'), { x: 500, y: 500 }, { x: 500, y: 500 }, { tapped: true });
expect('a tap inserts the default size centred on the tap', box.w === 120 && box.h === 120 && box.x === 440 && box.y === 440, JSON.stringify(box));
const lineItem = getGalleryItem('line-arrow');
box = boxFromDrag(lineItem, { x: 200, y: 100 }, { x: 100, y: 150 });
expect('a line drawn right-to-left and downwards is mirrored left-right only', box.flipH && !box.flipV && box.w === 100 && box.h === 50, JSON.stringify(box));
const line = createShape(lineItem, box);
let ends = lineEndpoints(line);
expect('the line starts where the drag began and ends where it stopped', nearPt(ends.start, { x: 200, y: 100 }) && nearPt(ends.end, { x: 100, y: 150 }), `${fmt(ends.start)} ${fmt(ends.end)}`);
const snapped = snapLineAngle({ x: 0, y: 0 }, { x: 100, y: 8 });
expect('Shift snaps a line to the nearest 15°', near(snapped.y, 0) && near(snapped.x, Math.hypot(100, 8)), fmt(snapped));

// ── Resize ───────────────────────────────────────────────────────────────────
let r = resizeShape(base, 'se', { x: 400, y: 260 });
expect('se handle: top-left stays, box grows to the pointer', r.x === 100 && r.y === 100 && r.w === 300 && r.h === 160, JSON.stringify([r.x, r.y, r.w, r.h]));
r = resizeShape(base, 'e', { x: 350, y: 999 });
expect('e handle changes only the width', r.w === 250 && r.h === 100 && r.y === 100, JSON.stringify([r.x, r.y, r.w, r.h]));
r = resizeShape(base, 'nw', { x: 50, y: 50 });
expect('nw handle: bottom-right stays', near(r.x + r.w, 300) && near(r.y + r.h, 200) && r.x === 50, JSON.stringify([r.x, r.y, r.w, r.h]));
r = resizeShape(base, 'e', { x: 40, y: 150 });
expect('dragging past the opposite edge mirrors the shape (as in Word)', r.flipH && near(r.x, 40) && near(r.w, 60), JSON.stringify([r.x, r.w, r.flipH]));
r = resizeShape(base, 'se', { x: 500, y: 150 }, { keepRatio: true });
expect('Shift keeps the proportions (2:1)', near(r.w / r.h, 2) && near(r.w, 400), JSON.stringify([r.w, r.h]));
r = resizeShape(base, 'se', { x: 350, y: 250 }, { fromCentre: true });
expect('Ctrl resizes about the centre', near(r.x + r.w / 2, 200) && near(r.y + r.h / 2, 150) && near(r.w, 300), JSON.stringify([r.x, r.y, r.w, r.h]));
r = resizeShape(base, 'se', { x: 100, y: 100 });
expect('a shape never shrinks to nothing', r.w >= 1 && r.h >= 1);

// Rotated shape: the opposite corner stays fixed on the page
const rotated = { ...base, rot: 30 };
const fixedBefore = frameToWorld(rotated, { x: 0, y: 0 });
const handleBefore = frameToWorld(rotated, { x: 200, y: 100 });
r = resizeShape(rotated, 'se', { x: handleBefore.x + 40, y: handleBefore.y + 25 });
const fixedAfter = frameToWorld(r, { x: 0, y: 0 });
expect('resizing a rotated shape keeps its opposite corner fixed', nearPt(fixedBefore, fixedAfter, 0.001), `${fmt(fixedBefore)} -> ${fmt(fixedAfter)}`);
expect('and keeps its rotation', r.rot === 30);
const handleAfter = frameToWorld(r, { x: r.w, y: r.h });
expect('the dragged corner follows the pointer', nearPt(handleAfter, { x: handleBefore.x + 40, y: handleBefore.y + 25 }, 0.001), `${fmt(handleAfter)}`);
const mirrored = { ...base, rot: 30, flipH: true };
const mFixed = frameToWorld(mirrored, { x: 0, y: 100 });
r = resizeShape(mirrored, 'ne', frameToWorld(mirrored, { x: 260, y: -20 }));
expect('a mirrored, rotated shape resizes the same way', nearPt(frameToWorld(r, { x: 0, y: r.h }), mFixed, 0.001) && r.flipH, fmt(frameToWorld(r, { x: 0, y: r.h })));

// ── Rotate, flip ─────────────────────────────────────────────────────────────
let t = rotateShape(base, { x: 300, y: 150 });
expect('pointer to the right of the centre turns the shape 90°', t.rot === 90, t.rot);
t = rotateShape(base, { x: 200, y: 40 });
expect('pointer straight above leaves it upright', t.rot === 0, t.rot);
t = rotateShape(base, { x: 260, y: 40 }, { step: 15 });
expect('Shift turns in 15° steps', t.rot % 15 === 0, t.rot);
t = rotateShape(base, { x: 300, y: 152 }, { magnet: 3 });
expect('touch: close to 90° snaps to 90°', t.rot === 90, t.rot);
t = rotateShape(base, { x: 300, y: 180 }, { magnet: 3 });
expect('but a clear angle is kept', t.rot > 100 && t.rot < 110, t.rot);
expect('Rotate Right 90° then Left 90° gives the start', rotateBy(rotateBy(base, 90), -90).rot === 0);
expect('Rotate Left 90° from upright gives 270°', rotateBy(base, -90).rot === 270);
expect('Flip Horizontal toggles', flipShape(flipShape(base, 'h'), 'h').flipH === false && flipShape(base, 'h').flipH === true);

// ── Move, duplicate, style ───────────────────────────────────────────────────
const moved = moveShape(base, 15, -5);
expect('move shifts the box only', moved.x === 115 && moved.y === 95 && moved.w === 200 && moved.id === base.id);
expect('moving never changes the original object', base.x === 100);
const copy = duplicateShape(base, 20, 20);
expect('a duplicate has a new id and an offset', copy.id !== base.id && copy.x === 120);
const recoloured = styleShape(base, { fill: { color: '#FF0000' } });
expect('styling merges into the fill', recoloured.fill.color === '#FF0000' && recoloured.fill.type === 'solid' && base.fill.color === '#4472C4');
const noFill = styleShape(base, { fill: { type: 'none' } });
expect('No Fill', noFill.fill.type === 'none');
expect('choosing a colour after No Fill brings the fill back', styleShape(noFill, { fill: { type: 'solid', color: '#00FF00' } }).fill.type === 'solid');

// ── Line end points ──────────────────────────────────────────────────────────
let l2 = moveLineEnd(line, 'end', { x: 300, y: 300 });
ends = lineEndpoints(l2);
expect('dragging a line end moves only that end', nearPt(ends.start, { x: 200, y: 100 }) && nearPt(ends.end, { x: 300, y: 300 }), `${fmt(ends.start)} ${fmt(ends.end)}`);
l2 = moveLineEnd(line, 'start', { x: 50, y: 50 });
ends = lineEndpoints(l2);
expect('dragging the start end keeps the other', nearPt(ends.start, { x: 50, y: 50 }) && nearPt(ends.end, { x: 100, y: 150 }), `${fmt(ends.start)} ${fmt(ends.end)}`);
l2 = moveLineEnd(line, 'end', { x: 300, y: 104 }, { snap: true });
ends = lineEndpoints(l2);
expect('Shift on a line end snaps to 15° steps', near(ends.end.y, 100, 0.01), fmt(ends.end));
expect('line presets are recognised', isLineShape(line) && !isLineShape(base));

// ── Adjustment handle in world coordinates (rotated, mirrored) ───────────────
const rr = { ...createShape(getGalleryItem('roundRect'), { x: 0, y: 0, w: 100, h: 50 }), rot: 90, flipH: true };
const target = localToWorld(rr, { x: 20, y: 0 });
const adjusted = adjustShape(rr, 0, target);
expect('the yellow handle works on a rotated, mirrored shape', Math.abs(adjusted.adj.adj - 40000) < 100, JSON.stringify(adjusted.adj));
const handle = shapeGeometry(adjusted).handles[0];
expect('and the handle ends up under the pointer', nearPt(localToWorld(adjusted, handle), target, 0.2), fmt(localToWorld(adjusted, handle)));

// ── Hit testing ──────────────────────────────────────────────────────────────
expect('a filled shape is hit inside', hitTestShape(base, { x: 200, y: 150 }));
expect('and not outside', !hitTestShape(base, { x: 350, y: 150 }));
const outline = styleShape(base, { fill: { type: 'none' } });
expect('a shape without fill is not hit in its middle (as in Word)', !hitTestShape(outline, { x: 200, y: 150 }));
expect('but is hit on its outline', hitTestShape(outline, { x: 103, y: 150 }));
expect('within the tolerance', hitTestShape(outline, { x: 95, y: 150 }, 6) && !hitTestShape(outline, { x: 90, y: 150 }, 6));
const tilted = { ...base, rot: 45 };
// (290, 110) is inside the upright box's top-right corner, which turns away at 45°
expect('rotated shapes are hit where they are drawn', hitTestShape(tilted, { x: 200, y: 100 }) && !hitTestShape(tilted, { x: 290, y: 110 }) && hitTestShape(base, { x: 290, y: 110 }));
expect('a line is hit near it', hitTestShape(line, { x: 150, y: 127 }) && !hitTestShape(line, { x: 150, y: 100 }));
const ellipse = createShape(getGalleryItem('ellipse'), { x: 0, y: 0, w: 100, h: 100 });
expect('an oval is not hit in its box corner', !hitTestShape(ellipse, { x: 5, y: 5 }) && hitTestShape(ellipse, { x: 50, y: 50 }));
const donut = createShape(getGalleryItem('donut'), { x: 0, y: 0, w: 100, h: 100 });
expect('the hole of a hollow circle is not part of it', !hitTestShape(donut, { x: 50, y: 50 }, 0) && hitTestShape(donut, { x: 50, y: 8 }, 0));
const textBox = createShape(getGalleryItem('textbox'), { x: 0, y: 0, w: 200, h: 60 });
expect('a text box (no fill, no outline) is hit anywhere inside', hitTestShape(textBox, { x: 100, y: 30 }));
const top = moveShape(base, 50, 0);
expect('the topmost of overlapping shapes wins', hitTestShapes([base, top], { x: 260, y: 150 }).id === top.id && hitTestShapes([base, top], { x: 120, y: 150 }).id === base.id);
expect('empty page: no hit', hitTestShapes([base], { x: -500, y: -500 }) === null);

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
