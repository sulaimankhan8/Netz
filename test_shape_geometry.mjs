import { evaluatePreset, presetNames, adjustValues, compactAdjust, solveAdjustHandle, flattenSegments, geometryBounds, pathEnds, shortenPath } from './src/app/(Primary.pages)/Playground/utils/shapes/presetEvaluator.js';
import { SHAPE_CATEGORIES, allGalleryItems, getGalleryItem } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeGallery.js';
import { shapePaint, shapeToSvg, shadeColor, arrowheadPath } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeRender.js';
import { createShape } from './src/app/(Primary.pages)/Playground/utils/shapes/shapeModel.js';

/**
 * Office preset shape geometry: every preset evaluates, known shapes have the right outline,
 * adjustment handles move within their limits, and the gallery only lists real presets.
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
const near = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;

// ── Every preset, at very different sizes ────────────────────────────────────
const names = presetNames();
expect('all 187 Office presets are present', names.length === 187, names.length);
const sizes = [[1, 1], [100, 100], [400, 50], [50, 400], [160, 0]];
let broken = [];
for (const name of names) {
  for (const [w, h] of sizes) {
    try {
      const g = evaluatePreset(name, w, h);
      const text = JSON.stringify([g.paths.map((p) => p.d), g.handles, g.textRect, g.connections]);
      if (/NaN|null|Infinity/.test(text)) broken.push(`${name}@${w}x${h}`);
    } catch (err) {
      broken.push(`${name}@${w}x${h}: ${err.message}`);
    }
  }
}
expect('every preset gives finite geometry at 1x1, 100x100, 400x50, 50x400 and 160x0', broken.length === 0, broken.slice(0, 5).join(', '));

// ── Known outlines ───────────────────────────────────────────────────────────
expect('rectangle outline', evaluatePreset('rect', 100, 50).paths[0].d === 'M0 0L100 0L100 50L0 50Z', evaluatePreset('rect', 100, 50).paths[0].d);

const round = evaluatePreset('roundRect', 100, 50);
// corner radius = shorter side x 16667 / 100000 = 8.33
expect('rounded rectangle starts below its top-left corner by the radius', round.paths[0].d.startsWith('M0 8.33'), round.paths[0].d.slice(0, 30));
expect('rounded rectangle corners are arcs, not cuts', (round.paths[0].d.match(/A/g) || []).length === 4, round.paths[0].d);

const ellipse = evaluatePreset('ellipse', 100, 50);
const ellipsePts = flattenSegments(ellipse.paths[0].segs).flatMap((r) => r.pts);
const offEllipse = ellipsePts.filter((p) => !near(((p.x - 50) / 50) ** 2 + ((p.y - 25) / 25) ** 2, 1, 0.01));
expect('oval: every point lies on the ellipse', ellipsePts.length > 40 && offEllipse.length === 0, `${offEllipse.length} of ${ellipsePts.length} off`);
const eb = geometryBounds(ellipse);
expect('oval fills its box exactly', near(eb.minX, 0, 0.5) && near(eb.maxX, 100, 0.5) && near(eb.minY, 0, 0.5) && near(eb.maxY, 50, 0.5), JSON.stringify(eb));

const tri = evaluatePreset('triangle', 100, 80);
expect('isosceles triangle: apex at the top centre', tri.paths[0].d.startsWith('M0 80L50 0L100 80Z') || /M0 80L50 0L100 80/.test(tri.paths[0].d), tri.paths[0].d);

const arc = evaluatePreset('arc', 100, 100);
expect('arc: a filled pie part without outline, then an outline without fill', arc.paths.length === 2 && arc.paths[0].stroke === false && arc.paths[1].fill === 'none', JSON.stringify(arc.paths.map((p) => [p.fill, p.stroke])));

const cube = evaluatePreset('cube', 100, 100);
expect('cube has a darker side and a lighter top', cube.paths.some((p) => p.fill === 'darkenLess') && cube.paths.some((p) => p.fill === 'lightenLess'), JSON.stringify(cube.paths.map((p) => p.fill)));

const callout = evaluatePreset('wedgeRectCallout', 100, 100);
const cb = geometryBounds(callout);
expect('speech bubble tail reaches below the box (default adjustment)', cb.maxY > 100, JSON.stringify(cb));

expect('rectangle has 4 connection points', evaluatePreset('rect', 100, 50).connections.length === 4);
const tr = evaluatePreset('roundRect', 100, 50).textRect;
expect('rounded rectangle text area is inset from the corners', tr.l > 0 && tr.t > 0 && tr.r < 100 && tr.b < 50, JSON.stringify(tr));

// ── Adjustment values and handles ────────────────────────────────────────────
expect('rounded rectangle default adjustment is 16667', adjustValues('roundRect').adj === 16667, JSON.stringify(adjustValues('roundRect')));
expect('defaults are not stored', Object.keys(compactAdjust('roundRect', { adj: 16667 })).length === 0);
expect('changed values are stored', compactAdjust('roundRect', { adj: 30000 }).adj === 30000);

const rr = evaluatePreset('roundRect', 100, 50);
expect('rounded rectangle handle sits on the top edge at the radius', rr.handles.length === 1 && near(rr.handles[0].x, 8.33, 0.01) && rr.handles[0].y === 0, JSON.stringify(rr.handles));
let solved = solveAdjustHandle('roundRect', 100, 50, {}, 0, { x: 20, y: 3 });
expect('dragging the handle to x = 20 gives radius 20 (adj 40000)', near(solved.adj, 40000, 60), solved.adj);
solved = solveAdjustHandle('roundRect', 100, 50, {}, 0, { x: 90, y: 0 });
expect('the radius stops at half the shorter side (adj 50000)', solved.adj === 50000, solved.adj);
solved = solveAdjustHandle('roundRect', 100, 50, {}, 0, { x: -40, y: 0 });
expect('and cannot go below zero', solved.adj === 0, solved.adj);

// Right arrow: two handles; the head's length follows the second
const ra = evaluatePreset('rightArrow', 200, 100);
expect('right arrow has two handles', ra.handles.length === 2, ra.handles.length);
solved = solveAdjustHandle('rightArrow', 200, 100, {}, 1, { x: 120, y: 0 });
const ra2 = evaluatePreset('rightArrow', 200, 100, solved);
expect('moving the head handle moves it to the point', near(ra2.handles[1].x, 120, 1), JSON.stringify(ra2.handles[1]));

// Star: the inner radius
const star = evaluatePreset('star5', 100, 100);
solved = solveAdjustHandle('star5', 100, 100, {}, 0, { x: 50, y: 30 });
const star2 = evaluatePreset('star5', 100, 100, solved);
expect('star inner radius handle follows the pointer', near(star2.handles[0].y, 30, 1) && star2.paths[0].d !== star.paths[0].d, JSON.stringify(star2.handles[0]));

// Polar handle (angle and radius): block arc
const ba = evaluatePreset('blockArc', 100, 100);
const target = { x: ba.handles[0].x + 10, y: ba.handles[0].y + 10 };
solved = solveAdjustHandle('blockArc', 100, 100, {}, 0, target);
const ba2 = evaluatePreset('blockArc', 100, 100, solved);
expect('polar handle moves towards the pointer', Math.hypot(ba2.handles[0].x - target.x, ba2.handles[0].y - target.y) < Math.hypot(ba.handles[0].x - target.x, ba.handles[0].y - target.y) - 5, JSON.stringify([ba.handles[0], ba2.handles[0], target]));

// Callout tail (two-dimensional, unlimited)
solved = solveAdjustHandle('wedgeRectCallout', 100, 100, {}, 0, { x: 180, y: 150 });
const wc = evaluatePreset('wedgeRectCallout', 100, 100, solved);
expect('speech bubble tail follows the pointer anywhere', near(wc.handles[0].x, 180, 1.5) && near(wc.handles[0].y, 150, 1.5), JSON.stringify(wc.handles[0]));

// ── Line ends and arrowheads ─────────────────────────────────────────────────
const lineG = evaluatePreset('straightConnector1', 100, 0);
const ends = pathEnds(lineG.paths[0].segs);
expect('a line knows its two ends and their directions', ends && ends.start.x === 0 && ends.end.x === 100 && ends.start.dx === -1 && ends.end.dx === 1, JSON.stringify(ends));
const shortened = shortenPath(lineG.paths[0].segs, 5, 10);
expect('a line can be pulled back at both ends', shortened[0].x === 5 && shortened[1].x === 90, JSON.stringify(shortened));
expect('closed shapes have no line ends', pathEnds(evaluatePreset('rect', 10, 10).paths[0].segs) === null);
const tip = arrowheadPath('triangle', { x: 100, y: 0, dx: 1, dy: 0 }, 2);
expect('a triangle arrowhead points along the line, tip at the end', tip.d.startsWith('M100 0L') && tip.filled && tip.pullBack > 0, tip.d);

// ── Gallery ──────────────────────────────────────────────────────────────────
expect('gallery has the eight WPS categories in order', SHAPE_CATEGORIES.map((c) => c.label).join('|') === 'Lines|Rectangles|Basic Shapes|Block Arrows|Equation Shapes|Flowchart|Stars and Banners|Callouts');
const missing = allGalleryItems().filter((i) => !names.includes(i.preset));
expect('every gallery entry is a real preset', missing.length === 0, missing.map((m) => m.id).join(','));
const ids = allGalleryItems().map((i) => i.id);
expect('gallery ids are unique', new Set(ids).size === ids.length);
expect('gallery offers about as many shapes as Word', ids.length >= 150, ids.length);
expect('Text Box is the first basic shape, as in Word', SHAPE_CATEGORIES[2].shapes[0].id === 'textbox');

// ── Painting ─────────────────────────────────────────────────────────────────
expect('colours darken and lighten', shadeColor('#4472C4', 0.5) === '#223962' && shadeColor('#000000', -1) === '#FFFFFF', shadeColor('#4472C4', 0.5));
const blue = createShape(getGalleryItem('rect'), { x: 10, y: 20, w: 100, h: 50 });
let paint = shapePaint(blue);
expect('a new shape has Word\'s default blue fill and darker outline', paint.parts.length === 1 && paint.parts[0].fill === '#4472C4' && paint.parts[0].stroke === '#2F528F', JSON.stringify(paint.parts[0]));
expect('its matrix places it at its box', paint.matrix.join(',') === '1,0,0,1,10,20', paint.matrix.join(','));
const arrowLine = createShape(getGalleryItem('line-arrow'), { x: 0, y: 0, w: 100, h: 0 });
paint = shapePaint(arrowLine);
expect('Line Arrow paints a line without fill plus a filled arrowhead', paint.parts.length === 2 && paint.parts[0].fill === null && paint.parts[1].fill === '#4472C4', JSON.stringify(paint.parts));
expect('the line stops short of the arrow tip', /L9\d/.test(paint.parts[0].d) && !paint.parts[0].d.includes('L100'), paint.parts[0].d);
const bracket = createShape(getGalleryItem('leftBracket'), { x: 0, y: 0, w: 30, h: 140 });
expect('brackets are inserted as an outline only', shapePaint(bracket).parts.every((p) => p.fill === null), JSON.stringify(shapePaint(bracket).parts));
const dashed = { ...blue, line: { ...blue.line, dash: 'dash', width: 2 } };
expect('dashes scale with the outline width', shapePaint(dashed).parts[0].dash.join(',') === '8,6');
const svg = shapeToSvg(blue);
expect('SVG export writes the shape as a path in a group', svg.startsWith('<g><g transform="matrix(1 0 0 1 10 20)"><path d="M0 0L100 0L100 50L0 50Z" fill="#4472C4"'), svg);
const noFill = { ...blue, fill: { type: 'none' }, line: { type: 'none' } };
expect('a shape with neither fill nor outline paints nothing', shapeToSvg(noFill) === '');

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
