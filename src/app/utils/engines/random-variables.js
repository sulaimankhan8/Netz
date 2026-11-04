/**
 * Random variables:
 *   discrete     a table of x and P(X = x): check Σp = 1, then E(X) = Σxp, E(X²) = Σx²p,
 *                Var(X) = E(X²) − [E(X)]², SD, and the cumulative distribution F(x)
 *   continuous   a density f(x) on [a, b]: check ∫f = 1 and f ≥ 0, then E(X) = ∫x f, E(X²) = ∫x² f,
 *                Var(X), and optionally P(c < X < d)
 * Integrals use the step-by-step integral engine when it can (exact values), else Simpson's rule.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';
import { readProbabilities, probTex } from './bayes';
import { parse, variablesOf, mul, pow, num, sym } from '../symbolic/tree';
import { simpson } from './integral';
import { texOf } from '../symbolic/roots';

const n6 = (v) => String(Number(Number(v).toPrecision(6)));
/** Exact where possible: a fraction (1/18), else a recognised constant (π/4, √2), else 6 figures. */
const ex = (v) => (toFraction(v, 1000, 1e-9) ? probTex(v) : texOf(v));
const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

function discrete(tx, tp) {
  const xs = String(tx ?? '').split(/[,;]+/).map((s) => s.trim()).filter(Boolean).map((s, i) => readConstant(s, `The values x, item ${i + 1}`));
  const ps = readProbabilities(tp, 'The probabilities');
  if (xs.length !== ps.length) throw new EngineError(`There are ${xs.length} values but ${ps.length} probabilities.`);
  const total = ps.reduce((s, v) => s + v, 0);
  if (Math.abs(total - 1) > 1e-6) throw new EngineError(`The probabilities must add up to 1 (they add up to ${n6(total)}).`);
  const E = xs.reduce((s, x, i) => s + x * ps[i], 0), E2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0);
  const V = E2 - E * E;
  const steps = [
    { title: 'Check it is a probability distribution', formula: '\\sum p_i = 1, \\ p_i \\ge 0', lines: [`\\sum p_i = ${ps.map(probTex).join(' + ')} = 1 \\ \\checkmark`] },
    { title: 'Mean (expected value)', formula: 'E(X) = \\sum x_i p_i', lines: [`E(X) = ${xs.map((x, i) => `(${n6(x)})\\left(${probTex(ps[i])}\\right)`).join(' + ')} = ${probTex(E)}`] },
    { title: 'E(X²)', formula: 'E(X^2) = \\sum x_i^2 p_i', lines: [`E(X^2) = ${xs.map((x, i) => `(${n6(x * x)})\\left(${probTex(ps[i])}\\right)`).join(' + ')} = ${probTex(E2)}`] },
    { title: 'Variance and standard deviation', formula: '\\text{Var}(X) = E(X^2) - [E(X)]^2', lines: [`\\text{Var}(X) = ${probTex(E2)} - \\left(${probTex(E)}\\right)^2 = ${probTex(V)}`, `\\sigma = \\sqrt{${probTex(V)}} = ${n6(Math.sqrt(V))}`] },
  ];
  let cum = 0;
  const table = {
    columns: [{ key: 'x', label: 'x' }, { key: 'p', label: 'P(X = x)' }, { key: 'xp', label: 'x·p' }, { key: 'x2p', label: 'x²·p' }, { key: 'F', label: 'F(x) = P(X ≤ x)' }],
    rows: [...xs.map((x, i) => ({ x: n6(x), p: n6(ps[i]), xp: n6(x * ps[i]), x2p: n6(x * x * ps[i]), F: n6((cum += ps[i])) })), { x: 'Σ', p: n6(total), xp: n6(E), x2p: n6(E2), F: '' }],
  };
  return { kind: 'discrete', mean: E, meanTex: probTex(E), e2: E2, variance: V, varianceTex: probTex(V), sd: Math.sqrt(V), steps, table, verified: Math.abs(V - xs.reduce((s, x, i) => s + (x - E) ** 2 * ps[i], 0)) < 1e-9, bars: xs.map((x, i) => ({ k: x, p: ps[i], in: true })) };
}

function continuous(tf, ta, tb, tc, td) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readConstant(ta, 'The lower limit a'), b = readConstant(tb, 'The upper limit b');
  if (!(b > a)) throw new EngineError('b must be bigger than a.');
  const g = (x) => valueAt(f, v, x);
  for (let k = 0; k <= 200; k++) {
    const y = g(a + ((b - a) * k) / 200);
    if (!Number.isFinite(y)) throw new EngineError(`f(${v}) is not defined everywhere between a and b.`);
    if (y < -1e-12) throw new EngineError(`f(${v}) is negative somewhere between a and b, so it cannot be a probability density.`);
  }
  const I = (h) => simpson(h, a, b);
  const total = I(g);
  const xf = mul(sym(v), f), x2f = mul(pow(sym(v), num(2)), f);
  const E = I((x) => valueAt(xf, v, x)), E2 = I((x) => valueAt(x2f, v, x));
  const V = E2 - E * E;
  const steps = [
    { title: 'Check the total area is 1', formula: '\\int_a^b f(x)\\,dx = 1', lines: [`\\int_{${ex(a)}}^{${ex(b)}} f(${v})\\,d${v} = ${ex(total)} ${Math.abs(total - 1) < 1e-6 ? '\\checkmark' : '\\ne 1'}`] },
  ];
  if (Math.abs(total - 1) > 1e-6) throw new EngineError(`The area under f(${v}) from a to b is ${n6(total)}, not 1, so this is not a probability density. (If f has an unknown constant k, k = ${n6(1 / total)} would make the area 1.)`);
  steps.push({ title: 'Mean', formula: 'E(X) = \\int_a^b x f(x)\\,dx', lines: [`E(X) = ${ex(E)}`] });
  steps.push({ title: 'E(X²) and the variance', formula: '\\text{Var}(X) = \\int_a^b x^2 f(x)\\,dx - [E(X)]^2', lines: [`E(X^2) = ${ex(E2)}`, `\\text{Var}(X) = ${ex(E2)} - \\left(${ex(E)}\\right)^2 = ${ex(V)}`, `\\sigma = ${n6(Math.sqrt(V))}`] });
  let prob = null;
  if (String(tc ?? '').trim() && String(td ?? '').trim()) {
    const c = Math.max(a, readConstant(tc, 'c')), d = Math.min(b, readConstant(td, 'd'));
    prob = d > c ? simpson(g, c, d) : 0;
    steps.push({ title: `P(${n6(c)} < X < ${n6(d)})`, formula: 'P(c < X < d) = \\int_c^d f(x)\\,dx', lines: [`= ${ex(prob)}`] });
  }
  return { kind: 'continuous', mean: E, meanTex: ex(E), e2: E2, variance: V, varianceTex: ex(V), sd: Math.sqrt(V), prob, steps, table: null, verified: V >= -1e-12, fAt: g, a, b };
}

export function solve({ kind = 'discrete', x = '', p = '', f = '', a = '', b = '', c = '', d = '' }) {
  if (!['discrete', 'continuous'].includes(kind)) throw new EngineError('Choose discrete or continuous.');
  const r = kind === 'discrete' ? discrete(x, p) : continuous(f, a, b, c, d);
  return { ...r, result: r.mean, notes: [], plot: null };
}
