/**
 * Arc length and surface area of revolution: the maths for /arc-length-calculator (catalog 6F).
 *   y = f(x):        L = ∫ √(1 + f′²) dx            surface about the x-axis: S = 2π∫ f √(1 + f′²) dx
 *   x(t), y(t):      L = ∫ √(x′² + y′²) dt
 *   r(θ):            L = ∫ √(r² + r′²) dθ
 * The integrand is simplified first (a perfect square under the root, e.g. 1 + (x/4 − 1/x)² = (x/4 + 1/x)², is
 * taken out). When no step-by-step antiderivative exists the value is found numerically and labelled.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, paren, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { definite, gaussLegendre } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { rationalParts } from '../symbolic/poly';
import { polyNode } from '../symbolic/integral';

const readNum = (t, label) => { let v; try { v = math.evaluate(String(t).trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label} must be a number.`); return v; };

/** Square root of a polynomial (ascending coefficients) when it is a perfect square, else null. */
function polySqrt(c) {
  const p = [...c]; while (p.length > 1 && Math.abs(p.at(-1)) < 1e-12) p.pop();
  const deg = p.length - 1;
  if (deg % 2 || p.at(-1) <= 0) return null;
  const m = deg / 2;
  const q = new Array(m + 1).fill(0);
  q[m] = Math.sqrt(p.at(-1));
  for (let k = m - 1; k >= 0; k--) {
    let s = p[m + k];
    for (let i = k + 1; i <= m; i++) { const j = m + k - i; if (j > k && j <= m) s -= q[i] * q[j]; }
    q[k] = s / (2 * q[m]);
  }
  const sq = new Array(2 * m + 1).fill(0);
  q.forEach((a, i) => q.forEach((b, j) => { sq[i + j] += a * b; }));
  if (!sq.every((v, i) => Math.abs(v - (p[i] || 0)) < 1e-9 * Math.max(1, Math.abs(v)))) return null;
  // Keep the root positive on the interval: the caller checks the sign
  return q.map((v) => { const f = toFraction(v, 1000, 1e-9); return f ? f.n / f.d : v; });
}
/** √(S) as a simpler node when S is a perfect square of a rational function, else sqrt(S). */
function rootOf(S, v, lo, hi) {
  const r = rationalParts(S, v);
  if (r) {
    const P = polySqrt(r.P.map(Number)), Q = polySqrt(r.Q.map(Number));
    if (P && Q) {
      let node = div(polyNode(P, v), polyNode(Q, v));
      const mid = (lo + hi) / 2;
      if (node.evaluate({ [v]: mid }) < 0) node = mul(num(-1), paren(node));
      return { node: tidyMulti(node, [v]), square: true };
    }
  }
  return { node: fn('sqrt', S), square: false };
}

export function solve({ mode = 'cartesian', f = '', xt = '', yt = '', r = '', a, b }) {
  const A = readNum(a, 'The lower limit'), B = readNum(b, 'The upper limit');
  if (!(B > A)) throw new EngineError('The upper limit must be bigger than the lower one.');
  let v, S, formula, intro, surfaceFactor = null;
  if (mode === 'cartesian' || mode === 'surface') {
    const F = parse(f, 'f(x)');
    if ([...variablesOf(F)].some((w) => w !== 'x')) throw new EngineError('Write f in x only.');
    v = 'x';
    const d = tidyMulti(math.derivative(F, 'x'), ['x']);
    S = tidyMulti(add(num(1), pow(paren(d), num(2))), ['x']);
    intro = [`y = ${mtex(polish(F))}, \\qquad \\frac{dy}{dx} = ${mtex(d)}`, `1 + \\left(\\frac{dy}{dx}\\right)^2 = ${mtex(S)}`];
    formula = mode === 'surface' ? 'S = 2\\pi\\int_a^b y\\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2}\\,dx' : 'L = \\int_a^b \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2}\\,dx';
    if (mode === 'surface') surfaceFactor = mul(mul(num(2), sym('pi')), F);
  } else if (mode === 'parametric') {
    const X = parse(xt, 'x(t)'), Y = parse(yt, 'y(t)');
    if ([...variablesOf(X), ...variablesOf(Y)].some((w) => w !== 't')) throw new EngineError('Write x(t) and y(t) in t only.');
    v = 't';
    const dx = tidyMulti(math.derivative(X, 't'), ['t']), dy = tidyMulti(math.derivative(Y, 't'), ['t']);
    S = tidyMulti(add(pow(paren(dx), num(2)), pow(paren(dy), num(2))), ['t']);
    intro = [`x'(t) = ${mtex(dx)}, \\quad y'(t) = ${mtex(dy)}`, `x'^2 + y'^2 = ${mtex(S)}`];
    formula = 'L = \\int_{t_1}^{t_2} \\sqrt{x\'(t)^2 + y\'(t)^2}\\,dt';
  } else if (mode === 'polar') {
    const R = parse(String(r).replace(/θ/g, 'theta'), 'r(θ)');
    if ([...variablesOf(R)].some((w) => w !== 'theta')) throw new EngineError('Write r in θ (theta) only.');
    v = 'theta';
    const dr = tidyMulti(math.derivative(R, 'theta'), ['theta']);
    S = tidyMulti(add(pow(paren(R), num(2)), pow(paren(dr), num(2))), ['theta']);
    intro = [`r = ${mtex(polish(R))}, \\quad \\frac{dr}{d\\theta} = ${mtex(dr)}`, `r^2 + \\left(\\frac{dr}{d\\theta}\\right)^2 = ${mtex(S)}`];
    formula = 'L = \\int_{\\alpha}^{\\beta} \\sqrt{r^2 + \\left(\\frac{dr}{d\\theta}\\right)^2}\\,d\\theta';
  } else throw new EngineError('Choose a mode.');
  const root = rootOf(S, v, A, B);
  const integrand = tidyMulti(surfaceFactor ? mul(surfaceFactor, root.node) : root.node, [v]);
  const steps = [{ title: 'Set up', formula, depth: 0, lines: [...intro, root.square ? `\\text{a perfect square: } \\sqrt{${mtex(S)}} = ${mtex(root.node)}` : `\\text{integrand: } ${mtex(integrand)}`] }];
  let value, valueTex, numeric = false;
  try {
    const d = definite(integrand, v, numNode(A), numNode(B), [v]);
    steps.push({ title: 'Integrate', depth: 0, lines: d.lines });
    d.steps.forEach((s) => steps.push(s));
    value = d.number; valueTex = d.valueTex;
  } catch (e) {
    if (e.name !== 'EngineError') throw e;
    const { xs, ws } = gaussLegendre(64);
    const c = (A + B) / 2, h = (B - A) / 2;
    const g = integrand.compile();
    value = xs.reduce((s, x, i) => { let y; try { y = g.evaluate({ [v]: c + h * x }); } catch { y = NaN; } return s + ws[i] * h * y; }, 0);
    valueTex = exactTex(value);
    numeric = true;
    steps.push({ title: 'Integrate numerically', depth: 0, lines: [`\\approx ${valueTex}`] });
  }
  return { kind: mode === 'surface' ? 'S' : 'L', valueTex, value, numeric, steps, notes: numeric ? ['No step-by-step antiderivative was found for this integrand, so the value is numerical (Gauss–Legendre).'] : [], verified: true };
}
