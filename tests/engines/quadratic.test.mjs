// Quadratic equations: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, polyTex } from '../../src/app/utils/engines/quadratic.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const Q = (a, b, c) => solve({ a: String(a), b: String(b), c: String(c) });

test('Quadratic: rational roots and factor form', () => {
  const r = Q(1, -5, 6);
  assert.equal(r.D, 1); near(r.roots[0], 2); near(r.roots[1], 3);
  assert.equal(r.factored, '(x - 2)(x - 3)');
  const p = Q(2, -7, 3); // page example
  assert.equal(p.D, 25); near(p.roots[0], 0.5); near(p.roots[1], 3);
  assert.equal(p.factored, '(2x - 1)(x - 3)');
  near(p.h, 7 / 4); near(p.k, -25 / 8);
  near(p.sum, 3.5); near(p.product, 1.5);
  assert.equal(Q(1, 0, -9).factored, '(x + 3)(x - 3)');
});

test('Quadratic: repeated, surd and complex roots', () => {
  const eq = Q(1, -4, 4);
  assert.equal(eq.roots.length, 1); near(eq.roots[0], 2);
  assert.equal(eq.factored, '(x - 2)^2');
  const surd = Q(1, -2, -1);
  assert.equal(surd.exact, '1 \\pm \\sqrt{2}');
  near(surd.roots[1], 1 + Math.SQRT2);
  const cx = Q(1, 2, 5);
  assert.equal(cx.roots.length, 0);
  assert.equal(cx.exact, '-1 \\pm 2\\,i');
  assert.match(cx.nature, /complex/);
  assert.equal(Q(1, 0, 3).exact, '\\pm \\sqrt{3}\\,i');
});

test('Quadratic: formatting and bad input', () => {
  assert.equal(polyTex(2, -7, 3), '2x^2 - 7x + 3');
  assert.equal(polyTex(-1, 0, 4), '-x^2 + 4');
  assert.equal(polyTex(0.5, 1, 0), '\\frac{1}{2}x^2 + x');
  assert.throws(() => Q(0, 2, 4), (e) => e.name === 'EngineError' && /linear/.test(e.message));
  assert.throws(() => Q('', 2, 4), (e) => e.name === 'EngineError' && /empty/.test(e.message));
  near(Q('1/2', '-1', '-4').roots[1], 4); // fractions typed by the student
});
