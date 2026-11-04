// Regression lines (y on x, x on y), r from the slopes, and estimates. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/regression.js';

test('Regression lines', () => {
  const r = solve({ x: '1, 2, 3, 4, 5', y: '2, 4, 5, 4, 5', atX: '6', atY: '3' });
  assert.equal(r.yOnX, 'y = 0.6x + 2.2');
  assert.equal(r.xOnY, 'x = y - 1');
  assert.ok(Math.abs(r.r - 0.7746) < 1e-4);
  assert.ok(Math.abs(r.estY.y - 5.8) < 1e-9);
  assert.ok(Math.abs(r.estX.x - 2) < 1e-9);
  assert.equal(r.verified, true);
  assert.throws(() => solve({ x: '1, 1, 1', y: '1, 2, 3' }), /same/);
});
