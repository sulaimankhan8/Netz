/**
 * Continuous uniform distribution on [a, b]: the maths for /uniform-distribution (Unit 5).
 *   f(x) = 1/(b − a),  P(c < X < d) = (d − c)/(b − a) for the part inside [a, b],  mean (a + b)/2, variance (b − a)²/12.
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';
import { readConstant } from './input';

export function solve({ a, b, c, d }) {
  const A = readConstant(a, 'a'), B = readConstant(b, 'b');
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  const Cv = readConstant(c, 'c'), Dv = readConstant(d, 'd');
  if (!(Dv >= Cv)) throw new EngineError('d must not be smaller than c.');
  const lo = Math.max(A, Cv), hi = Math.min(B, Dv);
  const p = hi > lo ? (hi - lo) / (B - A) : 0;
  const steps = [
    { title: 'The distribution', formula: 'f(x) = \\frac{1}{b - a}, \\ a \\le x \\le b', depth: 0, lines: [`f(x) = \\frac{1}{${exactTex(B)} - ${A < 0 ? `(${exactTex(A)})` : exactTex(A)}} = ${exactTex(1 / (B - A))}`, `\\text{mean} = \\frac{a + b}{2} = ${exactTex((A + B) / 2)}, \\quad \\text{variance} = \\frac{(b - a)^2}{12} = ${exactTex((B - A) ** 2 / 12)}`] },
    { title: 'The probability', formula: 'P(c < X < d) = \\frac{d - c}{b - a}', depth: 0, lines: [hi > lo ? `P(${exactTex(Cv)} < X < ${exactTex(Dv)}) = \\frac{${exactTex(hi)} - ${lo < 0 ? `(${exactTex(lo)})` : exactTex(lo)}}{${exactTex(B - A)}} = ${exactTex(p)}` : `\\text{The interval lies outside } [a, b], \\text{ so the probability is } 0`] },
  ];
  return {
    query: `P(${exactTex(Cv)} < X < ${exactTex(Dv)})`, p: exactTex(p), mean: exactTex((A + B) / 2), variance: exactTex((B - A) ** 2 / 12), steps,
    notes: ['Only the part of (c, d) inside [a, b] counts.'], verified: true,
    plot: { fn: (t) => (t >= A && t <= B ? 1 / (B - A) : 0), shade: { a: lo, b: Math.max(lo, hi) }, view: { x0: A - (B - A) * 0.2, x1: B + (B - A) * 0.2, y0: 0, y1: 1 / (B - A) } },
  };
}
