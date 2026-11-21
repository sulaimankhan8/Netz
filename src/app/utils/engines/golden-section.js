/**
 * Golden section search: the maths for /golden-section-search (catalog Units 1–5, optimisation).
 * For a unimodal f on [a, b]: x₁ = b − φ(b − a), x₂ = a + φ(b − a) with φ = (√5 − 1)/2 ≈ 0.618; keep the part
 * that holds the better point and repeat until b − a < tolerance. Each step reuses one of the two old points.
 */
import { EngineError } from '../numeric/steps';
import { parse, polish, variablesOf } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readConstant } from './input';

const PHI = (Math.sqrt(5) - 1) / 2;
const r6 = (v) => Number(v.toPrecision(7));

export function solve({ f, a, b, tol = '0.001', goal = 'min' }) {
  const node = parse(f, 'f(x)');
  if ([...variablesOf(node)].some((v) => v !== 'x')) throw new EngineError('Write f in x only.');
  let A = readConstant(a, 'a'), B = readConstant(b, 'b');
  const eps = readConstant(tol, 'The tolerance');
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  if (!(eps > 0)) throw new EngineError('The tolerance must be positive.');
  const sign = goal === 'max' ? -1 : 1;
  const F = (x) => { const y = node.evaluate({ x }); if (typeof y !== 'number' || !Number.isFinite(y)) throw new EngineError(`f is not defined at x = ${r6(x)}.`); return y; };
  let x1 = B - PHI * (B - A), x2 = A + PHI * (B - A);
  let f1 = F(x1), f2 = F(x2);
  const rows = [];
  for (let k = 0; k < 200 && B - A > eps; k++) {
    rows.push({ k, a: r6(A), b: r6(B), x1: r6(x1), x2: r6(x2), f1: r6(f1), f2: r6(f2), keep: sign * f1 < sign * f2 ? '[a, x₂]' : '[x₁, b]' });
    if (sign * f1 < sign * f2) { B = x2; x2 = x1; f2 = f1; x1 = B - PHI * (B - A); f1 = F(x1); }
    else { A = x1; x1 = x2; f1 = f2; x2 = A + PHI * (B - A); f2 = F(x2); }
  }
  const x = (A + B) / 2, fx = F(x);
  const better = goal === 'max' ? 'larger' : 'smaller';
  const r0 = rows[0];
  const steps = [
    {
      title: 'The two inner points', depth: 0,
      text: 'Place two points inside [a, b], each 0.618 of the way from one end. Comparing f at them tells us which part of the interval cannot hold the best point.',
      formula: '\\varphi = \\frac{\\sqrt{5} - 1}{2} \\approx 0.618',
      lines: r0 ? [
        `x_1 = b - \\varphi(b - a) = ${r0.b} - 0.618034(${r0.b} - ${r0.a}) = ${r0.x1}`,
        `x_2 = a + \\varphi(b - a) = ${r0.a} + 0.618034(${r0.b} - ${r0.a}) = ${r0.x2}`,
      ] : ['x_1 = b - \\varphi(b - a), \\qquad x_2 = a + \\varphi(b - a)'],
    },
  ];
  if (r0) {
    steps.push({
      title: 'Compare f at the two points (step 1 in full)', depth: 0,
      text: `We want the ${goal === 'max' ? 'maximum' : 'minimum'}, so the point with the ${better} f is closer to it. The part beyond the other point is thrown away.`,
      lines: [`f(${r0.x1}) = ${r0.f1}, \\quad f(${r0.x2}) = ${r0.f2}`, `\\text{${better} at } ${r0.keep === '[a, x₂]' ? `x_1 \\Rightarrow \\text{keep } [a, x_2] = [${r0.a}, ${r0.x2}]` : `x_2 \\Rightarrow \\text{keep } [x_1, b] = [${r0.x1}, ${r0.b}]`}`],
    });
    steps.push({
      title: 'Reuse one point and repeat', depth: 0,
      text: 'Because 0.618 is the golden ratio, the point that survives is already at the right place in the new interval, so each step needs only one new function value. The table shows every step.',
      lines: [`\\text{The interval shrinks by } 0.618 \\text{ each step: after ${rows.length} steps its width is below } ${eps}`],
    });
  }
  steps.push({
    title: 'Result', depth: 0,
    text: `The ${goal === 'max' ? 'maximum' : 'minimum'} is taken as the middle of the final interval.`,
    lines: [`x^* \\approx \\frac{${r6(A)} + ${r6(B)}}{2} = ${r6(x)}, \\quad f(x^*) \\approx ${r6(fx)}`],
  });
  return {
    f: mtex(polish(node)), x: r6(x), fx: r6(fx), goal, iterations: rows.length, steps, rows,
    columns: [{ key: 'k', label: 'k', bold: true }, { key: 'a', label: 'a' }, { key: 'b', label: 'b' }, { key: 'x1', label: 'x₁' }, { key: 'x2', label: 'x₂' }, { key: 'f1', label: 'f(x₁)' }, { key: 'f2', label: 'f(x₂)' }, { key: 'keep', label: 'Keep', highlight: true }],
    notes: ['The method assumes f has a single minimum (or maximum) on [a, b].'], verified: true,
    plot: { fn: (t) => { try { return node.evaluate({ x: t }); } catch { return NaN; } }, points: [{ x, y: fx, label: goal }], view: { x0: readConstant(a, 'a'), x1: readConstant(b, 'b'), y0: Math.min(...[0, 0.25, 0.5, 0.75, 1].map((t) => F(readConstant(a, 'a') + t * (readConstant(b, 'b') - readConstant(a, 'a'))))), y1: Math.max(...[0, 0.25, 0.5, 0.75, 1].map((t) => F(readConstant(a, 'a') + t * (readConstant(b, 'b') - readConstant(a, 'a'))))) } },
  };
}
