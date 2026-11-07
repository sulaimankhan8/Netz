/**
 * Laplace's equation u_xx + u_yy = 0 on a square grid by Liebmann's iteration: the maths for /laplace-equation-liebmann.
 * Boundary values on the four sides are given; every inner point becomes the average of its four neighbours
 *   u_{i,j} = ¼(u_{i−1,j} + u_{i+1,j} + u_{i,j−1} + u_{i,j+1})
 * updated in place (Gauss–Seidel) until the largest change is below the tolerance. Starting values: the average of
 * the boundary values.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';

const r4 = (v) => Number(v.toFixed(4));
/** A side: one number for the whole side, or one value per grid point. */
const readSide = (t, label, n) => {
  const p = String(t ?? '').split(/[,;\s]+/).filter(Boolean).map(Number);
  if (p.some((v) => !Number.isFinite(v))) throw new EngineError(`${label}: use numbers.`);
  if (p.length === 1) return Array(n + 1).fill(p[0]);
  if (p.length !== n + 1) throw new EngineError(`${label}: give one number, or ${n + 1} numbers (one per grid point, corners included).`);
  return p;
};

export function solve({ n = '4', top, bottom, left, right, tol = '0.001' }) {
  const N = Math.round(readConstant(n, 'The grid size'));
  if (!(N >= 2 && N <= 10)) throw new EngineError('Use a grid of 2 to 10 squares on each side.');
  const eps = readConstant(tol, 'The tolerance');
  const T = readSide(top, 'Top', N), Bt = readSide(bottom, 'Bottom', N), L = readSide(left, 'Left', N), R = readSide(right, 'Right', N);
  // u[j][i]: j = row from the top (0 … N), i = column (0 … N)
  const u = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0));
  for (let i = 0; i <= N; i++) { u[0][i] = T[i]; u[N][i] = Bt[i]; }
  for (let j = 0; j <= N; j++) { u[j][0] = L[j]; u[j][N] = R[j]; }
  const bvals = [...T, ...Bt, ...L, ...R];
  const start = bvals.reduce((s, v) => s + v, 0) / bvals.length;
  for (let j = 1; j < N; j++) for (let i = 1; i < N; i++) u[j][i] = start;
  const names = [];
  for (let j = 1; j < N; j++) for (let i = 1; i < N; i++) names.push([j, i]);
  const rows = [];
  let it = 0, change = Infinity;
  rows.push({ it: 0, ...Object.fromEntries(names.map(([j, i]) => [`u${j}${i}`, r4(u[j][i])])), d: '' });
  while (change > eps && it < 300) {
    change = 0;
    for (const [j, i] of names) {
      const v = (u[j - 1][i] + u[j + 1][i] + u[j][i - 1] + u[j][i + 1]) / 4;
      change = Math.max(change, Math.abs(v - u[j][i]));
      u[j][i] = v;
    }
    it++;
    rows.push({ it, ...Object.fromEntries(names.map(([j, i]) => [`u${j}${i}`, r4(u[j][i])])), d: r4(change) });
  }
  const columns = [{ key: 'it', label: 'Iteration', bold: true }, ...names.map(([j, i]) => ({ key: `u${j}${i}`, label: `u${j}${i}` })), { key: 'd', label: 'Largest change', highlight: true }];
  const steps = [
    { title: 'Five-point formula', formula: 'u_{i,j} = \\tfrac{1}{4}(u_{i-1,j} + u_{i+1,j} + u_{i,j-1} + u_{i,j+1})', depth: 0, lines: [`\\text{${names.length} inner points, starting from } ${r4(start)} \\text{ (the average boundary value)}`] },
    { title: `Liebmann (Gauss–Seidel) iteration: ${it} sweeps`, depth: 0, lines: [`\\text{Stopped when the largest change was } ${r4(change)} < ${eps}`] },
  ];
  return {
    N, iterations: it, grid: u.map((row) => row.map(r4)), columns, rows: rows.length > 25 ? [...rows.slice(0, 12), ...rows.slice(-5)] : rows, steps,
    notes: ['Each new value is used straight away within the same sweep (Gauss–Seidel), which converges about twice as fast as Jacobi.'], verified: change <= eps,
  };
}
