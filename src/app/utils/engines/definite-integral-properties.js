/**
 * Properties of definite integrals: the maths for /properties-of-definite-integrals.
 * Type f and the limits. NETZ finds the value, then tests each property on YOUR integral and says which ones apply here
 * and what shortcut they give (an odd function over [−c, c] is 0, the King's rule f(x) + f(a+b−x) = k, a period, …).
 * Every shortcut is checked against the direct value.
 */
import { EngineError } from '../numeric/steps';
import { readLimit, between, valueOf } from './definite-helpers';
import { simpson } from './integral';
import { parse, variablesOf, tex, polish, tidy, sym, add, sub, paren } from '../symbolic/tree';
import { integrate } from '../symbolic/integral';
import { texValue } from '../symbolic/limit';

const ex = (y) => texValue(Math.abs(y) < 1e-10 ? 0 : y);
const close = (p, q) => Math.abs(p - q) <= 1e-6 * Math.max(1, Math.abs(p), Math.abs(q));

/** Does g(x) hold for several sample points (skipping points where it is undefined)? Needs at least 3 usable points. */
function holds(test, xs) {
  let used = 0;
  for (const x of xs) {
    const r = test(x);
    if (r === null) continue;
    used++;
    if (!r) return false;
  }
  return used >= 3;
}

const PERIODS = [['\\pi', Math.PI], ['2\\pi', 2 * Math.PI], ['\\tfrac{\\pi}{2}', Math.PI / 2], ['1', 1], ['2', 2], ['4', 4]];

export function solve({ f: tf, a: ta, b: tb }) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const A = readLimit(ta, 'The lower limit a'), B = readLimit(tb, 'The upper limit b');
  const a = A.value, b = B.value;
  const g = (x) => valueOf(f, { [v]: x });

  // The direct value
  let direct;
  try { direct = { ...between(integrate(f, v).result, f, v, A, B), exact: true }; } catch (e) {
    if (!(e instanceof EngineError) && e.name !== 'EngineError') throw e;
    const y = simpson(g, Math.min(a, b), Math.max(a, b)) * (a <= b ? 1 : -1);
    if (!Number.isFinite(y)) throw new EngineError('f is not defined all the way between the limits, so the integral does not settle.');
    direct = { value: y, valueTex: ex(y), exact: false };
  }
  const V = direct.value;
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const num = (x, y) => simpson(g, x, y);
  const samples = (from, to) => Array.from({ length: 12 }, (_, i) => from + ((to - from) * (i + 0.5)) / 12);

  const props = [];
  const steps = [];
  steps.push({
    title: 'The value of the integral',
    text: direct.exact ? 'First find the integral directly: this is the value every shortcut must agree with.' : 'NETZ could not find an exact antiderivative, so this value is numerical. Every shortcut is compared with it.',
    lines: [`\\int_{${A.tex}}^{${B.tex}} ${tex(polish(f))}\\,d${v} = ${direct.valueTex}${direct.exact ? '' : '\\ \\text{(numerical)}'}`],
  });

  // 1. Same limits
  props.push({ name: 'Equal limits', formula: '\\int_a^a f(x)\\,dx = 0', applies: a === b, note: a === b ? 'The two limits are equal, so the area has no width: the answer is 0.' : 'Needs a = b.' });

  // 2. Reversing the limits (always true)
  props.push({ name: 'Swap the limits', formula: '\\int_b^a f(x)\\,dx = -\\int_a^b f(x)\\,dx', applies: true, always: true, note: `Swapping the limits changes the sign: the integral from ${B.tex} to ${A.tex} is ${ex(-V)}.` });

  // 3. Even and odd functions on [−c, c]
  const symmetric = Math.abs(a + b) < 1e-12 && b > 0;
  if (symmetric) {
    const even = holds((x) => { const p = g(x), q = g(-x); return Number.isFinite(p) && Number.isFinite(q) ? close(p, q) : null; }, samples(0.05, b));
    const odd = holds((x) => { const p = g(x), q = g(-x); return Number.isFinite(p) && Number.isFinite(q) ? close(p, -q) : null; }, samples(0.05, b));
    if (even) {
      const half = num(0, b);
      props.push({ name: 'Even function on [−c, c]', formula: '\\int_{-c}^{c} f\\,dx = 2\\int_0^{c} f\\,dx', applies: true, note: `f(−x) = f(x), so the left half equals the right half: 2 × ${ex(half)} = ${ex(2 * half)}.`, check: close(2 * half, V) });
    } else if (odd) {
      props.push({ name: 'Odd function on [−c, c]', formula: '\\int_{-c}^{c} f\\,dx = 0', applies: true, note: 'f(−x) = −f(x), so the left half cancels the right half: the answer is 0.', check: close(0, V) });
    } else {
      props.push({ name: 'Even or odd on [−c, c]', formula: '\\int_{-c}^{c} f\\,dx = 2\\int_0^c f \\text{ (even) or } 0 \\text{ (odd)}', applies: false, note: 'The limits are symmetric, but f is neither even nor odd.' });
    }
  } else {
    props.push({ name: 'Even or odd on [−c, c]', formula: '\\int_{-c}^{c} f\\,dx = 2\\int_0^c f \\text{ (even) or } 0 \\text{ (odd)}', applies: false, note: 'Needs limits −c and c.' });
  }

  // 4. King's rule: f(x) + f(a + b − x) = k
  const rev = (x) => g(a + b - x);
  const kvals = samples(lo, hi).map((x) => { const p = g(x), q = rev(x); return Number.isFinite(p) && Number.isFinite(q) ? p + q : null; }).filter((y) => y !== null);
  const kConst = kvals.length >= 3 && kvals.every((y) => close(y, kvals[0]));
  const mirror = sub(add(paren(A.node), paren(B.node)), sym(v));
  const reflected = tidy(f.transform((nd) => (nd.isSymbolNode && nd.name === v ? mirror : nd)));
  const mirrorEq = a !== b && holds((x) => { const p = g(x), q = rev(x); return Number.isFinite(p) && Number.isFinite(q) ? close(p, q) : null; }, samples(lo, hi));
  if (kConst && a !== b) {
    const k = kvals[0];
    props.push({
      name: "King's rule (replace x by a + b − x)",
      formula: '\\int_a^b f(x)\\,dx = \\int_a^b f(a + b - x)\\,dx',
      applies: true,
      note: `Here f(x) + f(${A.tex} + ${B.tex} − ${v}) = ${ex(k)} for every x. Add the integral to its reflected copy: 2I = ${ex(k)}·(b − a), so I = ${ex((k * (b - a)) / 2)}.`,
      check: close((k * (b - a)) / 2, V),
    });
  } else if (a !== b) {
    props.push({
      name: "King's rule (replace x by a + b − x)",
      formula: '\\int_a^b f(x)\\,dx = \\int_a^b f(a + b - x)\\,dx',
      applies: true, always: true,
      note: `This is always true. Here f(${A.tex} + ${B.tex} − ${v}) = ${tex(polish(reflected))}. It helps when f(x) + f(a + b − x) is a constant; here it is not, so it gives no shortcut.`,
    });
  } else props.push({ name: "King's rule (replace x by a + b − x)", formula: '\\int_a^b f(x)\\,dx = \\int_a^b f(a+b-x)\\,dx', applies: false, note: 'Needs a ≠ b.' });

  // 5. ∫₀^{2c}: f(2c − x) = ± f(x)
  if (Math.abs(a) < 1e-12 && b > 0) {
    const same = mirrorEq;
    const opposite = holds((x) => { const p = g(x), q = rev(x); return Number.isFinite(p) && Number.isFinite(q) ? close(p, -q) : null; }, samples(0, b));
    if (same) {
      const half = num(0, b / 2);
      props.push({ name: 'Over [0, 2c]: f(2c − x) = f(x)', formula: '\\int_0^{2c} f\\,dx = 2\\int_0^{c} f\\,dx', applies: true, note: `The graph is a mirror image about x = c, so the answer is 2 × ${ex(half)} = ${ex(2 * half)}.`, check: close(2 * half, V) });
    } else if (opposite) {
      props.push({ name: 'Over [0, 2c]: f(2c − x) = −f(x)', formula: '\\int_0^{2c} f\\,dx = 0', applies: true, note: 'The second half is the first half upside down, so they cancel: the answer is 0.', check: close(0, V) });
    } else props.push({ name: 'Over [0, 2c]: f(2c − x) = ± f(x)', formula: '\\int_0^{2c} f\\,dx = 2\\int_0^{c} f \\text{ or } 0', applies: false, note: 'f(2c − x) is neither f(x) nor −f(x).' });
  } else props.push({ name: 'Over [0, 2c]: f(2c − x) = ± f(x)', formula: '\\int_0^{2c} f\\,dx = 2\\int_0^{c} f \\text{ or } 0', applies: false, note: 'Needs limits 0 and 2c.' });

  // 6. Periodic functions
  let periodFound = null;
  for (const [t, T] of PERIODS) {
    if (holds((x) => { const p = g(x), q = g(x + T); return Number.isFinite(p) && Number.isFinite(q) ? close(p, q) : null; }, samples(0.1, 3))) { periodFound = [t, T]; break; }
  }
  if (periodFound && a !== b) {
    const [t, T] = periodFound;
    const m = (hi - lo) / T;
    if (Math.abs(m - Math.round(m)) < 1e-9 && Math.round(m) >= 1) {
      const one = num(lo, lo + T);
      props.push({ name: 'Periodic function', formula: '\\int_a^{a+nT} f\\,dx = n\\int_a^{a+T} f\\,dx', applies: true, note: `f repeats every ${t}, and the interval is ${Math.round(m)} period${Math.round(m) === 1 ? '' : 's'} long: ${Math.round(m)} × ${ex(one)} = ${ex(Math.round(m) * one)}.`, check: close(Math.round(m) * one, Math.abs(V)) });
    } else props.push({ name: 'Periodic function', formula: '\\int_a^{a+nT} f\\,dx = n\\int_a^{a+T} f\\,dx', applies: false, note: `f repeats every ${t}, but the interval is not a whole number of periods.` });
  } else props.push({ name: 'Periodic function', formula: '\\int_a^{a+nT} f\\,dx = n\\int_a^{a+T} f\\,dx', applies: false, note: 'NETZ found no common period (π, 2π, π/2, 1, 2, 4) for f.' });

  // 7. Splitting the interval
  if (a !== b) {
    const c = (a + b) / 2;
    const left = simpson(g, lo, c), right = simpson(g, c, hi);
    const sgn = a <= b ? 1 : -1;
    props.push({ name: 'Split the interval', formula: '\\int_a^b f\\,dx = \\int_a^c f\\,dx + \\int_c^b f\\,dx', applies: true, always: true, note: `Cut at the middle, c = ${ex(c)}: ${ex(sgn * left)} + ${ex(sgn * right)} = ${ex(sgn * (left + right))}.`, check: close(sgn * (left + right), V) });
  }

  props.forEach((p) => {
    if (p.applies && !p.always) steps.push({ title: `Property that applies here: ${p.name}`, text: p.note, formula: p.formula, lines: [`\\text{Shortcut} = \\text{direct value} = ${direct.valueTex}`] });
  });
  if (!props.some((p) => p.applies && !p.always)) {
    steps.push({ title: 'No shortcut applies here', text: 'None of the symmetry shortcuts fits this integral (the "always true" rules below still hold), so the direct method above is the way.', lines: [`\\int_{${A.tex}}^{${B.tex}} ${tex(polish(f))}\\,d${v} = ${direct.valueTex}`] });
  }

  const verified = props.every((p) => p.check === undefined || p.check);
  return {
    variable: v, f: tex(polish(f)), a: A.tex, b: B.tex, value: V, valueTex: direct.valueTex, exact: direct.exact,
    props, shortcuts: props.filter((p) => p.applies && !p.always).length,
    verified, notes: direct.exact ? [] : ['The direct value is numerical, so the shortcut checks are numerical too.'], steps, result: V, plot: null,
  };
}
