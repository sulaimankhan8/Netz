/**
 * Splits one tall picture of a page into pieces that each fit a PDF page, for the PDF exports
 * (Notes and the method calculators). A cut is moved up to the nearest row where nothing is drawn
 * across the page, so a card, a table row or a line of text is not sliced in half.
 */

// How far above the end of a page a cut may move (as a share of the page) to find a clean row
const MAX_BACK = 0.4;
// Neighbouring pixels closer than this (summed over red, green, blue) count as the same colour
const SAME_COLOUR = 24;
// Every 2nd pixel is enough to tell a clean row from one with content
const STEP = 2;

/** How many times the colour changes along one row of RGBA pixel data. 0 means the row is one flat colour. */
export function rowChanges(data, width, row) {
  let changes = 0;
  let at = row * width * 4;
  let r = data[at];
  let g = data[at + 1];
  let b = data[at + 2];
  for (let x = STEP; x < width; x += STEP) {
    at = (row * width + x) * 4;
    if (Math.abs(data[at] - r) + Math.abs(data[at + 1] - g) + Math.abs(data[at + 2] - b) > SAME_COLOUR) changes++;
    r = data[at];
    g = data[at + 1];
    b = data[at + 2];
  }
  return changes;
}

/**
 * Where to cut inside a strip of rows that ends at the page's last row. Returns a row count from
 * the top of the strip: `rows` cuts at the page end, less cuts higher up.
 * Picks the lowest flat row (the middle of its gap); with no flat row, the row with the least on it.
 */
export function findCutRow(data, width, rows) {
  let best = rows;
  let bestChanges = Infinity;
  for (let row = rows - 1; row >= 0; row--) {
    const changes = rowChanges(data, width, row);
    if (changes === 0) {
      let top = row;
      while (top > 0 && rowChanges(data, width, top - 1) === 0) top--;
      // A gap that reaches the top of the strip may go on above it; cut at its lower end then
      return top === 0 ? row + 1 : Math.ceil((top + row + 1) / 2);
    }
    if (changes < bestChanges) {
      bestChanges = changes;
      best = row + 1;
    }
  }
  return best;
}

/**
 * Cuts `canvas` into page pieces (browser only). `firstPageHeight` and `pageHeight` are the room
 * on the first and the later pages, in canvas pixels. Returns canvases, top to bottom.
 */
export function sliceCanvasForPages(canvas, firstPageHeight, pageHeight) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const pieces = [];
  let top = 0;
  while (top < canvas.height) {
    const room = Math.max(1, Math.floor(pieces.length ? pageHeight : firstPageHeight));
    let bottom = canvas.height;
    if (canvas.height - top > room) {
      const ideal = top + room;
      const earliest = top + Math.max(1, Math.ceil(room * (1 - MAX_BACK)));
      const strip = context.getImageData(0, earliest, canvas.width, ideal - earliest);
      bottom = earliest + findCutRow(strip.data, strip.width, strip.height);
    }
    const height = bottom - top;
    // A last piece with nothing on it (only the page's bottom padding) would be an empty page
    const isLast = bottom >= canvas.height;
    let empty = false;
    if (isLast && pieces.length) {
      const rest = context.getImageData(0, top, canvas.width, height);
      empty = true;
      for (let row = 0; row < rest.height && empty; row++) empty = rowChanges(rest.data, rest.width, row) === 0;
    }
    if (!empty) {
      const piece = document.createElement('canvas');
      piece.width = canvas.width;
      piece.height = height;
      piece.getContext('2d').drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);
      pieces.push(piece);
    }
    top = bottom;
  }
  return pieces;
}
