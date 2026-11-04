// Factoring polynomials: common factor, identities, ac method, factor theorem. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/factoring.js';

const F = (f) => { const r = solve({ f }); assert.equal(r.verified, true, `${f} should multiply back`); return r; };
const titles = (r) => r.steps.map((s) => s.title).join(' > ');

test('Factoring: quadratics and identities', () => {
  assert.equal(F('x^2 + 5x + 6').answer, '\\left(x + 2\\right)\\left(x + 3\\right)');
  const ac = F('6x^2 + x - 2');
  assert.equal(ac.answer, '\\left(2x - 1\\right)\\left(3x + 2\\right)');
  assert.match(titles(ac), /ac method/);
  assert.match(titles(F('4x^2 - 9')), /Difference of two squares/);
  assert.equal(F('x^3 - 8').answer, '\\left(x - 2\\right)\\left(x^{2} + 2x + 4\\right)');
  assert.match(titles(F('8x^3 + 27')), /Sum of two cubes/);
  assert.equal(F('x^2 + 6x + 9').answer, '\\left(x + 3\\right)^{2}');
  assert.equal(F('3x^3 - 12x').answer, '3x\\left(x - 2\\right)\\left(x + 2\\right)');
});

test('Factoring: factor theorem, repeated identities, and polynomials that do not factor', () => {
  const c = F('x^3 - 6x^2 + 11x - 6');
  assert.equal(c.answer, '\\left(x - 1\\right)\\left(x - 2\\right)\\left(x - 3\\right)');
  assert.match(titles(c), /Factor theorem: f\(1\) = 0/);
  assert.equal(F('x^4 - 16').answer, '\\left(x - 2\\right)\\left(x + 2\\right)\\left(x^{2} + 4\\right)');
  assert.equal(F('(x+1)(x-2)').steps[0].title, 'Expand first');
  const prime = F('x^2 + 4');
  assert.equal(prime.prime, true);
  assert.equal(prime.answer, 'x^{2} + 4');
  assert.throws(() => solve({ f: 'sqrt(x) + 1' }), /not a polynomial/);
  assert.throws(() => solve({ f: '7' }), /constant/);
});
