/**
 * Sign analysis of f'(x), shared by the increasing/decreasing and maxima/minima pages.
 *   1. f'(x) from the symbolic engine (tidiest form)
 *   2. critical points: f'(x) = 0, and where f' is undefined (or f stops being defined)
 *   3. one test value in each interval between them: the sign of f' there
 * Range: polynomials and fractions of polynomials are solved exactly over all real numbers;
 * other functions are searched numerically on a finite interval (the page says which).
 */
import { EngineError } from '../numeric/steps';
import { math, tex, polish } from './tree';
import { differentiate } from './derivative';
import { cleanest } from './present';
import { zerosOf, texOf } from './roots';
import { rationalParts } from './poly';

export const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const close = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

/** f' in its tidiest form (checked against the raw derivative). */
export function derivativeOf(node, v) {
  const raw = differentiate(node, v).result;
  const same = (g) => [0.37, 1.29, 2.13, -0.71].every((x) => { const p = valueAt(g, v, x), q = valueAt(raw, v, x); return !Number.isFinite(q) || close(p, q); });
  return cleanest(raw, v, same) || raw;
}

/** Interval end as LaTeX. */
export const endTex = (x, t) => (x === -Infinity ? '-\\infty' : x === Infinity ? '\\infty' : t ?? texOf(x));

/**
 * node: f; v: variable; range: { lo, hi } (may be ±Infinity for exact cases).
 * Returns { d, dTex, exact, zeros, undefinedAt, segments } where each segment is
 * { lo, hi, loTex, hiTex, test, sign } and sign is 1 (f' > 0), −1, 0, or null (f not defined there).
 */
export function signAnalysis(node, v, range) {
  const d = derivativeOf(node, v);
  const exact = Boolean(rationalParts(d, v));
  if (!exact && (!Number.isFinite(range.lo) || !Number.isFinite(range.hi))) {
    // Not solvable exactly and no interval given: search a sensible window and say so
    range = { lo: -10, hi: 10, loTex: '-10', hiTex: '10', given: false, defaulted: '[−10, 10]' };
  }
  const z = zerosOf(d, v, exact ? { lo: range.lo, hi: range.hi } : range);
  if (z.identicallyZero) throw new EngineError("f'(x) = 0 everywhere: the function is constant, so it is neither increasing nor decreasing.");
  const inside = (p) => p.x > range.lo + 1e-12 && p.x < range.hi - 1e-12;
  const zeros = z.zeros.filter(inside);
  const undefinedAt = z.undefinedAt.filter(inside);
  // One cut per point (a corner like |x| at 0 can be found both as a sign change and as a gap)
  const cuts = [];
  for (const p of [...undefinedAt.map((q) => ({ ...q, kind: 'undefined' })), ...zeros.map((q) => ({ ...q, kind: 'zero' }))]) {
    if (!cuts.some((c) => Math.abs(c.x - p.x) < 1e-6 * Math.max(1, Math.abs(p.x)))) cuts.push(p);
  }
  cuts.sort((a, b) => a.x - b.x);

  const ends = [{ x: range.lo, tex: endTex(range.lo, range.loTex) }, ...cuts, { x: range.hi, tex: endTex(range.hi, range.hiTex) }];
  const segments = [];
  for (let i = 0; i + 1 < ends.length; i++) {
    const [L, R] = [ends[i], ends[i + 1]];
    let test;
    if (L.x === -Infinity && R.x === Infinity) test = 0;
    else if (L.x === -Infinity) test = R.x - Math.max(1, Math.abs(R.x) * 0.5);
    else if (R.x === Infinity) test = L.x + Math.max(1, Math.abs(L.x) * 0.5);
    else test = (L.x + R.x) / 2;
    // Nice test values for the table: a whole number inside the interval when there is one
    const whole = Math.round(test);
    if (whole > L.x + 1e-9 && whole < R.x - 1e-9) test = whole;
    const fv = valueAt(node, v, test), dv = valueAt(d, v, test);
    const sign = !Number.isFinite(fv) || !Number.isFinite(dv) ? null : Math.abs(dv) < 1e-12 ? 0 : Math.sign(dv);
    segments.push({ lo: L.x, hi: R.x, loTex: L.tex, hiTex: R.tex, test, testTex: texOf(test), dAtTest: dv, sign, leftCut: i > 0 ? ends[i] : null });
  }
  return { d, dTex: tex(polish(d)).trim(), exact, zeros, undefinedAt, cuts, segments, range };
}

/** Union of open intervals in LaTeX, merging neighbours separated only by a zero of f' (x³ is increasing on all of ℝ). */
export function unionTex(segments, want, cuts) {
  const runs = [];
  for (const s of segments) {
    if (s.sign !== want) continue;
    const last = runs.at(-1);
    const joined = last && last.hi === s.lo && cuts.some((c) => c.kind === 'zero' && Math.abs(c.x - s.lo) < 1e-12);
    if (joined) { last.hi = s.hi; last.hiTex = s.hiTex; } else runs.push({ ...s });
  }
  if (!runs.length) return null;
  return runs.map((r) => (r.lo === -Infinity && r.hi === Infinity ? '\\mathbb{R}' : `\\left(${r.loTex},\\ ${r.hiTex}\\right)`)).join(' \\cup ');
}

/** The interval the user typed, or the default for this function. */
export function readRange(node, ta, tb, readConstant) {
  const has = (t) => String(t ?? '').trim() !== '';
  if (has(ta) !== has(tb)) throw new EngineError('Fill in both ends of the interval, or neither.');
  if (has(ta)) {
    const lo = readConstant(ta, 'The start of the interval'), hi = readConstant(tb, 'The end of the interval');
    if (!(hi > lo)) throw new EngineError('The end of the interval must be bigger than the start.');
    const t = (s) => { try { return tex(polish(math.parse(String(s).trim().replace(/π/g, 'pi')))).trim(); } catch { return texOf(Number(s)); } };
    return { lo, hi, loTex: t(ta), hiTex: t(tb), given: true };
  }
  let trig = false;
  node.traverse((m) => { if (m.isFunctionNode && ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(m.fn.name)) trig = true; });
  if (trig) return { lo: 0, hi: 2 * Math.PI, loTex: '0', hiTex: '2\\pi', given: false, defaulted: '[0, 2π]' };
  return { lo: -Infinity, hi: Infinity, given: false };
}
