/**
 * Stroke Rasterizer — Converts InkStroke arrays into optimized bitmap PNG images
 * for Tesseract.js OCR engine.
 *
 * Optimizations for handwriting accuracy:
 * - Upscales small strokes to an optimal character height (~180px - 240px)
 * - Renders thicker anti-aliased strokes (6-10px) with round caps/joins
 * - Adds generous margins so character boundaries aren't clipped
 */

const TARGET_MIN_HEIGHT = 160;
const TARGET_MAX_HEIGHT = 400;
const RASTER_PADDING = 32;
const RASTER_STROKE_COLOR = '#000000';
const RASTER_BG_COLOR = '#FFFFFF';

/**
 * Computes tight bounding box across an array of InkStroke objects.
 */
export function getStrokesBBox(strokes) {
  if (!strokes || strokes.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    if (s.bbox) {
      minX = Math.min(minX, s.bbox.minX);
      minY = Math.min(minY, s.bbox.minY);
      maxX = Math.max(maxX, s.bbox.maxX);
      maxY = Math.max(maxY, s.bbox.maxY);
    } else if (s.points && s.points.length > 0) {
      for (let j = 0; j < s.points.length; j++) {
        const p = s.points[j];
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    }
  }

  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * Segments an array of strokes into horizontal lines and discrete words based on spatial gaps.
 * Essential for Vision Transformers (TrOCR) so attention is focused on individual words.
 *
 * @param {Array} strokes - Array of InkStroke objects
 * @returns {Array<{ lineIndex: number, words: Array<Array<InkStroke>> }>}
 */
export function segmentStrokesIntoWords(strokes) {
  if (!strokes || strokes.length === 0) return [];
  if (strokes.length === 1) {
    return [{ lineIndex: 0, words: [strokes] }];
  }

  // Ensure each stroke has a bounding box
  const strokeList = strokes.map((s) => {
    const bbox = s.bbox || getStrokesBBox([s]) || { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    return {
      stroke: s,
      bbox,
      centerY: (bbox.minY + bbox.maxY) / 2,
      height: Math.max(bbox.maxY - bbox.minY, 15),
    };
  });

  // Calculate average stroke height across cluster
  const totalHeight = strokeList.reduce((sum, item) => sum + item.height, 0);
  const avgHeight = Math.max(totalHeight / strokeList.length, 20);

  // Group strokes into horizontal lines based on baseline/centerY
  strokeList.sort((a, b) => a.centerY - b.centerY);

  const lines = [];
  for (const item of strokeList) {
    let matchedLine = null;
    for (const line of lines) {
      if (Math.abs(line.centerY - item.centerY) < Math.max(avgHeight * 0.7, 30)) {
        matchedLine = line;
        break;
      }
    }

    if (matchedLine) {
      matchedLine.items.push(item);
      const sumY = matchedLine.items.reduce((s, it) => s + it.centerY, 0);
      matchedLine.centerY = sumY / matchedLine.items.length;
    } else {
      lines.push({
        centerY: item.centerY,
        items: [item],
      });
    }
  }

  // Sort lines top-to-bottom
  lines.sort((a, b) => a.centerY - b.centerY);

  // Dynamic word gap threshold: ~40% of stroke height, minimum 26px, maximum 55px
  const wordGapThreshold = Math.min(Math.max(avgHeight * 0.45, 26), 55);

  const result = [];

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const line = lines[lIdx];
    // Sort strokes in line left-to-right
    line.items.sort((a, b) => a.bbox.minX - b.bbox.minX);

    const words = [];
    let currentWordStrokes = [line.items[0].stroke];
    let currentWordMaxX = line.items[0].bbox.maxX;

    for (let i = 1; i < line.items.length; i++) {
      const item = line.items[i];
      const gap = item.bbox.minX - currentWordMaxX;

      if (gap <= wordGapThreshold) {
        // Same word: merge
        currentWordStrokes.push(item.stroke);
        currentWordMaxX = Math.max(currentWordMaxX, item.bbox.maxX);
      } else {
        // New word: push completed word and start next
        words.push(currentWordStrokes);
        currentWordStrokes = [item.stroke];
        currentWordMaxX = item.bbox.maxX;
      }
    }

    if (currentWordStrokes.length > 0) {
      words.push(currentWordStrokes);
    }

    result.push({
      lineIndex: lIdx,
      words,
    });
  }

  return result;
}

/**
 * Rasterizes an array of InkStroke objects to a base64-encoded PNG data URL.
 *
 * @param {Array} strokes - Array of InkStroke objects with .points[], .width, .color
 * @param {Object} [bbox] - Optional bounding box { minX, minY, maxX, maxY } (auto-calculated if omitted)
 * @param {Object} [options] - Optional overrides: { padding, targetHeight }
 * @returns {{ dataUrl: string, width: number, height: number } | null} Rasterized image result
 */
export function rasterizeStrokesToDataUrl(strokes, bbox = null, options = {}) {
  const padding = options.padding ?? RASTER_PADDING;

  if (!strokes || strokes.length === 0) {
    return null;
  }

  const effectiveBBox = bbox || getStrokesBBox(strokes);
  if (!effectiveBBox) return null;

  // Calculate raw cluster dimensions
  const rawWidth = Math.max(effectiveBBox.maxX - effectiveBBox.minX, 20);
  const rawHeight = Math.max(effectiveBBox.maxY - effectiveBBox.minY, 20);

  // Calculate scaling factor so handwriting is at optimal OCR resolution (height ~180-240px)
  let scale = 1.0;
  if (rawHeight < TARGET_MIN_HEIGHT) {
    scale = Math.min(TARGET_MIN_HEIGHT / rawHeight, 3.5);
  } else if (rawHeight > TARGET_MAX_HEIGHT) {
    scale = TARGET_MAX_HEIGHT / rawHeight;
  }

  const scaledWidth = Math.round(rawWidth * scale);
  const scaledHeight = Math.round(rawHeight * scale);

  const canvasWidth = scaledWidth + padding * 2;
  const canvasHeight = scaledHeight + padding * 2;

  // Create canvas
  let canvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Fill crisp white background
  ctx.fillStyle = RASTER_BG_COLOR;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Set high quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw each stroke as bold black lines
  for (let i = 0; i < strokes.length; i++) {
    const stroke = strokes[i];
    const points = stroke.points;
    if (!points || points.length === 0) continue;

    ctx.beginPath();
    ctx.strokeStyle = RASTER_STROKE_COLOR;
    // Thicken stroke for OCR recognition (optimal 6-8px on scaled canvas)
    ctx.lineWidth = Math.max(5, (stroke.width || 3) * scale * 1.3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
      // Single point dot (e.g. dot on 'i' or period '.')
      const ptX = (points[0].x - bbox.minX) * scale + padding;
      const ptY = (points[0].y - bbox.minY) * scale + padding;
      ctx.arc(ptX, ptY, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = RASTER_STROKE_COLOR;
      ctx.fill();
      continue;
    }

    const x0 = (points[0].x - bbox.minX) * scale + padding;
    const y0 = (points[0].y - bbox.minY) * scale + padding;
    ctx.moveTo(x0, y0);

    for (let j = 1; j < points.length; j++) {
      const x = (points[j].x - bbox.minX) * scale + padding;
      const y = (points[j].y - bbox.minY) * scale + padding;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  // Export to base64 data URL
  if (canvas instanceof OffscreenCanvas) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(canvas, 0, 0);
    return {
      dataUrl: exportCanvas.toDataURL('image/png'),
      width: canvasWidth,
      height: canvasHeight,
    };
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvasWidth,
    height: canvasHeight,
  };
}

/**
 * Extracts raw base64 payload from data URL
 */
export function extractBase64FromDataUrl(dataUrl) {
  if (!dataUrl) return '';
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return dataUrl;
  return dataUrl.substring(commaIndex + 1);
}
