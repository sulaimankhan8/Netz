/**
 * Stroke Transforms for the lasso selection (move, resize, duplicate, recolour)
 *
 * Strokes are never changed in place: undo history and saved pages hold references to the
 * existing stroke objects, so every transform returns new stroke objects.
 */

export function bboxOfPoints(points) {
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

/** Bounding box around a set of strokes, or null when there are none. */
export function bboxOfStrokes(strokes) {
  if (!strokes || strokes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < strokes.length; i++) {
    const box = strokes[i].bbox;
    if (box.minX < minX) minX = box.minX;
    if (box.minY < minY) minY = box.minY;
    if (box.maxX > maxX) maxX = box.maxX;
    if (box.maxY > maxY) maxY = box.maxY;
  }
  return { minX, minY, maxX, maxY };
}

export function translateStroke(stroke, dx, dy) {
  const points = stroke.points.map((pt) => ({ ...pt, x: pt.x + dx, y: pt.y + dy }));
  return {
    ...stroke,
    points,
    bbox: {
      minX: stroke.bbox.minX + dx,
      minY: stroke.bbox.minY + dy,
      maxX: stroke.bbox.maxX + dx,
      maxY: stroke.bbox.maxY + dy,
    },
  };
}

/**
 * Scales a stroke about a fixed origin. Line thickness scales with it, as it does when
 * handwriting is resized in a note-taking app.
 */
export function scaleStroke(stroke, factor, origin) {
  const points = stroke.points.map((pt) => ({
    ...pt,
    x: origin.x + (pt.x - origin.x) * factor,
    y: origin.y + (pt.y - origin.y) * factor,
  }));
  return {
    ...stroke,
    width: Math.max(0.5, (stroke.width || 3) * factor),
    points,
    bbox: bboxOfPoints(points),
  };
}

/** A copy with a new identity, shifted so it does not sit exactly on the original. */
export function duplicateStroke(stroke, dx, dy, newId) {
  return { ...translateStroke(stroke, dx, dy), id: newId };
}

export function recolorStroke(stroke, color) {
  return { ...stroke, color };
}
