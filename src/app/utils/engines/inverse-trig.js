/**
 * Inverse trigonometric functions: the maths for /inverse-trig-functions (catalog 9G).
 *   value    f⁻¹(v): the angle in the principal range with f(θ) = v
 *              sin⁻¹: [−π/2, π/2]  cos⁻¹: [0, π]  tan⁻¹: (−π/2, π/2)  cot⁻¹: (0, π)
 *              sec⁻¹: [0, π] without π/2 (= cos⁻¹(1/v))  csc⁻¹: [−π/2, π/2] without 0 (= sin⁻¹(1/v))
 *   compose  f⁻¹(f(θ)): equals θ only when θ is in the principal range; otherwise the matching angle in it
 *   sum      tan⁻¹a ± tan⁻¹b = tan⁻¹((a ± b)/(1 ∓ ab)), adding π when needed (ab > 1, a, b > 0)
 */
import { EngineError } from '../numeric/steps';
import { parse } from '../symbolic/tree';
import { angleTex, valueTex, degText } from '../symbolic/trig';

const RANGE = {
  sin: ['-\\frac{\\pi}{2}', '\\frac{\\pi}{2}', '[', ']'], cos: ['0', '\\pi', '[', ']'], tan: ['-\\frac{\\pi}{2}', '\\frac{\\pi}{2}', '(', ')'],
  cot: ['0', '\\pi', '(', ')'], sec: ['0', '\\pi', '[', ']'], csc: ['-\\frac{\\pi}{2}', '\\frac{\\pi}{2}', '[', ']'],
};
const rangeTex = (f) => { const [a, b, l, r] = RANGE[f]; return `${l === '(' ? '\\left(' : '\\left['}${a}, ${b}${r === ')' ? '\\right)' : '\\right]'}${f === 'sec' ? ' \\setminus \\{\\frac{\\pi}{2}\\}' : f === 'csc' ? ' \\setminus \\{0\\}' : ''}`; };
const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: (x) => 1 / Math.tan(x), sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x) };

export function principal(f, v) {
  switch (f) {
    case 'sin': if (Math.abs(v) > 1 + 1e-12) throw new EngineError('sin⁻¹ needs a value between −1 and 1.'); return Math.asin(Math.max(-1, Math.min(1, v)));
    case 'cos': if (Math.abs(v) > 1 + 1e-12) throw new EngineError('cos⁻¹ needs a value between −1 and 1.'); return Math.acos(Math.max(-1, Math.min(1, v)));
    case 'tan': return Math.atan(v);
    case 'cot': return v === 0 ? Math.PI / 2 : v > 0 ? Math.atan(1 / v) : Math.PI + Math.atan(1 / v);
    case 'sec': if (Math.abs(v) < 1 - 1e-12) throw new EngineError('sec⁻¹ needs |value| ≥ 1.'); return Math.acos(1 / v);
    case 'csc': if (Math.abs(v) < 1 - 1e-12) throw new EngineError('csc⁻¹ needs |value| ≥ 1.'); return Math.asin(1 / v);
    default: throw new EngineError('Choose sin, cos, tan, cot, sec or csc.');
  }
}
const readNumber = (s, label) => {
  const node = parse(String(s ?? '').replace(/π/g, 'pi'), label);
  let v;
  try { v = node.evaluate(); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: give a number such as 1/2, sqrt(3)/2 or 2pi/3.`);
  return v;
};
const angleOut = (a) => { const t = angleTex(a); return /pi|^0$/.test(t) ? t : `${t} \\text{ rad}`; };

export function solve({ mode = 'value', fn = 'sin', value = '', angle = '', a = '', b = '', op = '+' }) {
  const steps = [];
  if (mode === 'value') {
    const v = readNumber(value, 'The value');
    const th = principal(fn, v);
    const vT = valueTex(v);
    steps.push({ title: 'Meaning', formula: `\\${fn}^{-1} v = \\theta \\iff \\${fn}\\theta = v, \\ \\theta \\in ${rangeTex(fn)}`, depth: 0, lines: [`\\${fn}\\theta = ${vT}, \\quad \\theta \\in ${rangeTex(fn)}`] });
    if (fn === 'sec' || fn === 'csc') steps.push({ title: 'Use the reciprocal', depth: 0, lines: [`\\${fn}^{-1}(${vT}) = \\${fn === 'sec' ? 'cos' : 'sin'}^{-1}\\left(${valueTex(1 / v)}\\right)`] });
    if (v < 0 && ['sin', 'tan', 'csc'].includes(fn)) steps.push({ title: 'Odd function', depth: 0, lines: [`\\${fn}^{-1}(-x) = -\\${fn}^{-1}(x)`] });
    if (v < 0 && ['cos', 'cot', 'sec'].includes(fn)) steps.push({ title: 'Negative value', depth: 0, lines: [`\\${fn}^{-1}(-x) = \\pi - \\${fn}^{-1}(x)`] });
    steps.push({ title: 'Principal value', depth: 0, lines: [`\\${fn}^{-1}\\left(${vT}\\right) = ${angleOut(th)} \\ (${degText(th).replace('°', '^\\circ')})`] });
    const back = FN[fn](th);
    return { answer: `\\${fn}^{-1}\\left(${vT}\\right) = ${angleOut(th)}`, value: th, degrees: degText(th), steps, verified: Math.abs(back - v) < 1e-9 * Math.max(1, Math.abs(v)), notes: [`The principal range of ${fn}⁻¹ is where each value is reached exactly once.`], result: th };
  }
  if (mode === 'compose') {
    const th = readNumber(angle, 'The angle');
    const v = FN[fn](th);
    if (!Number.isFinite(v) || Math.abs(v) > 1e12) throw new EngineError(`${fn} is undefined at this angle.`);
    const p = principal(fn, v);
    const inside = Math.abs(p - th) < 1e-9;
    steps.push({ title: 'Inner value', depth: 0, lines: [`\\${fn}\\left(${angleTex(th)}\\right) = ${valueTex(v)}`] });
    steps.push({ title: inside ? 'The angle is in the principal range' : 'The angle is outside the principal range', depth: 0, lines: [`${angleTex(th)} ${inside ? '\\in' : '\\notin'} ${rangeTex(fn)}`, ...(inside ? [] : [`\\text{Find the angle in the range with the same } \\${fn}: \\ \\${fn}\\left(${angleTex(p)}\\right) = ${valueTex(v)}`])] });
    steps.push({ title: 'Answer', depth: 0, lines: [`\\${fn}^{-1}\\left(\\${fn} ${angleTex(th)}\\right) = ${angleOut(p)}`] });
    return { answer: `\\${fn}^{-1}\\left(\\${fn} ${angleTex(th)}\\right) = ${angleOut(p)}`, value: p, degrees: degText(p), steps, verified: Math.abs(FN[fn](p) - v) < 1e-9, notes: [inside ? 'Inside the principal range the inverse undoes the function.' : 'Outside the principal range, f⁻¹(f(θ)) is not θ: it is the angle in the range with the same value.'], result: p };
  }
  if (mode === 'sum') {
    const x = readNumber(a, 'a'), y = readNumber(b, 'b');
    const s = op === '-' ? -1 : 1;
    const direct = Math.atan(x) + s * Math.atan(y);
    const den = 1 - s * x * y;
    steps.push({ title: 'Formula', formula: s > 0 ? '\\tan^{-1}a + \\tan^{-1}b = \\tan^{-1}\\frac{a + b}{1 - ab}' : '\\tan^{-1}a - \\tan^{-1}b = \\tan^{-1}\\frac{a - b}{1 + ab}', depth: 0, lines: [`a = ${valueTex(x)}, \\ b = ${valueTex(y)}, \\quad ${s > 0 ? 'ab' : '-ab'} = ${valueTex(s * x * y)}`] });
    let lines;
    if (Math.abs(den) < 1e-12) lines = [`1 ${s > 0 ? '-' : '+'} ab = 0, \\text{ so the angle is } ${direct > 0 ? '\\frac{\\pi}{2}' : '-\\frac{\\pi}{2}'}`];
    else {
      const q = (x + s * y) / den;
      const base = Math.atan(q);
      const shift = Math.round((direct - base) / Math.PI);
      lines = [`\\frac{${valueTex(x)} ${s > 0 ? '+' : '-'} ${valueTex(y)}}{1 ${s > 0 ? '-' : '+'} ${valueTex(x * y)}} = ${valueTex(q)}`, `\\tan^{-1}(${valueTex(q)}) = ${angleOut(base)}`, ...(shift ? [`\\text{Since the sum lies outside } \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right) \\text{, add } ${shift > 0 ? '' : '-'}\\pi`] : [])];
    }
    steps.push({ title: 'Combine', depth: 0, lines: [...lines, `= ${angleOut(direct)}`] });
    return { answer: `\\tan^{-1}(${valueTex(x)}) ${s > 0 ? '+' : '-'} \\tan^{-1}(${valueTex(y)}) = ${angleOut(direct)}`, value: direct, degrees: degText(direct), steps, verified: true, notes: ['The formula gives the angle up to a multiple of π; the sign and size of a and b decide which one.'], result: direct };
  }
  throw new EngineError('Choose what to work out.');
}
