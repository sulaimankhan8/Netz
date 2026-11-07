/**
 * Volume of revolution: the maths for /volume-of-revolution (catalog 6F).
 * The region between y = f(x) (top) and y = g(x) (bottom, 0 if empty) for a ≤ x ≤ b is turned about:
 *   the x-axis or y = k  →  washers: V = π∫ₐᵇ (R² − r²) dx, R and r the distances of the curves from the axis
 *   the y-axis or x = k  →  shells:  V = 2π∫ₐᵇ |x − k| (f − g) dx
 * Without a and b, the limits are where the curves meet. The integral is done step by step when it can be.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, sub, mul, pow, paren, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { definite, gaussLegendre } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { zerosOf } from '../symbolic/roots';

const evalAt = (node, x) => { try { const y = node.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const numOr = (t, label) => { const s = String(t ?? '').trim(); if (!s) return null; const v = math.evaluate(s.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label} must be a number.`); return v; };

export function solve({ f, g = '', a = '', b = '', axis = 'x', k = '0' }) {
  const F = parse(f, 'f(x)');
  const G = String(g).trim() ? parse(g, 'g(x)') : num(0);
  if ([...variablesOf(F), ...variablesOf(G)].some((v) => v !== 'x')) throw new EngineError('Write the curves in x only.');
  const kv = axis === 'x' || axis === 'y' ? 0 : numOr(k, 'k') ?? 0;
  let A = numOr(a, 'a'), B = numOr(b, 'b');
  const steps = [];
  if (A === null || B === null) {
    const z = zerosOf(sub(F, G), 'x', { lo: -50, hi: 50 }).zeros.map((p) => p.x).sort((p, q) => p - q);
    if (z.length < 2) throw new EngineError('Give the limits a and b (the curves don\'t meet twice).');
    A = A ?? z[0]; B = B ?? z.at(-1);
    steps.push({ title: 'Where the curves meet', depth: 0, lines: [`${mtex(polish(F))} = ${mtex(polish(G))} \\Rightarrow x = ${exactTex(A)}, \\ ${exactTex(B)}`] });
  }
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  // Which curve is on top
  const mids = [0.2, 0.5, 0.8].map((t) => A + (B - A) * t);
  let top = F, bot = G;
  if (mids.every((x) => evalAt(F, x) < evalAt(G, x))) [top, bot] = [G, F];
  if (mids.some((x) => evalAt(top, x) < evalAt(bot, x) - 1e-12)) throw new EngineError('The curves cross between a and b: split the region at the crossing.');
  const X = sym('x');
  let integrand, formula, lines;
  const aroundHorizontal = axis === 'x' || axis === 'y=k';
  if (aroundHorizontal) {
    const above = mids.every((x) => evalAt(bot, x) >= kv - 1e-12), below = mids.every((x) => evalAt(top, x) <= kv + 1e-12);
    if (!above && !below) throw new EngineError('The axis passes through the region; choose an axis outside it.');
    const R = above ? sub(top, numNode(kv)) : sub(numNode(kv), bot);
    const r = above ? sub(bot, numNode(kv)) : sub(numNode(kv), top);
    const rZero = mids.every((x) => Math.abs(evalAt(r, x)) < 1e-12);
    integrand = tidyMulti(mul(sym('pi'), rZero ? pow(paren(R), num(2)) : sub(pow(paren(R), num(2)), pow(paren(r), num(2)))), ['x']);
    formula = rZero ? 'V = \\pi\\int_a^b R^2\\,dx' : 'V = \\pi\\int_a^b (R^2 - r^2)\\,dx';
    lines = [`R = ${mtex(polish(tidyMulti(R, ['x'])))}${rZero ? '' : `, \\quad r = ${mtex(polish(tidyMulti(r, ['x'])))}`}`];
  } else {
    const right = mids.every((x) => x >= kv - 1e-12), left = mids.every((x) => x <= kv + 1e-12);
    if (!right && !left) throw new EngineError('The axis passes through the region; choose an axis outside it.');
    const rad = right ? sub(X, numNode(kv)) : sub(numNode(kv), X);
    integrand = tidyMulti(mul(mul(num(2), sym('pi')), mul(paren(rad), paren(sub(top, bot)))), ['x']);
    formula = 'V = 2\\pi\\int_a^b (\\text{radius})(\\text{height})\\,dx';
    lines = [`\\text{radius} = ${mtex(polish(tidyMulti(rad, ['x'])))}, \\quad \\text{height} = ${mtex(polish(tidyMulti(sub(top, bot), ['x'])))}`];
  }
  steps.push({ title: aroundHorizontal ? 'Washer (disc) method' : 'Shell method', formula, depth: 0, lines });
  let valueTex, value;
  try {
    const d = definite(integrand, 'x', numNode(A), numNode(B), ['x']);
    steps.push({ title: 'Integrate', depth: 0, lines: d.lines });
    d.steps.forEach((s) => steps.push(s));
    value = d.number; valueTex = d.valueTex;
  } catch (e) {
    if (e.name !== 'EngineError') throw e;
    const { xs, ws } = gaussLegendre(48);
    const c = (A + B) / 2, h = (B - A) / 2;
    value = xs.reduce((s, x, i) => s + ws[i] * h * evalAt(integrand, c + h * x), 0);
    valueTex = exactTex(value);
    steps.push({ title: 'Integrate numerically', depth: 0, lines: [`V \\approx ${valueTex}`] });
  }
  const axisLine = axis === 'x' ? { a: 0, b: 1, c: 0 } : axis === 'y' ? { a: 1, b: 0, c: 0 } : axis === 'y=k' ? { a: 0, b: 1, c: -kv } : { a: 1, b: 0, c: -kv };
  const ys = mids.flatMap((x) => [evalAt(top, x), evalAt(bot, x)]).concat([kv]);
  return {
    V: valueTex, value, steps, notes: [`The region is turned about ${axis === 'x' ? 'the x-axis' : axis === 'y' ? 'the y-axis' : axis === 'y=k' ? `the line y = ${kv}` : `the line x = ${kv}`}.`], verified: true,
    plot: { fn: (x) => evalAt(top, x), fn2: (x) => evalAt(bot, x), shade: { a: A, b: B }, lines: [axisLine], view: { x0: Math.min(A, axis === 'x=k' ? kv : A) - 0.5, x1: Math.max(B, axis === 'x=k' ? kv : B) + 0.5, y0: Math.min(...ys) - 0.5, y1: Math.max(...ys) + 0.5 } },
  };
}
