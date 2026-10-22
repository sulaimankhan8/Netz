/**
 * Vector & Raster Page Export Engine
 * Generates high-resolution PNG images, standalone SVG vector files,
 * and PDF documents of a whole Playground page.
 *
 * The page is rebuilt from its data rather than photographed from the screen:
 *   - ink comes from the stroke data, so everything on the page is included wherever the view
 *     is panned or zoomed, and none of the app's toolbars appear in the result
 *   - in SVG the ink is real vector paths (pageSvg.js)
 *   - Smart Blocks (equations, graphs, text, images) are HTML, so each one is rendered to an
 *     image with html-to-image and placed at its position on the page
 */

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { drawSmoothStroke } from './strokeSmoother';
import { getPageBounds, buildPageSvg, orderStrokesForPainting, shapeRects } from './pageSvg';
import { drawShapeOnCanvas } from './shapes/shapeRender';
import { inkGoesOver } from './blockLayers';
import { browserMeasure } from './shapes/shapeText';

const BLOCK_PIXEL_RATIO = 2;
const MAX_RASTER_SIDE = 8000; // px: keeps very large pages within what browsers can allocate

/**
 * Downloads a blob or data URL as a file.
 */
function downloadFile(dataUrl, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Renders every Smart Block on the page to an image.
 * Blocks are found by their data-block-id attribute (SmartBlockWrapper).
 *
 * @returns {Promise<Array<{ x, y, width, height, dataUrl }>>} In canvas coordinates
 */
async function captureBlockImages(blocks, containerElement) {
  const images = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const node = containerElement ? containerElement.querySelector(`[data-block-id="${block.blockId}"]`) : null;
    if (!node) continue;
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: BLOCK_PIXEL_RATIO,
        cacheBust: true,
        // On screen the block is positioned and zoomed with a CSS transform; the capture is taken flat
        style: { transform: 'none' },
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
      images.push({ x: block.position.x, y: block.position.y, width: node.offsetWidth, height: node.offsetHeight, dataUrl, underInk: inkGoesOver(block) });
    } catch (err) {
      console.error('Failed to capture block for export:', block.blockId, err);
    }
  }
  return images;
}

/**
 * Draws the page onto a new canvas: at 2 pixels per page unit, or at `pixelsPerUnit` when given.
 * underlay: a canvas stretched over the whole result before anything else (the grid on screen).
 */
async function renderPageToCanvas({ strokes, shapes = [], darkPage = false, blockImages, bounds, background, pixelsPerUnit = 2, underlay = null }) {
  const scale = Math.min(pixelsPerUnit, MAX_RASTER_SIDE / Math.max(bounds.width, bounds.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bounds.width * scale));
  canvas.height = Math.max(1, Math.round(bounds.height * scale));

  const ctx = canvas.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (underlay && underlay.width > 0 && underlay.height > 0) ctx.drawImage(underlay, 0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, -bounds.minX * scale, -bounds.minY * scale);

  // Shapes under the ink, as on screen
  for (let i = 0; i < shapes.length; i++) drawShapeOnCanvas(ctx, shapes[i], { scale, measure: browserMeasure, darkPage });

  // Blocks with "Draw on it" go under the ink, the rest over it, as on screen
  const drawBlocks = async (under) => {
    for (let i = 0; i < blockImages.length; i++) {
      const b = blockImages[i];
      if (Boolean(b.underInk) !== under) continue;
      const img = await loadImage(b.dataUrl);
      ctx.drawImage(img, b.x, b.y, b.width, b.height);
    }
  };
  await drawBlocks(true);

  const ordered = orderStrokesForPainting(strokes);
  for (let i = 0; i < ordered.length; i++) {
    const stroke = ordered[i];
    drawSmoothStroke(ctx, stroke.points, {
      color: stroke.color,
      width: stroke.width,
      tool: stroke.tool,
      shape: stroke.shape,
      opacity: stroke.opacity,
      hasPressure: stroke.hasPressure,
    });
  }

  await drawBlocks(false);

  return canvas;
}

/**
 * The part of the page that is on screen, as a picture (Insert > Screenshot > Screen Grab Main
 * Window): ink, shapes, blocks and the grid as they are shown, at the screen's own sharpness,
 * rebuilt from the page's data so none of the app's toolbars or menus appear in it.
 *
 * @param {Object} page - As for exportPage, plus:
 * @param {{ x: number, y: number, width: number, height: number }} page.view - What is on screen, in page units
 * @param {number} page.pixelsPerUnit - Screen pixels per page unit (zoom × device pixel ratio)
 * @param {HTMLCanvasElement} [page.grid] - The grid canvas on screen, drawn under everything
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderView({ strokes = [], blocks = [], shapes = [], darkPage = false, containerElement, view, pixelsPerUnit = 1, grid = null, background = '#FFFFFF' }) {
  const onScreen = blocks.filter((b) => {
    const w = (b.size && b.size.width) || 0;
    const h = (b.size && typeof b.size.height === 'number' ? b.size.height : 0) || 0;
    return b.position && b.position.x < view.x + view.width && b.position.x + w > view.x && b.position.y < view.y + view.height && b.position.y + h > view.y;
  });
  const blockImages = await captureBlockImages(onScreen, containerElement);
  return renderPageToCanvas({
    strokes,
    shapes,
    darkPage,
    blockImages,
    bounds: { minX: view.x, minY: view.y, width: view.width, height: view.height },
    background,
    pixelsPerUnit,
    underlay: grid,
  });
}

/**
 * Exports the whole page.
 *
 * @param {'PNG'|'SVG'|'PDF'} format
 * @param {Object} page
 * @param {Array<Object>} page.strokes - All ink strokes on the page
 * @param {Array<Object>} page.blocks - Smart Blocks on the page
 * @param {Array<Object>} [page.shapes] - Shapes on the page
 * @param {boolean} [page.darkPage] - The page is dark (automatic text colour in text boxes)
 * @param {HTMLElement} page.containerElement - Element that contains the rendered blocks
 * @param {string} [page.fileBaseName='netz-whiteboard']
 * @param {string} [page.background] - Page colour
 * @param {boolean} [page.mark] - Free plan: a small "Made with NETZ" in the PDF's corner (Pro exports are clean)
 * @returns {Promise<{ ok: boolean, reason?: string, fileName?: string, width?: number, height?: number }>}
 */
export async function exportPage(format, { strokes = [], blocks = [], shapes = [], darkPage = false, containerElement, fileBaseName = 'netz-whiteboard', background = '#FFFFFF', mark = false }) {
  try {
    const blockImages = await captureBlockImages(blocks, containerElement);
    const bounds = getPageBounds(strokes, [...blockImages, ...shapeRects(shapes)]);
    if (!bounds) return { ok: false, reason: 'empty' };

    if (format === 'SVG') {
      const svg = buildPageSvg({ strokes, shapes, shapeOptions: { measure: browserMeasure, darkPage }, blockImages, bounds, background });
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      downloadFile(url, `${fileBaseName}.svg`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return { ok: true, fileName: `${fileBaseName}.svg`, width: bounds.width, height: bounds.height };
    }

    const canvas = await renderPageToCanvas({ strokes, shapes, darkPage, blockImages, bounds, background });
    const dataUrl = canvas.toDataURL('image/png');

    if (format === 'PDF') {
      const pdf = new jsPDF({
        orientation: bounds.width >= bounds.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [bounds.width, bounds.height],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, bounds.width, bounds.height);
      if (mark) {
        pdf.setFontSize(10);
        pdf.setTextColor(140, 140, 140);
        pdf.text('Made with NETZ', bounds.width - 10, bounds.height - 10, { align: 'right' });
      }
      pdf.save(`${fileBaseName}.pdf`);
      return { ok: true, fileName: `${fileBaseName}.pdf`, width: bounds.width, height: bounds.height };
    }

    downloadFile(dataUrl, `${fileBaseName}.png`);
    return { ok: true, fileName: `${fileBaseName}.png`, width: canvas.width, height: canvas.height };
  } catch (err) {
    console.error(`Failed to export ${format}:`, err);
    return { ok: false, reason: 'error' };
  }
}
