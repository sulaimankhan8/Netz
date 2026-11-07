/**
 * Triple integrals, step by step: the maths for /triple-integral-calculator (catalog 6G).
 * The order is typed as it is read, innermost first: "dz dy dx", "dr dθ dz", "dρ dφ dθ".
 * Limits: the innermost may use the two outer letters, the middle one the outermost letter, the outermost
 * must be numbers. Cylindrical and spherical coordinates work the same way: the Jacobian (r, or ρ² sin φ)
 * must be part of the integrand you type. Each stage is checked, and the value is cross-checked by
 * Gauss–Legendre quadrature.
 */
import { EngineError } from '../numeric/steps';
import { variablesOf } from '../symbolic/tree';
import { definite, readExpr, numericIterated, fnOf, exactTex, mtex, texVar } from '../symbolic/iterated';
import { integrandTex } from '../symbolic/multi';

const NAMES = { θ: 'theta', theta: 'theta', φ: 'varphi', ϕ: 'varphi', phi: 'varphi', ρ: 'rho', rho: 'rho' };

/** "dz dy dx" → ['z', 'y', 'x'] (innermost first). */
export function readOrder(text) {
  const parts = String(text ?? '').trim().split(/\s*d(?=[a-zA-Zθφϕρ])/).filter(Boolean).map((p) => p.trim());
  const vars = parts.map((p) => NAMES[p] || p);
  if (vars.length !== 3 || new Set(vars).size !== 3 || vars.some((v) => !/^[a-zA-Z]+$/.test(v))) {
    throw new EngineError('Type the order as three differentials, innermost first, e.g. dz dy dx or dr dθ dz.');
  }
  return vars;
}
const show = (v) => ({ theta: 'θ', varphi: 'φ', rho: 'ρ' }[v] || v);

export function solve({ f, order = 'dz dy dx', l1from, l1to, l2from, l2to, l3from, l3to }) {
  const [v1, v2, v3] = readOrder(order);
  const fn = readExpr(f, 'The integrand');
  const lim = [[l1from, l1to], [l2from, l2to], [l3from, l3to]].map(([p, q], i) => [readExpr(p, `The ${['inner', 'middle', 'outer'][i]} lower limit`), readExpr(q, `The ${['inner', 'middle', 'outer'][i]} upper limit`)]);
  const free = (n) => [...variablesOf(n)].filter((v) => v !== 'pi' && v !== 'e');
  const allowed = [[v2, v3], [v3], []];
  lim.forEach((pair, i) => pair.forEach((n) => {
    const bad = free(n).filter((v) => !allowed[i].includes(v));
    if (bad.length) throw new EngineError(`The ${['inner', 'middle', 'outer'][i]} limits may use ${allowed[i].length ? `only ${allowed[i].map(show).join(' and ')}` : 'numbers only'} (found ${bad.map(show).join(', ')}).`);
  }));
  const badF = free(fn).filter((v) => ![v1, v2, v3].includes(v));
  if (badF.length) throw new EngineError(`The integrand may use only ${[v1, v2, v3].map(show).join(', ')} (it uses ${badF.map(show).join(', ')}).`);

  const numeric = numericIterated(fnOf(fn), [
    { v: v1, lo: fnOf(lim[0][0]), hi: fnOf(lim[0][1]) },
    { v: v2, lo: fnOf(lim[1][0]), hi: fnOf(lim[1][1]) },
    { v: v3, lo: fnOf(lim[2][0]), hi: fnOf(lim[2][1]) },
  ], 20);
  const t = (v) => texVar(v);
  const setup = `\\int_{${mtex(lim[2][0])}}^{${mtex(lim[2][1])}} \\int_{${mtex(lim[1][0])}}^{${mtex(lim[1][1])}} \\int_{${mtex(lim[0][0])}}^{${mtex(lim[0][1])}} ${integrandTex(fn)}\\,d${t(v1)}\\,d${t(v2)}\\,d${t(v3)}`;
  const steps = [];
  const notes = [];
  let value = null, valueTex = null, why = null, verified = false;
  try {
    const s1 = definite(fn, v1, lim[0][0], lim[0][1], [v1, v2, v3]);
    steps.push({ title: `Innermost: with respect to ${show(v1)} (${show(v2)}, ${show(v3)} held constant)`, lines: s1.lines, depth: 0 });
    s1.steps.forEach((s) => steps.push(s));
    const s2 = definite(s1.value, v2, lim[1][0], lim[1][1], [v2, v3]);
    steps.push({ title: `Middle: with respect to ${show(v2)} (${show(v3)} held constant)`, lines: s2.lines, depth: 0 });
    s2.steps.forEach((s) => steps.push(s));
    const s3 = definite(s2.value, v3, lim[2][0], lim[2][1], [v3]);
    steps.push({ title: `Outermost: with respect to ${show(v3)}`, lines: s3.lines, depth: 0 });
    s3.steps.forEach((s) => steps.push(s));
    value = s3.number;
    valueTex = s3.valueTex;
    verified = Number.isFinite(numeric) && Math.abs(value - numeric) <= 1e-6 * Math.max(1, Math.abs(numeric));
    if (!verified) why = 'The step-by-step value and the numerical value disagree, so treat this answer with care.';
  } catch (e) {
    if (e.name !== 'EngineError') throw e;
    why = `${e.message} The value below is numerical.`;
  }
  if (value === null) {
    if (!Number.isFinite(numeric)) throw new EngineError('The integral does not give a finite number over this region.');
    value = numeric;
    valueTex = exactTex(numeric);
  }
  if ([v1, v2, v3].includes('rho')) notes.push('Spherical coordinates: dV = ρ² sin φ dρ dφ dθ, so ρ² sin φ must be part of the integrand.');
  else if ([v1, v2, v3].includes('r') && [v1, v2, v3].includes('theta')) notes.push('Cylindrical coordinates: dV = r dr dθ dz, so the r must be part of the integrand.');
  if (String(f).trim() === '1') notes.push('With f = 1 the triple integral is the volume of the region.');
  if (why) notes.push(why);
  return { setup, value, valueTex, numeric, verified, steps, notes, result: value };
}
