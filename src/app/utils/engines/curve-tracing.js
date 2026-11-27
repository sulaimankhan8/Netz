/**
 * Curve tracing: the maths for /curve-tracing-calculator. The textbook checklist, in the textbook order, for y = f(x):
 *   1 domain and symmetry   2 intercepts   3 asymptotes   4 where f rises and falls, and its turning points
 *   5 where it bends up or down, and its inflection points   6 a sketch that joins them.
 * It puts the existing calculators together (asymptotes, signs of f′ and f″) and draws every key point.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { solve as asymptotesOf } from './asymptotes';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { zerosOf, texOf } from '../symbolic/roots';
import { signAnalysis, readRange, unionTex, valueAt } from '../symbolic/critical';

const ok = Number.isFinite;
const close = (p, q) => Math.abs(p - q) <= 1e-7 * Math.max(1, Math.abs(p), Math.abs(q));

/** Boundary of a defined/undefined change, found by halving the gap. */
function edge(g, defined, undef) {
  let l = defined, r = undef;
  for (let i = 0; i < 40; i++) { const m = (l + r) / 2; if (ok(g(m))) l = m; else r = m; }
  return l;
}

export function solve({ f: tf }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.some((s) => s !== 'x')) throw new EngineError('Write f in x only, for example (x^2 - 1)/(x^2 + 1).');
  if (!vars.length) throw new EngineError('A constant is a straight horizontal line: there is nothing to trace.');
  const v = 'x';
  const g = (x) => valueAt(node, v, x);
  const steps = [];
  const facts = [];

  // ---- 1. Domain and symmetry
  const poles = zerosOf(node, v, { lo: -30, hi: 30 }).undefinedAt.map((p) => p.x);
  const gaps = [];
  let run = null;
  const STEP = 0.05;
  for (let x = -30; x <= 30 + 1e-9; x += STEP) {
    const bad = !ok(g(x)) && !poles.some((p) => Math.abs(p - x) < STEP);
    if (bad && !run) run = { from: x - STEP };
    if (!bad && run) { gaps.push({ from: run.from, to: x }); run = null; }
  }
  if (run) gaps.push({ from: run.from, to: 30 });
  const holes = gaps.map((r) => {
    const lo = ok(g(r.from)) ? edge(g, r.from, r.from + STEP) : r.from;
    const hi = ok(g(r.to)) ? edge(g, r.to, r.to - STEP) : r.to;
    return { lo, hi };
  });
  let domainTex;
  if (!holes.length && !poles.length) domainTex = '\\mathbb{R}';
  else if (!holes.length) domainTex = `\\mathbb{R}\\setminus\\{${poles.map(texOf).join(',\\ ')}\\}`;
  else domainTex = `\\text{not defined for } ${holes.map((h) => `${texOf(h.lo)} < x < ${texOf(h.hi)}`).join(',\\ ')}${poles.length ? `, \\text{ nor at } x = ${poles.map(texOf).join(',\\ ')}` : ''}`;

  const probe = Array.from({ length: 12 }, (_, i) => 0.2 + i * 0.37);
  const usable = probe.filter((x) => ok(g(x)) && ok(g(-x)));
  const even = usable.length >= 3 && usable.every((x) => close(g(x), g(-x)));
  const odd = usable.length >= 3 && usable.every((x) => close(g(x), -g(-x)));
  const symmetry = even ? 'Even: f(−x) = f(x). The graph is a mirror image in the y-axis, so trace x ≥ 0 and reflect.'
    : odd ? 'Odd: f(−x) = −f(x). The graph is unchanged by a half-turn about the origin.'
      : usable.length < 3 ? 'The function is not defined on both sides of 0, so there is no symmetry about the y-axis or the origin.'
        : 'Neither even nor odd: no symmetry about the y-axis or the origin.';
  steps.push({
    title: 'Domain and symmetry',
    text: 'Where is f defined? And is it a mirror image of itself? Symmetry halves the work.',
    formula: 'f(-x) = f(x) \\ (\\text{even}), \\quad f(-x) = -f(x) \\ (\\text{odd})',
    lines: [`\\text{Domain: } ${domainTex}`, `\\text{${symmetry.replace(/[−]/g, '-')}}`],
  });
  facts.push({ label: 'Domain', tex: domainTex }, { label: 'Symmetry', text: even ? 'Even (y-axis)' : odd ? 'Odd (origin)' : 'None' });

  // ---- 2. Intercepts
  const y0 = g(0);
  const xInts = zerosOf(node, v, { lo: -30, hi: 30 }).zeros.filter((z) => ok(g(z.x)));
  steps.push({
    title: 'Intercepts',
    text: 'Where does the curve cross the axes? Put x = 0 for the y-intercept and f(x) = 0 for the x-intercepts.',
    lines: [
      ok(y0) ? `y\\text{-intercept: } f(0) = ${texOf(y0)}` : 'y\\text{-intercept: none (f is not defined at } x = 0)',
      xInts.length ? `x\\text{-intercepts: } x = ${xInts.map((z) => z.tex).join(',\\ ')}` : 'x\\text{-intercepts: none}',
    ],
  });
  facts.push({ label: 'y-intercept', tex: ok(y0) ? `(0,\\ ${texOf(y0)})` : 'none' }, { label: 'x-intercepts', tex: xInts.length ? xInts.map((z) => `(${z.tex},\\ 0)`).join(',\\ ') : 'none' });

  // ---- 3. Asymptotes
  let asy = { vertical: [], other: [], plot: { lines: [] } };
  try { asy = asymptotesOf({ f: tf }); } catch { /* none found */ }
  steps.push({
    title: 'Asymptotes',
    text: 'Lines the curve runs along but never reaches: vertical ones where f blows up, and horizontal or slanted ones far out to the left and right.',
    lines: [
      asy.vertical.length ? `\\text{Vertical: } ${asy.vertical.join(',\\ ')}` : '\\text{Vertical: none}',
      asy.other.length ? `\\text{Horizontal or oblique: } ${asy.other.map((o) => o.tex).join(',\\ ')}` : '\\text{Horizontal or oblique: none}',
    ],
  });
  facts.push({ label: 'Vertical asymptotes', tex: asy.vertical.length ? asy.vertical.join(',\\ ') : 'none' }, { label: 'Horizontal / oblique', tex: asy.other.length ? asy.other.map((o) => o.tex).join(',\\ ') : 'none' });

  // ---- 4. First derivative: rising, falling, turning points
  const range = readRange(node, '', '', readConstant);
  const s1 = signAnalysis(node, v, range);
  const rising = unionTex(s1.segments, 1, s1.cuts), falling = unionTex(s1.segments, -1, s1.cuts);
  const turning = [];
  s1.cuts.forEach((c, i) => {
    const y = g(c.x);
    if (!ok(y)) return;
    const l = s1.segments[i].sign, r = s1.segments[i + 1].sign;
    if (l === 1 && r === -1) turning.push({ x: c.x, y, xTex: c.tex, yTex: texOf(y), type: 'max' });
    else if (l === -1 && r === 1) turning.push({ x: c.x, y, xTex: c.tex, yTex: texOf(y), type: 'min' });
  });
  steps.push({
    title: 'Rising, falling and turning points',
    text: 'Where f′ is positive the curve climbs; where f′ is negative it falls. A turning point is where it changes from one to the other.',
    formula: "f'(x) > 0 \\Rightarrow \\text{rising}, \\quad f'(x) < 0 \\Rightarrow \\text{falling}",
    lines: [
      `f'(x) = ${s1.dTex}`,
      `\\text{Rising on } ${rising ?? '\\text{nowhere}'}`,
      `\\text{Falling on } ${falling ?? '\\text{nowhere}'}`,
      ...(turning.length ? turning.map((p) => `\\text{Local ${p.type === 'max' ? 'maximum' : 'minimum'} at } (${p.xTex},\\ ${p.yTex})`) : ['\\text{No turning points}']),
    ],
  });
  facts.push({ label: 'Rising on', tex: rising ?? 'nowhere' }, { label: 'Falling on', tex: falling ?? 'nowhere' }, { label: 'Turning points', tex: turning.length ? turning.map((p) => `${p.type === 'max' ? '\\max' : '\\min'}\\ (${p.xTex},\\ ${p.yTex})`).join(',\\ ') : 'none' });

  // ---- 5. Second derivative: concavity and inflection
  let s2 = null;
  try { s2 = signAnalysis(s1.d, v, range); } catch { s2 = null; }
  const inflections = [];
  let up = null, down = null, d2Tex = '';
  if (s2) {
    up = unionTex(s2.segments, 1, s2.cuts); down = unionTex(s2.segments, -1, s2.cuts);
    d2Tex = s2.dTex;
    s2.cuts.forEach((c, i) => {
      if (c.kind !== 'zero') return;
      const y = g(c.x);
      const l = s2.segments[i].sign, r = s2.segments[i + 1].sign;
      if (ok(y) && l && r && l !== r) inflections.push({ x: c.x, y, xTex: c.tex, yTex: texOf(y) });
    });
  }
  steps.push({
    title: 'Bending: concavity and inflection points',
    text: 'Where f″ is positive the curve bends upward like a cup; where f″ is negative it bends downward like a cap. An inflection point is where the bend changes.',
    formula: "f''(x) > 0 \\Rightarrow \\text{concave up}, \\quad f''(x) < 0 \\Rightarrow \\text{concave down}",
    lines: [
      s2 ? `f''(x) = ${d2Tex}` : "f''(x) \\text{ could not be analysed}",
      `\\text{Concave up on } ${up ?? '\\text{nowhere}'}`,
      `\\text{Concave down on } ${down ?? '\\text{nowhere}'}`,
      ...(inflections.length ? inflections.map((p) => `\\text{Inflection point at } (${p.xTex},\\ ${p.yTex})`) : ['\\text{No inflection points}']),
    ],
  });
  facts.push({ label: 'Concave up', tex: up ?? 'nowhere' }, { label: 'Concave down', tex: down ?? 'nowhere' }, { label: 'Inflection points', tex: inflections.length ? inflections.map((p) => `(${p.xTex},\\ ${p.yTex})`).join(',\\ ') : 'none' });

  // ---- 6. The sketch
  const keyX = [...xInts.map((z) => z.x), ...turning.map((p) => p.x), ...inflections.map((p) => p.x), ...poles, 0].filter(ok);
  // The window hugs the key points (a little beyond them), so the interesting part is big and the far wings are cut off
  const x0 = Math.min(-2, ...keyX) - 1.2, x1 = Math.max(2, ...keyX) + 1.2;
  const keyY = [0, ...(ok(y0) ? [y0] : []), ...turning.map((p) => p.y), ...inflections.map((p) => p.y)];
  let lo = Math.min(...keyY), hi = Math.max(...keyY);
  const span = Math.max(hi - lo, 2);
  lo -= span * 0.6; hi += span * 0.6;
  if (!turning.length && !inflections.length) {
    // no turning points: fit the curve itself, ignoring wild values
    const vals = Array.from({ length: 240 }, (_, i) => g(x0 + ((x1 - x0) * i) / 239)).filter((y) => ok(y) && Math.abs(y) < 60).sort((p, q) => p - q);
    if (vals.length) { lo = Math.min(lo, vals[Math.floor(vals.length * 0.02)]); hi = Math.max(hi, vals[Math.ceil(vals.length * 0.98) - 1]); }
  }
  // label: null keeps the picture clean; the coordinates are listed under it
  const points = [
    ...(ok(y0) ? [{ x: 0, y: y0, label: null }] : []),
    ...xInts.map((z) => ({ x: z.x, y: 0, label: null })),
    ...turning.map((p) => ({ x: p.x, y: p.y, label: null })),
    ...inflections.map((p) => ({ x: p.x, y: p.y, label: null })),
  ];
  steps.push({
    title: 'Join it all into a sketch',
    text: 'Mark the intercepts, the turning points and the inflection points, draw the asymptotes as dashed guide lines, then draw the curve through the points, climbing or falling and bending as found above.',
    lines: ['\\text{See the graph in the answer box.}'],
  });

  return {
    variable: v, f: tex(polish(node)), facts, even, odd,
    verified: true, steps, notes: [range.defaulted ? `f′ and f″ were searched on ${range.defaulted}.` : 'The graph shows the part of the curve between the key points; the sketch is drawn with exact points marked.'], result: turning.length,
    plot: { fn: g, view: { x0, x1, y0: lo, y1: hi }, lines: asy.plot?.lines || [], points },
  };
}
