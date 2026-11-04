/**
 * Vectors in 2D and 3D, step by step:
 *   magnitude and unit vector, dot product and the angle between two vectors, cross product (with the
 *   i/j/k determinant) and the areas it gives, projection of a on b, scalar triple product [a b c]
 *   (volume of the parallelepiped; 0 means coplanar).
 * Vectors can be typed as 2i − j + 3k or (2, −1, 3). Square roots stay exact (√14, 1/√14).
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';
import { texOf } from '../symbolic/roots';

const OPS = ['magnitude', 'dot', 'cross', 'projection', 'triple'];
const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/** Read 2i - j + 3k, (2, -1, 3), <2,-1,3> or 2 -1 3. Returns [x, y, z] (z = 0 for 2D) and the dimension. */
export function readVector(text, label) {
  const s = String(text ?? '').trim();
  if (!s) throw new EngineError(`${label} is empty. Write it like 2i - j + 3k or (2, -1, 3).`);
  if (/[ijk]/.test(s.replace(/sqrt|pi/g, ''))) {
    const out = [0, 0, 0];
    const body = s.replace(/\s+/g, '').replace(/\^/g, '');
    const re = /([+-]?)([^+\-ijk]*?)\*?([ijk])/g;
    let m, used = 0;
    while ((m = re.exec(body))) {
      const coef = m[2] === '' ? 1 : readConstant(m[2], label);
      out['ijk'.indexOf(m[3])] += (m[1] === '-' ? -1 : 1) * coef;
      used += m[0].length;
    }
    if (used !== body.length) throw new EngineError(`${label}: "${text}" is not a vector. Write it like 2i - j + 3k.`);
    return { v: out, dim: 3 };
  }
  const parts = s.replace(/[()<>[\]{}]/g, ' ').split(/[\s,;]+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) throw new EngineError(`${label}: use 2 or 3 components, like (2, -1, 3).`);
  const v = parts.map((p) => readConstant(p, label));
  return { v: v.length === 2 ? [...v, 0] : v, dim: v.length };
}

/** √n exactly: 5, √14, 2√3, \frac{\sqrt{2}}{2} … */
function sqrtTex(n) {
  if (n < 0) return null;
  const f = toFraction(n, 10000, 1e-9);
  if (!f) return texOf(Math.sqrt(n));
  const m = f.n * f.d;
  let s = 1;
  for (let i = Math.floor(Math.sqrt(m)); i > 1; i--) if (m % (i * i) === 0) { s = i; break; }
  const rest = m / (s * s), k = s / f.d;
  const kT = texOf(k);
  if (rest === 1) return kT;
  return `${kT === '1' ? '' : kT}\\sqrt{${rest}}`;
}
const t = (x) => texOf(x);
const paren = (x) => (x < 0 ? `(${t(x)})` : t(x));

/** a₁î + a₂ĵ + a₃k̂ in LaTeX. */
export function vecTex(v, dim = 3) {
  const names = ['\\hat{i}', '\\hat{j}', '\\hat{k}'].slice(0, dim);
  const parts = names.map((n, i) => [v[i], n]).filter(([x]) => Math.abs(x) > 1e-12);
  if (!parts.length) return '\\vec{0}';
  return parts.map(([x, n], i) => {
    const mag = t(Math.abs(x));
    const s = `${mag === '1' ? '' : mag}${n}`;
    return i === 0 ? `${x < 0 ? '-' : ''}${s}` : ` ${x < 0 ? '-' : '+'} ${s}`;
  }).join('');
}
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm2 = (a) => dot(a, a);

export function solve({ op = 'dot', a: ta, b: tb = '', c: tc = '' }) {
  if (!OPS.includes(op)) throw new EngineError('Choose what to find.');
  const A = readVector(ta, 'Vector a');
  const needB = op !== 'magnitude', needC = op === 'triple';
  const B = needB ? readVector(tb, 'Vector b') : null;
  const C = needC ? readVector(tc, 'Vector c') : null;
  const dim = Math.max(A.dim, B?.dim ?? 0, C?.dim ?? 0);
  // 2D vectors are treated as lying in the xy-plane (z = 0) for the cross and triple products
  const a = A.v, b = B?.v, c = C?.v;
  const D = op === 'cross' || op === 'triple' ? 3 : dim;
  const steps = [];
  let answer, extra = {};

  if (op === 'magnitude') {
    const n2 = norm2(a), mag = Math.sqrt(n2), mT = sqrtTex(n2);
    if (n2 === 0) throw new EngineError('The zero vector has no direction, so it has no unit vector.');
    steps.push({ title: 'Magnitude', formula: '|\\vec a| = \\sqrt{a_1^2 + a_2^2 + a_3^2}', lines: [`|\\vec a| = \\sqrt{${a.slice(0, D).map((x) => `${paren(x)}^2`).join(' + ')}} = \\sqrt{${t(n2)}} = ${mT}`] });
    steps.push({ title: 'Unit vector', formula: '\\hat{a} = \\frac{\\vec a}{|\\vec a|}', lines: [`\\hat{a} = \\frac{1}{${mT}}\\left(${vecTex(a, D)}\\right)`] });
    answer = `|\\vec a| = ${mT}, \\quad \\hat{a} = \\frac{1}{${mT}}\\left(${vecTex(a, D)}\\right)`;
    extra = { magnitude: mag };
  } else if (op === 'dot') {
    const d = dot(a, b), na = norm2(a), nb = norm2(b);
    steps.push({ title: 'Dot product', formula: '\\vec a \\cdot \\vec b = a_1b_1 + a_2b_2 + a_3b_3', lines: [`\\vec a \\cdot \\vec b = ${a.slice(0, D).map((x, i) => `${paren(x)}${paren(b[i])}`).join(' + ')} = ${t(d)}`] });
    if (na === 0 || nb === 0) throw new EngineError('A zero vector has no direction, so there is no angle.');
    const cos = d / Math.sqrt(na * nb), theta = Math.acos(Math.max(-1, Math.min(1, cos)));
    const prod = sqrtTex(na * nb);
    steps.push({
      title: 'Angle between them',
      formula: '\\cos\\theta = \\frac{\\vec a \\cdot \\vec b}{|\\vec a|\\,|\\vec b|}',
      lines: [`|\\vec a| = ${sqrtTex(na)}, \\quad |\\vec b| = ${sqrtTex(nb)}`, `\\cos\\theta = \\frac{${t(d)}}{${prod}} = ${t(cos)}`, `\\theta = ${t(theta)}${/\\pi/.test(t(theta)) || theta === 0 ? '' : ' \\text{ rad}'} = ${Number(((theta * 180) / Math.PI).toFixed(4))}^{\\circ}`],
    });
    if (Math.abs(d) < 1e-12) steps.push({ title: 'Perpendicular', lines: ['\\vec a \\cdot \\vec b = 0, \\text{ so the vectors are at right angles.}'] });
    answer = `\\vec a \\cdot \\vec b = ${t(d)}, \\quad \\theta = ${t(theta)}`;
    extra = { dot: d, theta, degrees: (theta * 180) / Math.PI };
  } else if (op === 'cross') {
    const x = cross(a, b), n2 = norm2(x);
    steps.push({
      title: 'Expand the determinant along the first row',
      formula: '\\vec a \\times \\vec b = \\begin{vmatrix} \\hat i & \\hat j & \\hat k \\\\ a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\end{vmatrix}',
      lines: [
        `\\vec a \\times \\vec b = \\begin{vmatrix} \\hat i & \\hat j & \\hat k \\\\ ${a.map(t).join(' & ')} \\\\ ${b.map(t).join(' & ')} \\end{vmatrix}`,
        `= \\hat i\\left(${paren(a[1])}${paren(b[2])} - ${paren(a[2])}${paren(b[1])}\\right) - \\hat j\\left(${paren(a[0])}${paren(b[2])} - ${paren(a[2])}${paren(b[0])}\\right) + \\hat k\\left(${paren(a[0])}${paren(b[1])} - ${paren(a[1])}${paren(b[0])}\\right)`,
        `= ${vecTex(x)}`,
      ],
    });
    const area = sqrtTex(n2);
    steps.push({ title: 'Areas', formula: '\\text{parallelogram} = |\\vec a \\times \\vec b|, \\ \\text{triangle} = \\tfrac12|\\vec a \\times \\vec b|', lines: [`|\\vec a \\times \\vec b| = \\sqrt{${t(n2)}} = ${area}`, `\\text{Triangle} = \\frac{1}{2}\\left(${area}\\right) = ${sqrtTex(n2 / 4)}`] });
    if (n2 === 0) steps.push({ title: 'Parallel', lines: ['\\vec a \\times \\vec b = \\vec 0, \\text{ so the vectors are parallel.}'] });
    answer = `\\vec a \\times \\vec b = ${vecTex(x)}`;
    extra = { cross: x, area: Math.sqrt(n2) };
  } else if (op === 'projection') {
    const d = dot(a, b), nb = norm2(b);
    if (nb === 0) throw new EngineError('You cannot project onto the zero vector.');
    const k = d / nb, p = b.map((x) => x * k);
    steps.push({ title: 'Dot product and |b|', lines: [`\\vec a \\cdot \\vec b = ${t(d)}, \\quad |\\vec b| = ${sqrtTex(nb)}`] });
    steps.push({ title: 'Scalar projection (length along b)', formula: '\\frac{\\vec a \\cdot \\vec b}{|\\vec b|}', lines: [`\\frac{${t(d)}}{${sqrtTex(nb)}} = ${t(d / Math.sqrt(nb))}`] });
    steps.push({ title: 'Vector projection', formula: '\\frac{\\vec a \\cdot \\vec b}{|\\vec b|^2}\\,\\vec b', lines: [`\\frac{${t(d)}}{${t(nb)}}\\left(${vecTex(b, D)}\\right) = ${vecTex(p, D)}`] });
    answer = `\\text{proj}_{\\vec b}\\,\\vec a = ${vecTex(p, D)}`;
    extra = { scalar: d / Math.sqrt(nb), projection: p };
  } else {
    const v = dot(a, cross(b, c));
    steps.push({
      title: 'Scalar triple product as a determinant',
      formula: '[\\vec a\\ \\vec b\\ \\vec c] = \\vec a \\cdot (\\vec b \\times \\vec c)',
      lines: [
        `\\begin{vmatrix} ${a.map(t).join(' & ')} \\\\ ${b.map(t).join(' & ')} \\\\ ${c.map(t).join(' & ')} \\end{vmatrix}`,
        `= ${paren(a[0])}\\left(${paren(b[1])}${paren(c[2])} - ${paren(b[2])}${paren(c[1])}\\right) - ${paren(a[1])}\\left(${paren(b[0])}${paren(c[2])} - ${paren(b[2])}${paren(c[0])}\\right) + ${paren(a[2])}\\left(${paren(b[0])}${paren(c[1])} - ${paren(b[1])}${paren(c[0])}\\right) = ${t(v)}`,
      ],
    });
    steps.push({ title: Math.abs(v) < 1e-12 ? 'Coplanar' : 'Volume', lines: [Math.abs(v) < 1e-12 ? '[\\vec a\\ \\vec b\\ \\vec c] = 0: \\text{ the three vectors lie in one plane (coplanar).}' : `\\text{Volume of the parallelepiped} = |${t(v)}| = ${t(Math.abs(v))}`] });
    answer = `[\\vec a\\ \\vec b\\ \\vec c] = ${t(v)}`;
    extra = { triple: v };
  }

  // Checks with plain arithmetic
  let verified = true;
  if (op === 'cross') verified = close(dot(extra.cross, a), 0) && close(dot(extra.cross, b), 0);
  if (op === 'projection') verified = close(dot(a.map((x, i) => x - extra.projection[i]), b), 0);
  return { op, dim: D, a: vecTex(a, D), b: b ? vecTex(b, D) : null, c: c ? vecTex(c, D) : null, raw: { a, b, c }, answer, steps, verified, ...extra, result: answer, notes: [], plot: null };
}
