import { recognizeAndSnapShape } from './src/app/(Primary.pages)/Playground/utils/shapeRecognizer.js';

/**
 * Hand-drawn-looking shapes (wobbly, not quite closed, started anywhere on the outline)
 * must snap to the right shape; ordinary writing strokes must not snap at all.
 */

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bboxOf(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

/** Walks a polygon's outline with jitter. startFraction moves the start along the first edge; gap leaves it unclosed. */
function drawPolygon(vertices, rand, { jitter = 1.5, startFraction = 0, gap = 0, closed = true } = {}) {
  const dense = [];
  const count = closed ? vertices.length : vertices.length - 1;
  for (let i = 0; i < count; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const steps = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 4));
    for (let s = 0; s < steps; s++) dense.push({ x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps });
  }
  if (!closed) dense.push(vertices[vertices.length - 1]);
  let path = dense;
  if (closed) {
    const offset = Math.floor(startFraction * dense.length) % dense.length;
    path = dense.slice(offset).concat(dense.slice(0, offset));
    path = path.slice(0, Math.max(5, Math.round(path.length * (1 - gap))));
  }
  return path.map((p, i) => ({ x: p.x + (rand() - 0.5) * 2 * jitter, y: p.y + (rand() - 0.5) * 2 * jitter, pressure: 0.5, timestamp: 1000 + i * 8 }));
}

function drawEllipse(cx, cy, rx, ry, rand, { jitter = 1.5, gap = 0.03, start = 0 } = {}) {
  const n = Math.round((Math.PI * (rx + ry)) / 4);
  const pts = [];
  for (let i = 0; i < Math.round(n * (1 - gap)); i++) {
    const a = start + (i / n) * Math.PI * 2;
    pts.push({ x: cx + rx * Math.cos(a) + (rand() - 0.5) * 2 * jitter, y: cy + ry * Math.sin(a) + (rand() - 0.5) * 2 * jitter, pressure: 0.5, timestamp: 1000 + i * 8 });
  }
  return pts;
}

const rotate = (pts, deg, cx, cy) => {
  const r = (deg * Math.PI) / 180;
  return pts.map((p) => ({ x: cx + (p.x - cx) * Math.cos(r) - (p.y - cy) * Math.sin(r), y: cy + (p.x - cx) * Math.sin(r) + (p.y - cy) * Math.cos(r) }));
};

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const snap = (points) => recognizeAndSnapShape(points, bboxOf(points));

for (let seed = 1; seed <= 12; seed++) {
  const rand = mulberry32(seed);
  const scale = 0.6 + rand() * 2.4; // small to large shapes
  const s = (v) => v * scale;
  const opts = { startFraction: rand(), gap: rand() * 0.04, jitter: 1 + rand() };

  // Rectangle
  let r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 100 + s(160), y: 100 }, { x: 100 + s(160), y: 100 + s(90) }, { x: 100, y: 100 + s(90) }], rand, opts));
  expect(`seed ${seed}: rectangle`, r.isSnapped && r.shape === 'rectangle' && r.corners.length === 4, `(${r.shape})`);
  if (r.corners) {
    const xs = new Set(r.corners.map((c) => Math.round(c.x)));
    const ys = new Set(r.corners.map((c) => Math.round(c.y)));
    expect(`seed ${seed}: rectangle corners are square to the axes`, xs.size === 2 && ys.size === 2);
  }

  // Square
  r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 100 + s(120), y: 100 }, { x: 100 + s(120), y: 100 + s(120) }, { x: 100, y: 100 + s(120) }], rand, opts));
  expect(`seed ${seed}: square`, r.isSnapped && (r.shape === 'square' || r.shape === 'rectangle'), `(${r.shape})`);

  // Triangle (must NOT become a rectangle)
  r = snap(drawPolygon([{ x: 100 + s(80), y: 100 }, { x: 100 + s(160), y: 100 + s(130) }, { x: 100, y: 100 + s(130) }], rand, opts));
  expect(`seed ${seed}: triangle`, r.isSnapped && r.shape === 'triangle' && r.corners.length === 3, `(${r.shape}, ${r.corners ? r.corners.length : 0} corners)`);

  // Right-angled triangle
  r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 100, y: 100 + s(120) }, { x: 100 + s(170), y: 100 + s(120) }], rand, opts));
  expect(`seed ${seed}: right triangle`, r.isSnapped && r.shape === 'triangle', `(${r.shape})`);

  // Diamond (a square turned 45 degrees): four corners, not forced onto the axes
  const sq = [{ x: 200, y: 200 }, { x: 200 + s(110), y: 200 }, { x: 200 + s(110), y: 200 + s(110) }, { x: 200, y: 200 + s(110) }];
  r = snap(drawPolygon(rotate(sq, 45, 200 + s(55), 200 + s(55)), rand, opts));
  expect(`seed ${seed}: diamond keeps four slanted sides`, r.isSnapped && r.shape === 'quadrilateral' && r.corners.length === 4, `(${r.shape})`);

  // Circle and ellipse
  r = snap(drawEllipse(300, 300, s(70), s(70), rand, { start: rand() * 6, jitter: opts.jitter }));
  expect(`seed ${seed}: circle`, r.isSnapped && r.shape === 'circle', `(${r.shape})`);
  r = snap(drawEllipse(300, 300, s(110), s(55), rand, { start: rand() * 6, jitter: opts.jitter }));
  expect(`seed ${seed}: ellipse`, r.isSnapped && r.shape === 'ellipse', `(${r.shape})`);

  // Lines
  r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 100 + s(200), y: 100 + s(120) }], rand, { closed: false, jitter: 1 }));
  expect(`seed ${seed}: slanted line`, r.isSnapped && r.shape === 'line', `(${r.shape})`);
  if (r.corners) expect(`seed ${seed}: slanted line stays slanted`, Math.abs(r.corners[1].y - r.corners[0].y) > s(60));

  r = snap(drawPolygon([{ x: 100, y: 200 }, { x: 100 + s(220), y: 200 + s(8) }], rand, { closed: false, jitter: 1 }));
  expect(`seed ${seed}: nearly level line snaps level`, r.isSnapped && r.shape === 'line' && r.corners[0].y === r.corners[1].y, `(${r.shape})`);

  r = snap(drawPolygon([{ x: 200, y: 100 }, { x: 200 + s(6), y: 100 + s(200) }], rand, { closed: false, jitter: 1 }));
  expect(`seed ${seed}: nearly upright line snaps upright`, r.isSnapped && r.shape === 'line' && r.corners[0].x === r.corners[1].x, `(${r.shape})`);

  // A short line that climbs steeply must not be flattened (the old rule used a fixed 12 px)
  r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 130, y: 110 }], rand, { closed: false, jitter: 0.3 }));
  expect(`seed ${seed}: short diagonal line is not flattened`, r.isSnapped && r.shape === 'line' && r.corners[0].y !== r.corners[1].y, `(${r.shape})`);

  // Outline points are dense enough for the eraser and lasso to hit an edge anywhere
  r = snap(drawPolygon([{ x: 100, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 300 }, { x: 100, y: 300 }], rand, opts));
  if (r.points) {
    let maxGap = 0;
    for (let i = 1; i < r.points.length; i++) maxGap = Math.max(maxGap, Math.hypot(r.points[i].x - r.points[i - 1].x, r.points[i].y - r.points[i - 1].y));
    expect(`seed ${seed}: outline points no more than 8 px apart`, maxGap <= 8, `(${maxGap.toFixed(1)})`);
    const first = r.points[0];
    const last = r.points[r.points.length - 1];
    expect(`seed ${seed}: closed shape ends where it starts`, first.x === last.x && first.y === last.y);
  }

  // Not shapes: an open curve, a wavy line, a "C"
  const wave = [];
  for (let i = 0; i <= 60; i++) wave.push({ x: 100 + i * s(4), y: 200 + Math.sin(i / 5) * s(30), pressure: 0.5, timestamp: i * 8 });
  expect(`seed ${seed}: wavy line is left alone`, snap(wave).isSnapped === false);
  const arc = drawEllipse(300, 300, s(60), s(60), rand, { gap: 0.4, start: 0.5 });
  expect(`seed ${seed}: open "C" arc is left alone`, snap(arc).isSnapped === false);
}

expect('too few points: left alone', recognizeAndSnapShape([{ x: 1, y: 1 }, { x: 2, y: 2 }], { minX: 1, minY: 1, maxX: 2, maxY: 2 }).isSnapped === false);
const dotScribble = Array.from({ length: 12 }, (_, i) => ({ x: 100 + (i % 3), y: 100 + (i % 2), pressure: 0.5, timestamp: i }));
expect('tiny scribble: left alone', snap(dotScribble).isSnapped === false);

if (failed > 0) {
  console.error(`\n ${failed}/${checks} shape checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} shape checks passed!`);
