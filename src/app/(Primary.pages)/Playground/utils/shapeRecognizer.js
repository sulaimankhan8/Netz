/**
 * Geometric Shape Recognizer & Auto-Straightener
 * Inspired by Samsung Notes & Apple Notes "Hold to Snap Shape"
 *
 * Recognizes a freehand stroke as:
 * - Straight Line (snapped to horizontal / vertical when within a few degrees)
 * - Triangle
 * - Rectangle / Square (axis-aligned) or any other four-sided shape (diamond, parallelogram)
 * - Polygon with five or six corners
 * - Circle / Ellipse
 *
 * Every threshold is relative to the stroke's own size, so small and large shapes behave alike.
 * The returned points follow the shape's outline closely spaced (not only its corners), so the
 * eraser and the lasso, which test against stroke points, can hit a shape anywhere along its edges.
 */

const LINE_MAX_PATH_RATIO = 1.12; // path length / straight distance
const LINE_MAX_DEVIATION = 0.06; // max distance from the straight line, as a share of its length
const AXIS_SNAP_DEGREES = 6;
const CLOSED_MAX_GAP = 0.22; // start-to-end gap as a share of the bounding box diagonal
const CORNER_EPSILON = 0.06; // corner detection tolerance, as a share of the diagonal
const STRAIGHT_ANGLE_DEGREES = 155; // a "corner" flatter than this is not a corner
const ELLIPSE_MAX_ERROR = 0.18;
const POLYGON_MAX_ERROR = 0.07; // mean distance from the outline, as a share of the diagonal
const OUTLINE_SPACING = 6; // px between generated outline points
const ELLIPSE_SEGMENTS = 72;

function dist(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
  return total;
}

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return dist(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/**
 * Ramer-Douglas-Peucker simplification: keeps the points where the path changes direction.
 */
function simplify(points, epsilon) {
  if (points.length < 3) return points.slice();
  let maxDist = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = distanceToSegment(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= epsilon) return [first, last];
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return left.slice(0, -1).concat(right);
}

function interiorAngleDegrees(prev, corner, next) {
  const ax = prev.x - corner.x;
  const ay = prev.y - corner.y;
  const bx = next.x - corner.x;
  const by = next.y - corner.y;
  const cos = (ax * bx + ay * by) / (Math.max(Math.hypot(ax, ay), 1e-6) * Math.max(Math.hypot(bx, by), 1e-6));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/**
 * Corners of a closed stroke. The stroke may begin in the middle of an edge, so vertices that
 * are nearly straight (including the start point) and vertices too close together are dropped.
 */
function findCorners(points, diagonal) {
  // Rotate the loop to start at the point farthest from the centroid, which is always a corner
  // of a polygon, so the simplification is not anchored to an arbitrary mid-edge start point
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    cx += points[i].x;
    cy += points[i].y;
  }
  cx /= points.length;
  cy /= points.length;
  let startIdx = 0;
  let farthest = -1;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - cx, points[i].y - cy);
    if (d > farthest) {
      farthest = d;
      startIdx = i;
    }
  }
  const loop = points.slice(startIdx).concat(points.slice(0, startIdx + 1));

  let corners = simplify(loop, CORNER_EPSILON * diagonal).slice(0, -1);

  let changed = true;
  while (changed && corners.length > 3) {
    changed = false;
    for (let i = 0; i < corners.length; i++) {
      const prev = corners[(i - 1 + corners.length) % corners.length];
      const next = corners[(i + 1) % corners.length];
      const tooFlat = interiorAngleDegrees(prev, corners[i], next) > STRAIGHT_ANGLE_DEGREES;
      const tooClose = dist(corners[i], next) < 0.12 * diagonal;
      if (tooFlat || tooClose) {
        corners.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return corners;
}

/** Mean distance from the drawn points to the polygon's outline, as a share of the diagonal. */
function polygonError(points, corners, diagonal) {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    let best = Infinity;
    for (let c = 0; c < corners.length; c++) {
      const d = distanceToSegment(points[i], corners[c], corners[(c + 1) % corners.length]);
      if (d < best) best = d;
    }
    total += best;
  }
  return total / points.length / diagonal;
}

/** How far the drawn points are from the ellipse inscribed in the bounding box (0 = on it). */
function ellipseError(points, bbox) {
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const rx = Math.max((bbox.maxX - bbox.minX) / 2, 1);
  const ry = Math.max((bbox.maxY - bbox.minY) / 2, 1);
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const value = Math.pow((points[i].x - cx) / rx, 2) + Math.pow((points[i].y - cy) / ry, 2);
    total += Math.abs(value - 1);
  }
  return total / points.length;
}

function makePoint(x, y, timestamp) {
  return { x, y, pressure: 0.5, timestamp };
}

/** Closely spaced points along straight edges through the given vertices. */
function outlinePoints(vertices, closed, timestamp) {
  const out = [];
  const count = closed ? vertices.length : vertices.length - 1;
  for (let i = 0; i < count; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const steps = Math.max(1, Math.round(dist(a, b) / OUTLINE_SPACING));
    for (let s = 0; s < steps; s++) {
      out.push(makePoint(a.x + ((b.x - a.x) * s) / steps, a.y + ((b.y - a.y) * s) / steps, timestamp));
    }
  }
  const last = closed ? vertices[0] : vertices[vertices.length - 1];
  out.push(makePoint(last.x, last.y, timestamp));
  return out;
}

function isNearAxis(a, b) {
  const angle = Math.abs((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI) % 90;
  return Math.min(angle, 90 - angle) <= 14;
}

/**
 * Main shape snapping function.
 * Given raw stroke points and bounding box, detects if it matches a geometric primitive.
 *
 * @param {Array} points - Array of PointerPoint objects
 * @param {Object} bbox - BoundingBox
 * @returns {{ isSnapped: boolean, shape?: string, points?: Array, corners?: Array }}
 */
export function recognizeAndSnapShape(points, bbox) {
  if (!points || points.length < 5) return { isSnapped: false };

  const start = points[0];
  const end = points[points.length - 1];
  const timestamp = start.timestamp || Date.now();
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const diagonal = Math.hypot(width, height);
  if (diagonal < 12) return { isSnapped: false };

  const length = pathLength(points);
  const directDist = dist(start, end);

  // 1. Straight Line
  if (directDist >= 15 && length / directDist < LINE_MAX_PATH_RATIO) {
    let maxDeviation = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const d = distanceToSegment(points[i], start, end);
      if (d > maxDeviation) maxDeviation = d;
    }
    if (maxDeviation <= Math.max(4, LINE_MAX_DEVIATION * directDist)) {
      const finalEnd = { x: end.x, y: end.y };
      const angle = Math.abs((Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI);
      if (angle <= AXIS_SNAP_DEGREES || angle >= 180 - AXIS_SNAP_DEGREES) {
        finalEnd.y = start.y; // Perfect horizontal
      } else if (Math.abs(angle - 90) <= AXIS_SNAP_DEGREES) {
        finalEnd.x = start.x; // Perfect vertical
      }
      const vertices = [{ x: start.x, y: start.y }, finalEnd];
      return { isSnapped: true, shape: 'line', corners: vertices, points: outlinePoints(vertices, false, timestamp) };
    }
  }

  // 2. Closed Shapes
  if (directDist > CLOSED_MAX_GAP * diagonal) return { isSnapped: false };

  const ellipseFit = ellipseError(points, bbox);
  const corners = findCorners(points, diagonal);
  const polygonFit = corners.length >= 3 ? polygonError(points, corners, diagonal) : Infinity;

  // Circle / Ellipse: round outline, and no better explained by a few straight edges
  if (ellipseFit < ELLIPSE_MAX_ERROR && (corners.length > 4 || polygonFit > 0.02)) {
    const cx = (bbox.minX + bbox.maxX) / 2;
    const cy = (bbox.minY + bbox.maxY) / 2;
    let rx = width / 2;
    let ry = height / 2;
    const isCircle = Math.abs(rx - ry) / Math.max(rx, ry) < 0.2;
    if (isCircle) {
      rx = (rx + ry) / 2;
      ry = rx;
    }
    const ellipsePoints = [];
    for (let i = 0; i <= ELLIPSE_SEGMENTS; i++) {
      const angle = (i / ELLIPSE_SEGMENTS) * Math.PI * 2;
      ellipsePoints.push(makePoint(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle), timestamp));
    }
    return { isSnapped: true, shape: isCircle ? 'circle' : 'ellipse', points: ellipsePoints };
  }

  if (corners.length < 3 || corners.length > 6 || polygonFit > POLYGON_MAX_ERROR) {
    return { isSnapped: false };
  }

  let vertices = corners.map((c) => ({ x: c.x, y: c.y }));
  let shape = corners.length === 3 ? 'triangle' : corners.length === 4 ? 'quadrilateral' : 'polygon';

  // Four sides all close to horizontal / vertical: a true rectangle on the bounding box
  if (corners.length === 4 && corners.every((c, i) => isNearAxis(c, corners[(i + 1) % 4]))) {
    shape = Math.abs(width - height) / Math.max(width, height) < 0.12 ? 'square' : 'rectangle';
    vertices = [
      { x: bbox.minX, y: bbox.minY },
      { x: bbox.maxX, y: bbox.minY },
      { x: bbox.maxX, y: bbox.maxY },
      { x: bbox.minX, y: bbox.maxY },
    ];
  }

  return { isSnapped: true, shape, corners: vertices, points: outlinePoints(vertices, true, timestamp) };
}
