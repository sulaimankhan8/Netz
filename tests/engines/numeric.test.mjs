// Shared maths (src/app/utils/numeric) against hand-worked and textbook answers.
// Run all engine tests: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as N from '../../src/app/utils/numeric/index.js';

const M = N.matrix;
const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const sameM = (A, B, tol = 1e-9) => {
  assert.equal(A.length, B.length, 'row count');
  A.forEach((r, i) => r.forEach((v, j) => near(v, B[i][j], tol)));
};
const engineError = (fn) => assert.throws(fn, (e) => e.name === 'EngineError');

test('matrix arithmetic', () => {
  const m = M.multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
  sameM(m.result, [[19, 22], [43, 50]]);
  assert.equal(m.working[0].text, '(1)(5) + (2)(7) = 19');
  engineError(() => M.multiply([[1, 2]], [[1, 2]]));
  sameM(M.power([[1, 1], [1, 0]], 5).result, [[8, 5], [5, 3]]); // Fibonacci
  sameM(M.power([[2, 3], [4, 5]], 0).result, [[1, 0], [0, 1]]);
  sameM(M.transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);
  sameM(M.add([[1, 2]], [[3, 4]]), [[4, 6]]);
  engineError(() => M.add([[1, 2]], [[1, 2, 3]]));
});

test('determinant', () => {
  // 2(0 + 4) + 3(10 + 1) + 1(8 − 0) = 49
  const D = [[2, -3, 1], [2, 0, -1], [1, 4, 5]];
  const byCofactors = M.detByCofactors(D);
  assert.equal(byCofactors.result, 49);
  assert.deepEqual(byCofactors.terms.map((t) => t.value), [8, 33, 8]);
  near(M.detByRowReduction(D).result, 49);
  near(M.det([[0, 1], [1, 0]]), -1); // needs a row swap
  assert.equal(M.det([[1, 2], [2, 4]]), 0);
  const F = [[1, 2, 0, 3], [4, 0, 1, 2], [0, 1, 3, 1], [2, 2, 1, 0]];
  near(M.detByCofactors(F).result, M.det(F));
  engineError(() => M.det([[1, 2, 3], [4, 5, 6]]));
  engineError(() => M.det([[1, NaN], [2, 3]]));
});

test('inverse', () => {
  const A = [[4, 7], [2, 6]];
  const inv = [[0.6, -0.7], [-0.2, 0.4]];
  sameM(M.inverseByAdjoint(A).result, inv);
  sameM(M.inverseByGaussJordan(A).result, inv);
  const B = [[2, -1, 0], [-1, 2, -1], [0, -1, 2]];
  sameM(M.multiply(B, M.inverseByGaussJordan(B).result).result, M.identity(3));
  sameM(M.inverseByAdjoint(B).result, M.inverseByGaussJordan(B).result);
  engineError(() => M.inverseByAdjoint([[1, 2], [2, 4]]));
  engineError(() => M.inverseByGaussJordan([[1, 2], [2, 4]]));
  assert.match(M.inverseByGaussJordan(A).ops[0].text, /^R/);
});

test('RREF and rank', () => {
  const r = M.rref([[1, 2, 3], [2, 4, 6], [1, 1, 1]]);
  assert.equal(r.rank, 2);
  sameM(r.result, [[1, 0, -1], [0, 1, 2], [0, 0, 0]]);
  assert.equal(M.rank([[1, 0], [0, 1]]), 2);
  assert.equal(M.rank([[0, 0], [0, 0]]), 0);
  const X = [[1, 2], [3, 4]];
  M.rref(X);
  assert.deepEqual(X, [[1, 2], [3, 4]], 'input must not change');
});

test('Thomas algorithm', () => {
  // −xᵢ₋₁ + 2xᵢ − xᵢ₊₁ = d with d = [1, 0, 0, 1] gives x = [1, 1, 1, 1]
  const t = N.thomas([0, -1, -1, -1], [2, 2, 2, 2], [-1, -1, -1, 0], [1, 0, 0, 1]);
  t.result.forEach((v) => near(v, 1));
  assert.equal(t.steps.rows.length, 4);
  assert.equal(t.notes.length, 2);
  engineError(() => N.thomas([0, 1], [0, 1], [1, 0], [1, 1]));
});

test('difference tables', () => {
  const dt = N.differenceTable([0, 1, 8, 27, 64]); // y = x³
  assert.deepEqual(dt[1], [1, 7, 19, 37]);
  assert.deepEqual(dt[3], [6, 6]);
  assert.equal(N.usefulOrder(dt), 3);
  assert.equal(N.backward(dt, 1, 4), 37);
  assert.equal(N.forward(dt, 2, 0), 6);
  assert.equal(N.equalSpacing([1, 1.5, 2, 2.5]), 0.5);
  engineError(() => N.equalSpacing([1, 2, 4]));
  const st = N.staggeredRows([0, 1, 2], N.differenceTable([0, 1, 4]));
  assert.equal(st.length, 5);
  assert.equal(st[1][2], 1);
  assert.equal(st[3][2], 3);
  assert.equal(st[2][3], 2);
  assert.deepEqual(N.differenceHeaders(3, '∇'), ['x', 'y', '∇y', '∇²y', '∇³y']);
  const dd = N.dividedDifferences([1, 2, 4], [1, 4, 16]); // y = x²
  assert.deepEqual(dd[1], [3, 6]);
  assert.equal(dd[2][0], 1);
  engineError(() => N.dividedDifferences([1, 1], [2, 3]));
});

test('fractions and typed numbers', () => {
  assert.deepEqual(N.toFraction(0.3333333333333333), { n: 1, d: 3 });
  assert.deepEqual(N.toFraction(-2.5), { n: -5, d: 2 });
  assert.deepEqual(N.toFraction(49 / 6), { n: 49, d: 6 });
  assert.equal(N.toFraction(Math.PI), null);
  assert.equal(N.formatNumber(1 / 3), '1/3');
  assert.equal(N.formatNumber(4), '4');
  assert.equal(N.formatNumber(Math.SQRT2), '1.41421');
  assert.equal(N.parseNumber(' -7/2 '), -3.5);
  assert.equal(N.parseNumber('−3'), -3);
  assert.equal(N.parseNumber('.5'), 0.5);
  assert.ok(Number.isNaN(N.parseNumber('1/0')));
  assert.ok(Number.isNaN(N.parseNumber('2x')));
  assert.deepEqual(M.parseMatrixText('1 2\n3 4'), [['1', '2'], ['3', '4']]);
  assert.deepEqual(M.parseMatrixText('[[1, 2], [3, 4]]'), [['1', '2'], ['3', '4']]);
  engineError(() => M.parseMatrixText('1 2\n3'));
  engineError(() => M.parseMatrixText('1 2 3 4 5 6 7'));
});

test('ODE steps (Grewal: dy/dx = x + y, y(0) = 1, h = 0.1)', () => {
  const f = (x, y) => x + y;
  near(N.eulerStep(f, 0, 1, 0.1).y, 1.1);
  near(N.rk2Step(f, 0, 1, 0.1).y, 1.11);
  near(N.rk2Step(f, 0, 1, 0.1, 'midpoint').y, 1.11);
  const rk = N.march(N.rk4Step, f, 0, 1, 0.1, 2);
  near(rk.points[1].y, 1.1103417, 1e-7);
  near(rk.points[2].y, 1.2428051, 1e-7);
  near(rk.points[2].y, 2 * Math.exp(0.2) - 1.2, 1e-6); // exact y = 2eˣ − x − 1
  assert.equal(rk.records[1].x, 0.1);
  assert.equal(rk.records[1].xNext, 0.2);
  near(rk.records[0].k1, 0.1);
  const sv = N.startValues(f, 0, 1, 0.1, 4);
  assert.equal(sv.points.length, 4);
  assert.equal(sv.slopes.length, 4);
  assert.equal(sv.points[3].x, 0.3, 'no float drift');
  engineError(() => N.eulerStep(() => NaN, 0, 1, 0.1));
  engineError(() => N.march(N.eulerStep, f, 0, 1, 0.001, 5000));
});
