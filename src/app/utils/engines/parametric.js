/**
 * Parametric differentiation: x = x(t), y = y(t).
 *   dy/dx = (dy/dt) / (dx/dt)
 *   d²y/dx² = d/dt[dy/dx] / (dx/dt)            (optional)
 *   at t = t₀: the point, the slope and the tangent line (vertical when dx/dt = 0)
 * Answers are checked against math.js's derivatives at several values of t; `verified` says whether they agreed.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { math, parse, variablesOf, num, sub, mul, div, pow, paren, tex, polish, bestForm } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { cleanest, ugliness } from '../symbolic/present';

const SAMPLE = [0.37, 0.81, 1.29, 2.13, -0.64];
const valueOf = (node, p, t) => { try { const y = node.evaluate({ [p]: t }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const close = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
/** Do two nodes agree at the sample values (where both are defined)? */
function agreeAt(p, mine, reference) {
  let compared = 0;
  for (const t of SAMPLE) {
    const a = valueOf(mine, p, t), b = reference(t);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (!close(a, b)) return false;
  }
  return compared >= 2;
}
const tx = (n) => tex(polish(n)).trim();
const sigTex = (v) => String(Number(v.toPrecision(8)));

export function solve({ x: tx0, y: ty0, second = false, at = '' }) {
  const X = parse(tx0, 'x(t)');
  const Y = parse(ty0, 'y(t)');
  const vars = [...new Set([...variablesOf(X), ...variablesOf(Y)])];
  if (vars.length > 1) throw new EngineError(`Use one parameter only (this uses ${vars.join(', ')}).`);
  const p = vars[0] || 't';
  if (p === 'x' || p === 'y') throw new EngineError('Use t (or θ) as the parameter, not x or y.');
  const P = p === 'theta' ? '\\theta' : p;

  const dX = bestForm(differentiate(X, p).result);
  const dY = bestForm(differentiate(Y, p).result);
  if (isZeroEverywhere(dX, p)) throw new EngineError(`x does not change with ${p} (dx/d${p} = 0), so dy/dx is undefined.`);

  // dy/dx, in its tidiest form that still equals dY/dX
  const quotient = div(paren(dY), paren(dX));
  const ratio = (t) => valueOf(dY, p, t) / valueOf(dX, p, t);
  const dydx = cleanest(quotient, p, (g) => agreeAt(p, g, ratio)) || bestForm(quotient);
  const refX = math.derivative(X, p), refY = math.derivative(Y, p);
  let verified = agreeAt(p, dydx, (t) => valueOf(refY, p, t) / valueOf(refX, p, t));

  const D = `d${P}`;
  const steps = [
    { title: `Differentiate x with respect to ${p === 'theta' ? 'θ' : p}`, lines: [`x = ${tx(X)}`, `\\frac{dx}{${D}} = ${tx(dX)}`] },
    { title: `Differentiate y with respect to ${p === 'theta' ? 'θ' : p}`, lines: [`y = ${tx(Y)}`, `\\frac{dy}{${D}} = ${tx(dY)}`] },
    { title: 'Divide', formula: `\\frac{dy}{dx} = \\frac{dy/${D}}{dx/${D}}`, lines: [`\\frac{dy}{dx} = \\frac{${tx(dY)}}{${tx(dX)}}${tx(dydx) === `\\frac{${tx(dY)}}{${tx(dX)}}` ? '' : ` = ${tx(dydx)}`}`] },
  ];

  // Second derivative: differentiate dy/dx with respect to t, then divide by dx/dt again
  let d2 = null;
  if (second) {
    const inner = bestForm(differentiate(dydx, p).result);
    const raw = div(paren(inner), paren(dX));
    const want = (t) => valueOf(inner, p, t) / valueOf(dX, p, t);
    // The same thing as (x′y″ − y′x″)/x′³, which often simplifies further (sin² + cos² = 1)
    const ddX = bestForm(differentiate(dX, p).result), ddY = bestForm(differentiate(dY, p).result);
    const alt = div(paren(sub(mul(dX, ddY), mul(dY, ddX))), pow(paren(dX), num(3)));
    const ok = (g) => agreeAt(p, g, want);
    d2 = [cleanest(raw, p, ok), cleanest(alt, p, ok)].filter(Boolean).sort((a, b) => ugliness(a) - ugliness(b))[0] || bestForm(raw);
    const refInner = math.derivative(dydx, p);
    verified = verified && agreeAt(p, d2, (t) => valueOf(refInner, p, t) / valueOf(refX, p, t));
    steps.push({
      title: 'Second derivative: differentiate dy/dx with respect to the parameter, then divide by dx/dt again',
      formula: `\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{${D}}\\left(\\frac{dy}{dx}\\right)}{dx/${D}}`,
      lines: [`\\frac{d}{${D}}\\left(\\frac{dy}{dx}\\right) = ${tx(inner)}`, `\\frac{d^2y}{dx^2} = \\frac{${tx(inner)}}{${tx(dX)}}${tx(d2) === `\\frac{${tx(inner)}}{${tx(dX)}}` ? '' : ` = ${tx(d2)}`}`],
    });
  }

  // At a value of the parameter
  let point = null;
  if (String(at ?? '').trim()) {
    const t0 = readConstant(at, `The value of ${p}`);
    const x0 = valueOf(X, p, t0), y0 = valueOf(Y, p, t0);
    if (!Number.isFinite(x0) || !Number.isFinite(y0)) throw new EngineError(`The curve is not defined at ${p} = ${sigTex(t0)}.`);
    const dx0 = valueOf(dX, p, t0), dy0 = valueOf(dY, p, t0);
    const vertical = Math.abs(dx0) < 1e-12 && Math.abs(dy0) > 1e-12;
    const stationary = Math.abs(dx0) < 1e-12 && Math.abs(dy0) < 1e-12;
    const slope = vertical || stationary ? null : dy0 / dx0;
    const second0 = d2 && !vertical && !stationary ? valueOf(d2, p, t0) : null;
    point = { t: t0, x: x0, y: y0, slope, vertical, stationary, second: Number.isFinite(second0) ? second0 : null };
    const lines = [`${p === 'theta' ? '\\theta' : p} = ${sigTex(t0)}: \\quad x = ${sigTex(x0)}, \\ y = ${sigTex(y0)}`];
    if (vertical) lines.push(`\\frac{dx}{${D}} = 0: \\text{ the tangent is vertical, } x = ${sigTex(x0)}`);
    else if (stationary) lines.push(`\\frac{dx}{${D}} = \\frac{dy}{${D}} = 0 \\text{ here, so the slope cannot be found this way (the curve may have a cusp).}`);
    else {
      lines.push(`\\frac{dy}{dx} = ${sigTex(slope)}`);
      const c = y0 - slope * x0;
      const m = Math.abs(slope) < 1e-12 ? '' : `${close(slope, 1) ? '' : close(slope, -1) ? '-' : sigTex(slope)}x`;
      const cc = Math.abs(c) < 1e-12 ? '' : `${m ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''}${sigTex(Math.abs(c))}`;
      lines.push(`\\text{Tangent: } y = ${m}${cc}` + (m || cc ? '' : '0'));
      if (point.second !== null) lines.push(`\\frac{d^2y}{dx^2} = ${sigTex(point.second)}`);
    }
    steps.push({ title: 'At the given point', lines });
  }

  // For the graph: the curve sampled over the parameter
  const curve = (t0, t1, n = 240) => {
    const pts = [];
    for (let k = 0; k <= n; k++) { const t = t0 + ((t1 - t0) * k) / n; pts.push({ x: valueOf(X, p, t), y: valueOf(Y, p, t) }); }
    return pts;
  };

  return {
    parameter: p, P, x: tx(X), y: tx(Y), dx: tx(dX), dy: tx(dY), answer: tx(dydx), second: d2 ? tx(d2) : null,
    steps, verified, point, curve, result: dydx.toString(), notes: [], plot: null,
  };
}

function isZeroEverywhere(node, p) {
  return SAMPLE.every((t) => Math.abs(valueOf(node, p, t)) < 1e-12);
}
