// Groups 4E–4H: discrete maths and OR (Unit 15), numerical and statistics pages, the "later" numerical methods,
// bill discounting and corporate tax. Textbook answers (Rosen; Taha; Kapoor; Sastry; Grewal ch. 26–28).
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as rec } from '../../src/app/utils/engines/recurrence-relations.js';
import { solve as kmap } from '../../src/app/utils/engines/k-map-simplifier.js';
import { solve as transport } from '../../src/app/utils/engines/transportation-problem.js';
import { solve as assign } from '../../src/app/utils/engines/assignment-problem.js';
import { solve as kkt } from '../../src/app/utils/engines/kuhn-tucker.js';
import { solve as mc } from '../../src/app/utils/engines/monte-carlo-integration.js';
import { solve as wave } from '../../src/app/utils/engines/wave-equation.js';
import { solve as cg } from '../../src/app/utils/engines/conjugate-gradient.js';
import { solve as svd } from '../../src/app/utils/engines/svd-calculator.js';
import { solve as fp } from '../../src/app/utils/engines/floating-point-representation.js';
import { solve as cheb } from '../../src/app/utils/engines/chebyshev-nodes.js';
import { solve as np } from '../../src/app/utils/engines/non-parametric-tests.js';
import { solve as cc } from '../../src/app/utils/engines/control-charts.js';
import { solve as markov } from '../../src/app/utils/engines/markov-chain.js';
import { solve as lt } from '../../src/app/utils/engines/linear-transformations.js';
import { solve as muller } from '../../src/app/utils/engines/muller-method.js';
import { solve as bair } from '../../src/app/utils/engines/bairstow-method.js';
import { solve as horner } from '../../src/app/utils/engines/horner-method.js';
import { solve as graeffe } from '../../src/app/utils/engines/graeffe-root-squaring.js';
import { solve as hermite } from '../../src/app/utils/engines/hermite-interpolation.js';
import { solve as inv } from '../../src/app/utils/engines/inverse-interpolation.js';
import { solve as everett } from '../../src/app/utils/engines/everett-interpolation.js';
import { solve as bill } from '../../src/app/utils/engines/bill-discounting.js';
import { solve as corp } from '../../src/app/utils/engines/corporate-tax-calculator.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Recurrence relations by characteristic roots', () => {
  assert.equal(rec({ eq: 'a(n) = 5a(n-1) - 6a(n-2)', ics: 'a(0) = 1, a(1) = 0' }).answer, '3 \\cdot 2^{n} - 2 \\cdot 3^{n}');
  assert.ok(rec({ eq: 'a(n) = 5a(n-1) - 6a(n-2) + 2^n', ics: 'a(0) = 1, a(1) = 3' }).verified);
  assert.ok(rec({ eq: 'a(n) = 4a(n-1) - 4a(n-2) + n 2^n', ics: 'a(0) = 1, a(1) = 1' }).verified);
});

test('K-map minimal forms', () => {
  assert.equal(kmap({ vars: '4', m: '0, 2, 5, 7, 8, 10, 13, 15' }).sop, "B'D' + BD");
  assert.equal(kmap({ vars: '4', m: '4, 8, 10, 11, 12, 15', d: '9, 14' }).sop, "BC'D' + AC + AB'");
  assert.equal(kmap({ mode: 'expression', vars: '3', expr: "AB + A'C + BC" }).sop, "A'C + AB");
});

test('Transportation: the classic 3 × 4', () => {
  const P = { costs: '19 30 50 10; 70 30 40 60; 40 8 70 20', supply: '7 9 18', demand: '5 8 7 14' };
  assert.equal(transport({ ...P, method: 'nw' }).initial, 1015);
  assert.equal(transport({ ...P, method: 'least' }).initial, 814);
  const v = transport({ ...P, method: 'vam' });
  assert.equal(v.initial, 779);
  assert.equal(v.total, 743);
});

test('Assignment by the Hungarian method', () => {
  assert.equal(assign({ costs: '9 11 14 11 7; 6 15 13 13 10; 12 13 6 8 8; 11 9 10 12 9; 7 12 14 10 14', goal: 'min' }).total, 38);
  assert.ok(assign({ costs: '16 10 14 11; 14 11 15 15; 15 15 13 12; 13 12 14 15', goal: 'max' }).verified);
});

test('Kuhn–Tucker', () => {
  const r = kkt({ f: '10x + 4y - 2x^2 - y^2', goal: 'max', constraints: '2x + y <= 5; x >= 0; y >= 0' });
  assert.equal(r.value, '\\frac{91}{6}');
});

test('Monte Carlo is reproducible and close', () => {
  const a = mc({ mode: 'mean', f: 'x^2', a: '0', b: '1', N: '10000', seed: '1' }), b = mc({ mode: 'mean', f: 'x^2', a: '0', b: '1', N: '10000', seed: '1' });
  assert.equal(a.estimate, b.estimate);
  near(a.estimate, 1 / 3, 0.02);
});

test('Wave equation, conjugate gradient, SVD', () => {
  const w = wave({ f: 'x(4 - x)', g: '0', L: '4', c: '1', h: '1', steps: '4' });
  assert.deepEqual([w.rows[1].u1, w.rows[1].u2, w.rows[2].u2], [2, 3, 0]);
  assert.deepEqual(cg({ A: '4 1; 1 3', b: '1 2' }).x, ['1/11', '7/11']);
  const s = svd({ A: '3 2 2; 2 3 -2' });
  assert.deepEqual(s.sigma, ['5', '3', '0']);
  assert.equal(s.rank, 2);
});

test('IEEE-754 bits', () => {
  assert.equal(fp({ x: '-13.625', format: 'single' }).hex, 'C15A0000');
  assert.equal(fp({ x: '0.1', format: 'single' }).hex, '3DCCCCCD');
  assert.equal(fp({ x: '0.1', format: 'double' }).hex, '3FB999999999999A');
});

test("Runge's phenomenon", () => {
  const r = cheb({ f: '1/(1 + 25x^2)', a: '-1', b: '1', n: '11' });
  near(r.errEqual, 1.91564, 1e-4);
  assert.ok(r.errCheb < 0.12);
});

test('Sign test, Mann–Whitney, control charts', () => {
  near(np({ test: 'sign', x: '12 15 9 18 20 11 14 16 13 17', m0: '12' }).p, 0.1797, 1e-4);
  assert.equal(np({ test: 'mann', x: '14 9 18 12 15 11', y: '20 17 22 16 19 21 13' }).statistic, 5);
  const c = cc({ chart: 'c', data: '2 3 5 1 4 12 3 2' });
  assert.deepEqual([c.limits.cl, c.limits.ucl, c.out], [4, 10, [6]]);
});

test('Markov chains and linear maps', () => {
  assert.deepEqual(markov({ P: '0.7 0.3; 0.4 0.6', start: '1 0', n: '3' }).pi, ['\\frac{4}{7}', '\\frac{3}{7}']);
  const t = lt({ mode: 'formula', formula: 'T(x, y, z) = (x + 2y - z, y + z, x + y - 2z)' });
  assert.deepEqual([t.rank, t.nullity], [2, 1]);
});

test('Muller, Bairstow, Horner, Graeffe', () => {
  assert.equal(muller({ f: 'x^3 - x - 1', x0: '0', x1: '1', x2: '2' }).root, '1.324718');
  assert.ok(bair({ coeffs: '1 -1.1 2.3 0.5 3.3', r0: '-1', s0: '-1' }).verified);
  assert.equal(horner({ coeffs: '1 0 3 -5', places: '3' }).root, '1.154');
  const g = graeffe({ coeffs: '1 -6 11 -6', m: '3' }).roots.map(Number);
  near(g[0], 3, 0.02); near(g[1], 2, 0.01); near(g[2], 1, 0.001);
});

test('Hermite, inverse and Everett interpolation', () => {
  assert.equal(hermite({ x: '0 1', y: '1 3', dy: '0 2', at: '0.5' }).poly, '-2x^{3} + 4x^{2} + 1');
  near(inv({ method: 'lagrange', x: '20 25 30 35', y: '0.342 0.423 0.5 0.574', target: '0.390' }).x, 22.93, 0.02);
  assert.equal(everett({ x: '1 2 3 4 5 6', y: '1 8 27 64 125 216', at: '3.5' }).y, 42.875);
});

test('Bill discounting and corporate tax', () => {
  const b = bill({ mode: 'days', face: '7300', rate: '10', days: '73' });
  assert.deepEqual([b.bd, b.td, b.bg], ['₹146', '₹143.14', '₹2.86']);
  assert.equal(corp({ country: 'uk', income: '100000' }).total, '£22,750');
  assert.equal(corp({ country: 'in', income: '50000000', regime: '115BAA' }).effective, 25.168);
});
