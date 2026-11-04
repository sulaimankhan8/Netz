// Limit calculator: textbook limits, one-sided limits, and "does not exist". Run: npm run test:engines
// Every exact answer must also agree with the numerical check (verified === true).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/limit.js';

const L = (f, a, dir) => solve({ f, a, dir });
const check = (f, a, want, method) => {
  const r = L(f, a);
  assert.equal(r.exactTex, want, `${f} as x → ${a}`);
  if (method) assert.equal(r.method, method, `${f} method`);
  assert.equal(r.verified, true, `${f} should be verified`);
  return r;
};

test('Limits: substitution and factor-and-cancel', () => {
  check('x^2 + 3x', '2', '10', 'substitution');
  check('sin(x)', 'pi/2', '1', 'substitution');
  check('(x^2-5x+6)/(x^2-4)', '2', '-\\frac{1}{4}', 'factor'); // page example
  check('(x^2-4)/(x-2)', '2', '4', 'factor');
  check('(x^3-8)/(x-2)', '2', '12', 'factor');
  const twice = check('(x-1)^2/(x^2-2x+1)', '1', '1', 'factor');
  assert.match(twice.steps[1].title, /2 times/);
});

test("Limits: L'Hôpital's rule for 0/0 and ∞/∞", () => {
  check('sin(x)/x', '0', '1', 'lhopital');
  const twice = check('(1-cos(x))/x^2', '0', '\\frac{1}{2}', 'lhopital');
  assert.ok(twice.steps.some((s) => /round 2/.test(s.title)));
  check('(e^x-1)/x', '0', '1', 'lhopital');
  check('ln(x)/(x-1)', '1', '1', 'lhopital');
  check('(sqrt(x)-2)/(x-4)', '4', '\\frac{1}{4}', 'lhopital');
  check('ln(x)/x', 'inf', '0', 'lhopital');
  check('x/e^x', 'inf', '0', 'lhopital');
});

test('Limits at infinity, infinite limits and limits that do not exist', () => {
  check('(3x^2+1)/(2x^2-x)', 'inf', '\\frac{3}{2}', 'degrees');
  check('(x+1)/(x^2+1)', 'infinity', '0', 'degrees');
  check('x^3/(x+1)', '-inf', '\\infty', 'degrees');
  check('1/x^2', '0', '\\infty', 'infinite');
  const dne = check('1/x', '0', '\\text{does not exist}', 'infinite');
  assert.equal(dne.sides.left, -Infinity); assert.equal(dne.sides.right, Infinity);
  check('sin(1/x)', '0', '\\text{does not exist}');
  check('abs(x)/x', '0', '\\text{does not exist}');
  assert.equal(L('1/x', '0', 'right').exactTex, '\\infty');
  assert.equal(L('abs(x)/x', '0', 'left').exactTex, '-1');
  const e = L('(1+1/x)^x', 'inf');
  assert.equal(e.exactTex, 'e'); assert.equal(e.estimated, true); // labelled as an estimate
});

test('Limits: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (x) => x.name === 'EngineError' && re.test(x.message));
  err({ f: '', a: '0' }, /empty/);
  err({ f: 'x^2', a: '' }, /Enter the point/);
  err({ f: 'x^2', a: 'abc' }, /not a point/);
  err({ f: 'x*y', a: '1' }, /one variable/);
});
