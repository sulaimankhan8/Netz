// Groups 3I (time value of money, NPV/IRR, CAGR, depreciation), 3F (diagonalization, quadratic forms),
// 3G (trig identities and equations, inverse trig, 3D geometry, polar coordinates) and 3H (domain and range,
// sets and relations). Textbook answers (NCERT 11–12; Grewal ch. 2; Brealey–Myers). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as tvm } from '../../src/app/utils/engines/tvm.js';
import { solve as npv } from '../../src/app/utils/engines/npv-irr.js';
import { solve as cagr } from '../../src/app/utils/engines/cagr.js';
import { solve as dep } from '../../src/app/utils/engines/depreciation.js';
import { solve as diag } from '../../src/app/utils/engines/diagonalization.js';
import { solve as qform } from '../../src/app/utils/engines/quadratic-form.js';
import { solve as ident } from '../../src/app/utils/engines/trig-identities.js';
import { solve as treq } from '../../src/app/utils/engines/trig-equations.js';
import { solve as invtrig } from '../../src/app/utils/engines/inverse-trig.js';
import { solve as geo3 } from '../../src/app/utils/engines/geometry-3d.js';
import { solve as polar } from '../../src/app/utils/engines/polar-coordinates.js';
import { solve as dr } from '../../src/app/utils/engines/domain-range.js';
import { solve as sets } from '../../src/app/utils/engines/set-operations.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));
const S = (m) => m.map((r) => r.map(String));

test('Time value of money', () => {
  near(tvm({ mode: 'pva', pmt: '10000', rate: '8', n: '5', freq: '1', due: 'no' }).value, 39927.10);
  near(tvm({ mode: 'pva', pmt: '10000', rate: '8', n: '5', freq: '1', due: 'yes' }).value, 43121.27);
  near(tvm({ mode: 'perpetuity', pmt: '5000', rate: '10', freq: '1', growth: '' }).value, 50000);
  near(tvm({ mode: 'sinking', fv: '100000', rate: '8', n: '5', freq: '1' }).value, 17045.65);
  // 10% coupon, 8% yield, 5 years: above par
  const b = tvm({ mode: 'bond', face: '1000', coupon: '10', rate: '8', n: '5', freq: '1' });
  near(b.value, 1079.85); assert.match(b.notes.join(' '), /premium/);
  assert.equal(tvm({ mode: 'pva', pmt: '10000', rate: '8', n: '5', freq: '1', due: 'no' }).answer, 'PV = ₹39,927.10');
});

test('NPV, IRR (Newton–Raphson) and payback', () => {
  const r = npv({ flows: '-10000, 3000, 4200, 6800', rate: '10' });
  near(r.npvValue, 1307.29); assert.match(r.irr, /^16\.34/); // NPV(16.34%) = 0
  near(r.payback, 2.4118, 1e-3);
  assert.equal(npv({ flows: '-20000, 5000, 5000, 5000', rate: '12' }).npvValue < 0, true);
  err(() => npv({ flows: '100', rate: '10' }), /at least two/);
});

test('CAGR and real return', () => {
  assert.equal(cagr({ start: '100000', end: '250000', years: '6', inflation: '' }).cagr, '16.4993\\%'); // 2.5^(1/6) − 1
  assert.match(cagr({ start: '100000', end: '250000', years: '6', inflation: '6' }).real, /^9\.9/);
});

test('Depreciation schedules', () => {
  assert.equal(dep({ method: 'sl', cost: '100000', salvage: '10000', life: '5' }).final, '₹10,000');
  assert.equal(dep({ method: 'wdv', cost: '100000', salvage: '10000', life: '5', rate: '20' }).final, '₹32,768');
  assert.equal(dep({ method: 'wdv', cost: '100000', salvage: '10000', life: '5', rate: '' }).final, '₹10,000');
  assert.equal(dep({ method: 'syd', cost: '100000', salvage: '10000', life: '5' }).rows[0].dep, '₹30,000 (5/15)');
  err(() => dep({ method: 'sl', cost: '100', salvage: '200', life: '5' }), /less than the cost/);
});

test('Diagonalization and orthogonal reduction', () => {
  const d = diag({ cells: S([[2, 0, 0], [0, 3, 4], [0, 4, 9]]), power: '2' });
  assert.equal(d.diagonalizable, true); assert.deepEqual(d.result, [1, 2, 11]); assert.equal(d.verified, true);
  assert.match(d.Ntex, /\\frac\{2\\sqrt\{5\}\}\{5\}/);
  assert.deepEqual(d.Ak, [[4, 0, 0], [0, 25, 48], [0, 48, 97]]);
  assert.equal(diag({ cells: S([[6, -2, 2], [-2, 3, -1], [2, -1, 3]]) }).verified, true); // repeated λ = 2
  assert.equal(diag({ cells: S([[2, 1], [0, 2]]) }).diagonalizable, false);
  err(() => diag({ cells: S([[0, -1], [1, 0]]) }), /complex/);
});

test('Quadratic forms: canonical form, rank, index, signature, nature', () => {
  const q = qform({ form: '3x^2 + 5y^2 + 3z^2 - 2xy + 2xz - 2yz' });
  assert.equal(q.canonical, '2y_{1}^2 + 3y_{2}^2 + 6y_{3}^2');
  assert.equal(q.nature, 'positive definite'); assert.equal(q.rank, 3); assert.equal(q.signature, 3);
  assert.equal(qform({ form: 'x^2 + 2xy + y^2' }).nature, 'positive semi-definite');
  assert.equal(qform({ form: 'x^2 + 2y^2 + 3z^2 + 2xy - 6xz' }).nature, 'indefinite');
  err(() => qform({ form: 'x^2 + y' }), /degree 2/);
});

test('Trig identities are proved, or shown false with an angle', () => {
  for (const identity of ['tan(x) + cot(x) = sec(x) csc(x)', '(1 - cos(2x))/sin(2x) = tan(x)', 'sin(x)^4 - cos(x)^4 = sin(x)^2 - cos(x)^2', 'sec(x)^2 - tan(x)^2 = 1', 'sin(3x) = 3sin(x) - 4sin(x)^3', '(1+sin(x))/cos(x) = cos(x)/(1-sin(x))']) {
    const r = ident({ identity });
    assert.equal(r.holds, true, identity); assert.equal(r.proved, true, identity);
  }
  assert.equal(ident({ identity: 'sin(2x) = 2sin(x)' }).holds, false);
});

test('Trig equations: general solution and solutions in [0, 2π)', () => {
  const deg = (equation) => treq({ equation }).degrees;
  assert.deepEqual(deg('2sin(x) - 1 = 0'), ['30°', '150°']);
  assert.deepEqual(deg('2cos(x)^2 + 3cos(x) + 1 = 0'), ['120°', '180°', '240°']);
  assert.deepEqual(deg('tan(x) = sqrt(3)'), ['60°', '240°']);
  assert.deepEqual(deg('sin(2x) = cos(x)'), ['30°', '90°', '150°', '270°']);
  assert.deepEqual(deg('sqrt(3)cos(x) + sin(x) = sqrt(2)'), ['75°', '345°']);
  assert.deepEqual(treq({ equation: 'sin(3x) = 1/2' }).generals, ['x = \\frac{1}{3}\\left(n\\pi + (-1)^{n}\\frac{\\pi}{6}\\right)']);
  assert.deepEqual(treq({ equation: '2sin(x) - 1 = 0' }).generals, ['x = n\\pi + (-1)^{n}\\frac{\\pi}{6}']);
  assert.equal(treq({ equation: 'x = cos(x)' }).numeric, true);
});

test('Inverse trig: principal values, f⁻¹(f(θ)), tan⁻¹a + tan⁻¹b', () => {
  assert.equal(invtrig({ mode: 'value', fn: 'cos', value: '-1/2' }).answer, '\\cos^{-1}\\left(-\\frac{1}{2}\\right) = \\frac{2\\pi}{3}');
  assert.equal(invtrig({ mode: 'value', fn: 'sec', value: '2' }).answer, '\\sec^{-1}\\left(2\\right) = \\frac{\\pi}{3}');
  assert.equal(invtrig({ mode: 'compose', fn: 'sin', angle: '5pi/6' }).answer, '\\sin^{-1}\\left(\\sin \\frac{5\\pi}{6}\\right) = \\frac{\\pi}{6}');
  assert.match(invtrig({ mode: 'sum', a: '1/2', b: '1/3', op: '+' }).answer, /= \\frac\{\\pi\}\{4\}$/);
  assert.match(invtrig({ mode: 'sum', a: '2', b: '3', op: '+' }).answer, /= \\frac\{3\\pi\}\{4\}$/);
  err(() => invtrig({ mode: 'value', fn: 'sin', value: '2' }), /between −1 and 1/);
});

test('3D geometry', () => {
  assert.equal(geo3({ mode: 'dc', p: '1, 2, 3', q: '3, 5, 9' }).answer, 'l, m, n = (\\frac{2}{7}, \\frac{3}{7}, \\frac{6}{7})');
  assert.equal(geo3({ mode: 'plane', p: '1,1,1', q: '2,3,4', s: '3,1,2' }).answer, '2x + 5y - 4z = 3');
  assert.equal(geo3({ mode: 'point-plane', p: '2, 1, -1', plane: '2x + y - 2z = 5' }).answer, 'D = \\frac{2}{3}');
  assert.equal(geo3({ mode: 'skew', p: '1,2,3', d1: '2,3,4', q: '2,4,5', d2: '3,4,5' }).answer, 'D = \\frac{\\sqrt{6}}{6}');
  assert.match(geo3({ mode: 'angle-planes', plane: '2x - y + z = 6', plane2: 'x + y + 2z = 7' }).answer, /\\frac\{\\pi\}\{3\}/);
  err(() => geo3({ mode: 'plane', p: '0,0,0', q: '1,1,1', s: '2,2,2' }), /one line/);
});

test('Polar coordinates and transformations', () => {
  assert.equal(polar({ mode: 'to-polar', x: '-1', y: 'sqrt(3)' }).answer, '(r, \\theta) = \\left(2, \\frac{2\\pi}{3}\\right)');
  assert.equal(polar({ mode: 'to-cartesian', r: '4', theta: '150', unit: 'deg' }).answer, '(x, y) = \\left(-2\\sqrt{3}, 2\\right)');
  assert.equal(polar({ mode: 'rotate', x: '2', y: '4', theta: '45', unit: 'deg' }).answer, '(X, Y) = \\left(3\\sqrt{2}, \\sqrt{2}\\right)');
  assert.equal(polar({ mode: 'curve', curve: 'r = 4cos(θ)' }).answer, 'x^2 + y^2 = 4x');
});

test('Domain, range, inverse, composition, parity', () => {
  const a = dr({ mode: 'domain', f: 'sqrt(x - 2)/(x - 5)' });
  assert.equal(a.domainTex, '\\left[2,\\ 5\\right) \\cup \\left(5,\\ \\infty\\right)'); assert.equal(a.rangeTex, '\\mathbb{R}');
  assert.equal(dr({ mode: 'domain', f: '(x + 1)/(x - 2)' }).rangeTex, '\\left(-\\infty,\\ 1\\right) \\cup \\left(1,\\ \\infty\\right)');
  assert.equal(dr({ mode: 'domain', f: 'sqrt(9 - x^2)' }).rangeTex, '\\left[0,\\ 3\\right]');
  assert.equal(dr({ mode: 'domain', f: 'ln(x^2 - 4)' }).domainTex, '\\left(-\\infty,\\ -2\\right) \\cup \\left(2,\\ \\infty\\right)');
  assert.equal(dr({ mode: 'domain', f: 'x/(x^2+1)' }).rangeTex, '\\left[-\\frac{1}{2},\\ \\frac{1}{2}\\right]');
  assert.equal(dr({ mode: 'inverse', f: '(2x + 3)/(x - 1)' }).inverseTex, 'f^{-1}(x) = \\frac{x+3}{x-2}');
  err(() => dr({ mode: 'inverse', f: 'x^2' }), /not one-to-one/);
  const c = dr({ mode: 'compose', f: 'x^2 + 1', g: 'sqrt(x - 1)' });
  assert.equal(c.fgTex, 'x'); assert.equal(c.gfTex, '\\left| x\\right|');
  assert.equal(dr({ mode: 'parity', f: 'x^3 - sin(x)' }).parity, 'odd');
  assert.equal(dr({ mode: 'parity', f: 'x^2 + x' }).parity, 'neither even nor odd');
});

test('Sets: operations, Venn regions, formulas, relations', () => {
  const s = sets({ mode: 'sets', U: '1,2,3,4,5,6,7,8,9,10', A: '2,4,6,8,10', B: '1,2,3,4,5' });
  assert.equal(s.ops.find((o) => o.name === 'A \\cup B').n, 8);
  assert.deepEqual(s.regions['11'], ['2', '4']); assert.deepEqual(s.regions['00'], ['7', '9']);
  assert.equal(sets({ mode: 'expression', U: '1,2,3,4,5,6,7,8', A: '1,2,3,4', B: '3,4,5,6', C: '2,4,6,8', expression: "(A ∪ B)' ∩ C" }).answerTex, "(A \\cup B)' \\cap C = \\{8\\}");
  assert.deepEqual(sets({ mode: 'relation', A: '1,2,3', relation: '(1,1),(2,2),(3,3),(1,2),(2,1)' }).kinds, ['equivalence relation']);
  assert.deepEqual(sets({ mode: 'relation', A: '1,2,3', relation: '(1,1),(2,2),(3,3),(1,2),(2,3),(1,3)' }).kinds, ['partial order']);
  err(() => sets({ mode: 'sets', U: '1,2', A: '3', B: '1' }), /not in U/);
});
