/**
 * Jacobi's method for the eigenvalues and eigenvectors of a symmetric matrix:
 *   pick the largest off-diagonal entry a_pq; rotate by θ with tan 2θ = 2a_pq / (a_pp − a_qq)
 *   (θ = π/4 when a_pp = a_qq); A ← Pᵀ A P zeroes a_pq. Repeat until every off-diagonal entry is tiny.
 * The diagonal ends up holding the eigenvalues; the product of the rotations holds the eigenvectors.
 * The first rotation is worked in full; the rest are listed. Checked: A v = λ v for each pair.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { matrixTex } from '../numeric/latex';
import { readNumber } from './input';
import { numTex } from './cholesky';

const mul = (A, B) => M.multiply(A, B).result;
const n6 = (v) => String(Number(Number(v).toPrecision(6)));
const texMatrix = (A) => matrixTex(A.map((r) => r.map(numTex)));

export function solve({ cells, tol: tt = '1e-6' }) {
  const A0 = M.fromStrings(cells, 'Matrix A');
  M.check(A0);
  if (!M.isSquare(A0)) throw new EngineError('Jacobi’s method needs a square matrix.');
  const n = A0.length;
  if (n < 2 || n > 6) throw new EngineError('Use a 2×2 to 6×6 matrix.');
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) {
    if (Math.abs(A0[i][j] - A0[j][i]) > 1e-9) throw new EngineError(`A is not symmetric (a${i + 1}${j + 1} ≠ a${j + 1}${i + 1}). Jacobi’s method works only for symmetric matrices; try the QR method instead.`);
  }
  const tol = readNumber(tt, 'The tolerance');
  if (!(tol > 0)) throw new EngineError('The tolerance must be more than 0.');
  let A = A0.map((r) => [...r]);
  let V = M.identity(n);
  const rows = [], steps = [];
  const offMax = (X) => { let best = { v: 0, p: 0, q: 1 }; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(X[i][j]) > Math.abs(best.v)) best = { v: X[i][j], p: i, q: j }; return best; };

  let k = 0;
  for (; k < 200; k++) {
    const { v, p, q } = offMax(A);
    if (Math.abs(v) < tol) break;
    const theta = Math.abs(A[p][p] - A[q][q]) < 1e-14 ? Math.sign(v) * Math.PI / 4 : 0.5 * Math.atan((2 * v) / (A[p][p] - A[q][q]));
    const c = Math.cos(theta), s = Math.sin(theta);
    const P = M.identity(n);
    P[p][p] = c; P[q][q] = c; P[p][q] = -s; P[q][p] = s;
    const next = mul(mul(M.transpose(P), A), P);
    next[p][q] = 0; next[q][p] = 0; // exactly zero by construction
    if (k === 0) {
      steps.push({
        title: `Rotation 1: zero the largest off-diagonal entry a${p + 1}${q + 1} = ${n6(v)}`,
        formula: '\\tan 2\\theta = \\frac{2a_{pq}}{a_{pp} - a_{qq}}',
        lines: [
          Math.abs(A[p][p] - A[q][q]) < 1e-14 ? `a_{${p + 1}${p + 1}} = a_{${q + 1}${q + 1}} \\Rightarrow \\theta = \\frac{\\pi}{4}` : `\\tan 2\\theta = \\frac{2(${n6(v)})}{${n6(A[p][p])} - ${n6(A[q][q])}} \\Rightarrow \\theta = ${n6(theta)} \\text{ rad} = ${n6((theta * 180) / Math.PI)}^\\circ`,
          `P_1 = ${texMatrix(P)}`,
          `A_1 = P_1^{T} A P_1 = ${texMatrix(next)}`,
        ],
      });
    }
    A = next;
    V = mul(V, P);
    rows.push({ k: String(k + 1), pq: `(${p + 1}, ${q + 1})`, theta: n6((theta * 180) / Math.PI), off: n6(Math.abs(offMax(A).v)), diag: A.map((r, i) => n6(r[i])).join(', ') });
  }
  const converged = Math.abs(offMax(A).v) < tol;
  const eig = A.map((r, i) => r[i]);
  // Sort eigenpairs by eigenvalue (largest first), as textbooks list them
  const order = eig.map((_, i) => i).sort((i, j) => eig[j] - eig[i]);
  const values = order.map((i) => eig[i]);
  const vectors = order.map((i) => V.map((row) => row[i]));
  steps.push({ title: converged ? `Converged after ${k} rotation${k === 1 ? '' : 's'}` : 'Stopped after 200 rotations', lines: [`\\lambda = ${values.map(n6).join(', \\ ')}`, '\\text{The eigenvectors are the columns of } P_1P_2\\cdots P_k'] });
  const verified = vectors.every((v, i) => { const Av = A0.map((row) => row.reduce((s, a, j) => s + a * v[j], 0)); return Av.every((x, r) => Math.abs(x - values[i] * v[r]) < 1e-5 * Math.max(1, Math.abs(values[i]))); });
  const table = { columns: [{ key: 'k', label: 'Rotation' }, { key: 'pq', label: '(p, q)' }, { key: 'theta', label: 'θ (degrees)' }, { key: 'off', label: 'largest off-diagonal after' }, { key: 'diag', label: 'diagonal', highlight: true }], rows };
  return {
    n, eigenvalues: values, eigenvectors: vectors, rotations: k, converged,
    valuesTex: values.map(n6), vectorsTex: vectors.map((v) => `\\begin{bmatrix} ${v.map(n6).join(' \\\\ ')} \\end{bmatrix}`),
    steps, table, verified, result: values, notes: [], plot: null,
  };
}
