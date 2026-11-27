// The syllabus calculus pages: rules, substitution, parts, limits, continuity, integral theorems. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveProduct, solveQuotient, solveChain } from '../../src/app/utils/engines/diff-rules.js';
import { solve as uSub } from '../../src/app/utils/engines/u-substitution.js';
import { solve as byParts } from '../../src/app/utils/engines/integration-by-parts.js';
import { solve as riemann } from '../../src/app/utils/engines/riemann-sum.js';
import { solve as properties } from '../../src/app/utils/engines/definite-integral-properties.js';
import { solve as laws } from '../../src/app/utils/engines/limit-laws.js';
import { solve as indeterminate } from '../../src/app/utils/engines/indeterminate-forms.js';
import { solve as ivt } from '../../src/app/utils/engines/intermediate-value-theorem.js';
import { solve as discontinuities } from '../../src/app/utils/engines/discontinuity-types.js';
import { solve as ftc } from '../../src/app/utils/engines/fundamental-theorem.js';
import { solve as trace } from '../../src/app/utils/engines/curve-tracing.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} is not ${b}`);

test('Product rule: (x² sin x)′ at 1 = 2 sin 1 + cos 1', () => {
  const r = solveProduct({ u: 'x^2', v: 'sin(x)', at: '1' });
  assert.equal(r.verified, true);
  near(r.point.slope, 2 * Math.sin(1) + Math.cos(1));
  assert.ok(r.steps.length >= 5);
});

test('Quotient rule: (x/(x²+1))′ = (1 − x²)/(x² + 1)²', () => {
  const r = solveQuotient({ u: 'x', v: 'x^2 + 1', at: '2' });
  assert.equal(r.verified, true);
  near(r.point.slope, -3 / 25);
  assert.throws(() => solveQuotient({ u: 'x', v: '0' }), /bottom/);
});

test('Chain rule: one layer, a power and two layers', () => {
  near(solveChain({ f: 'sin(x^2)', at: '1' }).point.slope, 2 * Math.cos(1));
  near(solveChain({ f: '(3x + 1)^5', at: '0' }).point.slope, 15);
  near(solveChain({ f: 'e^(x^2)', at: '1' }).point.slope, 2 * Math.E);
  const one = solveChain({ f: 'sin(cos(x))', at: '1' });
  assert.equal(one.layers.length, 1);
  near(one.point.slope, -Math.cos(Math.cos(1)) * Math.sin(1));
  const two = solveChain({ f: 'sin(cos(x^2))', at: '1' });
  assert.equal(two.layers.length, 2);
  near(two.point.slope, -2 * Math.cos(Math.cos(1)) * Math.sin(1));
  assert.equal(solveChain({ f: '3 sin(2x)', at: '0' }).verified, true);
  assert.throws(() => solveChain({ f: 'x^2' }), /inside|chain/i);
  assert.throws(() => solveChain({ f: 'x + sin(x)' }), /sum/);
});

test('u-substitution: finds u, rewrites, integrates, changes limits', () => {
  const r = uSub({ f: 'x*e^(x^2)' });
  assert.equal(r.uText.replace(/\s/g, ''), 'x^2');
  assert.equal(r.verified, true);
  const d = uSub({ f: '2*x*(x^2 + 1)^3', a: '0', b: '1' });
  near(d.definite.value, 15 / 4);
  assert.equal(uSub({ f: 'x/(x^2 + 1)', u: 'x^2 + 1' }).chosen, true);
  assert.ok(uSub({ f: 'cos(x)/sin(x)' }).answerText.includes('sin'));
  assert.throws(() => uSub({ f: 'x + 1' }), /sum/);
  assert.throws(() => uSub({ f: 'sin(x)', u: 'x^2' }), /cannot be written/);
});

test('Integration by parts: ILATE, repeated rounds, limits', () => {
  const r = byParts({ f: 'x*e^x' });
  assert.equal(r.rounds.length, 1);
  assert.equal(byParts({ f: 'x*e^x', a: '0', b: '1' }).definite.value.toFixed(6), '1.000000');
  assert.equal(byParts({ f: 'x^2*sin(x)' }).rounds.length, 2);
  assert.equal(byParts({ f: 'ln(x)' }).rounds[0].dv, '1');
  assert.ok(byParts({ f: 'e^x*sin(x)' }).answerText);
  assert.throws(() => byParts({ f: 'x + e^x' }), /sum/);
});

test('Limit of a sum: Riemann sums and the derivation', () => {
  const r = riemann({ f: 'x^2', a: '0', b: '1', n: '4', rule: 'right' });
  near(r.sum, 0.46875);
  near(r.exactValue, 1 / 3);
  assert.ok(r.steps.some((s) => /Let n/.test(s.title)));
  const m = riemann({ f: 'sin(x)', a: '0', b: 'pi', n: '10', rule: 'mid' });
  assert.ok(Math.abs(m.sum - 2) < 0.02);
  assert.throws(() => riemann({ f: 'x', a: '1', b: '0', n: '4' }), /larger/);
});

test('Properties of definite integrals: odd, even, King’s rule', () => {
  assert.ok(properties({ f: 'x^3', a: '-1', b: '1' }).props.some((p) => /Odd/.test(p.name) && p.applies));
  assert.ok(properties({ f: 'x^2', a: '-1', b: '1' }).props.some((p) => /Even/.test(p.name) && p.applies));
  const k = properties({ f: 'sin(x)/(sin(x) + cos(x))', a: '0', b: 'pi/2' });
  near(k.value, Math.PI / 4);
  assert.ok(k.props.some((p) => /King/.test(p.name) && /constant|2I/.test(p.note)));
  assert.equal(k.verified, true);
});

test('Limit laws: split, and say when they cannot be used', () => {
  const r = laws({ f: 'x^2 + 3x', a: '2' });
  assert.equal(r.usedLaws, true);
  near(r.value, 10);
  const bad = laws({ f: '(x^2 - 1)/(x - 1)', a: '1' });
  assert.equal(bad.usedLaws, false);
  near(bad.value, 2);
});

test('Indeterminate forms: named and resolved', () => {
  assert.equal(indeterminate({ f: '(x^2 - 1)/(x - 1)', a: '1' }).form, '0/0');
  near(indeterminate({ f: 'sin(x)/x', a: '0' }).value, 1);
  const e = indeterminate({ f: '(1 + 1/x)^x', a: 'inf' });
  assert.equal(e.form, '1^∞');
  near(e.value, Math.E);
  assert.equal(indeterminate({ f: 'x^2 + 1', a: '2' }).form, null);
});

test('Intermediate Value Theorem: applies, root, and does not apply', () => {
  const root = ivt({ f: 'x^3 - x - 1', a: '1', b: '2' });
  assert.equal(root.applies, true);
  near(root.c, 1.3247179572, 1e-6);
  near(ivt({ f: 'x^2', a: '0', b: '3', y: '4' }).c, 2, 1e-6);
  assert.equal(ivt({ f: 'x^2', a: '0', b: '1', y: '5' }).applies, false);
  assert.equal(ivt({ f: '1/x', a: '-1', b: '1', y: '0' }).continuous, false);
});

test('Types of discontinuity', () => {
  const removable = discontinuities({ f: '(x^2 - 1)/(x - 1)' });
  assert.deepEqual(removable.points.map((p) => p.kind), ['Removable']);
  assert.equal(discontinuities({ f: '1/(x - 2)' }).points[0].kind, 'Infinite');
  assert.equal(discontinuities({ f: 'x + 1 for x < 0; x - 1 for x >= 0' }).points[0].kind, 'Jump');
  assert.equal(discontinuities({ f: 'x^2 + 1' }).broken, 0);
});

test('Fundamental theorem: both parts', () => {
  near(ftc({ mode: 'evaluate', f: 'x^2', a: '0', b: '3' }).value, 9);
  const d = ftc({ mode: 'derivative', h: 'sqrt(1 + t^2)', lo: '0', up: 'x^2' });
  assert.equal(d.verified, true);
  assert.throws(() => ftc({ mode: 'derivative', h: 't', lo: '0', up: '3' }), /number/);
});

test('Curve tracing: x³ − 3x', () => {
  const r = trace({ f: 'x^3 - 3x' });
  assert.equal(r.odd, true);
  const turning = r.facts.find((f) => f.label === 'Turning points').tex;
  assert.ok(turning.includes('\\max') && turning.includes('\\min'));
  assert.ok(r.facts.find((f) => f.label === 'Inflection points').tex.includes('0'));
});
