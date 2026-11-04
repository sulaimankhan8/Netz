// Derivative calculator and the symbolic step engine. Run: npm run test:engines
// Every answer must also pass the engine's own check against math.js (verified === true).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/derivative.js';

const D = (f, extra = {}) => solve({ f, ...extra });
const rules = (r, k = 0) => r.rounds[k].steps.map((s) => s.rule);

test('Derivatives: the textbook rules, all verified', () => {
  const cases = [
    ['x^3 + 2x^2 - 5x + 7', '3x^2 + 4x - 5'],
    ['x^2 sin(3x)', '2x sin(3x) + 3x^2cos(3x)'],
    ['(x^2+1)/(x-1)', '(x^2 - 2x - 1) / (x - 1)^2'],
    ['sin(x^3)', '3x^2cos(x^3)'],
    ['e^(2x)', '2e^(2x)'],
    ['ln(x^2+1)', '2x / (x^2 + 1)'],
    ['2^x', '2^x ln(2)'],
    ['x^x', 'x^x (ln(x) + 1)'],
    ['t^3', '3t^2'],
  ];
  for (const [f, want] of cases) {
    const r = D(f);
    assert.equal(r.answerText, want, f);
    assert.equal(r.verified, true, `${f} should be verified`);
  }
  for (const f of ['tan(x)', 'sec(2x)', 'csc(x)', 'cot(x^2)', 'sqrt(x^2+1)', 'asin(x/2)', 'acos(x)', 'atan(2x)', 'sinh(x)', 'cosh(x^2)', 'tanh(x)', 'log10(x)', 'exp(-x^2)', '1/x', 'x*e^x', 'cos(x)^2', '(sin(x))/(1+cos(x))', 'x^(1/3)', 'cbrt(x)', '3^(x^2)', 'sin(x)^cos(x)']) {
    assert.equal(D(f).verified, true, `${f} should be verified`);
  }
});

test('Derivatives: steps name the rules, outermost first', () => {
  assert.deepEqual(rules(D('x^2 sin(3x)')), ['Product rule', 'Power rule', 'Derivative of sin with the chain rule', 'Constant multiple rule']);
  assert.equal(rules(D('x^3 + 2x^2 - 5x + 7'))[0], 'Sum and difference rule');
  assert.equal(rules(D('(x^2+1)/(x-1)'))[0], 'Quotient rule');
  assert.equal(rules(D('sqrt(x)'))[0], 'Derivative of √');
  assert.equal(rules(D('x^x'))[0], 'Logarithmic differentiation');
  const p = D('x^2 sin(3x)').rounds[0].steps[0];
  assert.match(p.line, /\\frac\{d\}\{dx\}/);
  assert.match(p.formula, /u'v \+ uv'/);
});

test('Derivatives: higher order, a point, constants and other letters', () => {
  const second = D('x^4', { order: '2' });
  assert.equal(second.answerText, '12x^2');
  assert.equal(second.rounds.length, 2);
  assert.equal(D('sin(x)', { order: '3' }).answerText, '-cos(x)');
  const pt = D('x^3', { at: '2' }).point;
  assert.equal(pt.slope, 12); assert.equal(pt.fa, 8);
  assert.equal(D('5').answerText, '0');
  const a = D('a*x^2');
  assert.equal(a.answerText, '2a x');
  assert.match(a.notes[0], /a is treated as a constant/);
});

test('Derivatives: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ f: '' }, /empty/);
  err({ f: 'x^2 +' }, /could not be read/);
  err({ f: 'foo(x)' }, /"foo" is not a function/);
  err({ f: 'x^2', order: '4' }, /1st, 2nd or 3rd/);
  err({ f: '1/x', at: '0' }, /not defined at x = 0/);
});
