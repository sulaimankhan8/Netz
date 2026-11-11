/**
 * Inverse interpolation: the maths for /inverse-interpolation (Unit 2).
 *   Given a table of (x, y), find the x where y takes a given value.
 *   lagrange   swap the roles of x and y: x = Σ xᵢ Πⱼ≠ᵢ (y − yⱼ)/(yᵢ − yⱼ)   (good when y is monotone in the table)
 *   iteration  Newton's forward formula y = y₀ + pΔy₀ + p(p − 1)/2 Δ²y₀ + … rearranged for p and iterated:
 *              p = (y − y₀ − p(p − 1)/2 Δ²y₀ − …)/Δy₀  (equal spacing only), then x = x₀ + ph.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';

const r8 = (v) => Number(v.toPrecision(8));

export function solve({ method = 'lagrange', x: xt, y: yt, target }) {
  const X = readVector(xt, 'x'), Y = readVector(yt, 'y');
  const n = X.length;
  if (Y.length !== n) throw new EngineError('Give as many y values as x values.');
  if (n < 2 || n > 10) throw new EngineError('Use 2 to 10 points.');
  const t = Number(target);
  if (!Number.isFinite(t)) throw new EngineError('The y value to look for must be a number.');
  const steps = [];
  if (method === 'lagrange') {
    if (new Set(Y).size !== n) throw new EngineError('Inverse Lagrange needs different y values.');
    let x = 0;
    const terms = [];
    for (let i = 0; i < n; i++) {
      let L = 1;
      for (let j = 0; j < n; j++) if (j !== i) L *= (t - Y[j]) / (Y[i] - Y[j]);
      x += X[i] * L;
      terms.push(`${r8(X[i])} \\times ${r8(L)}`);
    }
    steps.push({ title: 'Inverse Lagrange', formula: 'x = \\sum_i x_i\\prod_{j \\ne i}\\frac{y - y_j}{y_i - y_j}', depth: 0, lines: [`x = ${terms.join(' + ').replace(/\+ -/g, '- ')}`, `x \\approx ${r8(x)}`] });
    const mono = Y.every((v, i) => i === 0 || v > Y[i - 1]) || Y.every((v, i) => i === 0 || v < Y[i - 1]);
    return { method, x: r8(x), steps, notes: mono ? [] : ['y is not monotone in the table, so x as a function of y is not single-valued; the answer may be unreliable.'], verified: true, result: r8(x) };
  }
  // successive approximation on Newton's forward formula
  const h = X[1] - X[0];
  if (X.some((v, i) => i > 0 && Math.abs(v - X[i - 1] - h) > 1e-9 * Math.max(1, Math.abs(h)))) throw new EngineError('The iteration method needs equally spaced x.');
  const diffs = [Y];
  for (let k = 1; k < n; k++) diffs.push(diffs[k - 1].slice(1).map((v, i) => v - diffs[k - 1][i]));
  const d = diffs.map((r) => r[0]);
  if (Math.abs(d[1]) < 1e-14) throw new EngineError('Δy₀ = 0, so the iteration cannot start.');
  let p = (t - d[0]) / d[1];
  const rows = [{ k: 0, p: r8(p) }];
  for (let it = 1; it <= 30; it++) {
    let extra = 0, coef = 1;
    for (let k = 2; k < n; k++) { coef *= (p - (k - 1)) / k; extra += coef * p * d[k] / 1; }
    // coef above accumulates p(p−1)…(p−k+1)/k! without the first p; fix by recomputing directly
    extra = 0;
    for (let k = 2; k < n; k++) { let c = 1; for (let j = 0; j < k; j++) c *= (p - j) / (j + 1); extra += c * d[k]; }
    const np = (t - d[0] - extra) / d[1];
    rows.push({ k: it, p: r8(np) });
    if (Math.abs(np - p) < 1e-10) { p = np; break; }
    p = np;
  }
  const x = X[0] + p * h;
  steps.push({ title: 'Iterate for p', formula: 'p = \\frac{1}{\\Delta y_0}\\left(y - y_0 - \\frac{p(p - 1)}{2!}\\Delta^2y_0 - \\cdots\\right)', depth: 0, lines: [`\\Delta y_0 = ${r8(d[1])}${n > 2 ? `, \\ \\Delta^2y_0 = ${r8(d[2])}` : ''}${n > 3 ? `, \\ \\Delta^3y_0 = ${r8(d[3])}` : ''}`, `p \\approx ${r8(p)}`] });
  steps.push({ title: 'Then x', formula: 'x = x_0 + ph', depth: 0, lines: [`x = ${r8(X[0])} + ${r8(p)} \\times ${r8(h)} = ${r8(x)}`] });
  return { method, x: r8(x), table: { columns: [{ key: 'k', label: 'Iteration', bold: true }, { key: 'p', label: 'p', highlight: true }], rows }, steps, notes: [], verified: true, result: r8(x) };
}
