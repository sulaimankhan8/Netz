/**
 * Linear recurrence relations with constant coefficients: the maths for /recurrence-relations (Unit 15).
 *   aₙ = c₁aₙ₋₁ + … + c_kaₙ₋ₖ + f(n), with starting values. The characteristic method:
 *   1. characteristic equation from the homogeneous part; roots r (repeated m times → rⁿ, nrⁿ, …, n^{m−1}rⁿ;
 *      a complex pair ρe^{±iθ} → ρⁿcos nθ, ρⁿsin nθ)
 *   2. particular solution: the trial for each term of f (nᵏbⁿ → (Pₖ(n))bⁿ, multiplied by n^s when b is a root
 *      s times), its coefficients by matching
 *   3. the constants from the starting values.
 * The formula is checked against the recurrence run term by term.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { exactTex } from '../symbolic/multi';
import { polyRootsComplex, distribute } from '../symbolic/ode';
import { readDifference, readConds } from './difference-equation-z';
import { termsOf, classify } from '../symbolic/ztransform';
import { recognise } from '../symbolic/vectorint';

const ev = (node, n) => { try { const v = node.evaluate({ n, u: () => 1, delta: (k) => (Math.abs(k) < 1e-12 ? 1 : 0) }); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
function solveLin(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    if (Math.abs(M[p][i]) < 1e-12) return null;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
/** least squares for a tall system */
function lsq(A, b) {
  const n = A[0].length;
  const N = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A.reduce((s, r) => s + r[i] * r[j], 0)));
  const y = Array.from({ length: n }, (_, i) => A.reduce((s, r, k) => s + r[i] * b[k], 0));
  return solveLin(N, y);
}
const snap = (v) => { if (Math.abs(v) < 1e-10) return 0; const f = toFraction(v, 10000, 1e-9); return f ? f.n / f.d : v; };
const cTex = (v) => recognise(snap(v));
/** basis function { k, r, trig, theta } → value at n and LaTeX */
const bval = (b, n) => n ** b.k * (b.trig ? b.rho ** n * Math[b.trig](b.theta * n) : b.r ** n);
function btex(b) {
  const nk = b.k === 0 ? '' : b.k === 1 ? 'n' : `n^{${b.k}}`;
  if (b.trig) {
    const rp = Math.abs(b.rho - 1) < 1e-12 ? '' : `${/sqrt|frac/.test(exactTex(b.rho)) ? `\\left(${exactTex(b.rho)}\\right)` : exactTex(b.rho)}^{n}`;
    return `${nk}${rp}\\${b.trig}\\left(${exactTex(b.theta)}\\,n\\right)`;
  }
  if (Math.abs(b.r - 1) < 1e-12) return nk || '1';
  const rt = exactTex(b.r);
  return `${nk}${nk ? '\\,' : ''}${rt.startsWith('-') || /sqrt|frac/.test(rt) ? `\\left(${rt}\\right)` : rt}^{n}`;
}
function combo(cs, basis) {
  const parts = [];
  cs.forEach((c, i) => {
    if (Math.abs(c) < 1e-10) return;
    const t = btex(basis[i]), ct = cTex(c);
    if (t === '1') { parts.push(ct); return; }
    const coef = ct === '1' ? '' : ct === '-1' ? '-' : /[+-]/.test(ct.slice(1)) ? `\\left(${ct}\\right)` : ct;
    parts.push(`${coef}${coef && /\d$/.test(coef) && /^\d/.test(t) ? ' \\cdot ' : coef && coef !== '-' ? '\\,' : ''}${t}`);
  });
  return parts.join(' + ').replace(/\+ -/g, '- ') || '0';
}

export function solve({ eq, ics = '' }) {
  // aₙ written as a(n) or a_n (after a number too: 5a(n − 1))
  const toY = (s) => String(s ?? '').replace(/(?<![a-zA-Z])a\s*\(/g, 'y(').replace(/(?<![a-zA-Z])a_/g, 'y_');
  const { a, r, K } = readDifference(toY(eq));
  const conds = readConds(toY(ics));
  const steps = [];
  // characteristic equation Σ a_j m^j = 0
  const lead = a[K];
  const roots = polyRootsComplex(a.map((v) => v / lead));
  const charTex = a.map((v, j) => ({ v, j })).reverse().filter(({ v }) => Math.abs(v) > 1e-14).map(({ v, j }, i) => { const m = exactTex(Math.abs(v)); return `${i === 0 ? (v < 0 ? '-' : '') : v < 0 ? ' - ' : ' + '}${m === '1' && j ? '' : m}${j ? `r${j > 1 ? `^{${j}}` : ''}` : ''}`; }).join('');
  const rootTex = (q) => (q.im ? `${exactTex(q.re)} \\pm ${exactTex(q.im)}i`.replace(/^0 \\pm /, '\\pm ') : exactTex(q.re));
  steps.push({ title: 'Characteristic equation', formula: 'a_n = r^n', depth: 0, lines: [`${charTex} = 0`, `r = ${roots.map((q) => `${rootTex(q)}${q.m > 1 ? ` \\ (\\text{${q.m} times})` : ''}`).join(', \\ ')}`] });
  const hom = [];
  for (const q of roots) for (let k = 0; k < q.m; k++) {
    if (q.im) { const rho = Math.hypot(q.re, q.im), th = Math.atan2(q.im, q.re); hom.push({ k, trig: 'cos', rho, theta: th }, { k, trig: 'sin', rho, theta: th }); }
    else hom.push({ k, r: q.re });
  }
  const hn = hom.map((b, i) => `A_{${i + 1}}${btex(b) === '1' ? '' : `\\,${btex(b)}`}`).join(' + ');
  steps.push({ title: 'Homogeneous solution', formula: '\\text{root } r \\text{ repeated } m \\text{ times} \\Rightarrow (A + Bn + \\cdots + Cn^{m-1})r^n', depth: 0, lines: [`a_n^{(h)} = ${hn}`] });
  // particular: trial from the terms of f(n)
  const rZero = [0, 1, 2, 3.5].every((n) => Math.abs(ev(r, n)) < 1e-14);
  let part = [], pc = [];
  if (!rZero) {
    const types = [];
    let rx = r;
    try { rx = distribute(r); } catch { /* keep */ }
    for (const { t } of termsOf(rx)) {
      const p = classify(t);
      if (p.special) throw new EngineError('The right side may use nᵏ, bⁿ, cos(θn) and sin(θn) (not δ or n!).');
      const g = types.find((q) => Math.abs(q.a - p.a) < 1e-12 && q.trig === p.trig && Math.abs(q.theta - p.theta) < 1e-12);
      if (g) g.k = Math.max(g.k, p.k); else types.push({ a: p.a, k: p.k, trig: p.trig, theta: p.theta });
    }
    for (const ty of types) {
      // multiplicity of the base as a root
      const z = ty.trig ? { re: ty.a * Math.cos(ty.theta), im: ty.a * Math.abs(Math.sin(ty.theta)) } : { re: ty.a, im: 0 };
      const s = (roots.find((q) => Math.abs(q.re - z.re) < 1e-9 && Math.abs(q.im - z.im) < 1e-9) || { m: 0 }).m;
      for (let k = s; k <= ty.k + s; k++) {
        if (ty.trig) part.push({ k, trig: 'cos', rho: ty.a, theta: ty.theta }, { k, trig: 'sin', rho: ty.a, theta: ty.theta });
        else part.push({ k, r: ty.a });
      }
    }
    // match: Σ a_j p(n + j) = r(n) at enough n
    const rows = [], rhs = [];
    for (let n = 0; n < part.length + 8; n++) { rows.push(part.map((b) => a.reduce((s, aj, j) => s + aj * bval(b, n + j), 0))); rhs.push(ev(r, n)); }
    pc = lsq(rows, rhs);
    if (!pc) throw new EngineError('NETZ could not fit a particular solution.');
    pc = pc.map(snap);
    steps.push({ title: 'Particular solution', formula: '\\text{trial: } f\\text{\'s form, times } n^s \\text{ if its base is a root } s \\text{ times}', depth: 0, lines: [`\\text{trial: } ${part.map((b, i) => `${String.fromCharCode(66 + i - 1 + 1)}${btex(b) === '1' ? '' : `\\,${btex(b)}`}`).join(' + ')}`, `a_n^{(p)} = ${combo(pc, part)}`] });
  }
  // constants from the starting values
  const given = [...conds.entries()].sort((p, q) => p[0] - q[0]);
  let A = null;
  const pAt = (n) => part.reduce((s, b, i) => s + pc[i] * bval(b, n), 0);
  if (given.length) {
    if (given.length !== hom.length) throw new EngineError(`An order-${hom.length} relation needs ${hom.length} starting values (given ${given.length}).`);
    A = solveLin(given.map(([n]) => hom.map((b) => bval(b, n))), given.map(([n, v]) => v - pAt(n)));
    if (!A) throw new EngineError('These starting values do not fix the constants.');
    A = A.map(snap);
    steps.push({ title: 'Use the starting values', depth: 0, lines: [given.map(([n, v]) => `a_{${n}} = ${exactTex(v)}`).join(', \\ '), A.map((c, i) => `A_{${i + 1}} = ${cTex(c)}`).join(', \\ ')] });
  }
  const answer = A ? combo([...A, ...pc], [...hom, ...part]) : `${hn}${part.length ? ` + ${combo(pc, part)}` : ''}`;
  steps.push({ title: 'Solution', depth: 0, lines: [`a_n = ${answer}`] });
  // check against the recurrence
  let verified = true;
  if (A) {
    const start = given[0][0];
    const seq = new Map(given);
    for (let n = start; n < start + 12; n++) {
      if (seq.has(n + K)) continue;
      // a_K y(n + K) = r(n) − Σ_{j<K} a_j y(n + j)
      let s = ev(r, n); let ok = true;
      for (let j = 0; j < K; j++) { if (!seq.has(n + j)) { ok = false; break; } s -= a[j] * seq.get(n + j); }
      if (ok) seq.set(n + K, s / a[K]);
    }
    const f = (n) => [...hom, ...part].reduce((s, b, i) => s + [...A, ...pc][i] * bval(b, n), 0);
    verified = [...seq.entries()].every(([n, v]) => Math.abs(f(n) - v) < 1e-6 * Math.max(1, Math.abs(v)));
    const rows = [...seq.entries()].sort((p, q) => p[0] - q[0]).slice(0, 8).map(([n, v]) => ({ n, rec: String(Number(v.toPrecision(10))), f: String(Number(f(n).toPrecision(10))) }));
    return { answer, steps, table: { columns: [{ key: 'n', label: 'n', bold: true }, { key: 'rec', label: 'aₙ from the relation' }, { key: 'f', label: 'aₙ from the formula', highlight: true }], rows }, notes: [], verified, result: answer };
  }
  return { answer, steps, table: null, notes: ['Give starting values to fix the constants.'], verified, result: answer };
}
