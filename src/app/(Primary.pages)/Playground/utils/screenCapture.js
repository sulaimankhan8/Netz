/**
 * Insert > Screenshot: the geometry of choosing a region on a captured picture (rectangle,
 * oval, rounded rectangle or polygon, as in WPS Office), mapping screen positions to the
 * picture's own pixels, and the crop. Capturing itself needs a browser (captureScreenFrame).
 *
 * The geometry is pure, so it can be tested with Node.
 */

export const SCREENSHOT_SHAPES = ['rect', 'oval', 'rounded', 'polygon'];
const ROUNDED_SHARE = 0.12; // corner radius of a rounded screenshot, as a share of its shorter side
const MIN_REGION = 4; // px of the picture

/** The region between two corners, inside the picture. */
export function regionFromCorners(a, b, size) {
  const x0 = Math.max(0, Math.min(a.x, b.x));
  const y0 = Math.max(0, Math.min(a.y, b.y));
  const x1 = Math.min(size.width, Math.max(a.x, b.x));
  const y1 = Math.min(size.height, Math.max(a.y, b.y));
  return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
}

/** Box around polygon points, inside the picture. */
export function polygonRegion(points, size) {
  if (!points || points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return regionFromCorners({ x: Math.min(...xs), y: Math.min(...ys) }, { x: Math.max(...xs), y: Math.max(...ys) }, size);
}

export function isUsableRegion(region) {
  return Boolean(region && region.w >= MIN_REGION && region.h >= MIN_REGION);
}

/** A region moved by (dx, dy), kept inside the picture. */
export function moveRegion(region, dx, dy, size) {
  return {
    ...region,
    x: Math.max(0, Math.min(size.width - region.w, region.x + dx)),
    y: Math.max(0, Math.min(size.height - region.h, region.y + dy)),
  };
}

/**
 * A region resized from one of its 8 handles ('nw', 'n', ... as on shapes), the opposite side
 * staying put, kept inside the picture.
 */
export function resizeRegion(region, handle, point, size) {
  let { x, y, w, h } = region;
  let x1 = x + w;
  let y1 = y + h;
  if (handle.includes('w')) x = Math.min(x1 - MIN_REGION, Math.max(0, point.x));
  if (handle.includes('e')) x1 = Math.max(x + MIN_REGION, Math.min(size.width, point.x));
  if (handle.includes('n')) y = Math.min(y1 - MIN_REGION, Math.max(0, point.y));
  if (handle.includes('s')) y1 = Math.max(y + MIN_REGION, Math.min(size.height, point.y));
  return { x, y, w: x1 - x, h: y1 - y };
}

/**
 * Where the picture is drawn on screen when it is fitted into a box (letterboxed), and how to go
 * from screen positions to the picture's pixels and back.
 */
export function fitPicture(size, box) {
  const scale = Math.min(box.width / size.width, box.height / size.height);
  const width = size.width * scale;
  const height = size.height * scale;
  const left = box.left + (box.width - width) / 2;
  const top = box.top + (box.height - height) / 2;
  return {
    scale,
    left,
    top,
    width,
    height,
    toPicture: (p) => ({ x: Math.max(0, Math.min(size.width, (p.x - left) / scale)), y: Math.max(0, Math.min(size.height, (p.y - top) / scale)) }),
    toScreen: (p) => ({ x: left + p.x * scale, y: top + p.y * scale }),
  };
}

/** The radius of a rounded screenshot's corners. */
export function roundedRadius(region) {
  return Math.min(region.w, region.h) * ROUNDED_SHARE;
}

/**
 * The outline of the chosen area as SVG path data, in picture pixels relative to the region's
 * top-left: what is kept. Outside it the screenshot is transparent.
 */
export function regionOutline(shape, region, points = []) {
  const { w, h } = region;
  const r = (n) => Math.round(n * 100) / 100;
  if (shape === 'oval') {
    return `M0 ${r(h / 2)}A${r(w / 2)} ${r(h / 2)} 0 1 0 ${r(w)} ${r(h / 2)}A${r(w / 2)} ${r(h / 2)} 0 1 0 0 ${r(h / 2)}Z`;
  }
  if (shape === 'rounded') {
    const k = r(roundedRadius(region));
    return `M${k} 0H${r(w - k)}A${k} ${k} 0 0 1 ${r(w)} ${k}V${r(h - k)}A${k} ${k} 0 0 1 ${r(w - k)} ${r(h)}H${k}A${k} ${k} 0 0 1 0 ${r(h - k)}V${k}A${k} ${k} 0 0 1 ${k} 0Z`;
  }
  if (shape === 'polygon' && points.length >= 3) {
    return `${points.map((p, i) => `${i ? 'L' : 'M'}${r(p.x - region.x)} ${r(p.y - region.y)}`).join('')}Z`;
  }
  return `M0 0H${r(w)}V${r(h)}H0Z`;
}

/** Whether a polygon point is close enough to the first to close the polygon (picture px). */
export function closesPolygon(points, point, tolerance) {
  if (points.length < 3) return false;
  return Math.hypot(points[0].x - point.x, points[0].y - point.y) <= tolerance;
}

/** The pixel size of a cropped screenshot (whole pixels, at least 1). */
export function cropSize(region) {
  return { width: Math.max(1, Math.round(region.w)), height: Math.max(1, Math.round(region.h)) };
}

// ── Browser ──────────────────────────────────────────────────────────────────

/** Whether this browser lets a page capture the screen (desktop browsers; not iOS, not Android). */
export function canCaptureScreen() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
}

/**
 * Asks the browser for a screen, window or tab and takes one frame of it. Sharing stops at once,
 * so the browser's "sharing" bar goes away. delayMs: wait before taking the frame (to switch to
 * another window: the "Hide Current Window" choice).
 *
 * @returns {Promise<HTMLCanvasElement>} the frame at its full pixel size
 */
export async function captureScreenFrame({ delayMs = 0, onCountdown } = {}) {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false, preferCurrentTab: false, selfBrowserSurface: 'include', surfaceSwitching: 'exclude' });
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    for (let left = Math.ceil(delayMs / 1000); left > 0; left--) {
      if (onCountdown) onCountdown(left);
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (onCountdown) onCountdown(0);
    // A frame that has really been drawn
    await new Promise((r) => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(() => r()) : requestAnimationFrame(() => r())));
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas;
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

/**
 * The chosen area of a picture as a new canvas: transparent outside an oval, rounded or polygon
 * outline. `marks` (optional) is drawn on top, already in picture pixels.
 */
export function cropPicture(source, shape, region, points = [], marks = null) {
  const size = cropSize(region);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  ctx.save();
  if (shape !== 'rect') {
    ctx.clip(new Path2D(regionOutline(shape, region, points)));
  }
  ctx.drawImage(source, region.x, region.y, region.w, region.h, 0, 0, size.width, size.height);
  if (marks) ctx.drawImage(marks, region.x, region.y, region.w, region.h, 0, 0, size.width, size.height);
  ctx.restore();
  return canvas;
}

/** Hides details in a rectangle of a canvas by turning it into large squares (Mosaic). */
export function mosaic(ctx, rect, cell = 12) {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const w = Math.min(ctx.canvas.width - x0, Math.ceil(rect.w));
  const h = Math.min(ctx.canvas.height - y0, Math.ceil(rect.h));
  if (w <= 0 || h <= 0) return;
  const data = ctx.getImageData(x0, y0, w, h);
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const i = (y * w + x) * 4;
      ctx.fillStyle = `rgba(${data.data[i]}, ${data.data[i + 1]}, ${data.data[i + 2]}, ${data.data[i + 3] / 255})`;
      ctx.fillRect(x0 + x, y0 + y, Math.min(cell, w - x), Math.min(cell, h - y));
    }
  }
}
