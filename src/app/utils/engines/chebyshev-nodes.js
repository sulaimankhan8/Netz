/**
 * Chebyshev nodes and Runge's phenomenon: the maths for /chebyshev-nodes (Units 1–5).
 *   Chebyshev nodes on [a, b]: xₖ = (a + b)/2 + ((b − a)/2)·cos((2k + 1)π/(2n)), k = 0 … n − 1
 *   The interpolating polynomial through n equally spaced points and through the n Chebyshev nodes are compared:
 *   the largest error on [a, b] for each (sampled on 2000 points). For f = 1/(1 + 25x²) the equally spaced
 *   polynomial swings wildly near the ends while the Chebyshev one settles down.
 */
import { EngineError } from '../numeric/steps';
import { readMulti } from '../symbolic/multi';
import { onlyLetters, numberIn } from '../symbolic/vectorint';

const r6 = (v) => Number(v.toPrecision(6));
/** barycentric Lagrange interpolation (stable for these sizes) */
function interp(xs, ys) {
  const n = xs.length;
  const w = xs.map((xj, j) => 1 / xs.reduce((p, xk, k) => (k === j ? p : p * (xj - xk)), 1));
  return (x) => {
    let num = 0, den = 0;
    for (let j = 0; j < n; j++) { const d = x - xs[j]; if (Math.abs(d) < 1e-14) return ys[j]; const t = w[j] / d; num += t * ys[j]; den += t; }
    return num / den;
  };
}

export function solve({ f, a = '-1', b = '1', n = '11' }) {
  const F = readMulti(f, 'f(x)');
  onlyLetters([F], ['x'], 'f(x)');
  const A = numberIn(a, 'a'), B = numberIn(b, 'b');
  if (!(B > A)) throw new EngineError('Make b bigger than a.');
  const N = Math.round(Number(n));
  if (!(N >= 2 && N <= 30)) throw new EngineError('Use 2 to 30 nodes.');
  const fc = F.compile();
  const fv = (x) => { try { const y = fc.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  const eq = Array.from({ length: N }, (_, k) => A + ((B - A) * k) / (N - 1));
  const ch = Array.from({ length: N }, (_, k) => (A + B) / 2 + ((B - A) / 2) * Math.cos(((2 * k + 1) * Math.PI) / (2 * N))).sort((p, q) => p - q);
  for (const x of [...eq, ...ch]) if (!Number.isFinite(fv(x))) throw new EngineError(`f is not defined at x = ${r6(x)}.`);
  const pe = interp(eq, eq.map(fv)), pc = interp(ch, ch.map(fv));
  let ee = 0, ec = 0, xe = A, xc = A;
  for (let i = 0; i <= 2000; i++) { const x = A + ((B - A) * i) / 2000; const y = fv(x); if (!Number.isFinite(y)) continue; const d1 = Math.abs(pe(x) - y), d2 = Math.abs(pc(x) - y); if (d1 > ee) { ee = d1; xe = x; } if (d2 > ec) { ec = d2; xc = x; } }
  const steps = [
    { title: 'Chebyshev nodes', formula: 'x_k = \\frac{a + b}{2} + \\frac{b - a}{2}\\cos\\frac{(2k + 1)\\pi}{2n}', depth: 0, lines: [`x = ${ch.map(r6).join(', ')}`] },
    { title: 'Equally spaced nodes', depth: 0, lines: [`x = ${eq.map(r6).join(', ')}`] },
    { title: 'Largest error on [a, b]', formula: '\\max|f(x) - p(x)|', depth: 0, lines: [`\\text{equally spaced: } ${r6(ee)} \\ (\\text{at } x \\approx ${r6(xe)})`, `\\text{Chebyshev: } ${r6(ec)} \\ (\\text{at } x \\approx ${r6(xc)})`] },
  ];
  // plot: f as a polyline, Chebyshev interpolant (fn), equally spaced one (fn2)
  const pts = []; for (let i = 0; i <= 200; i++) { const x = A + ((B - A) * i) / 200; pts.push({ x, y: fv(x) }); }
  const ys = pts.map((p) => p.y).filter(Number.isFinite);
  const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.6 + 0.1;
  const clip = (g) => (x) => { const y = g(x); return Math.max(lo - pad, Math.min(hi + pad, y)); };
  const plot = { fn: clip(pc), fn2: clip(pe), segments: pts.slice(1).map((p, i) => [pts[i], p]), points: ch.map((x) => ({ x, y: fv(x) })), view: { x0: A, x1: B, y0: lo - pad, y1: hi + pad } };
  const table = { columns: [{ key: 'k', label: 'k', bold: true }, { key: 'eq', label: 'Equal spacing' }, { key: 'ch', label: 'Chebyshev', highlight: true }], rows: eq.map((x, k) => ({ k, eq: r6(x), ch: r6(ch[k]) })) };
  return { errEqual: r6(ee), errCheb: r6(ec), plot, table, steps, notes: ['Solid: f. The Chebyshev interpolant is the first curve, the equally spaced one the second; the dots are the Chebyshev nodes.', ee > 2 * ec ? "Runge's phenomenon: with equally spaced points the error grows near the ends as n increases; Chebyshev nodes, packed towards the ends, prevent it." : 'Here both node sets do about equally well.'], verified: true, result: [r6(ee), r6(ec)] };
}
