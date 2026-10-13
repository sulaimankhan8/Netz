/**
 * Pointer Events Handler Utility for NETZ Smart Whiteboard Playground
 * Normalizes Pen, Touch, and Mouse inputs, rejects a resting palm while a pen is in use,
 * extracts hardware coalesced events (120Hz-240Hz digitizer sampling),
 * and maps viewport client coordinates to infinite canvas space.
 */

/**
 * Transforms screen client coordinates (e.clientX, e.clientY)
 * into transformed Infinite Canvas space coordinates.
 */
export function getCanvasCoordinates(clientX, clientY, rect, transform) {
  // Relative position inside the canvas bounding rect
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;

  // Apply inverse viewport transform: (Screen - Pan) / Zoom
  const canvasX = (screenX - transform.panOffset.x) / transform.zoomLevel;
  const canvasY = (screenY - transform.panOffset.y) / transform.zoomLevel;

  return { x: canvasX, y: canvasY };
}

// A palm often brushes the screen just after the pen lifts: touches are ignored for this long
export const PEN_PALM_GUARD_MS = 700;

/**
 * Palm rejection for touch input.
 *
 * Every kind of pointer may draw: mouse, trackpad cursor, finger and pen. A touch is only
 * rejected while it is likely to be the hand that holds a pen, that is while the pen is on
 * the screen or has just left it. Nothing is rejected on a device where no pen is in use,
 * and contact size is not used: an ordinary fingertip is often reported wider than 25 px.
 *
 * @param {{ isDown: boolean, lastActive: number }} penState - lastActive is a performance.now() time
 * @param {number} now - performance.now()
 */
export function shouldRejectTouch(penState, now) {
  if (penState.isDown) return true;
  return now - penState.lastActive < PEN_PALM_GUARD_MS;
}

/**
 * Extracts all point data from a PointerEvent, including hardware coalesced events
 * (sub-frame digitizer points sampled between browser animation frames).
 */
export function extractPointerPoints(e, canvasRect, transform) {
  const points = [];

  // Try extracting coalesced events if supported by hardware/browser.
  // The list is empty for anything but move events (pointerdown, pointerup), so fall back to the
  // event itself: otherwise the first point of every stroke is lost and a tap draws no dot at all.
  const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
  const coalescedEvents = coalesced.length > 0 ? coalesced : [e];

  for (let i = 0; i < coalescedEvents.length; i++) {
    const ev = coalescedEvents[i];
    const coords = getCanvasCoordinates(ev.clientX, ev.clientY, canvasRect, transform);

    // Normalize pressure: stylus provides 0.0-1.0; mouse/touch defaults to 0.5 if unsupported
    let pressure = ev.pressure;
    if (pressure === 0 || pressure === undefined) {
      pressure = 0.5;
    }

    const point = {
      x: coords.x,
      y: coords.y,
      pressure,
      timestamp: ev.timeStamp || performance.now(),
      pointerType: ev.pointerType || 'mouse',
    };
    // A stylus also reports how it is leaning (degrees); kept for tilt-aware pens
    if (ev.pointerType === 'pen' && (ev.tiltX || ev.tiltY)) {
      point.tiltX = ev.tiltX;
      point.tiltY = ev.tiltY;
    }
    points.push(point);
  }

  return points;
}
