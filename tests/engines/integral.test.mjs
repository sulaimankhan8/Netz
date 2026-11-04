// Integral calculator: textbook integrals by each method, definite integrals with exact values,
// the numerical fallback, and the cases NETZ must refuse. Run: npm run test:engines
// Every step-by-step answer has already passed the engine's own check (F' = f at several points).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, recognise } from '../../src/app/utils/engines/integral.js';
import { rationalParts } from '../../src/app/utils/symbolic/poly.js';
import { parse } from '../../src/app/utils/symbolic/tree.js';

const titles = (r) => r.steps.map((s) => s.title).join(' > ');
const check = (f, method, answer) => {
  const r = solve({ f });
  assert.equal(r.found, true, `${f} should be found`);
  assert.equal(r.verified, true, `${f} should be verified`);
  if (method) assert.match(titles(r), method, `${f} method`);
  if (answer) assert.equal(r.answer, answer, `${f} answer`);
  assert.doesNotMatch(r.answer, /\d\.\d/, `${f} answer should have no decimals`);
  return r;
};

test('Integrals: power rule, linearity and the standard table', () => {
  check('x^2', /Power rule/, '\\frac{{x}^{3}}{3}');
  check('3x^2+2x-5', /term by term/, '{x}^{3}+{x}^{2}-5 x');
  check('x^(-3)', /Power rule/, '-\\frac{1}{2 {x}^{2}}');
  check('sqrt(x)', /sqrt/);
  check('1/x', /1\/x/, '\\ln\\left(\\left| x\\right|\\right)');
  check('(2x+1)^5', /linear inside/, '\\frac{{\\left(2 x+1\\right)}^{6}}{12}');
  check('e^(3x)', /Exponential/);
  check('2^x', /base a/);
  check('sin(3x+1)', /linear inside/, '-\\frac{\\cos\\left(3 x+1\\right)}{3}');
  check('sec(x)^2', /sec²/, '\\tan\\left(x\\right)');
  check('1/(1+x^2)', /tan⁻¹/, '\\tan^{-1}\\left(x\\right)');
  check('1/(4+x^2)', /tan⁻¹/, '\\frac{\\tan^{-1}\\left(\\frac{x}{2}\\right)}{2}');
  check('1/sqrt(1-x^2)', /sin⁻¹/);
  check('cos(x)^2', /identity/);
  check('tan(x)^2', /identity/, '\\tan\\left(x\\right)- x');
});

test('Integrals: substitution and f′/f', () => {
  check('x*cos(x^2)', /Substitution u = x\^2/, '\\frac{\\sin\\left({x}^{2}\\right)}{2}');
  check('log(x)/x', /Substitution u = ln\(x\)/);
  check('sin(x)^2*cos(x)', /Substitution u = sin\(x\)/);
  check('x*sqrt(x^2+1)', /Substitution u = x\^2/); // u = x² + 1's inner part, not √(x² + 1)
  check('2x/(x^2+1)', /derivative of the bottom/, '\\ln\\left({x}^{2}+1\\right)');
  check('cos(x)/sin(x)', /derivative of the bottom/);
});

test('Integrals: by parts (ILATE, tabular, and the integral that comes back)', () => {
  check('x*e^x', /tabular/);
  check('x^2*e^x', /tabular/, '{e}^{x}\\, \\left({x}^{2}-2 x+2\\right)');
  check('x*sin(x)', /tabular/);
  check('x*log(x)', /Integration by parts/);
  check('atan(x)', /Integration by parts/);
  check('e^x*sin(x)', /comes back/);
});

test('Integrals: partial fractions', () => {
  check('1/(x*(x+1))', /Partial fractions/);
  check('(x+1)/(x^2-3x+2)', /Partial fractions/);
  check('x^2/(x-1)', /Partial fractions/); // divides first
  check('1/((x-1)^2*(x+2))', /Partial fractions/); // repeated factor
  check('1/(x^2+x+1)', /Partial fractions/); // irreducible quadratic → tan⁻¹ with √3, no decimals
  check('(3x+5)/(x^2+2x+5)', /Partial fractions/);
});

test('Integrals with no step-by-step method are refused, not guessed', () => {
  assert.throws(() => solve({ f: 'sin(x^2)' }), /can't integrate this step by step/);
  assert.throws(() => solve({ f: '1/log(x)' }), /definite integral instead/);
});

test('Definite integrals: exact values, numerical fallback, improper integrals', () => {
  const D = (f, a, b) => solve({ f, kind: 'definite', a, b });
  assert.equal(D('x^2', '0', '1').valueTex, '\\frac{1}{3}');
  assert.equal(D('sin(x)', '0', 'pi').valueTex, '2');
  assert.equal(D('1/x', '1', 'e').valueTex, '1');
  assert.match(D('1/(1+x^2)', '0', '1').valueTex, /^\\frac\{\\pi\}\{4\}/);
  assert.match(D('tan(x)', '0', 'pi/4').valueTex, /^\\frac\{\\ln 2\}\{2\}/);
  assert.match(D('log(x)', '1', '2').valueTex, /^2\\ln 2 - 1/);
  const swapped = D('x', '2', '0');
  assert.equal(swapped.value, -2);
  const gauss = D('e^(-x^2)', '0', '1');
  assert.equal(gauss.found, false);
  assert.ok(Math.abs(gauss.value - 0.746824132812427) < 1e-9);
  assert.throws(() => D('1/x', '-1', '1'), /improper integral/);
  assert.equal(D('x^3', '1', '1').value, 0);
});

test('Exact-value recogniser and fast polynomials', () => {
  assert.equal(recognise(Math.PI / 2), '\\frac{\\pi}{2}');
  assert.equal(recognise(Math.LN2 - 0.5), '\\ln 2 - \\frac{1}{2}');
  assert.equal(recognise(0.123456789), null);
  // math.rationalize never finishes (2x + 1)^6; ours is instant
  const t = Date.now();
  const r = rationalParts(parse('(2x+1)^6/(x-1)'), 'x');
  assert.ok(Date.now() - t < 200);
  assert.equal(r.P.length, 7);
  assert.deepEqual(r.Q, [-1, 1]);
});
