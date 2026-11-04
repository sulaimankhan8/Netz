// Descriptive statistics: raw data, a frequency table and grouped data (textbook formulas). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/descriptive-statistics.js';

const near = (a, b, tol = 1e-4) => assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`);

test('Descriptive statistics: raw data', () => {
  const r = solve({ mode: 'raw', data: '2, 4, 4, 4, 5, 5, 7, 9' });
  assert.equal(r.mean, 5);
  assert.equal(r.median, 4.5);
  assert.equal(r.mode, 4);
  assert.equal(r.sd, 2); // the classic σ = 2 example
  near(r.sampleVariance, 32 / 7);
  assert.deepEqual([r.q1, r.q3], [4, 6.5]);
  assert.equal(solve({ mode: 'raw', data: '1, 2, 3' }).modes.length, 0); // no repeats: no mode
});

test('Descriptive statistics: frequency table and grouped data', () => {
  const d = solve({ mode: 'discrete', x: '1, 2, 3, 4, 5', f: '3, 7, 12, 6, 2' });
  assert.equal(d.n, 30);
  near(d.mean, 2.9);
  assert.equal(d.median, 3);
  assert.equal(d.mode, 3);
  const g = solve({ mode: 'grouped', classes: '0-10, 10-20, 20-30, 30-40, 40-50', f: '5, 8, 15, 12, 10' });
  near(g.mean, 27.8);
  near(g.median, 28); // 20 + (25 − 13)/15 × 10
  near(g.mode, 27); // 20 + 7/10 × 10
  assert.throws(() => solve({ mode: 'grouped', classes: '0-10, 10-20', f: '1, 2, 3' }), /2 classes but 3 frequencies/);
});
