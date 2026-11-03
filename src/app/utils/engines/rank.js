/**
 * Rank and reduced row echelon form: the maths for /rank-of-matrix.
 * Rank = number of non-zero rows left after row reduction = number of pivot columns.
 */
import * as M from '../numeric/matrix';

export function solve({ cells }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  const { result: rref, rank, pivots, ops } = M.rref(A);
  const notes = [
    `Pivot columns: ${pivots.length ? pivots.map((c) => c + 1).join(', ') : 'none (every entry is 0)'}.`,
    `Rank = number of non-zero rows = ${rank}.`,
  ];
  if (rank === Math.min(A.length, A[0].length)) notes.push(`This is full rank: the most a ${A.length}×${A[0].length} matrix can have.`);
  return { result: rank, A, rref, pivots, ops, steps: { headers: [], rows: [] }, notes, plot: null };
}
