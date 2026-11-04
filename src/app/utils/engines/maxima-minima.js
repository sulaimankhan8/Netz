/**
 * Local and absolute maxima and minima of y = f(x).
 *   1. f'(x), critical points (f' = 0 or undefined)
 *   2. second derivative test at each stationary point: f'' < 0 maximum, f'' > 0 minimum, f'' = 0 no decision
 *   3. first derivative test (the sign of f' just left and right) decides every point, including f'' = 0
 *      and corners where f' is undefined
 *   4. on a closed interval [a, b]: compare f at the end points and the critical points (absolute max/min)
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { signAnalysis, derivativeOf, readRange, valueAt } from '../symbolic/critical';
import { texOf } from '../symbolic/roots';

export function solve({ f: tf, a: ta = '', b: tb = '' }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no x here: a constant has no maxima or minima.');
  const v = vars[0];

  const range = readRange(node, ta, tb, readConstant);
  const s = signAnalysis(node, v, range);
  const d2 = derivativeOf(s.d, v);
  const d2Tex = tex(polish(d2)).trim();

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
    { title: 'Second derivative', lines: [`f''(${v}) = ${d2Tex}`] },
  ];

  // Classify each critical point where f itself is defined
  const points = [];
  s.cuts.forEach((c, i) => {
    const y = valueAt(node, v, c.x);
    if (!Number.isFinite(y)) return;
    const left = s.segments[i].sign, right = s.segments[i + 1].sign;
    const firstTest = left === 1 && right === -1 ? 'max' : left === -1 && right === 1 ? 'min' : 'neither';
    const second = c.kind === 'zero' ? valueAt(d2, v, c.x) : NaN;
    const secondTest = !Number.isFinite(second) ? null : Math.abs(second) < 1e-9 ? 'none' : second < 0 ? 'max' : 'min';
    points.push({ x: c.x, xTex: c.tex, y, yTex: texOf(y), kind: c.kind, second, secondTex: Number.isFinite(second) ? texOf(second) : null, secondTest, firstTest, type: firstTest });
  });
  const word = { max: '\\text{local maximum}', min: '\\text{local minimum}', neither: '\\text{neither (no change of sign)}' };
  steps.push({
    title: 'Test each critical point',
    formula: "f''(c) < 0 \\Rightarrow \\max, \\ f''(c) > 0 \\Rightarrow \\min",
    lines: points.length ? points.map((p) => {
      const sec = p.secondTest === 'max' ? `f''(${p.xTex}) = ${p.secondTex} < 0` : p.secondTest === 'min' ? `f''(${p.xTex}) = ${p.secondTex} > 0`
        : p.secondTest === 'none' ? `f''(${p.xTex}) = 0 \\text{ (no decision; sign of } f' \\text{ used)}` : `f' \\text{ undefined: sign of } f' \\text{ used}`;
      return `${v} = ${p.xTex}: \\ ${sec} \\ \\Rightarrow \\ ${word[p.type]}, \\ f(${p.xTex}) = ${p.yTex}`;
    }) : ['\\text{No critical points, so no local maxima or minima.}'],
  });

  // Absolute extremes on a closed interval
  let absolute = null;
  if (range.given) {
    const cand = [
      { x: range.lo, xTex: range.loTex, y: valueAt(node, v, range.lo), end: true },
      ...points.map((p) => ({ x: p.x, xTex: p.xTex, y: p.y })),
      { x: range.hi, xTex: range.hiTex, y: valueAt(node, v, range.hi), end: true },
    ].filter((c) => Number.isFinite(c.y));
    if (cand.length) {
      const maxY = Math.max(...cand.map((c) => c.y)), minY = Math.min(...cand.map((c) => c.y));
      const at = (y) => cand.filter((c) => Math.abs(c.y - y) <= 1e-9 * Math.max(1, Math.abs(y)));
      absolute = { max: { y: maxY, yTex: texOf(maxY), at: at(maxY).map((c) => c.xTex) }, min: { y: minY, yTex: texOf(minY), at: at(minY).map((c) => c.xTex) } };
      steps.push({
        title: 'Absolute maximum and minimum on the closed interval',
        formula: '\\text{compare } f \\text{ at the ends and the critical points}',
        lines: [
          cand.map((c) => `f(${c.xTex}) = ${texOf(c.y)}`).join(', \\quad '),
          `\\text{Absolute max } = ${absolute.max.yTex} \\text{ at } ${v} = ${absolute.max.at.join(', ')}; \\quad \\text{absolute min } = ${absolute.min.yTex} \\text{ at } ${v} = ${absolute.min.at.join(', ')}`,
        ],
      });
    }
  }

  const notes = [];
  if (s.range.defaulted) notes.push(`This function cannot be solved exactly, so NETZ searched for critical points on ${s.range.defaulted}. Enter an interval to look somewhere else.`);
  if (!range.given) notes.push('Enter a closed interval [a, b] to also get the absolute (global) maximum and minimum there.');

  return {
    variable: v, f: tex(polish(node)).trim(), derivative: s.dTex, second: d2Tex, steps, points, absolute,
    maxima: points.filter((p) => p.type === 'max'), minima: points.filter((p) => p.type === 'min'),
    range: s.range, exact: s.exact, verified: true,
    fAt: (x) => valueAt(node, v, x), result: points, notes, plot: null,
  };
}
