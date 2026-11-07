/**
 * Maxima and minima of f(x, y): the maths for /maxima-minima-two-variables (catalog 6D).
 *   1. Critical points: f_x = 0 and f_y = 0 together.
 *   2. At each one: r = f_xx, s = f_xy, t = f_yy and the test rt − s²:
 *        rt − s² > 0 and r < 0 → maximum;  rt − s² > 0 and r > 0 → minimum;  rt − s² < 0 → saddle point;
 *        rt − s² = 0 → the test fails (look further).
 * The system is solved by Newton's method from many starting points in −6 … 6 and the answers are turned
 * back into exact values (0, 1/2, √2, …) where they fit exactly; points outside that box can be missed.
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { readMulti, partial, lettersOf, solveSystem, exactTex, mtex, evalAt } from '../symbolic/multi';

export const NATURE = { max: 'Maximum', min: 'Minimum', saddle: 'Saddle point', unknown: 'Test fails' };

/** r, s, t, rt − s² and the verdict at one point. */
export function classify(fxx, fxy, fyy, point) {
  const r = evalAt(fxx, point), s = evalAt(fxy, point), t = evalAt(fyy, point);
  const D = r * t - s * s;
  const tol = 1e-9 * Math.max(1, Math.abs(r * t), s * s);
  const kind = Math.abs(D) <= tol ? 'unknown' : D < 0 ? 'saddle' : r < 0 ? 'max' : 'min';
  return { r, s, t, D, kind };
}

export function solve({ f }) {
  const node = readMulti(f, 'f(x, y)');
  const vars = lettersOf(node);
  if (vars.length !== 2) throw new EngineError(`f should use exactly two variables (it uses ${vars.join(', ') || 'none'}).`);
  const [x, y] = vars;
  const fx = partial(node, x, vars).result, fy = partial(node, y, vars).result;
  const fxx = partial(fx, x, vars).result, fxy = partial(fx, y, vars).result, fyy = partial(fy, y, vars).result;
  // Newton can run far away for periodic functions; keep points near the search box, at most 12
  const found = solveSystem([fx, fy], vars, { R: 6, starts: 600 }).filter((s) => s.values.every((v) => Math.abs(v) <= 12));
  const sols = found.sort((p, q) => Math.hypot(...p.values) - Math.hypot(...q.values)).slice(0, 12)
    .sort((p, q) => p.values[0] - q.values[0] || p.values[1] - q.values[1]);
  const points = sols.map((s) => {
    const pt = { [x]: s.values[0], [y]: s.values[1] };
    const c = classify(fxx, fxy, fyy, pt);
    const fv = evalAt(node, pt);
    return { x: s.values[0], y: s.values[1], xTex: s.tex[0], yTex: s.tex[1], ...c, rTex: exactTex(c.r), sTex: exactTex(c.s), tTex: exactTex(c.t), DTex: exactTex(c.D), f: fv, fTex: exactTex(fv), nature: NATURE[c.kind] };
  });
  const steps = [
    { title: 'First partial derivatives', lines: [`f_${x} = ${mtex(fx)}, \\qquad f_${y} = ${mtex(fy)}`] },
    {
      title: 'Critical points: solve both equations together', formula: `f_${x} = 0, \\ f_${y} = 0`,
      lines: [`${mtex(fx)} = 0, \\qquad ${mtex(fy)} = 0`, points.length ? `\\Rightarrow (${x}, ${y}) = ${points.map((p) => `(${p.xTex}, ${p.yTex})`).join(', \\ ')}` : '\\text{No solutions found in } -6 \\le x, y \\le 6'],
    },
    { title: 'Second partial derivatives', formula: `r = f_{${x}${x}}, \\ s = f_{${x}${y}}, \\ t = f_{${y}${y}}`, lines: [`r = ${mtex(fxx)}, \\quad s = ${mtex(fxy)}, \\quad t = ${mtex(fyy)}`] },
    ...points.map((p) => ({
      title: `At (${p.xTex.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{(\d+)\}/g, '√$1')}, ${p.yTex.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{(\d+)\}/g, '√$1')}): ${p.nature.toLowerCase()}`,
      formula: 'rt - s^2',
      lines: [`r = ${p.rTex}, \\ s = ${p.sTex}, \\ t = ${p.tTex} \\Rightarrow rt - s^2 = ${p.DTex}`,
        p.kind === 'unknown' ? 'rt - s^2 = 0: \\ \\text{the test fails here}' : `${p.kind === 'saddle' ? 'rt - s^2 < 0' : `rt - s^2 > 0,\\ r ${p.kind === 'max' ? '< 0' : '> 0'}`} \\Rightarrow \\text{${p.nature.toLowerCase()}}${p.kind === 'saddle' ? '' : `, \\ f = ${p.fTex}`}`],
    })),
  ];
  const notes = ['Critical points are found numerically from many starting points between −6 and 6, then written exactly where an exact value fits. A critical point outside that box would be missed.'];
  if (found.length > 12) notes.push(`There are more critical points (${found.length} found, as f repeats); the 12 closest to the origin are shown.`);
  if (points.some((p) => p.kind === 'unknown')) notes.push('Where rt − s² = 0 the test says nothing: look at how f behaves near the point (e.g. along lines through it).');
  // A window that shows every point, at least 4 wide
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0, cy = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 0;
  const half = Math.max(2, ...xs.map((v) => Math.abs(v - cx) * 1.4), ...ys.map((v) => Math.abs(v - cy) * 1.4));
  const view = { x0: cx - half, x1: cx + half, y0: cy - half, y1: cy + half };
  return {
    f: mtex(polish(node)), vars, fx: mtex(fx), fy: mtex(fy), r: mtex(fxx), s: mtex(fxy), t: mtex(fyy),
    points, steps, notes, verified: true, view, fAt: (a, b) => evalAt(node, { [x]: a, [y]: b }),
  };
}
