/**
 * Double integration ∫_c^d ∫_a^b f(x, y) dx dy over a rectangle, by the trapezoidal or Simpson's 1/3 rule
 * applied in both directions:
 *   trapezoidal   I ≈ (hk/4) Σ wᵢ wⱼ f(xᵢ, yⱼ), weights 1, 2, 2, …, 2, 1
 *   Simpson 1/3   I ≈ (hk/9) Σ wᵢ wⱼ f(xᵢ, yⱼ), weights 1, 4, 2, 4, …, 4, 1 (even numbers of strips)
 * The table shows f at every grid point; the answer is compared with a very fine Simpson grid.
 */
import { EngineError } from '../numeric/steps';
import { readConstant, readWhole } from './input';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';

const n6 = (v) => String(Number(Number(v).toPrecision(6)));
const weights = (m, rule) => Array.from({ length: m + 1 }, (_, i) => (i === 0 || i === m ? 1 : rule === 'simpson' ? (i % 2 ? 4 : 2) : 2));

export function solve({ f: tf, a: ta, b: tb, c: tc, d: td, m: tm = '4', n: tn = '4', rule = 'simpson' }) {
  if (!['trapezoidal', 'simpson'].includes(rule)) throw new EngineError('Choose the trapezoidal rule or Simpson’s rule.');
  const node = parse(tf, 'f(x, y)');
  const extra = [...variablesOf(node)].filter((v) => v !== 'x' && v !== 'y');
  if (extra.length) throw new EngineError(`Use only x and y (this also uses ${extra.join(', ')}).`);
  const a = readConstant(ta, 'x from'), b = readConstant(tb, 'x to'), c = readConstant(tc, 'y from'), d = readConstant(td, 'y to');
  if (!(b > a) || !(d > c)) throw new EngineError('Each upper limit must be bigger than its lower limit.');
  const m = readWhole(tm, 'Strips in x', 1, 40), n = readWhole(tn, 'Strips in y', 1, 40);
  if (rule === 'simpson' && (m % 2 || n % 2)) throw new EngineError("Simpson's 1/3 rule needs an even number of strips in each direction.");
  const f = (x, y) => { const v = node.evaluate({ x, y }); if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`f is not defined at (${n6(x)}, ${n6(y)}).`); return v; };
  const h = (b - a) / m, k = (d - c) / n;
  const wx = weights(m, rule), wy = weights(n, rule);
  const xs = Array.from({ length: m + 1 }, (_, i) => a + i * h), ys = Array.from({ length: n + 1 }, (_, j) => c + j * k);
  const grid = ys.map((y) => xs.map((x) => f(x, y)));
  const S = grid.reduce((s, row, j) => s + row.reduce((t, v, i) => t + wx[i] * wy[j] * v, 0), 0);
  const factor = rule === 'simpson' ? (h * k) / 9 : (h * k) / 4;
  const I = factor * S;

  // A fine Simpson grid as the check value
  const fine = (M) => {
    const H = (b - a) / M, K = (d - c) / M, W = weights(M, 'simpson');
    let s = 0;
    for (let j = 0; j <= M; j++) for (let i = 0; i <= M; i++) s += W[i] * W[j] * f(a + i * H, c + j * K);
    return (H * K * s) / 9;
  };
  const accurate = fine(200);

  const steps = [
    { title: 'Step sizes', lines: [`h = \\frac{${n6(b)} - ${n6(a)}}{${m}} = ${n6(h)}, \\quad k = \\frac{${n6(d)} - ${n6(c)}}{${n}} = ${n6(k)}`] },
    { title: 'Weights in each direction', formula: rule === 'simpson' ? '1, 4, 2, 4, \\ldots, 4, 1' : '1, 2, 2, \\ldots, 2, 1', lines: [`x: ${wx.join(', ')}, \\qquad y: ${wy.join(', ')}`, '\\text{Each grid value is multiplied by its x-weight times its y-weight.}'] },
    { title: `${rule === 'simpson' ? "Simpson's 1/3 rule" : 'Trapezoidal rule'} in both directions`, formula: rule === 'simpson' ? 'I \\approx \\frac{hk}{9}\\sum w_i w_j f(x_i, y_j)' : 'I \\approx \\frac{hk}{4}\\sum w_i w_j f(x_i, y_j)', lines: [`\\sum w_i w_j f_{ij} = ${n6(S)}`, `I \\approx \\frac{${n6(h)} \\times ${n6(k)}}{${rule === 'simpson' ? 9 : 4}} \\times ${n6(S)} = ${n6(I)}`] },
    { title: 'Check', lines: [`\\text{A very fine grid (} 200 \\times 200 \\text{ Simpson) gives } ${n6(accurate)}, \\ \\text{error} \\approx ${n6(Math.abs(I - accurate))}`] },
  ];
  const showGrid = m <= 10 && n <= 10;
  const table = showGrid ? {
    columns: [{ key: 'y', label: 'y \\ x' }, ...xs.map((x, i) => ({ key: `c${i}`, label: n6(x) }))],
    rows: ys.map((y, j) => Object.fromEntries([['y', `${n6(y)} (w ${wy[j]})`], ...grid[j].map((v, i) => [`c${i}`, n6(v)])])),
  } : null;
  return {
    rule, m, n, h, k, value: I, accurate, error: Math.abs(I - accurate), f: tex(polish(node)).trim(),
    limits: { a, b, c, d }, steps, table, verified: Math.abs(I - accurate) < 0.05 * Math.max(1, Math.abs(accurate)),
    result: I, notes: showGrid ? [] : ['The grid is larger than 10 × 10, so its table is not shown.'], plot: null,
  };
}
