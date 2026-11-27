/**
 * The Fundamental Theorem of Calculus: the maths for /fundamental-theorem-of-calculus. Two modes:
 *   evaluate:   Part 2. ∫ₐᵇ f(x) dx = F(b) − F(a), where F′ = f
 *   derivative: Part 1. d/dx ∫ from a(x) to b(x) of h(t) dt = h(b(x))·b′(x) − h(a(x))·a′(x)
 * Evaluate uses the integral engine. For derivative, every answer is compared with a numerical derivative of the integral.
 */
import { EngineError } from '../numeric/steps';
import { solve as integral, simpson } from './integral';
import { valueOf } from './definite-helpers';
import { parse, variablesOf, tex, text, polish, tidy, bestForm, unwrap, mul, sub, isConstantIn } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';

const replace = (node, name, by) => node.transform((n) => (n.isSymbolNode && n.name === name ? by : n));
const wrap = (node) => {
  const n = unwrap(node);
  return n.isSymbolNode || (n.isConstantNode && n.value >= 0) ? tex(n) : `\\left(${tex(polish(n))}\\right)`;
};

function evaluateMode({ f, a, b }) {
  const r = integral({ f, kind: 'definite', a, b });
  const steps = [
    {
      title: 'The theorem (Part 2)',
      text: 'To find the area under f from a to b, find any antiderivative F (a function whose derivative is f), then subtract: the value at the top minus the value at the bottom.',
      formula: '\\int_a^b f(x)\\,dx = F(b) - F(a), \\quad F\'(x) = f(x)',
      lines: [`f(${r.variable}) = ${r.f}, \\quad a = ${r.a.tex}, \\quad b = ${r.b.tex}`],
    },
    {
      title: 'Find an antiderivative F',
      text: 'Integrate f. The constant +C is not needed: it would cancel in F(b) − F(a).',
      lines: r.found ? [`F(${r.variable}) = ${r.answer}`] : ['\\text{NETZ found no closed form: the value below is numerical}'],
    },
    ...(r.found ? r.steps.filter((s) => !/^Check by differentiating/.test(s.title)).map((s) => ({ ...s, depth: 1 })) : []),
    {
      title: 'Put in the limits and subtract',
      text: 'F(b) − F(a): the upper limit first, then the lower, then subtract.',
      formula: 'F(b) - F(a)',
      lines: r.evaluation.length ? r.evaluation : [`\\int_{${r.a.tex}}^{${r.b.tex}} ${r.f}\\,d${r.variable} \\approx ${r.valueTex}`],
    },
  ];
  return {
    mode: 'evaluate', variable: r.variable, f: r.f, a: r.a.tex, b: r.b.tex, F: r.found ? r.answer : null,
    value: r.value, valueTex: r.valueTex, exact: r.exact, verified: r.verified, steps, notes: r.notes, result: r.value, plot: null,
    fAt: r.fAt, plotRange: [Math.min(r.a.value, r.b.value), Math.max(r.a.value, r.b.value)],
  };
}

function derivativeMode({ h: th, lo: tlo = '0', up: tup }) {
  const H = parse(th, 'the integrand h(t)');
  const hv = [...variablesOf(H)];
  if (hv.includes('x') && !hv.includes('t')) throw new EngineError('Write the integrand in t (the letter being integrated), for example sqrt(1 + t^2). The limits use x.');
  if (hv.length > 1 || (hv.length === 1 && hv[0] !== 't')) throw new EngineError('The integrand may only use t.');
  const U = parse(tup, 'the upper limit');
  const Lo = parse(tlo || '0', 'the lower limit');
  for (const n of [U, Lo]) {
    const w = [...variablesOf(n)].filter((s) => s !== 'x');
    if (w.length) throw new EngineError(`The limits may only use x (found ${w.join(', ')}).`);
  }
  if (isConstantIn(U, 'x') && isConstantIn(Lo, 'x')) throw new EngineError('Both limits are numbers, so the integral is a constant and its derivative is 0. Put x in at least one limit.');

  const dU = differentiate(U, 'x'), dLo = differentiate(Lo, 'x');
  const du = bestForm(dU.result), dlo = bestForm(dLo.result);
  const hU = tidy(replace(H, 't', unwrap(U))), hLo = tidy(replace(H, 't', unwrap(Lo)));
  const loConst = isConstantIn(Lo, 'x');
  const raw = loConst ? mul(hU, du) : sub(mul(hU, du), mul(hLo, dlo));
  const answer = bestForm(tidy(raw));

  // Check against a numerical derivative of the integral itself
  const G = (x) => simpson((t) => valueOf(H, { t }), valueOf(Lo, { x }), valueOf(U, { x }), 1e-11);
  let compared = 0, ok = true;
  for (const x of [0.6, 1.1, 1.7, 2.4]) {
    const d = 1e-4 * Math.max(1, Math.abs(x));
    const g1 = G(x + d), g0 = G(x - d), mine = valueOf(answer, { x });
    if (![g1, g0, mine].every(Number.isFinite)) continue;
    compared++;
    if (Math.abs((g1 - g0) / (2 * d) - mine) > 1e-4 * Math.max(1, Math.abs(mine))) ok = false;
  }
  const verified = compared >= 2 && ok;

  const steps = [
    {
      title: 'The theorem (Part 1)',
      text: 'Differentiating an integral undoes the integration. Put the upper limit into the integrand, multiply by the derivative of the upper limit; do the same for the lower limit and subtract.',
      formula: '\\frac{d}{dx}\\int_{a(x)}^{b(x)} h(t)\\,dt = h(b(x))\\,b\'(x) - h(a(x))\\,a\'(x)',
      lines: [`h(t) = ${tex(polish(H))}, \\quad b(x) = ${tex(polish(U))}, \\quad a(x) = ${tex(polish(Lo))}`],
    },
    {
      title: 'Differentiate the limits',
      text: 'A limit that is just a number has derivative 0, so its term disappears.',
      lines: [`b'(x) = ${tex(polish(du))}`, `a'(x) = ${tex(polish(dlo))}`],
    },
    {
      title: 'Put each limit into h',
      text: 'Replace t by the upper limit, and by the lower limit.',
      lines: [`h(b(x)) = ${tex(polish(hU))}`, ...(loConst ? [] : [`h(a(x)) = ${tex(polish(hLo))}`])],
    },
    {
      title: 'Put the pieces into the theorem',
      formula: 'h(b)\\,b\' - h(a)\\,a\'',
      lines: [loConst ? `${wrap(hU)}\\cdot ${wrap(du)}` : `${wrap(hU)}\\cdot ${wrap(du)} - ${wrap(hLo)}\\cdot ${wrap(dlo)}`],
    },
    {
      title: 'Simplify',
      lines: [`\\frac{d}{dx}\\int_{${tex(polish(Lo))}}^{${tex(polish(U))}} ${tex(polish(H))}\\,dt = ${tex(polish(answer))}`],
    },
  ];
  return {
    mode: 'derivative', variable: 'x', f: tex(polish(H)), answer: tex(polish(answer)), answerText: text(answer), verified, steps,
    notes: verified ? ['NETZ compared this with a numerical derivative of the integral. They agree.'] : ['NETZ could not confirm this numerically. Treat it with care.'],
    result: text(answer), plot: null,
  };
}

export function solve({ mode = 'evaluate', ...input }) {
  if (mode === 'evaluate') return evaluateMode(input);
  if (mode === 'derivative') return derivativeMode(input);
  throw new EngineError('Choose "Find the area (Part 2)" or "Differentiate an integral (Part 1)".');
}
