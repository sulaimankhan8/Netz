/**
 * Non-parametric tests: the maths for /non-parametric-tests (Unit 5).
 *   sign test        one sample against a median m₀ (or paired data, differences against 0): count the + and −
 *                    signs (ties dropped); under H₀ the number of + is Binomial(n, ½). Exact two-sided p-value.
 *   Mann–Whitney U   two independent samples: rank all values together (ties get the average rank),
 *                    U₁ = R₁ − n₁(n₁ + 1)/2, U = min(U₁, U₂); z = (U − n₁n₂/2)/σ with the tie-corrected σ.
 *   Decision at the chosen level α (two-sided).
 */
import { EngineError } from '../numeric/steps';
import { binomialPmf, normalCdf } from '../numeric/distributions';
import { readVector } from '../numeric/extras';

const r4 = (v) => Number(v.toPrecision(4));

export function solve({ test = 'sign', x: xt, y: yt = '', m0 = '0', alpha = '0.05' }) {
  const a = Number(alpha);
  if (!(a > 0 && a < 0.5)) throw new EngineError('α should be between 0 and 0.5 (e.g. 0.05).');
  const x = readVector(xt, 'Sample 1');
  const steps = [];
  if (test === 'sign') {
    const paired = String(yt ?? '').trim() !== '';
    let d;
    if (paired) { const y = readVector(yt, 'Sample 2'); if (y.length !== x.length) throw new EngineError('Paired data need the same number of values in both samples.'); d = x.map((v, i) => v - y[i]); }
    else { const m = Number(m0); if (!Number.isFinite(m)) throw new EngineError('The median m₀ must be a number.'); d = x.map((v) => v - m); }
    const plus = d.filter((v) => v > 0).length, minus = d.filter((v) => v < 0).length, ties = d.length - plus - minus;
    const n = plus + minus;
    if (n < 1) throw new EngineError('Every value equals the median: nothing to test.');
    const k = Math.min(plus, minus);
    let tail = 0; for (let i = 0; i <= k; i++) tail += binomialPmf(n, 0.5, i);
    const p = Math.min(1, 2 * tail);
    steps.push({ title: 'Signs', depth: 0, lines: [`${paired ? 'd_i = x_i - y_i' : `x_i - ${m0}`}: \\ ${plus} \\text{ plus}, \\ ${minus} \\text{ minus}${ties ? `, \\ ${ties} \\text{ tie(s) dropped}` : ''}`, `n = ${n}, \\quad S = \\min(${plus}, ${minus}) = ${k}`] });
    steps.push({ title: 'Binomial p-value', formula: 'P = 2\\,P(X \\le S), \\ X \\sim B(n, \\tfrac12)', depth: 0, lines: [`P = 2\\sum_{i=0}^{${k}} \\binom{${n}}{i}\\left(\\tfrac12\\right)^{${n}} = ${r4(p)}`] });
    const reject = p < a;
    steps.push({ title: 'Decision', depth: 0, lines: [`P = ${r4(p)} ${reject ? '<' : '\\ge'} \\alpha = ${a} \\Rightarrow ${reject ? '\\text{reject } H_0' : '\\text{do not reject } H_0'}`] });
    return { test, statistic: k, p: r4(p), reject, steps, notes: [paired ? 'H₀: the median difference is 0.' : `H₀: the median is ${m0}.`], verified: true, result: r4(p) };
  }
  // Mann–Whitney
  const y = readVector(yt, 'Sample 2');
  const n1 = x.length, n2 = y.length;
  if (n1 < 2 || n2 < 2) throw new EngineError('Each sample needs at least 2 values.');
  const all = [...x.map((v) => ({ v, g: 1 })), ...y.map((v) => ({ v, g: 2 }))].sort((p, q) => p.v - q.v);
  const ranks = Array(all.length);
  const tieGroups = [];
  for (let i = 0; i < all.length;) { let j = i; while (j + 1 < all.length && all[j + 1].v === all[i].v) j++; const rk = (i + j) / 2 + 1; for (let k = i; k <= j; k++) ranks[k] = rk; if (j > i) tieGroups.push(j - i + 1); i = j + 1; }
  const R1 = all.reduce((s, q, i) => s + (q.g === 1 ? ranks[i] : 0), 0), R2 = all.reduce((s, q, i) => s + (q.g === 2 ? ranks[i] : 0), 0);
  const U1 = R1 - (n1 * (n1 + 1)) / 2, U2 = R2 - (n2 * (n2 + 1)) / 2, U = Math.min(U1, U2);
  const N = n1 + n2;
  const tieCorr = tieGroups.reduce((s, t) => s + (t ** 3 - t), 0);
  const sigma = Math.sqrt(((n1 * n2) / 12) * (N + 1 - tieCorr / (N * (N - 1))));
  const z = (U - (n1 * n2) / 2 + 0.5) / sigma; // continuity correction towards the mean
  const p = Math.min(1, 2 * normalCdf(z));
  steps.push({ title: 'Rank both samples together', depth: 0, lines: [`R_1 = ${R1}, \\quad R_2 = ${R2}${tieGroups.length ? ' \\ (\\text{ties share the average rank})' : ''}`] });
  steps.push({ title: 'U statistic', formula: 'U_1 = R_1 - \\frac{n_1(n_1 + 1)}{2}, \\quad U = \\min(U_1, U_2)', depth: 0, lines: [`U_1 = ${U1}, \\quad U_2 = ${U2}, \\quad U = ${U}`, `U_1 + U_2 = ${U1 + U2} = n_1n_2 \\ \\checkmark`] });
  steps.push({ title: 'Normal approximation', formula: 'z = \\frac{U - n_1n_2/2 + \\tfrac12}{\\sigma_U}', depth: 0, lines: [`\\sigma_U = ${r4(sigma)}, \\quad z = ${r4(z)}, \\quad P = ${r4(p)}`] });
  const reject = p < a;
  steps.push({ title: 'Decision', depth: 0, lines: [`P = ${r4(p)} ${reject ? '<' : '\\ge'} \\alpha = ${a} \\Rightarrow ${reject ? '\\text{reject } H_0' : '\\text{do not reject } H_0'}`] });
  const table = { columns: [{ key: 'v', label: 'Value', bold: true }, { key: 'g', label: 'Sample' }, { key: 'r', label: 'Rank', highlight: true }], rows: all.map((q, i) => ({ v: q.v, g: q.g, r: ranks[i] })) };
  return { test, statistic: U, p: r4(p), z: r4(z), reject, table, steps, notes: ['H₀: the two samples come from the same distribution.', n1 + n2 < 20 ? 'With small samples the exact U table is more accurate than the normal approximation; compare U with the table value.' : ''].filter(Boolean), verified: U1 + U2 === n1 * n2, result: r4(p) };
}
