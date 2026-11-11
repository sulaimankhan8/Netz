/**
 * Singular value decomposition A = UΣVᵀ: the maths for /svd-calculator (Unit 8).
 *   AᵀA = VΛVᵀ (symmetric, eigenvalues λᵢ ≥ 0): σᵢ = √λᵢ, the columns of V are the right singular vectors;
 *   uᵢ = Avᵢ/σᵢ for σᵢ > 0 (the rest of U completed to an orthonormal basis). rank = number of σᵢ > 0.
 * Checked by multiplying UΣVᵀ back out. Values are shown exactly when they are whole numbers, fractions or √k.
 */
import { EngineError } from '../numeric/steps';
import { readMatrix, T, mul, mv, dotv, jacobiEigen } from '../numeric/extras';
import { exactTex } from '../symbolic/multi';

const ex = (v) => { if (Math.abs(v) < 1e-10) return '0'; const t = exactTex(v); return /\d\.\d/.test(t) ? String(Number(v.toFixed(4))) : t; };
const mtex = (M) => `\\begin{bmatrix} ${M.map((r) => r.map(ex).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** extend orthonormal columns to a full basis of Rᵐ (Gram–Schmidt on the standard vectors) */
function complete(cols, m) {
  const out = [...cols];
  for (let e = 0; e < m && out.length < m; e++) {
    let v = Array.from({ length: m }, (_, i) => (i === e ? 1 : 0));
    for (const u of out) { const d = dotv(v, u); v = v.map((x, i) => x - d * u[i]); }
    const nv = Math.hypot(...v);
    if (nv > 1e-8) out.push(v.map((x) => x / nv));
  }
  return out;
}

export function solve({ A: At }) {
  const A = readMatrix(At, 'A', 6);
  const m = A.length, n = A[0].length;
  const AtA = mul(T(A), A);
  const { values, vectors } = jacobiEigen(AtA);
  // an eigenvalue of AᵀA near rounding level (1e−16) is 0: its square root (1e−8) must not count towards the rank
  const sig = values.map((l) => (l > 1e-12 * Math.max(1, values[0]) ? Math.sqrt(l) : 0));
  const r = Math.min(m, n, sig.filter((s) => s > 0).length);
  // fix signs: largest entry of each v positive
  const V = vectors.map((v) => { const big = v.reduce((p, q) => (Math.abs(q) > Math.abs(p) ? q : p), 0); return big < 0 ? v.map((x) => -x) : v; });
  const Ucols = [];
  for (let i = 0; i < r; i++) Ucols.push(mv(A, V[i]).map((x) => x / sig[i]));
  const Ufull = complete(Ucols, m);
  const U = Array.from({ length: m }, (_, i) => Ufull.map((c) => c[i]));
  const S = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (i === j && i < sig.length ? sig[i] : 0)));
  const Vt = V;
  const back = mul(mul(U, S), Vt);
  const err = Math.max(...back.flat().map((v, k) => Math.abs(v - A.flat()[k])));
  const steps = [
    { title: 'AᵀA and its eigenvalues', formula: 'A^TA = V\\Lambda V^T', depth: 0, lines: [`A^TA = ${mtex(AtA)}`, `\\lambda = ${values.map((l) => ex(Math.max(0, l))).join(', ')}`] },
    { title: 'Singular values', formula: '\\sigma_i = \\sqrt{\\lambda_i}', depth: 0, lines: [`\\sigma = ${sig.map(ex).join(', ')} \\quad (\\text{rank } ${r})`] },
    { title: 'Right singular vectors (columns of V)', depth: 0, lines: [`V = ${mtex(T(V))}`] },
    { title: 'Left singular vectors', formula: 'u_i = \\frac{Av_i}{\\sigma_i}', depth: 0, lines: [`U = ${mtex(U)}`, ...(r < m ? ['\\text{the last columns of } U \\text{ complete an orthonormal basis}'] : [])] },
    { title: 'Check', depth: 0, lines: [`U\\Sigma V^T = ${mtex(back)}`] },
  ];
  return { U: mtex(U), S: mtex(S), Vt: mtex(Vt), sigma: sig.map(ex), rank: r, steps, notes: [], verified: err < 1e-8, result: sig.map(ex) };
}
