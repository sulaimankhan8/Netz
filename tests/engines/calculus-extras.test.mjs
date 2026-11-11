// Group 3B (single-variable calculus extras): trig integrals, improper integrals, volumes, arc length and
// surfaces, nth derivatives, mean value theorems, errors, continuity, asymptotes. Textbook answers
// (Grewal ch. 4–6; Stewart ch. 7–8). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as trig } from '../../src/app/utils/engines/trig-integrals.js';
import { solve as improper } from '../../src/app/utils/engines/improper-integrals.js';
import { solve as volume } from '../../src/app/utils/engines/volume-revolution.js';
import { solve as arc } from '../../src/app/utils/engines/arc-length.js';
import { solve as nth } from '../../src/app/utils/engines/nth-derivative.js';
import { solve as mvt } from '../../src/app/utils/engines/mean-value-theorem.js';
import { solve as errs } from '../../src/app/utils/engines/errors-approximations.js';
import { solve as cont } from '../../src/app/utils/engines/continuity.js';
import { solve as asym } from '../../src/app/utils/engines/asymptotes.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Trigonometric integrals in their textbook form', () => {
  const t = (f) => trig({ f, kind: 'indefinite' });
  assert.equal(t('cos(x)^4').answer, '\\frac{3}{8}\\, x+\\frac{1}{4}\\, \\sin\\left(2 x\\right)+\\frac{1}{32}\\, \\sin\\left(4 x\\right)');
  assert.equal(t('sin(x)^3').answer, '\\frac{{\\cos\\left(x\\right)}^{3}}{3}-\\cos\\left(x\\right)');
  assert.equal(t('sin(x)^2*cos(x)^3').answer, '\\frac{{\\sin\\left(x\\right)}^{3}}{3}-\\frac{{\\sin\\left(x\\right)}^{5}}{5}');
  assert.equal(t('tan(x)^2').answer, '\\tan\\left(x\\right)- x');
  assert.match(t('sqrt(9 - x^2)').answer, /\\sin\^\{-1\}\\left\(\\frac\{x\}\{3\}\\right\)/);
  assert.equal(t('1/sqrt(x^2 + 9)').answer, '\\ln\\left(\\left| x+\\sqrt{{x}^{2}+9}\\right|\\right)');
  for (const f of ['cos(x)^4', 'sin(2x)^5', 'sqrt(x^2 + 4)']) assert.equal(t(f).verified, true);
});

test('Improper integrals: converge with a value, or diverge', () => {
  const i = (f, a, b) => improper({ f, a, b });
  assert.equal(i('1/x^2', '1', 'inf').valueTex, '1');
  assert.equal(i('1/x', '1', 'inf').converges, false);
  assert.equal(i('1/(1 + x^2)', '-inf', 'inf').valueTex, '\\pi');
  assert.equal(i('1/sqrt(x)', '0', '1').valueTex, '2');
  assert.equal(i('1/x^2', '-1', '1').converges, false); // the bad point is inside
  assert.equal(i('x e^(-x^2)', '0', 'inf').valueTex, '\\frac{1}{2}');
});

test('Volumes of revolution: disc, washer, shell, about y = k', () => {
  assert.equal(volume({ f: 'sqrt(x)', g: '', a: '0', b: '4', axis: 'x', k: '0' }).V, '8\\pi');
  assert.match(volume({ f: 'x', g: 'x^2', a: '', b: '', axis: 'x', k: '0' }).V, /^\\frac\{2 ?\\pi\}\{15\}/);
  assert.equal(volume({ f: 'x^2', g: '', a: '0', b: '2', axis: 'y', k: '0' }).V, '8\\pi');
  assert.equal(volume({ f: 'sqrt(9 - x^2)', g: '', a: '-3', b: '3', axis: 'x', k: '0' }).V, '36\\pi'); // a sphere: 4π·27/3
});

test('Arc length and surface area, exact where the textbook is', () => {
  // x^(3/2) on [0, 4]: (8/27)(10√10 − 1)
  const a = arc({ mode: 'cartesian', f: 'x^(3/2)', a: '0', b: '4' });
  assert.match(a.valueTex, /^\\frac\{80\\sqrt\{10\} - 8\}\{27\}/); near(a.value, (8 / 27) * (10 * Math.sqrt(10) - 1));
  assert.equal(arc({ mode: 'cartesian', f: 'x^2/8 - log(x)', a: '1', b: '4' }).valueTex, '2\\ln 2 + \\frac{15}{8}');
  assert.equal(arc({ mode: 'parametric', xt: '2cos(t)', yt: '2sin(t)', a: '0', b: '2pi' }).valueTex, '4\\pi');
  // the cardioid r = 1 + cos θ has length 8 (the corner at θ = π is handled)
  const c = arc({ mode: 'polar', r: '1 + cos(θ)', a: '0', b: '2pi' });
  near(c.value, 8, 1e-9); assert.equal(c.valueTex, '8');
  // surface of y = √x about the x-axis on [0, 1]: π(5√5 − 1)/6
  const s = arc({ mode: 'surface', f: 'sqrt(x)', a: '0', b: '1' });
  near(s.value, (Math.PI * (5 * Math.sqrt(5) - 1)) / 6);
  assert.equal(s.valueTex, '\\left(\\frac{5\\sqrt{5}}{6} - \\frac{1}{6}\\right)\\pi');
});

test('nth derivatives: standard results and Leibniz', () => {
  assert.equal(nth({ mode: 'standard', f: 'e^(2x) sin(3x)' }).yn, '(\\sqrt{13})^{n}e^{2x}\\sin\\left(3x + n\\tan^{-1}\\frac{3}{2}\\right)');
  assert.equal(nth({ mode: 'standard', f: '1/((x - 1)(x - 2))' }).yn, '-\\frac{(-1)^n n!}{(x - 1)^{n+1}} + \\frac{(-1)^n n!}{(x - 2)^{n+1}}');
  assert.equal(nth({ mode: 'standard', f: 'log(2x + 3)' }).yn, '\\frac{(-1)^{n-1}(n-1)!\\,2^{n}}{(2x + 3)^{n}}');
  assert.equal(nth({ mode: 'standard', f: 'cos(4x + 1)' }).yn, '4^{n}\\cos\\left(4x + 1 + \\frac{n\\pi}{2}\\right)');
  const l = nth({ mode: 'leibniz', u: 'x^2', v: 'e^(3x)', n: '4' });
  assert.equal(l.yn, '{e}^{3 x}\\, \\left(81 {x}^{2}+216 x+108\\right)'); assert.equal(l.verified, true);
});

test("Rolle's theorem and Lagrange's mean value theorem", () => {
  assert.deepEqual(mvt({ theorem: 'rolle', f: 'x^2 - 4x + 3', a: '1', b: '3' }).c, ['2']);
  assert.deepEqual(mvt({ theorem: 'rolle', f: 'sin(x)', a: '0', b: 'pi' }).c, ['\\frac{\\pi}{2}']);
  assert.deepEqual(mvt({ theorem: 'lagrange', f: 'sqrt(x)', a: '1', b: '4' }).c, ['\\frac{9}{4}']);
  const l = mvt({ theorem: 'lagrange', f: 'x^3 - 3x + 1', a: '-2', b: '3' });
  assert.equal(l.slope, '4'); assert.equal(l.c.length, 2);
});

test('Errors and approximations by differentials', () => {
  const a = errs({ mode: 'approx', f: 'sqrt(x)', x0: '25', dx: '0.3' });
  assert.equal(a.result, 'f(25.3) \\approx 5.03'); near(a.exact, Math.sqrt(25.3), 1e-6);
  assert.match(errs({ mode: 'error', f: 'x^3', x0: '5', dx: '0.02' }).result, /1\.2\\%/);
});

test('Continuity: the four kinds, and finding k', () => {
  const v = (f, a) => cont({ f, a }).verdict;
  assert.equal(v('x^2 for x < 1; 2x - 1 for x >= 1', '1'), 'continuous');
  assert.equal(v('(x^2 - 1)/(x - 1)', '1'), 'removable discontinuity');
  assert.equal(v('x + 1 for x < 0; x - 1 for x >= 0', '0'), 'jump discontinuity');
  assert.equal(v('1/x', '0'), 'infinite discontinuity');
  assert.equal(cont({ f: 'k x + 1 for x <= 2; 3x^2 for x > 2', a: '2' }).k, 'k = \\frac{11}{2}');
});

test('Asymptotes: vertical, horizontal and oblique', () => {
  const other = (f) => asym({ f }).other.map((o) => `${o.kind}: ${o.tex}`);
  assert.deepEqual(asym({ f: '1/(x^2 - 4)' }).vertical, ['x = -2', 'x = 2']);
  assert.deepEqual(asym({ f: 'x/(x^2 + 1)' }).vertical, []);
  assert.deepEqual(asym({ f: '(x^2 + 1)/(x - 1)' }).vertical, ['x = 1']);
  assert.deepEqual(other('(x^2 + 1)/(x - 1)'), ['oblique: y = x + 1']);
  assert.deepEqual(other('(2x + 1)/(x - 3)'), ['horizontal: y = 2']);
  assert.deepEqual(other('e^x'), ['horizontal: y = 0']);
  assert.deepEqual(other('sqrt(x^2 + 1)'), ['oblique: y = x', 'oblique: y = -x']);
});
