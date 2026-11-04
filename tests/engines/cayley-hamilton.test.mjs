// Cayley–Hamilton: p(A) = O, and the inverse from the theorem. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/cayley-hamilton.js';

const S = (m) => solve({ cells: m.map((r) => r.map(String)) });
const near = (A, B) => A.every((row, i) => row.every((v, j) => Math.abs(v - B[i][j]) < 1e-9));

test('Cayley–Hamilton: verify the theorem and find the inverse', () => {
  const a = S([[1, 2], [3, 4]]);
  assert.equal(a.satisfied, true);
  assert.ok(near(a.inverse, [[-2, 1], [1.5, -0.5]]));
  const b = S([[2, -1, 1], [-1, 2, -1], [1, -1, 2]]); // a standard textbook matrix
  assert.equal(b.charTex, '\\lambda^{3} - 6\\lambda^{2} + 9\\lambda - 4 = 0');
  assert.equal(b.satisfied, true);
  assert.ok(near(b.inverse, [[0.75, 0.25, -0.25], [0.25, 0.75, 0.25], [-0.25, 0.25, 0.75]]));
  assert.equal(b.verified, true);
  const singular = S([[1, 2], [2, 4]]);
  assert.equal(singular.inverse, null);
  assert.ok(singular.steps.some((s) => s.title === 'No inverse'));
});
