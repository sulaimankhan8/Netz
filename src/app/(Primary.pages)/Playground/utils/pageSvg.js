/**
 * Page Geometry & Vector SVG Builder
 *
 * Builds an export of a whole page from its stroke data, wherever the view happens to be
 * panned or zoomed, and without any of the app's toolbars. Ink is written as real SVG paths
 * using the same geometry the canvas draws (strokeSmoother.js), so it scales without blur.
 *
 * Pure functions with no browser dependencies, so they can be tested with Node.
 */

import { pressureWidth } from './strokeSmoother.js';
import { shapeToSvg } from './shapes/shapeRender.js';
import { shapeWorldBounds } from './shapes/shapeModel.js';

const PAGE_MARGIN = 32; // canvas px of empty space kept around the content

const round = (value) => Math.round(value * 100) / 100;

/** Highlighter marks are painted first, so they sit under the writing instead of dimming it. */
export function orderStrokesForPainting(strokes) {
  const highlights = [];
  const rest = [];
  for (let i = 0; i < strokes.length; i++) {
    (strokes[i].tool === 'highlighter' ? highlights : rest).push(strokes[i]);
  }
  return highlights.concat(rest);
}

/** Painted width of a stroke (the highlighter is drawn four times its nominal width). */
export function paintedWidth(stroke) {
  const width = stroke.width || 3;
  return stroke.tool === 'highlighter' ? width * 4 : width;
}

/**
 * Bounding box of everything on the page: strokes (including their thickness) and blocks.
 *
 * @param {Array<Object>} strokes
 * @param {Array<{ x: number, y: number, width: number, height: number }>} blockRects
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number, width: number, height: number }|null}
 */
export function getPageBounds(strokes = [], blockRects = []) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < strokes.length; i++) {
    const box = strokes[i].bbox;
    if (!box) continue;
    const half = paintedWidth(strokes[i]) / 2;
    if (box.minX - half < minX) minX = box.minX - half;
    if (box.minY - half < minY) minY = box.minY - half;
    if (box.maxX + half > maxX) maxX = box.maxX + half;
    if (box.maxY + half > maxY) maxY = box.maxY + half;
  }
  for (let i = 0; i < blockRects.length; i++) {
    const r = blockRects[i];
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.width > maxX) maxX = r.x + r.width;
    if (r.y + r.height > maxY) maxY = r.y + r.height;
  }

  if (!Number.isFinite(minX)) return null;

  minX = Math.floor(minX - PAGE_MARGIN);
  minY = Math.floor(minY - PAGE_MARGIN);
  maxX = Math.ceil(maxX + PAGE_MARGIN);
  maxY = Math.ceil(maxY + PAGE_MARGIN);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Shapes as { x, y, width, height } boxes (rotation and outline included), for getPageBounds. */
export function shapeRects(shapes = []) {
  return shapes.map((s) => {
    const b = shapeWorldBounds(s);
    return { x: b.minX, y: b.minY, width: b.maxX - b.minX, height: b.maxY - b.minY };
  });
}

/**
 * SVG markup for one stroke, matching drawSmoothStroke():
 * a dot, a straight segment, a sharp-cornered shape, or a curve through the midpoints.
 */
export function strokeToSvg(stroke) {
  const points = stroke.points || [];
  if (points.length === 0) return '';

  const width = paintedWidth(stroke);
  const isHighlighter = stroke.tool === 'highlighter';
  const opacity = isHighlighter ? 0.35 : stroke.opacity !== undefined ? stroke.opacity : 1;
  const color = stroke.color || '#3B82F6';
  const opacityAttr = opacity < 1 ? ` stroke-opacity="${opacity}"` : '';

  if (points.length === 1) {
    const fillOpacity = opacity < 1 ? ` fill-opacity="${opacity}"` : '';
    return `<circle cx="${round(points[0].x)}" cy="${round(points[0].y)}" r="${round(width / 2)}" fill="${color}"${fillOpacity}/>`;
  }

  const isSharpShape = stroke.shape && stroke.shape !== 'circle' && stroke.shape !== 'ellipse';

  // Pressure-sensitive ink: one short path per span, each at the width its pressure asks for
  if (stroke.hasPressure && !isHighlighter && !isSharpShape && opacity >= 1 && points.length >= 3) {
    const spans = [];
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      const from = i === 1 ? prev : { x: (prev.x + current.x) / 2, y: (prev.y + current.y) / 2 };
      const to = next
        ? `Q${round(current.x)} ${round(current.y)} ${round((current.x + next.x) / 2)} ${round((current.y + next.y) / 2)}`
        : `L${round(current.x)} ${round(current.y)}`;
      spans.push(`<path d="M${round(from.x)} ${round(from.y)}${to}" stroke-width="${round(pressureWidth(width, current.pressure))}"/>`);
    }
    return `<g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">${spans.join('')}</g>`;
  }

  let d = `M${round(points[0].x)} ${round(points[0].y)}`;

  if (points.length === 2 || isSharpShape) {
    for (let i = 1; i < points.length; i++) d += `L${round(points[i].x)} ${round(points[i].y)}`;
    const first = points[0];
    const last = points[points.length - 1];
    if (isSharpShape && first.x === last.x && first.y === last.y) d += 'Z';
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      d += `Q${round(current.x)} ${round(current.y)} ${round((current.x + next.x) / 2)} ${round((current.y + next.y) / 2)}`;
    }
    const last = points[points.length - 1];
    d += `L${round(last.x)} ${round(last.y)}`;
  }

  const join = isSharpShape ? 'miter' : 'round';
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${round(width)}" stroke-linecap="round" stroke-linejoin="${join}"${opacityAttr}/>`;
}

/**
 * A complete SVG document for a page.
 *
 * @param {Object} page
 * @param {Array<Object>} page.strokes
 * @param {Array<Object>} [page.shapes] - Shapes, painted under the ink as on screen
 * @param {Object} [page.shapeOptions] - { measure, darkPage }: how shape text is measured, and the page colour for automatic text
 * @param {Array<{ x, y, width, height, dataUrl }>} [page.blockImages] - Blocks rendered to images, placed over the ink as on screen
 * @param {Object} page.bounds - From getPageBounds()
 * @param {string|null} [page.background] - Fill colour, or null for a transparent page
 * @returns {string}
 */
export function buildPageSvg({ strokes = [], shapes = [], shapeOptions = {}, blockImages = [], bounds, background = null }) {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">`,
  ];
  if (background) {
    parts.push(`<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${background}"/>`);
  }

  for (let i = 0; i < shapes.length; i++) {
    const markup = shapeToSvg(shapes[i], shapeOptions);
    if (markup) parts.push(markup);
  }

  const ordered = orderStrokesForPainting(strokes);
  for (let i = 0; i < ordered.length; i++) {
    const markup = strokeToSvg(ordered[i]);
    if (markup) parts.push(markup);
  }

  for (let i = 0; i < blockImages.length; i++) {
    const b = blockImages[i];
    parts.push(`<image x="${round(b.x)}" y="${round(b.y)}" width="${round(b.width)}" height="${round(b.height)}" href="${b.dataUrl}" xlink:href="${b.dataUrl}"/>`);
  }

  parts.push('</svg>');
  return parts.join('\n');
}
