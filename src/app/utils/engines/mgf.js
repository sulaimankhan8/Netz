/**
 * Moment generating functions: the maths for /moment-generating-function (Unit 5).
 *   M(t) = E[e^{tX}];  E[Xʳ] = M⁽ʳ⁾(0);  mean = M′(0), variance = M″(0) − M′(0)².
 * Named distributions use their standard M(t); a discrete table gives M(t) = Σ pᵢ e^{t xᵢ}. Derivatives are taken
 * symbolically; where they are 0/0 at t = 0 (the uniform M(t)) the moments come from central differences of M.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';

const DISTS = {
  binomial: { params: ['n', 'p'], M: ({ n, p }) => `(1 - ${p} + ${p}*e^t)^${n}`, name: 'Binomial' },
  poisson: { params: ['lambda'], M: ({ lambda }) => `e^(${lambda}*(e^t - 1))`, name: 'Poisson' },
  geometric: { params: ['p'], M: ({ p }) => `${p}*e^t/(1 - (1 - ${p})*e^t)`, name: 'Geometric' },
  exponential: { params: ['lambda'], M: ({ lambda }) => `${lambda}/(${lambda} - t)`, name: 'Exponential' },
  uniform: { params: ['a', 'b'], M: ({ a, b }) => `(e^(${b}*t) - e^(${a}*t))/(t*(${b} - ${a}))`, name: 'Uniform' },
  normal: { params: ['mu', 'sigma'], M: ({ mu, sigma }) => `e^(${mu}*t + ${sigma}^2*t^2/2)`, name: 'Normal' },
  gamma: { params: ['alpha', 'theta'], M: ({ alpha, theta }) => `(1 - ${theta}*t)^(-${alpha})`, name: 'Gamma' },
};

export function solve({ dist = 'binomial', n = '', p = '', lambda = '', a = '', b = '', mu = '', sigma = '', alpha = '', theta = '', xs = '', ps = '' }) {
  let Mtext, name;
  const steps = [];
  if (dist === 'custom') {
    const X = String(xs).split(/[,;\s]+/).filter(Boolean).map(Number), P = String(ps).split(/[,;\s]+/).filter(Boolean).map((s) => math.evaluate(s));
    if (!X.length || X.length !== P.length || [...X, ...P].some((v) => !Number.isFinite(v))) throw new EngineError('Give the same number of x values and probabilities.');
    const tot = P.reduce((s, v) => s + v, 0);
    if (Math.abs(tot - 1) > 1e-9) throw new EngineError(`The probabilities add up to ${Number(tot.toPrecision(6))}, not 1.`);
    Mtext = X.map((x, i) => `${P[i]}*e^(${x}*t)`).join(' + ');
    name = 'Your distribution';
    steps.push({ title: 'M(t) = Σ p e^(tx)', depth: 0, lines: [`M(t) = ${X.map((x, i) => `${exactTex(P[i])}e^{${x === 1 ? '' : x}t}`).join(' + ')}`] });
  } else {
    const D = DISTS[dist];
    if (!D) throw new EngineError('Choose a distribution.');
    const vals = { n, p, lambda, a, b, mu, sigma, alpha, theta };
    const got = Object.fromEntries(D.params.map((k) => [k, readConstant(vals[k], k === 'lambda' ? 'λ' : k === 'mu' ? 'μ' : k === 'sigma' ? 'σ' : k === 'alpha' ? 'α' : k === 'theta' ? 'θ' : k)]));
    if ('p' in got && !(got.p > 0 && got.p <= 1)) throw new EngineError('p must be between 0 and 1.');
    Mtext = D.M(got);
    name = D.name;
  }
  const M = math.parse(Mtext);
  const M1 = math.derivative(M, 't'), M2 = math.derivative(M1, 't');
  // Where M′ or M″ is 0/0 at t = 0 (uniform), use fourth-order central differences on M itself (M(0) = 1 always)
  const Mc = M.compile();
  const Mv = (t) => Mc.evaluate({ t });
  const h = 1e-3;
  const fd1 = () => (-Mv(2 * h) + 8 * Mv(h) - 8 * Mv(-h) + Mv(-2 * h)) / (12 * h);
  const fd2 = () => (-Mv(2 * h) + 16 * Mv(h) - 30 + 16 * Mv(-h) - Mv(-2 * h)) / (12 * h * h);
  const direct = (node) => { try { const v = node.evaluate({ t: 0 }); return typeof v === 'number' && Number.isFinite(v) ? v : null; } catch { return null; } };
  const tidyNum = (v) => { const f = toFraction(v, 1000, 1e-6); return f ? f.n / f.d : v; };
  const m1 = direct(M1) ?? tidyNum(fd1());
  const m2 = direct(M2) ?? tidyNum(fd2());
  const variance = m2 - m1 * m1;
  const Mt = tidyMulti(M, ['t']);
  steps.push(
    { title: `${name}: the MGF`, formula: 'M(t) = E\\left[e^{tX}\\right]', depth: 0, lines: [`M(t) = ${mtex(Mt)}`] },
    { title: 'First moment (mean)', formula: "\\mu = M'(0)", depth: 0, lines: [`M'(t) = ${mtex(tidyMulti(M1, ['t']))}`, `M'(0) = ${exactTex(m1)}`] },
    { title: 'Second moment', formula: "E[X^2] = M''(0)", depth: 0, lines: [`M''(0) = ${exactTex(m2)}`] },
    { title: 'Variance', formula: "\\sigma^2 = M''(0) - M'(0)^2", depth: 0, lines: [`\\sigma^2 = ${exactTex(m2)} - (${exactTex(m1)})^2 = ${exactTex(variance)}`] },
  );
  return { name, M: mtex(Mt), mean: exactTex(m1), m2: exactTex(m2), variance: exactTex(variance), steps, notes: ['Higher moments come from more derivatives at t = 0: E[Xʳ] = M⁽ʳ⁾(0).'], verified: Number.isFinite(m1) && Number.isFinite(m2) };
}
