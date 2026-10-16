/**
 * Shape objects: creation, styles, geometry, and the transforms used while editing
 * (move, resize from any handle, rotate, flip, adjustment handles, line end points), plus
 * hit testing and bounds.
 *
 * A shape is a plain object (see PLAYGROUND_INSERT_TOOLS_PLAN.md, section 4.1):
 *   { id, preset, x, y, w, h, rot, flipH, flipV, adj, fill, line, text, lockRatio }
 * (x, y, w, h) is the box before rotation, in canvas (world) coordinates; rot is in degrees,
 * clockwise about the box centre. Like strokes, shapes are never changed in place: every
 * function here returns a new object, so undo history can share them by reference.
 *
 * Coordinate spaces:
 *   world  the page
 *   frame  the box's own axes (rotated with the shape), (0, 0) at its visual top-left
 *   local  frame, mirrored by the shape's flips: what the preset geometry is drawn in
 *
 * Pure functions with no browser dependencies, so they can be tested with Node.
 */

import { evaluatePreset, flattenSegments, geometryBounds, solveAdjustHandle, compactAdjust, segmentsToPathData } from './presetEvaluator.js';

const DEG = Math.PI / 180;

/** Presets drawn as a line between two points, edited by their end points. */
export const LINE_PRESETS = new Set([
  'line', 'lineInv', 'straightConnector1',
  'bentConnector2', 'bentConnector3', 'bentConnector4', 'bentConnector5',
  'curvedConnector2', 'curvedConnector3', 'curvedConnector4', 'curvedConnector5',
]);

/** Presets that are an outline by nature: Word inserts them without a fill. */
export const OUTLINE_ONLY_PRESETS = new Set(['arc', 'leftBracket', 'rightBracket', 'leftBrace', 'rightBrace', 'bracketPair', 'bracePair']);

// Word's default look: blue fill, darker blue outline, white text
export const DEFAULT_FILL = { type: 'solid', color: '#4472C4', alpha: 1 };
export const DEFAULT_OUTLINE = { type: 'solid', color: '#2F528F', width: 1.33, alpha: 1, dash: 'solid' };
export const DEFAULT_LINE = { type: 'solid', color: '#4472C4', width: 2, alpha: 1, dash: 'solid' };
export const DEFAULT_TEXT = { value: '', color: '#FFFFFF', size: 16, font: 'sans', bold: false, italic: false, underline: false, align: 'center', valign: 'middle' };

/** Outline dash styles, in the order of Word's Outline > Dashes menu (lengths in line widths). */
export const LINE_DASHES = [
  { id: 'solid', label: 'Solid', pattern: null },
  { id: 'roundDot', label: 'Round Dot', pattern: [0.01, 2], cap: 'round' },
  { id: 'sysDot', label: 'Square Dot', pattern: [1, 1] },
  { id: 'dash', label: 'Dash', pattern: [4, 3] },
  { id: 'dashDot', label: 'Dash Dot', pattern: [4, 3, 1, 3] },
  { id: 'lgDash', label: 'Long Dash', pattern: [8, 3] },
  { id: 'lgDashDot', label: 'Long Dash Dot', pattern: [8, 3, 1, 3] },
  { id: 'lgDashDotDot', label: 'Long Dash Dot Dot', pattern: [8, 3, 1, 3, 1, 3] },
];

let idCounter = 0;
export function newShapeId() {
  idCounter = (idCounter + 1) % 1679616;
  return `shape_${Date.now().toString(36)}_${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function isLineShape(shape) {
  return LINE_PRESETS.has(shape.preset);
}

export function hasFill(shape) {
  return Boolean(shape.fill && shape.fill.type !== 'none');
}

export function hasOutline(shape) {
  return Boolean(shape.line && shape.line.type !== 'none' && shape.line.width > 0);
}

/**
 * A new shape from a gallery item in a box.
 *
 * @param {Object} item - Gallery entry (shapeGallery.js)
 * @param {{ x: number, y: number, w: number, h: number, flipH?: boolean, flipV?: boolean }} box
 * @param {Object} [defaults] - The user's "Set as Default Shape" style ({ fill, line, text })
 */
export function createShape(item, box, defaults = null) {
  const line = LINE_PRESETS.has(item.preset);
  const outlineOnly = OUTLINE_ONLY_PRESETS.has(item.preset);
  let fill;
  let outline;
  let text = null;

  if (item.textBox) {
    // A text box grows with its text and takes the page's ink colour
    fill = { type: 'none' };
    outline = { type: 'none' };
    text = { ...DEFAULT_TEXT, color: 'auto', align: 'left', valign: 'top', autofit: 'resize' };
  } else if (line || outlineOnly) {
    fill = { type: 'none' };
    outline = { ...DEFAULT_LINE, ...(defaults && defaults.line && defaults.line.type !== 'none' ? { color: defaults.line.color, width: Math.max(defaults.line.width, 1) } : {}), ...(item.line || {}) };
  } else {
    fill = { ...DEFAULT_FILL, ...((defaults && defaults.fill) || {}) };
    outline = { ...DEFAULT_OUTLINE, ...((defaults && defaults.line) || {}) };
  }

  return {
    id: newShapeId(),
    preset: item.preset,
    x: box.x,
    y: box.y,
    w: Math.max(0, box.w),
    h: Math.max(0, box.h),
    rot: 0,
    flipH: Boolean(box.flipH),
    flipV: Boolean(box.flipV),
    adj: {},
    fill,
    line: outline,
    text: text || (defaults && defaults.text && !line ? { ...DEFAULT_TEXT, ...defaults.text, value: '' } : null),
    shadow: !item.textBox && !line && !outlineOnly && defaults && defaults.shadow ? { ...defaults.shadow } : null,
    ...(item.textBox ? { textBox: true } : {}),
  };
}

// ── Geometry (cached per shape object: shapes are immutable) ─────────────────

const geometryCache = new WeakMap();

/** The preset geometry at the shape's size, in local coordinates. */
export function shapeGeometry(shape) {
  let g = geometryCache.get(shape);
  if (!g) {
    g = shape.preset === 'freeform'
      ? freeformGeometry(shape)
      : evaluatePreset(shape.preset, Math.max(shape.w, 0), Math.max(shape.h, 0), shape.adj || {});
    geometryCache.set(shape, g);
  }
  return g;
}

/**
 * A freeform shape (ink turned into a shape with Convert to Shape): straight edges through its
 * `points`, kept as fractions of the box ([fx, fy]), closed unless `open`. Its corners are
 * its connection points.
 */
export function freeformGeometry(shape) {
  const pts = (shape.points || []).map(([fx, fy]) => ({ x: fx * shape.w, y: fy * shape.h }));
  const segs = pts.map((p, i) => ({ t: i ? 'L' : 'M', x: p.x, y: p.y }));
  if (!shape.open && segs.length > 2) segs.push({ t: 'Z' });
  return {
    paths: segs.length ? [{ d: segmentsToPathData(segs), segs, fill: shape.open ? 'none' : 'norm', stroke: true }] : [],
    textRect: { l: 0, t: 0, r: shape.w, b: shape.h },
    handles: [],
    connections: pts.map((p) => ({ x: p.x, y: p.y, angle: 0 })),
  };
}

function geometryRuns(g) {
  if (!g.runs) g.runs = g.paths.map((p) => flattenSegments(p.segs));
  return g.runs;
}

/**
 * The affine matrix [a, b, c, d, e, f] from local to world coordinates
 * (x' = a x + c y + e, y' = b x + d y + f): mirror by the flips, rotate about the box centre,
 * then move to the box position. SVG's matrix() and canvas transform() take the same six numbers.
 */
export function shapeMatrix(shape) {
  const cos = Math.cos((shape.rot || 0) * DEG);
  const sin = Math.sin((shape.rot || 0) * DEG);
  const fx = shape.flipH ? -1 : 1;
  const fy = shape.flipV ? -1 : 1;
  const tx = shape.flipH ? shape.w : 0;
  const ty = shape.flipV ? shape.h : 0;
  const cx = shape.w / 2;
  const cy = shape.h / 2;
  return [
    cos * fx,
    sin * fx,
    -sin * fy,
    cos * fy,
    shape.x + cx + cos * (tx - cx) - sin * (ty - cy),
    shape.y + cy + sin * (tx - cx) + cos * (ty - cy),
  ];
}

export function localToWorld(shape, p) {
  const [a, b, c, d, e, f] = shapeMatrix(shape);
  return { x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f };
}

export function worldToLocal(shape, p) {
  const [a, b, c, d, e, f] = shapeMatrix(shape);
  const det = a * d - b * c; // always +1 or -1: rotation and mirroring only
  const x = p.x - e;
  const y = p.y - f;
  return { x: (d * x - c * y) / det, y: (a * y - b * x) / det };
}

/** World to frame coordinates: like local, but ignoring the flips (the box's visual axes). */
export function worldToFrame(shape, p) {
  const cx = shape.x + shape.w / 2;
  const cy = shape.y + shape.h / 2;
  const cos = Math.cos(-(shape.rot || 0) * DEG);
  const sin = Math.sin(-(shape.rot || 0) * DEG);
  const dx = p.x - cx;
  const dy = p.y - cy;
  return { x: shape.w / 2 + dx * cos - dy * sin, y: shape.h / 2 + dx * sin + dy * cos };
}

export function frameToWorld(shape, p) {
  const cos = Math.cos((shape.rot || 0) * DEG);
  const sin = Math.sin((shape.rot || 0) * DEG);
  const dx = p.x - shape.w / 2;
  const dy = p.y - shape.h / 2;
  return { x: shape.x + shape.w / 2 + dx * cos - dy * sin, y: shape.y + shape.h / 2 + dx * sin + dy * cos };
}

export function shapeCentre(shape) {
  return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
}

/** How far arrowheads and the outline reach past the geometry (world units). */
export function outlineReach(shape) {
  if (!hasOutline(shape)) return 0;
  const width = shape.line.width;
  const hasArrow = (end) => end && end.type && end.type !== 'none';
  const arrows = hasArrow(shape.line.head) || hasArrow(shape.line.tail) ? arrowBase(width) * 5 : 0;
  return width / 2 + arrows;
}

/** Arrowhead size unit for a line width: arrowheads stay visible on thin lines. */
export function arrowBase(width) {
  return Math.max(width, 2.5);
}

const boundsCache = new WeakMap();

/** Axis-aligned box around everything the shape paints, in world coordinates. */
export function shapeWorldBounds(shape) {
  let box = boundsCache.get(shape);
  if (box) return box;
  const g = geometryBounds(shapeGeometry(shape));
  const minX = Math.min(0, g ? g.minX : 0);
  const minY = Math.min(0, g ? g.minY : 0);
  const maxX = Math.max(shape.w, g ? g.maxX : shape.w);
  const maxY = Math.max(shape.h, g ? g.maxY : shape.h);
  const corners = [
    localToWorld(shape, { x: minX, y: minY }),
    localToWorld(shape, { x: maxX, y: minY }),
    localToWorld(shape, { x: maxX, y: maxY }),
    localToWorld(shape, { x: minX, y: maxY }),
  ];
  const reach = outlineReach(shape);
  box = {
    minX: Math.min(...corners.map((c) => c.x)) - reach,
    minY: Math.min(...corners.map((c) => c.y)) - reach,
    maxX: Math.max(...corners.map((c) => c.x)) + reach,
    maxY: Math.max(...corners.map((c) => c.y)) + reach,
  };
  boundsCache.set(shape, box);
  return box;
}

/** Box around several shapes, or null. */
export function boundsOfShapes(shapes) {
  if (!shapes || shapes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of shapes) {
    const b = shapeWorldBounds(s);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }
  return { minX, minY, maxX, maxY };
}

// ── Creating by drag or tap ──────────────────────────────────────────────────

/** End point snapped so the line from start makes a multiple of `step` degrees. */
export function snapLineAngle(start, end, step = 15) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy);
  const angle = Math.round(Math.atan2(dy, dx) / (step * DEG)) * step * DEG;
  return { x: start.x + Math.cos(angle) * len, y: start.y + Math.sin(angle) * len };
}

/** The box of a line between two points, with the flips that make it run from start to end. */
export function lineBox(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    flipH: end.x < start.x,
    flipV: end.y < start.y,
  };
}

/**
 * The box for a shape being drawn from `start` to `end`, as in Word:
 * Shift (keepRatio) draws equal width and height, or a line at 15° steps; Ctrl (fromCentre)
 * draws outwards from the starting point. A tap gives the item's own size, centred on the tap.
 */
export function boxFromDrag(item, start, end, { keepRatio = false, fromCentre = false, tapped = false } = {}) {
  const line = LINE_PRESETS.has(item.preset);
  if (tapped) {
    const size = item.size || { w: 120, h: 120 };
    if (line) return lineBox({ x: start.x - size.w / 2, y: start.y - size.h / 2 }, { x: start.x + size.w / 2, y: start.y + size.h / 2 });
    return { x: start.x - size.w / 2, y: start.y - size.h / 2, w: size.w, h: size.h, flipH: false, flipV: false };
  }

  if (line) {
    const to = keepRatio ? snapLineAngle(start, end) : end;
    const from = fromCentre ? { x: 2 * start.x - to.x, y: 2 * start.y - to.y } : start;
    return lineBox(from, to);
  }

  let dx = end.x - start.x;
  let dy = end.y - start.y;
  if (keepRatio) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * side;
    dy = Math.sign(dy || 1) * side;
  }
  if (fromCentre) {
    return { x: start.x - Math.abs(dx), y: start.y - Math.abs(dy), w: 2 * Math.abs(dx), h: 2 * Math.abs(dy), flipH: false, flipV: false };
  }
  return { x: Math.min(start.x, start.x + dx), y: Math.min(start.y, start.y + dy), w: Math.abs(dx), h: Math.abs(dy), flipH: false, flipV: false };
}

// ── Editing ──────────────────────────────────────────────────────────────────

export function moveShape(shape, dx, dy) {
  return { ...shape, x: shape.x + dx, y: shape.y + dy };
}

export function duplicateShape(shape, dx, dy) {
  return { ...moveShape(shape, dx, dy), id: newShapeId() };
}

/** Resize handles: where each sits on the box, as fractions of width and height. */
export const RESIZE_HANDLES = {
  nw: [0, 0], n: [0.5, 0], ne: [1, 0], e: [1, 0.5], se: [1, 1], s: [0.5, 1], sw: [0, 1], w: [0, 0.5],
};

const MIN_SIZE = 1;

/**
 * Resizes from a handle dragged to a world point. The opposite handle stays where it is
 * (or the centre, with fromCentre), also on a rotated shape. Dragging past the opposite edge
 * mirrors the shape, as Word does. Outline width is not changed.
 *
 * @param {Object} start - The shape as it was when the drag began
 * @param {string} handle - Key of RESIZE_HANDLES
 */
export function resizeShape(start, handle, point, { keepRatio = false, fromCentre = false } = {}) {
  const [hx, hy] = RESIZE_HANDLES[handle];
  const q = worldToFrame(start, point);
  const w0 = start.w;
  const h0 = start.h;
  const ax = fromCentre ? w0 / 2 : (1 - hx) * w0;
  const ay = fromCentre ? h0 / 2 : (1 - hy) * h0;

  let x0 = 0, x1 = w0, y0 = 0, y1 = h0;
  let mirrorX = false;
  let mirrorY = false;
  if (hx !== 0.5) {
    mirrorX = hx === 1 ? q.x < ax : q.x > ax;
    const reach = Math.abs(q.x - ax);
    if (fromCentre) { x0 = ax - reach; x1 = ax + reach; }
    else { x0 = Math.min(ax, q.x); x1 = Math.max(ax, q.x); }
  }
  if (hy !== 0.5) {
    mirrorY = hy === 1 ? q.y < ay : q.y > ay;
    const reach = Math.abs(q.y - ay);
    if (fromCentre) { y0 = ay - reach; y1 = ay + reach; }
    else { y0 = Math.min(ay, q.y); y1 = Math.max(ay, q.y); }
  }

  let w = x1 - x0;
  let h = y1 - y0;
  if (keepRatio && w0 > 0 && h0 > 0) {
    if (hx !== 0.5 && hy !== 0.5) {
      const scale = Math.max(w / w0, h / h0);
      w = w0 * scale;
      h = h0 * scale;
      if (fromCentre) {
        x0 = ax - w / 2;
        y0 = ay - h / 2;
      } else {
        x0 = q.x >= ax ? ax : ax - w;
        y0 = q.y >= ay ? ay : ay - h;
      }
    } else if (hx !== 0.5) {
      h = h0 * (w / w0);
      y0 = h0 / 2 - h / 2;
    } else {
      w = w0 * (h / h0);
      x0 = w0 / 2 - w / 2;
    }
    x1 = x0 + w;
    y1 = y0 + h;
  }
  if (w < MIN_SIZE) {
    const mid = (x0 + x1) / 2;
    x0 = mid - MIN_SIZE / 2;
    x1 = mid + MIN_SIZE / 2;
    w = MIN_SIZE;
  }
  if (h < MIN_SIZE) {
    const mid = (y0 + y1) / 2;
    y0 = mid - MIN_SIZE / 2;
    y1 = mid + MIN_SIZE / 2;
    h = MIN_SIZE;
  }

  const centre = frameToWorld(start, { x: (x0 + x1) / 2, y: (y0 + y1) / 2 });
  return {
    ...start,
    x: centre.x - w / 2,
    y: centre.y - h / 2,
    w,
    h,
    flipH: start.flipH !== mirrorX,
    flipV: start.flipV !== mirrorY,
  };
}

/**
 * Rotates so the rotate handle (above the top edge) points at the world point.
 * step: snap to multiples of it (Shift: 15). magnet: degrees within which 0, 45, 90... attract.
 */
export function rotateShape(start, point, { step = 0, magnet = 0 } = {}) {
  const c = shapeCentre(start);
  let deg = Math.atan2(point.y - c.y, point.x - c.x) / DEG + 90;
  if (step) {
    deg = Math.round(deg / step) * step;
  } else if (magnet) {
    const near = Math.round(deg / 45) * 45;
    if (Math.abs(deg - near) <= magnet) deg = near;
  }
  deg = ((deg % 360) + 360) % 360;
  return { ...start, rot: Math.round(deg * 10) / 10 };
}

/** Rotates by a fixed amount (Rotate Right 90°: +90). */
export function rotateBy(shape, degrees) {
  const deg = ((((shape.rot || 0) + degrees) % 360) + 360) % 360;
  return { ...shape, rot: Math.round(deg * 10) / 10 };
}

export function flipShape(shape, axis) {
  return axis === 'h' ? { ...shape, flipH: !shape.flipH } : { ...shape, flipV: !shape.flipV };
}

/** Moves the yellow handle `index` to a world point (within the preset's limits). */
export function adjustShape(start, index, point) {
  const local = worldToLocal(start, point);
  const values = solveAdjustHandle(start.preset, start.w, start.h, start.adj || {}, index, local);
  return { ...start, adj: compactAdjust(start.preset, values) };
}

/** Where a line-type shape starts and ends, in world coordinates. */
export function lineEndpoints(shape) {
  return { start: localToWorld(shape, { x: 0, y: 0 }), end: localToWorld(shape, { x: shape.w, y: shape.h }) };
}

/** Moves one end of a line-type shape; the other end stays. Shift snaps the angle to 15° steps. */
export function moveLineEnd(start, which, point, { snap = false } = {}) {
  const ends = lineEndpoints(start);
  const fixed = which === 'start' ? ends.end : ends.start;
  const moved = snap ? snapLineAngle(fixed, point) : point;
  const box = which === 'start' ? lineBox(moved, fixed) : lineBox(fixed, moved);
  return { ...start, ...box, rot: 0 };
}

/**
 * Applies a style change ({ fill?, line?, text?, shadow? }), merging into the current values.
 * shadow: null removes it. A whole style (Shape Styles gallery) replaces fill, line and shadow.
 */
export function styleShape(shape, patch) {
  const next = { ...shape };
  if (patch.fill) next.fill = { ...(shape.fill && shape.fill.type !== 'none' ? shape.fill : DEFAULT_FILL), ...patch.fill };
  if (patch.line) next.line = { ...(shape.line && shape.line.type !== 'none' ? shape.line : DEFAULT_OUTLINE), ...patch.line };
  if (patch.text) next.text = { ...(shape.text || DEFAULT_TEXT), ...patch.text };
  if (patch.shadow !== undefined) next.shadow = patch.shadow ? { ...patch.shadow } : null;
  return next;
}

/** Sets the height, keeping the top edge where it is on the page (also when rotated). */
export function setShapeHeight(shape, h) {
  const height = Math.max(MIN_SIZE, h);
  if (Math.abs(height - shape.h) < 0.01) return shape;
  const centre = frameToWorld(shape, { x: shape.w / 2, y: height / 2 });
  return { ...shape, x: centre.x - shape.w / 2, y: centre.y - height / 2, h: height };
}

/**
 * Layer order, as in Word's Arrange menu: 'front', 'back', 'forward', 'backward'.
 * Later shapes are drawn on top. Selected shapes keep their order among themselves.
 */
export function reorderShapes(shapes, ids, action) {
  const chosen = new Set(ids);
  const picked = shapes.filter((s) => chosen.has(s.id));
  if (picked.length === 0) return shapes;
  const rest = shapes.filter((s) => !chosen.has(s.id));
  if (action === 'front') return [...rest, ...picked];
  if (action === 'back') return [...picked, ...rest];

  const list = [...shapes];
  if (action === 'forward') {
    for (let i = list.length - 2; i >= 0; i--) {
      if (chosen.has(list[i].id) && !chosen.has(list[i + 1].id)) [list[i], list[i + 1]] = [list[i + 1], list[i]];
    }
  } else if (action === 'backward') {
    for (let i = 1; i < list.length; i++) {
      if (chosen.has(list[i].id) && !chosen.has(list[i - 1].id)) [list[i], list[i - 1]] = [list[i - 1], list[i]];
    }
  }
  return list;
}

/** What "Set as Default Shape" remembers: the look, not the size or the text itself. */
export function shapeDefaultsFrom(shape) {
  const text = shape.text ? { ...shape.text } : null;
  if (text) delete text.value;
  return {
    fill: shape.fill ? { ...shape.fill } : null,
    line: shape.line ? { ...shape.line, head: undefined, tail: undefined } : null,
    text,
    shadow: shape.shadow ? { ...shape.shadow } : null,
  };
}

// ── Hit testing ──────────────────────────────────────────────────────────────

function windingNumber(runs, p) {
  let wn = 0;
  for (const run of runs) {
    const pts = run.pts;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const side = (b.x - a.x) * (p.y - a.y) - (p.x - a.x) * (b.y - a.y);
      if (a.y <= p.y) {
        if (b.y > p.y && side > 0) wn++;
      } else if (b.y <= p.y && side < 0) {
        wn--;
      }
    }
  }
  return wn;
}

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function distanceToRuns(runs, p) {
  let best = Infinity;
  for (const run of runs) {
    const pts = run.pts;
    const count = run.closed ? pts.length : pts.length - 1;
    for (let i = 0; i < count; i++) {
      const d = distanceToSegment(p, pts[i], pts[(i + 1) % pts.length]);
      if (d < best) best = d;
    }
  }
  return best;
}

/**
 * Whether a world point touches the shape, as in Word: a filled shape anywhere it is painted,
 * a shape without fill only on its outline (within `tolerance` world units), a text box
 * anywhere inside its box.
 */
export function hitTestShape(shape, point, tolerance = 6) {
  const box = shapeWorldBounds(shape);
  if (point.x < box.minX - tolerance || point.x > box.maxX + tolerance || point.y < box.minY - tolerance || point.y > box.maxY + tolerance) {
    return false;
  }
  const local = worldToLocal(shape, point);
  if (shape.textBox || (shape.text && shape.text.value)) {
    if (local.x >= 0 && local.x <= shape.w && local.y >= 0 && local.y <= shape.h) return true;
  }

  const g = shapeGeometry(shape);
  const runs = geometryRuns(g);
  const filled = hasFill(shape);
  const reach = tolerance + (hasOutline(shape) ? shape.line.width / 2 : 0);
  for (let i = 0; i < g.paths.length; i++) {
    const path = g.paths[i];
    if (filled && path.fill !== 'none' && windingNumber(runs[i], local) !== 0) return true;
    if (path.stroke && distanceToRuns(runs[i], local) <= reach) return true;
  }
  return false;
}

/** The topmost shape under a world point, or null. Later shapes in the list are drawn on top. */
export function hitTestShapes(shapes, point, tolerance = 6) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (hitTestShape(shapes[i], point, tolerance)) return shapes[i];
  }
  return null;
}
