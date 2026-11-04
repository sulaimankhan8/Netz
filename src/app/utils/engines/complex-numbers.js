/**
 * Complex numbers a + bi, step by step:
 *   add, subtract, multiply (i² = −1), divide (multiply by the conjugate of the bottom),
 *   modulus |z| = √(a² + b²), conjugate, polar form r(cos θ + i sin θ) = r e^{iθ} with the
 *   argument in the right quadrant, powers by De Moivre's theorem, and square roots.
 * Values are exact where NETZ recognises them (√5, 2π/3); every result is checked with math.js's complex numbers.
 */
import { EngineError } from '../numeric/steps';
import { readWhole } from './input';
import { math } from '../symbolic/tree';
import { texOf } from '../symbolic/roots';

const OPS = ['add', 'subtract', 'multiply', 'divide', 'modulus', 'conjugate', 'polar', 'power', 'sqrt'];
const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);

/** a + bi from text like 3 + 4i, 2 - i, -5i, 7. */
export function readComplex(text, label) {
  const s = String(text ?? '').trim().replace(/\s+/g, '').replace(/j/g, 'i');
  if (!s) throw new EngineError(`${label} is empty. Write it like 3 + 4i.`);
  if (/[a-hk-z]/i.test(s.replace(/i/g, '').replace(/pi|sqrt|e/gi, ''))) throw new EngineError(`${label}: use numbers and i only, like 3 + 4i.`);
  let z;
  try { z = math.evaluate(s.replace(/(\d)i/g, '$1*i')); } catch { throw new EngineError(`${label}: "${text}" is not a complex number. Write it like 3 + 4i or 2 - i.`); }
  if (typeof z === 'number') return { re: z, im: 0 };
  if (z && typeof z.re === 'number') return { re: clean(z.re), im: clean(z.im) };
  throw new EngineError(`${label}: "${text}" is not a complex number.`);
}

/** a + bi in LaTeX, exact where possible: 3 + 4i, -i, \frac{1}{2} - \frac{\sqrt{3}}{2}i. */
export function cTex(re, im) {
  re = clean(re); im = clean(im);
  const r = texOf(re), m = texOf(Math.abs(im));
  const iPart = m === '1' ? 'i' : /[+-]/.test(m.replace(/^-/, '')) ? `\\left(${m}\\right)i` : `${m}i`;
  if (im === 0) return r;
  if (re === 0) return im < 0 ? `-${iPart}` : iPart;
  return `${r} ${im < 0 ? '-' : '+'} ${iPart}`;
}
const paren = (re, im) => `\\left(${cTex(re, im)}\\right)`;

/** Argument θ in (−π, π] with an explanation of the quadrant. */
function argument(a, b) {
  const theta = Math.atan2(b, a);
  const alpha = Math.atan(Math.abs(b / a));
  const quad = a > 0 && b >= 0 ? 'first' : a < 0 && b >= 0 ? 'second' : a < 0 && b < 0 ? 'third' : 'fourth';
  let how;
  if (a === 0) how = `\\text{on the imaginary axis: } \\theta = ${b > 0 ? '\\frac{\\pi}{2}' : '-\\frac{\\pi}{2}'}`;
  else if (b === 0) how = `\\text{on the real axis: } \\theta = ${a > 0 ? '0' : '\\pi'}`;
  else {
    const at = texOf(alpha);
    how = `\\alpha = \\tan^{-1}\\left|\\frac{${texOf(b)}}{${texOf(a)}}\\right| = ${at}; \\ \\text{${quad} quadrant} \\Rightarrow \\theta = ${quad === 'first' ? '\\alpha' : quad === 'second' ? '\\pi - \\alpha' : quad === 'third' ? '-(\\pi - \\alpha)' : '-\\alpha'} = ${texOf(theta)}`;
  }
  return { theta, how };
}

export function solve({ op = 'multiply', z1: t1, z2: t2 = '', n: tn = '2' }) {
  if (!OPS.includes(op)) throw new EngineError('Choose an operation.');
  const z = readComplex(t1, op === 'add' || op === 'subtract' || op === 'multiply' || op === 'divide' ? 'z₁' : 'z');
  const two = ['add', 'subtract', 'multiply', 'divide'].includes(op);
  const w = two ? readComplex(t2, 'z₂') : null;
  const [a, b] = [z.re, z.im];
  const steps = [];
  let result = null, answer, extra = {};

  if (op === 'add' || op === 'subtract') {
    const s = op === 'add' ? 1 : -1;
    result = { re: a + s * w.re, im: b + s * w.im };
    steps.push({ title: `${op === 'add' ? 'Add' : 'Subtract'} the real parts and the imaginary parts separately`, lines: [`${paren(a, b)} ${s > 0 ? '+' : '-'} ${paren(w.re, w.im)} = (${texOf(a)} ${s > 0 ? '+' : '-'} ${texOf(w.re)}) + (${texOf(b)} ${s > 0 ? '+' : '-'} ${texOf(w.im)})i`, `= ${cTex(result.re, result.im)}`] });
  } else if (op === 'multiply') {
    const [c, d] = [w.re, w.im];
    result = { re: a * c - b * d, im: a * d + b * c };
    steps.push({ title: 'Expand the brackets (FOIL)', lines: [`${paren(a, b)}${paren(c, d)} = ${texOf(a * c)} + ${texOf(a * d)}i + ${texOf(b * c)}i + ${texOf(b * d)}i^2`.replace(/\+ -/g, '- ')] });
    steps.push({ title: 'Use i² = −1 and collect', formula: 'i^2 = -1', lines: [`= (${texOf(a * c)} - ${texOf(b * d)}) + (${texOf(a * d)} + ${texOf(b * c)})i`.replace(/- -/g, '+ ').replace(/\+ -/g, '- '), `= ${cTex(result.re, result.im)}`] });
  } else if (op === 'divide') {
    const [c, d] = [w.re, w.im];
    const den = c * c + d * d;
    if (den === 0) throw new EngineError('You cannot divide by 0.');
    const nr = a * c + b * d, ni = b * c - a * d;
    result = { re: nr / den, im: ni / den };
    steps.push({ title: 'Multiply top and bottom by the conjugate of the bottom', formula: '\\overline{c + di} = c - di', lines: [`\\frac{${cTex(a, b)}}{${cTex(c, d)}} \\cdot \\frac{${cTex(c, -d)}}{${cTex(c, -d)}}`] });
    steps.push({ title: 'The bottom becomes a real number', formula: '(c + di)(c - di) = c^2 + d^2', lines: [`${paren(c, d)}${paren(c, -d)} = ${texOf(c)}^2 + ${d < 0 ? `(${texOf(d)})` : texOf(d)}^2 = ${texOf(den)}`] });
    steps.push({ title: 'Multiply out the top', lines: [`${paren(a, b)}${paren(c, -d)} = ${cTex(nr, ni)}`] });
    steps.push({ title: 'Divide each part', lines: [`\\frac{${cTex(nr, ni)}}{${texOf(den)}} = ${cTex(result.re, result.im)}`] });
  } else if (op === 'modulus') {
    const sq = a * a + b * b, r = Math.sqrt(sq);
    steps.push({ title: 'Use |z| = √(a² + b²)', formula: '|a + bi| = \\sqrt{a^2 + b^2}', lines: [`|${cTex(a, b)}| = \\sqrt{${a < 0 ? `(${texOf(a)})` : texOf(a)}^2 + ${b < 0 ? `(${texOf(b)})` : texOf(b)}^2} = \\sqrt{${texOf(sq)}} = ${texOf(r)}`] });
    answer = texOf(r); extra = { modulus: r };
  } else if (op === 'conjugate') {
    result = { re: a, im: -b };
    steps.push({ title: 'Change the sign of the imaginary part', formula: '\\overline{a + bi} = a - bi', lines: [`\\overline{${cTex(a, b)}} = ${cTex(a, -b)}`] });
  } else if (op === 'polar' || op === 'power' || op === 'sqrt') {
    if (a === 0 && b === 0) {
      if (op === 'polar') throw new EngineError('0 has no argument, so it has no polar form.');
    }
    const r = Math.hypot(a, b);
    const { theta, how } = argument(a, b);
    steps.push({ title: 'Modulus', formula: 'r = \\sqrt{a^2 + b^2}', lines: [`r = \\sqrt{${texOf(a * a)} + ${texOf(b * b)}} = ${texOf(r)}`] });
    steps.push({ title: 'Argument (check the quadrant)', lines: [how] });
    const rT = texOf(r), tT0 = texOf(theta);
    const tT = tT0.startsWith('-') ? `\\left(${tT0}\\right)` : tT0; // cos(−3π/4), not cos −3π/4
    if (op === 'polar') {
      steps.push({ title: 'Polar and exponential form', formula: 'z = r(\\cos\\theta + i\\sin\\theta) = re^{i\\theta}', lines: [`${cTex(a, b)} = ${rT === '1' ? '' : rT}\\left(\\cos ${tT} + i \\sin ${tT}\\right) = ${rT === '1' ? '' : rT}e^{${tT0} i}`] });
      answer = `${rT === '1' ? '' : rT}\\left(\\cos ${tT} + i \\sin ${tT}\\right)`;
      extra = { modulus: r, argument: theta, degrees: (theta * 180) / Math.PI };
    } else if (op === 'power') {
      const n = readWhole(tn, 'The power n', 1, 20);
      // Exact by repeated multiplication (whole numbers stay whole); De Moivre shown alongside
      let p = { re: 1, im: 0 };
      for (let k = 0; k < n; k++) p = { re: p.re * a - p.im * b, im: p.re * b + p.im * a };
      result = { re: clean(p.re), im: clean(p.im) };
      steps.push({ title: "De Moivre's theorem", formula: '\\left[r(\\cos\\theta + i\\sin\\theta)\\right]^n = r^n(\\cos n\\theta + i\\sin n\\theta)', lines: [`z^{${n}} = ${texOf(r ** n)}\\left(\\cos ${texOf(n * theta)} + i \\sin ${texOf(n * theta)}\\right)`, `= ${cTex(result.re, result.im)}`] });
      extra = { n };
    } else {
      const p = Math.sqrt((r + a) / 2), q = Math.sign(b || 1) * Math.sqrt((r - a) / 2);
      result = { re: clean(p), im: clean(q) };
      steps.push({ title: 'Square roots of a + bi', formula: '\\pm\\left(\\sqrt{\\tfrac{r + a}{2}} + i\\,\\text{sign}(b)\\sqrt{\\tfrac{r - a}{2}}\\right)', lines: [`\\sqrt{\\frac{${rT} + ${texOf(a)}}{2}} = ${texOf(p)}, \\quad \\sqrt{\\frac{${rT} - ${texOf(a)}}{2}} = ${texOf(Math.abs(q))}`.replace(/\+ -/g, '- '), `\\sqrt{${cTex(a, b)}} = \\pm\\left(${cTex(result.re, result.im)}\\right)`] });
      answer = `\\pm\\left(${cTex(result.re, result.im)}\\right)`;
    }
  }
  if (result && !answer) answer = cTex(result.re, result.im);

  // Check with math.js complex arithmetic
  let verified = true;
  try {
    const Z = math.complex(a, b), W = w ? math.complex(w.re, w.im) : null;
    const want = { add: () => math.add(Z, W), subtract: () => math.subtract(Z, W), multiply: () => math.multiply(Z, W), divide: () => math.divide(Z, W), conjugate: () => math.conj(Z), power: () => math.pow(Z, extra.n), sqrt: () => math.sqrt(Z) }[op];
    if (want && result) { const c = math.complex(want()); verified = close(c.re, result.re) && close(c.im, result.im); }
    if (op === 'modulus' || op === 'polar') verified = close(math.abs(Z), extra.modulus) && (op === 'modulus' || close(math.arg(Z), extra.argument));
  } catch { verified = false; }

  const pts = [{ x: a, y: b, label: two ? 'z₁' : 'z' }];
  if (w) pts.push({ x: w.re, y: w.im, label: 'z₂' });
  if (result) pts.push({ x: result.re, y: result.im, label: op === 'sqrt' ? '√z' : 'ans' });
  if (op === 'sqrt' && result) pts.push({ x: -result.re, y: -result.im, label: '−√z' });

  return { op, z: cTex(a, b), w: w ? cTex(w.re, w.im) : null, result, answer, steps, verified, points: pts, ...extra, notes: [], plot: null };
}
