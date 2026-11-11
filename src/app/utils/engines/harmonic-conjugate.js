/**
 * Harmonic functions and the harmonic conjugate: the maths for /harmonic-conjugate (Unit 14).
 *   u is harmonic when uₓₓ + u_yy = 0. Milne-Thomson: f′(z) = uₓ(z, 0) − i u_y(z, 0), integrate in z, then
 *   v = Im f(x + iy) (+ a constant). Given v instead: f′(z) = v_y(z, 0) + i vₓ(z, 0), and u = Re f.
 *   The answer is checked: u + iv satisfies the Cauchy–Riemann equations.
 */
import { EngineError } from '../numeric/steps';
import { sym, num, add, sub, mul, neg, polish, tidy } from '../symbolic/tree';
import { readMulti, partial, partialChain, isZero, mtex, tidyMulti, equalAt } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { integrate } from '../symbolic/integral';
import { parts, foldConstants } from '../symbolic/complex';

const V = ['x', 'y'];
const t = (n) => mtex(polish(tidy(n)));
const at = (n) => foldConstants(substitute(substitute(n, 'x', sym('z')), 'y', num(0)));

export function solve({ given = 'u', w = '' }) {
  const W = readMulti(w, given === 'u' ? 'u(x, y)' : 'v(x, y)');
  const fns = new Set(); W.traverse((m) => { if (m.isFunctionNode) fns.add(m.fn.name); });
  const bad = []; W.traverse((m) => { if (m.isSymbolNode && !fns.has(m.name) && !['x', 'y', 'pi', 'e'].includes(m.name)) bad.push(m.name); });
  if (bad.length) throw new EngineError(`Use only x and y (it uses ${[...new Set(bad)].join(', ')}).`);
  const steps = [];
  const wx = partial(W, 'x', V).result, wy = partial(W, 'y', V).result;
  const wxx = partialChain(W, ['x', 'x'], V).at(-1).node;
  const wyy = partialChain(W, ['y', 'y'], V).at(-1).node;
  const lap = tidyMulti(add(wxx, wyy), V);
  const harmonic = isZero(lap, V);
  const name = given === 'u' ? 'u' : 'v';
  steps.push({ title: 'Is it harmonic?', formula: `${name}_{xx} + ${name}_{yy} = 0`, depth: 0, lines: [`${name}_x = ${t(wx)}, \\quad ${name}_y = ${t(wy)}`, `${name}_{xx} + ${name}_{yy} = ${t(wxx)} + ${t(wyy)} = ${harmonic ? '0' : t(lap)}`] });
  if (!harmonic) {
    return { harmonic: false, steps, notes: [`${name} is not harmonic, so it is not the real or imaginary part of an analytic function.`], verified: true, result: 'not harmonic' };
  }
  // Milne-Thomson
  const fp = given === 'u' ? tidyMulti(sub(at(wx), mul(sym('i'), at(wy))), ['z']) : tidyMulti(add(at(wy), mul(sym('i'), at(wx))), ['z']);
  steps.push({ title: 'Milne-Thomson: put x = z, y = 0', formula: given === 'u' ? "f'(z) = u_x(z, 0) - i\\,u_y(z, 0)" : "f'(z) = v_y(z, 0) + i\\,v_x(z, 0)", depth: 0, lines: [`f'(z) = ${t(fp)}`] });
  let F;
  try { F = integrate(fp, 'z').result; } catch { throw new EngineError("NETZ could not integrate f′(z) step by step for this function."); }
  F = tidyMulti(F, ['z']);
  steps.push({ title: 'Integrate', depth: 0, lines: [`f(z) = \\int f'(z)\\,dz = ${t(F)} + C`] });
  const p = parts(F);
  const other = given === 'u' ? p.v : p.u;
  // the constant part of the given function can differ: compare derivatives (Cauchy–Riemann) instead
  const ox = partial(other, 'x', V).result, oy = partial(other, 'y', V).result;
  const ok = given === 'u' ? (equalAt(wx, oy, V) || isZero(sub(wx, oy), V)) && isZero(add(wy, ox), V) : (equalAt(ox, wy, V) || isZero(sub(ox, wy), V)) && isZero(add(oy, wx), V);
  steps.push({ title: given === 'u' ? 'The conjugate v = Im f' : 'u = Re f', depth: 0, lines: [`${given === 'u' ? 'v' : 'u'}(x, y) = ${t(other)} + C`, `\\text{Check: } u_x = v_y, \\ u_y = -v_x \\ ${ok ? '\\checkmark' : ''}`] });
  void neg;
  return { harmonic: true, fTex: t(F), otherTex: t(other), steps, notes: ['The constant C is arbitrary: any constant can be added to the conjugate.'], verified: ok, result: other.toString() };
}
