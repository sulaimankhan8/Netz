// Inverse of a matrix: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/matrix-inverse.js';

const EXAMPLE = [['1', '2', '3'], ['0', '1', '4'], ['5', '6', '0']];
const ANSWER = [[-24, 18, 5], [20, -15, -4], [-5, 4, 1]];
const near = (A, B) => A.forEach((r, i) => r.forEach((v, j) => assert.ok(Math.abs(v - B[i][j]) < 1e-9, `(${i},${j}) ${v} ≠ ${B[i][j]}`)));

test('Inverse: page example by the adjoint method', () => {
  const a = solve({ cells: EXAMPLE, method: 'adjoint' });
  assert.equal(a.det, 1);
  near(a.cofactors, [[-24, 20, -5], [18, -15, 4], [5, -4, 1]]);
  near(a.adjoint, ANSWER);
  near(a.result, ANSWER);
  assert.equal(a.checks, true);
});

test('Inverse: Gauss-Jordan gives the same answer, with fractions where needed', () => {
  near(solve({ cells: EXAMPLE, method: 'gauss-jordan' }).result, ANSWER);
  const two = solve({ cells: [['4', '7'], ['2', '6']], method: 'gauss-jordan' });
  near(two.result, [[0.6, -0.7], [-0.2, 0.4]]);
  assert.equal(two.checks, true);
});

test('Inverse: singular, non-square and too big for the adjoint method', () => {
  const err = (cells, method, re) => assert.throws(() => solve({ cells, method }), (e) => e.name === 'EngineError' && re.test(e.message));
  err([['1', '2'], ['2', '4']], 'adjoint', /no inverse/);
  err([['1', '2'], ['2', '4']], 'gauss-jordan', /no inverse/);
  err([['1', '2', '3'], ['4', '5', '6']], 'adjoint', /square/);
  const five = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => String(i === j ? 2 : 0)));
  err(five, 'adjoint', /up to 4×4/);
  near(solve({ cells: five, method: 'gauss-jordan' }).result, five.map((r) => r.map((v) => (v === '2' ? 0.5 : 0))));
});
