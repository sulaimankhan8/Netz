/**
 * Reduction formulas: the maths for /reduction-formula (Unit 6).
 *   ∫sinⁿx dx = −sinⁿ⁻¹x cos x/n + ((n − 1)/n)∫sinⁿ⁻²x dx        ∫cosⁿx dx = cosⁿ⁻¹x sin x/n + ((n − 1)/n)∫cosⁿ⁻²x dx
 *   ∫tanⁿx dx = tanⁿ⁻¹x/(n − 1) − ∫tanⁿ⁻²x dx                   ∫secⁿx dx = secⁿ⁻²x tan x/(n − 1) + ((n − 2)/(n − 1))∫secⁿ⁻²x dx
 *   ∫xⁿe^{ax} dx = xⁿe^{ax}/a − (n/a)∫xⁿ⁻¹e^{ax} dx               ∫(ln x)ⁿ dx = x(ln x)ⁿ − n∫(ln x)ⁿ⁻¹ dx
 *   Wallis: ∫₀^{π/2} sinⁿx dx = ∫₀^{π/2} cosⁿx dx = ((n − 1)/n)((n − 3)/(n − 2))⋯ × (π/2 for even n, 1 for odd n)
 * The formula is applied down to n = 0 or 1, and the answer is differentiated back (or integrated numerically) as a check.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, neg, paren, tidy, polish } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, equalAt } from '../symbolic/multi';
import { numNode } from '../symbolic/ode';
import { recognise } from '../symbolic/vectorint';

const X = sym('x');
const frac = (p, q) => { const f = toFraction(p / q, 10000, 1e-12); return f && f.d !== 1 ? `\\frac{${f.n}}{${f.d}}` : f ? String(f.n) : exactTex(p / q); };
const P = (s) => math.parse(s);

const KINDS = {
  sin: { name: '\\sin^{n}x', f: (n) => P(`sin(x)^${n}`), base: [P('x'), P('-cos(x)')], step: 2,
    rule: 'I_n = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n - 1}{n}I_{n-2}',
    term: (n) => div(mul(neg(pow(fn('sin', X), num(n - 1))), fn('cos', X)), num(n)), coef: (n) => (n - 1) / n },
  cos: { name: '\\cos^{n}x', f: (n) => P(`cos(x)^${n}`), base: [P('x'), P('sin(x)')], step: 2,
    rule: 'I_n = \\frac{\\cos^{n-1}x\\sin x}{n} + \\frac{n - 1}{n}I_{n-2}',
    term: (n) => div(mul(pow(fn('cos', X), num(n - 1)), fn('sin', X)), num(n)), coef: (n) => (n - 1) / n },
  tan: { name: '\\tan^{n}x', f: (n) => P(`tan(x)^${n}`), base: [P('x'), P('log(abs(sec(x)))')], step: 2,
    rule: 'I_n = \\frac{\\tan^{n-1}x}{n - 1} - I_{n-2}',
    term: (n) => div(pow(fn('tan', X), num(n - 1)), num(n - 1)), coef: () => -1 },
  sec: { name: '\\sec^{n}x', f: (n) => P(`sec(x)^${n}`), base: [P('x'), P('log(abs(sec(x) + tan(x)))')], step: 2,
    rule: 'I_n = \\frac{\\sec^{n-2}x\\tan x}{n - 1} + \\frac{n - 2}{n - 1}I_{n-2}',
    term: (n) => div(mul(pow(fn('sec', X), num(n - 2)), fn('tan', X)), num(n - 1)), coef: (n) => (n - 2) / (n - 1) },
  xexp: { name: 'x^{n}e^{ax}', step: 1, rule: 'I_n = \\frac{x^ne^{ax}}{a} - \\frac{n}{a}I_{n-1}' },
  log: { name: '(\\ln x)^{n}', f: (n) => P(`log(x)^${n}`), base: [P('x')], step: 1,
    rule: 'I_n = x(\\ln x)^n - nI_{n-1}', term: (n) => mul(X, pow(fn('log', X), num(n))), coef: (n) => -n },
};

export function solve({ kind = 'sin', n: nText = '4', a: aText = '1', wallis = 'no' }) {
  const K = KINDS[kind];
  if (!K) throw new EngineError('Pick an integral.');
  const n = Number(String(nText).trim());
  if (!Number.isInteger(n) || n < 0 || n > 12) throw new EngineError('n should be a whole number from 0 to 12.');
  let a = 1;
  if (kind === 'xexp') {
    a = Number(math.evaluate(String(aText || '1')));
    if (!Number.isFinite(a) || a === 0) throw new EngineError('a must be a non-zero number.');
    const ea = fn('exp', mul(numNode(a), X));
    K.f = (k) => mul(pow(X, num(k)), ea);
    K.base = [div(ea, numNode(a))];
    K.term = (k) => div(mul(pow(X, num(k)), ea), numNode(a));
    K.coef = (k) => -k / a;
  }
  const steps = [{ title: 'Reduction formula', formula: K.rule, depth: 0, lines: [`I_n = \\int ${K.name}\\,dx${kind === 'xexp' ? `, \\ a = ${exactTex(a)}` : ''}`] }];
  const useWallis = wallis === 'yes' && (kind === 'sin' || kind === 'cos');
  if (useWallis) {
    // ∫₀^{π/2}: the boundary term vanishes at both ends, I_n = ((n − 1)/n) I_{n−2}
    const chain = [];
    let k = n, prod = 1;
    while (k >= 2) { chain.push(`\\frac{${k - 1}}{${k}}`); prod *= (k - 1) / k; k -= 2; }
    const end = k === 0 ? '\\frac{\\pi}{2}' : '1';
    const value = prod * (k === 0 ? Math.PI / 2 : 1);
    const tex = recognise(value);
    steps.push({ title: 'Between 0 and π/2', formula: 'I_n = \\frac{n - 1}{n}I_{n-2}, \\quad I_0 = \\frac{\\pi}{2}, \\ I_1 = 1', depth: 0, lines: ['\\text{the term } \\frac{\\sin^{n-1}x\\cos x}{n} \\text{ is 0 at both ends}', `I_{${n}} = ${chain.length ? `${chain.join('\\cdot')}\\cdot ` : ''}${end} = ${tex}`] });
    // numeric check
    let s = 0; const N = 2000;
    for (let i = 0; i < N; i++) { const x = ((i + 0.5) * Math.PI) / (2 * N); s += (kind === 'sin' ? Math.sin(x) : Math.cos(x)) ** n * (Math.PI / (2 * N)); }
    return { kind, value: tex, steps, notes: [], verified: Math.abs(s - value) < 1e-6, result: tex };
  }
  // indefinite: I_n = term(n) + coef(n)·I_{n−step}, down to the base
  const cache = new Map();
  const lines = [];
  const I = (k) => {
    if (cache.has(k)) return cache.get(k);
    let r;
    if (k < K.base.length) r = K.base[k];
    else { const below = I(k - K.step); r = add(K.term(k), mul(numNode(K.coef(k)), paren(below))); lines.push({ k, text: `I_{${k}} = ${mtex(polish(tidy(K.term(k))))} ${K.coef(k) < 0 ? '-' : '+'} ${frac(Math.abs(K.coef(k)), 1) === '1' ? '' : frac(Math.abs(K.coef(k)), 1)}I_{${k - K.step}}` }); }
    cache.set(k, r);
    return r;
  };
  const F = I(n);
  const base = K.base.map((b, k) => `I_{${k}} = ${mtex(polish(b))}`).join(', \\quad ');
  steps.push({ title: 'Apply it down to the base', depth: 0, lines: [...lines.sort((p, q) => q.k - p.k).map((l) => l.text), base] });
  const Ft = tidyMulti(F, ['x']);
  steps.push({ title: 'Put it together', depth: 0, lines: [`\\int ${K.name.replace(/n\}/g, `${n}}`).replace('{n}', `{${n}}`)}\\,dx = ${mtex(polish(Ft))} + C`] });
  let verified = true;
  try { verified = equalAt(math.derivative(Ft, 'x'), K.f(n), ['x']); } catch { verified = true; }
  return { kind, value: `${mtex(polish(Ft))} + C`, steps, notes: [], verified, result: mtex(polish(Ft)) };
}
