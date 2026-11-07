// Group 3A (multiple integrals): double and triple integrals, change of order, beta and gamma.
// Textbook answers (Grewal ch. 7). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as dbl } from '../../src/app/utils/engines/double-integral.js';
import { solve as change, invertCurve } from '../../src/app/utils/engines/change-of-order.js';
import { solve as triple, readOrder } from '../../src/app/utils/engines/triple-integral.js';
import { solve as bg, gammaExact, exactTexOf } from '../../src/app/utils/engines/beta-gamma.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));

test('Double integrals: Cartesian, both orders, and polar', () => {
  const a = dbl({ f: 'x^2 + y^2', order: 'dydx', innerFrom: '0', innerTo: 'x', outerFrom: '0', outerTo: '1' });
  near(a.value, 1 / 3); assert.equal(a.valueTex, '\\frac{1}{3}'); assert.equal(a.verified, true);
  assert.ok(a.region.polygon.length > 10);
  assert.equal(a.region.strip.dir, 'vertical');
  const b = dbl({ f: 'exp(y^2)', order: 'dxdy', innerFrom: '0', innerTo: 'y', outerFrom: '0', outerTo: '1' });
  near(b.value, (Math.E - 1) / 2); assert.equal(b.verified, true);
  const c = dbl({ f: 'r', order: 'polar', innerFrom: '0', innerTo: '2 sin(θ)', outerFrom: '0', outerTo: 'π' });
  near(c.value, Math.PI); assert.equal(c.valueTex, '\\pi');
  // Area between y = x² and y = x: 1/6
  near(dbl({ f: '1', order: 'dydx', innerFrom: 'x^2', innerTo: 'x', outerFrom: '0', outerTo: '1' }).value, 1 / 6);
  err(() => dbl({ f: 'x', order: 'dydx', innerFrom: '0', innerTo: 'y', outerFrom: '0', outerTo: '1' }), /may use only x/);
  err(() => dbl({ f: 'x', order: 'dydx', innerFrom: '0', innerTo: 'x', outerFrom: '0', outerTo: 'y' }), /must be a number/);
});

test('Double integral with no hand rule still gets a labelled number', () => {
  const a = dbl({ f: 'sin(x^2 + y^3)', order: 'dydx', innerFrom: '0', innerTo: '1', outerFrom: '0', outerTo: '1' });
  assert.ok(Number.isFinite(a.value));
  assert.match(a.notes.join(' '), /numerical/);
});

test('Inverting boundary curves', () => {
  const sq = (s) => s.map((w) => ({ w, u: w * w }));
  const ws = [0.1, 0.2, 0.35, 0.5, 0.7, 0.9, 1.1];
  assert.ok(invertCurve(({ w }) => w * w, 'y', sq(ws)));
  assert.ok(invertCurve(({ w }) => Math.sqrt(w), 'y', ws.map((w) => ({ w, u: Math.sqrt(w) }))));
  assert.ok(invertCurve(({ w }) => 2 - w, 'y', ws.map((w) => ({ w, u: 2 - w }))));
  assert.ok(invertCurve(({ w }) => Math.sqrt(4 - w * w), 'y', ws.map((w) => ({ w, u: Math.sqrt(4 - w * w) }))));
});

test('Change of order: one piece, e^(y²)', () => {
  // ∫0^1 ∫_x^1 e^{y²} dy dx → ∫0^1 ∫0^y e^{y²} dx dy = (e − 1)/2
  const a = change({ f: 'exp(y^2)', order: 'dydx', innerFrom: 'x', innerTo: '1', outerFrom: '0', outerTo: '1' });
  assert.equal(a.pieces, 1);
  near(a.value, (Math.E - 1) / 2, 1e-8);
  assert.equal(a.verified, true);
  assert.match(a.newSetup.replace(/\s/g, ''), /\\int_\{0\}\^\{1\}\\int_\{0\}\^\{y\}/);
});

test('Change of order: Grewal ∫0^1 ∫_{x²}^{2−x} xy dy dx = 3/8 splits into two pieces', () => {
  const a = change({ f: 'x y', order: 'dydx', innerFrom: 'x^2', innerTo: '2 - x', outerFrom: '0', outerTo: '1' });
  assert.equal(a.pieces, 2);
  near(a.value, 3 / 8, 1e-8);
  assert.equal(a.verified, true);
});

test('Change of order: between y = x² and y = √x', () => {
  const a = change({ f: '1', order: 'dydx', innerFrom: 'x^2', innerTo: 'sqrt(x)', outerFrom: '0', outerTo: '1' });
  assert.equal(a.pieces, 1);
  near(a.value, 1 / 3, 1e-8);
  // From dx dy back to dy dx
  const b = change({ f: 'x', order: 'dxdy', innerFrom: '0', innerTo: 'sqrt(4 - y^2)', outerFrom: '0', outerTo: '2' });
  near(b.value, 8 / 3, 1e-7);
  assert.equal(b.verified, true);
});

test('Triple integrals', () => {
  assert.deepEqual(readOrder('dρ dφ dθ'), ['rho', 'varphi', 'theta']);
  near(triple({ f: 'x + y + z', order: 'dz dy dx', l1from: '0', l1to: '1', l2from: '0', l2to: '1', l3from: '0', l3to: '1' }).value, 1.5);
  const t = triple({ f: '1', order: 'dz dy dx', l1from: '0', l1to: '1 - x - y', l2from: '0', l2to: '1 - x', l3from: '0', l3to: '1' });
  near(t.value, 1 / 6); assert.equal(t.valueTex, '\\frac{1}{6}');
  const s = triple({ f: 'rho^2 sin(φ)', order: 'dρ dφ dθ', l1from: '0', l1to: '1', l2from: '0', l2to: 'pi', l3from: '0', l3to: '2pi' });
  near(s.value, (4 * Math.PI) / 3); assert.equal(s.verified, true);
  err(() => triple({ f: '1', order: 'dz dy', l1from: '0', l1to: '1', l2from: '0', l2to: '1', l3from: '0', l3to: '1' }), /three differentials/);
});

test('Gamma: whole, half-whole and negative half-whole', () => {
  assert.equal(exactTexOf(gammaExact(5).exact), '24');
  assert.equal(exactTexOf(gammaExact(3.5).exact), '\\frac{15\\sqrt{\\pi}}{8}');
  assert.equal(exactTexOf(gammaExact(0.5).exact), '\\sqrt{\\pi}');
  assert.equal(exactTexOf(gammaExact(-0.5).exact), '-2\\sqrt{\\pi}');
  near(gammaExact(1 / 3).value, 2.678938534707747, 1e-9);
  err(() => bg({ mode: 'gamma', n: '-2' }), /poles/);
});

test('Beta and the standard integrals', () => {
  const a = bg({ mode: 'beta', m: '1/2', n: '1/2' });
  assert.equal(a.resultTex, '\\pi'); assert.equal(a.verified, true);
  const b = bg({ mode: 'beta', m: '3', n: '2' });
  assert.equal(b.resultTex, '\\frac{1}{12}');
  const c = bg({ mode: 'sincos', p: '4', q: '2' });
  assert.equal(c.resultTex, '\\frac{\\pi}{32}'); assert.equal(c.verified, true);
  const d = bg({ mode: 'xexp', n: '3', a: '2' });
  assert.equal(d.resultTex, '\\frac{3}{8}'); assert.equal(d.verified, true);
  const e = bg({ mode: 'gamma', n: '7/2' });
  assert.equal(e.verified, true);
});
