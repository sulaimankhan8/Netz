/**
 * Partial Stroke Eraser
 *
 * Rubs out only the part of a stroke the eraser passes over, leaving the rest as separate strokes
 * (the "pixel eraser" of Apple Notes and Samsung Notes, done on vector ink).
 *
 * Strokes are stored as points, and points can be far apart (a fast mouse line, a snapped shape),
 * so a stroke is first densified near the eraser: no gap between tested points is wider than half
 * the eraser radius. Points inside the eraser circle are removed and each surviving run of points
 * becomes its own stroke, keeping the original colour, width, tool and shape flag.
 */

function interpolatePoint(a, b, t) {
  const point = { ...a, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  if (typeof a.pressure === 'number' && typeof b.pressure === 'number') {
    point.pressure = a.pressure + (b.pressure - a.pressure) * t;
  }
  if (typeof a.timestamp === 'number' && typeof b.timestamp === 'number') {
    point.timestamp = a.timestamp + (b.timestamp - a.timestamp) * t;
  }
  return point;
}

function densify(points, maxGap) {
  if (points.length < 2) return points.slice();
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / maxGap);
    for (let s = 1; s < steps; s++) out.push(interpolatePoint(a, b, s / steps));
    out.push(b);
  }
  return out;
}

function bboxOf(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }
  return { minX, minY, maxX, maxY };
}

function distanceToSegment(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

/**
 * True when the eraser circle touches the stroke anywhere along its path (not only at its points).
 */
export function strokeTouchesCircle(stroke, x, y, radius) {
  const points = stroke.points || [];
  const reach = radius + (stroke.width || 3) / 2;
  const box = stroke.bbox;
  if (box && (x < box.minX - reach || x > box.maxX + reach || y < box.minY - reach || y > box.maxY + reach)) return false;
  if (points.length === 1) return Math.hypot(points[0].x - x, points[0].y - y) <= reach;
  for (let i = 1; i < points.length; i++) {
    if (distanceToSegment(x, y, points[i - 1], points[i]) <= reach) return true;
  }
  return false;
}

/**
 * Removes the part of a stroke inside the eraser circle.
 *
 * @param {Object} stroke - { id, points, width, color, tool, shape?, ... }
 * @param {number} x - Eraser centre (canvas coordinates)
 * @param {number} y
 * @param {number} radius - Eraser radius (canvas units)
 * @param {(index: number) => string} makeId - Supplies an ID for each surviving piece
 * @returns {Array<Object>|null} The surviving pieces (possibly empty), or null when the stroke was not touched
 */
export function eraseFromStroke(stroke, x, y, radius, makeId) {
  if (!strokeTouchesCircle(stroke, x, y, radius)) return null;

  const reach = radius + (stroke.width || 3) / 2;
  const dense = densify(stroke.points || [], Math.max(1, radius / 2));

  const pieces = [];
  let run = [];
  let removedAny = false;
  for (let i = 0; i < dense.length; i++) {
    if (Math.hypot(dense[i].x - x, dense[i].y - y) <= reach) {
      removedAny = true;
      if (run.length > 0) pieces.push(run);
      run = [];
    } else {
      run.push(dense[i]);
    }
  }
  if (run.length > 0) pieces.push(run);

  if (!removedAny) return null;

  return pieces
    // A leftover of one or two points next to the cut is shorter than the eraser itself: debris
    .filter((points) => points.length >= 3)
    .map((points, index) => ({
      ...stroke,
      id: makeId(index),
      points,
      bbox: bboxOf(points),
    }));
}
