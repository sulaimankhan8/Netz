/**
 * Continuity at a point: the maths for /continuity-calculator (catalog 6A).
 * f is one expression or pieces ("x^2 for x < 1; 2x - 1 for x >= 1", "(x^2-1)/(x-1) for x != 1; 3 for x = 1").
 * At x = a: the left limit, the right limit and f(a). Equal → continuous; limits equal but f(a) different or missing →
 * removable; limits different → jump; a limit infinite → infinite discontinuity. One unknown letter (k) is solved for
 * so that f is continuous.
 */
import { EngineError } from '../numeric/steps';
import { math, parse, polish, variablesOf } from '../symbolic/tree';
import { mtex, exactTex, snap } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { limit } from '../symbolic/limit';

const num0 = (t) => { const v = math.evaluate(String(t).trim().replace(/π/g, 'pi')); if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`"${t}" is not a number.`); return v; };

/** "expr for x < 2" → { g, test(x) }. */
function readPieces(text) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type f(x).');
  if (parts.length === 1 && !/\b(for|if)\b/.test(parts[0])) return [{ g: parse(parts[0], 'f(x)'), test: () => true, cond: '' }];
  return parts.map((p) => {
    const m = p.match(/^(.+?)\s+(?:for|if)\s+(.+)$/);
    if (!m) throw new EngineError(`Write each piece like "x^2 for x < 1" (could not read "${p}").`);
    const c = m[2].replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=').replace(/\s+/g, '');
    let test;
    let mm;
    if ((mm = c.match(/^(.+)<x<(.+)$/))) { const lo = num0(mm[1]), hi = num0(mm[2]); test = (x) => x > lo && x < hi; }
    else if ((mm = c.match(/^x(<=|<|>=|>|=|!=)(.+)$/))) {
      const k = num0(mm[2]), op = mm[1];
      test = { '<': (x) => x < k, '<=': (x) => x <= k, '>': (x) => x > k, '>=': (x) => x >= k, '=': (x) => Math.abs(x - k) < 1e-12, '!=': (x) => Math.abs(x - k) >= 1e-12 }[op];
    } else throw new EngineError(`The condition "${m[2]}" should look like x < 1, x >= 2, x = 0, x != 1 or 0 < x < 2.`);
    return { g: parse(m[1], 'A piece'), test, cond: m[2] };
  });
}

export function solve({ f, a }) {
  const pieces = readPieces(f);
  const A = num0(a);
  const letters = [...new Set(pieces.flatMap((p) => [...variablesOf(p.g)]))].filter((v) => v !== 'x');
  if (letters.length > 1) throw new EngineError(`Use at most one unknown besides x (found ${letters.join(', ')}).`);
  const k = letters[0];
  const pick = (x) => pieces.find((p) => p.test(x));
  const left = pick(A - 1e-9), right = pick(A + 1e-9), at = pick(A);
  if (!left || !right) throw new EngineError(`f is not given on both sides of x = ${A}.`);
  const evalLR = (kv) => {
    const sub2 = (n) => (k ? substitute(n, k, numNode(kv)) : n);
    const L = limit(sub2(left.g), 'x', A, 'left'), R = limit(sub2(right.g), 'x', A, 'right');
    let F = NaN;
    if (at) { try { F = sub2(at.g).evaluate({ x: A }); } catch { F = NaN; } }
    return { L: L.value, R: R.value, F, Ltex: L.exactTex ?? exactTex(L.value), Rtex: R.exactTex ?? exactTex(R.value) };
  };
  const steps = [];
  let kv = null;
  if (k) {
    // L(k) − R(k) (or − f(a)) is usually linear in k: two values, then solve
    const gap = (v) => { const r = evalLR(v); return Number.isFinite(r.F) && at !== left && at !== right ? (Math.abs(r.L - r.R) > 1e-9 ? r.L - r.R : r.L - r.F) : r.L - r.R; };
    const g0 = gap(0), g1 = gap(1);
    if (!Number.isFinite(g0) || !Number.isFinite(g1) || Math.abs(g1 - g0) < 1e-14) throw new EngineError(`NETZ could not solve for ${k}.`);
    kv = snap(-g0 / (g1 - g0));
    if (Math.abs(gap(kv)) > 1e-7) throw new EngineError(`No single value of ${k} makes f continuous at x = ${A}.`);
  }
  const r = evalLR(kv ?? 0);
  const inf = (v) => !Number.isFinite(v);
  let verdict;
  if (inf(r.L) || inf(r.R)) verdict = 'infinite discontinuity';
  else if (Math.abs(r.L - r.R) > 1e-9 * Math.max(1, Math.abs(r.L))) verdict = 'jump discontinuity';
  else if (!Number.isFinite(r.F) || Math.abs(r.F - r.L) > 1e-9 * Math.max(1, Math.abs(r.L))) verdict = 'removable discontinuity';
  else verdict = 'continuous';
  steps.push({ title: 'Left-hand limit', depth: 0, lines: [`\\lim_{x \\to ${exactTex(A)}^-} ${mtex(polish(left.g))} = ${r.Ltex}`] });
  steps.push({ title: 'Right-hand limit', depth: 0, lines: [`\\lim_{x \\to ${exactTex(A)}^+} ${mtex(polish(right.g))} = ${r.Rtex}`] });
  steps.push({ title: 'Value at the point', depth: 0, lines: [at ? `f(${exactTex(A)}) = ${Number.isFinite(r.F) ? exactTex(r.F) : '\\text{undefined}'}` : `f(${exactTex(A)}) \\text{ is not defined}`] });
  if (k) steps.push({ title: `Solve for ${k}`, depth: 0, lines: [`\\text{Make the limits ${at && at !== left && at !== right ? 'and f(a) ' : ''}equal: } ${k} = ${exactTex(kv)}`] });
  steps.push({ title: 'Conclusion', depth: 0, lines: [verdict === 'continuous' ? `\\text{LHL} = \\text{RHL} = f(a) \\Rightarrow \\text{continuous at } x = ${exactTex(A)}` : `\\text{${verdict} at } x = ${exactTex(A)}`] });
  return { verdict, k: k ? `${k} = ${exactTex(kv)}` : null, left: r.Ltex, right: r.Rtex, value: Number.isFinite(r.F) ? exactTex(r.F) : 'undefined', steps, notes: verdict === 'removable discontinuity' ? ['Redefining f(a) as the common limit would make f continuous.'] : [], verified: true };
}
