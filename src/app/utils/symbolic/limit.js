/**
 * Limits, step by step (NETZ_METHODS_CATALOG.md 6A), tried in the order a student would:
 *   1. direct substitution
 *   2. 0/0 with polynomials: factor out (x − a) from top and bottom, cancel, substitute again
 *   3. x → ±∞ with polynomials: divide by the highest power (compare degrees)
 *   4. 0/0 or ∞/∞ otherwise: L'Hôpital's rule (differentiate top and bottom), repeated up to 5 times
 *   5. a non-zero number over 0: look at each side to decide +∞, −∞ or "does not exist"
 * Each step: { title, lines: [LaTeX] }. Numbers that come out exact (½, √2, π) stay exact.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, div, unwrap, tidy, tex, bestForm, simplifyExact, polish } from './tree';
import { differentiate } from './derivative';
import { rationalParts as rationalPartsOf } from './poly';

const INF = Infinity;

/** f with the variable replaced by a number node. */
const substitute = (node, v, a) => node.transform((n) => (n.isSymbolNode && n.name === v ? num(a) : n));

/** Value of a node at x = a, or NaN when undefined (complex, divide by zero…). */
export function valueAt(node, v, a) {
  try {
    const y = node.evaluate({ [v]: a });
    return typeof y === 'number' ? y : NaN;
  } catch {
    return NaN;
  }
}

/** A number as exact LaTeX when it is a simple fraction, else 6 significant figures; ±∞ as \infty. */
export function texValue(y) {
  if (y === INF) return '\\infty';
  if (y === -INF) return '-\\infty';
  const f = toFraction(y, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  return String(Number(y.toPrecision(6)));
}

/** Exact form of the value of `node` at x = a when simplification keeps it short (√2/2, π/4…), else the number. */
function exactAt(node, v, a) {
  const y = valueAt(node, v, a);
  if (!Number.isFinite(y)) return { y, tex: texValue(y) };
  if (toFraction(y, 1000, 1e-9)) return { y, tex: texValue(y) };
  try {
    const s = polish(simplifyExact(substitute(node, v, a)));
    const t = tex(s);
    if (t.length < 40 && !/[a-z]{2,}\s*\\left\(\d/.test(t)) return { y, tex: `${t} \\approx ${texValue(y)}` };
  } catch { /* fall back to the number */ }
  return { y, tex: texValue(y) };
}

/** Numerator and denominator polynomials of a rational function in v, or null (fast: see poly.js). */
function rationalParts(node, v) {
  const r = rationalPartsOf(node, v);
  return r ? { top: r.P, bottom: r.Q } : null;
}

const evalPoly = (c, x) => c.reduceRight((acc, k) => acc * x + k, 0);
/** Divide an ascending-coefficient polynomial by (x − a) (synthetic division). */
function divideByRoot(c, a) {
  const desc = [...c].reverse();
  const out = [desc[0]];
  for (let i = 1; i < desc.length - 1; i++) out.push(desc[i] + out[i - 1] * a);
  return out.reverse();
}
const trim = (c) => { const d = [...c]; while (d.length > 1 && Math.abs(d.at(-1)) < 1e-12) d.pop(); return d; };
/** Ascending coefficients → LaTeX polynomial in v. */
function polyTex(c, v = 'x') {
  const terms = [];
  for (let k = c.length - 1; k >= 0; k--) {
    const a = c[k];
    if (Math.abs(a) < 1e-12) continue;
    const mag = Math.abs(a);
    const coef = k > 0 && Math.abs(mag - 1) < 1e-12 ? '' : texValue(mag);
    const body = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    terms.push({ sign: a < 0 ? '-' : '+', s: `${coef}${body}` });
  }
  if (!terms.length) return '0';
  return terms.map((t, i) => (i === 0 ? (t.sign === '-' ? `-${t.s}` : t.s) : ` ${t.sign} ${t.s}`)).join('');
}
const factorTex = (a, v) => (a === 0 ? v : `(${v} ${a > 0 ? '-' : '+'} ${texValue(Math.abs(a))})`);

/** Numeric limit, for checking and as a last resort. dir: 'both' | 'left' | 'right'. */
export function numericLimit(node, v, a, dir = 'both') {
  // Points spaced ×10 apart towards the target. Close to a finite point we stop at 10⁻⁵: closer than that,
  // rounding (e.g. 1 − cos x for tiny x) swamps the value.
  const side = (s) => {
    const xs = a === INF ? [1e2, 1e3, 1e4, 1e5, 1e6, 1e7] : a === -INF ? [-1e2, -1e3, -1e4, -1e5, -1e6, -1e7] : [1e-1, 1e-2, 1e-3, 1e-4, 1e-5].map((h) => a + s * h);
    const ys = xs.map((x) => valueAt(node, v, x));
    // Overflow to ±Infinity (e.g. e^x for big x) means it grows without bound
    if (ys.slice(-2).every((y) => y === INF)) return INF;
    if (ys.slice(-2).every((y) => y === -INF)) return -INF;
    if (ys.some((y) => !Number.isFinite(y))) return NaN;
    const steps2 = ys.slice(1).map((y, i) => y - ys[i]);
    const last = ys.at(-1);
    const dLast = steps2.at(-1), dFirst = steps2[0];
    // Same-sign changes that don't shrink: heading to ±∞ (ln x gains about 2.3 every ×10)
    if (steps2.every((d) => Math.sign(d) === Math.sign(dLast) && d !== 0) && Math.abs(dLast) >= 0.5 * Math.abs(dFirst) && Math.abs(dLast) > 1e-9) {
      return dLast > 0 ? INF : -INF;
    }
    // Settled: the last change is tiny next to the value
    if (Math.abs(dLast) <= 1e-4 * Math.max(1, Math.abs(last))) return Math.abs(last) < 1e-6 ? 0 : last;
    return NaN; // not settling (oscillates, e.g. sin(1/x))
  };
  if (a === INF || a === -INF) return { value: side(1), left: null, right: null };
  const left = dir === 'right' ? null : side(-1);
  const right = dir === 'left' ? null : side(1);
  if (dir === 'left') return { value: left, left, right };
  if (dir === 'right') return { value: right, left, right };
  const same = Number.isFinite(left) && Number.isFinite(right) ? Math.abs(left - right) <= 1e-4 * Math.max(1, Math.abs(left)) : left === right;
  return { value: same ? (Number.isFinite(left) ? (left + right) / 2 : left) : NaN, left, right };
}

/**
 * The limit of node as v → a. a may be ±Infinity. Returns { value, exactTex, method, steps, form }.
 * value: a number, ±Infinity, or NaN for "does not exist".
 */
export function limit(node, v, a, dir = 'both') {
  const steps = [];
  const aTex = a === INF ? '\\infty' : a === -INF ? '-\\infty' : texValue(a);
  const arrow = `${v} \\to ${aTex}${dir === 'left' ? '^-' : dir === 'right' ? '^+' : ''}`;
  const lim = (n) => `\\lim_{${arrow}} ${tex(polish(n))}`;
  const top = unwrap(tidy(node));
  const isQuotient = top.isOperatorNode && top.fn === 'divide';

  // 1. Direct substitution (finite a)
  if (Number.isFinite(a)) {
    const fa = valueAt(node, v, a);
    if (Number.isFinite(fa)) {
      const ex = exactAt(node, v, a);
      steps.push({ title: 'Substitute directly', lines: [`${lim(node)} = ${tex(polish(substitute(node, v, a)))} = ${ex.tex}`] });
      return { value: fa, exactTex: ex.tex.split(' \\approx ')[0], method: 'substitution', steps };
    }
    if (isQuotient) {
      const u = valueAt(top.args[0], v, a), w = valueAt(top.args[1], v, a);
      if (Number.isFinite(u) && Number.isFinite(w) && Math.abs(w) < 1e-12 && Math.abs(u) > 1e-12) {
        // number / 0: infinite on each side
        steps.push({ title: 'Substitute: a number over 0', lines: [`\\text{Top} \\to ${texValue(u)}, \\quad \\text{bottom} \\to 0`, '\\text{The fraction grows without bound; check the sign on each side.}'] });
        const num2 = numericLimit(node, v, a, dir);
        const sideText = (s) => (s === INF ? '+\\infty' : s === -INF ? '-\\infty' : '?');
        if (dir === 'both') {
          steps.push({ title: 'Left and right', lines: [`\\lim_{${v} \\to ${aTex}^-} = ${sideText(num2.left)}, \\quad \\lim_{${v} \\to ${aTex}^+} = ${sideText(num2.right)}`] });
          if (num2.left !== num2.right) return { value: NaN, exactTex: '\\text{does not exist}', method: 'infinite', steps, sides: num2 };
        }
        return { value: num2.value, exactTex: texValue(num2.value), method: 'infinite', steps, sides: num2 };
      }
      if (Number.isFinite(u) && Number.isFinite(w) && Math.abs(u) < 1e-12 && Math.abs(w) < 1e-12) {
        steps.push({ title: 'Substitute: 0/0', lines: [`\\text{Top} \\to 0, \\quad \\text{bottom} \\to 0: \\ \\frac{0}{0} \\text{ is indeterminate, so simplify first.}`] });
      }
    }
  }

  // 2 and 3: rational functions
  const parts = rationalParts(node, v);
  if (parts) {
    let { top: p, bottom: q } = parts;
    p = trim(p); q = trim(q);
    if (Number.isFinite(a)) {
      let cancelled = 0;
      const before = `\\frac{${polyTex(p, v)}}{${polyTex(q, v)}}`;
      while (Math.abs(evalPoly(p, a)) < 1e-9 && Math.abs(evalPoly(q, a)) < 1e-9 && q.length > 1 && cancelled < 10) {
        p = trim(divideByRoot(p, a)); q = trim(divideByRoot(q, a)); cancelled++;
      }
      if (cancelled) {
        const f = factorTex(a, v);
        const power = cancelled > 1 ? `^{${cancelled}}` : '';
        steps.push({
          title: `Factor and cancel ${f.replace(/[()]/g, '')}${cancelled > 1 ? ` (${cancelled} times)` : ''}`,
          lines: [
            `${before} = \\frac{${f}${power}\\left(${polyTex(p, v)}\\right)}{${f}${power}\\left(${polyTex(q, v)}\\right)} = \\frac{${polyTex(p, v)}}{${polyTex(q, v)}}`,
          ],
        });
        const qa = evalPoly(q, a), pa = evalPoly(p, a);
        if (Math.abs(qa) > 1e-12) {
          const val = pa / qa;
          steps.push({ title: 'Substitute again', lines: [`\\lim_{${arrow}} \\frac{${polyTex(p, v)}}{${polyTex(q, v)}} = \\frac{${texValue(pa)}}{${texValue(qa)}} = ${texValue(val)}`] });
          return { value: val, exactTex: texValue(val), method: 'factor', steps };
        }
      }
    } else {
      // x → ±∞: compare degrees
      const dp = p.length - 1, dq = q.length - 1;
      const lead = p.at(-1) / q.at(-1);
      const lines = [`\\text{Divide top and bottom by } ${v}^{${Math.max(dp, dq)}} \\text{, the highest power.}`];
      let value;
      if (dp < dq) { value = 0; lines.push(`\\text{The bottom has the higher degree (${dq} > ${dp}), so the fraction} \\to 0`); }
      else if (dp === dq) { value = lead; lines.push(`\\text{Same degree: the limit is the ratio of leading coefficients } \\frac{${texValue(p.at(-1))}}{${texValue(q.at(-1))}} = ${texValue(lead)}`); }
      else {
        const sign = Math.sign(lead) * (a === -INF && (dp - dq) % 2 === 1 ? -1 : 1);
        value = sign > 0 ? INF : -INF;
        lines.push(`\\text{The top has the higher degree (${dp} > ${dq}), so the fraction grows without bound:} \\ ${texValue(value)}`);
      }
      steps.push({ title: 'Compare the highest powers', lines });
      return { value, exactTex: texValue(value), method: 'degrees', steps };
    }
  }

  // 4. L'Hôpital's rule for 0/0 and ∞/∞
  if (isQuotient) {
    let u = top.args[0], w = top.args[1];
    for (let round = 1; round <= 5; round++) {
      const ua = Number.isFinite(a) ? valueAt(u, v, a) : numericLimit(u, v, a).value;
      const wa = Number.isFinite(a) ? valueAt(w, v, a) : numericLimit(w, v, a).value;
      const zeroZero = Math.abs(ua) < 1e-12 && Math.abs(wa) < 1e-12;
      const infInf = !Number.isFinite(ua) && !Number.isFinite(wa) && !Number.isNaN(ua) && !Number.isNaN(wa);
      if (!zeroZero && !infInf) {
        if (round === 1) break;
        const fnNow = div(u, w);
        // A number over something growing without bound → 0; growing over a non-zero number → ±∞
        if (Number.isFinite(ua) && (wa === INF || wa === -INF)) {
          steps.push({ title: 'Substitute', lines: [`${lim(fnNow)}: \\ \\text{top} \\to ${texValue(ua)}, \\ \\text{bottom} \\to ${texValue(wa)} \\ \\Rightarrow\\ 0`] });
          return { value: 0, exactTex: '0', method: 'lhopital', steps };
        }
        if ((ua === INF || ua === -INF) && Number.isFinite(wa) && Math.abs(wa) > 1e-12) {
          const val = Math.sign(ua) * Math.sign(wa) > 0 ? INF : -INF;
          steps.push({ title: 'Substitute', lines: [`${lim(fnNow)}: \\ \\text{top} \\to ${texValue(ua)}, \\ \\text{bottom} \\to ${texValue(wa)} \\ \\Rightarrow\\ ${texValue(val)}`] });
          return { value: val, exactTex: texValue(val), method: 'lhopital', steps };
        }
        if (Number.isFinite(ua) && Number.isFinite(wa) && Math.abs(wa) > 1e-12) {
          const val = ua / wa;
          const fn2 = div(u, w);
          const ex = Number.isFinite(a) ? exactAt(fn2, v, a) : { tex: texValue(val) };
          steps.push({ title: 'Substitute', lines: [`${lim(fn2)} = ${ex.tex}`] });
          return { value: val, exactTex: ex.tex.split(' \\approx ')[0], method: 'lhopital', steps };
        }
        break;
      }
      const du = bestForm(differentiate(u, v).result), dw = bestForm(differentiate(w, v).result);
      steps.push({
        title: `L'Hôpital's rule${round > 1 ? ` (again, round ${round})` : ''}: the form is ${zeroZero ? '0/0' : '∞/∞'}`,
        lines: [
          `${lim(div(u, w))} = \\lim_{${arrow}} \\frac{\\frac{d}{d${v}}\\left[${tex(polish(u))}\\right]}{\\frac{d}{d${v}}\\left[${tex(polish(w))}\\right]} = ${lim(div(du, dw))}`,
        ],
      });
      u = du; w = dw;
    }
  }

  // 5. Last resort: a careful numerical estimate
  const est = numericLimit(node, v, a, dir);
  if (Number.isNaN(est.value)) {
    steps.push({ title: 'No single value', lines: ['\\text{The values do not settle on one number as } ' + arrow + (dir === 'both' && est.left !== null && est.right !== null && est.left !== est.right && Number.isFinite(est.left) ? `\\text{ (left gives ${texValue(est.left)}, right gives ${texValue(est.right)})}` : '')] });
    return { value: NaN, exactTex: '\\text{does not exist}', method: 'numeric', steps, sides: est };
  }
  // Name well-known constants the estimate lands on (e.g. (1 + 1/x)^x → e)
  const known = [[Math.E, 'e'], [Math.PI, '\\pi'], [Math.SQRT2, '\\sqrt{2}'], [Math.LN2, '\\ln 2'], [1 / Math.E, '\\frac{1}{e}']]
    .find(([c]) => Number.isFinite(est.value) && Math.abs(est.value - c) < 1e-4);
  const shown = known ? `${known[1]} \\approx ${texValue(est.value)}` : texValue(est.value);
  steps.push({ title: 'Estimate from values close to the point', lines: [`\\text{As } ${arrow}, \\ f \\to ${shown} \\ \\text{(numerical estimate)}`] });
  return { value: known ? known[0] : est.value, exactTex: known ? known[1] : texValue(est.value), method: 'numeric', steps, sides: est, estimated: true };
}

export function readPoint(text) {
  const s = String(text ?? '').trim().toLowerCase().replace(/\s+/g, '');
  if (['inf', 'infinity', '∞', '+inf', '+infinity', '+∞', 'oo'].includes(s)) return INF;
  if (['-inf', '-infinity', '-∞', '−∞', '-oo'].includes(s)) return -INF;
  if (!s) throw new EngineError('Enter the point x approaches (a number, inf or -inf).');
  try {
    const y = math.evaluate(s.replace(/π/g, 'pi'));
    if (typeof y === 'number' && Number.isFinite(y)) return y;
  } catch { /* falls through */ }
  throw new EngineError(`"${text}" is not a point. Use a number, pi/2, inf or -inf.`);
}
