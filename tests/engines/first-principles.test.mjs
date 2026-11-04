// Derivative from first principles: each family of functions, and what is refused. Run: npm run test:engines
// Every answer must also agree with math.js's derivative (verified === true).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/first-principles.js';

const check = (f, family, answer) => {
  const r = solve({ f });
  assert.equal(r.family, family, `${f} family`);
  assert.equal(r.verified, true, `${f} should be verified`);
  if (answer) assert.equal(r.answer, answer, `${f} answer`);
  return r;
};
const lines = (r) => r.steps.flatMap((s) => s.lines).join(' | ');

test('First principles: polynomials expand, cancel, divide by h, let h → 0', () => {
  const r = check('x^2', 'polynomial', '2 x');
  assert.match(lines(r), /x\^\{2\} \+ 2xh \+ h\^\{2\}/); // (x + h)² expanded
  assert.match(lines(r), /= 2x \+ h/); // after dividing by h
  check('x^3', 'polynomial', '3 {x}^{2}');
  check('3x^2 + 2x - 5', 'polynomial', '6 x+2');
  check('5', 'polynomial', '0');
});

test('First principles: fractions, square roots and the standard functions', () => {
  const inv = check('1/x', 'rational');
  assert.match(lines(inv), /x - \\left\(x \+ h\\right\)/); // 1·x − 1·(x + h), brackets kept
  check('1/x^2', 'rational', '-\\frac{2}{{x}^{3}}');
  check('(x+1)/(x-1)', 'rational');
  check('sqrt(x)', 'sqrt', '\\frac{1}{2 \\sqrt{x}}');
  check('sqrt(2x+1)', 'sqrt', '\\frac{1}{\\sqrt{2 x+1}}');
  check('sin(x)', 'sin', '\\cos\\left(x\\right)');
  check('cos(x)', 'cos');
  check('e^x', 'exp');
  check('ln(x)', 'log', '\\frac{1}{x}');
});

test('First principles: slope at a point, and functions it does not cover', () => {
  assert.equal(solve({ f: 'x^2', at: '3' }).point.slope, 6);
  assert.throws(() => solve({ f: 'tan(x)' }), /Derivative Calculator/);
  assert.throws(() => solve({ f: 'x^2 sin(x)' }), /Derivative Calculator/);
  assert.throws(() => solve({ f: 'x + y' }), /one variable/);
});
