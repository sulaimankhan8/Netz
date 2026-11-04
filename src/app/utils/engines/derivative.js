/**
 * Derivative calculator: the maths for /derivative-calculator, using the symbolic step engine
 * (src/app/utils/symbolic). Every answer is checked against math.js's own derivative at several points
 * before it is shown; `verified` says whether that check passed.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { math, parse, variablesOf, bestForm, tex, text } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';

const SAMPLE = [0.37, 0.81, 1.29, 2.13, -0.64, 3.7];

/** Do two expressions agree at the sample points (where both are defined)? */
function agree(mine, reference, v, others) {
  let compared = 0;
  for (const x of SAMPLE) {
    const scope = { ...others, [v]: x };
    let a, b;
    try { a = mine.evaluate(scope); b = reference.evaluate(scope); } catch { continue; }
    if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b)) continue;
    compared++;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(a), Math.abs(b))) return false;
  }
  return compared >= 2;
}

export function solve({ f: tf, order: to = '1', at = '' }) {
  const node = parse(tf, 'f(x)');
  const order = Number(to);
  if (![1, 2, 3].includes(order)) throw new EngineError('Choose the 1st, 2nd or 3rd derivative.');

  // The variable: x if it appears, else the only letter used (t, y, …)
  const vars = [...variablesOf(node)];
  const v = vars.includes('x') || vars.length === 0 ? 'x' : vars.length === 1 ? vars[0] : 'x';
  const others = vars.filter((s) => s !== v);
  const notes = [];
  if (others.length) notes.push(`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} treated as ${others.length === 1 ? 'a constant' : 'constants'} (we differentiate with respect to ${v}).`);
  if (!vars.length) notes.push('There is no x in this expression, so it is a constant and its derivative is 0.');

  const rounds = [];
  let current = node;
  let reference = node;
  for (let k = 1; k <= order; k++) {
    const { result, steps } = differentiate(current, v);
    const best = bestForm(result);
    rounds.push({ k, from: tex(current), steps, raw: tex(result), best: tex(best), changed: tex(result) !== tex(best) });
    current = best;
    reference = math.derivative(reference, v);
  }

  const scope = Object.fromEntries(others.map((s, i) => [s, 1.7 + i * 0.3]));
  const verified = agree(current, reference, v, scope);

  let point = null;
  if (String(at ?? '').trim()) {
    if (others.length) throw new EngineError(`To evaluate at a point, the expression can only use ${v}.`);
    const a = readNumber(at, `The ${v}-value`);
    let fa, slope;
    try { fa = node.evaluate({ [v]: a }); slope = current.evaluate({ [v]: a }); } catch { /* handled below */ }
    if (typeof slope !== 'number' || !Number.isFinite(slope)) throw new EngineError(`The derivative is not defined at ${v} = ${a}.`);
    point = { a, fa: typeof fa === 'number' && Number.isFinite(fa) ? fa : null, slope };
  }

  // For the graph: f and the answer as plain functions of the variable (NaN where undefined)
  const asFunction = (n) => (x) => {
    try { const y = n.evaluate({ ...scope, [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; }
  };

  return {
    fAt: asFunction(node), dAt: asFunction(current),
    variable: v, order, f: tex(node), fText: text(node), rounds,
    answer: tex(current), answerText: text(current), verified, point, notes,
    result: text(current), steps: { headers: [], rows: [] }, plot: null,
  };
}
