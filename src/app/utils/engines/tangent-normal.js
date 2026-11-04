/**
 * Tangent and normal to y = f(x) at x = a.
 *   point     (a, f(a))
 *   slope     m = f'(a)                   (the derivative from the symbolic engine)
 *   tangent   y − f(a) = m (x − a)
 *   normal    y − f(a) = −(1/m)(x − a)    (perpendicular: slopes multiply to −1)
 * m = 0 gives a horizontal tangent and a vertical normal; an infinite slope the other way round.
 * The slope is checked against a numerical derivative; `verified` says whether they agreed.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { math, parse, variablesOf, tex, polish } from '../symbolic/tree';
import { differentiate } from '../symbolic/derivative';
import { cleanest } from '../symbolic/present';
import { texOf } from '../symbolic/roots';

const valueAt = (node, v, x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
const close = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

/** "x − a" in LaTeX: x, x − 2, x + 3, x − π/4. */
const minus = (x, aTex) => (aTex === '0' ? x : aTex.startsWith('-') ? `${x} + ${aTex.slice(1)}` : `${x} - ${aTex}`);
/** Coefficient in front of a bracket or x: 1 → "", −1 → "-", else the number. */
const coef = (mTex) => (mTex === '1' ? '' : mTex === '-1' ? '-' : /[+-]/.test(mTex.replace(/^-/, '')) ? `\\left(${mTex}\\right)` : mTex);
/** y = mx + c in LaTeX. */
function slopeIntercept(m, c) {
  const mt = texOf(m), ct = texOf(c);
  const mx = Math.abs(m) < 1e-12 ? '' : `${coef(mt)}x`;
  if (!mx) return `y = ${ct}`;
  if (Math.abs(c) < 1e-12) return `y = ${mx}`;
  return `y = ${mx} ${ct.startsWith('-') ? `- ${ct.slice(1)}` : `+ ${ct}`}`;
}
/** y − y₀ = m(x − a) in LaTeX. */
function pointSlope(mTex, y0Tex, aTex) {
  const left = y0Tex === '0' ? 'y' : minus('y', y0Tex);
  if (mTex === '0') return `${left} = 0`;
  const bracket = minus('x', aTex);
  const right = mTex === '1' ? bracket : mTex === '-1' ? (bracket === 'x' ? '-x' : `-\\left(${bracket}\\right)`) : bracket === 'x' ? `${coef(mTex)}x` : `${coef(mTex)}\\left(${bracket}\\right)`;
  return `${left} = ${right}`;
}

export function solve({ f: tf, a: ta }) {
  const node = parse(tf, 'f(x)');
  const vars = [...variablesOf(node)];
  if (vars.length > 1) throw new EngineError(`Use one variable only (this uses ${vars.join(', ')}).`);
  const v = vars[0] || 'x';
  const a = readConstant(ta, 'The point x = a');
  let aNode;
  try { aNode = math.parse(String(ta).trim().replace(/π/g, 'pi')); } catch { aNode = math.parse(String(a)); }
  const aTex = tex(polish(aNode)).trim();

  const y0 = valueAt(node, v, a);
  if (!Number.isFinite(y0)) throw new EngineError(`f(${v}) is not defined at ${v} = ${aTex.replace(/\\/g, '')}, so there is no point on the curve there.`);

  // The derivative, in its tidiest form
  const raw = differentiate(node, v).result;
  const same = (g) => [0.37, 1.29, 2.13].every((x) => { const p = valueAt(g, v, x), q = valueAt(raw, v, x); return !Number.isFinite(q) || close(p, q); });
  const d = cleanest(raw, v, same) || raw;
  const m = valueAt(d, v, a);

  // A numerical slope from f itself, to check m (and to spot vertical tangents)
  const h = 1e-6 * Math.max(1, Math.abs(a));
  const numeric = (valueAt(node, v, a + h) - valueAt(node, v, a - h)) / (2 * h);
  const vertical = !Number.isFinite(m) || Math.abs(m) > 1e9;
  const verified = vertical ? !Number.isFinite(numeric) || Math.abs(numeric) > 1e3 : close(m, numeric) || Math.abs(m - numeric) < 1e-5;

  const y0Tex = texOf(y0);
  const steps = [
    { title: 'Find the point on the curve', lines: [`${v} = ${aTex}: \\quad y = f(${aTex}) = ${y0Tex}`, `\\text{Point } P\\left(${aTex},\\ ${y0Tex}\\right)`] },
    { title: 'Differentiate', lines: [`f'(${v}) = ${tex(polish(d)).trim()}`] },
  ];

  const lines = [];
  let tangent, normal;
  if (vertical) {
    steps.push({ title: 'Slope at the point', lines: [`f'(${aTex}) \\text{ is undefined (infinite): the tangent is vertical}`] });
    tangent = { eq: `x = ${aTex}`, vertical: true };
    normal = { eq: `y = ${y0Tex}`, slope: 0 };
    lines.push({ a: 1, b: 0, c: -a }, { a: 0, b: 1, c: -y0 });
  } else {
    const mTex = texOf(m);
    steps.push({ title: 'Slope of the tangent', formula: "m = f'(a)", lines: [`m = f'(${aTex}) = ${mTex}`] });
    const c = y0 - m * a;
    tangent = { eq: slopeIntercept(m, c), pointSlope: pointSlope(mTex, y0Tex, aTex), slope: m };
    steps.push({ title: 'Equation of the tangent', formula: 'y - y_1 = m(x - x_1)', lines: [tangent.pointSlope, tangent.eq] });
    lines.push({ a: -m, b: 1, c: -c });
    if (Math.abs(m) < 1e-12) {
      normal = { eq: `x = ${aTex}`, vertical: true };
      steps.push({ title: 'Equation of the normal', lines: [`m = 0 \\text{: the tangent is horizontal, so the normal is vertical}`, normal.eq] });
      lines.push({ a: 1, b: 0, c: -a });
    } else {
      const n = -1 / m, nTex = texOf(n), cn = y0 - n * a;
      normal = { eq: slopeIntercept(n, cn), pointSlope: pointSlope(nTex, y0Tex, aTex), slope: n };
      steps.push({ title: 'Equation of the normal', formula: '\\text{slope} = -\\frac{1}{m}', lines: [`\\text{slope} = -\\frac{1}{${mTex}} = ${nTex}`, normal.pointSlope, normal.eq] });
      lines.push({ a: -n, b: 1, c: -cn });
    }
  }

  return {
    variable: v, f: tex(polish(node)).trim(), a, aTex, y0, y0Tex, derivative: tex(polish(d)).trim(),
    slope: vertical ? null : m, tangent, normal, steps, verified, lines,
    fAt: (x) => valueAt(node, v, x), result: tangent.eq, notes: [], plot: null,
  };
}
