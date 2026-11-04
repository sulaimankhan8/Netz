// Linear equations: brackets, fractions, decimals, no solution and identities. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/linear-equation.js';

test('Linear equations: one solution', () => {
  const r = solve({ eq: '3(x - 2) + 4 = 2x + 7' });
  assert.equal(r.x, 9);
  assert.equal(r.verified, true);
  const f = solve({ eq: 'x/3 + 1/2 = 5/6' });
  assert.equal(f.x, 1);
  assert.match(f.steps[0].title, /multiply both sides by 6/);
  assert.equal(solve({ eq: '5 - 2x = 11' }).x, -3);
  assert.equal(solve({ eq: '0.5x + 1.25 = 3' }).xTex, '\\frac{7}{2}');
});

test('Linear equations: no solution, every x, and equations that are not linear', () => {
  assert.equal(solve({ eq: '2x + 3 = 2x + 5' }).kind, 'none');
  assert.equal(solve({ eq: '2(x+1) = 2x + 2' }).kind, 'all');
  assert.throws(() => solve({ eq: 'x^2 = 4' }), /Quadratic/);
  assert.throws(() => solve({ eq: '1/x = 2' }), /denominator/);
  assert.throws(() => solve({ eq: 'x + 1' }), /one = sign/);
});
