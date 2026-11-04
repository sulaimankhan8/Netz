/**
 * Integral calculator: the maths for /integral-calculator, using src/app/utils/symbolic/integral.js.
 * Every antiderivative is checked before it is shown: its derivative (taken numerically) must match f
 * at several points. If no method fits, or the check fails, the page says so instead of guessing;
 * a definite integral then still gets a numerical value (adaptive Simpson's rule), clearly labelled.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';
import { math, parse, variablesOf, tex, text, polish, sub, tidy } from '../symbolic/tree';
import { integrate } from '../symbolic/integral';
import { cleanest, recognise } from '../symbolic/present';

// The exact-value recogniser lives with the other presentation helpers; re-exported for older imports
export { recognise };

const SAMPLE = [0.37, 0.81, 1.29, 2.13, -0.64, 3.7, -2.2, 0.05];

const valueOf = (node, scope) => {
  try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; }
};

/** Does F′ (central difference) match f at the sample points where both are defined? */
export function derivativeMatches(F, f, v, others) {
  let compared = 0;
  for (const x of SAMPLE) {
    const h = 1e-5 * Math.max(1, Math.abs(x));
    const at = (t) => valueOf(F, { ...others, [v]: t });
    const fx = valueOf(f, { ...others, [v]: x });
    const d = (at(x + h) - at(x - h)) / (2 * h);
    if (!Number.isFinite(fx) || !Number.isFinite(d) || Math.abs(fx) > 1e6) continue;
    compared++;
    if (Math.abs(d - fx) > 1e-4 * Math.max(1, Math.abs(fx))) return false;
  }
  return compared >= 3;
}

/** Adaptive Simpson's rule on [a, b]. */
export function simpson(g, a, b, tol = 1e-10) {
  const S = (l, r, fl, fm, fr) => ((r - l) / 6) * (fl + 4 * fm + fr);
  let evals = 0;
  const rec = (l, r, fl, fm, fr, whole, eps, depth) => {
    const m = (l + r) / 2, lm = (l + m) / 2, rm = (m + r) / 2;
    const flm = g(lm), frm = g(rm);
    evals += 2;
    const left = S(l, m, fl, flm, fm), right = S(m, r, fm, frm, fr);
    if (depth > 40 || evals > 200000 || Math.abs(left + right - whole) <= 15 * eps) return left + right + (left + right - whole) / 15;
    return rec(l, m, fl, flm, fm, left, eps / 2, depth + 1) + rec(m, r, fm, frm, fr, right, eps / 2, depth + 1);
  };
  const fa = g(a), fb = g(b), fm = g((a + b) / 2);
  return rec(a, b, fa, fm, fb, S(a, b, fa, fm, fb), tol, 0);
}

/** A number as exact LaTeX when it is a simple fraction, else 6 significant figures. */
function texNumber(y) {
  const f = toFraction(y, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  return String(Number(y.toPrecision(6)));
}


/** The limit text as a node (so pi stays π), and its value. */
function readLimit(t, label) {
  const value = readConstant(t, label);
  let node;
  try { node = math.parse(String(t).trim().replace(/π/g, 'pi')); } catch { node = math.parse(String(value)); }
  return { value, node, tex: tex(polish(node)) };
}

export function solve({ f: tf, kind = 'indefinite', a: ta = '', b: tb = '' }) {
  const node = parse(tf, 'f(x)');
  if (!['indefinite', 'definite'].includes(kind)) throw new EngineError('Choose an indefinite or a definite integral.');
  const vars = [...variablesOf(node)];
  const v = vars.includes('x') || vars.length === 0 ? 'x' : vars.length === 1 ? vars[0] : 'x';
  const others = vars.filter((s) => s !== v);
  const notes = [];
  if (others.length) {
    if (kind === 'definite') throw new EngineError(`A definite integral can only use ${v} (this also uses ${others.join(', ')}).`);
    notes.push(`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} treated as ${others.length === 1 ? 'a constant' : 'constants'} (we integrate with respect to ${v}).`);
  }
  const scope = Object.fromEntries(others.map((s, i) => [s, 1.7 + i * 0.3]));

  // Step-by-step antiderivative, kept only when it checks out
  let F = null, steps = [], why = null, raw = null;
  try {
    const r = integrate(node, v);
    // The most readable form that still checks out
    F = cleanest(r.result, v, (g) => derivativeMatches(g, node, v, scope));
    if (F) { steps = r.steps; raw = tex(polish(tidy(r.result))); }
    else why = 'NETZ found an answer but it failed the check, so it is not shown.';
  } catch (e) {
    if (!(e instanceof EngineError)) throw e;
    why = e.message;
  }

  const fAt = (x) => valueOf(node, { ...scope, [v]: x });
  const base = {
    variable: v, kind, f: tex(polish(node)), fText: text(node), notes, fAt,
    found: Boolean(F), why, steps,
    answer: F ? tex(polish(F)) : null, raw, simplified: Boolean(F) && raw !== tex(polish(F)), answerText: F ? text(polish(F)) : null,
    FAt: F ? (x) => valueOf(F, { ...scope, [v]: x }) : null,
    plot: null,
  };

  if (kind === 'indefinite') {
    if (!F) throw new EngineError(`${why} Try a definite integral instead: NETZ can always give its value numerically.`);
    return { ...base, verified: true, result: `${text(polish(F))} + C` };
  }

  // Definite integral
  const A = readLimit(ta, 'The lower limit a');
  const B = readLimit(tb, 'The upper limit b');
  if (A.value === B.value) return { ...base, a: A, b: B, value: 0, valueTex: '0', exact: true, numeric: 0, verified: true, evaluation: [], result: 0 };
  const lo = Math.min(A.value, B.value), hi = Math.max(A.value, B.value);

  // f must be defined (and not blow up) all the way from a to b
  for (let k = 0; k <= 400; k++) {
    const x = lo + ((hi - lo) * k) / 400;
    const y = fAt(x);
    if (!Number.isFinite(y)) {
      throw new EngineError(`f(${v}) is not defined at ${v} ≈ ${Number(x.toPrecision(4))}, which lies between the limits. That is an improper integral, which NETZ doesn't handle yet.`);
    }
  }
  const numeric = simpson(fAt, A.value, B.value);
  if (!Number.isFinite(numeric) || Math.abs(numeric) > 1e12) throw new EngineError('The integral does not settle to a number between these limits.');

  if (F) {
    const Fb = valueOf(F, { [v]: B.value }), Fa = valueOf(F, { [v]: A.value });
    const value = Fb - Fa;
    if (Number.isFinite(value) && Math.abs(value - numeric) <= 1e-6 * Math.max(1, Math.abs(numeric))) {
      const known = recognise(value);
      const valueTex = known && !toFraction(value, 1000, 1e-9) ? `${known} \\approx ${texNumber(value)}` : (known || texNumber(value));
      const exact = Boolean(known);
      const show = (y) => recognise(y) || texNumber(y);
      const Ft = tex(polish(F));
      const evaluation = [
        `\\int_{${A.tex}}^{${B.tex}} ${base.f}\\,d${v} = \\Big[\\,${Ft}\\,\\Big]_{${A.tex}}^{${B.tex}}`,
        `= F(${B.tex}) - F(${A.tex}) = ${show(Fb)} - ${Fa < 0 ? `\\left(${show(Fa)}\\right)` : show(Fa)}`,
        `= ${valueTex}`,
      ];
      return { ...base, a: A, b: B, value, valueTex, exact, numeric, verified: true, evaluation, result: value };
    }
    // The antiderivative jumps somewhere in [a, b] (or the check disagrees): use the number instead
    base.found = false;
    base.why = 'The antiderivative is not continuous between these limits, so F(b) − F(a) would be wrong here.';
  }
  return { ...base, a: A, b: B, value: numeric, valueTex: `${texNumber(numeric)}`, exact: false, numeric, verified: false, evaluation: [], result: numeric };
}
