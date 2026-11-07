/**
 * Lagrange multipliers: the maths for /lagrange-multipliers (catalog 6D).
 * Extreme values of f subject to φ = 0 (written g = c): at a candidate point ∇f = λ∇φ, i.e.
 *   f_x = λ φ_x,  f_y = λ φ_y  (, f_z = λ φ_z),  φ = 0.
 * The system is solved by Newton's method from many starts; f is evaluated at every candidate and the
 * largest and smallest are labelled. (They are the true max and min when the constraint curve or surface is
 * closed and bounded, e.g. a circle or an ellipse.)
 */
import { EngineError } from '../numeric/steps';
import { math, sym, mul, sub, polish } from '../symbolic/tree';
import { readMulti, partial, lettersOf, solveSystem, exactTex, mtex, evalAt } from '../symbolic/multi';

export function solve({ f, g }) {
  const F = readMulti(f, 'f');
  const raw = String(g ?? '').trim();
  if (!raw) throw new EngineError('Type the constraint, e.g. x + y = 10 or x^2 + y^2 = 1.');
  const sides = raw.split('=');
  if (sides.length > 2) throw new EngineError('The constraint should have one = sign.');
  const L = readMulti(sides[0], 'The constraint');
  const R = sides.length === 2 ? readMulti(sides[1], 'The constraint') : math.parse('0');
  const phi = sides.length === 2 ? sub(L, R) : L;
  const vars = lettersOf(F, phi);
  if (vars.length < 2 || vars.length > 3) throw new EngineError(`f and the constraint should use two or three variables (found ${vars.join(', ') || 'none'}).`);
  if (vars.includes('lambda')) throw new EngineError('λ is used for the multiplier: please rename that letter.');
  const lam = sym('lambda');
  const fd = vars.map((v) => partial(F, v, vars).result);
  const gd = vars.map((v) => partial(phi, v, vars).result);
  const eqs = [...vars.map((_, i) => sub(fd[i], mul(lam, gd[i]))), phi];
  // Search box: big enough for the numbers in the problem
  let biggest = 1;
  [F, phi].forEach((n) => n.traverse((m) => { if (m.isConstantNode && typeof m.value === 'number') biggest = Math.max(biggest, Math.abs(m.value)); }));
  const sols = solveSystem(eqs, [...vars, 'lambda'], { R: Math.max(6, 1.5 * biggest), starts: 900 });
  const cands = sols.map((s) => {
    const pt = Object.fromEntries(vars.map((v, i) => [v, s.values[i]]));
    const fv = evalAt(F, pt);
    return { values: s.values.slice(0, vars.length), tex: s.tex.slice(0, vars.length), lambda: s.values.at(-1), lambdaTex: s.tex.at(-1), f: fv, fTex: exactTex(fv) };
  }).filter((c) => Number.isFinite(c.f));
  if (cands.length) {
    const hi = Math.max(...cands.map((c) => c.f)), lo = Math.min(...cands.map((c) => c.f));
    cands.forEach((c) => { c.kind = Math.abs(hi - lo) < 1e-12 ? 'same' : Math.abs(c.f - hi) < 1e-9 * Math.max(1, Math.abs(hi)) ? 'max' : Math.abs(c.f - lo) < 1e-9 * Math.max(1, Math.abs(lo)) ? 'min' : 'other'; });
  }
  const gradTex = (d) => d.map((n) => mtex(n)).join(', ');
  const steps = [
    { title: 'Write the constraint as φ = 0', lines: [`\\varphi = ${mtex(polish(phi))} = 0`] },
    { title: 'Gradients', formula: '\\nabla f = \\lambda \\nabla \\varphi', lines: [`\\nabla f = (${gradTex(fd)}), \\qquad \\nabla \\varphi = (${gradTex(gd)})`] },
    { title: 'The Lagrange equations', lines: [`\\begin{aligned} ${vars.map((v, i) => `${mtex(fd[i])} &= \\lambda \\left(${mtex(gd[i])}\\right)`).join(' \\\\ ')} \\\\ ${mtex(polish(phi))} &= 0 \\end{aligned}`] },
    {
      title: 'Solve them together',
      lines: cands.length ? cands.map((c) => `(${vars.join(', ')}) = (${c.tex.join(', ')}), \\ \\lambda = ${c.lambdaTex} \\Rightarrow f = ${c.fTex}`) : ['\\text{No solutions were found.}'],
    },
  ];
  const notes = [
    'The equations are solved numerically from many starting points, then written exactly where an exact value fits.',
    'The largest and smallest values of f among these points are the maximum and minimum when the constraint is a closed, bounded curve or surface (a circle, an ellipse, a sphere). On an open curve such as a line, check the ends too.',
  ];
  const view = vars.length === 2 ? (() => {
    const xs = cands.map((c) => c.values[0]), ys = cands.map((c) => c.values[1]);
    const cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0, cy = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 0;
    const half = Math.max(1.5, ...xs.map((v) => Math.abs(v - cx) * 1.6), ...ys.map((v) => Math.abs(v - cy) * 1.6));
    return { x0: cx - half, x1: cx + half, y0: cy - half, y1: cy + half };
  })() : null;
  return {
    f: mtex(polish(F)), phi: mtex(polish(phi)), vars, cands, steps, notes, verified: true, view,
    fAt: (a, b) => evalAt(F, { [vars[0]]: a, [vars[1]]: b }),
    gAt: (a, b) => evalAt(phi, { [vars[0]]: a, [vars[1]]: b }),
  };
}
