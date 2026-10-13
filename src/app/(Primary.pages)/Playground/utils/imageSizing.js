/**
 * Image Sizing
 *
 * Pictures dropped on the page are stored inside the session, so a 12-megapixel photo would
 * make every save slow and soon overflow storage. They are scaled down once, on the way in,
 * and the block is given the picture's own proportions.
 *
 * The size maths is pure (tested with Node); prepareImage() needs a browser.
 */

export const MAX_IMAGE_SIDE = 1600; // px on the longer side, enough for a sharp full-screen view
export const KEEP_AS_IS_BYTES = 350 * 1024; // small pictures are stored untouched

/** Size after scaling so the longer side is at most maxSide. Never scales up. */
export function scaledImageSize(width, height, maxSide = MAX_IMAGE_SIDE) {
  if (!(width > 0) || !(height > 0)) return { width: 0, height: 0 };
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Block size on the page for a picture: its proportions, fitted inside maxWidth x maxHeight. */
export function fitImageBox(width, height, { maxWidth = 360, maxHeight = 420, minSide = 80 } = {}) {
  if (!(width > 0) || !(height > 0)) return { width: maxWidth, height: Math.round(maxWidth * 0.75) };
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(minSide, Math.round(width * scale)),
    height: Math.max(minSide, Math.round(height * scale)),
  };
}

/**
 * New size for a corner drag that keeps width / height = aspectRatio.
 * The direction dragged furthest decides, so pulling either way resizes.
 */
export function resizeKeepingAspect(startWidth, startHeight, dx, dy, aspectRatio, minWidth = 120) {
  const widthFromX = startWidth + dx;
  const widthFromY = (startHeight + dy) * aspectRatio;
  const useX = Math.abs(dx) >= Math.abs(dy * aspectRatio);
  const width = Math.max(minWidth, useX ? widthFromX : widthFromY);
  return { width: Math.round(width), height: Math.round(width / aspectRatio) };
}

/** Approximate number of bytes held by a base64 data URL. */
export function dataUrlBytes(dataUrl) {
  if (typeof dataUrl !== 'string') return 0;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl.length;
  const isBase64 = dataUrl.slice(0, comma).includes(';base64');
  const payload = dataUrl.length - comma - 1;
  return isBase64 ? Math.floor((payload * 3) / 4) : payload;
}

/** Whether a picture of this size and weight has to be re-encoded before it is stored. */
export function needsShrinking(width, height, bytes, maxSide = MAX_IMAGE_SIDE, keepBytes = KEEP_AS_IS_BYTES) {
  return Math.max(width, height) > maxSide || bytes > keepBytes;
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The picture could not be read.'));
    img.src = dataUrl;
  });
}

/**
 * Reads a picture and returns it ready to store: scaled to at most MAX_IMAGE_SIDE and
 * re-encoded when it is large. Transparent pictures stay transparent where the browser can
 * write WebP; otherwise they are flattened onto white as JPEG.
 *
 * @param {string} dataUrl
 * @returns {Promise<{ dataUrl: string, width: number, height: number, aspectRatio: number, originalBytes: number, bytes: number }>}
 */
export async function prepareImage(dataUrl) {
  const img = await loadImage(dataUrl);
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  const originalBytes = dataUrlBytes(dataUrl);
  const isVector = dataUrl.startsWith('data:image/svg');

  if (!(naturalWidth > 0) || !(naturalHeight > 0) || isVector || !needsShrinking(naturalWidth, naturalHeight, originalBytes)) {
    const w = naturalWidth || 4;
    const h = naturalHeight || 3;
    return { dataUrl, width: w, height: h, aspectRatio: w / h, originalBytes, bytes: originalBytes };
  }

  const target = scaledImageSize(naturalWidth, naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, target.width, target.height);

  let out = canvas.toDataURL('image/webp', 0.85);
  if (!out.startsWith('data:image/webp')) {
    // No WebP encoder (Safari): JPEG has no transparency, so paint onto white first
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, target.width, target.height);
    out = canvas.toDataURL('image/jpeg', 0.85);
  }

  // Re-encoding a small, already well-compressed file can make it bigger: keep the original then
  const bytes = dataUrlBytes(out);
  if (bytes >= originalBytes && Math.max(naturalWidth, naturalHeight) <= MAX_IMAGE_SIDE) {
    return { dataUrl, width: naturalWidth, height: naturalHeight, aspectRatio: naturalWidth / naturalHeight, originalBytes, bytes: originalBytes };
  }
  return { dataUrl: out, width: target.width, height: target.height, aspectRatio: target.width / target.height, originalBytes, bytes };
}
