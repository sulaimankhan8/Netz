// Cholesky decomposition A = LLᵀ and solving Ax = b. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/cholesky.js';

const S = (m) => m.map((r) => r.map(String));

test('Cholesky decomposition', () => {
  const r = solve({ cells: S([[4, 2, 14], [2, 17, -5], [14, -5, 83]]), b: '14, -101, 155' });
  assert.deepEqual(r.L, [[2, 0, 0], [1, 4, 0], [7, -3, 5]]);
  assert.deepEqual(r.xTex, ['3', '-6', '1']);
  assert.equal(r.verified, true);
  assert.deepEqual(solve({ cells: S([[4, 12, -16], [12, 37, -43], [-16, -43, 98]]) }).L, [[2, 0, 0], [6, 1, 0], [-8, 5, 3]]);
  assert.match(solve({ cells: S([[2, 1], [1, 2]]) }).LTex, /\\sqrt\{2\}.*\\frac\{\\sqrt\{6\}\}\{2\}/); // exact surds
  assert.throws(() => solve({ cells: S([[1, 2], [3, 4]]) }), /not symmetric/);
  assert.throws(() => solve({ cells: S([[1, 2], [2, 1]]) }), /not positive definite/);
});
