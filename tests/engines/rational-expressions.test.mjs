// Rational expressions: factor and cancel, sums over the LCD, and restrictions. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/rational-expressions.js';

const S = (expr) => { const r = solve({ expr }); assert.equal(r.verified, true, `${expr} should check out`); return r; };

test('Rational expressions: factor and cancel, keeping the restrictions', () => {
  const r = S('(x^2 - 1)/(x^2 + 2x + 1)');
  assert.equal(r.answer, '\\frac{x - 1}{x + 1}');
  assert.deepEqual(r.restrictions, ['-1']);
  const s = S('(x^2 - 5x + 6)/(x^2 - 9)');
  assert.equal(s.answer, '\\frac{x - 2}{x + 3}');
  assert.deepEqual(s.restrictions, ['-3', '3']); // x = 3 stays excluded after cancelling
  assert.equal(S('(2x^2 - 8)/(4x + 8)').answer, '\\frac{x - 2}{2}');
  assert.equal(S('(x^3 - 8)/(x - 2)').answer, 'x^{2} + 2x + 4');
});

test('Rational expressions: sums, differences and products', () => {
  const sum = S('1/(x - 1) + 1/(x + 1)');
  assert.equal(sum.answer, '\\frac{2x}{\\left(x - 1\\right)\\left(x + 1\\right)}');
  assert.ok(sum.steps.some((s) => /lowest common denominator/.test(s.title)));
  assert.equal(S('2/(x^2 - 4) - 1/(x - 2)').answer, '-\\frac{x}{\\left(x - 2\\right)\\left(x + 2\\right)}');
  assert.equal(S('x/(x - 3) * (x^2 - 9)/x^2').answer, '\\frac{x + 3}{x}');
  assert.throws(() => solve({ expr: 'sqrt(x)/x' }), /fractions of polynomials/);
});
