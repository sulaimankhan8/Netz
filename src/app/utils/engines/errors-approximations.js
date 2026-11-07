/**
 * Errors and approximations with differentials: the maths for /errors-and-approximations (catalog 6C).
 *   approximate: f(x₀ + Δx) ≈ f(x₀) + f′(x₀)Δx            (e.g. √25.3 with f = √x, x₀ = 25, Δx = 0.3)
 *   error:       dy = f′(x) dx, relative error dy/y, percentage error 100·dy/y
 */
import { EngineError } from '../numeric/steps';
import { math, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';

const readNum = (t, label) => { let v; try { v = math.evaluate(String(t).trim().replace(/π/g, 'pi')); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label} must be a number.`); return v; };
const r6 = (v) => Number(v.toPrecision(8));

export function solve({ mode = 'approx', f, x0, dx }) {
  const node = parse(f, 'f');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable (found ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const X = readNum(x0, mode === 'approx' ? 'x₀' : 'The value'), D = readNum(dx, 'Δx');
  const d = tidyMulti(math.derivative(node, v), [v]);
  const fx = node.evaluate({ [v]: X }), dfx = d.evaluate({ [v]: X });
  if (!Number.isFinite(fx) || !Number.isFinite(dfx)) throw new EngineError(`f or f′ is not defined at ${v} = ${X}.`);
  const dy = dfx * D;
  const steps = [{ title: 'Differentiate', depth: 0, lines: [`f(${v}) = ${mtex(polish(node))}, \\qquad f'(${v}) = ${mtex(d)}`] }];
  if (mode === 'approx') {
    const approx = fx + dy, exact = node.evaluate({ [v]: X + D });
    steps.push({ title: `At ${v} = ${X}`, depth: 0, lines: [`f(${exactTex(X)}) = ${exactTex(fx)}, \\qquad f'(${exactTex(X)}) = ${exactTex(dfx)}`] });
    steps.push({ title: 'Linear approximation', formula: 'f(x + \\Delta x) \\approx f(x) + f\'(x)\\,\\Delta x', depth: 0, lines: [`f(${r6(X + D)}) \\approx ${exactTex(fx)} + \\left(${exactTex(dfx)}\\right)(${r6(D)}) = ${r6(approx)}`] });
    return { mode, f: mtex(polish(node)), result: `f(${r6(X + D)}) \\approx ${r6(approx)}`, exact: r6(exact), error: r6(Math.abs(exact - approx)), steps, notes: [`The exact value is ${r6(exact)}, so the approximation is off by ${r6(Math.abs(exact - approx))}.`], verified: true };
  }
  const rel = dy / fx;
  steps.push({ title: 'Differential', formula: 'dy = f\'(x)\\,dx', depth: 0, lines: [`dy = \\left(${exactTex(dfx)}\\right)(${r6(D)}) = ${r6(dy)}`] });
  steps.push({ title: 'Relative and percentage error', formula: '\\frac{dy}{y}, \\quad \\frac{dy}{y}\\times 100', depth: 0, lines: [`\\frac{dy}{y} = \\frac{${r6(dy)}}{${r6(fx)}} = ${r6(rel)}, \\qquad ${r6(100 * rel)}\\%`] });
  return { mode, f: mtex(polish(node)), result: `dy = ${r6(dy)}, \\quad \\frac{dy}{y} = ${r6(rel)} \\ (${r6(100 * rel)}\\%)`, steps, notes: [], verified: true };
}
