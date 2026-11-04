/**
 * Normal distribution N(μ, σ²): areas by standardising, z = (x − μ)/σ, and Φ(z) = P(Z ≤ z).
 * Questions: P(X < a), P(X > a), P(a < X < b), and the inverse: the x with P(X < x) = p.
 * The steps also give the "area from 0 to z" value that printed tables in Indian textbooks list.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { normalCdf, normalInverse } from '../numeric/distributions';

const n4 = (v) => Number(v).toFixed(4);
const n6 = (v) => String(Number(Number(v).toPrecision(6)));
const zTex = (x, mu, sigma) => `z = \\frac{${n6(x)} - ${n6(mu)}}{${n6(sigma)}} = ${n4((x - mu) / sigma)}`;
/** The table value: area between 0 and |z|. */
const tableLine = (z) => `\\text{Table: area from } 0 \\text{ to } ${n4(Math.abs(z))} = ${n4(normalCdf(Math.abs(z)) - 0.5)}`;

export function solve({ mu: tm = '0', sigma: ts = '1', query = 'lt', a: ta = '', b: tb = '', p: tp = '' }) {
  const mu = readNumber(tm, 'The mean μ'), sigma = readNumber(ts, 'The standard deviation σ');
  if (!(sigma > 0)) throw new EngineError('σ (the standard deviation) must be positive.');
  if (!['lt', 'gt', 'between', 'inverse'].includes(query)) throw new EngineError('Choose the kind of question.');
  const steps = [];
  let value, question, shade, answerTex;

  if (query === 'inverse') {
    const p = readNumber(tp, 'The probability p');
    if (!(p > 0 && p < 1)) throw new EngineError('p must be between 0 and 1.');
    const z = normalInverse(p), x = mu + z * sigma;
    steps.push({ title: 'Find z with Φ(z) = p', formula: '\\Phi(z) = P(Z \\le z)', lines: [`\\Phi(z) = ${n6(p)} \\Rightarrow z = ${n4(z)}`, tableLine(z)] });
    steps.push({ title: 'Convert back to x', formula: 'x = \\mu + z\\sigma', lines: [`x = ${n6(mu)} + (${n4(z)})(${n6(sigma)}) = ${n4(x)}`] });
    value = x; question = `P(X < x) = ${n6(p)}`; answerTex = `x = ${n4(x)}`;
    shade = { a: mu - 4 * sigma, b: x };
  } else {
    const a = readNumber(ta, query === 'between' ? 'The lower value a' : 'The value a');
    steps.push({ title: 'Standardise', formula: 'z = \\frac{x - \\mu}{\\sigma}', lines: [zTex(a, mu, sigma)] });
    const za = (a - mu) / sigma;
    if (query === 'lt') {
      value = normalCdf(za); question = `P(X < ${n6(a)})`;
      steps.push({ title: 'Area to the left', lines: [tableLine(za), `P(Z < ${n4(za)}) = ${za >= 0 ? `0.5 + ${n4(normalCdf(za) - 0.5)}` : `0.5 - ${n4(0.5 - normalCdf(za))}`} = ${n4(value)}`] });
      shade = { a: mu - 4 * sigma, b: a };
    } else if (query === 'gt') {
      value = 1 - normalCdf(za); question = `P(X > ${n6(a)})`;
      steps.push({ title: 'Area to the right', lines: [tableLine(za), `P(Z > ${n4(za)}) = ${za >= 0 ? `0.5 - ${n4(normalCdf(za) - 0.5)}` : `0.5 + ${n4(0.5 - normalCdf(za))}`} = ${n4(value)}`] });
      shade = { a, b: mu + 4 * sigma };
    } else {
      const b = readNumber(tb, 'The upper value b');
      if (!(b > a)) throw new EngineError('b must be bigger than a.');
      const zb = (b - mu) / sigma;
      steps.push({ title: 'Standardise b', lines: [zTex(b, mu, sigma)] });
      value = normalCdf(zb) - normalCdf(za); question = `P(${n6(a)} < X < ${n6(b)})`;
      const sameSide = za * zb >= 0;
      steps.push({
        title: 'Area between the two',
        lines: [tableLine(za), tableLine(zb), sameSide
          ? `\\text{Same side of the mean: subtract} \\Rightarrow ${n4(Math.max(normalCdf(Math.abs(za)), normalCdf(Math.abs(zb))) - 0.5)} - ${n4(Math.min(normalCdf(Math.abs(za)), normalCdf(Math.abs(zb))) - 0.5)} = ${n4(value)}`
          : `\\text{Opposite sides of the mean: add} \\Rightarrow ${n4(normalCdf(Math.abs(za)) - 0.5)} + ${n4(normalCdf(Math.abs(zb)) - 0.5)} = ${n4(value)}`],
      });
      shade = { a, b };
    }
    answerTex = `${question} = ${n4(value)}`;
  }

  const pdf = (x) => Math.exp(-(((x - mu) / sigma) ** 2) / 2) / (sigma * Math.sqrt(2 * Math.PI));
  // Check: the area agrees with numerical integration of the density
  let verified = true;
  if (query !== 'inverse') {
    // One-sided areas run to ±∞: integrate out to 10σ (the rest is below 1e-23)
    const lo = query === 'lt' ? mu - 10 * sigma : Math.max(shade.a, mu - 10 * sigma);
    const hi = query === 'gt' ? mu + 10 * sigma : Math.min(shade.b, mu + 10 * sigma);
    let s = 0; const N = 2000, h = (hi - lo) / N;
    for (let i = 0; i <= N; i++) s += (i === 0 || i === N ? 1 : i % 2 ? 4 : 2) * pdf(lo + i * h);
    verified = Math.abs((s * h) / 3 - value) < 1e-6;
  } else verified = Math.abs(normalCdf((value - mu) / sigma) - Number(tp)) < 1e-9;
  return {
    mu, sigma, query, question, value, answerTex, steps, verified, result: value,
    pdf, shade: { a: Math.max(shade.a, mu - 4 * sigma), b: Math.min(shade.b, mu + 4 * sigma) }, notes: [], plot: null,
  };
}
