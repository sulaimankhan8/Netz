/**
 * Markov chains: the maths for /markov-chain (Unit 5).
 *   P is the transition matrix (row i: the probabilities of moving from state i; each row adds to 1).
 *   n-step:       Pⁿ, and the distribution after n steps π⁽ⁿ⁾ = π⁽⁰⁾Pⁿ
 *   steady state: πP = π with Σπᵢ = 1 (one equation replaced by the sum), for a regular chain
 * Fractions are kept exact when the entries are fractions.
 */
import { EngineError } from '../numeric/steps';
import { readMatrix, readVector, mul } from '../numeric/extras';
import { toFraction } from '../numeric/fraction';

const fx = (v) => { if (Math.abs(v) < 1e-12) return '0'; const f = toFraction(v, 10000, 1e-10); return f ? (f.d === 1 ? String(f.n) : `\\frac{${f.n}}{${f.d}}`) : String(Number(v.toPrecision(6))); };
const mtex = (M) => `\\begin{bmatrix} ${M.map((r) => r.map(fx).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
function solveLin(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    if (Math.abs(M[p][i]) < 1e-12) return null;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}

export function solve({ P: Pt, start = '', n: nt = '2' }) {
  const P = readMatrix(Pt, 'P', 8);
  const k = P.length;
  if (P[0].length !== k) throw new EngineError('P must be square (one row and column per state).');
  if (P.some((r) => r.some((v) => v < -1e-12 || v > 1 + 1e-12))) throw new EngineError('Every entry of P is a probability between 0 and 1.');
  const bad = P.findIndex((r) => Math.abs(r.reduce((s, v) => s + v, 0) - 1) > 1e-9);
  if (bad >= 0) throw new EngineError(`Row ${bad + 1} of P adds to ${Number(P[bad].reduce((s, v) => s + v, 0).toPrecision(6))}, not 1.`);
  const n = Math.round(Number(nt));
  if (!(n >= 1 && n <= 50)) throw new EngineError('Use n from 1 to 50 steps.');
  const steps = [];
  let Pn = P;
  for (let i = 1; i < n; i++) Pn = mul(Pn, P);
  steps.push({ title: `${n}-step transition matrix`, formula: 'P^{(n)} = P^n', depth: 0, lines: [`P = ${mtex(P)}`, `P^{${n}} = ${mtex(Pn)}`] });
  let dist = null;
  if (String(start).trim()) {
    const p0 = readVector(start, 'The starting distribution');
    if (p0.length !== k) throw new EngineError(`The starting distribution needs ${k} numbers.`);
    if (Math.abs(p0.reduce((s, v) => s + v, 0) - 1) > 1e-9) throw new EngineError('The starting probabilities must add to 1.');
    dist = Pn[0].map((_, j) => p0.reduce((s, v, i) => s + v * Pn[i][j], 0));
    steps.push({ title: `After ${n} steps`, formula: '\\pi^{(n)} = \\pi^{(0)}P^n', depth: 0, lines: [`\\pi^{(${n})} = (${dist.map(fx).join(',\\ ')})`] });
  }
  // steady state: (Pᵀ − I)π = 0 with the last equation replaced by Σπ = 1
  const A = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => P[j][i] - (i === j ? 1 : 0)));
  A[k - 1] = Array(k).fill(1);
  const b = Array(k).fill(0); b[k - 1] = 1;
  const pi = solveLin(A, b);
  let note = null;
  if (pi && pi.every((v) => v > -1e-9)) {
    steps.push({ title: 'Steady state', formula: '\\pi P = \\pi, \\quad \\sum \\pi_i = 1', depth: 0, lines: [`\\pi = (${pi.map(fx).join(',\\ ')})`] });
    // regular? some power with all entries > 0
    let Q = P, reg = false;
    for (let i = 0; i < 2 * k * k && !reg; i++) { if (Q.every((r) => r.every((v) => v > 1e-12))) reg = true; Q = mul(Q, P); }
    note = reg ? 'The chain is regular, so Pⁿ tends to a matrix whose every row is π.' : 'The chain is not regular: π is a stationary distribution, but Pⁿ need not tend to it.';
  } else note = 'The chain has more than one stationary distribution (it is not irreducible).';
  return { Pn: mtex(Pn), dist: dist ? dist.map(fx) : null, pi: pi ? pi.map(fx) : null, steps, notes: [note], verified: !pi || Math.max(...pi.map((v, j) => Math.abs(pi.reduce((s, q, i) => s + q * P[i][j], 0) - v))) < 1e-9, result: pi ? pi.map(fx) : null };
}
