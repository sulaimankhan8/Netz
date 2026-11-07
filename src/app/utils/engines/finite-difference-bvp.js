/**
 * Boundary value problems by finite differences: the maths for /finite-difference-bvp (Units 1–5).
 *   y'' + p(x) y' + q(x) y = r(x),  y(a) = α, y(b) = β,  h = (b − a)/n.
 * Central differences y'' ≈ (yᵢ₋₁ − 2yᵢ + yᵢ₊₁)/h², y' ≈ (yᵢ₊₁ − yᵢ₋₁)/(2h) give, at each inner point,
 *   (1 − hpᵢ/2) yᵢ₋₁ + (−2 + h²qᵢ) yᵢ + (1 + hpᵢ/2) yᵢ₊₁ = h²rᵢ
 * — a tridiagonal system, solved by the Thomas algorithm.
 */
import { EngineError } from '../numeric/steps';
import { parse } from '../symbolic/tree';
import { readConstant } from './input';
import { thomas } from '../numeric/tridiagonal';

const r6 = (v) => Number(v.toPrecision(7));
const fnOf = (t, label) => { const s = String(t ?? '').trim() || '0'; const n = parse(s, label); return (x) => { const y = n.evaluate({ x }); if (typeof y !== 'number' || !Number.isFinite(y)) throw new EngineError(`${label} is not defined at x = ${r6(x)}.`); return y; }; };

export function solve({ p = '0', q = '0', r = '0', a, b, ya, yb, n = '4', exact = '' }) {
  const P = fnOf(p, 'p(x)'), Q = fnOf(q, 'q(x)'), Rr = fnOf(r, 'r(x)');
  const A = readConstant(a, 'a'), B = readConstant(b, 'b');
  const alpha = readConstant(ya, 'y(a)'), beta = readConstant(yb, 'y(b)');
  const N = Math.round(readConstant(n, 'n'));
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  if (!(N >= 2 && N <= 40)) throw new EngineError('Use 2 to 40 intervals.');
  const h = (B - A) / N;
  const xs = Array.from({ length: N + 1 }, (_, i) => A + i * h);
  const m = N - 1;
  const lo = [], di = [], up = [], rhs = [];
  const eqs = [];
  for (let i = 1; i <= m; i++) {
    const x = xs[i];
    const L = 1 - (h * P(x)) / 2, D = -2 + h * h * Q(x), U = 1 + (h * P(x)) / 2;
    let R = h * h * Rr(x);
    if (i === 1) R -= L * alpha;
    if (i === m) R -= U * beta;
    lo.push(i === 1 ? 0 : L); di.push(D); up.push(i === m ? 0 : U); rhs.push(R);
    eqs.push(`i = ${i}: \\ ${r6(L)}\\,y_{${i - 1}} ${D < 0 ? '-' : '+'} ${r6(Math.abs(D))}\\,y_{${i}} ${U < 0 ? '-' : '+'} ${r6(Math.abs(U))}\\,y_{${i + 1}} = ${r6(h * h * Rr(x))}`);
  }
  const inner = thomas(lo, di, up, rhs);
  const ys = [alpha, ...inner.result, beta];
  const ex = String(exact).trim() ? fnOf(exact, 'The exact solution') : null;
  const rows = xs.map((x, i) => ({ i, x: r6(x), y: r6(ys[i]), ...(ex ? { exact: r6(ex(x)), err: r6(Math.abs(ex(x) - ys[i])) } : {}) }));
  const steps = [
    { title: 'Replace the derivatives', formula: "y'' \\approx \\frac{y_{i-1} - 2y_i + y_{i+1}}{h^2}, \\ y' \\approx \\frac{y_{i+1} - y_{i-1}}{2h}", depth: 0, lines: [`h = \\frac{${r6(B)} - ${r6(A)}}{${N}} = ${r6(h)}`, '\\left(1 - \\frac{hp_i}{2}\\right)y_{i-1} + (-2 + h^2q_i)\\,y_i + \\left(1 + \\frac{hp_i}{2}\\right)y_{i+1} = h^2r_i'] },
    { title: 'The equations at the inner points', depth: 0, lines: [...eqs.slice(0, 8), `y_0 = ${r6(alpha)}, \\quad y_{${N}} = ${r6(beta)}`] },
    { title: 'Solve the tridiagonal system (Thomas algorithm)', depth: 0, lines: [`${ys.slice(1, -1).map((y, i) => `y_{${i + 1}} = ${r6(y)}`).slice(0, 10).join(', \\ ')}`] },
  ];
  return {
    h: r6(h), steps, rows, columns: [{ key: 'i', label: 'i', bold: true }, { key: 'x', label: 'x' }, { key: 'y', label: 'y (finite diff.)', highlight: true }, ...(ex ? [{ key: 'exact', label: 'exact' }, { key: 'err', label: 'error' }] : [])],
    notes: ['The error shrinks like h²: halving h makes it about four times smaller.'], verified: true,
    plot: { points: xs.map((x, i) => ({ x, y: ys[i] })), fn: ex },
  };
}
