/**
 * Unit step, impulse and periodic functions: the maths for /unit-step-function (Unit 13).
 *   mode 'steps'     f(t) written with u(t − a) and δ(t − a): second shifting theorem
 *   mode 'piecewise' pieces "t for 0 < t < 1; 1 for t > 1" turned into unit steps first, then transformed
 *   mode 'periodic'  pieces over one period T: F(s) = ∫₀ᵀ e^{−st} f dt / (1 − e^{−sT})
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { mtex, exactTex } from '../symbolic/multi';
import { laplace, laplacePeriodic, readLaplace, readPieces, piecesToSteps } from '../symbolic/laplace';

export function solve({ mode = 'piecewise', f = '', pieces = '', period = '' }) {
  if (mode === 'steps') {
    const node = readLaplace(f, 'f(t)');
    const r = laplace(node);
    return { f: mtex(polish(node)), F: mtex(r.F), steps: r.steps, verified: r.verified, notes: [] };
  }
  const ps = readPieces(pieces);
  if (mode === 'periodic') {
    const T = Number(String(period).trim() ? eval0(period) : NaN);
    if (!(T > 0)) throw new EngineError('Give the period T, a positive number (pi is fine).');
    if (ps.some((p) => p.from < 0 || p.to > T + 1e-12 || !Number.isFinite(p.to))) throw new EngineError(`For a periodic function, give the pieces over one period, between 0 and T = ${T}.`);
    const r = laplacePeriodic(ps, T);
    const fTex = `f(t) = \\begin{cases} ${ps.map((p) => `${mtex(polish(p.g))} & ${exactTex(p.from)} < t < ${exactTex(p.to)}`).join(' \\\\ ')} \\end{cases}, \\quad f(t + ${exactTex(T)}) = f(t)`;
    return { f: fTex, F: mtex(r.F), steps: r.steps, verified: true, notes: ['The integral over one period, divided by 1 − e^(−sT), gives the transform of the whole periodic function.'] };
  }
  const node = piecesToSteps(ps);
  const r = laplace(node);
  const fTex = `f(t) = \\begin{cases} ${ps.map((p) => `${mtex(polish(p.g))} & ${Number.isFinite(p.to) ? `${exactTex(p.from)} < t < ${exactTex(p.to)}` : `t > ${exactTex(p.from)}`}`).join(' \\\\ ')} \\end{cases}`;
  const steps = [{ title: 'Write f(t) with unit steps', formula: 'g(t)\\text{ on } (a, b) = g(t)[u(t - a) - u(t - b)]', depth: 0, lines: [`f(t) = ${mtex(polish(node))}`] }, ...r.steps];
  return { f: fTex, F: mtex(r.F), steps, verified: r.verified, notes: [] };
}
function eval0(t) {
  const s = String(t).replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi');
  return Function('pi', `return (${s});`)(Math.PI);
}
