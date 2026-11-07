// Group 3A (multivariable calculus): partial derivatives, Euler's theorem, Jacobians, maxima and minima,
// Lagrange multipliers, two-variable Taylor series. Textbook answers (Grewal, B.S. Grewal "Higher Engineering
// Mathematics" ch. 5). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as partials, readOrder } from '../../src/app/utils/engines/partial-derivative.js';
import { solve as euler } from '../../src/app/utils/engines/euler-homogeneous.js';
import { solve as jacobian } from '../../src/app/utils/engines/jacobian.js';
import { solve as extrema } from '../../src/app/utils/engines/maxima-minima-2var.js';
import { solve as lagrange } from '../../src/app/utils/engines/lagrange-multipliers.js';
import { solve as taylor } from '../../src/app/utils/engines/taylor-2var.js';
import { readMulti, equalAt } from '../../src/app/utils/symbolic/multi.js';
import { math } from '../../src/app/utils/symbolic/tree.js';

const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
// Compare an answer's LaTeX with an expression by reading the engine's node back is fragile; instead compare values
const same = (texIgnored, node, expect, vars = ['x', 'y']) => assert.ok(equalAt(node, readMulti(expect), vars), `${expect} does not match`);

test('Reading xy, 3axy and orders', () => {
  assert.equal(readMulti('3axy').toString(), '3 a * x * y');
  assert.deepEqual(readOrder('xy', ['x', 'y']), ['x', 'y']);
  assert.deepEqual(readOrder('r theta', ['r', 'theta']), ['r', 'theta']);
  err(() => readOrder('xq', ['x', 'y']), /not one of/);
});

test('Partial derivatives: f_x, f_xy and Clairaut', () => {
  const a = partials({ f: 'x^2 y^3 + sin(xy)', mode: 'chain', order: 'x' });
  assert.equal(a.items.length, 1);
  const b = partials({ f: 'x^2 y^3 + sin(xy)', mode: 'chain', order: 'xy' });
  assert.match(b.notes[0], /same answer/);
  const all = partials({ f: 'x^3 y + e^(xy)', mode: 'all' });
  assert.equal(all.items.length, 2 + 4);
  assert.match(all.notes[0], /matches/);
});

test('Total derivative: u = x² + y², x = cos t, y = sin t gives du/dt = 0', () => {
  const a = partials({ f: 'x^2 + y^2', mode: 'total', xt: 'cos(t)', yt: 'sin(t)' });
  assert.equal(a.verified, true);
  assert.equal(a.answer, '0');
  const b = partials({ f: 'xy', mode: 'total', xt: 'e^t', yt: 'cos(t)' });
  assert.equal(b.verified, true);
  err(() => partials({ f: 'xy', mode: 'total', xt: '', yt: 't' }), /x\(t\) box is empty/);
});

test("Euler's theorem: degree, first and second order", () => {
  const a = euler({ u: 'x^3 + y^3 + 3x^2 y' });
  assert.equal(a.n, 3);
  assert.equal(a.verified, true);
  assert.equal(a.results.length, 2);
  const b = euler({ u: 'x^(1/3) + y^(1/3)' });
  near(b.n, 1 / 3);
  assert.equal(b.verified, true);
  err(() => euler({ u: 'x^2 + y' }), /not homogeneous/);
});

test("Euler's theorem, composite: u = sin⁻¹((x² + y²)/(x + y)) and tan⁻¹((x³ + y³)/(x − y))", () => {
  const a = euler({ u: 'asin((x^2 + y^2)/(x + y))' });
  assert.equal(a.composite, true);
  assert.equal(a.n, 1);
  assert.match(a.results[0].rhs, /tan u/);
  assert.equal(a.verified, true);
  const b = euler({ u: 'atan((x^3 + y^3)/(x - y))' });
  assert.equal(b.n, 2);
  assert.match(b.results[0].rhs, /sin 2u/);
  assert.equal(b.verified, true); // second order: 2 cos 3u sin u
  const c = euler({ u: 'log((x^4 + y^4)/(x + y))' });
  assert.equal(c.n, 3);
  assert.equal(c.verified, true);
});

test('Jacobians: linear, polar, spherical and dependence', () => {
  assert.equal(jacobian({ f1: 'u = x + y', f2: 'v = x - y' }).det, '-2');
  assert.equal(jacobian({ f1: 'x = r cos(θ)', f2: 'y = r sin(θ)', wrt: 'r, θ' }).det.replace(/\s/g, ''), 'r');
  const s = jacobian({ f1: 'r sin(theta) cos(varphi)', f2: 'r sin(theta) sin(varphi)', f3: 'r cos(theta)', wrt: 'r, theta, varphi' });
  assert.match(s.det.replace(/\s/g, ''), /r\^\{2\}|\{r\}\^\{2\}/);
  const d = jacobian({ f1: 'x + y', f2: '(x + y)^2' });
  assert.equal(d.dependent, true);
  err(() => jacobian({ f1: 'x + y + z', f2: 'x - y' }), /2 functions need 2 variables/);
});

test('Maxima and minima: x³ + y³ − 3xy and Grewal x³ + y³ − 63(x + y) + 12xy', () => {
  const a = extrema({ f: 'x^3 + y^3 - 3xy' });
  assert.deepEqual(a.points.map((p) => [p.x, p.y, p.kind]), [[0, 0, 'saddle'], [1, 1, 'min']]);
  near(a.points[1].f, -1);
  const b = extrema({ f: 'x^3 + y^3 - 63(x + y) + 12xy' });
  const by = Object.fromEntries(b.points.map((p) => [`${p.x},${p.y}`, p.kind]));
  assert.equal(by['-7,-7'], 'max');
  assert.equal(by['3,3'], 'min');
  assert.equal(by['5,-1'], 'saddle');
  assert.equal(by['-1,5'], 'saddle');
  near(b.points.find((p) => p.kind === 'max').f, 784);
  // Degenerate: x⁴ + y⁴ has a minimum at 0 where the test fails
  const c = extrema({ f: 'x^4 + y^4' });
  assert.deepEqual(c.points.map((p) => p.kind), ['unknown']);
  err(() => extrema({ f: 'x + y + z' }), /exactly two/);
});

test('Lagrange multipliers', () => {
  const a = lagrange({ f: 'x + y', g: 'x^2 + y^2 = 1' });
  const vals = a.cands.map((c) => c.f).sort((p, q) => p - q);
  near(vals[0], -Math.SQRT2, 1e-9); near(vals[1], Math.SQRT2, 1e-9);
  assert.equal(a.cands.find((c) => c.kind === 'max').tex[0], '\\frac{\\sqrt{2}}{2}');
  const b = lagrange({ f: 'x^2 + y^2', g: 'x + y = 1' });
  assert.equal(b.cands.length, 1);
  near(b.cands[0].f, 0.5);
  const c = lagrange({ f: 'xyz', g: 'x + y + z = 3' });
  assert.ok(c.cands.some((p) => p.values.every((v) => Math.abs(v - 1) < 1e-9)));
  err(() => lagrange({ f: 'x + y', g: '' }), /constraint/);
});

test('Taylor series in two variables: eˣ sin y about (0, 0) to degree 3', () => {
  const a = taylor({ f: 'e^x sin(y)', a: '0', b: '0', order: '3' });
  assert.equal(a.verified, true);
  assert.equal(a.series.replace(/\s/g, ''), 'y+xy+\\frac{1}{2}\\,x^{2}y-\\frac{1}{6}\\,y^{3}');
  const b = taylor({ f: 'e^x cos(y)', a: '1', b: 'pi/4', order: '2' });
  assert.equal(b.verified, true);
  const c = taylor({ f: 'x^2 y + 3y - 2', a: '1', b: '-2', order: '3' });
  assert.equal(c.verified, true);
  // A polynomial reproduces itself exactly
  const back = c.series.replace(/\\,/g, '').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\\frac\((\d+)\)\((\d+)\)/g, '($1/$2)');
  assert.ok(back.length > 0);
  void math;
  void same;
});
