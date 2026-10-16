import { register } from 'node:module';

// The Playground utils use extensionless relative imports (resolved by the Next.js bundler).
// This hook lets plain Node resolve them the same way.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (specifier.startsWith('.') && !/\\.[cm]?js$/.test(specifier)) {
            return next(specifier + '.js', context);
          }
          throw err;
        }
      }
    `)
);

const A = await import('./src/app/(Primary.pages)/Playground/utils/shapes/shapeArrange.js');
const M = await import('./src/app/(Primary.pages)/Playground/utils/shapes/shapeModel.js');

/**
 * Arranging shapes (plan step 6): align, distribute, group, several shapes resized / turned /
 * flipped as one, Change Shape, smart guides, connectors that stay attached, Convert to Shape.
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
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
const nearPt = (p, q, tol = 1e-6) => near(p.x, q.x, tol) && near(p.y, q.y, tol);
const show = (v) => JSON.stringify(v);

const rect = (id, x, y, w, h, extra = {}) => ({ ...M.createShape({ preset: 'rect' }, { x, y, w, h }), id, ...extra });
const byId = (list) => Object.fromEntries(list.map((s) => [s.id, s]));

// ── Align ────────────────────────────────────────────────────────────────────
{
  const shapes = [rect('a', 0, 0, 50, 20), rect('b', 100, 40, 30, 30), rect('c', 60, 90, 80, 10)];
  const ids = ['a', 'b', 'c'];
  let s = byId(A.alignShapes(shapes, ids, 'left'));
  expect('Align Left: every left edge at the leftmost', s.a.x === 0 && s.b.x === 0 && s.c.x === 0, show([s.a.x, s.b.x, s.c.x]));
  s = byId(A.alignShapes(shapes, ids, 'right'));
  expect('Align Right: every right edge at the rightmost (140)', near(s.a.x + 50, 140) && near(s.b.x + 30, 140) && near(s.c.x + 80, 140));
  s = byId(A.alignShapes(shapes, ids, 'center'));
  expect('Align Center: every middle at the selection\'s middle (70)', [s.a, s.b, s.c].every((q) => near(q.x + q.w / 2, 70)));
  s = byId(A.alignShapes(shapes, ids, 'top'));
  expect('Align Top', [s.a, s.b, s.c].every((q) => near(q.y, 0)));
  s = byId(A.alignShapes(shapes, ids, 'bottom'));
  expect('Align Bottom', [s.a, s.b, s.c].every((q) => near(q.y + q.h, 100)));
  s = byId(A.alignShapes(shapes, ids, 'middle'));
  expect('Align Middle', [s.a, s.b, s.c].every((q) => near(q.y + q.h / 2, 50)));
  expect('Align leaves the other axis alone', byId(A.alignShapes(shapes, ids, 'left')).b.y === 40);
  expect('Align with one shape does nothing', A.alignShapes(shapes, ['a'], 'left') === shapes);
  // A turned shape is aligned by the box it covers on the page
  const turned = [rect('a', 0, 0, 100, 20), { ...rect('b', 200, 0, 100, 20), rot: 90 }];
  s = byId(A.alignShapes(turned, ['a', 'b'], 'left'));
  expect('a turned shape aligns by what it covers (90°: its height across)', near(A.frameBounds(s.b).minX, 0), show(A.frameBounds(s.b)));
  // A group moves as one
  const grouped = [rect('a', 0, 0, 10, 10, { groupId: 'g' }), rect('b', 20, 30, 10, 10, { groupId: 'g' }), rect('c', 100, 0, 10, 10)];
  s = byId(A.alignShapes(grouped, ['a', 'b', 'c'], 'right'));
  expect('a group aligns as one (its members keep their places in it)', near(s.b.x + 10, 110) && near(s.a.x, s.b.x - 20) && near(s.c.x, 100), show([s.a.x, s.b.x, s.c.x]));
}

// ── Distribute ───────────────────────────────────────────────────────────────
{
  const shapes = [rect('a', 0, 0, 10, 10), rect('b', 15, 50, 30, 10), rect('c', 90, 20, 10, 10)];
  const s = byId(A.distributeShapes(shapes, ['a', 'b', 'c'], 'h'));
  const gap1 = s.b.x - (s.a.x + 10);
  const gap2 = s.c.x - (s.b.x + 30);
  expect('Distribute Horizontally: equal gaps, the ends stay', near(gap1, gap2) && s.a.x === 0 && s.c.x === 90 && near(gap1, 25), show([gap1, gap2]));
  expect('Distribute does not move up or down', s.b.y === 50);
  const v = byId(A.distributeShapes([rect('a', 0, 0, 10, 10), rect('b', 0, 12, 10, 10), rect('c', 0, 100, 10, 10)], ['a', 'b', 'c'], 'v'));
  expect('Distribute Vertically', near(v.b.y - 10, 100 - (v.b.y + 10)), show(v.b.y));
  expect('Distribute needs three', A.distributeShapes(shapes, ['a', 'b'], 'h') === shapes);
}

// ── Group and ungroup ────────────────────────────────────────────────────────
{
  const shapes = [rect('a', 0, 0, 10, 10), rect('x', 50, 0, 10, 10), rect('b', 20, 0, 10, 10), rect('top', 0, 50, 5, 5)];
  const g = A.groupShapes(shapes, ['a', 'b']);
  const ga = g.find((s) => s.id === 'a');
  const gb = g.find((s) => s.id === 'b');
  expect('Group gives the members one group id', ga.groupId && ga.groupId === gb.groupId && !g.find((s) => s.id === 'x').groupId);
  expect('the members come together in the layer order, where the topmost was', g.map((s) => s.id).join(',') === 'x,a,b,top', g.map((s) => s.id).join(','));
  expect('selecting one member selects the group', A.expandToGroups(g, ['a']).sort().join(',') === 'a,b');
  expect('a whole group is recognised', A.isWholeGroup(g, g.filter((s) => s.groupId)) && !A.isWholeGroup(g, [ga]));
  expect('Group needs two or more, and not a group already', A.canGroup([ga, gb]) === false && A.canGroup([ga, g[0]]) === true && A.canGroup([ga]) === false);
  const u = A.ungroupShapes(g, ['a']);
  expect('Ungroup: no member keeps a group id', u.every((s) => !s.groupId) && u.length === 4);
  const regroup = A.groupShapes(A.groupShapes(g, ['a', 'b']), ['a', 'x']);
  expect('grouping a group with another shape makes one group of all three', new Set(regroup.filter((s) => ['a', 'b', 'x'].includes(s.id)).map((s) => s.groupId)).size === 1);
}

// ── Several shapes as one: resize, rotate, flip ──────────────────────────────
{
  const shapes = [rect('a', 0, 0, 100, 50), rect('b', 100, 50, 100, 50)];
  const box = A.framesBounds(shapes);
  expect('the selection box', show(box) === show({ minX: 0, minY: 0, maxX: 200, maxY: 100 }), show(box));
  const to = A.resizeBox(box, 'se', { x: 400, y: 200 });
  let s = byId(A.scaleShapes(shapes, box, to));
  expect('a corner doubles the selection: positions and sizes double, the top-left stays', s.a.x === 0 && s.a.w === 200 && s.b.x === 200 && s.b.y === 100 && s.b.h === 100, show(s.b));
  const keep = A.resizeBox(box, 'e', { x: 400, y: 50 }, { keepRatio: true });
  expect('Shift on a side handle keeps proportions (height follows, centred)', near(keep.x1 - keep.x0, 400) && near(keep.y1 - keep.y0, 200) && near((keep.y0 + keep.y1) / 2, 50), show(keep));
  const mirrored = A.resizeBox(box, 'e', { x: -100, y: 0 });
  s = byId(A.scaleShapes(shapes, box, mirrored));
  // Box 0..200 dragged to 0..-100: each middle at -(its distance from the left) / 2
  expect('dragging past the opposite edge mirrors them', s.a.flipH === true && s.b.flipH === true && near(s.a.x + s.a.w / 2, -25) && near(s.b.x + s.b.w / 2, -75) && near(s.a.w, 50), show([s.a.x, s.a.w, s.b.x]));
  const centre = A.resizeBox(box, 'e', { x: 300, y: 0 }, { fromCentre: true });
  expect('Ctrl resizes from the middle', near(centre.x0, -100) && near(centre.x1, 300), show(centre));
  // A shape turned 90° inside a selection stretched sideways grows along its height
  const tall = [{ ...rect('t', 0, 0, 100, 20), rot: 90 }, rect('u', 0, 100, 40, 40)];
  const tb = A.framesBounds(tall);
  const stretched = byId(A.scaleShapes(tall, tb, { x0: tb.minX, y0: tb.minY, x1: tb.minX + (tb.maxX - tb.minX) * 2, y1: tb.maxY }));
  expect('a turned shape takes the scale along its own sides', near(stretched.t.h, 40) && near(stretched.t.w, 100) && stretched.t.rot === 90, show(stretched.t));

  const r = byId(A.rotateShapesAbout(shapes, { x: 100, y: 50 }, 90));
  expect('turning a selection turns each shape and moves it round the middle', r.a.rot === 90 && nearPt(M.shapeCentre(r.a), { x: 125, y: 0 }) && nearPt(M.shapeCentre(r.b), { x: 75, y: 100 }), show([M.shapeCentre(r.a), M.shapeCentre(r.b)]));
  const f = byId(A.flipShapesAbout([{ ...shapes[0], rot: 30 }, shapes[1]], box, 'h'));
  expect('flipping a group mirrors it across its middle', f.a.flipH && near(M.shapeCentre(f.a).x, 150) && f.a.rot === 330 && near(M.shapeCentre(f.b).x, 50), show([M.shapeCentre(f.a), f.a.rot]));
  expect('the rotate handle angle (0 = straight up)', near(A.handleAngle({ x: 0, y: 0 }, { x: 0, y: -10 }), 0) && near(A.handleAngle({ x: 0, y: 0 }, { x: 10, y: 0 }), 90));
}

// ── Change Shape ─────────────────────────────────────────────────────────────
{
  const s = { ...rect('a', 10, 20, 100, 60), rot: 15, flipH: true, adj: { adj: 9000 }, text: { ...M.DEFAULT_TEXT, value: 'Hi' }, fill: { type: 'solid', color: '#FF0000', alpha: 1 } };
  const c = A.changeShape(s, 'ellipse');
  expect('Change Shape keeps place, size, turn, flips, look and text', c.preset === 'ellipse' && c.x === 10 && c.w === 100 && c.rot === 15 && c.flipH && c.fill.color === '#FF0000' && c.text.value === 'Hi');
  expect('its yellow-handle values start fresh', Object.keys(c.adj).length === 0);
  const line = M.createShape({ preset: 'line' }, { x: 0, y: 0, w: 10, h: 10 });
  expect('lines cannot be changed, nor changed into', A.changeShape(line, 'rect') === line && A.changeShape(s, 'line') === s && !A.canChangeShape(line));
}

// ── Smart guides ─────────────────────────────────────────────────────────────
{
  const moving = { minX: 0, minY: 0, maxX: 50, maxY: 20 };
  const others = [{ minX: 100, minY: 100, maxX: 150, maxY: 140 }];
  let r = A.snapMove(moving, others, 97, 30, 5);
  expect('a left edge within reach snaps to another shape\'s left edge', r.dx === 100 && r.dy === 30 && r.guides.some((g) => g.axis === 'x' && g.at === 100), show(r));
  expect('the guide runs through both shapes', r.guides[0].from === 30 && r.guides[0].to === 140, show(r.guides[0]));
  r = A.snapMove(moving, others, 102, 108, 5);
  expect('middles snap too, on both axes', r.dx === 100 && near(r.dy, 110) && r.guides.length === 2, show(r));
  r = A.snapMove(moving, others, 60, 30, 5);
  expect('nothing within reach: no snap, no guide', r.dx === 60 && r.dy === 30 && r.guides.length === 0);
}

// ── Connectors ───────────────────────────────────────────────────────────────
{
  const a = rect('a', 0, 0, 100, 50);
  const b = rect('b', 300, 0, 100, 50);
  const pa = A.connectionPoints(a);
  expect('a rectangle has 4 connection points (Office: top, left, bottom, right)', pa.length === 4 && nearPt(pa[3], { x: 100, y: 25 }), show(pa));
  const hit = A.nearestConnection([a, b], { x: 103, y: 27 }, 8);
  expect('the nearest connection point within reach', hit && hit.id === 'a' && hit.idx === 3, show(hit));
  expect('none out of reach', A.nearestConnection([a, b], { x: 200, y: 25 }, 8) === null);
  let line = M.createShape({ preset: 'straightConnector1' }, M.lineBox({ x: 100, y: 25 }, { x: 300, y: 25 }));
  line = A.setConnection(A.setConnection({ ...line, id: 'l' }, 'start', { id: 'a', idx: 3 }), 'end', { id: 'b', idx: 1 });
  const moved = A.rerouteConnectors([a, { ...b, y: 200 }, line]);
  const ends = M.lineEndpoints(moved[2]);
  expect('moving a shape moves the attached end with it', nearPt(ends.start, { x: 100, y: 25 }) && nearPt(ends.end, { x: 300, y: 225 }), show(ends));
  expect('and the connector stays attached', moved[2].conn.start.id === 'a' && moved[2].conn.end.id === 'b');
  const same = [a, b, line];
  expect('nothing moved: the same list comes back', A.rerouteConnectors(same) === same);
  const gone = A.rerouteConnectors([a, line]);
  expect('a deleted shape lets its end go (the end stays put)', !gone[1].conn.end && gone[1].conn.start && nearPt(M.lineEndpoints(gone[1]).end, { x: 300, y: 25 }), show(gone[1].conn));
  const det = A.detachMoved([a, b, line], ['l']);
  expect('moving a connector on its own lets go of both shapes', !det[2].conn);
  const both = A.detachMoved([a, b, line], ['l', 'a']);
  expect('moving it with one of its shapes keeps that end', both[2].conn.start && !both[2].conn.end);
  expect('shapes near a point (connection points show)', A.shapesNear([a, b, line], { x: 120, y: 25 }, 30).map((s) => s.id).join() === 'a');
}

// ── Convert to Shape ─────────────────────────────────────────────────────────
{
  const outline = (vertices, closed = true) => {
    const pts = [];
    const n = closed ? vertices.length : vertices.length - 1;
    for (let i = 0; i < n; i++) {
      const p = vertices[i];
      const q = vertices[(i + 1) % vertices.length];
      for (let k = 0; k < 10; k++) pts.push({ x: p.x + ((q.x - p.x) * k) / 10, y: p.y + ((q.y - p.y) * k) / 10 });
    }
    const last = closed ? vertices[0] : vertices[vertices.length - 1];
    pts.push({ x: last.x, y: last.y });
    return pts;
  };
  const stroke = (shape, points) => ({ id: 's', shape, points, color: '#123456', width: 3 });
  const rectShape = A.shapeFromStroke(stroke('rectangle', outline([{ x: 10, y: 10 }, { x: 110, y: 10 }, { x: 110, y: 60 }, { x: 10, y: 60 }])));
  expect('a snapped rectangle becomes a rectangle on the same box, ink colour outline, no fill', rectShape.preset === 'rect' && rectShape.x === 10 && rectShape.w === 100 && rectShape.h === 50 && rectShape.line.color === '#123456' && rectShape.line.width === 3 && rectShape.fill.type === 'none');
  const lineShape = A.shapeFromStroke(stroke('line', [{ x: 0, y: 0 }, { x: 50, y: 10 }, { x: 100, y: 0 }]));
  const le = M.lineEndpoints(lineShape);
  expect('a snapped line becomes a line between its ends', lineShape.preset === 'line' && nearPt(le.start, { x: 0, y: 0 }) && nearPt(le.end, { x: 100, y: 0 }));
  const circle = A.shapeFromStroke(stroke('circle', Array.from({ length: 33 }, (_, i) => ({ x: 50 + 40 * Math.cos((i / 32) * 2 * Math.PI), y: 50 + 40 * Math.sin((i / 32) * 2 * Math.PI) }))));
  expect('a snapped circle becomes an ellipse on its box', circle.preset === 'ellipse' && near(circle.w, 80, 1e-9) && near(circle.x, 10, 1e-9));

  // Any triangle: the Office triangle, turned, with its tip moved, hitting all three corners
  const corners = [{ x: 20, y: 30 }, { x: 140, y: 70 }, { x: 60, y: 160 }];
  const tri = A.shapeFromStroke(stroke('triangle', outline(corners)));
  expect('a snapped triangle becomes the triangle shape', tri && tri.preset === 'triangle', show(tri));
  const g = M.shapeGeometry(tri);
  const drawn = g.paths[0].segs.filter((s) => s.t !== 'Z').map((s) => M.localToWorld(tri, { x: s.x, y: s.y }));
  // Within 0.001 px: the tip's place is stored as a whole number out of 100000, as Office does
  const matched = corners.every((c) => drawn.some((d) => nearPt(d, c, 1e-3)));
  expect('its three corners are exactly where the ink\'s were', matched, show(drawn));
  const flat = A.shapeFromStroke(stroke('triangle', outline([{ x: 0, y: 100 }, { x: 100, y: 100 }, { x: 50, y: 0 }])));
  expect('an upright isosceles triangle needs no turn and no tip move', near(flat.rot % 360, 0) && Object.keys(flat.adj).length === 0 && near(flat.w, 100) && near(flat.h, 100), show(flat));

  const pentagon = Array.from({ length: 5 }, (_, i) => ({ x: 100 + 50 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5), y: 100 + 50 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5) }));
  const free = A.shapeFromStroke(stroke('polygon', outline(pentagon)));
  expect('another polygon becomes a freeform shape through its corners', free.preset === 'freeform' && free.points.length === 5, show(free && free.points));
  const fg = M.shapeGeometry(free);
  const fpts = fg.paths[0].segs.filter((s) => s.t !== 'Z').map((s) => M.localToWorld(free, { x: s.x, y: s.y }));
  expect('the freeform outline goes through the ink\'s corners', pentagon.every((c) => fpts.some((d) => nearPt(d, c, 1e-6))));
  expect('a freeform shape is hit inside (it has a fill once given one)', M.hitTestShape({ ...free, fill: { type: 'solid', color: '#000', alpha: 1 } }, { x: 100, y: 100 }) && !M.hitTestShape(free, { x: 100, y: 100 }));
  expect('its corners are its connection points', A.connectionPoints(free).length === 5);
  expect('a freeform shape resizes like any other (points are fractions of its box)', (() => {
    const big = M.resizeShape(free, 'se', { x: free.x + free.w * 2, y: free.y + free.h * 2 });
    const b = M.shapeWorldBounds(big);
    return near(b.maxX - b.minX, free.w * 2 + 3, 1e-6);
  })());
  expect('ink that did not snap cannot be converted', !A.isConvertibleStroke({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }) && A.shapeFromStroke({ points: [] }) === null);
}

// ── Keyboard ─────────────────────────────────────────────────────────────────
{
  const shapes = [rect('a', 0, 0, 1, 1), rect('b', 0, 0, 1, 1, { groupId: 'g' }), rect('c', 0, 0, 1, 1, { groupId: 'g' }), rect('d', 0, 0, 1, 1)];
  expect('Tab goes to the next shape', A.nextShapeSelection(shapes, ['a']).join() === 'b,c');
  expect('a group counts as one', A.nextShapeSelection(shapes, ['b', 'c']).join() === 'd');
  expect('and wraps round', A.nextShapeSelection(shapes, ['d']).join() === 'a');
  expect('Shift+Tab goes back', A.nextShapeSelection(shapes, ['a'], true).join() === 'd');
  expect('Ctrl+Shift+>: 12 pt becomes 14 pt', near(A.steppedTextSize(16, true), 18.67, 0.01));
  expect('Ctrl+Shift+<: 12 pt becomes 11 pt', near(A.steppedTextSize(16, false), 14.67, 0.01));
  expect('beyond 72 pt it grows by tens', near(A.steppedTextSize(96, true), 106.67, 0.01));
}

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
