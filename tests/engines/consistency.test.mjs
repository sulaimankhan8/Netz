// Consistency of linear systems by the rank test: one solution, none, infinitely many, homogeneous. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/consistency.js';

const S = (m) => solve({ cells: m.map((r) => r.map(String)) });

test('Consistency: the three cases', () => {
  const one = S([[1, 1, 1, 6], [1, 2, 3, 14], [1, 4, 9, 36]]);
  assert.equal(one.kind, 'one');
  assert.deepEqual(one.solution, [1, 2, 3]);
  assert.deepEqual([one.rankA, one.rankAug], [3, 3]);
  const many = S([[1, 1, 1, 6], [1, 2, 3, 14], [2, 3, 4, 20]]);
  assert.equal(many.kind, 'many');
  assert.deepEqual(many.general, ['x = t - 2', 'y = -2t + 8', 'z = t']);
  assert.equal(many.verified, true);
  const none = S([[1, 1, 1, 6], [1, 2, 3, 14], [2, 3, 4, 21]]);
  assert.equal(none.kind, 'none');
  assert.deepEqual([none.rankA, none.rankAug], [2, 3]);
});

test('Consistency: homogeneous systems', () => {
  const trivial = S([[1, 2, 3, 0], [4, 5, 6, 0], [7, 8, 10, 0]]);
  assert.equal(trivial.kind, 'one');
  assert.equal(trivial.homogeneous, true);
  const nontrivial = S([[1, 2, -1, 0], [2, 4, -2, 0], [1, 1, 1, 0]]);
  assert.equal(nontrivial.kind, 'many');
  assert.deepEqual(nontrivial.general, ['x = -3t', 'y = 2t', 'z = t']);
});
