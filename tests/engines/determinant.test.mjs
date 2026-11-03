// Determinant: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/determinant.js';

const EXAMPLE = [['2', '-3', '1'], ['2', '0', '-1'], ['1', '4', '5']];

test('Determinant: page example is 49 by both methods', () => {
  const c = solve({ cells: EXAMPLE, method: 'cofactor' });
  assert.equal(c.result, 49);
  assert.deepEqual(c.terms.map((t) => t.minorDet), [4, 11, 8]);
  const r = solve({ cells: EXAMPLE, method: 'rows' });
  assert.ok(Math.abs(r.result - 49) < 1e-9);
  assert.equal(r.ops[0].text, 'R₂ → R₂ − (1)R₁');
  assert.equal(r.ops[1].text, 'R₃ → R₃ − (1/2)R₁');
  assert.equal(r.ops[2].text, 'R₃ → R₃ − (11/6)R₂');
});

test('Determinant: 1×1, 2×2, fractions and singular', () => {
  assert.equal(solve({ cells: [['-7']] }).result, -7);
  assert.equal(solve({ cells: [['3', '8'], ['4', '6']] }).result, -14);
  assert.ok(Math.abs(solve({ cells: [['1/2', '1/3'], ['1/4', '1/5']], method: 'rows' }).result - (1 / 10 - 1 / 12)) < 1e-12);
  assert.equal(solve({ cells: [['1', '2'], ['2', '4']], method: 'rows' }).result, 0);
});

test('Determinant: bad input gives a clear EngineError', () => {
  const err = (cells, method, re) => assert.throws(() => solve({ cells, method }), (e) => e.name === 'EngineError' && re.test(e.message));
  err([['1', 'x'], ['2', '3']], 'cofactor', /row 1, column 2: "x" is not a number/);
  err([['1', ''], ['2', '3']], 'cofactor', /row 1, column 2 is empty/);
  err([['1', '2', '3'], ['4', '5', '6']], 'cofactor', /square matrix/);
  const six = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => String(i === j ? 2 : 1)));
  err(six, 'cofactor', /up to 5×5/);
  assert.ok(Math.abs(solve({ cells: six, method: 'rows' }).result - 7) < 1e-9); // I + J with n = 6: (1)^5 (1 + 6) = 7
});
