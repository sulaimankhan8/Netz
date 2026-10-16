import { wrapText, layoutShapeText, textFrameRect, textArea, frameMatrix, textColor, approximateMeasure, fontString, DEFAULT_INSETS } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeText.js';
import { createShape, frameToWorld, reorderShapes, setShapeHeight, shapeDefaultsFrom } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeModel.js';
import { shapePaint, shapeToSvg, shapeShadow, shadowRegion } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeRender.js';
import { getGalleryItem } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeGallery.js';
import { SHAPE_STYLES, SHADOW_PRESETS, getShapeStyle, resolveShadow } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeStyles.js';

/**
 * Text in shapes (wrapping, alignment, autofit, flips) and the style and shadow presets.
 * Widths use a fixed-width measure so the expected line breaks are exact.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
const mono = (str) => str.length * 10; // every character 10 px wide

// ── Wrapping ─────────────────────────────────────────────────────────────────
expect('short text stays on one line', JSON.stringify(wrapText('hello world', 200, '', mono)) === '["hello world"]');
expect('breaks at the last space that fits', JSON.stringify(wrapText('hello world again', 120, '', mono)) === '["hello world","again"]', JSON.stringify(wrapText('hello world again', 120, '', mono)));
expect('typed line breaks are kept, also empty lines', JSON.stringify(wrapText('a\n\nb', 200, '', mono)) === '["a","","b"]');
expect('a word longer than the line is split', JSON.stringify(wrapText('abcdefghij', 40, '', mono)) === '["abcd","efgh","ij"]', JSON.stringify(wrapText('abcdefghij', 40, '', mono)));
expect('spaces at a break do not start the next line', JSON.stringify(wrapText('aaa   bbb', 50, '', mono)) === '["aaa","bbb"]', JSON.stringify(wrapText('aaa   bbb', 50, '', mono)));
expect('empty text is one empty line', JSON.stringify(wrapText('', 50, '', mono)) === '[""]');
expect('the approximate measure grows with the font size', approximateMeasure('Hello', fontString({}, 32)) === 2 * approximateMeasure('Hello', fontString({}, 16)));
expect('font string has weight, style, size and family', fontString({ bold: true, italic: true, font: 'serif' }, 18).startsWith('italic 700 18px "Times New Roman"'));

// ── Layout in a shape ────────────────────────────────────────────────────────
const box = { ...createShape(getGalleryItem('rect'), { x: 0, y: 0, w: 220, h: 100 }) };
const withText = (text, shape = box) => ({ ...shape, text: { value: '', size: 10, align: 'center', valign: 'middle', ...text } });

let layout = layoutShapeText(withText({ value: 'hello world' }), mono);
const area = textArea(box);
expect('text goes inside the inner margins', near(area.x, DEFAULT_INSETS.l) && near(area.w, 220 - DEFAULT_INSETS.l - DEFAULT_INSETS.r), JSON.stringify(area));
expect('centred text is anchored at the middle of the area', layout.anchor === 'middle' && near(layout.lines[0].x, 110), JSON.stringify(layout.lines));
expect('vertically centred: one line sits in the middle', near(layout.lines[0].y, 50 + 10 * 0.35, 0.01), layout.lines[0].y);
layout = layoutShapeText(withText({ value: 'hello', align: 'left', valign: 'top' }), mono);
expect('left and top', layout.anchor === 'start' && near(layout.lines[0].x, DEFAULT_INSETS.l) && near(layout.lines[0].y, DEFAULT_INSETS.t + 6 + 3.5), JSON.stringify(layout.lines));
layout = layoutShapeText(withText({ value: 'hello', align: 'right', valign: 'bottom' }), mono);
expect('right and bottom', layout.anchor === 'end' && near(layout.lines[0].x, 220 - DEFAULT_INSETS.r) && near(layout.lines[0].y, 100 - DEFAULT_INSETS.b - 12 + 6 + 3.5), JSON.stringify(layout.lines));
expect('no text, no layout', layoutShapeText(withText({ value: '' }), mono) === null && layoutShapeText(box, mono) === null);

const long = 'one two three four five six seven eight nine ten eleven twelve';
layout = layoutShapeText(withText({ value: long, size: 20 }), mono);
const lineCount = layout.lines.length;
layout = layoutShapeText(withText({ value: long, size: 20, autofit: 'shrink' }), mono);
expect('Shrink text on overflow makes the text smaller until it fits', layout.size < 20 && layout.lines.length * layout.lineHeight <= area.h + 0.01, `${layout.size}px, ${layout.lines.length} lines`);
layout = layoutShapeText(withText({ value: long, size: 20 }), mono);
expect('Resize shape to fit text knows the height that fits', layout.neededHeight > 100 && near(layout.neededHeight, lineCount * 24 + DEFAULT_INSETS.t + DEFAULT_INSETS.b), layout.neededHeight);

// The preset's own text rectangle: an oval keeps text away from its curved edge
const oval = createShape(getGalleryItem('ellipse'), { x: 0, y: 0, w: 200, h: 100 });
const ovalRect = textFrameRect(oval);
expect('an oval puts text in its inner rectangle', ovalRect.l > 20 && ovalRect.r < 180 && ovalRect.t > 10, JSON.stringify(ovalRect));

// Flips mirror the text area, never the text
const tri = createShape(getGalleryItem('rtTriangle'), { x: 0, y: 0, w: 100, h: 100 });
const plain = textFrameRect(tri);
const flipped = textFrameRect({ ...tri, flipH: true });
expect('a mirrored shape mirrors where its text goes', near(flipped.l, 100 - plain.r) && near(flipped.r, 100 - plain.l), JSON.stringify([plain, flipped]));

// The text turns with the shape
const turned = { ...box, x: 50, y: 70, rot: 30 };
const m = frameMatrix(turned);
const p = { x: 12, y: 34 };
const viaMatrix = { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] };
const direct = frameToWorld(turned, p);
expect('text is placed with the shape\'s rotation', near(viaMatrix.x, direct.x) && near(viaMatrix.y, direct.y), JSON.stringify([viaMatrix, direct]));
expect('a flip does not mirror the text matrix', JSON.stringify(frameMatrix({ ...turned, flipH: true })) === JSON.stringify(m));

expect('automatic text colour follows the page', textColor({ color: 'auto' }, false) === '#18181B' && textColor({ color: 'auto' }, true) === '#F4F4F5' && textColor({ color: '#FF0000' }, true) === '#FF0000');

// ── Styles and shadows ───────────────────────────────────────────────────────
expect('Shape Styles: 6 rows of 7 colours, as in WPS', SHAPE_STYLES.length === 6 && SHAPE_STYLES.every((r) => r.items.length === 7));
const fillStyle = getShapeStyle('fill-#4472C4');
expect('"Colored Fill" in Accent 1 is Word\'s default look', fillStyle && fillStyle.style.fill.color === '#4472C4' && fillStyle.style.line.color === '#223962' && fillStyle.style.text.color === '#FFFFFF', JSON.stringify(fillStyle && fillStyle.style));
const outlineStyle = getShapeStyle('outline-#ED7D31');
expect('"Colored Outline": white fill, coloured outline, dark text', outlineStyle.style.fill.color === '#FFFFFF' && outlineStyle.style.line.color === '#ED7D31' && outlineStyle.style.text.color === '#000000');
expect('effect styles use a gradient and a shadow', getShapeStyle('intense-#70AD47').style.fill.type === 'gradient' && getShapeStyle('intense-#70AD47').style.shadow.preset === 'outerBottomRight');
expect('nine outer shadows, as in Office', SHADOW_PRESETS.length === 9);
const sh = resolveShadow({ preset: 'outerBottom' });
expect('a shadow preset fills in colour, transparency, angle, distance, blur', sh.color === '#000000' && sh.alpha === 0.4 && sh.angle === 90 && sh.dist === 4 && sh.blur > 0, JSON.stringify(sh));
expect('own values override the preset', resolveShadow({ preset: 'outerBottom', color: '#FF0000' }).color === '#FF0000');
expect('no shadow', resolveShadow(null) === null);

// ── Painting: gradient, shadow, text ─────────────────────────────────────────
const styled = { ...box, id: 'shape_test', fill: { type: 'gradient', stops: ['#FFFFFF', '#4472C4'], angle: 90, color: '#4472C4', alpha: 1 } };
let paint = shapePaint(styled);
expect('a gradient fill runs top to bottom at 90°', paint.parts[0].gradient && paint.parts[0].gradient.x1 === 110 && paint.parts[0].gradient.y1 === 0 && paint.parts[0].gradient.y2 === 100, JSON.stringify(paint.parts[0].gradient));
let svg = shapeToSvg(styled);
expect('SVG export defines the gradient and fills with it', /<linearGradient id="s-shape_test-g0"/.test(svg) && /fill="url\(#s-shape_test-g0\)"/.test(svg), svg.slice(0, 200));

const shadowed = { ...box, id: 'shape_sh', shadow: { preset: 'outerBottom' } };
paint = shapePaint(shadowed);
expect('a bottom shadow falls straight down', near(paint.shadow.dx, 0) && near(paint.shadow.dy, 4), JSON.stringify(paint.shadow));
const turnedShadow = shapeShadow({ ...shadowed, rot: 90 });
expect('rotating the shape does not turn its shadow on the page (local offset turns the other way)', near(turnedShadow.dy, 4) && near(turnedShadow.localDx, 4) && near(turnedShadow.localDy, 0), JSON.stringify(turnedShadow));
svg = shapeToSvg(shadowed);
expect('SVG export has a shadow filter covering the shape', /<filter id="s-shape_sh-shadow" filterUnits="userSpaceOnUse"/.test(svg) && /filter="url\(#s-shape_sh-shadow\)"/.test(svg));
const flatLine = { ...createShape(getGalleryItem('line'), { x: 0, y: 0, w: 100, h: 0 }), shadow: { preset: 'outerBottom' } };
const region = shadowRegion(flatLine, shapeShadow(flatLine));
expect('a flat line still gets a shadow area with height', region.h > 10 && region.w > 100, JSON.stringify(region));

const texted = { ...box, id: 'shape_t', text: { value: 'Tom & Jerry <3', size: 16, color: '#FFFFFF', align: 'center', valign: 'middle', bold: true } };
svg = shapeToSvg(texted);
expect('SVG export writes the text, escaped, in the shape\'s font', /<text text-anchor="middle"[^>]*font-weight="700"[^>]*fill="#FFFFFF"/.test(svg) && svg.includes('Tom &amp; Jerry &lt;3'), svg.slice(svg.indexOf('<text'), svg.indexOf('<text') + 220));
const autoText = { ...texted, text: { ...texted.text, color: 'auto' } };
expect('automatic text colour on a dark page export', shapeToSvg(autoText, { darkPage: true }).includes('fill="#F4F4F5"'));
const textOnly = { ...createShape(getGalleryItem('textbox'), { x: 0, y: 0, w: 200, h: 40 }), text: { ...createShape(getGalleryItem('textbox'), { x: 0, y: 0, w: 200, h: 40 }).text, value: 'note' } };
expect('a text box exports its text although it has no fill or outline', /<text[^>]*>.*note/.test(shapeToSvg(textOnly)));
expect('a new text box grows with its text', textOnly.text.autofit === 'resize' && textOnly.text.color === 'auto');

// ── Model helpers ────────────────────────────────────────────────────────────
const [s1, s2, s3, s4] = ['a', 'b', 'c', 'd'].map((id) => ({ ...box, id }));
const ids = (list) => list.map((s) => s.id).join('');
expect('Bring to Front', ids(reorderShapes([s1, s2, s3, s4], ['b'], 'front')) === 'acdb');
expect('Send to Back', ids(reorderShapes([s1, s2, s3, s4], ['c'], 'back')) === 'cabd');
expect('Bring Forward moves one step', ids(reorderShapes([s1, s2, s3, s4], ['b'], 'forward')) === 'acbd');
expect('Send Backward moves one step', ids(reorderShapes([s1, s2, s3, s4], ['c'], 'backward')) === 'acbd');
expect('the top shape cannot go further forward', ids(reorderShapes([s1, s2, s3, s4], ['d'], 'forward')) === 'abcd');
expect('several shapes keep their own order', ids(reorderShapes([s1, s2, s3, s4], ['a', 'c'], 'front')) === 'bdac');

const tall = setShapeHeight({ ...box, x: 10, y: 20 }, 150);
expect('growing a shape to fit text keeps its top edge', tall.h === 150 && tall.y === 20 && tall.x === 10);
const turnedBox = { ...box, x: 0, y: 0, rot: 90 };
const topBefore = frameToWorld(turnedBox, { x: 0, y: 0 });
const grown = setShapeHeight(turnedBox, 160);
expect('also when the shape is turned', near(frameToWorld(grown, { x: 0, y: 0 }).x, topBefore.x) && near(frameToWorld(grown, { x: 0, y: 0 }).y, topBefore.y));

const look = shapeDefaultsFrom({ ...texted, shadow: { preset: 'outerTop' }, line: { ...box.line, tail: { type: 'triangle' } } });
expect('Set as Default Shape keeps the look but not the text itself', look.fill.color === '#4472C4' && look.text.bold && look.text.value === undefined && look.shadow.preset === 'outerTop' && !look.line.tail);
const fromDefault = createShape(getGalleryItem('ellipse'), { x: 0, y: 0, w: 50, h: 50 }, { fill: { type: 'solid', color: '#FF0000' }, line: { type: 'solid', color: '#00FF00', width: 3 }, text: { color: '#000000', size: 20 }, shadow: { preset: 'outerTop' } });
expect('new shapes use the default look', fromDefault.fill.color === '#FF0000' && fromDefault.line.width === 3 && fromDefault.text.size === 20 && fromDefault.shadow.preset === 'outerTop');

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
