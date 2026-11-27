/**
 * The Intermediate Value Theorem: the maths for /intermediate-value-theorem.
 *   If f is continuous on [a, b] and N is between f(a) and f(b), then f(c) = N for some c in (a, b).
 * NETZ checks the two conditions on YOUR numbers (continuity on [a, b], N between f(a) and f(b)), then finds a c by
 * halving the interval (bisection) so the guarantee becomes an actual number. With no target it is the root version
 * (Bolzano): N = 0, so f(a) and f(b) must have opposite signs.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { parse, variablesOf, tex, polish } from '../symbolic/tree';
import { zerosOf } from '../symbolic/roots';
import { texValue } from '../symbolic/limit';

const ex = (y) => texValue(Math.abs(y) < 1e-12 ? 0 : y);
const sig = (y) => Number(y.toPrecision(7));

export function solve({ f: tf, a: ta, b: tb, y: ty = '' }) {
  const f = parse(tf, 'f(x)');
  const vars = [...variablesOf(f)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  if (!vars.length) throw new EngineError('There is no x here: a constant is the same everywhere.');
  const v = vars[0];
  const a = readConstant(ta, 'The left end a'), b = readConstant(tb, 'The right end b');
  if (!(a < b)) throw new EngineError('a must be smaller than b.');
  const rootMode = !String(ty).trim();
  const N = rootMode ? 0 : readConstant(ty, 'The target value N');
  const g = (x) => { try { const y = f.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  const fa = g(a), fb = g(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) throw new EngineError(`f is not defined at x = ${!Number.isFinite(fa) ? a : b}, so the theorem cannot be used on [${a}, ${b}].`);

  // Condition 1: continuous on [a, b]: no break points inside, and no sudden jumps in a fine scan
  const breaks = zerosOf(f, v, { lo: a, hi: b }).undefinedAt;
  let jump = null;
  const M = 2000;
  let prev = fa;
  for (let i = 1; i <= M && !jump; i++) {
    const x = a + ((b - a) * i) / M, y = g(x);
    if (!Number.isFinite(y)) { jump = x; break; }
    if (Math.abs(y - prev) > 50 * Math.max(1, Math.abs(prev)) * ((b - a) / M) * 4 + 1e3) jump = x;
    prev = y;
  }
  const continuous = breaks.length === 0 && jump === null;

  const lo = Math.min(fa, fb), hi = Math.max(fa, fb);
  const between = N >= lo - 1e-12 && N <= hi + 1e-12;
  const steps = [];
  steps.push({
    title: 'State what the theorem needs',
    text: 'Two things must be true. If either fails, the theorem promises nothing.',
    formula: 'f \\text{ continuous on } [a,b], \\quad N \\text{ between } f(a) \\text{ and } f(b)',
    lines: [rootMode ? '\\text{Here } N = 0 \\text{ (we are looking for a root)}' : `N = ${ex(N)}`],
  });
  steps.push({
    title: 'Is f continuous on [a, b]?',
    text: continuous ? 'A function with no gaps, jumps or holes on the interval is continuous there. Polynomials, sin, cos and eˣ are continuous everywhere; a fraction is continuous wherever its bottom is not 0.' : 'There is a break inside the interval, so the first condition fails.',
    lines: [continuous ? `f \\text{ has no break on } [${ex(a)}, ${ex(b)}] \\;\\checkmark` : `f \\text{ breaks at } ${v} = ${breaks.length ? ex(breaks[0].x) : ex(jump)} \\;\\times`],
  });
  steps.push({
    title: 'Find f at both ends',
    lines: [`f(${ex(a)}) = ${ex(fa)}`, `f(${ex(b)}) = ${ex(fb)}`],
  });
  steps.push({
    title: `Is N = ${ex(N)} between f(a) and f(b)?`,
    text: between ? 'N lies between the two end values, so the graph must cross the height N somewhere on the way.' : 'N is outside the range of the two end values.',
    lines: [`${ex(lo)} ${between ? '\\le' : '\\nleq'} ${ex(N)} ${between ? '\\le' : '\\nleq'} ${ex(hi)} \\;${between ? '\\checkmark' : '\\times'}`],
  });

  let c = null, table = [];
  if (continuous && between) {
    if (Math.abs(fa - N) < 1e-12) c = a;
    else if (Math.abs(fb - N) < 1e-12) c = b;
    else {
      let l = a, r = b;
      const sgn = (x) => Math.sign(g(x) - N);
      for (let i = 1; i <= 40 && r - l > 1e-9; i++) {
        const m = (l + r) / 2, s = sgn(m);
        if (i <= 7) table.push({ i, l, r, m, fm: g(m) });
        if (s === 0) { l = r = m; break; }
        if (s === sgn(l)) l = m; else r = m;
      }
      c = (l + r) / 2;
    }
    steps.push({
      title: 'Conclusion: such a c exists',
      text: rootMode ? 'Both conditions hold, so by the theorem there is at least one root of f between a and b.' : 'Both conditions hold, so by the theorem there is at least one c between a and b with f(c) = N.',
      formula: 'f(c) = N \\text{ for some } c \\in (a, b)',
      lines: [`\\text{So there is a } c \\in (${ex(a)}, ${ex(b)}) \\text{ with } f(c) = ${ex(N)}`],
    });
    if (table.length) {
      steps.push({
        title: 'Find such a c by halving the interval',
        text: 'The theorem says c exists; it does not say where. Cut the interval in half again and again, keeping the half where f − N changes sign.',
        lines: [`\\begin{array}{c|ccc} \\text{step} & \\text{left} & \\text{right} & f(\\text{middle}) \\\\ \\hline ${table.map((t) => `${t.i} & ${sig(t.l)} & ${sig(t.r)} & ${sig(t.fm)}`).join(' \\\\ ')} \\end{array}`, `c \\approx ${sig(c)}, \\quad f(c) \\approx ${sig(g(c))}`],
      });
    }
  } else {
    steps.push({
      title: 'Conclusion: the theorem does not apply',
      text: !continuous ? 'A break inside the interval means f can skip over N, so nothing is guaranteed.' : 'This does NOT prove there is no solution: the theorem simply makes no promise here. Try a wider or different interval.',
      lines: [`\\text{No guarantee that } f(c) = ${ex(N)} \\text{ on } (${ex(a)}, ${ex(b)})`],
    });
  }

  const ys = Array.from({ length: 200 }, (_, i) => g(a + ((b - a) * i) / 199)).filter(Number.isFinite);
  const y0 = Math.min(N, ...ys), y1 = Math.max(N, ...ys);
  const pad = (b - a) * 0.15;
  return {
    variable: v, f: tex(polish(f)), a, b, fa, fb, N, rootMode, continuous, between, applies: continuous && between, c, fc: c === null ? null : g(c),
    verified: c === null || Math.abs(g(c) - N) < 1e-5 * Math.max(1, Math.abs(N)),
    steps, notes: [], result: c, plot: { fn: g, view: { x0: a - pad, x1: b + pad, y0, y1 }, lines: [{ a: 0, b: 1, c: -N }], points: c === null ? [] : [{ x: c, y: g(c) }] },
  };
}
