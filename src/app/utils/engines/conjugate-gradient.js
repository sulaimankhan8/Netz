/**
 * The conjugate gradient method for Ax = b, A symmetric positive definite: the maths for /conjugate-gradient.
 *   r₀ = b − Ax₀, p₀ = r₀;  αₖ = rₖᵀrₖ / pₖᵀApₖ,  xₖ₊₁ = xₖ + αₖpₖ,  rₖ₊₁ = rₖ − αₖApₖ,
 *   βₖ = rₖ₊₁ᵀrₖ₊₁ / rₖᵀrₖ,  pₖ₊₁ = rₖ₊₁ + βₖpₖ.  In exact arithmetic it finishes in at most n steps.
 * A is checked to be symmetric and positive definite (its eigenvalues), and the answer by substituting.
 */
import { EngineError } from '../numeric/steps';
import { readMatrix, readVector, mv, dotv, jacobiEigen } from '../numeric/extras';
import { toFraction } from '../numeric/fraction';

const r6 = (v) => Number(v.toPrecision(6));
const frac = (v) => { const f = toFraction(v, 1000, 1e-9); return f ? (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`) : String(r6(v)); };
const vec = (x) => `(${x.map(r6).join(', ')})`;

export function solve({ A: At, b: bt, x0: xt = '', tol = '1e-10' }) {
  const A = readMatrix(At, 'A');
  const n = A.length;
  if (A[0].length !== n) throw new EngineError('A must be square.');
  if (A.some((r, i) => r.some((v, j) => Math.abs(v - A[j][i]) > 1e-12))) throw new EngineError('A must be symmetric for conjugate gradients (aᵢⱼ = aⱼᵢ).');
  const ev = jacobiEigen(A).values;
  if (ev.at(-1) <= 1e-12) throw new EngineError(`A is not positive definite (an eigenvalue is ${r6(ev.at(-1))}), so conjugate gradients may fail.`);
  const b = readVector(bt, 'b');
  if (b.length !== n) throw new EngineError(`b needs ${n} numbers.`);
  let x = String(xt).trim() ? readVector(xt, 'x₀') : Array(n).fill(0);
  if (x.length !== n) throw new EngineError(`x₀ needs ${n} numbers.`);
  const eps = Number(tol) > 0 ? Number(tol) : 1e-10;
  let r = b.map((v, i) => v - mv(A, x)[i]);
  let p = [...r];
  let rr = dotv(r, r);
  const rows = [{ k: 0, x: vec(x), r: r6(Math.sqrt(rr)), alpha: '', beta: '' }];
  const steps = [{ title: 'Start', formula: 'r_0 = b - Ax_0, \\quad p_0 = r_0', depth: 0, lines: [`x_0 = ${vec(x)}, \\quad r_0 = ${vec(r)}`, `\\text{eigenvalues of } A: ${ev.map(r6).join(', ')} \\ (\\text{all} > 0)`] }];
  let k = 0;
  for (; k < 4 * n && Math.sqrt(rr) > eps; k++) {
    const Ap = mv(A, p);
    const pOld = [...p];
    const alpha = rr / dotv(p, Ap);
    x = x.map((v, i) => v + alpha * p[i]);
    r = r.map((v, i) => v - alpha * Ap[i]);
    const rr2 = dotv(r, r);
    const beta = rr2 / rr;
    p = r.map((v, i) => v + beta * p[i]);
    const full = k === 0 ? [
      `p_{0} = ${vec(pOld)}, \\quad Ap_{0} = ${vec(Ap)}`,
      `r_0^Tr_0 = ${r6(rr)}, \\quad p_0^TAp_0 = ${r6(dotv(pOld, Ap))}, \\quad \\alpha_0 = \\frac{${r6(rr)}}{${r6(dotv(pOld, Ap))}} = ${r6(alpha)}`,
      `x_1 = x_0 + ${r6(alpha)}\\,p_0 = ${vec(x)}, \\quad r_1 = r_0 - ${r6(alpha)}\\,Ap_0 = ${vec(r)}`,
      `\\beta_0 = \\frac{${r6(rr2)}}{${r6(rr)}} = ${r6(beta)}, \\quad p_1 = r_1 + ${r6(beta)}\\,p_0 = ${vec(p)}`,
    ] : [`\\alpha_{${k}} = ${r6(alpha)}, \\quad x_{${k + 1}} = ${vec(x)}`, `r_{${k + 1}} = ${vec(r)}, \\quad \\beta_{${k}} = ${r6(beta)}`];
    if (k < 3) steps.push({ title: k === 0 ? 'Step 1 in full' : `Step ${k + 1}`, formula: '\\alpha_k = \\frac{r_k^Tr_k}{p_k^TAp_k}, \\ x_{k+1} = x_k + \\alpha_kp_k, \\ \\beta_k = \\frac{r_{k+1}^Tr_{k+1}}{r_k^Tr_k}', depth: 1, lines: full });
    rr = rr2;
    rows.push({ k: k + 1, x: vec(x), r: r6(Math.sqrt(rr)), alpha: r6(alpha), beta: r6(beta) });
  }
  const res = Math.max(...mv(A, x).map((v, i) => Math.abs(v - b[i])));
  steps.push({ title: 'Solution', depth: 0, lines: [`x = (${x.map(frac).join(', ')}) \\ \\text{after ${k} step${k === 1 ? '' : 's'}}`, `\\max|Ax - b| = ${r6(res)}`] });
  return { x: x.map(frac), iterations: k, table: { columns: [{ key: 'k', label: 'k', bold: true }, { key: 'x', label: 'xₖ', highlight: true }, { key: 'r', label: '|rₖ|' }, { key: 'alpha', label: 'αₖ₋₁' }, { key: 'beta', label: 'βₖ₋₁' }], rows }, steps, notes: k <= n ? [`It took ${k} step${k === 1 ? '' : 's'} for a ${n} × ${n} system: at most n in exact arithmetic.`] : [], verified: res < 1e-6, result: x.map(frac) };
}
