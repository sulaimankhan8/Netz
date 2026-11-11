// Group 3D (differential equations): every method page, textbook equations (Grewal ch. 11–13).
// Each answer is also checked by the engine itself (substituted back into the equation: verified).
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as ode } from '../../src/app/utils/engines/ode-solver.js';
import { solve as separable } from '../../src/app/utils/engines/variable-separable.js';
import { solve as homogeneous } from '../../src/app/utils/engines/homogeneous-ode.js';
import { solve as linear } from '../../src/app/utils/engines/linear-ode.js';
import { solve as bernoulli } from '../../src/app/utils/engines/bernoulli.js';
import { solve as exact } from '../../src/app/utils/engines/exact-ode.js';
import { solve as cc } from '../../src/app/utils/engines/ode-cc.js';
import { solve as vop } from '../../src/app/utils/engines/variation-of-parameters.js';
import { solve as euler } from '../../src/app/utils/engines/cauchy-euler.js';

const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));
const ok = (r, method, re) => { assert.equal(r.verified, true); if (method) assert.equal(r.method, method); if (re) assert.match(r.answer, re); };

test('First order: separable, homogeneous, linear, Bernoulli, exact', () => {
  ok(separable({ eq: 'dy/dx = x y', ics: 'y(0) = 2' }), 'separable', /^y = 2 e\^\{\\frac\{\{x\}\^\{2\}\}\{2\}\}$/);
  ok(separable({ eq: 'dy/dx = e^(x - y)', ics: '' }), 'separable', /^\{e\}\^\{y\} = e\^\{x\} \+ C$/);
  ok(homogeneous({ eq: 'dy/dx = (x + y)/x', ics: '' }), 'homogeneous', /\\ln\|x\|/);
  ok(linear({ eq: 'dy/dx + y/x = x^2', ics: '' }), 'linear', /x\}\^\{4\}/);
  ok(linear({ eq: "y' + y = e^x", ics: 'y(0) = 1' }), 'linear');
  ok(bernoulli({ eq: 'dy/dx + y/x = x y^2', ics: '' }), 'bernoulli', /^y\^\{-1\} = /);
  ok(exact({ eq: '(2x y + 3) dx + (x^2 - 1) dy = 0', ics: '' }), 'exact', /= C$/);
});

test('Second order: constant coefficients, variation of parameters, Cauchy–Euler', () => {
  const a = ode({ eq: "y'' - 3y' + 2y = e^(3x)", ics: '' });
  ok(a, 'constant', /C_\{1\} e\^\{x\}.*C_\{2\} e\^\{2 x\}.*\\frac\{e\^\{3 x\}\}\{2\}/);
  assert.equal(a.eq, "y'' - 3y' + 2y = {e}^{3 x}");
  // With initial conditions the constants are fixed: y = (4/5) sin 2x − (1/5) sin 3x
  ok(cc({ eq: "y'' + 4y = sin(3x)", ics: "y(0) = 0, y'(0) = 1" }), 'constant', /^y = \\frac\{4\}\{5\}\\, \\sin\\left\(2 x\\right\)-\\frac\{1\}\{5\}\\, \\sin\\left\(3 x\\right\)$/);
  ok(vop({ eq: "y'' + y = sec(x)", ics: '' }), 'variation', /\\ln.*\\cos.*x\\, \\sin/);
  ok(vop({ eq: "y'' + y = tan(x)", ics: '' }), 'variation');
  ok(vop({ eq: "y'' - 2y' + y = e^x / x", ics: '' }), 'variation');
  ok(euler({ eq: "x^2 y'' - x y' + y = log(x)", ics: '' }), 'cauchy-euler', /\\ln/);
  ok(euler({ eq: "x^2 y'' - 2x y' + 2y = x^3", ics: '' }), 'cauchy-euler');
  const leg = euler({ eq: "(2x + 3)^2 y'' - 2(2x + 3) y' - 12y = 6x", ics: '' });
  ok(leg, 'cauchy-euler'); assert.equal(leg.legendre, true);
});

test('ODE input errors are clear', () => {
  err(() => ode({ eq: '', ics: '' }), /Type the differential equation/);
  err(() => cc({ eq: "y'' + x y = 0", ics: '' }), /coefficients are not constants/);
});
