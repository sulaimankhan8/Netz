/**
 * Cauchy–Riemann equations: the maths for /cauchy-riemann-equations (Unit 14).
 *   f = u + iv is analytic where uₓ = v_y and u_y = −vₓ (with continuous partials); then f′(z) = uₓ + i vₓ.
 *   Input f(z) (split into u and v by complex.js), or u(x, y) and v(x, y) directly.
 *   When the equations hold only at some points (|z|², z̄), those points are found: f is differentiable there
 *   but analytic nowhere. f′(z) in z by Milne-Thomson (put x = z, y = 0).
 */
import { EngineError } from '../numeric/steps';
import { math, sym, num, add, mul, sub, polish, tidy } from '../symbolic/tree';
import { readMulti, partial, equalAt, isZero, mtex, tidyMulti, solveSystem } from '../symbolic/multi';
import { readZ, parts, checkParts, foldConstants } from '../symbolic/complex';
import { substitute } from '../symbolic/iterated';

const V = ['x', 'y'];
const t = (n) => mtex(polish(tidy(n)));

/** f′(z) from uₓ + i vₓ by Milne-Thomson: x → z, y → 0. */
export function milneThomson(ux, vx) {
  const sub0 = (n) => foldConstants(substitute(substitute(n, 'x', sym('z')), 'y', num(0)));
  return tidyMulti(add(sub0(ux), mul(sym('i'), sub0(vx))), ['z']);
}

export function solve({ mode = 'f', f = '', u = '', v = '' }) {
  let U, Vn, fz = null;
  const steps = [];
  if (mode === 'f') {
    fz = readZ(f);
    const p = parts(fz);
    if (!checkParts(fz, p.u, p.v)) throw new EngineError('NETZ could not split f into u + iv reliably for this function.');
    U = p.u; Vn = p.v;
    steps.push({ title: 'Put z = x + iy', formula: 'f(z) = u(x, y) + i\\,v(x, y)', depth: 0, lines: [`f = ${t(fz).replace(/\bz\b/g, '(x + iy)')}`, `u = ${t(U)}, \\qquad v = ${t(Vn)}`] });
  } else {
    U = readMulti(u, 'u(x, y)'); Vn = readMulti(v, 'v(x, y)');
    // letters only (the name of a function, sin in sin(x), is a SymbolNode too: skip those)
    const bad = [U, Vn].flatMap((n) => { const fns = new Set(); n.traverse((m) => { if (m.isFunctionNode) fns.add(m.fn.name); }); const s = []; n.traverse((m) => { if (m.isSymbolNode && !fns.has(m.name) && !['x', 'y', 'pi', 'e'].includes(m.name)) s.push(m.name); }); return s; });
    if (bad.length) throw new EngineError(`u and v may use only x and y (they use ${[...new Set(bad)].join(', ')}).`);
  }
  const ux = partial(U, 'x', V).result, uy = partial(U, 'y', V).result, vx = partial(Vn, 'x', V).result, vy = partial(Vn, 'y', V).result;
  steps.push({ title: 'Partial derivatives', depth: 0, lines: [`u_x = ${t(ux)}, \\quad u_y = ${t(uy)}`, `v_x = ${t(vx)}, \\quad v_y = ${t(vy)}`] });
  const cr1 = equalAt(ux, vy, V) || isZero(sub(ux, vy), V);
  const cr2 = equalAt(uy, math.parse(`-(${vx.toString()})`), V) || isZero(add(uy, vx), V);
  steps.push({
    title: 'Cauchy–Riemann equations', formula: 'u_x = v_y, \\qquad u_y = -v_x', depth: 0,
    lines: [`u_x ${cr1 ? '=' : '\\ne'} v_y: \\quad ${t(ux)} ${cr1 ? '=' : '\\ne'} ${t(vy)}`, `u_y ${cr2 ? '=' : '\\ne'} -v_x: \\quad ${t(uy)} ${cr2 ? '=' : '\\ne'} ${t(math.parse(`-(${vx.toString()})`))}`],
  });
  const notes = [];
  let verdict, derivTex = null, points = [];
  if (cr1 && cr2) {
    verdict = 'analytic';
    const d = fz ? tidyMulti(math.derivative(fz, 'z'), ['z']) : milneThomson(ux, vx);
    derivTex = t(d);
    steps.push({ title: 'f′(z)', formula: "f'(z) = u_x + i\\,v_x \\ (\\text{put } x = z,\\ y = 0)", depth: 0, lines: [`f'(z) = ${t(ux)} + i\\left(${t(vx)}\\right)`, `f'(z) = ${derivTex}`] });
    notes.push('The partial derivatives are continuous and satisfy the Cauchy–Riemann equations, so f is analytic wherever it is defined.');
  } else {
    // Where do both equations hold? (differentiable only there)
    try {
      // only isolated points count here (a whole curve of solutions is reported as "not analytic")
      const sol = solveSystem([sub(ux, vy), add(uy, vx)], V, { R: 5, starts: 300 });
      points = sol.length <= 6 ? sol.map((p) => p.tex) : [];
    } catch { points = []; }
    verdict = points.length ? 'differentiable only at isolated points' : 'not analytic';
    steps.push({ title: 'Conclusion', depth: 0, lines: [points.length ? `\\text{Both hold only at } ${points.map((p) => `(${p[0]}, ${p[1]})`).join(', ')}` : '\\text{The equations fail, so f is not analytic.}'] });
    notes.push(points.length ? 'f is differentiable only at those points, so it is analytic nowhere (analytic needs a whole neighbourhood).' : 'The Cauchy–Riemann equations fail, so f is not differentiable there.');
  }
  return { uTex: t(U), vTex: t(Vn), verdict, analytic: verdict === 'analytic', derivTex, points, steps, notes, verified: true, result: verdict };
}
