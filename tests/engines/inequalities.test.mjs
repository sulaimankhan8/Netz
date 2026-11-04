// Inequalities: linear (sign flip), quadratic, rational, and the special answers ℝ, ∅, {a}. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/inequalities.js';

const A = (ineq) => { const r = solve({ ineq }); assert.equal(r.verified, true, `${ineq} should check out`); return r.answer; };

test('Inequalities: linear, with the sign reversed when dividing by a negative', () => {
  assert.equal(A('2x - 3 > 5'), '\\left(4,\\ \\infty\\right)');
  assert.equal(A('5 - 2x >= 11'), '\\left(-\\infty,\\ -3\\right]');
  const r = solve({ ineq: '5 - 2x ≥ 11' }); // the ≥ symbol works too
  assert.ok(r.steps.some((s) => /reverse the sign/.test(s.title)));
});

test('Inequalities: polynomial and rational, by a sign chart', () => {
  assert.equal(A('x^2 - 5x + 6 <= 0'), '\\left[2,\\ 3\\right]');
  assert.equal(A('x^2 - 5x + 6 > 0'), '\\left(-\\infty,\\ 2\\right) \\cup \\left(3,\\ \\infty\\right)');
  assert.equal(A('(x-1)/(x+2) >= 0'), '\\left(-\\infty,\\ -2\\right) \\cup \\left[1,\\ \\infty\\right)'); // −2 never included
  assert.equal(A('x^3 - x > 0'), '\\left(-1,\\ 0\\right) \\cup \\left(1,\\ \\infty\\right)');
  assert.equal(A('1/x < 1'), '\\left(-\\infty,\\ 0\\right) \\cup \\left(1,\\ \\infty\\right)');
  assert.equal(A('x^2 >= 0'), '\\mathbb{R}');
  assert.equal(A('(x-1)^2 <= 0'), '\\left\\{1\\right\\}');
  assert.equal(A('x^2 + 1 < 0'), '\\varnothing');
  assert.throws(() => solve({ ineq: 'x^2 = 4' }), /one sign/);
});
