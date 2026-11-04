/**
 * SOR (successive over-relaxation): the maths for /sor-method.
 *   xᵢ⁽ᵏ⁺¹⁾ = (1 − ω)xᵢ⁽ᵏ⁾ + (ω / aᵢᵢ)(bᵢ − Σⱼ<ᵢ aᵢⱼxⱼ⁽ᵏ⁺¹⁾ − Σⱼ>ᵢ aᵢⱼxⱼ⁽ᵏ⁾)
 * ω = 1 is Gauss-Seidel; 1 < ω < 2 over-relaxes (often faster); 0 < ω < 1 under-relaxes.
 * The same system is also run with ω = 1, so the page can compare the two.
 */
import { EngineError, isZero } from '../numeric/steps';
import { fromStrings } from '../numeric/matrix';
import { readList, readNumber, readTolerance, readWhole } from './input';

function iterate(A, b, omega, tol, maxIter) {
  const n = A.length;
  let x = new Array(n).fill(0);
  const rows = [];
  for (let k = 1; k <= maxIter; k++) {
    const old = x.slice();
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j]; // x[j] is already new for j < i
      x[i] = (1 - omega) * old[i] + (omega / A[i][i]) * s;
    }
    const change = Math.max(...x.map((v, i) => Math.abs(v - old[i])));
    if (!x.every(Number.isFinite) || change > 1e12) return { rows, x, converged: false, diverged: true };
    rows.push({ k, x: x.slice(), change });
    if (change < tol) return { rows, x, converged: true, diverged: false };
  }
  return { rows, x, converged: false, diverged: false };
}

/** True when every |aᵢᵢ| > the sum of the other |aᵢⱼ| in its row. */
export const diagonallyDominant = (A) => A.every((r, i) => Math.abs(r[i]) > r.reduce((s, v, j) => (j === i ? s : s + Math.abs(v)), 0));

export function solve({ cells, b: tb, omega: tw = '1.25', tol: tt = '0.0001', maxIter: tm = '100' }) {
  const A = fromStrings(cells, 'Matrix A');
  const n = A.length;
  if (A.some((r) => r.length !== n)) throw new EngineError('A must be square: one row per equation.');
  const b = readList(tb, 'Right-hand side b', n);
  if (b.length !== n) throw new EngineError(`b needs exactly ${n} numbers, one per equation.`);
  if (A.some((r, i) => isZero(r[i]))) throw new EngineError('Every diagonal entry aᵢᵢ must be non-zero (swap equations so it is).');
  const omega = readNumber(tw, 'ω (omega)');
  if (!(omega > 0 && omega < 2)) throw new EngineError('ω must be between 0 and 2 (SOR can only converge for 0 < ω < 2).');
  const tol = readTolerance(tt);
  const maxIter = readWhole(tm, 'Maximum iterations', 1, 1000);

  const run = iterate(A, b, omega, tol, maxIter);
  const gs = isZero(omega - 1) ? run : iterate(A, b, 1, tol, maxIter);
  const notes = [];
  if (!diagonallyDominant(A)) notes.push('A is not diagonally dominant, so convergence is not guaranteed. Reordering the equations can help.');
  if (run.diverged) notes.push('The values blew up: the method diverged for this ω and system.');
  else if (!run.converged) notes.push(`Not converged after ${maxIter} iterations. Try another ω or more iterations.`);
  return {
    n, A, b, omega, tol, ...run, result: run.x,
    gsIterations: gs.converged ? gs.rows.length : null,
    notes, steps: { headers: [], rows: [] }, plot: null,
  };
}
