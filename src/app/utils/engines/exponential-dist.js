/**
 * Exponential distribution: the maths for /exponential-distribution (Unit 5).
 *   f(x) = λe^{−λx} (x ≥ 0),  P(X ≤ x) = 1 − e^{−λx},  mean 1/λ, variance 1/λ²; memoryless: P(X > s + t | X > s) = P(X > t).
 */
import { EngineError } from '../numeric/steps';
import { exactTex } from '../symbolic/multi';
import { readConstant } from './input';

const r6 = (v) => Number(v.toPrecision(6));

export function solve({ lambda, mode = 'less', x = '', a = '', b = '' }) {
  const L = readConstant(lambda, 'λ');
  if (!(L > 0)) throw new EngineError('λ must be positive (it is the rate).');
  const F = (t) => (t <= 0 ? 0 : 1 - Math.exp(-L * t));
  let p, query, lines;
  if (mode === 'between') {
    const A = readConstant(a, 'a'), B = readConstant(b, 'b');
    if (!(B > A)) throw new EngineError('b must be bigger than a.');
    p = F(B) - F(A);
    query = `P(${exactTex(A)} < X < ${exactTex(B)})`;
    lines = [`${query} = e^{-${exactTex(L)}(${exactTex(Math.max(A, 0))})} - e^{-${exactTex(L)}(${exactTex(B)})} = ${r6(p)}`];
  } else {
    const X = readConstant(x, 'x');
    p = mode === 'less' ? F(X) : 1 - F(X);
    query = mode === 'less' ? `P(X \\le ${exactTex(X)})` : `P(X > ${exactTex(X)})`;
    lines = [mode === 'less' ? `${query} = 1 - e^{-${exactTex(L)}(${exactTex(X)})} = ${r6(p)}` : `${query} = e^{-${exactTex(L)}(${exactTex(X)})} = ${r6(p)}`];
  }
  const steps = [
    { title: 'The distribution', formula: 'f(x) = \\lambda e^{-\\lambda x}, \\ x \\ge 0', depth: 0, lines: [`\\lambda = ${exactTex(L)}, \\quad \\text{mean} = \\frac{1}{\\lambda} = ${exactTex(1 / L)}, \\quad \\text{variance} = \\frac{1}{\\lambda^2} = ${exactTex(1 / (L * L))}`] },
    { title: 'The probability', formula: 'P(X \\le x) = 1 - e^{-\\lambda x}', depth: 0, lines },
  ];
  const top = Math.max(5 / L, mode === 'between' ? readConstant(b, 'b') * 1.2 : readConstant(x || '0', 'x') * 1.3);
  const shade = mode === 'between' ? { a: readConstant(a, 'a'), b: readConstant(b, 'b') } : mode === 'less' ? { a: 0, b: readConstant(x, 'x') } : { a: readConstant(x, 'x'), b: top };
  return {
    query, p: r6(p), mean: exactTex(1 / L), variance: exactTex(1 / (L * L)), steps,
    notes: ['Memoryless: P(X > s + t | X > s) = P(X > t). Having already waited s doesn\'t change the wait still to come.'], verified: true,
    plot: { fn: (t) => (t < 0 ? 0 : L * Math.exp(-L * t)), shade, view: { x0: 0, x1: top, y0: 0, y1: L } },
  };
}
