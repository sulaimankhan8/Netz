/**
 * Difference table, Stirling's and Bessel's interpolation: the maths for /difference-table,
 * /stirling-interpolation and /bessel-interpolation. All three need equally spaced x.
 *
 * With table[k][i] = Δᵏyᵢ (indices from the first point) and origin o (the point called x₀):
 *   Stirling, p = (x − x₀)/h, best for |p| ≤ ¼:
 *     y = y₀ + p·mean(Δy₋₁, Δy₀) + p²/2!·Δ²y₋₁ + p(p² − 1)/3!·mean(Δ³y₋₂, Δ³y₋₁) + p²(p² − 1)/4!·Δ⁴y₋₂ + …
 *   Bessel, origin just below x, best for ¼ ≤ p ≤ ¾:
 *     y = mean(y₀, y₁) + (p − ½)Δy₀ + p(p − 1)/2!·mean(Δ²y₋₁, Δ²y₀) + (p − ½)p(p − 1)/3!·Δ³y₋₁ + …
 */
import { EngineError } from '../numeric/steps';
import { equalSpacing, differenceTable, usefulOrder, staggeredRows, differenceHeaders } from '../numeric/differences';
import { n } from '../numeric/geometry';
import { readList, readNumber } from './input';

function readData(tx, ty) {
  const x = readList(tx, 'x values', 2);
  const y = readList(ty, 'y values', 2);
  if (x.length !== y.length) throw new EngineError(`x has ${x.length} values but y has ${y.length}. They need the same number.`);
  if (x.length > 30) throw new EngineError('Use 30 points or fewer.');
  const h = equalSpacing(x);
  return { x, y, h, table: differenceTable(y) };
}

const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
const D = (k, i) => `\\Delta^{${k}}y_{${i}}`;

/** /difference-table */
export function differenceTableSolve({ x: tx, y: ty, notation = 'forward' }) {
  const { x, y, h, table } = readData(tx, ty);
  const order = usefulOrder(table);
  const symbol = notation === 'backward' ? '∇' : notation === 'central' ? 'δ' : 'Δ';
  const constant = table.length > 2 && order < table.length - 1;
  const notes = [
    constant
      ? `The ${order}${order === 1 ? 'st' : order === 2 ? 'nd' : order === 3 ? 'rd' : 'th'} differences are constant (and the next ones are 0), so the data fits a polynomial of degree ${order}.`
      : 'No order of differences becomes constant with this many points, so no low-degree polynomial fits exactly.',
    notation === 'forward' ? 'Forward differences: Δyᵢ = yᵢ₊₁ − yᵢ. The top diagonal (Δy₀, Δ²y₀, …) is what Newton\'s forward formula uses.'
      : notation === 'backward' ? 'Backward differences: ∇yᵢ = yᵢ − yᵢ₋₁. The same numbers, labelled from the bottom; the bottom diagonal is what Newton\'s backward formula uses.'
        : 'Central differences: δy at the midpoints between values. The middle row is what Stirling\'s and Bessel\'s formulas use.',
  ];
  return {
    x, y, h, table, order, symbol,
    rows: staggeredRows(x, table.slice(0, Math.max(order, 1) + 1)),
    headers: differenceHeaders(Math.max(order, 1), symbol),
    notes, result: order, steps: { headers: [], rows: [] }, plot: null,
  };
}

/** Shared by Stirling and Bessel: walk the terms while the table has the entries they need. */
function series(table, terms) {
  const used = [];
  let total = 0;
  for (const t of terms) {
    const vals = t.idx.map(([k, i]) => table[k]?.[i]);
    if (vals.some((v) => v === undefined)) break;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const value = t.coef * mean;
    total += value;
    used.push({ ...t, vals, mean, value, total });
  }
  return { used, total };
}

/** /stirling-interpolation */
export function stirling({ x: tx, y: ty, at }) {
  const { x, y, h, table } = readData(tx, ty);
  const X = readNumber(at, 'The x to interpolate at');
  if (X < x[0] || X > x.at(-1)) throw new EngineError(`${n(X)} is outside the table (${n(x[0])} to ${n(x.at(-1))}). Interpolation only works inside it.`);
  const o = Math.round((X - x[0]) / h); // nearest point is x₀
  const p = (X - x[o]) / h;
  const terms = [{ label: 'y_0', coef: 1, idx: [[0, o]], tex: `y_0 = ${n(y[o])}` }];
  for (let m = 1; 2 * m - 1 < table.length; m++) {
    // odd order 2m−1: p(p²−1)(p²−4)…(p²−(m−1)²)/(2m−1)!, mean of Δ^(2m−1) y₋ₘ and y₋₍ₘ₋₁₎
    let odd = p;
    for (let j = 1; j < m; j++) odd *= p * p - j * j;
    terms.push({ k: 2 * m - 1, coef: odd / fact(2 * m - 1), idx: [[2 * m - 1, o - m], [2 * m - 1, o - m + 1]], tex: `\\frac{${n(odd)}}{${2 * m - 1}!} \\cdot \\frac{${D(2 * m - 1, -m)} + ${D(2 * m - 1, -m + 1)}}{2}` });
    // even order 2m: p²(p²−1)…(p²−(m−1)²)/(2m)!, Δ^(2m) y₋ₘ
    let even = p * p;
    for (let j = 1; j < m; j++) even *= p * p - j * j;
    if (2 * m < table.length) terms.push({ k: 2 * m, coef: even / fact(2 * m), idx: [[2 * m, o - m]], tex: `\\frac{${n(even)}}{${2 * m}!} \\cdot ${D(2 * m, -m)}` });
  }
  const { used, total } = series(table, terms);
  return finish('stirling', { x, y, h, table, X, o, p, used, total }, Math.abs(p) <= 0.25 ? null : `p = ${n(p)} is outside −¼ to ¼, where Stirling's formula works best. Bessel's formula suits p near ½.`);
}

/** /bessel-interpolation */
export function bessel({ x: tx, y: ty, at }) {
  const { x, y, h, table } = readData(tx, ty);
  const X = readNumber(at, 'The x to interpolate at');
  if (X < x[0] || X > x.at(-1)) throw new EngineError(`${n(X)} is outside the table (${n(x[0])} to ${n(x.at(-1))}). Interpolation only works inside it.`);
  const o = Math.min(x.length - 2, Math.floor((X - x[0]) / h + 1e-9)); // x₀ just below x, x₁ just above
  const p = (X - x[o]) / h;
  const terms = [{ label: 'mean', coef: 1, idx: [[0, o], [0, o + 1]], tex: `\\frac{y_0 + y_1}{2}` }];
  for (let m = 0; 2 * m + 1 < table.length; m++) {
    // product (p + m − 1)…(p − m) over 2m factors, shared by the odd and even terms
    let prod = 1;
    for (let j = -(m - 1); j <= m; j++) if (m > 0) prod *= p - j;
    if (m > 0) terms.push({ k: 2 * m, coef: prod / fact(2 * m), idx: [[2 * m, o - m], [2 * m, o - m + 1]], tex: `\\frac{${n(prod)}}{${2 * m}!} \\cdot \\frac{${D(2 * m, -m)} + ${D(2 * m, -m + 1)}}{2}` });
    const odd = (p - 0.5) * prod;
    terms.push({ k: 2 * m + 1, coef: odd / fact(2 * m + 1), idx: [[2 * m + 1, o - m]], tex: `\\frac{${n(odd)}}{${2 * m + 1}!} \\cdot ${D(2 * m + 1, -m)}` });
  }
  const { used, total } = series(table, terms);
  return finish('bessel', { x, y, h, table, X, o, p, used, total }, p >= 0.25 && p <= 0.75 ? null : `p = ${n(p)} is outside ¼ to ¾, where Bessel's formula works best. Stirling's formula suits p near 0.`);
}

function finish(kind, r, warning) {
  const order = r.used.length ? Math.max(...r.used.map((t) => t.k ?? 0)) : 0;
  return {
    kind, ...r, order,
    rows: staggeredRows(r.x, r.table.slice(0, order + 1)),
    headers: differenceHeaders(order),
    lines: [
      `h = ${n(r.h)}, \\quad x_0 = ${n(r.x[r.o])}, \\quad p = \\frac{x - x_0}{h} = \\frac{${n(r.X)} - ${n(r.x[r.o])}}{${n(r.h)}} = ${n(r.p)}`,
      ...r.used.map((t) => `${t.tex} = ${n(t.value)}`),
      `y(${n(r.X)}) \\approx ${n(r.total)}`,
    ],
    notes: warning ? [warning] : [], result: r.total, steps: { headers: [], rows: [] }, plot: null,
  };
}

