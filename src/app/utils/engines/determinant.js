/**
 * Determinant: the maths for /determinant, with the working.
 *   method 'cofactor'  expansion along the first row (up to 5×5), each minor and sign shown
 *   method 'rows'      row reduction to upper-triangular form, every row operation shown
 */
import { EngineError } from '../numeric/steps';
import { formatNumber as fmt } from '../numeric/fraction';
import * as M from '../numeric/matrix';

export function solve({ cells, method = 'cofactor' }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  if (!M.isSquare(A)) throw new EngineError('A determinant needs a square matrix (same number of rows and columns).');
  const n = A.length;

  if (method === 'cofactor') {
    if (n > 5) throw new EngineError('Cofactor expansion is shown up to 5×5. Choose row reduction for a 6×6 matrix.');
    const { result, terms } = M.detByCofactors(A);
    const notes = n === 1
      ? ['A 1×1 determinant is just its one entry.']
      : n === 2
        ? [`|A| = (${fmt(A[0][0])})(${fmt(A[1][1])}) − (${fmt(A[0][1])})(${fmt(A[1][0])}) = ${fmt(result)}`]
        : ['Expand along row 1: |A| = a₁₁M₁₁ − a₁₂M₁₂ + a₁₃M₁₃ − …, where M₁ⱼ is the determinant left after removing row 1 and column j.'];
    return { result, method, A, terms, steps: { headers: [], rows: [] }, notes, plot: null };
  }

  const { result, ops, triangular, sign, diagonal } = M.detByRowReduction(A);
  const notes = ['Make the matrix upper triangular. Adding a multiple of one row to another keeps the determinant; swapping two rows changes its sign.'];
  if (diagonal) notes.push(`|A| = ${sign < 0 ? '−' : ''}(${diagonal.map(fmt).join(')(')}) = ${fmt(result)}`);
  return { result, method, A, ops, triangular, sign, diagonal, steps: { headers: [], rows: [] }, notes, plot: null };
}
