// Group 4C: more ODEs and PDEs (Unit 12). Textbook answers (Grewal ch. 11–12, 17–18). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as clairaut } from '../../src/app/utils/engines/clairaut-equation.js';
import { solve as sim } from '../../src/app/utils/engines/simultaneous-differential-equations.js';
import { solve as apps } from '../../src/app/utils/engines/ode-applications.js';
import { solve as series } from '../../src/app/utils/engines/series-solution-ode.js';
import { solve as form } from '../../src/app/utils/engines/formation-of-pde.js';
import { solve as lagrange } from '../../src/app/utils/engines/lagrange-linear-pde.js';
import { solve as charpit } from '../../src/app/utils/engines/charpit-method.js';
import { solve as pdecc } from '../../src/app/utils/engines/pde-constant-coefficients.js';
import { solve as sepv } from '../../src/app/utils/engines/separation-of-variables.js';

test("Clairaut's equation and equations solvable for p", () => {
  const r = clairaut({ eq: 'y = px + p^2' });
  assert.equal(r.kind, 'clairaut');
  assert.equal(r.singular, 'y = -\\frac{{x}^{2}}{4}');
  assert.equal(clairaut({ eq: 'y = px + 1/p' }).singular, 'y^{2} = 4x');
  assert.ok(clairaut({ eq: 'p^2 - (x + y)p + xy = 0' }).verified);
});

test('Simultaneous equations by elimination', () => {
  const r = sim({ eq1: 'dx/dt + y = sin(t)', eq2: 'dy/dt + x = cos(t)', ics: 'x(0) = 2, y(0) = 0' });
  assert.ok(r.verified);
  assert.equal(r.xTex, 'e^{-t}+e^{t}');
  assert.ok(sim({ eq1: 'Dx + 2y = e^t', eq2: 'Dy - 2x = e^(-t)', ics: '' }).verified);
});

test("Newton's cooling and circuits", () => {
  const c = apps({ mode: 'cooling', Ts: '20', T0: '100', t1: '20', T1: '60', at: '40', target: '30' });
  assert.equal(c.atValue, '40');
  assert.equal(c.time, '60');
  assert.ok(apps({ mode: 'lcr', L: '1', R: '2', C: '0.2', E: '0', q0: '1', i0: '0' }).verified);
});

test('Series solutions: Legendre stops, Frobenius roots', () => {
  const l = series({ eq: "(1 - x^2)y'' - 2x y' + 6y = 0", terms: '6' });
  assert.match(l.general, /c_0\\left\(1 - 3x\^\{2\}\\right\)/);
  assert.ok(l.verified);
  const f = series({ eq: "2x^2 y'' + x y' + x y = 0", terms: '5' });
  assert.deepEqual(f.roots, ['\\frac{1}{2}', '0']);
});

test('Formation of PDEs', () => {
  assert.equal(form({ mode: 'constants', z: 'z = (x - a)^2 + (y - b)^2' }).pde, '4\\,z = {p}^{2}+{q}^{2}');
  assert.equal(form({ mode: 'function', z: 'z = y f(x/y)' }).pde, 'xp + yq = z');
});

test("Lagrange's linear equation", () => {
  assert.equal(lagrange({ eq: 'x p + y q = z' }).answer, '\\phi\\left(\\frac{y}{x},\\ \\frac{z}{x}\\right) = 0');
  assert.match(lagrange({ eq: '(y - z)p + (z - x)q = x - y' }).answer, /x\+ y\+ z/);
});

test("Charpit's standard forms", () => {
  assert.equal(charpit({ eq: 'pq = 1' }).form, 'I');
  assert.equal(charpit({ eq: 'z = px + qy + pq' }).form, 'IV');
  assert.ok(charpit({ eq: 'p^2 + q^2 = x + y' }).verified);
});

test('Linear PDEs with constant coefficients', () => {
  const r = pdecc({ eq: "(D^2 - 5DD' + 6D'^2)z = e^(x + y)" });
  assert.ok(r.verified);
  assert.match(r.answer, /\\phi_\{1\}\(y \+ 2x\) \+ \\phi_\{2\}\(y \+ 3x\)/);
  assert.ok(pdecc({ eq: 'r - s - 6t = xy' }).verified);
});

test('Separation of variables', () => {
  const r = sepv({ kind: 'heat', f: 'x(pi - x)', L: 'pi', c: '1' });
  assert.ok(r.verified);
  assert.match(r.series, /e\^\{- n\^\{2\} t\}/);
});
