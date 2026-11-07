/**
 * Rolle's theorem and Lagrange's mean value theorem: the maths for /mean-value-theorem (catalog 6C).
 *   Rolle:     f continuous on [a, b], differentiable on (a, b), f(a) = f(b) ⇒ f′(c) = 0 for some c in (a, b)
 *   Lagrange:  f′(c) = (f(b) − f(a))/(b − a) for some c in (a, b)
 * The conditions are checked numerically (f and f′ finite across the interval), then every c is found.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, polish, variablesOf, sub } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { numNode } from '../symbolic/ode';
import { zerosOf } from '../symbolic/roots';

const readNum = (t, label) => { let v; try { v = math.evaluate(String(t).trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label} must be a number.`); return v; };

export function solve({ f, a, b, theorem = 'lagrange' }) {
  const node = parse(f, 'f(x)');
  if ([...variablesOf(node)].some((w) => w !== 'x')) throw new EngineError('Write f in x only.');
  const A = readNum(a, 'a'), B = readNum(b, 'b');
  if (!(B > A)) throw new EngineError('b must be bigger than a.');
  const fx = (x) => { try { const y = node.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  const d = tidyMulti(math.derivative(node, 'x'), ['x']);
  const dx = (x) => { try { const y = d.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  const steps = [];
  const N = 400;
  const contOk = Array.from({ length: N + 1 }, (_, i) => fx(A + ((B - A) * i) / N)).every((y) => Number.isFinite(y) && Math.abs(y) < 1e9);
  const diffOk = Array.from({ length: N - 1 }, (_, i) => dx(A + ((B - A) * (i + 1)) / N)).every((y) => Number.isFinite(y) && Math.abs(y) < 1e9);
  steps.push({ title: 'Check the conditions', depth: 0, lines: [`f \\text{ is ${contOk ? '' : 'not '}continuous on } [${exactTex(A)}, ${exactTex(B)}]`, `f'(x) = ${mtex(d)} \\text{ is ${diffOk ? '' : 'not '}finite on } (${exactTex(A)}, ${exactTex(B)})`] });
  if (!contOk || !diffOk) throw new EngineError(`The theorem does not apply: f is not ${contOk ? 'differentiable' : 'continuous'} on the whole interval.`);
  const fa = fx(A), fb = fx(B);
  let k;
  if (theorem === 'rolle') {
    if (Math.abs(fa - fb) > 1e-9 * Math.max(1, Math.abs(fa))) throw new EngineError(`Rolle's theorem needs f(a) = f(b), but f(${exactTex(A)}) = ${exactTex(fa)} and f(${exactTex(B)}) = ${exactTex(fb)}. Try the mean value theorem instead.`);
    k = 0;
    steps.push({ title: 'f(a) = f(b)', depth: 0, lines: [`f(${exactTex(A)}) = f(${exactTex(B)}) = ${exactTex(fa)}`] });
  } else {
    k = (fb - fa) / (B - A);
    steps.push({ title: 'Slope of the chord', formula: '\\frac{f(b) - f(a)}{b - a}', depth: 0, lines: [`\\frac{${exactTex(fb)} - ${fa < 0 ? `(${exactTex(fa)})` : exactTex(fa)}}{${exactTex(B)} - ${A < 0 ? `(${exactTex(A)})` : exactTex(A)}} = ${exactTex(k)}`] });
  }
  const z = zerosOf(sub(d, numNode(k)), 'x', { lo: A, hi: B });
  const cs = z.zeros.filter((p) => p.x > A + 1e-9 && p.x < B - 1e-9);
  if (!cs.length) throw new EngineError('No c was found strictly between a and b (check the conditions).');
  steps.push({ title: `Solve f′(c) = ${exactTex(k).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')}`, depth: 0, lines: [`${mtex(d)} = ${exactTex(k)} \\Rightarrow c = ${cs.map((p) => p.tex).join(', \\ ')}`] });
  const ys = Array.from({ length: 41 }, (_, i) => fx(A + ((B - A) * i) / 40));
  return {
    theorem, f: mtex(polish(node)), c: cs.map((p) => p.tex), slope: exactTex(k), steps, notes: [`${cs.length === 1 ? 'This c lies' : 'These c lie'} strictly between a and b, as the theorem promises.`], verified: true,
    plot: {
      fn: fx, view: { x0: A - (B - A) * 0.1, x1: B + (B - A) * 0.1, y0: Math.min(...ys), y1: Math.max(...ys) },
      lines: [{ a: k, b: -1, c: fa - k * A }, ...cs.map((p) => ({ a: k, b: -1, c: fx(p.x) - k * p.x }))],
      points: [{ x: A, y: fa, label: 'a' }, { x: B, y: fb, label: 'b' }, ...cs.map((p) => ({ x: p.x, y: fx(p.x), label: 'c' }))],
    },
  };
}
