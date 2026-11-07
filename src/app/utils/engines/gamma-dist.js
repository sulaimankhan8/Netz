/**
 * Gamma distribution with shape α and scale θ: the maths for /gamma-distribution (Unit 5).
 *   f(x) = x^{α−1} e^{−x/θ} / (Γ(α) θ^α),  P(X ≤ x) = P(α, x/θ) (regularised incomplete gamma),
 *   mean αθ, variance αθ². With α = 1 it is the exponential distribution; with whole α it is the Erlang distribution.
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';
import { readConstant } from './input';
import { incompleteGamma, logGamma } from '../criticalValues';

const r6 = (v) => Number(v.toPrecision(6));

export function solve({ alpha, theta, mode = 'less', x = '', a = '', b = '' }) {
  const A = readConstant(alpha, 'α'), T = readConstant(theta, 'θ');
  if (!(A > 0 && T > 0)) throw new EngineError('α and θ must be positive.');
  const F = (t) => (t <= 0 ? 0 : incompleteGamma(A, t / T));
  const pdf = (t) => (t <= 0 ? 0 : Math.exp((A - 1) * Math.log(t) - t / T - logGamma(A) - A * Math.log(T)));
  let p, query, line;
  if (mode === 'between') {
    const lo = readConstant(a, 'a'), hi = readConstant(b, 'b');
    if (!(hi > lo)) throw new EngineError('b must be bigger than a.');
    p = F(hi) - F(lo); query = `P(${exactTex(lo)} < X < ${exactTex(hi)})`;
    line = `${query} = P\\left(\\alpha, \\tfrac{${exactTex(hi)}}{\\theta}\\right) - P\\left(\\alpha, \\tfrac{${exactTex(lo)}}{\\theta}\\right) = ${r6(p)}`;
  } else {
    const X = readConstant(x, 'x');
    p = mode === 'less' ? F(X) : 1 - F(X);
    query = mode === 'less' ? `P(X \\le ${exactTex(X)})` : `P(X > ${exactTex(X)})`;
    line = `${query} = ${mode === 'less' ? '' : '1 - '}P\\left(${exactTex(A)}, \\tfrac{${exactTex(X)}}{${exactTex(T)}}\\right) = ${r6(p)}`;
  }
  const steps = [
    { title: 'The distribution', formula: 'f(x) = \\frac{x^{\\alpha-1}e^{-x/\\theta}}{\\Gamma(\\alpha)\\theta^{\\alpha}}', depth: 0, lines: [`\\alpha = ${exactTex(A)}, \\ \\theta = ${exactTex(T)}, \\quad \\text{mean} = \\alpha\\theta = ${exactTex(A * T)}, \\quad \\text{variance} = \\alpha\\theta^2 = ${exactTex(A * T * T)}`] },
    { title: 'The probability (incomplete gamma function)', formula: 'P(X \\le x) = P\\left(\\alpha, \\frac{x}{\\theta}\\right)', depth: 0, lines: [line] },
  ];
  if (Number.isInteger(A) && A <= 10 && mode !== 'between') {
    const X = readConstant(x, 'x'), m = X / T;
    let s = 0, fact = 1;
    for (let j = 0; j < A; j++) { if (j > 0) fact *= j; s += m ** j / fact; }
    steps.push({ title: 'Check with the Erlang formula (whole α)', formula: 'P(X > x) = e^{-x/\\theta}\\sum_{j=0}^{\\alpha-1}\\frac{(x/\\theta)^j}{j!}', depth: 0, lines: [`P(X > ${exactTex(X)}) = ${r6(Math.exp(-m) * s)}`] });
  }
  const top = Math.max(A * T + 4 * Math.sqrt(A) * T, 1);
  const mode2 = Math.max(0, (A - 1) * T);
  return {
    query, p: r6(p), mean: exactTex(A * T), variance: exactTex(A * T * T), steps, notes: ['With α = 1 this is the exponential distribution with rate 1/θ.'], verified: true,
    plot: { fn: pdf, shade: mode === 'between' ? { a: readConstant(a, 'a'), b: readConstant(b, 'b') } : mode === 'less' ? { a: 0, b: readConstant(x, 'x') } : { a: readConstant(x, 'x'), b: top }, view: { x0: 0, x1: top, y0: 0, y1: A < 1 ? Math.min(3, pdf(top / 100)) : pdf(mode2) || 1 } },
  };
}
