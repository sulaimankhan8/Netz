// Normal distribution: areas (left, right, between) and the inverse. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/normal.js';
import { normalCdf, normalInverse } from '../../src/app/utils/numeric/distributions.js';

test('Normal distribution: Φ and its inverse', () => {
  assert.equal(normalCdf(1.96).toFixed(4), '0.9750');
  assert.equal(normalCdf(-1).toFixed(4), '0.1587');
  assert.equal(normalInverse(0.975).toFixed(4), '1.9600');
});

test('Normal distribution: questions', () => {
  const N = (c) => { const r = solve(c); assert.equal(r.verified, true, JSON.stringify(c)); return r.value.toFixed(4); };
  assert.equal(N({ mu: '60', sigma: '10', query: 'gt', a: '75' }), '0.0668');
  assert.equal(N({ mu: '60', sigma: '10', query: 'between', a: '45', b: '70' }), '0.7745'); // opposite sides: add
  assert.equal(N({ mu: '60', sigma: '10', query: 'between', a: '65', b: '80' }), '0.2858'); // same side: subtract
  assert.equal(N({ mu: '100', sigma: '15', query: 'inverse', p: '0.95' }), '124.6728');
  assert.throws(() => solve({ mu: '0', sigma: '0', query: 'lt', a: '1' }), /positive/);
});
