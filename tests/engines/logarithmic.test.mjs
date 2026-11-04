// Logarithmic differentiation: x^x-type powers and long products/quotients. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/logarithmic.js';

test('Logarithmic: variable powers', () => {
  const xx = solve({ f: 'x^x' });
  assert.equal(xx.answer, '{x}^{x}\\left[\\ln\\left(x\\right)+1\\right]');
  assert.equal(xx.verified, true);
  assert.match(xx.steps[1].lines[0], /x\\, \\ln\\left\(x\\right\)/); // ln y = x ln x
  assert.equal(solve({ f: 'y = x^(sin(x))' }).verified, true); // "y =" is allowed
  assert.equal(solve({ f: 'sin(x)^x' }).verified, true);
  assert.equal(solve({ f: '(1 + 1/x)^x' }).verified, true);
});

test('Logarithmic: products and quotients, with a tidy bracket', () => {
  const q = solve({ f: '(x+1)^2 (x-2)^3 / (x+3)^4', at: '2' });
  assert.equal(q.verified, true);
  assert.match(q.answer, /\\frac\{2\}\{x\+1\}\+\\frac\{3\}\{x-2\}-\\frac\{4\}\{x\+3\}/);
  assert.equal(q.point.slope, 0); // y·[…] is undefined at x = 2, but the slope there is 0
  const r = solve({ f: 'x sqrt(x+1) / (x-1)' });
  assert.equal(r.verified, true);
  assert.doesNotMatch(r.answer, /\\frac\{\\frac/); // ½/(x+1) is written 1/(2(x+1))
});

test('Logarithmic: functions where the method gains nothing are sent elsewhere', () => {
  assert.throws(() => solve({ f: 'x^2' }), /Derivative Calculator/);
  assert.throws(() => solve({ f: 'sin(x)' }), /Derivative Calculator/);
  assert.throws(() => solve({ f: '7' }), /constant/);
});
