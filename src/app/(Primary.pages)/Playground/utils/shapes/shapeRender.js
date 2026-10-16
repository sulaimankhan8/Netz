/**
 * How a shape is painted: one set of instructions used by the shape layer on screen (SVG),
 * the SVG export, and the PNG / PDF export (canvas), so all three look the same:
 * the outline paths with their fill (colour or gradient) and line, arrowheads, the shadow,
 * and the text.
 *
 * Pure functions with no browser dependencies, except drawShapeOnCanvas (needs Path2D).
 */

import { shapeGeometry, shapeMatrix, hasFill, hasOutline, LINE_DASHES, arrowBase } from './shapeModel.js';
import { pathEnds, shortenPath, segmentsToPathData, geometryBounds } from './presetEvaluator.js';
import { shadeColor, rgba } from './officeColors.js';
import { resolveShadow } from './shapeStyles.js';
import { layoutShapeText, frameMatrix, textColor, approximateMeasure, FONT_STACKS } from './shapeText.js';

export { shadeColor };

// Office's shading of 3D-looking parts (the side of a cube, the top of a cylinder)
const FILL_MODES = { norm: 0, darken: 0.4, darkenLess: 0.2, lighten: -0.4, lightenLess: -0.2 };

const fmt = (n) => {
  const r = Math.round(n * 100) / 100;
  return r === 0 ? 0 : r;
};

// ── Arrowheads ───────────────────────────────────────────────────────────────

const ARROW_SCALE = { sm: 2.5, med: 3.5, lg: 5 };

/**
 * An arrowhead at a line end. `end` is { x, y, dx, dy } with (dx, dy) pointing out of the line.
 * Returns the path and how far the line must be pulled back so it does not show past the head.
 */
export function arrowheadPath(type, end, lineWidth, size = {}) {
  const base = arrowBase(lineWidth);
  const len = base * (ARROW_SCALE[size.len] || ARROW_SCALE.med);
  const half = (base * (ARROW_SCALE[size.w] || ARROW_SCALE.med)) / 2;
  const { x, y, dx, dy } = end;
  const nx = -dy;
  const ny = dx;
  const at = (along, across) => `${fmt(x + dx * along + nx * across)} ${fmt(y + dy * along + ny * across)}`;

  switch (type) {
    case 'triangle':
      return { d: `M${at(0, 0)}L${at(-len, half)}L${at(-len, -half)}Z`, filled: true, pullBack: len * 0.85 };
    case 'stealth':
      return { d: `M${at(0, 0)}L${at(-len, half)}L${at(-len * 0.6, 0)}L${at(-len, -half)}Z`, filled: true, pullBack: len * 0.55 };
    case 'diamond':
      return { d: `M${at(len / 2, 0)}L${at(0, half)}L${at(-len / 2, 0)}L${at(0, -half)}Z`, filled: true, pullBack: 0 };
    case 'oval': {
      const angle = fmt((Math.atan2(dy, dx) * 180) / Math.PI);
      return {
        d: `M${at(len / 2, 0)}A${fmt(len / 2)} ${fmt(half)} ${angle} 1 1 ${at(-len / 2, 0)}A${fmt(len / 2)} ${fmt(half)} ${angle} 1 1 ${at(len / 2, 0)}Z`,
        filled: true,
        pullBack: 0,
      };
    }
    case 'arrow':
      return { d: `M${at(-len, half)}L${at(0, 0)}L${at(-len, -half)}`, filled: false, pullBack: lineWidth / 2 };
    default:
      return null;
  }
}

// ── Fill, shadow, text ───────────────────────────────────────────────────────

/**
 * The fill of one part: a colour, or a linear gradient across the whole box at its angle
 * (90° runs top to bottom, as in Office). 3D-looking parts get the same fill shaded.
 */
function partFill(shape, mode) {
  if (!hasFill(shape)) return { fill: null, gradient: null };
  const amount = FILL_MODES[mode] || 0;
  const fill = shape.fill;
  if (fill.type === 'gradient' && Array.isArray(fill.stops) && fill.stops.length >= 2) {
    const a = ((fill.angle ?? 90) * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const half = (Math.abs(cos) * shape.w + Math.abs(sin) * shape.h) / 2;
    const cx = shape.w / 2;
    const cy = shape.h / 2;
    const stops = fill.stops.map((c) => shadeColor(c, amount));
    return {
      fill: stops[stops.length - 1],
      gradient: { x1: fmt(cx - cos * half), y1: fmt(cy - sin * half), x2: fmt(cx + cos * half), y2: fmt(cy + sin * half), stops },
    };
  }
  return { fill: shadeColor(fill.color, amount), gradient: null };
}

/**
 * The shadow, with its offset both on the page (dx, dy) and in the shape's own turned and
 * mirrored coordinates (localDx, localDy): the shadow keeps its direction on the page.
 */
export function shapeShadow(shape, matrix = shapeMatrix(shape)) {
  const s = resolveShadow(shape.shadow);
  if (!s) return null;
  const rad = (s.angle * Math.PI) / 180;
  const dx = s.dist * Math.cos(rad);
  const dy = s.dist * Math.sin(rad);
  const [a, b, c, d] = matrix;
  const det = a * d - b * c;
  return { color: s.color, alpha: s.alpha, blur: s.blur, dx, dy, localDx: (d * dx - c * dy) / det, localDy: (a * dy - b * dx) / det };
}

/**
 * The shape's text, ready to paint: lines with their positions in the shape's frame, the font,
 * and the matrix that turns the frame onto the page (text turns with the shape, never mirrors).
 */
export function shapeTextPaint(shape, { measure = approximateMeasure, darkPage = false } = {}) {
  const layout = layoutShapeText(shape, measure);
  if (!layout) return null;
  const text = shape.text;
  return {
    ...layout,
    matrix: frameMatrix(shape),
    family: FONT_STACKS[text.font] || FONT_STACKS.sans,
    weight: text.bold ? 700 : 400,
    style: text.italic ? 'italic' : 'normal',
    underline: Boolean(text.underline),
    color: textColor(text, darkPage),
    auto: !text.color || text.color === 'auto',
  };
}

// ── Paint instructions ───────────────────────────────────────────────────────

/**
 * Everything needed to paint a shape. Paths are in local coordinates; `matrix` places them on
 * the page.
 *
 * @returns {{ matrix: number[], parts: Array<{ d: string, fill: string|null, gradient: Object|null,
 *   fillOpacity: number, stroke: string|null, strokeOpacity: number, strokeWidth: number,
 *   dash: number[]|null, cap: string, join: string }>, shadow: Object|null, text: Object|null }}
 */
export function shapePaint(shape, options = {}) {
  const g = shapeGeometry(shape);
  const outlined = hasOutline(shape);
  const line = shape.line || {};
  const width = outlined ? line.width : 0;
  const dashDef = LINE_DASHES.find((d) => d.id === line.dash) || LINE_DASHES[0];
  const dash = outlined && dashDef.pattern ? dashDef.pattern.map((v) => fmt(v * width)) : null;
  const cap = dashDef.cap || 'butt';
  const parts = [];

  const head = outlined && line.head && line.head.type && line.head.type !== 'none' ? line.head : null;
  const tail = outlined && line.tail && line.tail.type && line.tail.type !== 'none' ? line.tail : null;
  let arrowsPlaced = false;

  for (const path of g.paths) {
    const { fill, gradient } = path.fill !== 'none' ? partFill(shape, path.fill) : { fill: null, gradient: null };
    let d = path.d;
    const strokeHere = outlined && path.stroke;
    const extras = [];

    // Arrowheads go on the first open outline (lines, connectors, arcs)
    if (strokeHere && !arrowsPlaced && (head || tail)) {
      const ends = pathEnds(path.segs);
      if (ends) {
        arrowsPlaced = true;
        const headArrow = head ? arrowheadPath(head.type, ends.start, width, head) : null;
        const tailArrow = tail ? arrowheadPath(tail.type, ends.end, width, tail) : null;
        d = segmentsToPathData(shortenPath(path.segs, headArrow ? headArrow.pullBack : 0, tailArrow ? tailArrow.pullBack : 0));
        for (const arrow of [headArrow, tailArrow]) {
          if (!arrow) continue;
          extras.push({
            d: arrow.d,
            fill: arrow.filled ? line.color : null,
            gradient: null,
            fillOpacity: line.alpha ?? 1,
            stroke: arrow.filled ? null : line.color,
            strokeOpacity: line.alpha ?? 1,
            strokeWidth: width,
            dash: null,
            cap: 'round',
            join: 'round',
          });
        }
      }
    }

    if (!fill && !strokeHere) continue;
    parts.push({
      d,
      fill,
      gradient,
      fillOpacity: shape.fill && shape.fill.alpha !== undefined ? shape.fill.alpha : 1,
      stroke: strokeHere ? line.color : null,
      strokeOpacity: line.alpha ?? 1,
      strokeWidth: width,
      dash,
      cap,
      join: 'miter',
    });
    parts.push(...extras);
  }

  const matrix = shapeMatrix(shape);
  return {
    matrix,
    parts,
    shadow: parts.length ? shapeShadow(shape, matrix) : null,
    text: shapeTextPaint(shape, options),
  };
}

export function matrixAttribute(m) {
  return `matrix(${m.map(fmt).join(' ')})`;
}

/** The area a shadow filter must cover, in the shape's own coordinates (also for flat lines). */
export function shadowRegion(shape, shadow) {
  const g = geometryBounds(shapeGeometry(shape)) || { minX: 0, minY: 0, maxX: shape.w, maxY: shape.h };
  const reach = shadow.blur * 3 + Math.hypot(shadow.localDx, shadow.localDy) + (hasOutline(shape) ? shape.line.width * 6 : 0) + 4;
  const minX = Math.min(g.minX, 0) - reach;
  const minY = Math.min(g.minY, 0) - reach;
  return { x: fmt(minX), y: fmt(minY), w: fmt(Math.max(g.maxX, shape.w) + reach - minX), h: fmt(Math.max(g.maxY, shape.h) + reach - minY) };
}

/** Ids for a shape's gradients and shadow filter, unique on the page. */
export function paintIds(shape) {
  const base = `s-${String(shape.id).replace(/[^A-Za-z0-9_-]/g, '')}`;
  return { gradient: (i) => `${base}-g${i}`, shadow: `${base}-shadow` };
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** SVG markup for one shape (used by the SVG export). */
export function shapeToSvg(shape, options = {}) {
  const { matrix, parts, shadow, text } = shapePaint(shape, options);
  if (parts.length === 0 && !text) return '';
  const ids = paintIds(shape);
  const defs = [];
  const body = parts
    .map((p, i) => {
      let fill = p.fill || 'none';
      if (p.gradient) {
        const gr = p.gradient;
        defs.push(`<linearGradient id="${ids.gradient(i)}" gradientUnits="userSpaceOnUse" x1="${gr.x1}" y1="${gr.y1}" x2="${gr.x2}" y2="${gr.y2}">${gr.stops.map((c, k) => `<stop offset="${fmt(k / (gr.stops.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`);
        fill = `url(#${ids.gradient(i)})`;
      }
      const attrs = [`d="${escapeXml(p.d)}"`, `fill="${fill}"`];
      if (p.fill && p.fillOpacity < 1) attrs.push(`fill-opacity="${fmt(p.fillOpacity)}"`);
      if (p.stroke) {
        attrs.push(`stroke="${p.stroke}"`, `stroke-width="${fmt(p.strokeWidth)}"`, `stroke-linecap="${p.cap}"`, `stroke-linejoin="${p.join}"`);
        if (p.strokeOpacity < 1) attrs.push(`stroke-opacity="${fmt(p.strokeOpacity)}"`);
        if (p.dash) attrs.push(`stroke-dasharray="${p.dash.join(' ')}"`);
      }
      return `<path ${attrs.join(' ')}/>`;
    })
    .join('');

  let filterAttr = '';
  if (shadow) {
    const r = shadowRegion(shape, shadow);
    defs.push(
      `<filter id="${ids.shadow}" filterUnits="userSpaceOnUse" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" color-interpolation-filters="sRGB">` +
        `<feGaussianBlur in="SourceAlpha" stdDeviation="${fmt(shadow.blur / 2)}"/>` +
        `<feOffset dx="${fmt(shadow.localDx)}" dy="${fmt(shadow.localDy)}" result="offset"/>` +
        `<feFlood flood-color="${shadow.color}" flood-opacity="${fmt(shadow.alpha)}"/>` +
        `<feComposite in2="offset" operator="in"/>` +
        `<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    );
    filterAttr = ` filter="url(#${ids.shadow})"`;
  }

  let textMarkup = '';
  if (text) {
    const lines = text.lines
      .map((l) => `<tspan x="${fmt(l.x)}" y="${fmt(l.y)}">${escapeXml(l.text)}</tspan>`)
      .join('');
    textMarkup =
      `<g transform="${matrixAttribute(text.matrix)}"><text text-anchor="${text.anchor}" font-family="${escapeXml(text.family)}" font-size="${fmt(text.size)}"` +
      ` font-weight="${text.weight}" font-style="${text.style}"${text.underline ? ' text-decoration="underline"' : ''} fill="${text.color}" xml:space="preserve">${lines}</text></g>`;
  }

  return `<g>${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${body ? `<g transform="${matrixAttribute(matrix)}"${filterAttr}>${body}</g>` : ''}${textMarkup}</g>`;
}

/**
 * Paints a shape on a canvas whose transform is already in world coordinates (browser only).
 * scale: canvas pixels per world unit (shadows are measured in pixels, not in world units).
 */
export function drawShapeOnCanvas(ctx, shape, { scale = 1, measure, darkPage = false } = {}) {
  const { matrix, parts, shadow, text } = shapePaint(shape, { measure, darkPage });

  const paintParts = () => {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const path = new Path2D(p.d);
      if (p.fill) {
        ctx.globalAlpha = p.fillOpacity;
        if (p.gradient) {
          const gr = ctx.createLinearGradient(p.gradient.x1, p.gradient.y1, p.gradient.x2, p.gradient.y2);
          p.gradient.stops.forEach((c, k) => gr.addColorStop(k / (p.gradient.stops.length - 1), c));
          ctx.fillStyle = gr;
        } else {
          ctx.fillStyle = p.fill;
        }
        ctx.fill(path);
      }
      if (p.stroke) {
        ctx.globalAlpha = p.strokeOpacity;
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = p.strokeWidth;
        ctx.lineCap = p.cap;
        ctx.lineJoin = p.join;
        ctx.setLineDash(p.dash || []);
        ctx.stroke(path);
      }
    }
  };

  if (parts.length) {
    ctx.save();
    ctx.transform(...matrix);
    if (shadow) {
      // Shadow first (canvas shadow offsets are in pixels and ignore the transform), then the shape over it
      ctx.save();
      ctx.shadowColor = rgba(shadow.color, shadow.alpha);
      ctx.shadowBlur = shadow.blur * scale;
      ctx.shadowOffsetX = shadow.dx * scale;
      ctx.shadowOffsetY = shadow.dy * scale;
      paintParts();
      ctx.restore();
    }
    paintParts();
    ctx.restore();
  }

  if (text) {
    ctx.save();
    ctx.transform(...text.matrix);
    ctx.font = text.font;
    ctx.fillStyle = text.color;
    ctx.textAlign = text.anchor === 'middle' ? 'center' : text.anchor === 'end' ? 'right' : 'left';
    ctx.textBaseline = 'alphabetic';
    for (const l of text.lines) {
      ctx.fillText(l.text, l.x, l.y);
      if (text.underline && l.text) {
        const w = ctx.measureText(l.text).width;
        const x0 = text.anchor === 'middle' ? l.x - w / 2 : text.anchor === 'end' ? l.x - w : l.x;
        ctx.fillRect(x0, l.y + text.size * 0.12, w, Math.max(1, text.size / 15));
      }
    }
    ctx.restore();
  }
}
