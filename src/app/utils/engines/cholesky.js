/**
 * Cholesky decomposition A = L Lᵀ for a symmetric positive definite matrix, entry by entry:
 *   l_jj = √(a_jj − Σ_{k<j} l_jk²),   l_ij = (a_ij − Σ_{k<j} l_ik l_jk) / l_jj   (i > j)
 * Optionally solves A x = b: L y = b (forward substitution), then Lᵀ x = y (back substitution).
 * Refuses matrices that are not symmetric, or not positive definite (a square root of a negative number).
 * Checked by multiplying L Lᵀ back to A.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { matrixTex } from '../numeric/latex';
import { readList } from './input';
import { texOf } from '../symbolic/roots';
import { toFraction } from '../numeric/fraction';

/** A number as LaTeX: a fraction, a recognised surd (√2, 2√3), or 6 figures. */
export const numTex = (v) => {
  if (Math.abs(v) < 1e-12) return '0';
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  return texOf(v);
};
const texMatrix = (A) => matrixTex(A.map((r) => r.map(numTex)));

export function solve({ cells, b: tb = '' }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  if (!M.isSquare(A)) throw new EngineError('Cholesky decomposition needs a square matrix.');
  const n = A.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) {
    if (Math.abs(A[i][j] - A[j][i]) > 1e-9) throw new EngineError(`A is not symmetric: a${i + 1}${j + 1} = ${A[i][j]} but a${j + 1}${i + 1} = ${A[j][i]}. Cholesky needs A = Aᵀ (use LU decomposition instead).`);
  }
  const L = M.zeros(n, n);
  const lines = [];
  for (let j = 0; j < n; j++) {
    let s = A[j][j];
    for (let k = 0; k < j; k++) s -= L[j][k] ** 2;
    if (!(s > 1e-12)) throw new EngineError(`At l${j + 1}${j + 1} we need the square root of ${Number(s.toPrecision(6))}, which is not positive: A is not positive definite, so it has no Cholesky decomposition.`);
    L[j][j] = Math.sqrt(s);
    lines.push(`l_{${j + 1}${j + 1}} = \\sqrt{${numTex(A[j][j])}${Array.from({ length: j }, (_, k) => ` - (${numTex(L[j][k])})^2`).join('')}} = ${numTex(L[j][j])}`);
    for (let i = j + 1; i < n; i++) {
      let t = A[i][j];
      for (let k = 0; k < j; k++) t -= L[i][k] * L[j][k];
      L[i][j] = t / L[j][j];
      lines.push(`l_{${i + 1}${j + 1}} = \\frac{${numTex(A[i][j])}${Array.from({ length: j }, (_, k) => ` - (${numTex(L[i][k])})(${numTex(L[j][k])})`).join('')}}{${numTex(L[j][j])}} = ${numTex(L[i][j])}`);
    }
  }
  const steps = [
    { title: 'Check A is symmetric', lines: [`A = A^{T} = ${texMatrix(A)}`] },
    { title: 'Work out L column by column', formula: 'l_{jj} = \\sqrt{a_{jj} - \\sum_{k<j} l_{jk}^2}, \\quad l_{ij} = \\frac{a_{ij} - \\sum_{k<j} l_{ik} l_{jk}}{l_{jj}}', lines },
    { title: 'The factor L', lines: [`L = ${texMatrix(L)}, \\quad A = LL^{T}`] },
  ];

  let x = null;
  if (String(tb ?? '').trim()) {
    const b = readList(tb, 'The vector b', 1);
    if (b.length !== n) throw new EngineError(`b needs ${n} numbers (one per row of A).`);
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; }
    x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; }
    steps.push({ title: 'Forward substitution: L y = b', lines: [`y = (${y.map(numTex).join(', ')})`] });
    steps.push({ title: 'Back substitution: Lᵀ x = y', lines: [`x = (${x.map(numTex).join(', ')})`] });
  }
  // Check L Lᵀ = A
  const back = M.multiply(L, M.transpose(L)).result;
  const verified = back.every((row, i) => row.every((v, j) => Math.abs(v - A[i][j]) < 1e-9 * Math.max(1, Math.abs(A[i][j]))));
  return { n, A, L, Lt: M.transpose(L), x, LTex: texMatrix(L), xTex: x ? x.map(numTex) : null, steps, verified, result: L, notes: [], plot: null };
}
