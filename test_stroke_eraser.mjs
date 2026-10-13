import { eraseFromStroke, strokeTouchesCircle } from './src/app/(Primary.pages)/Playground/utils/strokeEraser.js';

/**
 * Partial eraser: only the part of a stroke under the eraser goes; the rest stays as strokes.
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

let idCounter = 0;
const makeId = (n) => `piece_${++idCounter}_${n}`;
const stroke = (points, extra = {}) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  return { id: 'orig', color: '#123456', width: 3, tool: 'pen', points, bbox: { minX, minY, maxX, maxY }, ...extra };
};
const pt = (x, y, pressure = 0.5, timestamp = 0) => ({ x, y, pressure, timestamp });
const nearestDistance = (pieces, x, y) => Math.min(...pieces.flatMap((p) => p.points.map((q) => Math.hypot(q.x - x, q.y - y))));

// A fast mouse line: only two points, 200 px apart
const line = stroke([pt(0, 0, 0.2, 0), pt(200, 0, 0.8, 1000)]);

expect('touch test: mid-segment counts even with no point nearby', strokeTouchesCircle(line, 100, 4, 10) === true);
expect('touch test: clearly off the line', strokeTouchesCircle(line, 100, 40, 10) === false);
expect('touch test: beyond the end', strokeTouchesCircle(line, 240, 0, 10) === false);

let pieces = eraseFromStroke(line, 100, 0, 10, makeId);
expect('erasing the middle of a line leaves two pieces', pieces && pieces.length === 2, `(${pieces ? pieces.length : 'null'})`);
if (pieces && pieces.length === 2) {
  const [a, b] = pieces;
  expect('left piece starts at the original start', a.points[0].x === 0);
  expect('right piece ends at the original end', b.points[b.points.length - 1].x === 200);
  expect('nothing is left inside the eraser', nearestDistance(pieces, 100, 0) > 10 + 1.5);
  expect('the gap is about the eraser width, not more', a.points[a.points.length - 1].x > 100 - 10 - 1.5 - 6 && b.points[0].x < 100 + 10 + 1.5 + 6, `(${a.points[a.points.length - 1].x} .. ${b.points[0].x})`);
  expect('pieces keep colour, width and tool', pieces.every((p) => p.color === '#123456' && p.width === 3 && p.tool === 'pen'));
  expect('pieces get new, distinct ids', a.id !== b.id && a.id !== 'orig' && b.id !== 'orig');
  expect('piece bounding boxes are their own', a.bbox.maxX < 100 && b.bbox.minX > 100);
  const mid = a.points[Math.floor(a.points.length / 2)];
  expect('pressure is interpolated along the line', mid.pressure > 0.2 && mid.pressure < 0.5, `(${mid.pressure})`);
  expect('timestamps are interpolated along the line', mid.timestamp > 0 && mid.timestamp < 500);
}

pieces = eraseFromStroke(line, 196, 0, 10, makeId);
expect('erasing the end of a line leaves one piece', pieces && pieces.length === 1 && pieces[0].points[0].x === 0, `(${pieces ? pieces.length : 'null'})`);

expect('a line the eraser does not reach is untouched', eraseFromStroke(line, 100, 60, 10, makeId) === null);
expect('the original stroke is never modified', line.points.length === 2 && line.id === 'orig');

// Dots and tiny strokes
const dot = stroke([pt(50, 50)]);
pieces = eraseFromStroke(dot, 52, 51, 8, makeId);
expect('a touched dot is removed entirely', Array.isArray(pieces) && pieces.length === 0);
expect('an untouched dot stays', eraseFromStroke(dot, 90, 90, 8, makeId) === null);

const small = stroke([pt(50, 50), pt(54, 52), pt(58, 50)]);
pieces = eraseFromStroke(small, 54, 51, 20, makeId);
expect('a stroke wholly inside the eraser is removed', Array.isArray(pieces) && pieces.length === 0);

// A snapped rectangle: closed outline with a shape flag
const rectPoints = [];
for (let x = 100; x < 300; x += 6) rectPoints.push(pt(x, 100));
for (let y = 100; y < 200; y += 6) rectPoints.push(pt(300, y));
for (let x = 300; x > 100; x -= 6) rectPoints.push(pt(x, 200));
for (let y = 200; y > 100; y -= 6) rectPoints.push(pt(100, y));
rectPoints.push(pt(100, 100));
const rect = stroke(rectPoints, { shape: 'rectangle' });
pieces = eraseFromStroke(rect, 200, 100, 12, makeId);
expect('erasing mid-edge of a rectangle opens it into two pieces', pieces && pieces.length === 2, `(${pieces ? pieces.length : 'null'})`);
expect('rectangle pieces keep the shape flag (sharp corners, not handwriting)', pieces && pieces.every((p) => p.shape === 'rectangle'));
expect('the rest of the rectangle survives', pieces && pieces.reduce((n, p) => n + p.points.length, 0) > rectPoints.length - 12);

// Sweeping across a zig-zag removes only the crossings
const zig = stroke([pt(0, 0), pt(50, 100), pt(100, 0), pt(150, 100), pt(200, 0)]);
let current = [zig];
for (let x = 0; x <= 200; x += 4) {
  const next = [];
  for (const s of current) {
    const result = eraseFromStroke(s, x, 50, 6, makeId);
    if (result === null) next.push(s); else next.push(...result);
  }
  current = next;
}
expect('a sweep through a zig-zag cuts it at each crossing', current.length === 5, `(${current.length} pieces)`);
expect('after the sweep nothing lies on the eraser path', current.every((s) => s.points.every((q) => Math.abs(q.y - 50) > 6)));

if (failed > 0) {
  console.error(`\n ${failed}/${checks} eraser checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} eraser checks passed!`);
