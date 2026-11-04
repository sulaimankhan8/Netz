// Eigenvalues and eigenvectors: textbook matrices, repeated and complex eigenvalues, surds. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/eigenvalues.js';
import { charPoly } from '../../src/app/utils/numeric/eigen.js';

const S = (m) => solve({ cells: m.map((r) => r.map(String)) });
const vals = (r) => r.eigenvalues.map((e) => `${e.tex}${e.m > 1 ? `x${e.m}` : ''}`).join(' ');

test('Eigenvalues: characteristic polynomial and real eigenvalues', () => {
  assert.deepEqual(charPoly([[4, 1], [2, 3]]), [10, -7, 1]); // λ² − 7λ + 10
  const a = S([[4, 1], [2, 3]]);
  assert.equal(vals(a), '2 5');
  assert.deepEqual(a.pairs.map((p) => p.raw[0]), [[1, -2], [1, 1]]);
  assert.equal(a.verified, true);
  const b = S([[2, 0, 0], [0, 3, 4], [0, 4, 9]]);
  assert.equal(b.charTex, '\\lambda^{3} - 14\\lambda^{2} + 35\\lambda - 22 = 0');
  assert.equal(vals(b), '1 2 11');
  assert.equal(vals(S([[1, 1, 3], [1, 5, 1], [3, 1, 1]])), '-2 3 6');
});

test('Eigenvalues: repeated, defective, complex and irrational', () => {
  const sym = S([[6, -2, 2], [-2, 3, -1], [2, -1, 3]]);
  assert.equal(vals(sym), '2x2 8');
  assert.equal(sym.pairs[0].geometric, 2); // two independent eigenvectors for λ = 2
  const jordan = S([[2, 1], [0, 2]]);
  assert.equal(jordan.pairs[0].geometric, 1);
  assert.match(jordan.notes.join(' '), /cannot be diagonalised/);
  const rot = S([[0, -1], [1, 0]]);
  assert.equal(rot.eigenvalues.length, 0);
  assert.equal(rot.complex[0].tex, '\\pm i');
  const surd = S([[1, 2], [3, 4]]);
  assert.equal(vals(surd), '\\frac{5}{2} - \\frac{1}{2}\\sqrt{33} \\frac{5}{2} + \\frac{1}{2}\\sqrt{33}');
  assert.equal(surd.verified, true);
  assert.throws(() => S([[1, 2, 3], [4, 5, 6]]), /square/);
});
