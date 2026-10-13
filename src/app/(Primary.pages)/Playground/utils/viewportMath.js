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
