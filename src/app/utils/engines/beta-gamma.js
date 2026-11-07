/**
 * Beta and gamma functions: the maths for /beta-gamma-function (catalog 6G).
 *   Γ(n) = ∫₀^∞ x^(n−1) e^(−x) dx,  Γ(n + 1) = n Γ(n),  Γ(1) = 1,  Γ(1/2) = √π
 *   B(m, n) = ∫₀¹ x^(m−1)(1 − x)^(n−1) dx = Γ(m)Γ(n)/Γ(m + n)
 *   ∫₀^{π/2} sin^p θ cos^q θ dθ = ½ B((p + 1)/2, (q + 1)/2)
 *   ∫₀^∞ x^n e^(−ax) dx = Γ(n + 1)/a^(n + 1)
 * Values for whole and half-whole arguments are exact: a fraction times a power of √π. Other arguments
 * use the Lanczos approximation and are shown as decimals. Integrals are cross-checked numerically.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';
import { gaussLegendre } from '../symbolic/iterated';

/** Exact numbers of the form (p/q)·π^(h/2): { p, q, h } with p, q whole. */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const make = (p, q, h = 0) => { const g = gcd(p, q); const s = q < 0 ? -1 : 1; return { p: (s * p) / g, q: (s * q) / g, h }; };
const times = (A, B) => make(A.p * B.p, A.q * B.q, A.h + B.h);
const over = (A, B) => make(A.p * B.q, A.q * B.p, A.h - B.h);
const valueOf = (E) => (E.p / E.q) * Math.PI ** (E.h / 2);
export function exactTexOf(E) {
  if (E.p === 0) return '0';
  const pi = E.h === 0 ? '' : E.h === 1 ? '\\sqrt{\\pi}' : E.h === 2 ? '\\pi' : E.h % 2 === 0 ? `\\pi^{${E.h / 2}}` : `\\pi^{${E.h}/2}`;
  if (E.h < 0) {
    const den = E.h === -1 ? '\\sqrt{\\pi}' : E.h === -2 ? '\\pi' : `\\pi^{${-E.h}/2}`;
    return `${E.p < 0 ? '-' : ''}\\frac{${Math.abs(E.p)}}{${E.q === 1 ? '' : E.q}${den}}`;
  }
  const sign = E.p < 0 ? '-' : '';
  const a = Math.abs(E.p);
  if (E.q === 1) return `${sign}${a === 1 && pi ? '' : a}${pi}`;
  return `${sign}\\frac{${a === 1 && pi ? '' : a}${pi}}{${E.q}}`;
}

/** n as a fraction with denominator 1 or 2, or null. */
const half = (n) => { const f = toFraction(n, 2, 1e-12); return f && (f.d === 1 || f.d === 2) ? f : null; };
const fracTex = (n) => { const f = toFraction(n, 1000, 1e-9); if (!f) return String(Number(n.toPrecision(8))); return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`; };

/** Lanczos approximation of Γ(z) for real z (reflection for z < 1/2). */
export function gammaNum(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaNum(1 - z));
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
}

/**
 * Γ(n) with its reduction steps when n is whole or half-whole: Γ(7/2) = 5/2 · 3/2 · 1/2 · Γ(1/2) = 15√π/8.
 * Returns { exact (or null), value, lines }.
 */
export function gammaExact(n) {
  const f = half(n);
  if (f && n <= 0 && f.d === 1) throw new EngineError(`Γ(${n}) is not defined: Γ has poles at 0, −1, −2, …`);
  if (!f) return { exact: null, value: gammaNum(n), lines: [`\\Gamma(${fracTex(n)}) \\approx ${Number(gammaNum(n).toPrecision(10))} \\quad \\text{(no closed form; Lanczos approximation)}`] };
  const lines = [];
  let E;
  if (f.d === 1) {
    // (n − 1)!
    let p = 1;
    for (let k = 2; k < n; k++) p *= k;
    E = make(p, 1, 0);
    lines.push(n <= 2 ? `\\Gamma(${n}) = ${n - 1}! = 1` : `\\Gamma(${n}) = (${n} - 1)! = ${n - 1}! = ${p}`);
  } else {
    // Walk to Γ(1/2) = √π, multiplying (or dividing, for negative n) as we go
    E = make(1, 1, 1);
    const factors = [];
    if (n > 0) {
      for (let k = n - 1; k > 0; k -= 1) { factors.push(k); E = times(E, make(Math.round(k * 2), 2)); }
      const chain = factors.map(fracTex).join(' \\cdot ');
      lines.push(n === 0.5 ? '\\Gamma\\left(\\tfrac{1}{2}\\right) = \\sqrt{\\pi}' : `\\Gamma\\left(${fracTex(n)}\\right) = ${chain} \\cdot \\Gamma\\left(\\tfrac{1}{2}\\right) = ${chain} \\cdot \\sqrt{\\pi} = ${exactTexOf(E)}`);
    } else {
      for (let k = n; k < 0.5; k += 1) { factors.push(k); E = over(E, make(Math.round(k * 2), 2)); }
      lines.push(`\\Gamma\\left(${fracTex(n)}\\right) = \\frac{\\Gamma\\left(\\tfrac{1}{2}\\right)}{${factors.map((k) => `\\left(${fracTex(k)}\\right)`).join('')}} = ${exactTexOf(E)}`);
    }
  }
  return { exact: E, value: valueOf(E), lines };
}

const read = (t, label) => readConstant(t, label);

export function solve({ mode = 'gamma', n = '', m = '', p = '', q = '', a = '1' }) {
  const steps = [];
  const notes = [];
  let resultTex, value, numeric = null, title;

  if (mode === 'gamma') {
    const nv = read(n, 'n');
    const r = gammaExact(nv);
    title = `\\Gamma\\left(${fracTex(nv)}\\right)`;
    steps.push({ title: 'Use Γ(n + 1) = n Γ(n) down to Γ(1) = 1 or Γ(1/2) = √π', formula: '\\Gamma(n+1) = n\\,\\Gamma(n)', lines: r.lines });
    value = r.value;
    resultTex = r.exact ? exactTexOf(r.exact) : String(Number(value.toPrecision(10)));
    if (nv > 0) numeric = integrate((x) => x ** (nv - 1) * Math.exp(-x), true);
  } else if (mode === 'beta') {
    const mv = read(m, 'm'), nv = read(n, 'n');
    if (!(mv > 0 && nv > 0)) throw new EngineError('B(m, n) needs m > 0 and n > 0.');
    const A = gammaExact(mv), B = gammaExact(nv), C = gammaExact(mv + nv);
    title = `B\\left(${fracTex(mv)}, ${fracTex(nv)}\\right)`;
    steps.push({ title: 'Write B with gamma functions', formula: 'B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m + n)}', lines: [`${title} = \\frac{\\Gamma(${fracTex(mv)})\\,\\Gamma(${fracTex(nv)})}{\\Gamma(${fracTex(mv + nv)})}`] });
    steps.push({ title: 'Each gamma value', lines: [...A.lines, ...B.lines, ...C.lines] });
    value = (A.value * B.value) / C.value;
    if (A.exact && B.exact && C.exact) {
      const E = over(times(A.exact, B.exact), C.exact);
      resultTex = exactTexOf(E);
      steps.push({ title: 'Put them together', lines: [`${title} = \\frac{${exactTexOf(A.exact)} \\cdot ${exactTexOf(B.exact)}}{${exactTexOf(C.exact)}} = ${resultTex}`] });
    } else resultTex = String(Number(value.toPrecision(10)));
    numeric = integrate((x) => x ** (mv - 1) * (1 - x) ** (nv - 1), false, 0, 1);
  } else if (mode === 'sincos') {
    const pv = read(p, 'p'), qv = read(q, 'q');
    if (!(pv > -1 && qv > -1)) throw new EngineError('The powers must be greater than −1.');
    const M = (pv + 1) / 2, N = (qv + 1) / 2;
    const pw = (f, k) => (k === 0 ? '' : k === 1 ? `\\${f}\\theta\\,` : `\\${f}^{${fracTex(k)}}\\theta\\,`);
    title = `\\int_0^{\\pi/2} ${pw('sin', pv)}${pw('cos', qv)}${pv === 0 && qv === 0 ? '1\\,' : ''}d\\theta`;
    steps.push({ title: 'Beta form', formula: '\\int_0^{\\pi/2} \\sin^p\\theta\\cos^q\\theta\\,d\\theta = \\frac{1}{2}B\\left(\\frac{p+1}{2}, \\frac{q+1}{2}\\right)', lines: [`= \\frac{1}{2}B\\left(${fracTex(M)}, ${fracTex(N)}\\right) = \\frac{\\Gamma(${fracTex(M)})\\,\\Gamma(${fracTex(N)})}{2\\,\\Gamma(${fracTex(M + N)})}`] });
    const A = gammaExact(M), B = gammaExact(N), C = gammaExact(M + N);
    steps.push({ title: 'Each gamma value', lines: [...A.lines, ...B.lines, ...C.lines] });
    value = (A.value * B.value) / (2 * C.value);
    if (A.exact && B.exact && C.exact) {
      resultTex = exactTexOf(over(times(A.exact, B.exact), times(C.exact, make(2, 1))));
      steps.push({ title: 'Put them together', lines: [`= \\frac{${exactTexOf(A.exact)} \\cdot ${exactTexOf(B.exact)}}{2 \\cdot ${exactTexOf(C.exact)}} = ${resultTex}`] });
    } else resultTex = String(Number(value.toPrecision(10)));
    numeric = integrate((t) => Math.sin(t) ** pv * Math.cos(t) ** qv, false, 0, Math.PI / 2);
    if (Number.isInteger(pv) && Number.isInteger(qv)) notes.push('For whole-number powers this is the same as the Wallis (reduction) formula.');
  } else if (mode === 'xexp') {
    const nv = read(n, 'n'), av = read(a, 'a');
    if (!(nv > -1)) throw new EngineError('The power of x must be greater than −1.');
    if (!(av > 0)) throw new EngineError('a must be positive, so that e^(−ax) dies away.');
    const G = gammaExact(nv + 1);
    title = `\\int_0^{\\infty} x^{${fracTex(nv)}} e^{-${av === 1 ? '' : fracTex(av)}x}\\,dx`;
    steps.push({ title: 'Substitute t = ax', formula: '\\int_0^\\infty x^{n} e^{-ax}\\,dx = \\frac{\\Gamma(n+1)}{a^{n+1}}', lines: [`= \\frac{\\Gamma(${fracTex(nv + 1)})}{${fracTex(av)}^{${fracTex(nv + 1)}}}`, ...G.lines] });
    value = G.value / av ** (nv + 1);
    const af = toFraction(av, 1000, 1e-12);
    const powInt = Number.isInteger(nv + 1);
    if (G.exact && af && powInt) {
      resultTex = exactTexOf(over(G.exact, make(af.n ** (nv + 1), af.d ** (nv + 1))));
    } else resultTex = String(Number(value.toPrecision(10)));
    steps.push({ title: 'Value', lines: [`= ${resultTex}`] });
    numeric = integrate((x) => x ** nv * Math.exp(-av * x), true);
  } else {
    throw new EngineError('Choose what to work out.');
  }
  const verified = numeric === null || !Number.isFinite(numeric) || Math.abs(numeric - value) <= 1e-6 * Math.max(1, Math.abs(value));
  if (numeric !== null && Number.isFinite(numeric)) notes.push(`Numerical check: ${Number(numeric.toPrecision(10))}.`);
  return { title, resultTex, value, steps, notes, verified, result: value };
}

/** ∫ g over [lo, hi] (or [0, ∞) when infinite) by Gauss–Legendre on pieces; endpoint singularities are mild here. */
function integrate(g, infinite, lo = 0, hi = 1) {
  const { xs, ws } = gaussLegendre(48);
  const piece = (A, B, h) => { const c = (A + B) / 2, w = (B - A) / 2; let s = 0; for (let i = 0; i < xs.length; i++) s += ws[i] * h(c + w * xs[i]); return s * w; };
  if (!infinite) {
    // Split near the ends (where x^(m−1) or (1 − x)^(n−1) can blow up) with geometric pieces
    let s = 0;
    const L = hi - lo, cuts = [0];
    for (let k = 30; k >= 1; k--) cuts.push(0.5 * 2 ** -k);
    cuts.push(0.5);
    for (let k = 1; k <= 30; k++) cuts.push(1 - 0.5 * 2 ** -k);
    cuts.push(1);
    for (let i = 0; i < cuts.length - 1; i++) s += piece(lo + L * cuts[i], lo + L * cuts[i + 1], g);
    return s;
  }
  // [0, ∞): t ∈ (0, 1) with x = t/(1 − t)
  return integrate((t) => { const x = t / (1 - t); const y = g(x) / (1 - t) ** 2; return Number.isFinite(y) ? y : 0; }, false, 0, 1);
}
