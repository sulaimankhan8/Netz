'use client';

/**
 * Draws a saved Playground board page (from the Assets library) onto a canvas, for its preview
 * and the full-screen viewer in Notes Studio. Ink and shapes use the Playground's own drawing
 * code; blocks, which are HTML in the Playground, are drawn as simple cards with their text or
 * picture (the Playground shows them exactly; "Open in Playground" is one tap away).
 */

import { drawSmoothStroke } from '../../Playground/utils/strokeSmoother';
import { getPageBounds, orderStrokesForPainting, shapeRects } from '../../Playground/utils/pageSvg';
import { drawShapeOnCanvas } from '../../Playground/utils/shapes/shapeRender';
import { browserMeasure } from '../../Playground/utils/shapes/shapeText';

const px = (pt) => (Array.isArray(pt) ? pt[0] : pt.x);
const py = (pt) => (Array.isArray(pt) ? pt[1] : pt.y);

function withBox(stroke) {
  if (stroke.bbox) return stroke;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of stroke.points || []) {
    const x = px(pt), y = py(pt);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return Number.isFinite(minX) ? { ...stroke, bbox: { minX, minY, maxX, maxY } } : stroke;
}

function blockRect(b) {
  const w = Number(b.size?.width) || 280;
  const h = typeof b.size?.height === 'number' ? b.size.height : 120;
  return { x: Number(b.position?.x) || 0, y: Number(b.position?.y) || 0, width: w, height: h };
}

function blockText(b) {
  const c = b.content || {};
  if (b.type === 'theory') return String(c.text || '');
  if (b.type === 'equation') return String(c.latex || '');
  if (b.type === 'graph') return `Graph: ${(c.graphData?.datasets || []).map((d) => d.latex || d.label).filter(Boolean).join(', ')}`;
  if (b.type === 'table') return (c.table?.rows || []).map((r) => r.join('  |  ')).join('\n');
  if (b.type === 'audio') return `Voice memo${c.title ? `: ${c.title}` : ''}`;
  return String(c.caption || '');
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(ctx, textValue, maxWidth) {
  const out = [];
  String(textValue).split('\n').forEach((para) => {
    let line = '';
    para.split(/\s+/).forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else line = test;
    });
    out.push(line);
  });
  return out;
}

/** The part of the page that has anything on it, or null for an empty page. */
export function boardPageBounds(page) {
  const strokes = (page.strokes || []).map(withBox);
  return getPageBounds(strokes, [...(page.blocks || []).map(blockRect), ...shapeRects(page.shapes || [])]);
}

/**
 * The page drawn `width` px wide (taller pages are cut at `maxHeight`). White background.
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderBoardPage(page, width = 800, { maxHeight = 6000 } = {}) {
  const strokes = (page.strokes || []).map(withBox);
  const bounds = boardPageBounds(page) || { minX: 0, minY: 0, width: 800, height: 600 };
  const scale = width / bounds.width;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.min(maxHeight, Math.round(bounds.height * scale)));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, -bounds.minX * scale, -bounds.minY * scale);

  for (const shape of page.shapes || []) {
    try {
      drawShapeOnCanvas(ctx, shape, { scale, measure: browserMeasure });
    } catch {
      // a shape from a newer version: skipped
    }
  }

  for (const b of page.blocks || []) {
    const r = blockRect(b);
    const src = b.content?.imageUrl;
    if (b.type === 'image' && typeof src === 'string' && src.startsWith('data:image/')) {
      const img = await loadImage(src);
      if (img) {
        ctx.drawImage(img, r.x, r.y, r.width, Math.min(r.height, (img.naturalHeight / img.naturalWidth) * r.width));
        continue;
      }
    }
    ctx.fillStyle = '#F4F4F5';
    ctx.strokeStyle = '#D4D4D8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(r.x, r.y, r.width, r.height, 10);
    else ctx.rect(r.x, r.y, r.width, r.height);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#18181B';
    ctx.font = `${b.type === 'equation' ? '16px ui-monospace, monospace' : '16px system-ui, sans-serif'}`;
    const lines = wrapLines(ctx, blockText(b), r.width - 24);
    lines.slice(0, Math.max(1, Math.floor((r.height - 16) / 22))).forEach((line, i) => ctx.fillText(line, r.x + 12, r.y + 26 + i * 22));
  }

  for (const stroke of orderStrokesForPainting(strokes)) {
    const points = (stroke.points || []).map((pt) => (Array.isArray(pt) ? { x: pt[0], y: pt[1], pressure: pt[2] } : pt));
    drawSmoothStroke(ctx, points, {
      color: stroke.color,
      width: stroke.width,
      tool: stroke.tool,
      shape: stroke.shape,
      opacity: stroke.opacity,
      hasPressure: stroke.hasPressure,
    });
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}
