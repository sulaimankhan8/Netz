/**
 * Text inside shapes and text boxes: fonts, line wrapping, alignment and Office's three
 * autofit choices (Do not Autofit, Shrink text on overflow, Resize shape to fit text).
 *
 * The same layout is used on screen, in the SVG export and in the PNG / PDF export, so text
 * breaks at the same places everywhere. Measuring text needs a browser (canvas measureText);
 * without one (Node tests) an approximate measure is used.
 *
 * Text is laid out in the shape's frame (its box turned with the shape, but not mirrored):
 * as in Word, flipping a shape does not mirror its text.
 */

import { shapeGeometry, setShapeHeight } from './shapeModel.js';

export const FONT_STACKS = {
  sans: 'Calibri, Carlito, "Segoe UI", Roboto, Arial, sans-serif',
  serif: '"Times New Roman", Tinos, Georgia, serif',
  mono: 'Consolas, "Courier New", ui-monospace, monospace',
  hand: '"Segoe Print", "Comic Sans MS", "Bradley Hand", cursive',
};

export const FONT_CHOICES = [
  { id: 'sans', label: 'Sans (Calibri)' },
  { id: 'serif', label: 'Serif (Times New Roman)' },
  { id: 'mono', label: 'Monospace (Consolas)' },
  { id: 'hand', label: 'Handwriting' },
];

// Word's default inner margins: 0.1 inch left and right, 0.05 inch top and bottom (in px)
export const DEFAULT_INSETS = { l: 9.6, t: 4.8, r: 9.6, b: 4.8 };
export const LINE_HEIGHT = 1.2;
const MIN_FONT_SIZE = 6;

export function fontString(text, size) {
  return `${text.italic ? 'italic ' : ''}${text.bold ? 700 : 400} ${size}px ${FONT_STACKS[text.font] || FONT_STACKS.sans}`;
}

/** Rough text width (Node, or before a canvas exists): about half an em per Latin character. */
export function approximateMeasure(str, font) {
  const size = Number((/(\d+(?:\.\d+)?)px/.exec(font) || [0, 16])[1]);
  let units = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 0x2e80) units += 1; // CJK and other wide characters
    else if (/[ilj.,;:'|!]/.test(ch)) units += 0.28;
    else if (/[mwMW@]/.test(ch)) units += 0.85;
    else if (ch === ' ') units += 0.28;
    else units += 0.52;
  }
  return units * size;
}

let canvasContext = null;
/** Measures with a canvas when there is a document, otherwise approximately. */
export function browserMeasure(str, font) {
  if (typeof document === 'undefined') return approximateMeasure(str, font);
  if (!canvasContext) canvasContext = document.createElement('canvas').getContext('2d');
  if (!canvasContext) return approximateMeasure(str, font);
  canvasContext.font = font;
  return canvasContext.measureText(str).width;
}

/** Splits a word that is wider than a line on its own: full pieces go to `lines`, the rest is returned. */
function breakWord(word, width, font, measure, lines) {
  let piece = '';
  for (const ch of word) {
    if (piece && measure(piece + ch, font) > width) {
      lines.push(piece);
      piece = ch;
    } else {
      piece += ch;
    }
  }
  return piece;
}

/**
 * Breaks text into lines no wider than maxWidth: at spaces, inside a word only when the word
 * alone is too long. Line breaks typed by the user are kept.
 */
export function wrapText(value, maxWidth, font, measure = approximateMeasure) {
  const lines = [];
  const width = Math.max(1, maxWidth);
  for (const paragraph of String(value || '').split('\n')) {
    let line = '';
    for (const token of paragraph.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) {
        line += token; // trailing spaces are trimmed when the line is finished
        continue;
      }
      if (measure((line + token).trimEnd(), font) <= width) {
        line += token;
        continue;
      }
      if (line.trim()) lines.push(line.trimEnd());
      line = measure(token, font) <= width ? token : breakWord(token, width, font, measure, lines);
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

/** The text rectangle of the preset, in frame coordinates (mirrored back for flipped shapes). */
export function textFrameRect(shape) {
  const r = shapeGeometry(shape).textRect;
  let l = r.l, rr = r.r, t = r.t, b = r.b;
  if (shape.flipH) [l, rr] = [shape.w - r.r, shape.w - r.l];
  if (shape.flipV) [t, b] = [shape.h - r.b, shape.h - r.t];
  return { l: Math.min(l, rr), t: Math.min(t, b), r: Math.max(l, rr), b: Math.max(t, b) };
}

/** The area text goes in: the text rectangle less the inner margins. */
export function textArea(shape) {
  const rect = textFrameRect(shape);
  const insets = (shape.text && shape.text.insets) || DEFAULT_INSETS;
  return { x: rect.l + insets.l, y: rect.t + insets.t, w: Math.max(1, rect.r - rect.l - insets.l - insets.r), h: Math.max(1, rect.b - rect.t - insets.t - insets.b), insets };
}

/**
 * Lines of a shape's text, positioned in frame coordinates.
 *
 * @returns {null | { lines: Array<{ text: string, x: number, y: number }>, size: number, font: string,
 *   anchor: 'start'|'middle'|'end', lineHeight: number, neededHeight: number }}
 *   y is each line's baseline. neededHeight is the shape height that fits the text exactly
 *   (used by "Resize shape to fit text").
 */
export function layoutShapeText(shape, measure = approximateMeasure) {
  const text = shape.text;
  if (!text || !text.value) return null;
  const area = textArea(shape);
  let size = Math.max(MIN_FONT_SIZE, text.size || 16);
  let font = fontString(text, size);
  let lines = text.wrap === false ? String(text.value).split('\n') : wrapText(text.value, area.w, font, measure);

  if (text.autofit === 'shrink') {
    while (size > MIN_FONT_SIZE && lines.length * size * LINE_HEIGHT > area.h) {
      size = Math.max(MIN_FONT_SIZE, size - 0.5);
      font = fontString(text, size);
      lines = text.wrap === false ? String(text.value).split('\n') : wrapText(text.value, area.w, font, measure);
    }
  }

  const lineHeight = size * LINE_HEIGHT;
  const blockHeight = lines.length * lineHeight;
  const rect = textFrameRect(shape);
  const neededHeight = shape.h - (rect.b - rect.t) + blockHeight + area.insets.t + area.insets.b;

  let top = area.y;
  if (text.valign === 'middle') top = area.y + (area.h - blockHeight) / 2;
  else if (text.valign === 'bottom') top = area.y + area.h - blockHeight;

  const anchor = text.align === 'center' ? 'middle' : text.align === 'right' ? 'end' : 'start';
  const x = anchor === 'middle' ? area.x + area.w / 2 : anchor === 'end' ? area.x + area.w : area.x;
  return {
    lines: lines.map((line, i) => ({ text: line, x, y: top + i * lineHeight + lineHeight / 2 + size * 0.35 })),
    size,
    font,
    anchor,
    lineHeight,
    neededHeight,
  };
}

/**
 * The shape with new text. With "Resize shape to fit text" the shape grows or shrinks to the
 * text (top edge fixed, never shorter than one line).
 */
export function shapeWithText(shape, value, measure = approximateMeasure) {
  const next = { ...shape, text: { ...(shape.text || {}), value } };
  if (next.text.autofit !== 'resize') return next;
  const layout = layoutShapeText(next, measure);
  const insets = next.text.insets || DEFAULT_INSETS;
  const oneLine = (next.text.size || 16) * LINE_HEIGHT + insets.t + insets.b;
  return setShapeHeight(next, Math.max(oneLine, layout ? layout.neededHeight : oneLine));
}

/** Frame (rotated, not mirrored) to world: the matrix text is drawn with. */
export function frameMatrix(shape) {
  const a = ((shape.rot || 0) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const cx = shape.w / 2;
  const cy = shape.h / 2;
  return [cos, sin, -sin, cos, shape.x + cx - cos * cx + sin * cy, shape.y + cy - sin * cx - cos * cy];
}

/**
 * The colour text is painted in. 'auto' (text boxes) follows the page: dark ink on a light
 * page, light ink on a dark one.
 */
export function textColor(text, darkPage = false) {
  if (!text || !text.color || text.color === 'auto') return darkPage ? '#F4F4F5' : '#18181B';
  return text.color;
}
