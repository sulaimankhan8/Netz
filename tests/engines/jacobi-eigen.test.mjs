// Jacobi's eigenvalue method for symmetric matrices. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/jacobi-eigen.js';

const S = (m) => m.map((r) => r.map(String));

test('Jacobi eigenvalue method', () => {
  const r = solve({ cells: S([[1, Math.SQRT2, 2], [Math.SQRT2, 3, Math.SQRT2], [2, Math.SQRT2, 1]]) }); // textbook: 5, 1, −1
  assert.deepEqual(r.valuesTex, ['5', '1', '-1']);
  assert.equal(r.verified, true);
  const s = solve({ cells: S([[2, 1], [1, 2]]) });
  assert.equal(s.rotations, 1); // one rotation diagonalises a 2×2
  assert.deepEqual(s.valuesTex, ['3', '1']);
  assert.deepEqual(solve({ cells: S([[6, -2, 2], [-2, 3, -1], [2, -1, 3]]) }).valuesTex, ['8', '2', '2']);
  assert.throws(() => solve({ cells: S([[1, 2], [3, 4]]) }), /not symmetric/);
});
