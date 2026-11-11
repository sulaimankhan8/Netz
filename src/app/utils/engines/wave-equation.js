/**
 * The wave equation u_tt = c²u_xx by the explicit scheme: the maths for /wave-equation (Units 1–5).
 * 0 < x < L, u(0, t) = u(L, t) = 0, u(x, 0) = f(x), u_t(x, 0) = g(x); grid h in x, k in t, r = ck/h.
 *   first step   u_{i,1} = (1 − r²)u_{i,0} + (r²/2)(u_{i−1,0} + u_{i+1,0}) + k·g(xᵢ)
 *   then         u_{i,j+1} = 2(1 − r²)u_{i,j} + r²(u_{i−1,j} + u_{i+1,j}) − u_{i,j−1}
 *   r = 1 (k = h/c) gives the textbook form u_{i,j+1} = u_{i−1,j} + u_{i+1,j} − u_{i,j−1}; the scheme is stable for r ≤ 1.
 */
import { EngineError } from '../numeric/steps';
import { readMulti as parse } from '../symbolic/multi';
import { readConstant } from './input';

const r4 = (v) => Number(v.toFixed(4));

export function solve({ f, g = '0', L, c = '1', h, k = '', steps: nt = '4' }) {
  const fn = parse(f, 'u(x, 0) = f(x)'), gn = parse(String(g ?? '').trim() || '0', 'u_t(x, 0) = g(x)');
  const ev = (node, x, label) => { const y = node.evaluate({ x }); if (!Number.isFinite(y)) throw new EngineError(`${label} is not defined at x = ${x}.`); return y; };
  const Lv = readConstant(L, 'L'), C = readConstant(c, 'c'), H = readConstant(h, 'h');
  const T = Math.round(readConstant(nt, 'The number of time steps'));
  const n = Math.round(Lv / H);
  if (!(n >= 2 && n <= 40) || Math.abs(n * H - Lv) > 1e-9) throw new EngineError('L must be a whole number of steps h (2 to 40 steps).');
  if (!(T >= 1 && T <= 40)) throw new EngineError('Use 1 to 40 time steps.');
  const K = String(k).trim() ? readConstant(k, 'k') : H / C;
  const r = (C * K) / H, r2 = r * r;
  const notes = [];
  if (r > 1 + 1e-12) notes.push(`r = ${r4(r)} > 1: the explicit scheme is unstable, and the numbers will grow wildly. Take k ≤ h/c.`);
  const xs = Array.from({ length: n + 1 }, (_, i) => i * H);
  const u0 = xs.map((x, i) => (i === 0 || i === n ? 0 : ev(fn, x, 'f')));
  const u1 = u0.map((v, i) => (i === 0 || i === n ? 0 : (1 - r2) * v + (r2 / 2) * (u0[i - 1] + u0[i + 1]) + K * ev(gn, xs[i], 'g')));
  const grid = [u0, u1];
  for (let j = 1; j < T; j++) {
    const a = grid[j], b = grid[j - 1];
    grid.push(a.map((v, i) => (i === 0 || i === n ? 0 : 2 * (1 - r2) * v + r2 * (a[i - 1] + a[i + 1]) - b[i])));
  }
  const g1 = grid.slice(0, T + 1);
  const columns = [{ key: 't', label: 't', bold: true }, ...xs.map((x, i) => ({ key: `u${i}`, label: `x = ${r4(x)}` }))];
  const rows = g1.map((row, j) => ({ t: r4(j * K), ...Object.fromEntries(row.map((v, i) => [`u${i}`, r4(v)])) }));
  const steps = [
    { title: 'Grid', formula: 'r = \\frac{ck}{h}', depth: 0, lines: [`h = ${H}, \\quad k = ${r4(K)}, \\quad r = ${r4(r)}`] },
    { title: 'First time step (uses u_t = g)', formula: "u_{i,1} = (1 - r^2)u_{i,0} + \\tfrac{r^2}{2}(u_{i-1,0} + u_{i+1,0}) + k\\,g(x_i)", depth: 0, lines: n > 1 ? [`u_{1,1} = ${r4(u1[1])}`] : [] },
    { title: 'Later steps', formula: Math.abs(r - 1) < 1e-12 ? 'u_{i,j+1} = u_{i-1,j} + u_{i+1,j} - u_{i,j-1} \\quad (r = 1)' : 'u_{i,j+1} = 2(1 - r^2)u_{i,j} + r^2(u_{i-1,j} + u_{i+1,j}) - u_{i,j-1}', depth: 0, lines: T > 1 ? [`u_{1,2} = ${r4(grid[2][1])}`] : [] },
  ];
  if (!notes.length) notes.push('r = ck/h ≤ 1 keeps the explicit scheme stable (the CFL condition); r = 1 is the usual textbook choice.');
  return { h: H, k: r4(K), r: r4(r), columns, rows, steps, notes, verified: true, result: rows.at(-1) };
}
