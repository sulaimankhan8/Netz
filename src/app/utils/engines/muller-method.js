/**
 * Muller's method: the maths for /muller-method (Unit 1).
 *   Fit a parabola through (x₀, f₀), (x₁, f₁), (x₂, f₂); its root nearer x₂ is the next point:
 *   h₁ = x₁ − x₀, h₂ = x₂ − x₁, δ₁ = (f₁ − f₀)/h₁, δ₂ = (f₂ − f₁)/h₂, a = (δ₂ − δ₁)/(h₂ + h₁), b = ah₂ + δ₂, c = f₂,
 *   x₃ = x₂ − 2c/(b ± √(b² − 4ac)) with the sign that makes the denominator larger.
 *   Works in complex numbers, so it can find complex roots from real starting points.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { readMulti } from '../symbolic/multi';
import { onlyLetters, numberIn } from '../symbolic/vectorint';

const C = (z) => (typeof z === 'number' ? math.complex(z, 0) : z);
const show = (z) => { const c = C(z); const re = Number(c.re.toPrecision(8)), im = Number(c.im.toPrecision(8)); return Math.abs(im) < 1e-12 ? String(re) : `${re} ${im < 0 ? '−' : '+'} ${Math.abs(im)}i`; };

export function solve({ f, x0 = '0', x1 = '1', x2 = '2', tol = '1e-6', max = '20' }) {
  const F = readMulti(f, 'f(x)');
  onlyLetters([F], ['x'], 'f(x)');
  const fc = F.compile();
  const fv = (z) => { const v = fc.evaluate({ x: z }); return C(v); };
  let p = [numberIn(x0, 'x₀'), numberIn(x1, 'x₁'), numberIn(x2, 'x₂')].map(C);
  const eps = Number(tol) > 0 ? Number(tol) : 1e-6, M = Math.min(60, Math.max(1, Math.round(Number(max) || 20)));
  const rows = [];
  let x3 = p[2], k = 0, done = false;
  for (; k < M; k++) {
    const [a0, a1, a2] = p, [f0, f1, f2] = p.map(fv);
    const h1 = math.subtract(a1, a0), h2 = math.subtract(a2, a1);
    if (math.abs(h1) < 1e-300 || math.abs(h2) < 1e-300) throw new EngineError('Two of the points coincide; choose three different starting points.');
    const d1 = math.divide(math.subtract(f1, f0), h1), d2 = math.divide(math.subtract(f2, f1), h2);
    const a = math.divide(math.subtract(d2, d1), math.add(h2, h1));
    const b = math.add(math.multiply(a, h2), d2), c = f2;
    const disc = math.sqrt(math.subtract(math.multiply(b, b), math.multiply(4, math.multiply(a, c))));
    const dp = math.add(b, disc), dm = math.subtract(b, disc);
    const den = math.abs(dp) >= math.abs(dm) ? dp : dm;
    if (math.abs(den) < 1e-300) throw new EngineError('The parabola is flat here; try other starting points.');
    x3 = math.subtract(a2, math.divide(math.multiply(2, c), den));
    const err = math.abs(math.subtract(x3, a2));
    rows.push({ k: k + 1, x0: show(a0), x1: show(a1), x2: show(a2), a: show(a), b: show(b), c: show(c), x3: show(x3), f: show(fv(x3)) });
    p = [a1, a2, x3];
    if (err < eps * Math.max(1, math.abs(x3)) || math.abs(fv(x3)) < 1e-14) { done = true; k++; break; }
  }
  const steps = [{ title: "Muller's step", formula: 'x_3 = x_2 - \\frac{2c}{b \\pm \\sqrt{b^2 - 4ac}}', depth: 0, lines: [`a = ${rows[0].a}, \\ b = ${rows[0].b}, \\ c = ${rows[0].c} \\Rightarrow x_3 = ${rows[0].x3}`.replace(/−/g, '-')] }];
  steps.push({ title: done ? 'Converged' : 'Stopped', depth: 0, lines: [`x \\approx ${show(x3).replace(/−/g, '-')} \\ \\text{after ${k} iteration${k === 1 ? '' : 's'}}`] });
  const columns = [{ key: 'k', label: 'k', bold: true }, { key: 'x0', label: 'x₀' }, { key: 'x1', label: 'x₁' }, { key: 'x2', label: 'x₂' }, { key: 'x3', label: 'x₃', highlight: true }, { key: 'f', label: 'f(x₃)' }];
  return { root: show(x3), iterations: k, table: { columns, rows }, steps, notes: done ? [] : ['The tolerance was not reached within the iteration limit.'], verified: math.abs(fv(x3)) < 1e-6, result: show(x3) };
}
