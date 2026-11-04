// Systems of equations: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, equationTex } from '../../src/app/utils/engines/system-of-equations.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const S = (rows, method) => solve({ cells: rows.map((r) => r.map(String)), method });
const TWO = [[2, 3, 13], [1, -1, -1]]; // page example: x = 2, y = 3
const THREE = [[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]; // x = 5, y = 3, z = -2

test('Systems: all three methods agree', () => {
  for (const m of ['cramer', 'elimination', 'substitution']) {
    const r = S(TWO, m);
    assert.equal(r.kind, 'unique');
    near(r.result[0], 2); near(r.result[1], 3);
  }
  const c = S(TWO, 'cramer');
  near(c.D, -5);
  assert.match(c.lines[1], /D_x = .* = -10/);
  for (const m of ['cramer', 'elimination']) {
    const r = S(THREE, m);
    near(r.result[0], 5); near(r.result[1], 3); near(r.result[2], -2);
  }
  // Substitution when the first equation has no x
  const swap = S([[0, 2, 6], [1, 1, 5]], 'substitution');
  near(swap.result[0], 2); near(swap.result[1], 3);
});

test('Systems: no solution and infinitely many', () => {
  const none = S([[1, 1, 2], [2, 2, 5]], 'cramer');
  assert.equal(none.kind, 'none'); assert.equal(none.result, null);
  const inf = S([[1, 1, 2], [2, 2, 4]], 'elimination');
  assert.equal(inf.kind, 'infinite');
  assert.match(inf.verdict, /Infinitely many/);
});

test('Systems: formatting and bad input', () => {
  assert.equal(equationTex([2, -1, 0, 4], 3), '2x - y = 4');
  assert.equal(equationTex([1, 1, -1, 6], 3), 'x + y - z = 6');
  assert.throws(() => S([[1, 2, 3], [4, 'x', 6]], 'cramer'), (e) => e.name === 'EngineError' && /"x" is not a number/.test(e.message));
  assert.throws(() => S(THREE, 'substitution'), (e) => e.name === 'EngineError' && /2 equations/.test(e.message));
});
