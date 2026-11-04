// Double integration by the trapezoidal and Simpson's rules. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/double-integration.js';

test('Double integration', () => {
  assert.ok(Math.abs(solve({ f: 'x*y', a: '0', b: '1', c: '0', d: '2', m: '2', n: '2', rule: 'simpson' }).value - 1) < 1e-12); // exact for xy
  const t = solve({ f: '1/(x+y)', a: '1', b: '2', c: '1', d: '2', m: '4', n: '4', rule: 'trapezoidal' });
  assert.equal(t.value.toFixed(4), '0.3407'); // textbook value with h = k = 0.25
  const s = solve({ f: '1/(x+y)', a: '1', b: '2', c: '1', d: '2', m: '4', n: '4', rule: 'simpson' });
  assert.equal(s.value.toFixed(4), '0.3398');
  assert.equal(s.verified, true);
  assert.equal(s.table.rows.length, 5);
  assert.throws(() => solve({ f: 'x', a: '0', b: '1', c: '0', d: '1', m: '3', n: '2', rule: 'simpson' }), /even number/);
  assert.throws(() => solve({ f: 'x*z', a: '0', b: '1', c: '0', d: '1', m: '2', n: '2' }), /only x and y/);
});
