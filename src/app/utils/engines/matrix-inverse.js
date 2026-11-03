/**
 * Inverse of a matrix: the maths for /matrix-inverse, with the working.
 *   method 'adjoint'       |A|, the cofactor matrix, adj A (its transpose), then A⁻¹ = adj A / |A| (up to 4×4)
 *   method 'gauss-jordan'  row-reduce [A | I] to [I | A⁻¹], every row operation shown
 * Both finish with the check A·A⁻¹ = I.
 */
import { EngineError, isZero } from '../numeric/steps';
import * as M from '../numeric/matrix';

export function solve({ cells, method = 'adjoint' }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  if (!M.isSquare(A)) throw new EngineError('Only square matrices have an inverse.');
  const n = A.length;

  let out;
  if (method === 'adjoint') {
    if (n > 4) throw new EngineError('The adjoint method is shown up to 4×4. Choose Gauss-Jordan for bigger matrices.');
    out = { method, ...M.inverseByAdjoint(A) };
  } else {
    out = { method, ...M.inverseByGaussJordan(A) };
  }
  const product = M.multiply(A, out.result).result;
  const checks = product.every((row, i) => row.every((v, j) => isZero(v - (i === j ? 1 : 0), 1e-8)));
  return { ...out, A, product, checks, steps: { headers: [], rows: [] }, notes: [], plot: null };
}
