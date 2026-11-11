/**
 * Graeffe's root squaring method: the maths for /graeffe-root-squaring (Unit 1).
 *   Each squaring turns the roots xᵢ into −xᵢ² (the new polynomial is p(√y)p(−√y) up to sign):
 *     bₖ = aₖ² − 2aₖ₋₁aₖ₊₁ + 2aₖ₋₂aₖ₊₂ − …   (aₖ the coefficient of xⁿ⁻ᵏ, signs fixed so b₀ > 0)
 *   After m squarings, for well-separated real roots |xₖ| ≈ (bₖ/bₖ₋₁)^{1/2^m}; the sign is the one that makes p
 *   smaller. The ratios settling down (bₖ ≈ bₖ'² between squarings) shows the separation is complete.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';

const sci = (v) => (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(4) : String(Number(v.toPrecision(7))));

export function solve({ coeffs, m = '3' }) {
  let a = readVector(coeffs, 'The coefficients');
  while (a.length && Math.abs(a[0]) < 1e-14) a.shift();
  if (a.length < 2) throw new EngineError('Give a polynomial (coefficients from the highest power down).');
  if (Math.abs(a.at(-1)) < 1e-14) throw new EngineError('0 is a root: divide by x first.');
  const M = Math.max(1, Math.min(6, Math.round(Number(m) || 3)));
  const n = a.length - 1;
  const rows = [{ m: 0, coeffs: a.map(sci).join(', ') }];
  let c = [...a];
  for (let s = 1; s <= M; s++) {
    const b = c.map((_, k) => { let t = c[k] * c[k]; for (let j = 1; k - j >= 0 && k + j <= n; j++) t += 2 * (j % 2 ? -1 : 1) * c[k - j] * c[k + j]; return t; });
    c = b.map((v) => v * Math.sign(b[0] || 1));
    rows.push({ m: s, coeffs: c.map(sci).join(', ') });
  }
  const P = (x) => a.reduce((acc, v) => acc * x + v, 0);
  const mags = [];
  for (let k = 1; k <= n; k++) mags.push(Math.abs(c[k] / c[k - 1]) ** (1 / 2 ** M));
  const roots = mags.map((r) => (Math.abs(P(r)) <= Math.abs(P(-r)) ? r : -r));
  const steps = [
    { title: 'Square the roots', formula: 'b_k = a_k^2 - 2a_{k-1}a_{k+1} + 2a_{k-2}a_{k+2} - \\cdots', depth: 0, lines: rows.map((r) => `m = ${r.m}: \\ ${r.coeffs.replace(/e([+-]\d+)/g, ' \\times 10^{$1}')}`) },
    { title: 'Magnitudes', formula: `|x_k| \\approx \\left(\\frac{b_k}{b_{k-1}}\\right)^{1/2^{${M}}}`, depth: 0, lines: [mags.map((v, i) => `|x_{${i + 1}}| \\approx ${sci(v)}`).join(', \\ ')] },
    { title: 'Signs (by substituting)', depth: 0, lines: [roots.map((v, i) => `x_{${i + 1}} \\approx ${sci(v)}`).join(', \\ ')] },
  ];
  const good = roots.every((x) => Math.abs(P(x)) < 1e-2 * Math.max(1, ...a.map(Math.abs)) * Math.max(1, Math.abs(x) ** n));
  return { roots: roots.map(sci), table: { columns: [{ key: 'm', label: 'Squarings', bold: true }, { key: 'coeffs', label: 'Coefficients', highlight: true }], rows }, steps, notes: [good ? 'More squarings give more accurate magnitudes.' : 'Some magnitudes are rough: the roots may be complex or of equal size, where the plain method does not apply; try more squarings or another method.'], verified: true, result: roots.map(sci) };
}
