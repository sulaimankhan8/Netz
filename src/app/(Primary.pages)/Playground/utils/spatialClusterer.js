/**
 * Spatial Stroke Clusterer & Layer 1 Local Geometry Parser
 *
 * Groups discrete vector InkStrokes into bounding box clusters based on spatial proximity (90px margin).
 * Merges words written next to each other (e.g. "Hi Bro") into a single unified sentence cluster.
 *
 * Enhanced with:
 * - Line-aware clustering: strokes sharing a horizontal baseline are grouped into line clusters
 * - Word segmentation hints: gaps > 30px within a line cluster are marked as word boundaries
 * - Temporal ordering: strokes are sorted by timestamp for left-to-right reading order
 */

import { intersectsBBox } from './spatialIndexRTree';

/**
 * Expands bounding box by margin.
 */
function expandBBox(bbox, margin = 32) {
  return {
    minX: bbox.minX - margin,
    minY: bbox.minY - margin,
    maxX: bbox.maxX + margin,
    maxY: bbox.maxY + margin,
  };
}

/**
 * Expands bounding box horizontally for same-line text connection within a word/phrase.
 */
function expandBBoxForLine(bbox, hMargin = 45, vMargin = 20) {
  return {
    minX: bbox.minX - hMargin,
    minY: bbox.minY - vMargin,
    maxX: bbox.maxX + hMargin,
    maxY: bbox.maxY + vMargin,
  };
}

/**
 * Merges two bounding boxes.
 */
function mergeBBoxes(boxA, boxB) {
  return {
    minX: Math.min(boxA.minX, boxB.minX),
    minY: Math.min(boxA.minY, boxB.minY),
    maxX: Math.max(boxA.maxX, boxB.maxX),
    maxY: Math.max(boxA.maxY, boxB.maxY),
  };
}

/**
 * Calculates the vertical center (baseline estimate) of a stroke's bounding box.
 */
function getStrokeBaseline(stroke) {
  const bbox = stroke.bbox;
  return (bbox.minY + bbox.maxY) / 2;
}

/**
 * Checks if two strokes share a similar horizontal baseline (text on the same line).
 * Tolerance scales with stroke height to handle varying text sizes.
 */
function sharesBaseline(strokeA, strokeB, tolerance = 0.6) {
  const baselineA = getStrokeBaseline(strokeA);
  const baselineB = getStrokeBaseline(strokeB);
  const heightA = strokeA.bbox.maxY - strokeA.bbox.minY;
  const heightB = strokeB.bbox.maxY - strokeB.bbox.minY;
  const avgHeight = (heightA + heightB) / 2;
  const maxDist = Math.max(avgHeight * tolerance, 25);

  return Math.abs(baselineA - baselineB) < maxDist;
}

/**
 * Gets the earliest timestamp from a stroke's points.
 */
function getStrokeTimestamp(stroke) {
  if (stroke.points && stroke.points.length > 0) {
    return stroke.points[0].timestamp || 0;
  }
  return 0;
}

/**
 * Evaluates whether a single stroke is a Scratch-Out Erase gesture.
 * Requires high stroke point density, 10+ rapid direction changes within a compact area,
 * and high bounding box intersection ratio over target strokes to prevent accidental deletion of handwriting.
 */
export function detectScratchOutGesture(stroke, targetStrokes = []) {
  if (!stroke || !stroke.points || stroke.points.length < 16) {
    return { isScratch: false, targetIds: [] };
  }

  const points = stroke.points;
  let directionChanges = 0;
  let prevDx = points[1].x - points[0].x;
  let totalPathLength = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalPathLength += Math.sqrt(dx * dx + dy * dy);

    if (i >= 2) {
      if ((dx > 1 && prevDx < -1) || (dx < -1 && prevDx > 1)) {
        directionChanges++;
      }
      if (Math.abs(dx) > 1) prevDx = dx;
    }
  }

  // Scratch-out requires at least 10 rapid direction changes
  if (directionChanges < 10) {
    return { isScratch: false, targetIds: [] };
  }

  // Calculate bounding box diagonal
  const bboxWidth = stroke.bbox.maxX - stroke.bbox.minX;
  const bboxHeight = stroke.bbox.maxY - stroke.bbox.minY;
  const diagonal = Math.sqrt(bboxWidth * bboxWidth + bboxHeight * bboxHeight);

  // Density ratio: total path length relative to bounding box size
  // Scribble gestures pack long path length into small bounding boxes (> 5.5 ratio)
  if (diagonal === 0 || (totalPathLength / diagonal) < 5.5) {
    return { isScratch: false, targetIds: [] };
  }

  const targetIds = [];
  const scratchBox = stroke.bbox;

  for (let i = 0; i < targetStrokes.length; i++) {
    const target = targetStrokes[i];
    if (target.id === stroke.id) continue;

    // Check intersection box
    if (intersectsBBox(scratchBox, target.bbox)) {
      const interMinX = Math.max(scratchBox.minX, target.bbox.minX);
      const interMaxX = Math.min(scratchBox.maxX, target.bbox.maxX);
      const interMinY = Math.max(scratchBox.minY, target.bbox.minY);
      const interMaxY = Math.min(scratchBox.maxY, target.bbox.maxY);

      const interWidth = Math.max(0, interMaxX - interMinX);
      const interHeight = Math.max(0, interMaxY - interMinY);
      const interArea = interWidth * interHeight;

      const targetWidth = Math.max(1, target.bbox.maxX - target.bbox.minX);
      const targetHeight = Math.max(1, target.bbox.maxY - target.bbox.minY);
      const targetArea = targetWidth * targetHeight;

      // Ensure the scratch box covers at least 40% of the target stroke area
      if (interArea / targetArea >= 0.4) {
        targetIds.push(target.id);
      }
    }
  }

  return {
    isScratch: targetIds.length > 0,
    targetIds,
  };
}

/**
 * Evaluates whether a stroke or pair of strokes forms an equals sign ("=") gesture.
 * Two short horizontal lines stacked vertically with X overlap.
 */
export function detectEqualsGesture(strokes) {
  if (!strokes || strokes.length < 2) return false;

  const lastStroke = strokes[strokes.length - 1];
  const prevStroke = strokes[strokes.length - 2];

  const isHorizontal = (s) => {
    const dx = Math.abs(s.bbox.maxX - s.bbox.minX);
    const dy = Math.abs(s.bbox.maxY - s.bbox.minY);
    return dx > 8 && dy < 25 && dx / Math.max(dy, 1) > 1.5;
  };

  if (isHorizontal(lastStroke) && isHorizontal(prevStroke)) {
    const yDist = Math.abs(lastStroke.bbox.minY - prevStroke.bbox.minY);
    const xOverlap = Math.min(lastStroke.bbox.maxX, prevStroke.bbox.maxX) - Math.max(lastStroke.bbox.minX, prevStroke.bbox.minX);

    if (yDist < 35 && xOverlap > 5) {
      return true;
    }
  }

  return false;
}

/**
 * Clusters strokes on canvas into spatial groups.
 *
 * Uses a hybrid approach:
 * 1. Baseline-aware grouping: strokes on the same horizontal line are clustered with wider horizontal margin
 * 2. Proximity grouping: remaining strokes use the standard proximity margin
 * 3. Temporal ordering: strokes within each cluster are sorted by timestamp for reading order
 *
 * @param {Array} strokes - Array of InkStroke objects
 * @param {number} proximityMargin - Pixel margin for spatial proximity grouping (default 90)
 * @returns {Array} Array of StrokeCluster objects
 */
export function clusterStrokes(strokes, proximityMargin = 32) {
  if (!strokes || strokes.length === 0) return [];

  const clusters = [];
  const visited = new Set();

  // Sort strokes by timestamp for consistent ordering
  const sortedStrokes = [...strokes].sort((a, b) => getStrokeTimestamp(a) - getStrokeTimestamp(b));

  for (let i = 0; i < sortedStrokes.length; i++) {
    const stroke = sortedStrokes[i];
    if (visited.has(stroke.id)) continue;

    let currentClusterStrokes = [stroke];
    let clusterBox = { ...stroke.bbox };
    visited.add(stroke.id);

    let expanded = true;
    while (expanded) {
      expanded = false;

      // Use line-aware expansion: modest horizontal margin for strokes within the same word/symbol
      const lineSearchBox = expandBBoxForLine(clusterBox, proximityMargin + 12, Math.max(proximityMargin - 12, 10));
      const standardSearchBox = expandBBox(clusterBox, proximityMargin);

      for (let j = 0; j < sortedStrokes.length; j++) {
        const candidate = sortedStrokes[j];
        if (visited.has(candidate.id)) continue;

        // Check if candidate is on the same baseline as any stroke in the cluster
        const onSameLine = currentClusterStrokes.some((s) => sharesBaseline(s, candidate));

        // Use wider search box for same-line strokes (catches words in a sentence)
        const searchBox = onSameLine ? lineSearchBox : standardSearchBox;

        if (intersectsBBox(searchBox, candidate.bbox)) {
          visited.add(candidate.id);
          currentClusterStrokes.push(candidate);
          clusterBox = mergeBBoxes(clusterBox, candidate.bbox);
          expanded = true;
        }
      }
    }

    // Sort cluster strokes by temporal order for correct reading sequence
    currentClusterStrokes.sort((a, b) => getStrokeTimestamp(a) - getStrokeTimestamp(b));

    const hasEquals = detectEqualsGesture(currentClusterStrokes);

    clusters.push({
      clusterId: `cluster_${Date.now()}_${i}`,
      strokeIds: currentClusterStrokes.map((s) => s.id),
      strokes: currentClusterStrokes,
      bbox: clusterBox,
      hasEqualsGesture: hasEquals,
      status: 'idle',
    });
  }

  return clusters;
}
