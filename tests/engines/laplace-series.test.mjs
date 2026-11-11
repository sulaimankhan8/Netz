// Groups 3E (Laplace, unit step, DFT/FFT) and 3C (series tests, power series, Fourier, harmonic analysis,
// grad/div/curl). Textbook answers (Grewal ch. 10, 21; Kreyszig ch. 6, 11). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as laplace } from '../../src/app/utils/engines/laplace.js';
import { solve as inverse } from '../../src/app/utils/engines/inverse-laplace.js';
import { solve as unitStep } from '../../src/app/utils/engines/unit-step.js';
import { solve as lode } from '../../src/app/utils/engines/laplace-ode.js';
import { solve as dft } from '../../src/app/utils/engines/dft-fft.js';
import { solve as conv } from '../../src/app/utils/engines/convergence-tests.js';
import { solve as power } from '../../src/app/utils/engines/power-series.js';
import { solve as fourier } from '../../src/app/utils/engines/fourier-series.js';
import { solve as harmonic } from '../../src/app/utils/engines/harmonic-analysis.js';
import { solve as gdc } from '../../src/app/utils/engines/grad-div-curl.js';

const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));

test('Laplace transforms, checked numerically above the growth rate', () => {
  const a = laplace({ f: 'e^(2t) sin(3t)' });
  assert.equal(a.F, '\\frac{3}{{s}^{2}-4 s+13}'); assert.equal(a.verified, true);
  assert.equal(laplace({ f: 't^2' }).F, '\\frac{2}{{s}^{3}}');
  assert.equal(laplace({ f: 'cosh(2t)' }).verified, true);
  // e^(−t) (which the simplifier writes as (eᵗ)⁻¹), sin² t, and the exact π/2 from ∫ₛ^∞
  assert.equal(laplace({ f: 'cosh(3t) - 2e^(-t)' }).F, '\\frac{s}{{s}^{2}-9}-\\frac{2}{s+1}');
  assert.equal(laplace({ f: 'sin(t)^2' }).F, '\\frac{2}{{s}^{3}+4 s}');
  assert.equal(laplace({ f: 'sin(t)/t' }).F, '\\frac{\\pi}{2}-\\tan^{-1}\\left(s\\right)');
  assert.equal(laplace({ f: 'e^(-t) cosh(t)' }).verified, true);
});

test('Inverse Laplace: partial fractions, complex roots, shifts, logs, convolution', () => {
  assert.equal(inverse({ mode: 'partial', F: '1/(s^2 - 3s + 2)' }).f, 'e^{2 t}-e^{t}');
  assert.equal(inverse({ mode: 'partial', F: '1/(s^2 (s + 1))' }).f, 'e^{-t}+t-1');
  assert.match(inverse({ mode: 'partial', F: '(s + 3)/(s^2 + 4s + 13)' }).f, /e\^\{-2 t\}.*\\cos\\left\(3 t\\right\)/);
  assert.equal(inverse({ mode: 'partial', F: 'e^(-2s)/(s^2 + 1)' }).f, '\\sin\\left(t-2\\right)\\, u\\left(t-2\\right)');
  assert.equal(inverse({ mode: 'convolution', F: '1/s', F2: '1/(s^2 + 1)' }).f, '1-\\cos\\left(t\\right)');
});

test('Unit step: pieces, shifts (exact π), δ and periodic functions', () => {
  assert.equal(unitStep({ mode: 'piecewise', pieces: 't for 0 < t < 1; 1 for t > 1' }).F, '\\frac{1-e^{-s}}{{s}^{2}}');
  // sin t on (0, π): (1 + e^{−πs})/(s² + 1)
  const s = unitStep({ mode: 'piecewise', pieces: 'sin(t) for 0 < t < pi; 0 for t > pi' });
  assert.equal(s.F, '\\frac{e^{-\\pi\\, s}+1}{{s}^{2}+1}'); assert.equal(s.verified, true);
  assert.equal(unitStep({ mode: 'steps', f: 'delta(t - 3) + u(t - 1)' }).F, 'e^{-3 s}+\\frac{e^{-s}}{s}');
  assert.equal(unitStep({ mode: 'periodic', pieces: '1 for 0 < t < 1; -1 for 1 < t < 2', period: '2' }).verified, true);
  // overlapping or too many pieces get a message instead of freezing the page
  err(() => unitStep({ mode: 'piecewise', pieces: 't for 0 < t < 1; 1 for t > 1; t for 0 < t < 1' }), /overlap/);
  const nine = Array.from({ length: 9 }, (_, i) => `1 for ${i} < t < ${i + 1}`).join('; ');
  err(() => unitStep({ mode: 'piecewise', pieces: nine }), /at most 8 pieces/);
});

test('ODEs by Laplace: exact coefficients, repeated roots, Y(s) in lowest terms', () => {
  const a = lode({ eq: "y'' + 3y' + 2y = e^(-3t)", ics: "y(0) = 1, y'(0) = 0" });
  assert.equal(a.y, 'y(t) = \\frac{e^{-3 t}}{2}+\\frac{5 e^{-t}}{2}-2 e^{-2 t}'); assert.equal(a.verified, true);
  assert.equal(a.Y, '\\frac{s^{2} + 6s + 10}{\\left(s + 1\\right)\\left(s + 2\\right)\\left(s + 3\\right)}');
  const b = lode({ eq: "y'' - 2y' + y = e^t", ics: "y(0) = 2, y'(0) = -1" });
  assert.equal(b.y, 'y(t) = 2 e^{t}-3 t\\, e^{t}+\\frac{{t}^{2}\\, e^{t}}{2}'); assert.equal(b.verified, true);
  assert.equal(lode({ eq: "y' + 2y = 4", ics: 'y(0) = 1' }).y, 'y(t) = 2-e^{-2 t}');
  assert.match(lode({ eq: "y'' + 4y = u(t - 1)", ics: "y(0) = 0, y'(0) = 0" }).y, /u\\left\(t-1\\right\)/);
  err(() => lode({ eq: "y'' + y = 0", ics: 'y(1) = 0' }), /conditions at t = 0/);
});

test('DFT and FFT', () => {
  assert.deepEqual(dft({ mode: 'fft', x: '1, 2, 3, 4' }).X, ['10', '-2 + 2i', '-2', '-2 - 2i']);
  assert.deepEqual(dft({ mode: 'dft', x: '1, 0, -1, 0' }).X, ['0', '2', '0', '2']);
  assert.deepEqual(dft({ mode: 'idft', x: '10, -2+2i, -2, -2-2i' }).X, ['1', '2', '3', '4']);
  err(() => dft({ mode: 'fft', x: '1, 2, 3' }), /2, 4, 8 or 16/);
});

test('Convergence tests give the textbook verdicts', () => {
  const v = (a, n0 = '1') => { const r = conv({ a, n0 }); return `${r.verdict} | ${r.by}`; };
  assert.equal(v('1/n^2'), 'converges | p-series');
  assert.equal(conv({ a: '1/n^2', n0: '1' }).sum, '\\frac{\\pi^2}{6}');
  assert.equal(v('1/n'), 'diverges | p-series');
  assert.equal(v('1/sqrt(n)'), 'diverges | p-series');
  assert.equal(v('(-1)^n/n'), 'converges conditionally | alternating series test');
  assert.equal(v('(-1)^n/sqrt(n)'), 'converges conditionally | alternating series test');
  assert.equal(v('(-1)^(n+1)/n^2'), 'converges absolutely | alternating series test');
  assert.equal(v('(2/3)^n'), 'converges | geometric series');
  assert.equal(v('n!/n^n'), 'converges | ratio test');
  assert.equal(v('n/(n+1)'), 'diverges | nth-term test');
  assert.equal(v('1/(n (n+1))'), 'converges | integral test');
  assert.equal(v('1/(n ln(n))', '2'), 'diverges | integral test');
});

test('Power series: radius and the end points', () => {
  const i = (c, center = '0', p = '1') => power({ c, center, power: p }).interval;
  assert.equal(i('1/n'), '[-1, 1)');
  assert.equal(i('1/n^2', '-1'), '[-2, 0]');
  assert.equal(i('n/3^n', '2'), '(-1, 5)');
  assert.equal(i('1/n!'), '(-\\infty, \\infty)');
  assert.equal(i('n!'), '\\text{only } x = 0');
  assert.equal(power({ c: '(-1)^n/4^n', center: '0', power: '2' }).R, '2');
});

test('Fourier series in the textbook form', () => {
  const x = fourier({ mode: 'full', f: 'x', from: '-pi', to: 'pi' });
  assert.equal(x.bn, '\\frac{2(-1)^{n+1}}{n}'); assert.equal(x.an, '0'); assert.equal(x.verified, true);
  assert.equal(fourier({ mode: 'full', f: 'x^2', from: '-pi', to: 'pi' }).an, '\\frac{4(-1)^{n}}{n^{2}}');
  const xs = fourier({ mode: 'full', f: 'x sin(x)', from: '-pi', to: 'pi' });
  assert.equal(xs.an, '\\frac{2(-1)^{n+1}}{n^{2} - 1}');
  assert.ok(xs.special.some((s) => s.which === 'a' && s.n === 1)); // a₁ = −1/2 is worked out on its own
  assert.equal(fourier({ mode: 'full', f: '-1 for -pi < x < 0; 1 for 0 < x < pi', from: '-pi', to: 'pi' }).bn, '\\frac{2 + 2(-1)^{n+1}}{n\\pi}');
  assert.equal(fourier({ mode: 'half-sin', f: 'x', from: '0', to: '2' }).bn, '\\frac{4(-1)^{n+1}}{n\\pi}');
  err(() => fourier({ mode: 'half-cos', f: 'x', from: '-1', to: '1' }), /start at 0/);
  err(() => fourier({ mode: 'full', f: 'x', from: '', to: 'pi' }), /The start of the interval is empty/);
});

test('Harmonic analysis from a table of values', () => {
  const h = harmonic({ y: '4, 8, 15, 7', harmonics: '2' });
  assert.equal(h.a0, '17');
  assert.match(h.series, /8\.5 - 5\.5\\cos \\theta \+ 0\.5\\sin \\theta/);
});

test('Gradient, divergence, curl and a scalar potential', () => {
  const g = gdc({ mode: 'grad', phi: 'x^2 y + y z^3', point: '1, -1, 1', dir: '2, 1, -2' });
  assert.equal(g.directional, '\\frac{4}{3}');
  assert.equal(gdc({ mode: 'div', P: 'x^2 y', Q: 'y z', R: 'x z^2', point: '1, 2, 3' }).atPoint, '\\text{at } (1, 2, 3): \\ 13');
  assert.equal(gdc({ mode: 'curl', P: 'x y', Q: 'y z', R: 'z x' }).irrotational, false);
  assert.match(gdc({ mode: 'potential', P: '2x y + z^3', Q: 'x^2', R: '3x z^2' }).result, /\{x\}\^\{2\}\\, y\+ x\\, \{z\}\^\{3\} \+ C/);
});
