/**
 * Geometric distribution (number of trials up to and including the first success): the maths for
 * /geometric-distribution (Unit 5).
 *   P(X = k) = (1 − p)^{k−1} p,  P(X ≤ k) = 1 − (1 − p)^k,  mean 1/p, variance (1 − p)/p².
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';
import { readConstant } from './input';

const r6 = (v) => Number(v.toPrecision(6));

export function solve({ p, k, mode = 'exact' }) {
  const P = readConstant(p, 'p');
  if (!(P > 0 && P <= 1)) throw new EngineError('p must be between 0 and 1.');
  const K = Math.round(readConstant(k, 'k'));
  if (!(K >= 1)) throw new EngineError('k counts trials, so it is a whole number 1, 2, 3, …');
  const q = 1 - P;
  const exact = q ** (K - 1) * P, atMost = 1 - q ** K;
  const value = mode === 'exact' ? exact : mode === 'atmost' ? atMost : 1 - (1 - q ** (K - 1));
  const query = mode === 'exact' ? `P(X = ${K})` : mode === 'atmost' ? `P(X \\le ${K})` : `P(X \\ge ${K})`;
  const line = mode === 'exact' ? `${query} = (${exactTex(q)})^{${K - 1}}(${exactTex(P)}) = ${r6(exact)}`
    : mode === 'atmost' ? `${query} = 1 - (${exactTex(q)})^{${K}} = ${r6(atMost)}`
      : `${query} = (${exactTex(q)})^{${K - 1}} = ${r6(value)} \\ (\\text{the first } ${K - 1} \\text{ trials all fail})`;
  const steps = [
    { title: 'The distribution', formula: 'P(X = k) = q^{k-1}p, \\ q = 1 - p', depth: 0, lines: [`p = ${exactTex(P)}, \\ q = ${exactTex(q)}, \\quad \\text{mean} = \\frac{1}{p} = ${exactTex(1 / P)}, \\quad \\text{variance} = \\frac{q}{p^2} = ${exactTex(q / (P * P))}`] },
    { title: 'The probability', depth: 0, lines: [line] },
  ];
  const kmax = Math.min(30, Math.max(K + 3, Math.ceil(4 / P)));
  const bars = Array.from({ length: kmax }, (_, i) => { const kk = i + 1; return { k: kk, p: q ** (kk - 1) * P, in: mode === 'exact' ? kk === K : mode === 'atmost' ? kk <= K : kk >= K }; });
  return { query, p: r6(value), mean: exactTex(1 / P), variance: exactTex(q / (P * P)), steps, bars, notes: ['Some books count failures before the first success instead (X = 0, 1, 2, …); then P(X = k) = qᵏp and the mean is q/p.'], verified: true };
}
