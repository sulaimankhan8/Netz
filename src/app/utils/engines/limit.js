/**
 * Limit calculator: the maths for /limit-calculator, using src/app/utils/symbolic/limit.js.
 * The step-by-step answer is checked against values of f taken closer and closer to the point;
 * `verified` says whether they agree.
 */
import { EngineError } from '../numeric/steps';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { limit, numericLimit, readPoint, valueAt } from '../symbolic/limit';

export function solve({ f: tf, a: ta, dir = 'both' }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readPoint(ta);
  if (!['both', 'left', 'right'].includes(dir)) throw new EngineError('Choose both sides, the left or the right.');
  if (!Number.isFinite(a) && dir !== 'both') dir = 'both'; // one-sided only makes sense at a finite point

  const r = limit(node, v, a, dir);
  const check = numericLimit(node, v, a, dir);
  const close = (p, q) => (Number.isFinite(p) && Number.isFinite(q) ? Math.abs(p - q) <= 1e-4 * Math.max(1, Math.abs(p)) : p === q || (Number.isNaN(p) && Number.isNaN(q)));
  const verified = r.estimated ? false : close(r.value, check.value);

  const aTex = a === Infinity ? '\\infty' : a === -Infinity ? '-\\infty' : null; // finite points are shown by the page
  return {
    variable: v, a, dir, f: tex(polish(node)),
    value: r.value, exactTex: r.exactTex, method: r.method, steps: r.steps, sides: r.sides || null,
    estimated: Boolean(r.estimated), verified, aTex,
    fAt: (x) => valueAt(node, v, x),
    result: r.value, notes: [], plot: null,
  };
}
