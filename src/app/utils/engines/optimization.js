/**
 * Optimisation word problems: the maths for /optimization-problems (catalog 6C). Each template (decision D7) turns
 * the story into one function f(x) on an interval; then f′(x) = 0, the second-derivative test, and the end points
 * when the interval is closed. A "your own function" template takes f(x) and an interval directly.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { zerosOf } from '../symbolic/roots';

const N = (v, label) => { const x = Number(String(v).trim()); if (!Number.isFinite(x) || x <= 0) throw new EngineError(`${label} must be a positive number.`); return x; };

export const TEMPLATES = {
  box: { title: 'Open box from a square sheet', goal: 'max', fields: [['a', 'Side of the sheet', '12']], make: (v) => { const a = N(v.a, 'The side'); return { f: `x*(${a} - 2x)^2`, lo: 0, hi: a / 2, setup: `\\text{Cut squares of side } x \\text{ from the corners: } V = x(${a} - 2x)^2, \\ 0 < x < ${exactTex(a / 2)}`, what: 'the volume' }; } },
  boxRect: { title: 'Open box from a rectangular sheet', goal: 'max', fields: [['a', 'Length', '16'], ['b', 'Width', '10']], make: (v) => { const a = N(v.a, 'The length'), b = N(v.b, 'The width'); return { f: `x*(${a} - 2x)*(${b} - 2x)`, lo: 0, hi: Math.min(a, b) / 2, setup: `V = x(${a} - 2x)(${b} - 2x), \\ 0 < x < ${exactTex(Math.min(a, b) / 2)}`, what: 'the volume' }; } },
  river: { title: 'Fence a field along a river (3 sides)', goal: 'max', fields: [['P', 'Fencing available (m)', '400']], make: (v) => { const P = N(v.P, 'The fencing'); return { f: `x*(${P} - 2x)`, lo: 0, hi: P / 2, setup: `\\text{Two sides } x, \\text{ the side opposite the river } ${P} - 2x: \\ A = x(${P} - 2x)`, what: 'the area' }; } },
  can: { title: 'Cylinder of given volume, least surface (closed)', goal: 'min', fields: [['V', 'Volume', '1000']], make: (v) => { const V = N(v.V, 'The volume'); return { f: `2*pi*x^2 + 2*${V}/x`, lo: 0, hi: Infinity, setup: `h = \\frac{${V}}{\\pi x^2} \\ (x = \\text{radius}) \\Rightarrow S = 2\\pi x^2 + 2\\pi x h = 2\\pi x^2 + \\frac{${2 * V}}{x}`, what: 'the surface area' }; } },
  semicircle: { title: 'Largest rectangle in a semicircle', goal: 'max', fields: [['R', 'Radius', '5']], make: (v) => { const R = N(v.R, 'The radius'); return { f: `2x*sqrt(${R * R} - x^2)`, lo: 0, hi: R, setup: `\\text{Corners at } (\\pm x, \\sqrt{${R * R} - x^2}): \\ A = 2x\\sqrt{${R * R} - x^2}, \\ 0 < x < ${exactTex(R)}`, what: 'the area' }; } },
  window: { title: 'Norman window of given perimeter, most light', goal: 'max', fields: [['P', 'Perimeter', '10']], make: (v) => { const P = N(v.P, 'The perimeter'); return { f: `2x*(${P} - 2x - pi*x)/2 + pi*x^2/2`, lo: 0, hi: P / (2 + Math.PI), setup: `\\text{Width } 2x, \\text{ height } h: \\ ${P} = 2x + 2h + \\pi x \\Rightarrow A = 2xh + \\frac{\\pi x^2}{2} = x(${P} - 2x - \\pi x) + \\frac{\\pi x^2}{2}`, what: 'the area' }; } },
  numbers: { title: 'Two numbers with a given sum, largest product', goal: 'max', fields: [['S', 'Their sum', '20']], make: (v) => { const S = N(v.S, 'The sum'); return { f: `x*(${S} - x)`, lo: 0, hi: S, setup: `P = x(${S} - x)`, what: 'the product' }; } },
  custom: { title: 'Your own function', goal: 'both', fields: [['f', 'f(x)', 'x^3 - 6x^2 + 9x + 1'], ['lo', 'From x =', '0'], ['hi', 'To x =', '4']], make: (v) => { const lo = Number(v.lo), hi = Number(v.hi); if (!(Number.isFinite(lo) && Number.isFinite(hi) && hi > lo)) throw new EngineError('Give an interval with from < to.'); return { f: v.f, lo, hi, closed: true, setup: `f(x) = ${String(v.f)}, \\ ${lo} \\le x \\le ${hi}`, what: 'f' }; } },
};

export function solve(v) {
  const T = TEMPLATES[v.template];
  if (!T) throw new EngineError('Choose a problem.');
  const m = T.make(v);
  const f = parse(m.f, 'f(x)');
  if ([...variablesOf(f)].some((w) => w !== 'x')) throw new EngineError('Write f in x only.');
  const d1 = tidyMulti(math.derivative(f, 'x'), ['x']), d2 = tidyMulti(math.derivative(d1, 'x'), ['x']);
  const hi = Number.isFinite(m.hi) ? m.hi : 1e4;
  const crit = zerosOf(d1, 'x', { lo: m.lo, hi }).zeros.filter((p) => p.x > m.lo + 1e-12 && p.x < hi - 1e-12);
  const fx = (x) => f.evaluate({ x });
  const steps = [
    { title: 'Set up the function', depth: 0, lines: [m.setup] },
    { title: 'Differentiate', depth: 0, lines: [`f'(x) = ${mtex(d1)}, \\qquad f''(x) = ${mtex(d2)}`] },
    { title: 'Critical points', depth: 0, lines: [crit.length ? `f'(x) = 0 \\Rightarrow x = ${crit.map((p) => p.tex).join(', ')}` : '\\text{no critical points inside the interval}'] },
  ];
  const cands = crit.map((p) => { const s = d2.evaluate({ x: p.x }); return { x: p.x, tex: p.tex, fx: fx(p.x), kind: s < 0 ? 'max' : s > 0 ? 'min' : 'test fails', s }; });
  cands.forEach((c) => steps.push({ title: `At x = ${c.tex.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{([^}]*)\}/g, '√$1')}`, depth: 1, lines: [`f''(${c.tex}) = ${exactTex(c.s)} ${c.s < 0 ? '< 0 \\Rightarrow \\text{maximum}' : c.s > 0 ? '> 0 \\Rightarrow \\text{minimum}' : '= 0'}, \\quad f = ${exactTex(c.fx)}`] }));
  if (m.closed) [m.lo, m.hi].forEach((x) => cands.push({ x, tex: exactTex(x), fx: fx(x), kind: 'end' }));
  if (!cands.length) throw new EngineError('No critical point was found in the interval.');
  const pickMax = T.goal === 'max' || T.goal === 'both';
  const best = T.goal === 'min' ? cands.reduce((a, b) => (b.fx < a.fx ? b : a)) : cands.reduce((a, b) => (b.fx > a.fx ? b : a));
  const worst = cands.reduce((a, b) => (b.fx < a.fx ? b : a));
  const answer = T.goal === 'both'
    ? `\\max = ${exactTex(best.fx)} \\text{ at } x = ${best.tex}, \\quad \\min = ${exactTex(worst.fx)} \\text{ at } x = ${worst.tex}`
    : `${pickMax ? '\\max' : '\\min'}\\ ${m.what === 'f' ? 'f' : `\\text{(${m.what})}`} = ${exactTex(best.fx)} \\text{ at } x = ${best.tex}`;
  steps.push({ title: 'Answer', depth: 0, lines: [answer] });
  return { title: T.title, f: mtex(polish(f)), answer, steps, notes: m.closed ? ['On a closed interval the end points are compared too.'] : [], verified: true };
}
