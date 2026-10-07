/**
 * Canonical Stroke Feature Extractor for NETZ
 *
 * Implements the canonical 8D online ink feature extraction specification
 * identical to the training pipelines in train_router.ipynb, train_htr.ipynb, and train_hmer.ipynb.
 *
 * Feature columns (8):
 *   0: xn           - Normalized X coordinate
 *   1: yn           - Normalized Y coordinate
 *   2: dx           - Step displacement in X
 *   3: dy           - Step displacement in Y
 *   4: dt           - Normalized time delta: min(dt * 10, 1.0)
 *   5: stroke_end   - 1.0 if this is the final point of a stroke, else 0.0
 *   6: stroke_start - 1.0 if this is the initial point of a stroke, else 0.0
 *   7: speed        - Normalized speed: min(speed / 5.0, 1.0)
 */

export const FEATURE_DIM = 8;
export const FEATURE_SPEC = ['x', 'y', 'dx', 'dy', 'dt', 'stroke_end', 'stroke_start', 'speed'];

/**
 * Converts array of strokes into float array [N, 4]: [x, y, t, stroke_id].
 * Each stroke is an array of points, where each point is either:
 *   - Object: { x, y, t } or { x, y, timestamp }
 *   - Array: [x, y, t?]
 *
 * @param {Array<Array<Object|Array<number>>>} strokes
 * @returns {Array<[number, number, number, number]>}
 */
export function strokesToArray(strokes) {
  if (!Array.isArray(strokes) || strokes.length === 0) {
    return [];
  }

  const rows = [];
  let minT = Infinity;
  let hasValidT = false;

  for (let sid = 0; sid < strokes.length; sid++) {
    const stroke = strokes[sid];
    const points = Array.isArray(stroke)
      ? stroke
      : (stroke && Array.isArray(stroke.points) ? stroke.points : (stroke && Array.isArray(stroke.pts) ? stroke.pts : null));

    if (!points || points.length === 0) continue;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      let x = 0;
      let y = 0;
      let t = NaN;

      if (pt && typeof pt === 'object' && !Array.isArray(pt)) {
        x = Number(pt.x) || 0;
        y = Number(pt.y) || 0;
        const rawT = pt.t !== undefined ? pt.t : pt.timestamp;
        t = rawT !== undefined && rawT !== null ? Number(rawT) : NaN;
      } else if (Array.isArray(pt)) {
        x = Number(pt[0]) || 0;
        y = Number(pt[1]) || 0;
        t = pt.length >= 3 && pt[2] !== undefined && pt[2] !== null ? Number(pt[2]) : NaN;
      }

      if (Number.isFinite(t)) {
        if (t < minT) minT = t;
        hasValidT = true;
      }

      rows.push([x, y, t, sid]);
    }
  }

  // Relative time normalization keeps float32 precision
  if (hasValidT && Number.isFinite(minT)) {
    for (let i = 0; i < rows.length; i++) {
      if (Number.isFinite(rows[i][2])) {
        rows[i][2] -= minT;
      }
    }
  }

  return rows;
}

/**
 * Auto-detects milliseconds vs seconds from the median sampling gap;
 * falls back to 10 ms (0.01s) per sample if timing is missing.
 *
 * @param {Array<number>} tArr - Time values array
 * @returns {Float64Array} Seconds array
 */
export function toSeconds(tArr) {
  const n = tArr.length;
  const fallback = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    fallback[i] = i * 0.01;
  }

  if (n < 2) return fallback;

  // Check if all are finite
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(tArr[i])) return fallback;
  }

  // Compute positive diffs
  const posDiffs = [];
  for (let i = 1; i < n; i++) {
    const d = tArr[i] - tArr[i - 1];
    if (d > 0) posDiffs.push(d);
  }

  if (posDiffs.length === 0) return fallback;

  posDiffs.sort((a, b) => a - b);
  const median = posDiffs[Math.floor(posDiffs.length / 2)];

  const isMs = median > 1.0;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = isMs ? tArr[i] / 1000.0 : tArr[i];
  }
  return out;
}

/**
 * Extracts canonical 8D features from an array of [x, y, t, stroke_id] rows.
 *
 * @param {Array<[number, number, number, number]>} arr
 * @param {number} maxLen - Maximum sequence length (e.g., 256 for Router, 1024 for HTR, 512 for HMER)
 * @param {'max'|'height'} [scaleMode='max'] - 'max': divide by max(w, h); 'height': divide by max(h, 0.03*w)
 * @returns {Float32Array} Flattened 1D buffer of length (n * 8)
 */
export function extractFeatures(arr, maxLen, scaleMode = 'max') {
  let n = arr ? arr.length : 0;
  if (n === 0) {
    return new Float32Array(FEATURE_DIM);
  }

  let rows = arr;

  // Subsample if length exceeds maxLen using deterministic index mapping
  if (n > maxLen) {
    const subsampled = new Array(maxLen);
    for (let k = 0; k < maxLen; k++) {
      const idx = Math.floor((k * (n - 1)) / (maxLen - 1) + 0.5);
      subsampled[k] = arr[idx];
    }
    rows = subsampled;
    n = maxLen;
  }

  const rawT = new Array(n);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < n; i++) {
    const x = rows[i][0];
    const y = rows[i][1];
    rawT[i] = rows[i][2];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const tSec = toSeconds(rawT);

  const w = maxX - minX;
  const h = maxY - minY;
  const scale = scaleMode === 'height'
    ? Math.max(h, 0.03 * w, 1e-6)
    : Math.max(w, h, 1e-6);

  const xn = new Float64Array(n);
  const yn = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    xn[i] = (rows[i][0] - minX) / scale;
    yn[i] = (rows[i][1] - minY) / scale;
  }

  const feats = new Float32Array(n * FEATURE_DIM);

  for (let i = 0; i < n; i++) {
    const prevXn = i === 0 ? xn[0] : xn[i - 1];
    const prevYn = i === 0 ? yn[0] : yn[i - 1];
    const prevT = i === 0 ? tSec[0] : tSec[i - 1];

    const dx = xn[i] - prevXn;
    const dy = yn[i] - prevYn;
    const rawDt = tSec[i] - prevT;
    const dt = i === 0 ? 0.0 : Math.max(rawDt, 1e-3);
    const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1e-3);

    // Stroke start: true for index 0 and whenever sid changes from previous
    const sid = rows[i][3];
    const prevSid = i === 0 ? sid : rows[i - 1][3];
    const start = i === 0 || sid !== prevSid ? 1.0 : 0.0;

    // Stroke end: true for index n-1 and whenever sid changes to next
    const nextSid = i === n - 1 ? sid : rows[i + 1][3];
    const end = i === n - 1 || sid !== nextSid ? 1.0 : 0.0;

    const offset = i * FEATURE_DIM;
    feats[offset + 0] = xn[i];
    feats[offset + 1] = yn[i];
    feats[offset + 2] = dx;
    feats[offset + 3] = dy;
    feats[offset + 4] = Math.min(dt * 10.0, 1.0);
    feats[offset + 5] = end;
    feats[offset + 6] = start;
    feats[offset + 7] = Math.min(speed / 5.0, 1.0);
  }

  return feats;
}

/**
 * Complete convenience pipeline: raw strokes -> canonical 8D Float32Array.
 *
 * @param {Array<Array<Object|Array<number>>>} strokes
 * @param {number} maxLen
 * @param {'max'|'height'} [scaleMode='max']
 * @returns {{ features: Float32Array, pointCount: number, dim: number }}
 */
export function strokesToCanonicalFeatures(strokes, maxLen = 256, scaleMode = 'max') {
  const arr = strokesToArray(strokes);
  const features = extractFeatures(arr, maxLen, scaleMode);
  const pointCount = features.length / FEATURE_DIM;
  return {
    features,
    pointCount,
    dim: FEATURE_DIM,
  };
}
