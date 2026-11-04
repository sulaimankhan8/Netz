/**
 * Probability helpers for the statistics pages: the normal distribution (Φ and its inverse, to
 * printed-table accuracy and beyond), binomial and Poisson probabilities, ranks with ties, and
 * shared summaries (Σ, mean, the deviation table used by correlation and regression).
 * Gamma, incomplete beta/gamma and the F tail live in ../criticalValues.js (shared with the tests pages).
 */
import { incompleteGamma, logGamma } from '../criticalValues';

/** Φ(z) = P(Z ≤ z) for the standard normal, via the incomplete gamma function (|error| < 1e-14). */
export function normalCdf(z) {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  const half = 0.5 * incompleteGamma(0.5, (z * z) / 2);
  return z >= 0 ? 0.5 + half : 0.5 - half;
}
export const normalPdf = (z) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);

/** z with Φ(z) = p (bisection on Φ; 1e-12 accurate). */
export function normalInverse(p) {
  if (!(p > 0 && p < 1)) throw new Error('p must be between 0 and 1.');
  let lo = -40, hi = 40;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (normalCdf(m) < p) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** nCk as a number (exact for the sizes used here). */
export function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
export const binomialPmf = (n, p, k) => (k < 0 || k > n ? 0 : choose(n, k) * p ** k * (1 - p) ** (n - k));
export const poissonPmf = (lambda, k) => (k < 0 ? 0 : Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1)));
export const factorial = (k) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };

/** Ranks 1 … n with ties given the average rank; also the tie groups (for Spearman's correction). */
export function ranks(values, descending = true) {
  const order = values.map((v, i) => [v, i]).sort((a, b) => (descending ? b[0] - a[0] : a[0] - b[0]));
  const r = new Array(values.length);
  const ties = [];
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    const avg = (i + j + 2) / 2;
    for (let k = i; k <= j; k++) r[order[k][1]] = avg;
    if (j > i) ties.push(j - i + 1);
    i = j + 1;
  }
  return { ranks: r, ties };
}

export const sum = (xs) => xs.reduce((s, v) => s + v, 0);
export const mean = (xs) => sum(xs) / xs.length;

/**
 * The table behind Karl Pearson's r and the regression lines: deviations from the means,
 * their squares and products. Returns the rows and the column totals.
 */
export function deviationTable(x, y) {
  const mx = mean(x), my = mean(y);
  const rows = x.map((xi, i) => {
    const dx = xi - mx, dy = y[i] - my;
    return { x: xi, y: y[i], dx, dy, dx2: dx * dx, dy2: dy * dy, dxdy: dx * dy };
  });
  const tot = (k) => sum(rows.map((r) => r[k]));
  return { mx, my, rows, Sxx: tot('dx2'), Syy: tot('dy2'), Sxy: tot('dxdy'), n: x.length };
}
