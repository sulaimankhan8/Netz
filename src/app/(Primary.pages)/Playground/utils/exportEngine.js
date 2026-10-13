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
import { getPageBounds, buildPageSvg, orderStrokesForPainting } from './pageSvg';

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
      images.push({ x: block.position.x, y: block.position.y, width: node.offsetWidth, height: node.offsetHeight, dataUrl });
    } catch (err) {
      console.error('Failed to capture block for export:', block.blockId, err);
    }
  }
  return images;
}

/**
 * Draws the page onto a new canvas at the given scale.
 */
async function renderPageToCanvas({ strokes, blockImages, bounds, background }) {
  const scale = Math.min(2, MAX_RASTER_SIDE / Math.max(bounds.width, bounds.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bounds.width * scale));
  canvas.height = Math.max(1, Math.round(bounds.height * scale));

  const ctx = canvas.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.setTransform(scale, 0, 0, scale, -bounds.minX * scale, -bounds.minY * scale);

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

  for (let i = 0; i < blockImages.length; i++) {
    const b = blockImages[i];
    const img = await loadImage(b.dataUrl);
    ctx.drawImage(img, b.x, b.y, b.width, b.height);
  }

  return canvas;
}

/**
 * Exports the whole page.
 *
 * @param {'PNG'|'SVG'|'PDF'} format
 * @param {Object} page
 * @param {Array<Object>} page.strokes - All ink strokes on the page
 * @param {Array<Object>} page.blocks - Smart Blocks on the page
 * @param {HTMLElement} page.containerElement - Element that contains the rendered blocks
 * @param {string} [page.fileBaseName='netz-whiteboard']
 * @param {string} [page.background] - Page colour
 * @returns {Promise<{ ok: boolean, reason?: string, fileName?: string, width?: number, height?: number }>}
 */
export async function exportPage(format, { strokes = [], blocks = [], containerElement, fileBaseName = 'netz-whiteboard', background = '#FFFFFF' }) {
  try {
    const blockImages = await captureBlockImages(blocks, containerElement);
    const bounds = getPageBounds(strokes, blockImages);
    if (!bounds) return { ok: false, reason: 'empty' };

    if (format === 'SVG') {
      const svg = buildPageSvg({ strokes, blockImages, bounds, background });
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      downloadFile(url, `${fileBaseName}.svg`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return { ok: true, fileName: `${fileBaseName}.svg`, width: bounds.width, height: bounds.height };
    }

    const canvas = await renderPageToCanvas({ strokes, blockImages, bounds, background });
    const dataUrl = canvas.toDataURL('image/png');

    if (format === 'PDF') {
      const pdf = new jsPDF({
        orientation: bounds.width >= bounds.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [bounds.width, bounds.height],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, bounds.width, bounds.height);
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
