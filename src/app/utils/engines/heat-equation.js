/**
 * The one-dimensional heat equation u_t = c² u_xx: the maths for /heat-equation (Units 1–5).
 * 0 < x < L, u(0, t) = g₀, u(L, t) = g₁, u(x, 0) = f(x); grid h in x, k in t, λ = c²k/h².
 *   Bender–Schmidt (explicit, λ = 1/2): u_{i,j+1} = ½(u_{i−1,j} + u_{i+1,j})          (stable only for λ ≤ ½)
 *   Crank–Nicolson (implicit, any λ):   −λu_{i−1,j+1} + 2(1 + λ)u_{i,j+1} − λu_{i+1,j+1} = λu_{i−1,j} + 2(1 − λ)u_{i,j} + λu_{i+1,j}
 */
import { EngineError } from '../numeric/steps';
import { parse } from '../symbolic/tree';
import { readConstant } from './input';
import { thomas } from '../numeric/tridiagonal';

const r4 = (v) => Number(v.toFixed(4));

export function solve({ f, L, c2 = '1', h, k = '', g0 = '0', g1 = '0', steps: nt = '4', method = 'bender' }) {
  const node = parse(f, 'u(x, 0) = f(x)');
  const F = (x) => { const y = node.evaluate({ x }); if (!Number.isFinite(y)) throw new EngineError(`f is not defined at x = ${x}.`); return y; };
  const Lv = readConstant(L, 'L'), c = readConstant(c2, 'c²'), H = readConstant(h, 'h');
  const left = readConstant(g0, 'u(0, t)'), right = readConstant(g1, 'u(L, t)');
  const T = Math.round(readConstant(nt, 'The number of time steps'));
  const n = Math.round(Lv / H);
  if (!(n >= 2 && n <= 40) || Math.abs(n * H - Lv) > 1e-9) throw new EngineError('L must be a whole number of steps h (2 to 40 steps).');
  if (!(T >= 1 && T <= 40)) throw new EngineError('Use 1 to 40 time steps.');
  let K, lam;
  if (method === 'bender') { lam = 0.5; K = (lam * H * H) / c; }
  else { K = String(k).trim() ? readConstant(k, 'k') : (H * H) / c; lam = (c * K) / (H * H); }
  const xs = Array.from({ length: n + 1 }, (_, i) => i * H);
  let u = xs.map((x, i) => (i === 0 ? left : i === n ? right : F(x)));
  const grid = [u];
  for (let j = 0; j < T; j++) {
    const next = [...u];
    next[0] = left; next[n] = right;
    if (method === 'bender') {
      for (let i = 1; i < n; i++) next[i] = 0.5 * (u[i - 1] + u[i + 1]);
    } else {
      const m = n - 1, lo = [], di = [], up = [], rhs = [];
      for (let i = 1; i <= m; i++) {
        let R = lam * u[i - 1] + 2 * (1 - lam) * u[i] + lam * u[i + 1];
        if (i === 1) R += lam * left;
        if (i === m) R += lam * right;
        lo.push(i === 1 ? 0 : -lam); di.push(2 * (1 + lam)); up.push(i === m ? 0 : -lam); rhs.push(R);
      }
      const sol = thomas(lo, di, up, rhs);
      const inner = sol.result;
      for (let i = 1; i <= m; i++) next[i] = inner[i - 1];
    }
    u = next;
    grid.push(u);
  }
  const columns = [{ key: 't', label: 't', bold: true }, ...xs.map((x, i) => ({ key: `u${i}`, label: `x = ${r4(x)}` }))];
  const rows = grid.map((row, j) => ({ t: r4(j * K), ...Object.fromEntries(row.map((v, i) => [`u${i}`, r4(v)])) }));
  const steps = [
    { title: 'Grid', formula: '\\lambda = \\frac{c^2k}{h^2}', depth: 0, lines: [`h = ${H}, \\quad k = ${r4(K)}, \\quad \\lambda = ${r4(lam)}`] },
    method === 'bender'
      ? { title: 'Bender–Schmidt (explicit)', formula: 'u_{i,j+1} = \\tfrac{1}{2}(u_{i-1,j} + u_{i+1,j}) \\quad (\\lambda = \\tfrac{1}{2})', depth: 0, lines: grid.length > 1 ? [`u_{1,1} = \\tfrac{1}{2}(${r4(grid[0][0])} + ${r4(grid[0][2])}) = ${r4(grid[1][1])}`] : [] }
      : { title: 'Crank–Nicolson (implicit)', formula: '-\\lambda u_{i-1,j+1} + 2(1+\\lambda)u_{i,j+1} - \\lambda u_{i+1,j+1} = \\lambda u_{i-1,j} + 2(1-\\lambda)u_{i,j} + \\lambda u_{i+1,j}', depth: 0, lines: ['\\text{Each time level is a tridiagonal system, solved by the Thomas algorithm.}'] },
  ];
  const notes = method === 'bender' ? ['Bender–Schmidt fixes λ = ½ (so k = h²/(2c²)); larger λ would make the explicit scheme unstable.'] : ['Crank–Nicolson is stable for any λ; λ = 1 (k = h²/c²) is the usual textbook choice.'];
  return { method, h: H, k: r4(K), lambda: r4(lam), columns, rows, steps, notes, verified: true };
}
