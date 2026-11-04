// Poisson distribution, including the approximation to the binomial. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/poisson.js';

test('Poisson distribution', () => {
  assert.equal(solve({ lambda: '2', query: 'eq', k: '3' }).valueTex, '0.180447');
  assert.equal(solve({ lambda: '3', query: 'ge', k: '1' }).valueTex, '0.950213'); // 1 − e^(−3)
  const a = solve({ source: 'binomial', n: '200', p: '0.01', query: 'le', k: '2' }); // λ = 2
  assert.equal(a.lambda, 2);
  assert.equal(a.valueTex, '0.676676');
  assert.throws(() => solve({ lambda: '-1', query: 'eq', k: '1' }), /positive/);
});
