// The ten Batch 1 numerical-methods additions (Units 1–4), checked against exact answers.
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as sor } from '../../src/app/utils/engines/sor.js';
import { solve as diffTable } from '../../src/app/utils/engines/difference-table.js';
import { solve as stirling } from '../../src/app/utils/engines/stirling.js';
import { solve as bessel } from '../../src/app/utils/engines/bessel.js';
import { solve as spline } from '../../src/app/utils/engines/cubic-spline.js';
import { solve as romberg } from '../../src/app/utils/engines/romberg.js';
import { solve as power } from '../../src/app/utils/engines/power-method.js';
import { solve as rk2 } from '../../src/app/utils/engines/rk2.js';
import { solve as milne } from '../../src/app/utils/engines/milne.js';
import { solve as adams } from '../../src/app/utils/engines/adams.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const engineError = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && (!re || re.test(e.message)));
const CUBE = { x: '0, 1, 2, 3, 4, 5, 6', y: '0, 1, 8, 27, 64, 125, 216' };

test('SOR: solves the system and beats Gauss-Seidel with ω = 1.25', () => {
  const cells = [['4', '3', '0'], ['3', '4', '-1'], ['0', '-1', '4']];
  const r = sor({ cells, b: '24, 30, -24', omega: '1.25', tol: '0.000001' });
  assert.equal(r.converged, true);
  near(r.x[0], 3, 1e-5); near(r.x[1], 4, 1e-5); near(r.x[2], -5, 1e-5);
  assert.ok(r.rows.length < r.gsIterations, `SOR ${r.rows.length} vs Gauss-Seidel ${r.gsIterations}`);
  engineError(() => sor({ cells, b: '24, 30, -24', omega: '2.5' }), /between 0 and 2/);
  engineError(() => sor({ cells: [['0', '1'], ['1', '0']], b: '1, 1' }), /diagonal/);
});

test('Difference table, Stirling and Bessel on y = x³', () => {
  const t = diffTable({ ...CUBE, notation: 'forward' });
  assert.equal(t.order, 3);
  assert.match(t.notes[0], /degree 3/);
  assert.equal(diffTable({ ...CUBE, notation: 'backward' }).headers[2], '∇y');
  const s = stirling({ ...CUBE, at: '3.2' });
  near(s.result, 32.768); near(s.p, 0.2); assert.equal(s.notes.length, 0);
  const b = bessel({ ...CUBE, at: '3.5' });
  near(b.result, 42.875); near(b.p, 0.5);
  near(bessel({ ...CUBE, at: '2.25' }).result, 2.25 ** 3);
  assert.equal(stirling({ ...CUBE, at: '3.5' }).notes.length, 1); // p = 0.5 is Bessel territory
  engineError(() => stirling({ x: '0, 1, 3', y: '1, 2, 3', at: '1' }), /equally spaced/);
  engineError(() => bessel({ ...CUBE, at: '9' }), /outside the table/);
});

test('Cubic spline: natural and clamped', () => {
  const nat = spline({ x: '0, 1, 2', y: '0, 1, 8', at: '0.5' });
  near(nat.M[1], 9); near(nat.result, -0.0625);
  near(nat.evaluate(1), 1); near(nat.evaluate(2), 8);
  // First and second derivatives match at the joint x = 1
  const [p0, p1] = nat.pieces;
  near(p0.b + 2 * p0.c + 3 * p0.d, p1.b); near(2 * p0.c + 6 * p0.d, 2 * p1.c);
  const cl = spline({ x: '0, 1, 2, 3', y: '0, 1, 8, 27', at: '1.5', type: 'clamped', s0: '0', sn: '27' });
  near(cl.result, 3.375); // the clamped spline reproduces x³ exactly
  engineError(() => spline({ x: '0, 2, 1', y: '1, 2, 3' }), /increasing/);
});

test('Romberg integration', () => {
  const r = romberg({ f: '1/(1+x)', a: '0', b: '1', levels: '3' });
  near(r.best, Math.log(2), 1e-6);
  assert.equal(r.R.length, 4); near(r.R[0][0], 0.75);
  near(romberg({ f: 'sin(x)', a: '0', b: 'pi', levels: '4' }).best, 2, 1e-6);
  engineError(() => romberg({ f: 'x^2', a: '1', b: '1' }), /equal/);
  engineError(() => romberg({ f: 'x +', a: '0', b: '1' }), /could not be read/);
});

test('Power method: largest and smallest eigenvalue', () => {
  const cells = [['2', '-1', '0'], ['-1', '2', '-1'], ['0', '-1', '2']];
  const big = power({ cells, tol: '0.000001', maxIter: '200' });
  assert.equal(big.converged, true);
  near(big.eigenvalue, 2 + Math.SQRT2, 1e-5);
  near(big.vector[1], 1); near(Math.abs(big.vector[0]), Math.SQRT1_2, 1e-4);
  near(power({ cells, mode: 'smallest', tol: '0.000001', maxIter: '200' }).eigenvalue, 2 - Math.SQRT2, 1e-5);
  engineError(() => power({ cells: [['1', '2'], ['2', '4']], mode: 'smallest' }), /singular/);
});

test('RK2, Milne and Adams-Bashforth-Moulton on dy/dx = x + y', () => {
  const base = { f: 'x + y', x0: '0', y0: '1', h: '0.1' };
  near(rk2({ ...base, xn: '0.2' }).result, 1.24205, 1e-9);
  near(rk2({ ...base, xn: '0.1', variant: 'midpoint' }).result, 1.11, 1e-9);
  const exact = 2 * Math.exp(0.5) - 1.5;
  const m = milne({ ...base, xn: '0.5' });
  near(m.result, exact, 2e-5);
  assert.equal(m.rows.length, 6); assert.equal(m.rows[1].how, 'RK4'); assert.equal(m.rows[4].how, 'P-C');
  near(adams({ ...base, xn: '0.5' }).result, exact, 2e-5);
  engineError(() => milne({ ...base, xn: '0.2' }), /at least 4 steps/);
  engineError(() => rk2({ ...base, f: 'x + z', xn: '0.2' }), /uses "z"/);
  engineError(() => rk2({ ...base, xn: '0.25' }), /whole number of steps/);
});
