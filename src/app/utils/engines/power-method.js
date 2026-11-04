/**
 * Power method: the maths for /power-method.
 *   largest  repeat y = A x, λ = the entry of y with the biggest size, x = y / λ, until λ settles
 *   smallest the same on A⁻¹ (inverse power method); the eigenvalue of A is 1/λ
 * x is scaled so its biggest entry is 1, as in the textbook.
 */
import { EngineError } from '../numeric/steps';
import { fromStrings, inverseByGaussJordan, multiply } from '../numeric/matrix';
import { readList, readTolerance, readWhole } from './input';

export function solve({ cells, x0: tx = '', mode = 'largest', tol: tt = '0.0001', maxIter: tm = '50' }) {
  const A = fromStrings(cells, 'Matrix A');
  const size = A.length;
  if (A.some((r) => r.length !== size)) throw new EngineError('The power method needs a square matrix.');
  let x = String(tx ?? '').trim() ? readList(tx, 'Starting vector x₀', size) : new Array(size).fill(1);
  if (x.length !== size) throw new EngineError(`The starting vector needs exactly ${size} numbers.`);
  if (x.every((v) => v === 0)) throw new EngineError('The starting vector can\'t be all zeros.');
  const tol = readTolerance(tt);
  const maxIter = readWhole(tm, 'Maximum iterations', 1, 1000);

  let B = A;
  if (mode === 'smallest') {
    try {
      B = inverseByGaussJordan(A).result;
    } catch {
      throw new EngineError('A has no inverse (it is singular), so 0 is an eigenvalue and the inverse power method can\'t run.');
    }
  }

  const rows = [];
  let lambda = null, converged = false;
  for (let k = 1; k <= maxIter; k++) {
    const y = multiply(B, x.map((v) => [v])).result.map((r) => r[0]);
    let j = 0;
    y.forEach((v, i) => { if (Math.abs(v) > Math.abs(y[j]) + 1e-12) j = i; });
    if (Math.abs(y[j]) < 1e-14) throw new EngineError('A x became the zero vector. Try a different starting vector.');
    const next = y[j];
    const newX = y.map((v) => v / next);
    rows.push({ k, x: x.slice(), y, lambda: next, next: newX });
    if (lambda !== null && Math.abs(next - lambda) < tol && newX.every((v, i) => Math.abs(v - x[i]) < tol * 10)) {
      lambda = next; x = newX; converged = true;
      break;
    }
    lambda = next; x = newX;
  }

  const eigenvalue = mode === 'smallest' ? 1 / lambda : lambda;
  const notes = [];
  if (!converged) notes.push(`Not settled after ${maxIter} iterations. This happens when two eigenvalues have the same size (e.g. 3 and −3); try more iterations or another starting vector.`);
  if (mode === 'smallest') notes.push(`The power method on A⁻¹ finds its largest eigenvalue ${Number(lambda.toPrecision(8))}; the smallest eigenvalue of A is 1 ÷ that.`);
  return {
    mode, A, B, rows, eigenvalue, lambda, vector: x, converged,
    result: eigenvalue, notes, steps: { headers: [], rows: [] }, plot: null,
  };
}
