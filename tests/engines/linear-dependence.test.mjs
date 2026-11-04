// Linear dependence of vectors: rank test and the relation between them. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/linear-dependence.js';

const S = (m) => solve({ cells: m.map((r) => r.map(String)) });

test('Linear dependence', () => {
  assert.equal(S([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).independent, true);
  const two = S([[1, 2, 3], [2, 4, 6]]);
  assert.equal(two.independent, false);
  assert.equal(two.relation, '2v_{1} - v_{2} = 0');
  const three = S([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  assert.equal(three.rank, 2);
  assert.equal(three.relation, 'v_{1} - 2v_{2} + v_{3} = 0');
  assert.equal(three.verified, true);
  const many = S([[1, 1], [2, 3], [4, 5]]); // 3 vectors in R² are always dependent
  assert.equal(many.independent, false);
  assert.ok(many.steps.some((s) => /More vectors than entries/.test(s.title)));
  assert.equal(many.verified, true);
});
