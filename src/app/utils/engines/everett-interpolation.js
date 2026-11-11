/**
 * Everett's central difference formula: the maths for /everett-interpolation (Unit 2).
 *   Equally spaced x, the point between x₀ and x₁ = x₀ + h; p = (x − x₀)/h, q = 1 − p.
 *   y = q y₀ + q(q² − 1)/3! δ²y₀ + q(q² − 1)(q² − 4)/5! δ⁴y₀ + …  +  p y₁ + p(p² − 1)/3! δ²y₁ + p(p² − 1)(p² − 4)/5! δ⁴y₁ + …
 *   Only even differences, on the rows of x₀ and x₁. x₀ is the table value just below x.
 */
import { EngineError } from '../numeric/steps';
import { readVector } from '../numeric/extras';

const r8 = (v) => Number(v.toPrecision(8));

export function solve({ x: xt, y: yt, at }) {
  const X = readVector(xt, 'x'), Y = readVector(yt, 'y');
  const n = X.length;
  if (Y.length !== n) throw new EngineError('Give as many y values as x values.');
  if (n < 4 || n > 12) throw new EngineError('Use 4 to 12 points.');
  const h = X[1] - X[0];
  if (X.some((v, i) => i > 0 && Math.abs(v - X[i - 1] - h) > 1e-9 * Math.max(1, Math.abs(h)))) throw new EngineError("Everett's formula needs equally spaced x.");
  const x = Number(at);
  if (!Number.isFinite(x)) throw new EngineError('The point x must be a number.');
  if (x < X[0] || x > X[n - 1]) throw new EngineError('x must lie inside the table.');
  let i0 = Math.min(n - 2, Math.max(0, Math.floor((x - X[0]) / h)));
  const p = (x - X[i0]) / h, q = 1 - p;
  // differences: D[k][i] = Δᵏ y_i; the central δ^{2m} y_i = Δ^{2m} y_{i−m}
  const D = [Y];
  for (let k = 1; k < n; k++) D.push(D[k - 1].slice(1).map((v, i) => v - D[k - 1][i]));
  const dc = (m, i) => { const j = i - m; return j >= 0 && D[2 * m] && j < D[2 * m].length ? D[2 * m][j] : null; };
  let y = 0;
  const lines = [];
  const coefE = (u, m) => { let c = u; for (let k = 1; k <= m; k++) c *= (u * u - k * k) / ((2 * k) * (2 * k + 1)); return c; };
  for (let m = 0; ; m++) {
    const a = dc(m, i0), b = dc(m, i0 + 1);
    if (a === null || b === null) break;
    const ca = coefE(q, m), cb = coefE(p, m);
    y += ca * a + cb * b;
    lines.push(m === 0 ? `q\\,y_0 + p\\,y_1 = ${r8(q)}(${r8(a)}) + ${r8(p)}(${r8(b)})` : `\\delta^{${2 * m}}: \\ ${r8(ca)}(${r8(a)}) + ${r8(cb)}(${r8(b)})`);
  }
  const steps = [
    { title: 'p and q', formula: 'p = \\frac{x - x_0}{h}, \\quad q = 1 - p', depth: 0, lines: [`x_0 = ${X[i0]}, \\ h = ${r8(h)}, \\ p = ${r8(p)}, \\ q = ${r8(q)}`] },
    { title: "Everett's formula", formula: 'y = qy_0 + \\frac{q(q^2 - 1)}{3!}\\delta^2y_0 + \\cdots + py_1 + \\frac{p(p^2 - 1)}{3!}\\delta^2y_1 + \\cdots', depth: 0, lines: [...lines, `y(${x}) \\approx ${r8(y)}`] },
  ];
  const rows = X.map((xv, i) => ({ x: xv, ...Object.fromEntries(D.map((r, k) => [`d${k}`, r[i] === undefined ? '' : r8(r[i])])) }));
  const columns = [{ key: 'x', label: 'x', bold: true }, ...D.map((_, k) => ({ key: `d${k}`, label: k === 0 ? 'y' : `Δ${k > 1 ? String(k).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]) : ''}y`, highlight: k % 2 === 0 && k > 0 }))];
  return { y: r8(y), p: r8(p), table: { columns, rows }, steps, notes: ['Only the even differences on the rows of x₀ and x₁ are used (shaded columns).'], verified: true, result: r8(y) };
}
