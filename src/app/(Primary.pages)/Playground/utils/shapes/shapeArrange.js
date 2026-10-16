/**
 * Arranging shapes, as in WPS Office and Word (Drawing Tools > Arrange): align, distribute,
 * group and ungroup, resizing and rotating several shapes (or a group) as one, Change Shape,
 * smart guides while moving, connectors that stay attached, and Convert to Shape for snapped ink.
 *
 * Like shapeModel.js, everything is pure and returns new objects (Node-tested).
 *
 * Groups are kept flat: the members of a group share a `groupId`. Selecting one member selects
 * them all, and they move, resize, rotate and flip as one. Grouping shapes that are already in
 * a group puts them all in the new group (one level, not groups inside groups).
 *
 * A connector (a line-type shape) can have its ends attached to connection points of other
 * shapes: `conn: { start: { id, idx }, end: { id, idx } }` (either may be missing). Whenever a
 * page's shapes change, rerouteConnectors moves attached ends to where their points now are.
 */

import {
  shapeGeometry, localToWorld, frameToWorld, shapeCentre, isLineShape, lineBox, newShapeId,
  OUTLINE_ONLY_PRESETS, LINE_PRESETS,
} from './shapeModel.js';

const DEG = Math.PI / 180;

// ── Boxes ────────────────────────────────────────────────────────────────────

/** Axis-aligned box around the shape's frame (its box, turned with it), in world units. */
export function frameBounds(shape) {
  const corners = [[0, 0], [shape.w, 0], [shape.w, shape.h], [0, shape.h]].map(([x, y]) => frameToWorld(shape, { x, y }));
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

export function framesBounds(shapes) {
  if (!shapes || shapes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of shapes) {
    const b = frameBounds(s);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }
  return { minX, minY, maxX, maxY };
}

// ── Groups ───────────────────────────────────────────────────────────────────

export function newGroupId() {
  return `group_${newShapeId().slice(6)}`;
}

/** The ids, with every other member of any group they belong to. */
export function expandToGroups(shapes, ids) {
  const chosen = new Set(ids);
  const groups = new Set(shapes.filter((s) => chosen.has(s.id) && s.groupId).map((s) => s.groupId));
  if (groups.size === 0) return ids.filter((id) => shapes.some((s) => s.id === id));
  return shapes.filter((s) => chosen.has(s.id) || (s.groupId && groups.has(s.groupId))).map((s) => s.id);
}

/** Whether the shapes are exactly the members of one group. */
export function isWholeGroup(shapes, selected) {
  if (selected.length < 2) return false;
  const gid = selected[0].groupId;
  if (!gid || selected.some((s) => s.groupId !== gid)) return false;
  return shapes.filter((s) => s.groupId === gid).length === selected.length;
}

export function canGroup(selected) {
  if (selected.length < 2) return false;
  return !isWholeGroupOf(selected);
}

function isWholeGroupOf(selected) {
  const gid = selected[0].groupId;
  return Boolean(gid) && selected.every((s) => s.groupId === gid);
}

export function canUngroup(selected) {
  return selected.some((s) => s.groupId);
}

/**
 * Groups the shapes (Ctrl+G). The members are brought together in the layer order, where the
 * topmost of them was, keeping their order among themselves.
 */
export function groupShapes(shapes, ids) {
  const chosen = new Set(expandToGroups(shapes, ids));
  if (chosen.size < 2) return shapes;
  const groupId = newGroupId();
  const members = shapes.filter((s) => chosen.has(s.id)).map((s) => ({ ...s, groupId }));
  let topIndex = -1;
  shapes.forEach((s, i) => {
    if (chosen.has(s.id)) topIndex = i;
  });
  const out = [];
  shapes.forEach((s, i) => {
    if (!chosen.has(s.id)) out.push(s);
    if (i === topIndex) out.push(...members);
  });
  return out;
}

/** Ungroups every group the shapes belong to (Ctrl+Shift+G). */
export function ungroupShapes(shapes, ids) {
  const chosen = new Set(ids);
  const groups = new Set(shapes.filter((s) => chosen.has(s.id) && s.groupId).map((s) => s.groupId));
  if (groups.size === 0) return shapes;
  return shapes.map((s) => {
    if (!s.groupId || !groups.has(s.groupId)) return s;
    const next = { ...s };
    delete next.groupId;
    return next;
  });
}

// ── Align and distribute ─────────────────────────────────────────────────────

/** Units that move together: a group is one, any other shape is its own. */
function unitsOf(selected) {
  const units = new Map();
  for (const s of selected) {
    const key = s.groupId || s.id;
    if (!units.has(key)) units.set(key, []);
    units.get(key).push(s);
  }
  return [...units.values()].map((members) => ({ members, box: framesBounds(members) }));
}

function moveUnits(shapes, moves) {
  const byId = new Map();
  for (const { members, dx, dy } of moves) {
    if (!dx && !dy) continue;
    for (const m of members) byId.set(m.id, { dx, dy });
  }
  if (byId.size === 0) return shapes;
  return shapes.map((s) => {
    const d = byId.get(s.id);
    return d ? { ...s, x: s.x + d.dx, y: s.y + d.dy } : s;
  });
}

export const ALIGN_MODES = ['left', 'center', 'right', 'top', 'middle', 'bottom'];

/**
 * Align Left, Center, Right, Top, Middle, Bottom: relative to the selection as a whole
 * (a whiteboard has no page edge to align to). A group moves as one.
 */
export function alignShapes(shapes, ids, mode) {
  const chosen = new Set(ids);
  const units = unitsOf(shapes.filter((s) => chosen.has(s.id)));
  if (units.length < 2) return shapes;
  const all = framesBounds(units.flatMap((u) => u.members));
  const moves = units.map(({ members, box }) => {
    let dx = 0;
    let dy = 0;
    if (mode === 'left') dx = all.minX - box.minX;
    if (mode === 'right') dx = all.maxX - box.maxX;
    if (mode === 'center') dx = (all.minX + all.maxX) / 2 - (box.minX + box.maxX) / 2;
    if (mode === 'top') dy = all.minY - box.minY;
    if (mode === 'bottom') dy = all.maxY - box.maxY;
    if (mode === 'middle') dy = (all.minY + all.maxY) / 2 - (box.minY + box.maxY) / 2;
    return { members, dx, dy };
  });
  return moveUnits(shapes, moves);
}

/**
 * Distribute Horizontally / Vertically: three or more, with equal gaps between them. The
 * first and last stay where they are.
 */
export function distributeShapes(shapes, ids, axis) {
  const chosen = new Set(ids);
  const units = unitsOf(shapes.filter((s) => chosen.has(s.id)));
  if (units.length < 3) return shapes;
  const lo = axis === 'h' ? 'minX' : 'minY';
  const hi = axis === 'h' ? 'maxX' : 'maxY';
  const sorted = [...units].sort((a, b) => a.box[lo] + a.box[hi] - (b.box[lo] + b.box[hi]));
  const span = sorted[sorted.length - 1].box[hi] - sorted[0].box[lo];
  const sizes = sorted.reduce((sum, u) => sum + (u.box[hi] - u.box[lo]), 0);
  const gap = (span - sizes) / (sorted.length - 1);
  let at = sorted[0].box[lo];
  const moves = sorted.map((u) => {
    const d = at - u.box[lo];
    at += u.box[hi] - u.box[lo] + gap;
    return axis === 'h' ? { members: u.members, dx: d, dy: 0 } : { members: u.members, dx: 0, dy: d };
  });
  return moveUnits(shapes, moves);
}

// ── Several shapes (or a group) as one ───────────────────────────────────────

/**
 * The selection box after a resize handle is dragged to `point`: the opposite side stays
 * (the centre with fromCentre); keepRatio keeps the box's proportions. Returns signed edges
 * ({ x0, y0, x1, y1 }: x1 < x0 when dragged past the opposite edge).
 */
export function resizeBox(box, handle, point, { keepRatio = false, fromCentre = false } = {}) {
  const w0 = box.maxX - box.minX;
  const h0 = box.maxY - box.minY;
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  let x0 = box.minX, x1 = box.maxX, y0 = box.minY, y1 = box.maxY;
  const east = handle.includes('e');
  const west = handle.includes('w');
  const south = handle.includes('s');
  const north = handle.includes('n');
  if (east) { x1 = point.x; if (fromCentre) x0 = 2 * cx - point.x; }
  if (west) { x0 = point.x; if (fromCentre) x1 = 2 * cx - point.x; }
  if (south) { y1 = point.y; if (fromCentre) y0 = 2 * cy - point.y; }
  if (north) { y0 = point.y; if (fromCentre) y1 = 2 * cy - point.y; }
  if (keepRatio && w0 > 0 && h0 > 0) {
    const sx = (x1 - x0) / w0;
    const sy = (y1 - y0) / h0;
    let s;
    if ((east || west) && (north || south)) s = Math.abs(sx) > Math.abs(sy) ? sx : sy;
    else if (east || west) s = sx;
    else s = sy;
    const sxSigned = Math.sign(sx || 1) * Math.abs(s);
    const sySigned = Math.sign(sy || 1) * Math.abs(s);
    const ax = fromCentre ? cx : west ? box.maxX : east ? box.minX : cx;
    const ay = fromCentre ? cy : north ? box.maxY : south ? box.minY : cy;
    if (fromCentre || (!east && !west)) { x0 = ax - (w0 * sxSigned) / 2; x1 = ax + (w0 * sxSigned) / 2; }
    else if (west) { x1 = ax; x0 = ax - w0 * sxSigned; }
    else { x0 = ax; x1 = ax + w0 * sxSigned; }
    if (fromCentre || (!north && !south)) { y0 = ay - (h0 * sySigned) / 2; y1 = ay + (h0 * sySigned) / 2; }
    else if (north) { y1 = ay; y0 = ay - h0 * sySigned; }
    else { y0 = ay; y1 = ay + h0 * sySigned; }
  }
  return { x0, y0, x1, y1 };
}

/**
 * Each shape scaled from the box `from` to the signed box `to`, as if they were one picture:
 * positions and sizes scale; a shape turned at an angle keeps its angle and takes the scale
 * along its own sides; dragging past the opposite edge mirrors them all.
 */
export function scaleShapes(originals, from, to) {
  const w0 = from.maxX - from.minX || 1;
  const h0 = from.maxY - from.minY || 1;
  const sx = (to.x1 - to.x0) / w0;
  const sy = (to.y1 - to.y0) / h0;
  return originals.map((s) => {
    const c = shapeCentre(s);
    const nc = { x: to.x0 + (c.x - from.minX) * sx, y: to.y0 + (c.y - from.minY) * sy };
    const t = (s.rot || 0) * DEG;
    const ax = Math.abs(sx);
    const ay = Math.abs(sy);
    const fw = Math.hypot(ax * Math.cos(t), ay * Math.sin(t));
    const fh = Math.hypot(ax * Math.sin(t), ay * Math.cos(t));
    const w = Math.max(1, s.w * fw);
    const h = Math.max(1, s.h * fh);
    let rot = s.rot || 0;
    let { flipH, flipV } = s;
    if (sx < 0) { flipH = !flipH; rot = -rot; }
    if (sy < 0) { flipV = !flipV; rot = -rot; }
    rot = Math.round((((rot % 360) + 360) % 360) * 10) / 10;
    return { ...s, x: nc.x - w / 2, y: nc.y - h / 2, w, h, rot, flipH: Boolean(flipH), flipV: Boolean(flipV) };
  });
}

/** Each shape turned by `degrees` about `centre` (the selection's middle), and turned itself. */
export function rotateShapesAbout(originals, centre, degrees) {
  const cos = Math.cos(degrees * DEG);
  const sin = Math.sin(degrees * DEG);
  return originals.map((s) => {
    const c = shapeCentre(s);
    const dx = c.x - centre.x;
    const dy = c.y - centre.y;
    const nc = { x: centre.x + dx * cos - dy * sin, y: centre.y + dx * sin + dy * cos };
    const rot = Math.round((((((s.rot || 0) + degrees) % 360) + 360) % 360) * 10) / 10;
    return { ...s, x: nc.x - s.w / 2, y: nc.y - s.h / 2, rot };
  });
}

/** Flip Horizontal / Vertical of several shapes as one (a group): mirrored across the middle. */
export function flipShapesAbout(originals, box, axis) {
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  return originals.map((s) => {
    const c = shapeCentre(s);
    const rot = Math.round((((360 - (s.rot || 0)) % 360) * 10)) / 10;
    if (axis === 'h') return { ...s, x: 2 * cx - c.x - s.w / 2, flipH: !s.flipH, rot };
    return { ...s, y: 2 * cy - c.y - s.h / 2, flipV: !s.flipV, rot };
  });
}

/** The angle (degrees) of a point seen from a centre, measured like the rotate handle (0 = up). */
export function handleAngle(centre, point) {
  return Math.atan2(point.y - centre.y, point.x - centre.x) / DEG + 90;
}

// ── Change Shape ─────────────────────────────────────────────────────────────

/** Whether a shape can be changed to another (lines and connectors cannot, as in Word). */
export function canChangeShape(shape) {
  return !isLineShape(shape);
}

/**
 * Change Shape: the new preset in the same place, size, turn and flips, with the same look and
 * text. Its own yellow-handle values start fresh.
 */
export function changeShape(shape, preset) {
  if (!canChangeShape(shape) || LINE_PRESETS.has(preset)) return shape;
  const next = { ...shape, preset, adj: {} };
  delete next.points;
  delete next.open;
  delete next.textBox;
  if (shape.textBox && (!shape.line || shape.line.type === 'none')) {
    // A text box has neither fill nor outline: the new shape gets Word's outline so it shows
    next.line = { type: 'solid', color: '#2F528F', width: 1.33, alpha: 1, dash: 'solid' };
  }
  if (OUTLINE_ONLY_PRESETS.has(preset)) next.fill = { type: 'none' };
  return next;
}

// ── Smart guides ─────────────────────────────────────────────────────────────

/**
 * While shapes are moved: snaps the moving box's edges and middle to those of other shapes
 * that are within `threshold` (world units), as Word's alignment guides do. Returns the
 * adjusted move and the guide lines to show ({ axis: 'x', at, from, to } is a vertical line).
 */
export function snapMove(box, others, dx, dy, threshold) {
  const moved = { minX: box.minX + dx, maxX: box.maxX + dx, minY: box.minY + dy, maxY: box.maxY + dy };
  const xs = [moved.minX, (moved.minX + moved.maxX) / 2, moved.maxX];
  const ys = [moved.minY, (moved.minY + moved.maxY) / 2, moved.maxY];
  let bestX = null;
  let bestY = null;
  for (const o of others) {
    const oxs = [o.minX, (o.minX + o.maxX) / 2, o.maxX];
    const oys = [o.minY, (o.minY + o.maxY) / 2, o.maxY];
    for (const a of xs) {
      for (const b of oxs) {
        const d = b - a;
        if (Math.abs(d) <= threshold && (!bestX || Math.abs(d) < Math.abs(bestX.d))) bestX = { d, at: b };
      }
    }
    for (const a of ys) {
      for (const b of oys) {
        const d = b - a;
        if (Math.abs(d) <= threshold && (!bestY || Math.abs(d) < Math.abs(bestY.d))) bestY = { d, at: b };
      }
    }
  }
  const sdx = dx + (bestX ? bestX.d : 0);
  const sdy = dy + (bestY ? bestY.d : 0);
  const finalBox = { minX: box.minX + sdx, maxX: box.maxX + sdx, minY: box.minY + sdy, maxY: box.maxY + sdy };
  const guides = [];
  const near = (v, w) => Math.abs(v - w) < 1e-6;
  if (bestX) {
    // The line runs through every shape lined up with it there
    let from = finalBox.minY;
    let to = finalBox.maxY;
    for (const o of others) {
      if ([o.minX, (o.minX + o.maxX) / 2, o.maxX].some((v) => near(v, bestX.at))) {
        from = Math.min(from, o.minY);
        to = Math.max(to, o.maxY);
      }
    }
    guides.push({ axis: 'x', at: bestX.at, from, to });
  }
  if (bestY) {
    let from = finalBox.minX;
    let to = finalBox.maxX;
    for (const o of others) {
      if ([o.minY, (o.minY + o.maxY) / 2, o.maxY].some((v) => near(v, bestY.at))) {
        from = Math.min(from, o.minX);
        to = Math.max(to, o.maxX);
      }
    }
    guides.push({ axis: 'y', at: bestY.at, from, to });
  }
  return { dx: sdx, dy: sdy, guides };
}

// ── Connectors ───────────────────────────────────────────────────────────────

/** A shape's connection points (where connectors attach), in world coordinates. */
export function connectionPoints(shape) {
  if (isLineShape(shape)) return [];
  return (shapeGeometry(shape).connections || []).map((c, idx) => ({ idx, ...localToWorld(shape, c) }));
}

/**
 * The connection point nearest to a world point, within `tolerance`, on a shape that is not
 * one of `excludeIds` (the connector itself). Returns { id, idx, x, y } or null.
 */
export function nearestConnection(shapes, point, tolerance, excludeIds = []) {
  const skip = new Set(excludeIds);
  let best = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    if (skip.has(s.id) || isLineShape(s)) continue;
    for (const p of connectionPoints(s)) {
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d <= tolerance && (!best || d < best.d)) best = { id: s.id, idx: p.idx, x: p.x, y: p.y, d };
    }
  }
  if (!best) return null;
  const { d, ...hit } = best;
  return hit;
}

/** Shapes whose connection points should show while a connector end is near (world units). */
export function shapesNear(shapes, point, reach, excludeIds = []) {
  const skip = new Set(excludeIds);
  return shapes.filter((s) => {
    if (skip.has(s.id) || isLineShape(s)) return false;
    const b = frameBounds(s);
    return point.x >= b.minX - reach && point.x <= b.maxX + reach && point.y >= b.minY - reach && point.y <= b.maxY + reach;
  });
}

/** A line shape running from one world point to another (its look kept). */
export function lineBetween(shape, start, end) {
  return { ...shape, ...lineBox(start, end), rot: 0 };
}

/** The connector with one end attached to a connection point (or let go: attach null). */
export function setConnection(shape, which, attach) {
  const conn = { ...(shape.conn || {}) };
  if (attach) conn[which] = { id: attach.id, idx: attach.idx };
  else delete conn[which];
  const next = { ...shape };
  if (conn.start || conn.end) next.conn = conn;
  else delete next.conn;
  return next;
}

/**
 * Attached connector ends follow their shapes. An end whose shape is gone (deleted) stays where
 * it is and is let go. Shapes that do not change are returned as they were (same objects).
 */
export function rerouteConnectors(shapes) {
  let any = false;
  for (const s of shapes) {
    if (s.conn) {
      any = true;
      break;
    }
  }
  if (!any) return shapes;
  const byId = new Map(shapes.map((s) => [s.id, s]));
  let changed = false;
  const out = shapes.map((s) => {
    if (!s.conn || !isLineShape(s)) return s;
    const ends = { start: localToWorld(s, { x: 0, y: 0 }), end: localToWorld(s, { x: s.w, y: s.h }) };
    let conn = { ...s.conn };
    let moved = false;
    for (const which of ['start', 'end']) {
      const c = conn[which];
      if (!c) continue;
      const target = byId.get(c.id);
      const point = target && !isLineShape(target) ? connectionPoints(target)[c.idx] : null;
      if (!point) {
        delete conn[which];
        moved = true;
        continue;
      }
      if (Math.abs(point.x - ends[which].x) > 1e-6 || Math.abs(point.y - ends[which].y) > 1e-6) {
        ends[which] = { x: point.x, y: point.y };
        moved = true;
      }
    }
    if (!moved) return s;
    changed = true;
    const next = lineBetween(s, ends.start, ends.end);
    if (conn.start || conn.end) next.conn = conn;
    else delete next.conn;
    return next;
  });
  return changed ? out : shapes;
}

/** Moving a connector on its own lets go of the shapes it was attached to (as in Word). */
export function detachMoved(shapes, movedIds) {
  const moved = new Set(movedIds);
  return shapes.map((s) => {
    if (!s.conn || !moved.has(s.id)) return s;
    let next = s;
    for (const which of ['start', 'end']) {
      const c = s.conn[which];
      if (c && !moved.has(c.id)) next = setConnection(next, which, null);
    }
    return next;
  });
}

// ── Convert to Shape (snapped ink) ───────────────────────────────────────────

/** Whether a stroke is ink that snapped to a shape (and so can become one). */
export function isConvertibleStroke(stroke) {
  return Boolean(stroke && stroke.shape && Array.isArray(stroke.points) && stroke.points.length >= 2);
}

function strokeBox(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

/** The corners of an outline drawn with straight edges (where the direction turns). */
export function outlineCorners(points, closed = true) {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) > 1e-6);
  if (closed && pts.length > 1 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1e-6) pts.pop();
  const n = pts.length;
  if (n < 3) return pts.map((p) => ({ x: p.x, y: p.y }));
  const corners = [];
  for (let i = 0; i < n; i++) {
    if (!closed && (i === 0 || i === n - 1)) {
      corners.push({ x: pts[i].x, y: pts[i].y });
      continue;
    }
    const a = pts[(i - 1 + n) % n];
    const b = pts[i];
    const c = pts[(i + 1) % n];
    const d1 = Math.atan2(b.y - a.y, b.x - a.x);
    const d2 = Math.atan2(c.y - b.y, c.x - b.x);
    let turn = Math.abs(d2 - d1);
    if (turn > Math.PI) turn = 2 * Math.PI - turn;
    if (turn > 0.2) corners.push({ x: b.x, y: b.y });
  }
  return corners;
}

/**
 * An editable shape made from ink that snapped to a shape: a line, an ellipse (circle), a
 * rectangle (square), a triangle (any: the Office triangle, turned, with its tip moved), or a
 * freeform outline for other polygons. It keeps the ink's colour and width as its outline and
 * has no fill, so it looks as it did.
 */
export function shapeFromStroke(stroke) {
  if (!isConvertibleStroke(stroke)) return null;
  const width = Math.max(0.5, stroke.width || 2);
  const line = { type: 'solid', color: stroke.color || '#000000', width, alpha: stroke.opacity ?? 1, dash: 'solid' };
  const base = { id: newShapeId(), adj: {}, rot: 0, flipH: false, flipV: false, fill: { type: 'none' }, line, text: null, shadow: null };
  const pts = stroke.points;
  const box = strokeBox(pts);
  const kind = stroke.shape;

  if (kind === 'line') {
    const a = pts[0];
    const b = pts[pts.length - 1];
    return { ...base, preset: 'line', ...lineBox(a, b) };
  }
  if (kind === 'circle' || kind === 'ellipse') {
    return { ...base, preset: 'ellipse', x: box.minX, y: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY };
  }
  if (kind === 'rectangle' || kind === 'square') {
    return { ...base, preset: 'rect', x: box.minX, y: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY };
  }

  const corners = outlineCorners(pts, true);
  if (corners.length === 3) return triangleShape(base, corners);
  if (corners.length < 3) return null;
  // Any other outline: a freeform shape through its corners, kept as fractions of its box
  const w = Math.max(1, box.maxX - box.minX);
  const h = Math.max(1, box.maxY - box.minY);
  return {
    ...base,
    preset: 'freeform',
    x: box.minX,
    y: box.minY,
    w,
    h,
    points: corners.map((c) => [(c.x - box.minX) / w, (c.y - box.minY) / h]),
  };
}

/**
 * Any triangle as Office's triangle shape: one side becomes the base (the bottom edge, the full
 * width), the shape is turned to match, and the tip's place along the top is its adjustment
 * value. A side can be the base when the tip lies over it (both angles at it 90° or less; the
 * longest side always can). Of those, the one nearest to level is used, so a triangle drawn
 * upright stays upright and unturned.
 */
function triangleShape(base, corners) {
  let pick = null;
  for (let i = 0; i < 3; i++) {
    let p = corners[i];
    let q = corners[(i + 1) % 3];
    const apex = corners[(i + 2) % 3];
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    if (len < 1e-9) continue;
    // The base runs left to right with the tip above it (in the shape's own turned axes)
    const cross = (q.x - p.x) * (apex.y - p.y) - (q.y - p.y) * (apex.x - p.x);
    if (cross > 0) [p, q] = [q, p];
    const ux = (q.x - p.x) / len;
    const uy = (q.y - p.y) / len;
    const along = (apex.x - p.x) * ux + (apex.y - p.y) * uy;
    if (along < -1e-6 || along > len + 1e-6) continue;
    const rot = (((Math.atan2(uy, ux) / DEG) % 360) + 360) % 360;
    const tilt = Math.min(rot, 360 - rot);
    if (!pick || tilt < pick.tilt - 1e-9) pick = { p, ux, uy, len, along, apex, rot, tilt };
  }
  if (!pick) return null;
  const { p, ux, uy, len, along, apex, rot } = pick;
  const height = Math.abs((apex.x - p.x) * -uy + (apex.y - p.y) * ux);
  // Centre of the box: halfway along the base, half the height up (towards the tip)
  const cx = p.x + ux * (len / 2) + uy * (height / 2);
  const cy = p.y + uy * (len / 2) - ux * (height / 2);
  const adj = Math.round(Math.max(0, Math.min(1, along / len)) * 100000);
  return {
    ...base,
    preset: 'triangle',
    x: cx - len / 2,
    y: cy - height / 2,
    w: len,
    h: Math.max(1, height),
    // Not rounded: the corners land exactly where the ink's were
    rot: rot > 359.9999 ? 0 : rot,
    adj: adj === 50000 ? {} : { adj },
  };
}

// ── Keyboard ─────────────────────────────────────────────────────────────────

/** Tab: the next shape (Shift+Tab: the previous one) in layer order, a group counting as one. */
export function nextShapeSelection(shapes, selectedIds, backwards = false) {
  if (shapes.length === 0) return [];
  const units = [];
  const seen = new Set();
  for (const s of shapes) {
    const key = s.groupId || s.id;
    if (seen.has(key)) continue;
    seen.add(key);
    units.push(s.groupId ? shapes.filter((m) => m.groupId === s.groupId).map((m) => m.id) : [s.id]);
  }
  const current = units.findIndex((u) => u.some((id) => selectedIds.includes(id)));
  const next = current < 0 ? (backwards ? units.length - 1 : 0) : (current + (backwards ? -1 : 1) + units.length) % units.length;
  return units[next];
}

/** Ctrl+Shift+> and Ctrl+Shift+<: the next font size up or down in Word's list (px). */
const FONT_STEPS_PT = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
export function steppedTextSize(sizePx, up) {
  const pt = Math.round(sizePx * 0.75 * 100) / 100;
  let nextPt;
  if (up) nextPt = FONT_STEPS_PT.find((s) => s > pt) || Math.min(1638, Math.round(pt / 10) * 10 + 10);
  else nextPt = [...FONT_STEPS_PT].reverse().find((s) => s < pt) || Math.max(1, pt - 1);
  return Math.round((nextPt * 4) / 3 * 100) / 100;
}
