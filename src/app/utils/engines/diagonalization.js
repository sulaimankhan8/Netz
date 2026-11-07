/**
 * Diagonalization: the maths for /diagonalization (catalog 8, Unit 8 leftovers).
 *   P = [X₁ X₂ … Xₙ] (eigenvectors as columns), D = diag(λ₁, …, λₙ), P⁻¹AP = D.
 *   Not possible when an eigenvalue is complex, or repeats with too few independent eigenvectors.
 *   Symmetric A: orthogonal reduction. Normalise the eigenvectors (Gram–Schmidt inside a repeated
 *   eigenspace) to get N with NᵀN = I and NᵀAN = D.
 *   Optional power: Aᵏ = P Dᵏ P⁻¹.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { texNumber, matrixTex } from '../numeric/latex';
import { toFraction } from '../numeric/fraction';
import { solve as eigen } from './eigenvalues';

const mul = (A, B) => M.multiply(A, B).result;
const close = (A, B, tol = 1e-6) => A.every((r, i) => r.every((v, j) => Math.abs(v - B[i][j]) < tol * Math.max(1, Math.abs(B[i][j]))));
const isSymmetric = (A) => A.every((r, i) => r.every((v, j) => Math.abs(v - A[j][i]) < 1e-12));
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);

/** A number as LaTeX: a fraction, a surd a/√b, or a 4-place decimal. */
export function surdTex(v) {
  if (Math.abs(v) < 1e-12) return '0';
  if (toFraction(v, 1000, 1e-9)) return texNumber(v);
  // v = p/√q with v² rational
  const f = toFraction(v * v, 10000, 1e-9);
  if (f) {
    const sign = v < 0 ? '-' : '';
    // √(n/d) = √(n·d)/d
    const inside = f.n * f.d;
    let out = 1, rest = inside;
    for (let k = Math.floor(Math.sqrt(rest)); k > 1; k--) if (rest % (k * k) === 0) { out *= k; rest /= k * k; }
    const top = `${out === 1 ? '' : out}\\sqrt{${rest}}`;
    return f.d === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${f.d}}`;
  }
  return String(Number(v.toFixed(4)));
}
const surdMatrix = (A) => `\\begin{bmatrix} ${A.map((r) => r.map(surdTex).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** Orthonormal eigenvectors of a symmetric matrix from the eigen engine's pairs (Gram–Schmidt per eigenvalue). */
export function orthonormalBasis(pairs) {
  const cols = [];
  const lines = [];
  for (const p of pairs) {
    const done = [];
    for (const x of p.raw) {
      let w = [...x];
      for (const u of done) { const k = dot(w, u); w = w.map((v, i) => v - k * u[i]); }
      const len = Math.sqrt(dot(w, w));
      const u = w.map((v) => v / len);
      done.push(u);
      lines.push(`\\lambda = ${p.lambdaTex}: \\ \\frac{X}{\\lVert X \\rVert} = ${surdMatrix(u.map((v) => [v]))}`);
    }
    if (p.raw.length > 1) lines.push(`(\\lambda = ${p.lambdaTex} \\text{ is repeated: Gram–Schmidt makes its eigenvectors perpendicular first)}`);
    cols.push(...done);
  }
  return { N: cols[0].map((_, i) => cols.map((c) => c[i])), lines };
}

export function solve({ cells, power = '' }) {
  const e = eigen({ cells });
  const A = e.A, n = e.n;
  const steps = [...e.steps.filter((s) => s.title !== 'Check')];
  const notes = [];
  if (e.complex.length) throw new EngineError('Some eigenvalues are complex, so A cannot be diagonalised over the real numbers.');
  const short = e.pairs.find((p) => p.geometric < p.algebraic);
  if (short) {
    return {
      diagonalizable: false, n, steps: [...steps, { title: 'Can A be diagonalised?', depth: 0, lines: [`\\lambda = ${short.lambdaTex} \\text{ is repeated ${short.algebraic} times but has only ${short.geometric} independent eigenvector${short.geometric === 1 ? '' : 's'}.}`, '\\text{Not enough eigenvectors to fill } P, \\text{ so A is not diagonalisable.}'] }],
      notes: ['A matrix is diagonalisable exactly when it has n independent eigenvectors.'], verified: true, result: 'not diagonalisable',
    };
  }
  const lambdas = e.pairs.flatMap((p) => p.raw.map(() => p.lambda));
  const lambdaTex = e.pairs.flatMap((p) => p.raw.map(() => p.lambdaTex));
  const D = lambdas.map((l, i) => lambdas.map((_, j) => (i === j ? l : 0)));
  const Dtex = `\\begin{bmatrix} ${lambdaTex.map((t, i) => lambdaTex.map((_, j) => (i === j ? t : '0')).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
  const cols = e.pairs.flatMap((p) => p.raw);
  const P = cols[0].map((_, i) => cols.map((c) => c[i]));
  const Pinv = M.inverseByGaussJordan(P).result;
  const check = mul(mul(Pinv, A), P);
  let verified = close(check, D);
  steps.push({
    title: 'Modal matrix P and spectral matrix D', formula: 'P^{-1}AP = D', depth: 0,
    lines: [`P = ${surdMatrix(P)}, \\quad D = ${Dtex}`, `P^{-1} = ${surdMatrix(Pinv)}`, `P^{-1}AP = ${surdMatrix(check)} = D \\ \\checkmark`],
  });
  let N = null;
  const symmetric = isSymmetric(A);
  if (symmetric) {
    const o = orthonormalBasis(e.pairs);
    N = o.N;
    const NtAN = mul(mul(M.transpose(N), A), N);
    if (!close(NtAN, D) || !close(mul(M.transpose(N), N), M.identity(n))) verified = false;
    steps.push({ title: 'Orthogonal reduction (A is symmetric)', formula: 'N^{T}AN = D, \\quad N^{-1} = N^{T}', depth: 0, lines: [...o.lines, `N = ${surdMatrix(N)}`, `N^{T}AN = ${surdMatrix(NtAN)} = D \\ \\checkmark`] });
    notes.push('A is symmetric, so its eigenvectors for different eigenvalues are perpendicular and A can be reduced by an orthogonal matrix N (Nᵀ = N⁻¹).');
  }
  let Ak = null;
  if (String(power).trim()) {
    const k = Number(power);
    if (!Number.isInteger(k) || k < 1 || k > 20) throw new EngineError('The power k must be a whole number from 1 to 20.');
    const Dk = D.map((r) => r.map((v) => v ** k));
    Ak = mul(mul(P, Dk), Pinv).map((r) => r.map((v) => (Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) : v)));
    const direct = M.power(A, k).result ?? M.power(A, k);
    if (Array.isArray(direct) && !close(Ak, direct, 1e-5)) verified = false;
    steps.push({ title: `Power A^${k} by diagonalisation`, formula: 'A^{k} = P D^{k} P^{-1}', depth: 0, lines: [`D^{${k}} = ${surdMatrix(Dk)}`, `A^{${k}} = ${matrixTex(Ak)}`] });
  }
  return { diagonalizable: true, n, P, D, Dtex, Ptex: surdMatrix(P), N, Ntex: N ? surdMatrix(N) : null, Ak, AkTex: Ak ? matrixTex(Ak) : null, symmetric, steps, notes, verified, result: lambdas };
}
