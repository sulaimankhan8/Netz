/**
 * QR decomposition A = QR by the Gram–Schmidt process (columns of Q orthonormal, R upper triangular):
 *   u_k = a_k − Σ_{j<k} (q_j · a_k) q_j,   q_k = u_k / |u_k|,   r_jk = q_j · a_k,   r_kk = |u_k|
 * Option: eigenvalues by the QR algorithm, A_{k+1} = R_k Q_k, until the part below the diagonal vanishes.
 * Checked: QR = A and QᵀQ = I.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { matrixTex } from '../numeric/latex';
import { numTex } from './cholesky';

const mul = (A, B) => M.multiply(A, B).result;
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const texMatrix = (A) => matrixTex(A.map((r) => r.map(numTex)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));

/** Gram–Schmidt QR of A (m × n, m ≥ n, independent columns). Returns { Q, R, lines }. */
export function gramSchmidt(A, record = true) {
  const m = A.length, n = A[0].length;
  const cols = Array.from({ length: n }, (_, j) => A.map((r) => r[j]));
  const Qc = [], R = M.zeros(n, n), lines = [];
  for (let k = 0; k < n; k++) {
    let u = [...cols[k]];
    for (let j = 0; j < k; j++) {
      R[j][k] = dot(Qc[j], cols[k]);
      u = u.map((v, i) => v - R[j][k] * Qc[j][i]);
    }
    const norm = Math.sqrt(dot(u, u));
    if (norm < 1e-10) throw new EngineError(`Column ${k + 1} is a combination of the earlier columns, so the columns are not independent and Gram–Schmidt cannot continue.`);
    R[k][k] = norm;
    Qc.push(u.map((v) => v / norm));
    if (record) {
      lines.push(k === 0
        ? `u_1 = a_1 = (${cols[0].map(numTex).join(', ')}), \\ |u_1| = ${numTex(norm)}, \\ q_1 = (${Qc[0].map(numTex).join(', ')})`
        : `u_{${k + 1}} = a_{${k + 1}} ${Array.from({ length: k }, (_, j) => `- (${numTex(R[j][k])})q_{${j + 1}}`).join(' ')} = (${u.map(numTex).join(', ')}), \\ |u_{${k + 1}}| = ${numTex(norm)}`);
    }
  }
  const Q = Array.from({ length: m }, (_, i) => Qc.map((q) => q[i]));
  return { Q, R, lines };
}

export function solve({ cells, mode = 'decompose' }) {
  const A = M.fromStrings(cells, 'Matrix A');
  M.check(A);
  const m = A.length, n = A[0].length;
  if (m < n) throw new EngineError('Use a matrix with at least as many rows as columns.');
  const steps = [];
  if (mode === 'decompose') {
    const { Q, R, lines } = gramSchmidt(A);
    steps.push({ title: 'Gram–Schmidt on the columns of A', formula: 'u_k = a_k - \\sum_{j<k} (q_j \\cdot a_k)\\,q_j, \\quad q_k = \\frac{u_k}{|u_k|}', lines });
    steps.push({ title: 'R from the dot products', formula: 'r_{jk} = q_j \\cdot a_k, \\quad r_{kk} = |u_k|', lines: [`Q = ${texMatrix(Q)}, \\quad R = ${texMatrix(R)}`] });
    const back = mul(Q, R), QtQ = mul(M.transpose(Q), Q);
    const ok = back.every((row, i) => row.every((v, j) => Math.abs(v - A[i][j]) < 1e-9 * Math.max(1, Math.abs(A[i][j])))) && QtQ.every((row, i) => row.every((v, j) => Math.abs(v - (i === j ? 1 : 0)) < 1e-9));
    steps.push({ title: 'Check', lines: [`QR = A \\ \\text{and} \\ Q^{T}Q = I \\ ${ok ? '\\checkmark' : '\\times'}`] });
    return { mode, m, n, Q, R, QTex: texMatrix(Q), RTex: texMatrix(R), steps, verified: ok, result: { Q, R }, notes: [], plot: null };
  }

  // QR algorithm for eigenvalues
  if (m !== n) throw new EngineError('Eigenvalues need a square matrix.');
  let Ak = A.map((r) => [...r]);
  const rows = [];
  let k = 0;
  const below = (X) => Math.max(0, ...X.flatMap((row, i) => row.slice(0, i).map(Math.abs)));
  for (; k < 200; k++) {
    const { Q, R } = gramSchmidt(Ak, false);
    Ak = mul(R, Q);
    if (k < 12 || k % 10 === 0) rows.push(Object.fromEntries([['k', String(k + 1)], ...Ak.map((row, i) => [`d${i}`, n6(row[i])]), ['off', n6(below(Ak))]]));
    if (below(Ak) < 1e-10) { k++; break; }
  }
  const converged = below(Ak) < 1e-6;
  const eig = Ak.map((row, i) => row[i]);
  steps.push({ title: 'The QR algorithm', formula: 'A_k = Q_k R_k, \\quad A_{k+1} = R_k Q_k', lines: ['\\text{Each } A_{k+1} = Q_k^{T} A_k Q_k \\text{ has the same eigenvalues; the part below the diagonal shrinks to 0.}'] });
  steps.push({ title: converged ? `Converged after ${k} iterations` : 'Did not fully converge', lines: [`\\text{Diagonal: } ${eig.map(n6).join(', \\ ')}`] });
  const table = { columns: [{ key: 'k', label: 'k' }, ...eig.map((_, i) => ({ key: `d${i}`, label: `a${'₁₂₃₄₅₆'[i]}${'₁₂₃₄₅₆'[i]}`, highlight: true })), { key: 'off', label: 'largest below diagonal' }], rows };
  const notes = converged ? [] : ['The values below the diagonal did not all vanish: the matrix may have complex or equal-size eigenvalues of opposite sign, which plain QR iteration cannot separate.'];
  const trace = A.reduce((s, row, i) => s + row[i], 0);
  return { mode, m, n, eigenvalues: eig, iterations: k, converged, final: Ak, finalTex: texMatrix(Ak.map((r) => r.map((v) => Number(v.toPrecision(8))))), steps, table, verified: converged && Math.abs(eig.reduce((s, v) => s + v, 0) - trace) < 1e-6 * Math.max(1, Math.abs(trace)), result: eig, notes, plot: null };
}
