// ANOVA: one-way and two-way, with the F decision. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/anova.js';

test('ANOVA', () => {
  const one = solve({ kind: 'one', groups: '8, 10, 7, 14, 11; 7, 5, 10, 9, 9; 12, 9, 13, 12, 14' });
  assert.equal(one.tests[0].F.toFixed(4), '4.0000');
  assert.equal(one.tests[0].crit, 3.885); // F(2, 12) at 5%
  assert.equal(one.tests[0].reject, true);
  assert.equal(one.verified, true);
  const two = solve({ kind: 'two', groups: '30, 26, 38; 24, 29, 28; 33, 24, 35; 36, 31, 30; 27, 35, 33' });
  assert.deepEqual(two.tests.map((t) => t.reject), [false, false]);
  assert.equal(two.tests[1].crit, 4.459); // F(2, 8) at 5%
  assert.throws(() => solve({ kind: 'two', groups: '1, 2; 3' }), /same number of values/);
  assert.throws(() => solve({ kind: 'one', groups: '1, 2, 3' }), /at least two/);
});
