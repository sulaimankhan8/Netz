// Group 3L: optimisation (golden section, gradient descent), boundary-value problems and PDEs (finite differences,
// shooting, heat equation, Liebmann), and probability extras (exponential, uniform, geometric, gamma, MGF, joint,
// confidence intervals). Textbook answers (Grewal NM ch. 11; Sastry; Montgomery). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as golden } from '../../src/app/utils/engines/golden-section.js';
import { solve as gd } from '../../src/app/utils/engines/gradient-descent.js';
import { solve as fdm } from '../../src/app/utils/engines/finite-difference-bvp.js';
import { solve as shoot } from '../../src/app/utils/engines/shooting-method.js';
import { solve as heat } from '../../src/app/utils/engines/heat-equation.js';
import { solve as liebmann } from '../../src/app/utils/engines/laplace-liebmann.js';
import { solve as expo } from '../../src/app/utils/engines/exponential-dist.js';
import { solve as unif } from '../../src/app/utils/engines/uniform-dist.js';
import { solve as geom } from '../../src/app/utils/engines/geometric-dist.js';
import { solve as gamma } from '../../src/app/utils/engines/gamma-dist.js';
import { solve as mgf } from '../../src/app/utils/engines/mgf.js';
import { solve as joint } from '../../src/app/utils/engines/joint-distribution.js';
import { solve as ci } from '../../src/app/utils/engines/confidence-interval.js';

const near = (a, b, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Golden section search finds the minimum and the maximum', () => {
  near(golden({ f: 'x^2 - 4x + 5', a: '0', b: '5', tol: '0.001', goal: 'min' }).x, 2, 1e-3);
  const m = golden({ f: 'x e^(-x)', a: '0', b: '3', tol: '0.001', goal: 'max' });
  near(m.x, 1, 1e-3); near(m.fx, 1 / Math.E, 1e-6);
  near(golden({ f: 'x^4 - 3x', a: '0', b: '2', tol: '0.001', goal: 'min' }).x, Math.cbrt(3 / 4), 1e-3);
});

test('Gradient descent converges for a small α and is flagged when α is too large', () => {
  const a = gd({ f: '(x - 3)^2', x0: '0', alpha: '0.2', steps: '20', tol: '0.0001' });
  near(Number(a.point), 3, 1e-3);
  // tiny values in maths read 1.09951 × 10⁻⁸, not 1.09951e-8
  assert.equal(gd({ f: 'x^2 + 3y^2', x0: '2', y0: '1', alpha: '0.1', steps: '20', tol: '0.0001' }).point, '(0.0230584, 1.09951 \\times 10^{-8})');
  const b = gd({ f: 'x^2 + 3y^2', x0: '2', y0: '1', alpha: '0.4', steps: '20', tol: '0.0001' });
  assert.equal(b.growing, true); assert.match(b.notes[0], /too large/);
});

test('Boundary-value problems: finite differences and shooting', () => {
  // y'' = y, y(0) = 0, y(1) = 1 with h = 1/4: the textbook table (exact sinh x / sinh 1 beside it)
  const f = fdm({ p: '0', q: '-1', r: '0', a: '0', b: '1', ya: '0', yb: '1', n: '4', exact: 'sinh(x)/sinh(1)' });
  assert.equal(f.h, 0.25); assert.equal(f.verified, true);
  // y'' = −y, y(0) = 0, y(π/2) = 1: y = sin x, so the slope is 1
  const s = shoot({ F: '-y', a: '0', b: 'pi/2', ya: '0', yb: '1', s0: '0', s1: '2', n: '10' });
  near(s.slope, 1, 1e-5);
  near(s.table.at(-1).y, 1, 1e-6);
  near(shoot({ F: '3y^2/2', a: '0', b: '1', ya: '4', yb: '1', s0: '-7', s1: '-9', n: '40' }).slope, -8, 1e-4);
});

test('Heat equation and Laplace equation (Liebmann)', () => {
  const h = heat({ method: 'bender', f: '4x - x^2', L: '4', c2: '1', h: '1', k: '', g0: '0', g1: '0', steps: '4' });
  assert.equal(h.lambda, 0.5); assert.equal(h.k, 0.5);
  assert.equal(heat({ method: 'crank', f: 'sin(pi x)', L: '1', c2: '1', h: '0.25', k: '0.0625', g0: '0', g1: '0', steps: '3' }).lambda, 1);
  // Square plate, top edge at 100: centre 25 by symmetry
  const l = liebmann({ n: '4', top: '100', bottom: '0', left: '0', right: '0', tol: '0.001' });
  near(l.grid[2][2], 25, 0.01); near(l.grid[1][2], 52.68, 0.01); near(l.grid[3][2], 9.82, 0.01);
});

test('Continuous and discrete distributions', () => {
  const e = expo({ lambda: '0.5', mode: 'less', x: '2' });
  near(e.p, 1 - Math.exp(-1), 1e-6); assert.equal(e.mean, '2'); assert.equal(e.variance, '4');
  near(expo({ lambda: '0.001', mode: 'greater', x: '1200' }).p, Math.exp(-1.2), 1e-6);
  const u = unif({ a: '0', b: '10', c: '3', d: '7' });
  assert.equal(u.p, '\\frac{2}{5}'); assert.equal(u.variance, '\\frac{25}{3}');
  near(geom({ p: '0.2', k: '3', mode: 'exact' }).p, 0.128, 1e-9);
  near(geom({ p: '1/6', k: '4', mode: 'atmost' }).p, 1 - (5 / 6) ** 4, 1e-6);
  near(geom({ p: '0.1', k: '5', mode: 'atleast' }).p, 0.9 ** 4, 1e-9);
  const g = gamma({ alpha: '2', theta: '3', mode: 'less', x: '5' });
  near(g.p, 1 - Math.exp(-5 / 3) * (1 + 5 / 3), 1e-6); assert.equal(g.mean, '6'); assert.equal(g.variance, '18');
});

test('Moment generating functions, including the 0/0 uniform case', () => {
  const b = mgf({ dist: 'binomial', n: '10', p: '0.3' });
  assert.equal(b.mean, '3'); assert.equal(b.variance, '\\frac{21}{10}');
  const u = mgf({ dist: 'uniform', a: '0', b: '1' });
  assert.equal(u.mean, '\\frac{1}{2}'); assert.equal(u.variance, '\\frac{1}{12}'); assert.equal(u.verified, true);
  assert.equal(mgf({ dist: 'normal', mu: '5', sigma: '2' }).variance, '4');
  assert.equal(mgf({ dist: 'poisson', lambda: '2' }).variance, '2');
  assert.equal(mgf({ dist: 'custom', xs: '0, 1, 2', ps: '1/4, 1/2, 1/4' }).variance, '\\frac{1}{2}');
});

test('Joint distributions: covariance, correlation and independence', () => {
  const a = joint({ xs: '0, 1, 2', ys: '0, 1', table: '1/8, 1/8; 1/4, 1/4; 1/8, 1/8' });
  assert.equal(a.indep, true); assert.equal(a.cov, '0');
  const b = joint({ xs: '0, 1', ys: '0, 1', table: '0.4, 0.1; 0.1, 0.4' });
  assert.equal(b.indep, false); assert.equal(b.rho, '\\frac{3}{5}');
  // Cov = 0 but not independent
  const c = joint({ xs: '-1, 0, 1', ys: '0, 1', table: '0, 1/3; 1/3, 0; 0, 1/3' });
  assert.equal(c.cov, '0'); assert.equal(c.indep, false);
});

test('Confidence intervals: z, t and a proportion', () => {
  const z = ci({ mode: 'z', xbar: '50', sd: '10', n: '25', level: '95' });
  near(z.margin, 3.9199, 1e-4); assert.equal(z.interval, '(46.0801, 53.9199)');
  const t = ci({ mode: 't', xbar: '12', sd: '3', n: '10', level: '95' });
  assert.equal(t.crit, 2.262); assert.equal(t.critName, 't_{9}');
  near(ci({ mode: 'proportion', n: '400', level: '99', x: '120' }).margin, 0.059, 1e-3);
});
