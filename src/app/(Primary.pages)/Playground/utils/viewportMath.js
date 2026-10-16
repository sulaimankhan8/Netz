/**
 * Viewport Math for the infinite canvas
 *
 * Screen position of a canvas point:  screen = canvas * zoom + pan
 */

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 5;

/**
 * The part of the canvas world that is on screen.
 *
 * @param {{ x: number, y: number }} pan
 * @param {number} zoom
 * @param {number} width - Canvas width on screen (CSS px)
 * @param {number} height - Canvas height on screen (CSS px)
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number }}
 */
export function visibleWorldRect(pan, zoom, width, height) {
  return {
    minX: -pan.x / zoom,
    minY: -pan.y / zoom,
    maxX: (width - pan.x) / zoom,
    maxY: (height - pan.y) / zoom,
  };
}

/**
 * Whether a bounding box, grown by `margin` on every side, touches a rectangle.
 * A box that is missing or not made of numbers counts as touching, so nothing is ever
 * hidden because its box could not be read.
 */
export function boxTouchesRect(box, rect, margin = 0) {
  if (!box || !Number.isFinite(box.minX) || !Number.isFinite(box.minY) || !Number.isFinite(box.maxX) || !Number.isFinite(box.maxY)) {
    return true;
  }
  return (
    box.maxX + margin >= rect.minX &&
    box.minX - margin <= rect.maxX &&
    box.maxY + margin >= rect.minY &&
    box.minY - margin <= rect.maxY
  );
}

/**
 * Changes zoom while keeping the canvas point under `anchor` fixed on screen,
 * so content does not slide away from the cursor, the pinch point or the screen centre.
 *
 * @param {{ x: number, y: number }} pan - Current pan offset (screen px)
 * @param {number} zoom - Current zoom level
 * @param {number} targetZoom - Requested zoom level (clamped to [MIN_ZOOM, MAX_ZOOM])
 * @param {{ x: number, y: number }} anchor - Screen point to hold still, relative to the canvas container
 * @returns {{ zoom: number, pan: { x: number, y: number } }}
 */
/**
 * Fit to content: the zoom and pan that show `box` (canvas coordinates) as large as possible in
 * the free part of the screen, the area left by `insets` (top bar, dock), with `margin` px all
 * round. The zoom stays within [MIN_ZOOM, MAX_ZOOM]; a small box is not blown up past 100% unless
 * maxZoom says so. No box (an empty page): back to 100% with the page origin top-left.
 *
 * @param {{ minX, minY, maxX, maxY } | null} box
 * @param {number} width - Screen width (CSS px)
 * @param {number} height - Screen height (CSS px)
 * @param {{ top?: number, bottom?: number, left?: number, right?: number }} [insets]
 * @returns {{ zoom: number, pan: { x: number, y: number } }}
 */
export function fitViewToBox(box, width, height, insets = {}, { margin = 48, maxZoom = 1 } = {}) {
  const top = insets.top || 0;
  const bottom = insets.bottom || 0;
  const left = insets.left || 0;
  const right = insets.right || 0;
  if (!box || !Number.isFinite(box.minX) || !Number.isFinite(box.maxX) || !Number.isFinite(box.minY) || !Number.isFinite(box.maxY)) {
    return { zoom: 1, pan: { x: left, y: top } };
  }
  const freeW = Math.max(1, width - left - right - 2 * margin);
  const freeH = Math.max(1, height - top - bottom - 2 * margin);
  const boxW = Math.max(1, box.maxX - box.minX);
  const boxH = Math.max(1, box.maxY - box.minY);
  const zoom = Math.min(Math.max(Math.min(freeW / boxW, freeH / boxH, maxZoom), MIN_ZOOM), MAX_ZOOM);
  const centreX = left + (width - left - right) / 2;
  const centreY = top + (height - top - bottom) / 2;
  return {
    zoom,
    pan: {
      x: centreX - ((box.minX + box.maxX) / 2) * zoom,
      y: centreY - ((box.minY + box.maxY) / 2) * zoom,
    },
  };
}

export function zoomAtPoint(pan, zoom, targetZoom, anchor) {
  const nextZoom = Math.min(Math.max(targetZoom, MIN_ZOOM), MAX_ZOOM);
  if (nextZoom === zoom) return { zoom, pan };
  const ratio = nextZoom / zoom;
  return {
    zoom: nextZoom,
    pan: {
      x: anchor.x - (anchor.x - pan.x) * ratio,
      y: anchor.y - (anchor.y - pan.y) * ratio,
    },
  };
}
