// Curve fits: exponential, a·bˣ, power and polynomial (exact data come back exactly). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/curve-fitting.js';

test('Curve fitting', () => {
  assert.equal(solve({ model: 'base', x: '1, 2, 3, 4, 5', y: '6, 12, 24, 48, 96' }).equation, 'y = 3(2)^{x}');
  assert.equal(solve({ model: 'power', x: '1, 2, 3, 4', y: '3, 12, 27, 48' }).equation, 'y = 3x^{2}');
  const e = solve({ model: 'exponential', x: '0, 1, 2, 3, 4', y: '2, 5.4, 14.8, 40.2, 109.2' });
  assert.match(e.equation, /^y = 1\.99\d*e\^\{1\.00\d*x\}$/); // about 2e^x
  assert.equal(solve({ model: 'polynomial', degree: '3', x: '-2, -1, 0, 1, 2, 3', y: '-7, 0, 1, 2, 9, 28' }).equation, 'y = x^{3} + 1');
  assert.throws(() => solve({ model: 'exponential', x: '1, 2', y: '-1, 2' }), /positive/);
});
