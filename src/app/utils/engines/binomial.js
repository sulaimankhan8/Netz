/**
 * Binomial distribution B(n, p): P(X = k) = nCk p^k q^(n−k), q = 1 − p.
 * Questions: P(X = k), P(X ≤ k), P(X < k), P(X ≥ k), P(X > k), P(a ≤ X ≤ b). When the complement is
 * shorter (P(X ≥ 1) = 1 − P(X = 0)) the steps use it, as textbooks do. Mean np, variance npq.
 * The probabilities are exact fractions when p is a simple fraction and the numbers stay small.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant, readWhole } from './input';
import { binomialPmf, choose } from '../numeric/distributions';

const n6 = (v) => String(Number(Number(v).toPrecision(6)));
export const QUERIES = ['eq', 'le', 'lt', 'ge', 'gt', 'between'];
const SYMBOL = { eq: '=', le: '\\le', lt: '<', ge: '\\ge', gt: '>' };

/** Which values of k a question covers, and the question in LaTeX. */
export function queryRange(query, tk, ta, tb, kmax) {
  if (!QUERIES.includes(query)) throw new EngineError('Choose the kind of probability.');
  if (query === 'between') {
    const a = readWhole(ta, 'a', 0, 100000), b = readWhole(tb, 'b', 0, 100000);
    if (b < a) throw new EngineError('b must be at least a.');
    return { lo: a, hi: Math.min(b, kmax), tex: `P(${a} \\le X \\le ${b})` };
  }
  const k = readWhole(tk, 'k', 0, 100000);
  const r = { eq: [k, k], le: [0, k], lt: [0, k - 1], ge: [k, kmax], gt: [k + 1, kmax] }[query];
  return { lo: Math.max(0, r[0]), hi: Math.min(r[1], kmax), tex: `P(X ${SYMBOL[query]} ${k})` };
}

/** Exact fraction LaTeX when the value is one (small denominator), else 6 significant figures. */
export function probTex(v, exactOk) {
  if (exactOk) {
    const f = toFraction(v, 1000000, 1e-13);
    if (f && f.d !== 1) return `\\frac{${f.n}}{${f.d}} \\approx ${n6(v)}`;
    if (f) return String(f.n);
  }
  return n6(v);
}

/** Sum P(X = k) for k in [lo, hi], or 1 − (the rest) when that is shorter. Returns { value, lines }. */
export function sumWithComplement(pmf, termTex, lo, hi, kmax, label, exactOk) {
  const inside = Math.max(0, hi - lo + 1), outside = kmax === Infinity ? Infinity : kmax + 1 - inside;
  const useComplement = lo > 0 && outside < inside && (hi === kmax);
  const ks = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const lines = [];
  let value;
  if (inside === 0) return { value: 0, lines: [`${label} = 0 \\text{ (no possible values)}`] };
  if (useComplement) {
    const rest = ks(0, lo - 1);
    const s = rest.reduce((acc, k) => acc + pmf(k), 0);
    value = 1 - s;
    lines.push(`${label} = 1 - P(X \\le ${lo - 1})`);
    if (rest.length <= 8) lines.push(`= 1 - \\left[${rest.map(termTex).join(' + ')}\\right]`);
    lines.push(`= 1 - ${probTex(s, exactOk)} = ${probTex(value, exactOk)}`);
  } else {
    const terms = ks(lo, hi);
    value = terms.reduce((acc, k) => acc + pmf(k), 0);
    if (terms.length <= 8) lines.push(`${label} = ${terms.map(termTex).join(' + ')}`);
    else lines.push(`${label} = \\sum_{k=${lo}}^{${hi}} P(X = k)`);
    lines.push(`= ${probTex(value, exactOk)}`);
  }
  return { value: Math.min(1, Math.max(0, value)), lines, useComplement };
}

export function solve({ n: tn, p: tp, query = 'eq', k = '', a = '', b = '' }) {
  const n = readWhole(tn, 'The number of trials n', 1, 1000);
  const p = readConstant(tp, 'The probability of success p');
  if (!(p >= 0 && p <= 1)) throw new EngineError('p is a probability, so it must be between 0 and 1.');
  const q = 1 - p;
  const fp = toFraction(p, 100, 1e-12);
  const exactOk = Boolean(fp) && n <= 30;
  const pTex = fp ? (fp.d === 1 ? String(fp.n) : `\\frac{${fp.n}}{${fp.d}}`) : n6(p);
  const fq = toFraction(q, 100, 1e-12);
  const qTex = fq ? (fq.d === 1 ? String(fq.n) : `\\frac{${fq.n}}{${fq.d}}`) : n6(q);
  const pmf = (kk) => binomialPmf(n, p, kk);
  const termTex = (kk) => `\\binom{${n}}{${kk}}\\left(${pTex}\\right)^{${kk}}\\left(${qTex}\\right)^{${n - kk}}`;

  const Q = queryRange(query, k, a, b, n);
  const steps = [
    { title: 'Identify n, p and q', formula: 'P(X = k) = \\binom{n}{k} p^k q^{n-k}', lines: [`n = ${n}, \\quad p = ${pTex}, \\quad q = 1 - p = ${qTex}`] },
  ];
  const S = sumWithComplement(pmf, termTex, Q.lo, Q.hi, n, Q.tex, exactOk);
  steps.push({ title: S.useComplement ? 'Use the complement (fewer terms)' : 'Add the probabilities', lines: S.lines });
  const mean = n * p, variance = n * p * q;
  steps.push({ title: 'Mean and variance', formula: '\\mu = np, \\ \\sigma^2 = npq', lines: [`\\mu = ${n} \\times ${pTex} = ${n6(mean)}, \\quad \\sigma^2 = ${n6(variance)}, \\quad \\sigma = ${n6(Math.sqrt(variance))}`] });

  const kmaxShown = Math.min(n, 40);
  let cum = 0;
  const table = {
    columns: [{ key: 'k', label: 'k' }, { key: 'p', label: 'P(X = k)' }, { key: 'c', label: 'P(X ≤ k)' }, { key: 'in', label: 'counted', highlight: true }],
    rows: Array.from({ length: kmaxShown + 1 }, (_, kk) => { const v = pmf(kk); cum += v; return { k: String(kk), p: n6(v), c: n6(cum), in: kk >= Q.lo && kk <= Q.hi ? '✓' : '' }; }),
  };
  const bars = Array.from({ length: kmaxShown + 1 }, (_, kk) => ({ k: kk, p: pmf(kk), in: kk >= Q.lo && kk <= Q.hi }));
  // Check: the pmf adds to 1
  const total = Array.from({ length: n + 1 }, (_, kk) => pmf(kk)).reduce((s, v) => s + v, 0);
  return { n, p, question: Q.tex, value: S.value, valueTex: probTex(S.value, exactOk), mean, variance, sd: Math.sqrt(variance), steps, table, bars, verified: Math.abs(total - 1) < 1e-9 && choose(n, 0) === 1, result: S.value, notes: n > 40 ? ['The table shows k up to 40.'] : [], plot: null };
}
