/**
 * Characteristic polynomials, eigenvectors and matrix polynomials, shared by the eigenvalue and
 * Cayley–Hamilton pages.
 *   charPoly(A)    coefficients of p(λ) = det(λI − A) = λⁿ + c_{n−1}λⁿ⁻¹ + … + c₀ (ascending, c[n] = 1),
 *                  by the Faddeev–LeVerrier recursion (exact for whole-number matrices)
 *   nullSpace(N)   a basis of { x : Nx = 0 } from the reduced row echelon form, scaled to whole numbers
 */
import { toFraction } from './fraction';
import * as M from './matrix';

const mul = (A, B) => M.multiply(A, B).result; // multiply also returns its working; only the product is needed here

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b > 1e-9) [a, b] = [b, a % b]; return a; };
const trace = (A) => A.reduce((s, row, i) => s + row[i], 0);
const snap = (x) => { const r = Math.round(x); return Math.abs(x - r) < 1e-9 ? r : x; };

export function charPoly(A) {
  const n = A.length;
  const c = new Array(n + 1).fill(0);
  c[n] = 1;
  let Mk = M.zeros(n, n);
  for (let k = 1; k <= n; k++) {
    Mk = M.add(mul(A, Mk), M.scale(M.identity(n), c[n - k + 1]));
    c[n - k] = snap(-trace(mul(A, Mk)) / k);
  }
  return c;
}

/** Sum of the principal minors of size k (S₁ = trace, Sₙ = det). */
export function principalMinorSum(A, k) {
  const n = A.length;
  let s = 0;
  const choose = (start, picked) => {
    if (picked.length === k) { s += M.det(picked.map((i) => picked.map((j) => A[i][j]))); return; }
    for (let i = start; i < n; i++) choose(i + 1, [...picked, i]);
  };
  choose(0, []);
  return snap(s);
}

/** Basis of the null space of N, each vector scaled so its entries are small whole numbers when possible. */
export function nullSpace(N) {
  const { result: R, pivots } = M.rref(N);
  const n = N[0].length;
  const free = Array.from({ length: n }, (_, j) => j).filter((j) => !pivots.includes(j));
  return free.map((f) => {
    const x = new Array(n).fill(0);
    x[f] = 1;
    pivots.forEach((p, r) => { x[p] = -R[r][f]; });
    return tidyVector(x);
  });
}

/** Scale a vector to whole numbers (rational entries) or so its largest entry is 1 (otherwise). */
export function tidyVector(x) {
  const fr = x.map((v) => toFraction(v, 1000, 1e-8));
  if (fr.every(Boolean)) {
    const den = fr.reduce((acc, f) => (acc * f.d) / gcd(acc, f.d), 1);
    let w = x.map((v) => Math.round(v * den));
    const g = w.reduce((acc, v) => gcd(acc, v), 0) || 1;
    w = w.map((v) => v / g);
    if (w.find((v) => v !== 0) < 0) w = w.map((v) => (v === 0 ? 0 : -v));
    return w;
  }
  const big = x.reduce((m, v) => (Math.abs(v) > Math.abs(m) ? v : m), 0) || 1;
  return x.map((v) => v / big);
}

/** c₀I + c₁A + c₂A² + … for ascending coefficients c. */
export function polyOfMatrix(c, A) {
  const n = A.length;
  let out = M.zeros(n, n), P = M.identity(n);
  c.forEach((k, i) => { if (i) P = mul(P, A); out = M.add(out, M.scale(P, k)); });
  return out;
}
