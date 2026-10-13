/**
 * Catmull-Rom Spline Curve Fitting & Stroke Smoother
 * Converts raw discrete pointer trajectory points into hardware-accelerated
 * smooth cubic Bézier curves for 2D HTML5 canvas rendering.
 */

/**
 * Calculates bounding box { minX, minY, maxX, maxY } for a set of points.
 */
export function calculateBoundingBox(points) {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Line width for a given pen pressure (0..1). A normal press (0.5) gives the nominal width;
 * a light touch thins the line to 40% and a hard press thickens it to 160%.
 */
export function pressureWidth(width, pressure) {
  const p = typeof pressure === 'number' ? Math.min(1, Math.max(0, pressure)) : 0.5;
  return width * (0.4 + 1.2 * p);
}

/**
 * True when a stroke was made by a pen whose pressure actually varied (a mouse reports a constant).
 */
export function strokeHasPressure(points) {
  if (!points || points.length < 3 || points[0].pointerType !== 'pen') return false;
  let min = 1;
  let max = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i].pressure;
    if (typeof p !== 'number') return false;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return max - min > 0.05;
}

/**
 * Draws a smooth Catmull-Rom / Quadratic curve through trajectory points onto a 2D Canvas context.
 * Uses midpoint quadratic Bézier curve rendering for sub-millisecond execution.
 */
export function drawSmoothStroke(ctx, points, style = {}) {
  if (!points || points.length === 0) return;

  const {
    color = '#3B82F6',
    width = 3,
    tool = 'pen',
    opacity = 1.0,
  } = style;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.globalAlpha = tool === 'highlighter' ? 0.35 : opacity;
  ctx.lineWidth = tool === 'highlighter' ? width * 4 : width;

  if (tool === 'highlighter') {
    ctx.globalCompositeOperation = 'source-over';
  } else if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  if (points.length === 1) {
    // Single tap dot
    const pt = points[0];
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, (tool === 'highlighter' ? width * 2 : width) / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    return;
  }

  if (points.length === 2) {
    // Straight line between two points
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Snapped straight-edged shapes (line, triangle, rectangle, polygon) are drawn exactly through
  // their points. Curve smoothing would cut every corner into a curve.
  if (style.shape && style.shape !== 'circle' && style.shape !== 'ellipse') {
    const first = points[0];
    const last = points[points.length - 1];
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (first.x === last.x && first.y === last.y) ctx.closePath();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Pressure-sensitive ink: each short span is drawn at the width its pressure asks for.
  // (Translucent ink is drawn as one path instead: overlapping spans would show as darker beads.)
  if (style.hasPressure && tool !== 'highlighter' && opacity >= 1) {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      const fromX = i === 1 ? prev.x : (prev.x + current.x) / 2;
      const fromY = i === 1 ? prev.y : (prev.y + current.y) / 2;
      ctx.lineWidth = pressureWidth(width, current.pressure);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      if (next) {
        ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      } else {
        ctx.lineTo(current.x, current.y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Smooth curve through point array using quadratic midpoint interpolation
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const currentPt = points[i];
    const nextPt = points[i + 1];
    
    // Midpoint between current and next point acts as control point
    const midX = (currentPt.x + nextPt.x) / 2;
    const midY = (currentPt.y + nextPt.y) / 2;

    ctx.quadraticCurveTo(currentPt.x, currentPt.y, midX, midY);
  }

  // Connect to the final point
  const lastIndex = points.length - 1;
  ctx.lineTo(points[lastIndex].x, points[lastIndex].y);
  ctx.stroke();

  ctx.restore();
}
