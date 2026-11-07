/**
 * Double integrals, step by step: the maths for /double-integral-calculator (catalog 6G).
 *   order 'dydx'  ∫_a^b ∫_{g1(x)}^{g2(x)} f dy dx   (inner y, the strip is vertical)
 *   order 'dxdy'  ∫_c^d ∫_{h1(y)}^{h2(y)} f dx dy   (inner x, the strip is horizontal)
 *   order 'polar' ∫_α^β ∫_{r1(θ)}^{r2(θ)} f r dr dθ  (the integrand includes the r from dA = r dr dθ)
 * The inner integral is done with the outer letter held constant; then the outer one. Each stage is checked
 * (see symbolic/iterated.js), and the value is cross-checked by Gauss–Legendre quadrature. When a stage
 * can't be done by hand rules, the page still gets the number, clearly labelled.
 */
import { EngineError } from '../numeric/steps';
import { variablesOf } from '../symbolic/tree';
import { definite, readExpr, numericIterated, fnOf, exactTex, mtex, texVar } from '../symbolic/iterated';
import { integrandTex } from '../symbolic/multi';

export const ORDERS = {
  dydx: { inner: 'y', outer: 'x', label: 'dy dx' },
  dxdy: { inner: 'x', outer: 'y', label: 'dx dy' },
  polar: { inner: 'r', outer: 'theta', label: 'dr dθ' },
};

/** Reads the four limits and checks which letters each may use. */
export function readLimits({ innerFrom, innerTo, outerFrom, outerTo }, inner, outer) {
  const lo = readExpr(innerFrom, `The inner lower limit`), hi = readExpr(innerTo, 'The inner upper limit');
  const a = readExpr(outerFrom, 'The outer lower limit'), b = readExpr(outerTo, 'The outer upper limit');
  const free = (n) => [...variablesOf(n)].filter((v) => v !== 'pi' && v !== 'e');
  for (const [n, nm] of [[lo, 'inner lower'], [hi, 'inner upper']]) {
    const bad = free(n).filter((v) => v !== outer);
    if (bad.length) throw new EngineError(`The ${nm} limit may use only ${texName(outer)} (it uses ${bad.join(', ')}).`);
  }
  for (const [n, nm] of [[a, 'outer lower'], [b, 'outer upper']]) {
    if (free(n).length) throw new EngineError(`The ${nm} limit must be a number (it uses ${free(n).join(', ')}).`);
  }
  const av = a.evaluate({}), bv = b.evaluate({});
  if (!(Number.isFinite(av) && Number.isFinite(bv))) throw new EngineError('The outer limits must be finite numbers.');
  return { lo, hi, a, b, av, bv };
}
const texName = (v) => (v === 'theta' ? 'θ' : v);

/** The region's outline (and one sample strip) for the sketch, in x–y coordinates. */
export function regionOf(order, { lo, hi, av, bv }) {
  const loF = fnOf(lo), hiF = fnOf(hi);
  const { inner, outer } = ORDERS[order];
  const toXY = (o, i) => (order === 'dydx' ? [o, i] : order === 'dxdy' ? [i, o] : [i * Math.cos(o), i * Math.sin(o)]);
  const N = 120;
  const low = [], high = [];
  for (let k = 0; k <= N; k++) {
    const o = av + ((bv - av) * k) / N;
    const l = loF({ [outer]: o }), h = hiF({ [outer]: o });
    if (!Number.isFinite(l) || !Number.isFinite(h)) continue;
    low.push(toXY(o, l));
    high.push(toXY(o, h));
  }
  if (low.length < 2) return null;
  const polygon = [...low, ...high.reverse()];
  const mid = av + (bv - av) * 0.55;
  const sl = loF({ [outer]: mid }), sh = hiF({ [outer]: mid });
  const strip = order === 'polar' || !Number.isFinite(sl) ? null : { dir: order === 'dydx' ? 'vertical' : 'horizontal', at: mid, from: sl, to: sh };
  const end = av + (bv - av) * 0.8;
  const lab = (n, val) => { const [x, y] = toXY(end, val); return Number.isFinite(x) && Number.isFinite(y) ? { x, y, text: `${texName(inner)} = ${n.toString({ implicit: 'hide' }).replace(/theta/g, 'θ').replace(/ \^ /g, '^').replace(/pi/g, 'π')}` } : null; };
  const labels = [lab(lo, loF({ [outer]: end })), lab(hi, hiF({ [outer]: end }))].filter(Boolean);
  return { polygon, strip, labels };
}

export function solve({ f, order = 'dydx', innerFrom, innerTo, outerFrom, outerTo }) {
  const o = ORDERS[order];
  if (!o) throw new EngineError('Choose the order of integration.');
  const fn = readExpr(f, 'The integrand');
  const lim = readLimits({ innerFrom, innerTo, outerFrom, outerTo }, o.inner, o.outer);
  const bad = [...variablesOf(fn)].filter((v) => v !== o.inner && v !== o.outer && v !== 'pi' && v !== 'e');
  if (bad.length) throw new EngineError(`The integrand may use only ${texName(o.inner)} and ${texName(o.outer)} (it uses ${bad.join(', ')}).`);
  const vars = [o.inner, o.outer];
  const steps = [];
  const notes = [];
  const iTex = texVar(o.inner), oTex = texVar(o.outer);
  const setup = `\\int_{${mtex(lim.a)}}^{${mtex(lim.b)}} \\int_{${mtex(lim.lo)}}^{${mtex(lim.hi)}} ${integrandTex(fn)}\\,d${iTex}\\,d${oTex}`;

  // Numeric value over the same region
  const numeric = numericIterated(fnOf(fn), [
    { v: o.inner, lo: fnOf(lim.lo), hi: fnOf(lim.hi) },
    { v: o.outer, lo: () => lim.av, hi: () => lim.bv },
  ], 32);

  let value = null, valueTex = null, verified = false, why = null;
  try {
    const s1 = definite(fn, o.inner, lim.lo, lim.hi, vars);
    steps.push({ title: `Inner integral: with respect to ${texName(o.inner)} (${texName(o.outer)} held constant)`, lines: s1.lines, depth: 0 });
    s1.steps.forEach((s) => steps.push(s));
    const s2 = definite(s1.value, o.outer, lim.a, lim.b, [o.outer]);
    steps.push({ title: `Outer integral: with respect to ${texName(o.outer)}`, lines: s2.lines, depth: 0 });
    s2.steps.forEach((s) => steps.push(s));
    value = s2.number;
    valueTex = s2.valueTex;
    verified = Number.isFinite(numeric) && Math.abs(value - numeric) <= 1e-6 * Math.max(1, Math.abs(numeric));
    if (!verified) why = 'The step-by-step value and the numerical value disagree, so treat this answer with care.';
  } catch (e) {
    if (e.name !== 'EngineError') throw e;
    why = `${e.message} The value below is numerical.`;
  }
  if (value === null) {
    if (!Number.isFinite(numeric)) throw new EngineError(`${why || ''} The integral does not give a finite number over this region.`.trim());
    value = numeric;
    valueTex = exactTex(numeric);
  }
  if (order === 'polar') notes.push('In polar coordinates dA = r dr dθ: the r must be part of the integrand you type (e.g. r for area, r³ for ∫∫ r² dA).');
  if (/^1$/.test(String(f).trim())) notes.push('With f = 1 the double integral is the area of the region (in square units).');
  if (why) notes.push(why);
  return {
    setup, value, valueTex, numeric, verified, symbolic: !why || verified, steps, notes,
    region: regionOf(order, lim), order, result: value,
  };
}
