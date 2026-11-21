/**
 * Gradient descent: the maths for /gradient-descent (Units 1–5, optimisation).
 *   xₖ₊₁ = xₖ − α ∇f(xₖ)   for f(x) or f(x, y), with learning rate α, until |∇f| < tolerance or N steps.
 * The gradient is found symbolically; the table shows every step. Too large an α makes it overshoot and diverge.
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { readMulti, partial, lettersOf, mtex, evalAt } from '../symbolic/multi';
import { readConstant } from './input';

const r6 = (v) => Number(v.toPrecision(6));
// in maths, 1.09951e-8 must read 1.09951 × 10⁻⁸ (KaTeX would show an italic e)
const tx = (v) => { const m = String(v).match(/^(-?[\d.]+)e([+-]\d+)$/); return m ? `${m[1]} \\times 10^{${Number(m[2])}}` : String(v); };

export function solve({ f, x0, y0 = '', alpha = '0.1', steps: nsteps = '20', tol = '0.0001' }) {
  const node = readMulti(f, 'f');
  const vars = lettersOf(node);
  if (!vars.length || vars.length > 2 || vars.some((v) => !['x', 'y'].includes(v))) throw new EngineError('Write f in x (and y).');
  const two = vars.includes('y');
  const a = readConstant(alpha, 'The learning rate α');
  if (!(a > 0)) throw new EngineError('The learning rate α must be positive.');
  const N = Math.round(readConstant(nsteps, 'The number of steps'));
  if (!(N >= 1 && N <= 200)) throw new EngineError('Use 1 to 200 steps.');
  const eps = readConstant(tol, 'The tolerance');
  const V = two ? ['x', 'y'] : ['x'];
  const g = V.map((v) => partial(node, v, V).result);
  let p = [readConstant(x0, 'x₀'), ...(two ? [readConstant(y0, 'y₀')] : [])];
  const rows = [];
  const path = [];
  let stop = 'steps';
  for (let k = 0; k <= N; k++) {
    const scope = Object.fromEntries(V.map((v, i) => [v, p[i]]));
    const grad = g.map((d) => evalAt(d, scope));
    const fv = evalAt(node, scope);
    if (![fv, ...grad].every(Number.isFinite) || Math.abs(fv) > 1e12) { stop = 'diverged'; break; }
    const norm = Math.hypot(...grad);
    rows.push({ k, x: r6(p[0]), ...(two ? { y: r6(p[1]) } : {}), g: `(${grad.map(r6).join(', ')})`, f: r6(fv), n: r6(norm) });
    path.push({ x: p[0], y: two ? p[1] : fv });
    if (norm < eps) { stop = 'converged'; break; }
    if (k === N) break;
    p = p.map((v, i) => v - a * grad[i]);
  }
  const last = rows.at(-1);
  // Not blown up yet, but f and |∇f| keep growing: α is too large and the steps overshoot
  const growing = stop === 'steps' && rows.length > 3 && last.f > rows[0].f && last.n > rows[rows.length - 2].n;
  // Step 1 worked in full: the gradient at the start, then the move
  const s0 = Object.fromEntries(V.map((v, i) => [v, Number(rows[0][v])]));
  const g0 = g.map((d) => r6(evalAt(d, s0)));
  const p1 = V.map((v, i) => r6(Number(rows[0][v]) - a * g0[i]));
  const steps = [
    {
      title: 'Find the gradient', depth: 0,
      text: two ? 'The gradient is the pair of partial derivatives. It points uphill (where f grows fastest), so we step the opposite way.' : "In one variable the gradient is just the derivative f′(x). It points uphill, so we step the opposite way.",
      formula: '\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha\\nabla f(\\mathbf{x}_k)',
      lines: [`\\nabla f = \\left(${g.map((d) => mtex(d)).join(',\\ ')}\\right), \\qquad \\alpha = ${a}`],
    },
    {
      title: 'Step 1 in full', depth: 0,
      text: 'Put the starting point into the gradient, multiply by the learning rate α, and subtract from the point.',
      lines: [
        `\\nabla f(${V.map((v) => tx(rows[0][v])).join(', ')}) = (${g0.map(tx).join(', ')})`,
        ...V.map((v, i) => `${v}_1 = ${tx(rows[0][v])} - ${a}(${tx(g0[i])}) = ${tx(p1[i])}`),
        rows[1] ? `f \\text{ goes from } ${tx(rows[0].f)} \\text{ to } ${tx(rows[1].f)}` : '',
      ].filter(Boolean),
    },
    {
      title: 'Repeat', depth: 0,
      text: 'Each row of the table is one more step downhill. The steps get shorter as the slope flattens near the minimum, and we stop when the gradient is almost zero.',
      lines: [`\\text{stop when } |\\nabla f| < ${eps} \\text{ or after ${N} steps}`],
    },
    { title: stop === 'converged' ? 'Converged' : stop === 'diverged' ? 'Diverged' : growing ? 'Diverging' : 'Stopped', depth: 0, lines: [stop === 'diverged' ? '\\text{The values blew up: try a smaller } \\alpha' : `\\text{After ${last.k} steps: } (${two ? `${tx(last.x)}, ${tx(last.y)}` : tx(last.x)}), \\ f = ${tx(last.f)}, \\ |\\nabla f| = ${tx(last.n)}`, ...(growing ? [`\\text{f has grown from } ${rows[0].f} \\text{ to } ${last.f}: \\ \\alpha = ${a} \\text{ is too large}`] : [])] },
  ];
  const notes = ['Gradient descent finds a local minimum. A small α is slow; a large one can overshoot and diverge.'];
  if (growing) notes.unshift(`α = ${a} is too large here: each step overshoots the minimum, so f grows instead of shrinking. Try a smaller α.`);
  return {
    f: mtex(polish(node)), two, point: two ? `(${tx(last.x)}, ${tx(last.y)})` : tx(last.x), fx: tx(last.f), stop, steps, rows, path,
    columns: [{ key: 'k', label: 'k', bold: true }, { key: 'x', label: 'x' }, ...(two ? [{ key: 'y', label: 'y' }] : []), { key: 'g', label: '∇f' }, { key: 'n', label: '|∇f|' }, { key: 'f', label: 'f', highlight: true }],
    notes, verified: stop !== 'diverged', growing,
    fAt: two ? (x, y) => evalAt(node, { x, y }) : null,
  };
}
