/**
 * Poisson distribution with mean λ: P(X = k) = e^(−λ) λ^k / k!.
 * λ can be given, or found from a binomial with large n and small p (λ = np, the Poisson approximation).
 * Same questions as the binomial page; P(X ≥ k) uses 1 − P(X ≤ k − 1). Mean = variance = λ.
 */
import { EngineError } from '../numeric/steps';
import { readConstant, readWhole } from './input';
import { poissonPmf, factorial } from '../numeric/distributions';
import { queryRange, sumWithComplement } from './binomial';

const n6 = (v) => String(Number(Number(v).toPrecision(6)));
const lt = (x) => String(Number(Number(x).toPrecision(6)));

export function solve({ source = 'lambda', lambda: tl = '', n: tn = '', p: tp = '', query = 'eq', k = '', a = '', b = '' }) {
  let lambda;
  const steps = [];
  if (source === 'binomial') {
    const n = readWhole(tn, 'n', 1, 1000000000);
    const p = readConstant(tp, 'p');
    if (!(p > 0 && p < 1)) throw new EngineError('p must be between 0 and 1.');
    lambda = n * p;
    steps.push({ title: 'Poisson approximation to the binomial', formula: '\\lambda = np', lines: [`\\lambda = ${n} \\times ${lt(p)} = ${n6(lambda)}`] });
  } else {
    lambda = readConstant(tl, 'The mean λ');
    if (!(lambda > 0)) throw new EngineError('λ (the average number of events) must be positive.');
  }
  if (lambda > 500) throw new EngineError('Use λ of 500 or less here (use the normal approximation for larger means).');
  const pmf = (kk) => poissonPmf(lambda, kk);
  const L = lt(lambda);
  const termTex = (kk) => `\\frac{e^{-${L}}\\,${L}^{${kk}}}{${kk}!}`;
  const Q = queryRange(query, k, a, b, Infinity);
  steps.push({ title: 'The Poisson formula', formula: 'P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}', lines: [`\\lambda = ${L}, \\quad e^{-${L}} = ${n6(Math.exp(-lambda))}`] });
  const hi = Q.hi === Infinity ? Infinity : Q.hi;
  // For "≥ k" the range is infinite: always use the complement
  let S;
  if (hi === Infinity) {
    const rest = Array.from({ length: Q.lo }, (_, i) => i);
    const s = rest.reduce((acc, kk) => acc + pmf(kk), 0);
    const lines = [`${Q.tex} = 1 - P(X \\le ${Q.lo - 1})`];
    if (Q.lo === 0) S = { value: 1, lines: [`${Q.tex} = 1`] };
    else {
      if (rest.length <= 8) lines.push(`= 1 - \\left[${rest.map(termTex).join(' + ')}\\right]`);
      lines.push(`= 1 - ${n6(s)} = ${n6(1 - s)}`);
      S = { value: 1 - s, lines, useComplement: true };
    }
  } else {
    S = sumWithComplement(pmf, termTex, Q.lo, hi, Infinity, Q.tex, false);
  }
  steps.push({ title: S.useComplement ? 'Use the complement' : 'Add the probabilities', lines: S.lines });
  steps.push({ title: 'Mean and variance', formula: '\\mu = \\sigma^2 = \\lambda', lines: [`\\mu = \\sigma^2 = ${L}, \\quad \\sigma = ${n6(Math.sqrt(lambda))}`] });

  // Table up to where almost all the probability is used
  const rows = [];
  let cum = 0;
  for (let kk = 0; kk <= 200 && (cum < 0.9999 || kk <= Math.max(Q.lo, Number.isFinite(hi) ? hi : 0)); kk++) {
    const v = pmf(kk); cum += v;
    rows.push({ k: String(kk), p: n6(v), c: n6(cum), in: kk >= Q.lo && kk <= hi ? '✓' : '' });
    if (rows.length >= 40) break;
  }
  const table = { columns: [{ key: 'k', label: 'k' }, { key: 'p', label: 'P(X = k)' }, { key: 'c', label: 'P(X ≤ k)' }, { key: 'in', label: 'counted', highlight: true }], rows };
  const bars = rows.map((r) => ({ k: Number(r.k), p: Number(r.p), in: r.in === '✓' }));
  // Check: P(X = k) by the plain formula for a small k
  const check = Math.abs(pmf(2) - (Math.exp(-lambda) * lambda ** 2) / factorial(2)) < 1e-12;
  return { lambda, question: Q.tex, value: Math.min(1, Math.max(0, S.value)), valueTex: n6(S.value), mean: lambda, variance: lambda, sd: Math.sqrt(lambda), steps, table, bars, verified: check, result: S.value, notes: [], plot: null };
}
