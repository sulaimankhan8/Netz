/**
 * Bairstow's method: the maths for /bairstow-method (Unit 1).
 *   Find a quadratic factor x² − rx − s of aₙxⁿ + … + a₀ (coefficients high to low). Divide twice:
 *     bₙ = aₙ, bₙ₋₁ = aₙ₋₁ + rbₙ, bᵢ = aᵢ + rbᵢ₊₁ + sbᵢ₊₂;   cₙ = bₙ, cₙ₋₁ = bₙ₋₁ + rcₙ, cᵢ = bᵢ + rcᵢ₊₁ + scᵢ₊₂
 *   Newton: c₂Δr + c₃Δs = −b₁, c₁Δr + c₂Δs = −b₀. Then deflate by the factor and repeat; the quadratics give the roots.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';

const r6 = (v) => Number(v.toPrecision(7));
const quadRoots = (r, s) => { const d = r * r + 4 * s; return d >= 0 ? [(r + Math.sqrt(d)) / 2, (r - Math.sqrt(d)) / 2].map((v) => ({ re: v, im: 0 })) : [{ re: r / 2, im: Math.sqrt(-d) / 2 }, { re: r / 2, im: -Math.sqrt(-d) / 2 }]; };
const show = (z) => (Math.abs(z.im) < 1e-10 ? String(r6(z.re)) : `${r6(z.re)} ${z.im < 0 ? '−' : '+'} ${r6(Math.abs(z.im))}i`);

export function solve({ coeffs, r0 = '0', s0 = '0', tol = '1e-8' }) {
  let a = readVector(coeffs, 'The coefficients');
  while (a.length && Math.abs(a[0]) < 1e-14) a.shift();
  if (a.length < 3) throw new EngineError('Give a polynomial of degree 2 or more (coefficients from the highest power down).');
  if (a.length > 11) throw new EngineError('Up to degree 10.');
  const eps = Number(tol) > 0 ? Number(tol) : 1e-8;
  let r = Number(r0) || 0, s = Number(s0) || 0;
  const roots = [], factors = [], rows = [];
  const steps = [];
  let first = true;
  while (a.length > 3) {
    // coefficients low-to-high for the recurrences
    const n = a.length - 1;
    const A = [...a].reverse();
    let ok = false;
    for (let it = 0; it < 200; it++) {
      const b = Array(n + 1).fill(0), c = Array(n + 1).fill(0);
      b[n] = A[n]; b[n - 1] = A[n - 1] + r * b[n];
      for (let i = n - 2; i >= 0; i--) b[i] = A[i] + r * b[i + 1] + s * b[i + 2];
      c[n] = b[n]; c[n - 1] = b[n - 1] + r * c[n];
      for (let i = n - 2; i >= 1; i--) c[i] = b[i] + r * c[i + 1] + s * c[i + 2];
      const det = c[2] * c[2] - c[3] * c[1];
      if (Math.abs(det) < 1e-300) { r += 0.1; s -= 0.1; continue; }
      const dr = (-b[1] * c[2] + b[0] * c[3]) / det, ds = (-b[0] * c[2] + b[1] * c[1]) / det;
      r += dr; s += ds;
      if (first) rows.push({ k: it + 1, r: r6(r), s: r6(s), dr: r6(dr), ds: r6(ds), b1: r6(b[1]), b0: r6(b[0]) });
      if (Math.abs(dr) < eps * Math.max(1, Math.abs(r)) && Math.abs(ds) < eps * Math.max(1, Math.abs(s))) { ok = true; break; }
    }
    if (!ok) throw new EngineError('Bairstow did not converge from these r, s; try other starting values.');
    factors.push({ r, s });
    roots.push(...quadRoots(r, s));
    if (first) steps.push({ title: 'First quadratic factor', formula: 'x^2 - rx - s', depth: 0, lines: [`r = ${r6(r)}, \\ s = ${r6(s)} \\Rightarrow x^2 ${r >= 0 ? '-' : '+'} ${r6(Math.abs(r))}x ${s >= 0 ? '-' : '+'} ${r6(Math.abs(s))}`] });
    first = false;
    // deflate: the b's (high to low) of the quotient
    const n2 = a.length - 1;
    const Al = [...a].reverse();
    const b = Array(n2 + 1).fill(0);
    b[n2] = Al[n2]; b[n2 - 1] = Al[n2 - 1] + r * b[n2];
    for (let i = n2 - 2; i >= 2; i--) b[i] = Al[i] + r * b[i + 1] + s * b[i + 2];
    a = b.slice(2).reverse();
  }
  // what is left: degree 1 or 2
  if (a.length === 3) { const [p, q, t] = a; const rr = -q / p, ss = -t / p; factors.push({ r: rr, s: ss }); roots.push(...quadRoots(rr, ss)); }
  else if (a.length === 2) roots.push({ re: -a[1] / a[0], im: 0 });
  steps.push({ title: 'All factors', depth: 0, lines: factors.map((f) => `x^2 ${f.r >= 0 ? '-' : '+'} ${r6(Math.abs(f.r))}x ${f.s >= 0 ? '-' : '+'} ${r6(Math.abs(f.s))}`), });
  steps.push({ title: 'Roots', depth: 0, lines: [roots.map(show).join(', \\ ').replace(/−/g, '-')] });
  // check
  const orig = readVector(coeffs, 'c');
  const P = (z) => orig.reduce((acc, c) => ({ re: acc.re * z.re - acc.im * z.im + c, im: acc.re * z.im + acc.im * z.re }), { re: 0, im: 0 });
  const verified = roots.every((z) => { const v = P(z); return Math.hypot(v.re, v.im) < 1e-6 * Math.max(1, ...orig.map(Math.abs)); });
  const columns = [{ key: 'k', label: 'k', bold: true }, { key: 'r', label: 'r', highlight: true }, { key: 's', label: 's', highlight: true }, { key: 'dr', label: 'Δr' }, { key: 'ds', label: 'Δs' }, { key: 'b1', label: 'b₁' }, { key: 'b0', label: 'b₀' }];
  return { roots: roots.map(show), table: rows.length ? { columns, rows } : null, steps, notes: [], verified, result: roots.map(show) };
}
