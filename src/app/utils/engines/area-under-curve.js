/**
 * Area under a curve, and area between two curves.
 *   under y = f(x) from a to b:   split at the x-axis crossings in (a, b); each piece ∫ f dx is
 *                                 positive above the axis and negative below; area = sum of the sizes
 *   between y = f(x) and y = g(x): the same with h = f − g; with no limits, the curves' meeting
 *                                 points are used (first to last)
 * Each piece uses the step-by-step antiderivative when NETZ has one (checked by differentiating it),
 * else adaptive Simpson's rule. Values are exact (π, √2, ln 2 …) when recognised.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { math, parse, variablesOf, sub, paren, tex, polish } from '../symbolic/tree';
import { integrate } from '../symbolic/integral';
import { cleanest } from '../symbolic/present';
import { zerosOf, texOf } from '../symbolic/roots';
import { rationalParts } from '../symbolic/poly';
import { derivativeMatches, simpson } from './integral';

const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const limitTex = (t, value) => { try { return tex(polish(math.parse(String(t).trim().replace(/π/g, 'pi')))).trim(); } catch { return texOf(value); } };
const abs = (t) => (t.startsWith('-') ? t.slice(1).trim() : t);

export function solve({ mode = 'under', f: tf, g: tg = '', a: ta = '', b: tb = '' }) {
  if (!['under', 'between'].includes(mode)) throw new EngineError('Choose the area under a curve or between two curves.');
  const f = parse(tf, 'f(x)');
  const g = mode === 'between' ? parse(tg, 'g(x)') : null;
  const vars = [...new Set([...variablesOf(f), ...(g ? variablesOf(g) : [])])];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const h = g ? sub(paren(f), paren(g)) : f; // the height of the strip
  const hName = g ? 'f(x) - g(x)' : 'f(x)';
  const steps = [];

  // Limits: typed, or (between two curves) where they meet
  const has = (t) => String(t ?? '').trim() !== '';
  if (has(ta) !== has(tb)) throw new EngineError('Fill in both limits, or (for two curves) leave both empty to use where the curves meet.');
  let a, b, aTex, bTex;
  if (has(ta)) {
    a = readConstant(ta, 'The lower limit a'); b = readConstant(tb, 'The upper limit b');
    if (!(b > a)) throw new EngineError('The upper limit b must be bigger than the lower limit a.');
    aTex = limitTex(ta, a); bTex = limitTex(tb, b);
  } else {
    if (!g) throw new EngineError('Enter the limits a and b for the area under one curve.');
    if (!rationalParts(h, v)) throw new EngineError('NETZ can find where these curves meet only for polynomials and fractions. Please enter the limits a and b.');
    const meet = zerosOf(h, v, { lo: -Infinity, hi: Infinity }).zeros;
    if (meet.length < 2) throw new EngineError('These curves meet at fewer than two points, so they do not enclose a region. Enter the limits a and b.');
    a = meet[0].x; b = meet.at(-1).x; aTex = meet[0].tex; bTex = meet.at(-1).tex;
    steps.push({ title: 'Find where the curves meet', formula: 'f(x) = g(x)', lines: [`${tex(polish(f)).trim()} = ${tex(polish(g)).trim()}`, `${v} = ${meet.map((m) => m.tex).join(', \\ ')}`] });
  }

  // h must be defined on the whole interval
  for (let k = 0; k <= 400; k++) {
    const x = a + ((b - a) * k) / 400;
    if (!Number.isFinite(valueAt(h, v, x))) throw new EngineError(`The ${g ? 'curves are' : 'curve is'} not defined at ${v} ≈ ${Number(x.toPrecision(4))}, inside the interval. Choose limits where ${g ? 'both are' : 'it is'} defined.`);
  }

  // Where does the strip change sign inside (a, b)?
  const cross = zerosOf(h, v, { lo: a, hi: b }).zeros.filter((p) => p.x > a + 1e-9 && p.x < b - 1e-9);
  if (cross.length) {
    steps.push({
      title: g ? 'Find where the curves cross inside the interval' : 'Find where the curve crosses the x-axis',
      lines: [`${hName} = 0 \\text{ at } ${v} = ${cross.map((c) => c.tex).join(', \\ ')}`, '\\text{Integrate each piece separately: a piece below counts negative.}'],
    });
  }

  // Antiderivative (step by step), or numbers
  let F = null;
  try {
    const r = integrate(h, v);
    F = cleanest(r.result, v, (G) => derivativeMatches(G, h, v, {}));
  } catch { F = null; }
  if (F) steps.push({ title: `Antiderivative of ${g ? 'f − g' : 'f'}`, lines: [`\\int \\left(${tex(polish(h)).trim()}\\right) d${v} = ${tex(polish(F)).trim()}`] });

  const edges = [{ x: a, tex: aTex }, ...cross, { x: b, tex: bTex }];
  const pieces = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    const [L, R] = [edges[i], edges[i + 1]];
    let val = F ? valueAt(F, v, R.x) - valueAt(F, v, L.x) : NaN;
    const numeric = simpson((x) => valueAt(h, v, x), L.x, R.x);
    const exact = Number.isFinite(val) && Math.abs(val - numeric) <= 1e-6 * Math.max(1, Math.abs(numeric));
    if (!exact) val = numeric;
    pieces.push({ lo: L, hi: R, value: val, valueTex: texOf(val), exact });
  }
  steps.push({
    title: 'Integrate each piece',
    lines: pieces.map((p) => `\\int_{${p.lo.tex}}^{${p.hi.tex}} \\left(${g ? 'f - g' : 'f'}\\right) d${v} = ${p.valueTex}${p.exact ? '' : ' \\ \\text{(numerical)}'}`),
  });
  const area = pieces.reduce((s, p) => s + Math.abs(p.value), 0);
  const areaTex = texOf(area);
  steps.push({
    title: 'Add the sizes',
    lines: [`\\text{Area} = ${pieces.map((p) => `\\left|${p.valueTex}\\right|`).join(' + ')} = ${pieces.length > 1 ? `${pieces.map((p) => abs(p.valueTex)).join(' + ')} = ` : ''}${areaTex}${/^-?(\d+|\\frac\{\d+\}\{\d+\})$/.test(areaTex) || !/[a-z\\]/.test(areaTex) ? '' : ` \\approx ${Number(area.toPrecision(6))}`}`],
  });

  return {
    mode, variable: v, f: tex(polish(f)).trim(), g: g ? tex(polish(g)).trim() : null,
    a, b, aTex, bTex, crossings: cross, pieces, area, areaTex, exact: pieces.every((p) => p.exact),
    steps, verified: true, fAt: (x) => valueAt(f, v, x), gAt: g ? (x) => valueAt(g, v, x) : null,
    result: area, notes: pieces.every((p) => p.exact) ? [] : ['Some pieces have no step-by-step antiderivative in NETZ yet, so their values are numerical (adaptive Simpson’s rule, about 9 correct digits).'],
    plot: null,
  };
}
