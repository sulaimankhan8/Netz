/**
 * Heights and distances (NCERT 10, Chapter 9) with angles of elevation and depression.
 *   height        h = d tan θ (+ the observer's eye height)
 *   distance      d = h / tan θ
 *   angle         θ = tan⁻¹(h / d)
 *   two points    angles α (nearer) and β from two points d apart, on the same side:
 *                 h = d tan α tan β / (tan α − tan β); on opposite sides: d tan α tan β / (tan α + tan β)
 *   depression    from the top of a tower h high, angles of depression α, β of two objects in line:
 *                 distance between them = h / tan β − h / tan α
 * Exact answers (10√3, 5(√3 + 1)) for 15°, 30°, 45°, 60°, 75° with whole-number or fraction lengths,
 * by working in numbers of the form p + q√3; other angles give decimals.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { parseAngle, q as qTex, n as nTex } from '../numeric/geometry';
import { readNumber } from './input';

// ---- numbers p + q√3 ----
const R3 = Math.sqrt(3);
const S = (p, q = 0) => ({ p, q });
const val = (a) => a.p + a.q * R3;
const add = (a, b) => S(a.p + b.p, a.q + b.q);
const subt = (a, b) => S(a.p - b.p, a.q - b.q);
const mul = (a, b) => S(a.p * b.p + 3 * a.q * b.q, a.p * b.q + a.q * b.p);
const div = (a, b) => { const d = b.p * b.p - 3 * b.q * b.q; return S((a.p * b.p - 3 * a.q * b.q) / d, (a.q * b.p - a.p * b.q) / d); };
const isRational = (x) => Boolean(toFraction(x, 1000, 1e-9));
const exactOk = (a) => isRational(a.p) && isRational(a.q);
/** p + q√3 in LaTeX: 10\sqrt{3}, 5 + 5\sqrt{3}, \frac{\sqrt{3}}{3}. */
function s3Tex(a) {
  const qT = (v) => { const t = qTex(Math.abs(v)); return t === '1' ? '' : t; };
  const root = (v) => {
    const f = toFraction(Math.abs(v), 1000, 1e-9);
    if (f && f.d !== 1) return `${f.n === 1 ? '' : f.n}\\frac{\\sqrt{3}}{${f.d}}`.replace(/^(\d+)\\frac\{\\sqrt\{3\}\}/, '\\frac{$1\\sqrt{3}}');
    return `${qT(v)}\\sqrt{3}`;
  };
  if (Math.abs(a.q) < 1e-12) return qTex(a.p);
  if (Math.abs(a.p) < 1e-12) return `${a.q < 0 ? '-' : ''}${root(a.q)}`;
  return `${qTex(a.p)} ${a.q < 0 ? '-' : '+'} ${root(a.q)}`;
}
// tan of the special angles as p + q√3
const TAN = { 15: S(2, -1), 30: S(0, 1 / 3), 45: S(1), 60: S(0, 1), 75: S(2, 1) };
const TAN_TEX = { 15: '2 - \\sqrt{3}', 30: '\\frac{1}{\\sqrt{3}}', 45: '1', 60: '\\sqrt{3}', 75: '2 + \\sqrt{3}' };

/** A length or angle as an exact p + q√3 when possible, else null. */
function exactLength(x) { return isRational(x) ? S(toFraction(x, 1000, 1e-9).n / toFraction(x, 1000, 1e-9).d) : null; }
function tanOf(deg) {
  const r = Math.round(deg * 1e9) / 1e9;
  if (TAN[r]) return { exact: TAN[r], value: val(TAN[r]), tex: TAN_TEX[r] };
  const v = Math.tan((deg * Math.PI) / 180);
  return { exact: null, value: v, tex: Number(v.toFixed(4)).toString() };
}
const angle = (t, label) => {
  const d = parseAngle(t, 'deg', label);
  if (!(d > 0 && d < 90)) throw new EngineError(`${label} must be between 0° and 90°.`);
  return d;
};
const positive = (t, label) => { const v = readNumber(t, label); if (!(v > 0)) throw new EngineError(`${label} must be more than 0.`); return v; };
/** An answer: exact LaTeX with its decimal (√3 ≈ 1.732), or just the decimal. */
function answerTex(exact, value, unit) {
  const dec = `${nTex(value, 6)}${unit ? `\\text{ ${unit}}` : ''}`;
  if (!exact || !exactOk(exact)) return dec;
  const ex = s3Tex(exact);
  // Two parts (20 + 20√3) take brackets so the unit applies to the whole
  const both = Math.abs(exact.p) > 1e-12 && Math.abs(exact.q) > 1e-12;
  const shown = both && unit ? `\\left(${ex}\\right)` : ex;
  return ex === nTex(value, 6) ? dec : `${shown}${unit ? `\\text{ ${unit}}` : ''} \\approx ${dec}`;
}

export function solve({ type = 'height', d: td = '', h: th = '', theta: tt = '', alpha: ta = '', beta: tb = '', eye: te = '', side = 'same', unit = 'm' }) {
  const steps = [];
  const u = String(unit ?? '').trim().slice(0, 8);
  let value, exact = null, result, diagram;

  if (type === 'height') {
    const d = positive(td, 'The distance'), th0 = angle(tt, 'The angle of elevation');
    const eye = String(te ?? '').trim() ? readNumber(te, "The observer's height") : 0;
    const T = tanOf(th0);
    steps.push({ title: 'In the right triangle', formula: '\\tan\\theta = \\frac{\\text{height}}{\\text{distance}}', lines: [`\\tan ${nTex(th0)}^\\circ = \\frac{h}{${nTex(d)}}`, `h = ${nTex(d)} \\tan ${nTex(th0)}^\\circ = ${nTex(d)} \\times ${T.tex}`] });
    const D = exactLength(d), E = exactLength(eye);
    exact = T.exact && D ? mul(D, T.exact) : null;
    value = d * T.value;
    steps.push({ title: 'Height above eye level', lines: [`h = ${answerTex(exact, value, u)}`] });
    if (eye) {
      if (exact && E) exact = add(exact, E);
      else exact = null;
      value += eye;
      steps.push({ title: "Add the observer's height", lines: [`H = h + ${nTex(eye)} = ${answerTex(exact, value, u)}`] });
    }
    result = { label: 'Height', value };
    diagram = { kind: 'single', base: d, height: value, angle: th0, eye };
  } else if (type === 'distance') {
    const h = positive(th, 'The height'), th0 = angle(tt, 'The angle');
    const T = tanOf(th0);
    steps.push({ title: 'In the right triangle', formula: '\\tan\\theta = \\frac{\\text{height}}{\\text{distance}} \\Rightarrow d = \\frac{h}{\\tan\\theta}', lines: [`d = \\frac{${nTex(h)}}{\\tan ${nTex(th0)}^\\circ} = \\frac{${nTex(h)}}{${T.tex}}`] });
    const H = exactLength(h);
    exact = T.exact && H ? div(H, T.exact) : null;
    value = h / T.value;
    steps.push({ title: 'Distance', lines: [`d = ${answerTex(exact, value, u)}`] });
    result = { label: 'Distance', value };
    diagram = { kind: 'single', base: value, height: h, angle: th0 };
  } else if (type === 'angle') {
    const h = positive(th, 'The height'), d = positive(td, 'The distance');
    const t = h / d, deg = (Math.atan(t) * 180) / Math.PI;
    const special = Object.keys(TAN).find((k) => Math.abs(val(TAN[k]) - t) < 1e-9);
    steps.push({ title: 'Use tan θ', formula: '\\tan\\theta = \\frac{h}{d}', lines: [`\\tan\\theta = \\frac{${nTex(h)}}{${nTex(d)}} = ${nTex(t, 6)}`, special ? `\\tan\\theta = ${TAN_TEX[special]} \\Rightarrow \\theta = ${special}^\\circ` : `\\theta = \\tan^{-1}(${nTex(t, 6)}) = ${nTex(deg, 6)}^\\circ`] });
    value = deg; result = { label: 'Angle', value, isAngle: true };
    diagram = { kind: 'single', base: d, height: h, angle: deg };
  } else if (type === 'two-points') {
    const d = positive(td, 'The distance between the two points');
    const a = angle(ta, 'The angle α'), b = angle(tb, 'The angle β');
    const same = side !== 'opposite';
    if (same && !(a > b)) throw new EngineError('On the same side, α (from the nearer point) must be bigger than β.');
    const A = tanOf(a), B = tanOf(b);
    if (same) {
      steps.push({
        title: 'Two right triangles share the height h',
        lines: [`\\text{From the nearer point: } \\tan ${nTex(a)}^\\circ = \\frac{h}{x} \\Rightarrow x = \\frac{h}{${A.tex}}`, `\\text{From the farther point: } \\tan ${nTex(b)}^\\circ = \\frac{h}{x + ${nTex(d)}}`],
      });
      steps.push({ title: 'Eliminate x', formula: 'h = \\frac{d\\tan\\alpha\\tan\\beta}{\\tan\\alpha - \\tan\\beta}', lines: [`h = \\frac{${nTex(d)} \\cdot ${A.tex} \\cdot ${B.tex}}{${A.tex} - ${B.tex}}`.replace('- 2 - \\sqrt{3}', '- (2 - \\sqrt{3})').replace('- 2 + \\sqrt{3}', '- (2 + \\sqrt{3})')] });
    } else {
      steps.push({ title: 'The tower is between the two points', formula: 'h = \\frac{d\\tan\\alpha\\tan\\beta}{\\tan\\alpha + \\tan\\beta}', lines: [`x = \\frac{h}{${A.tex}}, \\quad ${nTex(d)} - x = \\frac{h}{${B.tex}}`, `h = \\frac{${nTex(d)} \\cdot ${A.tex} \\cdot ${B.tex}}{${A.tex} + ${B.tex}}`] });
    }
    const D = exactLength(d);
    if (A.exact && B.exact && D) exact = div(mul(D, mul(A.exact, B.exact)), same ? subt(A.exact, B.exact) : add(A.exact, B.exact));
    value = (d * A.value * B.value) / (same ? A.value - B.value : A.value + B.value);
    const xEx = exact ? div(exact, A.exact) : null, x = value / A.value;
    steps.push({ title: 'Height and distances', lines: [`h = ${answerTex(exact, value, u)}`, `\\text{Distance from the ${same ? 'nearer' : 'first'} point: } x = \\frac{h}{\\tan ${nTex(a)}^\\circ} = ${answerTex(xEx, x, u)}`] });
    result = { label: 'Height', value, x };
    diagram = { kind: same ? 'two-same' : 'two-opposite', height: value, x, d, alpha: a, beta: b };
  } else if (type === 'depression') {
    const h = positive(th, 'The height of the tower');
    const a = angle(ta, 'The angle α (nearer object)'), b = angle(tb, 'The angle β (farther object)');
    if (!(a > b)) throw new EngineError('The nearer object has the bigger angle of depression: α must be bigger than β.');
    const A = tanOf(a), B = tanOf(b), H = exactLength(h);
    steps.push({ title: 'Angles of depression equal the angles of elevation (alternate angles)', lines: [`x_1 = \\frac{${nTex(h)}}{\\tan ${nTex(a)}^\\circ} = \\frac{${nTex(h)}}{${A.tex}}, \\quad x_2 = \\frac{${nTex(h)}}{\\tan ${nTex(b)}^\\circ} = \\frac{${nTex(h)}}{${B.tex}}`] });
    const x1 = h / A.value, x2 = h / B.value;
    const e1 = A.exact && H ? div(H, A.exact) : null, e2 = B.exact && H ? div(H, B.exact) : null;
    exact = e1 && e2 ? subt(e2, e1) : null;
    value = x2 - x1;
    steps.push({ title: 'Distance between the two objects', lines: [`x_1 = ${answerTex(e1, x1, u)}, \\quad x_2 = ${answerTex(e2, x2, u)}`, `x_2 - x_1 = ${answerTex(exact, value, u)}`] });
    result = { label: 'Distance between them', value };
    diagram = { kind: 'depression', height: h, x1, x2, alpha: a, beta: b };
  } else {
    throw new EngineError('Choose the type of problem.');
  }

  const valueTex = result.isAngle ? `${nTex(value, 6)}^\\circ` : answerTex(exact, value, u);
  return { type, result, value, valueTex, exact: Boolean(exact && exactOk(exact)), diagram, steps, verified: Number.isFinite(value) && value > 0, notes: ['√3 ≈ 1.732 is used for the decimal values.'], plot: null };
}
