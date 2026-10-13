import { getPageBounds, buildPageSvg, strokeToSvg, orderStrokesForPainting } from './src/app/(Primary.pages)/Playground/utils/pageSvg.js';
import { bboxOfStrokes, translateStroke, scaleStroke, duplicateStroke, recolorStroke } from './src/app/(Primary.pages)/Playground/utils/strokeTransform.js';

/**
 * Whole-page export geometry (bounds, vector paths, paint order) and the
 * stroke transforms used by the lasso (move, resize, duplicate, recolour).
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

const stroke = (id, points, extra = {}) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  return { id, color: '#3B82F6', width: 4, tool: 'pen', points, bbox: { minX, minY, maxX, maxY }, ...extra };
};
const pt = (x, y) => ({ x, y, pressure: 0.5, timestamp: 0 });

const curve = stroke('curve', [pt(100, 100), pt(140, 60), pt(180, 100), pt(220, 140), pt(260, 100)]);
const segment = stroke('segment', [pt(-400, 900), pt(-300, 900)]);
const dot = stroke('dot', [pt(50, 50)]);
const rect = stroke('rect', [pt(0, 0), pt(100, 0), pt(100, 50), pt(0, 50), pt(0, 0)], { shape: 'rectangle' });
const circle = stroke('circle', [pt(10, 0), pt(7, 7), pt(0, 10), pt(-7, 7), pt(-10, 0), pt(10, 0)], { shape: 'circle' });
const highlight = stroke('hl', [pt(100, 100), pt(260, 100)], { tool: 'highlighter', color: '#F59E0B' });

// ── Bounds ───────────────────────────────────────────────────────────────────
expect('empty page has no bounds', getPageBounds([], []) === null);
let bounds = getPageBounds([curve], []);
expect('bounds include the stroke thickness and a margin', bounds.minX === 100 - 2 - 32 && bounds.maxX === 260 + 2 + 32 && bounds.minY === 60 - 2 - 32 && bounds.maxY === 140 + 2 + 32, JSON.stringify(bounds));
expect('bounds report width and height', bounds.width === bounds.maxX - bounds.minX && bounds.height === bounds.maxY - bounds.minY);
bounds = getPageBounds([curve, segment], []);
expect('bounds reach ink far from the rest (off-screen content is included)', bounds.minX <= -400 - 34 && bounds.maxY >= 900 + 34, JSON.stringify(bounds));
bounds = getPageBounds([], [{ x: 500, y: 600, width: 360, height: 140 }]);
expect('a page with only a block has bounds around the block', bounds.minX === 468 && bounds.maxX === 892 && bounds.minY === 568 && bounds.maxY === 772, JSON.stringify(bounds));
bounds = getPageBounds([highlight], []);
expect('a highlighter stroke counts at four times its width', bounds.minY === 100 - 8 - 32, JSON.stringify(bounds));

// ── Vector output ────────────────────────────────────────────────────────────
let svg = strokeToSvg(curve);
expect('a freehand stroke is a curved path', svg.startsWith('<path') && svg.includes('Q') && svg.includes('stroke-width="4"') && svg.includes('stroke="#3B82F6"'), svg);
expect('a freehand stroke starts and ends at its own points', svg.includes('d="M100 100') && svg.includes('L260 100"'), svg);
svg = strokeToSvg(segment);
expect('a two-point stroke is a straight line', svg.includes('d="M-400 900L-300 900"'), svg);
svg = strokeToSvg(dot);
expect('a tap is a filled dot', svg.startsWith('<circle') && svg.includes('cx="50"') && svg.includes('r="2"') && svg.includes('fill="#3B82F6"'), svg);
svg = strokeToSvg(rect);
expect('a snapped rectangle has straight edges, sharp joins and is closed', !svg.includes('Q') && svg.endsWith('stroke-linejoin="miter"/>') && svg.includes('Z"'), svg);
svg = strokeToSvg(circle);
expect('a snapped circle stays curved', svg.includes('Q') && svg.includes('stroke-linejoin="round"'), svg);
svg = strokeToSvg(highlight);
expect('a highlighter stroke is wide and translucent', svg.includes('stroke-width="16"') && svg.includes('stroke-opacity="0.35"'), svg);
expect('a stroke with its own opacity keeps it', strokeToSvg({ ...curve, opacity: 0.7 }).includes('stroke-opacity="0.7"'));
expect('a stroke with no points produces nothing', strokeToSvg({ ...curve, points: [] }) === '');

const ordered = orderStrokesForPainting([curve, highlight, dot]);
expect('highlighter is painted first, under the writing', ordered[0].id === 'hl' && ordered[1].id === 'curve' && ordered[2].id === 'dot');
expect('paint order does not change the original list', [curve, highlight, dot][0].id === 'curve');

bounds = getPageBounds([curve, highlight, rect], []);
const doc = buildPageSvg({ strokes: [curve, highlight, rect], blockImages: [{ x: 300, y: 300, width: 360, height: 140, dataUrl: 'data:image/png;base64,AAAA' }], bounds, background: '#FFFFFF' });
expect('the document is a single SVG', doc.startsWith('<svg xmlns="http://www.w3.org/2000/svg"') && doc.trim().endsWith('</svg>'));
expect('the viewBox is the page bounds', doc.includes(`viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}"`));
expect('every stroke is a vector path', (doc.match(/<path /g) || []).length === 3);
expect('the highlighter path comes before the ink', doc.indexOf('stroke-opacity="0.35"') < doc.indexOf('stroke="#3B82F6"'));
expect('a block is placed as an image at its position', doc.includes('<image x="300" y="300" width="360" height="140"'));
expect('blocks sit above the ink, as on screen', doc.lastIndexOf('<image') > doc.lastIndexOf('<path'));
expect('nothing is rasterised through foreignObject', !doc.includes('foreignObject'));
expect('the background is a rectangle over the whole page', doc.includes(`<rect x="${bounds.minX}" y="${bounds.minY}"`) && doc.includes('fill="#FFFFFF"'));
expect('a transparent page has no background rectangle', !buildPageSvg({ strokes: [curve], bounds, background: null }).includes('<rect'));

// ── Lasso transforms ─────────────────────────────────────────────────────────
const moved = translateStroke(curve, 50, -20);
expect('move: points and box shift together', moved.points[0].x === 150 && moved.points[0].y === 80 && moved.bbox.minX === 150 && moved.bbox.maxY === 120);
expect('move: id, colour and width are kept', moved.id === 'curve' && moved.color === curve.color && moved.width === curve.width);
expect('move: the original stroke is not changed', curve.points[0].x === 100 && curve.bbox.minX === 100 && moved.points !== curve.points);

const scaled = scaleStroke(curve, 2, { x: 100, y: 60 });
expect('resize: points scale away from the fixed corner', scaled.points[0].x === 100 && scaled.points[0].y === 140 && scaled.bbox.maxX === 420 && scaled.bbox.maxY === 220, JSON.stringify(scaled.bbox));
expect('resize: thickness scales too', scaled.width === 8);
expect('resize: the original stroke is not changed', curve.width === 4 && curve.bbox.maxX === 260);
expect('resize: thickness never reaches zero', scaleStroke(curve, 0.01, { x: 0, y: 0 }).width >= 0.5);

const copy = duplicateStroke(curve, 24, 24, 'copy-1');
expect('duplicate: new id, offset position', copy.id === 'copy-1' && copy.points[0].x === 124 && copy.bbox.minY === 84);
const recoloured = recolorStroke(curve, '#F43F5E');
expect('recolour: only the colour changes', recoloured.color === '#F43F5E' && recoloured.points === curve.points && curve.color === '#3B82F6');

const box = bboxOfStrokes([curve, segment]);
expect('box around several strokes', box.minX === -400 && box.maxX === 260 && box.minY === 60 && box.maxY === 900);
expect('box of nothing is null', bboxOfStrokes([]) === null);

if (failed > 0) {
  console.error(`\n ${failed}/${checks} export and transform checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} export and transform checks passed!`);
