/**
 * Finite difference tables, for the difference-table, Stirling and Bessel pages (and later numerical
 * differentiation and Everett). The same numbers serve forward (Δ), backward (∇) and central (δ) notation;
 * only the labels and which entries a formula picks differ.
 */
import { EngineError, EPS, clean, requireNumbers } from './steps';

/** Checks x is equally spaced and returns the step h. */
export function equalSpacing(x) {
  requireNumbers(x, 'Every x value');
  if (x.length < 2) throw new EngineError('Enter at least 2 x values.');
  const h = x[1] - x[0];
  if (Math.abs(h) < EPS) throw new EngineError('The x values must be different.');
  for (let i = 2; i < x.length; i++) {
    if (Math.abs(x[i] - x[i - 1] - h) > 1e-9 * Math.max(1, Math.abs(h))) {
      throw new EngineError(`The x values must be equally spaced: x${i} − x${i - 1} is not ${clean(h)}. Use Lagrange or divided differences for unequal steps.`);
    }
  }
  return h;
}

/**
 * Difference table. table[k][i] = Δᵏyᵢ (k = 0 is y itself), so table[k] has n − k entries.
 * Backward differences are the same numbers: ∇ᵏyᵢ = Δᵏyᵢ₋ₖ.
 */
export function differenceTable(y) {
  requireNumbers(y, 'Every y value');
  if (y.length < 2) throw new EngineError('Enter at least 2 y values.');
  const table = [y.slice()];
  for (let k = 1; k < y.length; k++) {
    const prev = table[k - 1];
    table.push(prev.slice(1).map((v, i) => clean(v - prev[i])));
  }
  return table;
}

/** Δᵏyᵢ, or undefined outside the table. */
export const forward = (table, k, i) => table[k]?.[i];

/** ∇ᵏyᵢ = Δᵏyᵢ₋ₖ, or undefined outside the table. */
export const backward = (table, k, i) => table[k]?.[i - k];

/**
 * Highest order worth showing: drops trailing orders whose entries are all (near) zero,
 * e.g. a cubic's table stops at Δ³.
 */
export function usefulOrder(table) {
  let k = table.length - 1;
  while (k > 1 && table[k].every((v) => Math.abs(v) < 1e-9)) k--;
  return k;
}

/**
 * The table laid out the way textbooks print it: one row per half-step, differences sitting between
 * the values they come from. Each cell is a number or null (blank). Columns: x, y, Δy, Δ²y, …
 */
export function staggeredRows(x, table) {
  const n = x.length;
  const out = Array.from({ length: 2 * n - 1 }, () => new Array(table.length + 1).fill(null));
  for (let i = 0; i < n; i++) out[2 * i][0] = x[i];
  for (let k = 0; k < table.length; k++) {
    table[k].forEach((v, i) => { out[2 * i + k][k + 1] = v; });
  }
  return out;
}

/** Headers for staggeredRows, in Δ, ∇ or δ notation. */
export function differenceHeaders(order, symbol = 'Δ') {
  const sup = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const h = ['x', 'y'];
  for (let k = 1; k <= order; k++) h.push(`${symbol}${sup[k] ?? `^${k}`}y`);
  return h;
}

/**
 * Newton's divided differences for unequal x. table[k][i] = f[xᵢ, …, xᵢ₊ₖ].
 */
export function dividedDifferences(x, y) {
  requireNumbers(x, 'Every x value');
  requireNumbers(y, 'Every y value');
  if (x.length !== y.length) throw new EngineError('x and y need the same number of values.');
  if (new Set(x).size !== x.length) throw new EngineError('Every x value must be different.');
  const table = [y.slice()];
  for (let k = 1; k < x.length; k++) {
    const prev = table[k - 1];
    table.push(prev.slice(1).map((v, i) => clean((v - prev[i]) / (x[i + k] - x[i]))));
  }
  return table;
}
