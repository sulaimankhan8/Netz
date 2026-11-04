// Binomial distribution: exact fractions, the complement shortcut, mean and variance. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/binomial.js';

test('Binomial distribution', () => {
  const r = solve({ n: '10', p: '1/2', query: 'eq', k: '5' });
  assert.equal(r.valueTex, '\\frac{63}{256} \\approx 0.246094');
  assert.deepEqual([r.mean, r.variance], [5, 2.5]);
  const c = solve({ n: '6', p: '1/2', query: 'ge', k: '1' });
  assert.equal(c.valueTex, '\\frac{63}{64} \\approx 0.984375');
  assert.match(c.steps[1].title, /complement/);
  assert.ok(Math.abs(solve({ n: '10', p: '0.3', query: 'le', k: '2' }).value - 0.382783) < 1e-6);
  assert.ok(Math.abs(solve({ n: '20', p: '0.1', query: 'between', a: '2', b: '4' }).value - 0.565079) < 1e-6);
  assert.throws(() => solve({ n: '5', p: '1.2', query: 'eq', k: '1' }), /between 0 and 1/);
});
