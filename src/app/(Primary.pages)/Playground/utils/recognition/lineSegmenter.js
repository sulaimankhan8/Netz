/**
 * NETZ Text Line Segmenter
 *
 * The text recogniser (netz_htr.onnx) was trained on single lines of handwriting.
 * A cluster or lasso selection can hold several written lines, so before text is read
 * the strokes are split into lines and each line is recognised on its own.
 *
 * Works on stroke geometry only and is scale-free: every threshold is relative to the
 * writing's own height, so small ruled-paper writing and large whiteboard writing behave alike.
 *
 *   1. Body height   = 75th percentile of stroke heights (robust to dots, dashes and a stray tall stroke)
 *   2. Anchors       = strokes tall enough to carry a line position (letters, words)
 *   3. Anchors join the line whose nearby strokes sit at the same height, else start a new line.
 *      The comparison is local in x, so a line that slopes across the page stays one line.
 *   4. Small strokes (i-dots, commas, t-crosses, hyphens) join the line whose band they touch,
 *      which also places strokes added later (dotting an i after finishing the sentence).
 *
 * Only the text path uses this. Maths ink keeps its vertical structure (fractions, limits)
 * and is passed to the maths recogniser whole.
 */

const ANCHOR_HEIGHT_RATIO = 0.35; // strokes shorter than this share of the body height are "small"
const SAME_LINE_TOLERANCE = 0.6; // max vertical distance to a line, in body heights
const LOCAL_NEIGHBOURS = 3; // strokes nearest in x used to estimate a line's height locally

function getBBox(stroke) {
  if (stroke.bbox && Number.isFinite(stroke.bbox.minX)) return stroke.bbox;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const points = stroke.points || [];
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }
  return { minX, minY, maxX, maxY };
}

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(sortedValues.length - 1, Math.max(0, Math.round(p * (sortedValues.length - 1))));
  return sortedValues[idx];
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return percentile(sorted, 0.5);
}

function horizontalGap(a, b) {
  return Math.max(0, a.minX - b.maxX, b.minX - a.maxX);
}

/**
 * Vertical centre of a line near a given stroke: mean centre of the line's anchors closest in x.
 */
function localLineCentre(line, item) {
  const nearest = line.anchors
    .map((anchor) => ({ gap: horizontalGap(anchor, item), cy: anchor.cy }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, LOCAL_NEIGHBOURS);
  let sum = 0;
  for (let i = 0; i < nearest.length; i++) sum += nearest[i].cy;
  return sum / nearest.length;
}

function distanceToBand(item, line) {
  if (item.cy < line.top) return line.top - item.cy;
  if (item.cy > line.bottom) return item.cy - line.bottom;
  return 0;
}

function addAnchor(line, item) {
  line.anchors.push(item);
  line.items.push(item);
  if (item.minY < line.top) line.top = item.minY;
  if (item.maxY > line.bottom) line.bottom = item.maxY;
}

/**
 * Splits strokes into written lines, top to bottom.
 * Strokes keep their input (writing) order inside each line.
 *
 * @param {Array<Object>} strokes - Stroke objects with .points and optionally .bbox
 * @returns {Array<Array<Object>>} One array of strokes per line
 */
export function segmentStrokesIntoLines(strokes) {
  if (!Array.isArray(strokes) || strokes.length === 0) return [];
  if (strokes.length === 1) return [strokes];

  const items = strokes.map((stroke, order) => {
    const bbox = getBBox(stroke);
    return {
      stroke,
      order,
      minX: bbox.minX,
      maxX: bbox.maxX,
      minY: bbox.minY,
      maxY: bbox.maxY,
      cy: (bbox.minY + bbox.maxY) / 2,
      height: bbox.maxY - bbox.minY,
    };
  });

  const heights = items.map((it) => it.height).sort((a, b) => a - b);
  const bodyHeight = percentile(heights, 0.75);
  if (!(bodyHeight > 0)) return [strokes];

  const tolerance = SAME_LINE_TOLERANCE * bodyHeight;
  const anchors = items.filter((it) => it.height >= ANCHOR_HEIGHT_RATIO * bodyHeight);
  const smalls = items.filter((it) => it.height < ANCHOR_HEIGHT_RATIO * bodyHeight);
  if (anchors.length === 0) return [strokes];

  // Pass 1: anchors, in writing order
  let lines = [];
  for (let i = 0; i < anchors.length; i++) {
    const item = anchors[i];
    let best = null;
    let bestDist = Infinity;
    for (let l = 0; l < lines.length; l++) {
      const dist = Math.abs(item.cy - localLineCentre(lines[l], item));
      if (dist < bestDist) {
        bestDist = dist;
        best = lines[l];
      }
    }
    if (best && bestDist <= tolerance) {
      addAnchor(best, item);
    } else {
      const line = { anchors: [], items: [], top: Infinity, bottom: -Infinity };
      addAnchor(line, item);
      lines.push(line);
    }
  }

  // Lines whose centres ended up within tolerance are one line that was started twice
  let merged = true;
  while (merged && lines.length > 1) {
    merged = false;
    for (let a = 0; a < lines.length && !merged; a++) {
      for (let b = a + 1; b < lines.length && !merged; b++) {
        const centreA = median(lines[a].anchors.map((it) => it.cy));
        const centreB = median(lines[b].anchors.map((it) => it.cy));
        if (Math.abs(centreA - centreB) <= tolerance) {
          for (let k = 0; k < lines[b].anchors.length; k++) addAnchor(lines[a], lines[b].anchors[k]);
          lines.splice(b, 1);
          merged = true;
        }
      }
    }
  }

  // Pass 2: small strokes join the line whose band they fall in (or the nearest one)
  for (let i = 0; i < smalls.length; i++) {
    const item = smalls[i];
    let best = lines[0];
    let bestDist = Infinity;
    let bestCentreDist = Infinity;
    for (let l = 0; l < lines.length; l++) {
      const dist = distanceToBand(item, lines[l]);
      // Tightly spaced lines have overlapping bands: the nearer line centre breaks the tie
      const centreDist = Math.abs(item.cy - localLineCentre(lines[l], item));
      if (dist < bestDist - 1e-6 || (Math.abs(dist - bestDist) <= 1e-6 && centreDist < bestCentreDist)) {
        bestDist = dist;
        bestCentreDist = centreDist;
        best = lines[l];
      }
    }
    best.items.push(item);
  }

  lines.sort((a, b) => median(a.anchors.map((it) => it.cy)) - median(b.anchors.map((it) => it.cy)));

  return lines.map((line) => line.items.sort((a, b) => a.order - b.order).map((it) => it.stroke));
}
