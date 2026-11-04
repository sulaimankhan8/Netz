/**
 * Where is f increasing or decreasing? (NCERT 12 "Application of Derivatives")
 *   1. f'(x)
 *   2. critical points: f'(x) = 0 or undefined
 *   3. sign of f' on each interval between them (one test value each)
 *   4. f' > 0: increasing; f' < 0: decreasing
 * Polynomials and fractions are solved exactly over all real numbers; other functions on an interval.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { signAnalysis, unionTex, readRange, valueAt } from '../symbolic/critical';

export function solve({ f: tf, a: ta = '', b: tb = '' }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no x here: a constant is neither increasing nor decreasing.');
  const v = vars[0];

  const s = signAnalysis(node, v, readRange(node, ta, tb, readConstant));
  const pts = (list) => list.map((p) => p.tex).join(', \\ ');
  const steps = [
    { title: 'Differentiate', lines: [`f'(${v}) = ${s.dTex}`] },
    {
      title: 'Find the critical points',
      formula: "f'(x) = 0 \\text{ or undefined}",
      lines: [
        s.zeros.length ? `f'(${v}) = 0 \\text{ at } ${v} = ${pts(s.zeros)}` : `f'(${v}) \\neq 0 \\text{ anywhere${s.range.given || s.range.defaulted ? ' in the interval' : ''}}`,
        ...(s.undefinedAt.length ? [`f'(${v}) \\text{ is undefined at } ${v} = ${pts(s.undefinedAt)}`] : []),
      ],
    },
  ];

  const sym = { 1: '+', '-1': '-', 0: '0' };
  const table = s.segments.map((g) => ({
    interval: `\\left(${g.loTex},\\ ${g.hiTex}\\right)`,
    test: g.testTex,
    value: g.sign === null ? '\\text{—}' : String(Number(g.dAtTest.toPrecision(4))),
    sign: g.sign === null ? '' : sym[g.sign],
    behaviour: g.sign === null ? 'not defined' : g.sign > 0 ? 'increasing ↗' : g.sign < 0 ? 'decreasing ↘' : 'constant',
  }));
  steps.push({
    title: 'Test the sign of f′ in each interval',
    lines: s.segments.map((g) => (g.sign === null
      ? `${v} \\in \\left(${g.loTex},\\ ${g.hiTex}\\right): \\ f \\text{ is not defined here}`
      : `${v} = ${g.testTex}: \\ f'(${g.testTex}) ${g.sign > 0 ? '> 0' : g.sign < 0 ? '< 0' : '= 0'} \\ \\Rightarrow \\ ${g.sign > 0 ? '\\text{increasing}' : g.sign < 0 ? '\\text{decreasing}' : '\\text{constant}'}`)),
  });

  const increasing = unionTex(s.segments, 1, s.cuts);
  const decreasing = unionTex(s.segments, -1, s.cuts);
  steps.push({
    title: 'Conclusion',
    lines: [
      increasing ? `\\text{Increasing on } ${increasing}` : '\\text{Never increasing}',
      decreasing ? `\\text{Decreasing on } ${decreasing}` : '\\text{Never decreasing}',
    ],
  });

  const notes = [];
  if (s.range.defaulted) notes.push(`This function cannot be solved exactly, so NETZ searched for critical points on ${s.range.defaulted}. Enter an interval to look somewhere else.`);
  if (!s.exact) notes.push('Critical points were found numerically; exact values (like π/4) are shown when NETZ recognises them.');

  return {
    variable: v, f: tex(polish(node)).trim(), derivative: s.dTex, steps, table, increasing, decreasing,
    criticalPoints: s.cuts.map((c) => ({ x: c.x, tex: c.tex, kind: c.kind, y: valueAt(node, v, c.x) })),
    range: s.range, exact: s.exact, verified: true,
    fAt: (x) => valueAt(node, v, x), result: { increasing, decreasing }, notes, plot: null,
  };
}
