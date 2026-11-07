/**
 * Improper integrals: the maths for /improper-integrals (catalog 6E).
 *   Infinite limits:     ∫ₐ^∞ f dx = lim_{t→∞} [F(t) − F(a)]
 *   Infinite integrand:  at an end point, a one-sided limit of F; at a point inside, split there.
 * The antiderivative is found step by step and checked; each limit by the limit engine. When every limit is finite
 * the integral converges to their difference; otherwise it diverges.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex } from '../symbolic/multi';
import { antiderivative } from '../symbolic/ode';
import { limit } from '../symbolic/limit';

const readEnd = (t, label) => {
  const s = String(t ?? '').trim().toLowerCase();
  if (!s) throw new EngineError(`${label} is empty.`);
  if (/^(\+?inf|\+?∞|\+?infinity)$/.test(s)) return Infinity;
  if (/^(-inf|-∞|-infinity|−inf|−∞)$/.test(s)) return -Infinity;
  let v;
  try { v = math.evaluate(s.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: "${t}" is not a number or ∞ (write inf).`);
  return v;
};
const endTex = (v) => (v === Infinity ? '\\infty' : v === -Infinity ? '-\\infty' : exactTex(v));

export function solve({ f, a, b }) {
  const node = parse(f, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.some((v) => v !== 'x')) throw new EngineError('Write f in x only.');
  const A = readEnd(a, 'The lower limit'), B = readEnd(b, 'The upper limit');
  if (!(B > A)) throw new EngineError('The upper limit must be bigger than the lower one.');
  const fx = (x) => { try { const y = node.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  // Points inside where f blows up
  const lo = Number.isFinite(A) ? A : -50, hi = Number.isFinite(B) ? B : 50;
  const inner = [];
  const n = 2000;
  for (let i = 1; i < n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = fx(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e7) {
      const near = Math.round(x * 1e4) / 1e4;
      if (!inner.some((p) => Math.abs(p - near) < (hi - lo) / 200)) inner.push(near);
    }
  }
  const cuts = [A, ...inner, B];
  const F = antiderivative(node, 'x');
  const steps = [{ title: 'Antiderivative', depth: 0, lines: [`\\int ${mtex(polish(node))}\\,dx = ${mtex(F.F)}`] }];
  F.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  const Fat = (x, dir) => {
    const regular = Number.isFinite(x) && Number.isFinite(fx(x)) && Math.abs(fx(x)) < 1e7;
    if (regular) { const v = F.F.evaluate({ x }); return { value: v, tex: exactTex(v), how: `F(${exactTex(x)})` }; }
    const r = limit(F.F, 'x', x, dir);
    const arrow = x === Infinity ? '\\infty' : x === -Infinity ? '-\\infty' : `${exactTex(x)}^{${dir === 'left' ? '-' : '+'}}`;
    return { value: r.value, tex: r.exactTex ?? exactTex(r.value), how: `\\lim_{x \\to ${arrow}} F(x)` };
  };
  let total = 0, diverges = false;
  for (let i = 0; i < cuts.length - 1; i++) {
    const p = cuts[i], q = cuts[i + 1];
    const top = Fat(q, 'left'), bottom = Fat(p, 'right');
    const fin = Number.isFinite(top.value) && Number.isFinite(bottom.value);
    steps.push({
      title: `From ${endTex(p).replace(/\\infty/, '∞')} to ${endTex(q).replace(/\\infty/, '∞')}`, depth: 0,
      lines: [`\\int_{${endTex(p)}}^{${endTex(q)}} ${mtex(polish(node))}\\,dx = ${top.how} - ${bottom.how} = ${fin ? `${top.tex} - \\left(${bottom.tex}\\right) = ${exactTex(top.value - bottom.value)}` : `${top.tex} - \\left(${bottom.tex}\\right)`}`],
    });
    if (!fin) diverges = true; else total += top.value - bottom.value;
  }
  if (inner.length) steps.unshift({ title: 'Split where f is infinite', depth: 0, lines: [`f \\text{ blows up at } x = ${inner.map(exactTex).join(', ')}, \\text{ so the integral is split there}`] });
  const setup = `\\int_{${endTex(A)}}^{${endTex(B)}} ${mtex(polish(node))}\\,dx`;
  const notes = [];
  if (diverges) notes.push('At least one limit is infinite (or does not exist), so the integral diverges.');
  return { setup, converges: !diverges, value: diverges ? null : total, valueTex: diverges ? '\\text{diverges}' : exactTex(total), steps, notes, verified: true };
}
