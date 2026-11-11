// Group 4D: vector integrals and calculus leftovers (Unit 6). Textbook answers (Grewal ch. 8; Stewart ch. 16).
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as line } from '../../src/app/utils/engines/line-integral.js';
import { solve as surf } from '../../src/app/utils/engines/surface-integral.js';
import { solve as green } from '../../src/app/utils/engines/greens-theorem.js';
import { solve as stokes } from '../../src/app/utils/engines/stokes-theorem.js';
import { solve as gauss } from '../../src/app/utils/engines/divergence-theorem.js';
import { solve as com } from '../../src/app/utils/engines/centre-of-mass.js';
import { solve as red } from '../../src/app/utils/engines/reduction-formula.js';
import { solve as leib } from '../../src/app/utils/engines/leibniz-integral-rule.js';
import { solve as curv } from '../../src/app/utils/engines/curvature-calculator.js';
import { solve as area } from '../../src/app/utils/engines/area-under-curve.js';

test('Line integrals: work done and ∫f ds', () => {
  assert.equal(line({ mode: 'work', P: '3x^2 + 6y', Q: '-14yz', R: '20xz^2', path: 'x = t, y = t^2, z = t^3', t0: '0', t1: '1' }).value, '5');
  assert.equal(line({ mode: 'work', P: '-y', Q: 'x', path: 'x = cos(t), y = sin(t)', t0: '0', t1: '2pi' }).value, '2\\pi');
  assert.equal(line({ mode: 'scalar', f: '', path: 'x = cos(t), y = sin(t), z = t', t0: '0', t1: '2pi' }).value, '2\\sqrt{2}\\,\\pi');
});

test('Flux, surface area and volume integrals', () => {
  assert.equal(surf({ mode: 'flux', P: 'x', Q: 'y', R: 'z', surface: 'sphere', a: '2' }).value, '32\\pi');
  assert.equal(surf({ mode: 'scalar', f: '', surface: 'sphere', a: '3' }).value, '36\\pi');
  assert.equal(surf({ mode: 'volume', f: '', region: 'sphere', a: '2' }).value, '\\frac{32\\pi}{3}');
  assert.equal(surf({ mode: 'volume', f: '1', region: 'limits', xlo: '0', xhi: '1', ylo: '0', yhi: '1 - x', zlo: '0', zhi: '1 - x - y' }).value, '\\frac{1}{6}');
});

test("Green's, Stokes' and the divergence theorem agree on both sides", () => {
  const g = green({ M: '3x^2 - 8y^2', N: '4y - 6xy', region: 'between', g1: 'x^2', g2: 'sqrt(x)', xlo: '0', xhi: '1' });
  assert.ok(g.verified); assert.equal(g.double, '\\frac{3}{2}');
  const s = stokes({ P: 'x^2 + y^2', Q: '-2xy', R: '0', surface: 'rectangle', xlo: '0', xhi: '2', ylo: '0', yhi: '3', c: '0' });
  assert.ok(s.verified); assert.equal(s.surface, '-36');
  const d = gauss({ P: '4x z', Q: '-y^2', R: 'y z', region: 'box', xlo: '0', xhi: '1', ylo: '0', yhi: '1', zlo: '0', zhi: '1' });
  assert.ok(d.verified); assert.equal(d.volume, '\\frac{3}{2}');
});

test('Centre of mass of a half-disc', () => {
  const r = com({ region: 'semicircle', a: '2', rho: '' });
  assert.equal(r.ybar, '\\frac{8}{3\\pi}');
  assert.equal(r.mass, '2\\pi');
});

test('Reduction formulas and Wallis', () => {
  assert.equal(red({ kind: 'sin', n: '6', wallis: 'yes' }).value, '\\frac{5\\pi}{32}');
  assert.equal(red({ kind: 'cos', n: '7', wallis: 'yes' }).value, '\\frac{16}{35}');
  assert.ok(red({ kind: 'sec', n: '3' }).verified);
});

test('Differentiation under the integral sign', () => {
  assert.equal(leib({ mode: 'evaluate', f: 'e^(-a x) sin(x)/x', lo: '0', hi: 'inf', a0: 'inf' }).F, '\\frac{\\pi}{2}-\\tan^{-1}\\left(a\\right)');
  assert.ok(leib({ mode: 'evaluate', f: '(x^a - 1)/log(x)', lo: '0', hi: '1' }).verified);
});

test('Radius of curvature', () => {
  assert.equal(curv({ mode: 'cartesian', f: 'x^2', at: '1' }).rho, '\\frac{5\\sqrt{5}}{2}');
  assert.equal(curv({ mode: 'parametric', x: 't - sin(t)', y: '1 - cos(t)', at: 'pi' }).rho, '4');
  assert.equal(curv({ mode: 'polar', r: '1 + cos(theta)', at: '0' }).rho, '\\frac{4}{3}');
});

test('Average value of a function', () => {
  assert.equal(area({ mode: 'average', f: 'sin(x)', a: '0', b: 'pi' }).averageTex, '\\frac{2}{\\pi}');
});
