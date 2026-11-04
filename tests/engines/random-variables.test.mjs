// Random variables: discrete tables and continuous densities. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/random-variables.js';

test('Random variables', () => {
  const d = solve({ kind: 'discrete', x: '0, 1, 2, 3', p: '1/8, 3/8, 3/8, 1/8' }); // heads in 3 tosses
  assert.deepEqual([d.meanTex, d.varianceTex], ['\\frac{3}{2}', '\\frac{3}{4}']);
  assert.throws(() => solve({ kind: 'discrete', x: '1, 2', p: '0.5, 0.4' }), /add up to 1/);
  const c = solve({ kind: 'continuous', f: '2x', a: '0', b: '1', c: '0', d: '1/2' });
  assert.deepEqual([c.meanTex, c.varianceTex], ['\\frac{2}{3}', '\\frac{1}{18}']);
  assert.ok(Math.abs(c.prob - 0.25) < 1e-12);
  assert.throws(() => solve({ kind: 'continuous', f: 'x', a: '0', b: '1' }), /k = 2/);
  assert.throws(() => solve({ kind: 'continuous', f: 'x - 1', a: '0', b: '2' }), /negative/);
});
