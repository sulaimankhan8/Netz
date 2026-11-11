/**
 * Separation of variables: the maths for /separation-of-variables (Unit 12). Ends held at 0 (u = 0 at x = 0 and x = L).
 *   heat     u_t = c²u_xx,  u(x, 0) = f(x):    u = Σ bₙ sin(nπx/L) e^{−c²n²π²t/L²},  bₙ = (2/L)∫₀ᴸ f sin(nπx/L) dx
 *   wave     u_tt = c²u_xx, u(x, 0) = f, u_t(x, 0) = g:
 *            u = Σ [aₙ cos(nπct/L) + bₙ sin(nπct/L)] sin(nπx/L),  aₙ = (2/L)∫f sin,  bₙ = (2/(nπc))∫g sin
 *   Laplace  u_xx + u_yy = 0 on 0 < x < a, 0 < y < b, u = 0 on three sides and u(x, b) = f(x):
 *            u = Σ Aₙ sin(nπx/a) sinh(nπy/a),  Aₙ = Bₙ/sinh(nπb/a),  Bₙ the sine coefficients of f
 * The sine coefficients come from the Fourier series engine (half-range sine series), checked numerically there.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { exactTex } from '../symbolic/multi';
import { solve as fourier } from './fourier-series';

const numIn = (s, label) => {
  const t = String(s ?? '').trim();
  if (!t) throw new EngineError(`${label} is empty.`);
  let v;
  try { v = math.evaluate(t.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !(v > 0)) throw new EngineError(`${label} must be a positive number.`);
  return v;
};
const isZeroF = (s) => !String(s ?? '').trim() || /^0+(\.0*)?$/.test(String(s).trim());

export function solve({ kind = 'heat', f, g = '', L = 'pi', c = '1', b = '1' }) {
  if (!['heat', 'wave', 'laplace'].includes(kind)) throw new EngineError('Pick the heat, wave or Laplace equation.');
  const Lv = numIn(L, kind === 'laplace' ? 'The width a' : 'The length L');
  const cv = kind === 'laplace' ? 1 : numIn(c, 'c');
  const bv = kind === 'laplace' ? numIn(b, 'The height b') : 1;
  const Lt = exactTex(Lv);
  const isPi = Math.abs(Lv - Math.PI) < 1e-12;
  const k = (s) => (isPi ? `n${s}` : Lt === '1' ? `n\\pi ${s}` : `\\frac{n\\pi ${s}}{${Lt}}`);
  const steps = [];
  const sep = {
    heat: ['u = X(x)\\,T(t): \\ \\frac{T\'}{c^2T} = \\frac{X\'\'}{X} = -\\lambda', 'X\'\' + \\lambda X = 0, \\ X(0) = X(L) = 0 \\Rightarrow \\lambda = \\left(\\frac{n\\pi}{L}\\right)^2, \\ X = \\sin\\frac{n\\pi x}{L}', 'T\' = -c^2\\lambda T \\Rightarrow T = e^{-c^2n^2\\pi^2t/L^2}'],
    wave: ['u = X(x)\\,T(t): \\ \\frac{T\'\'}{c^2T} = \\frac{X\'\'}{X} = -\\lambda', 'X = \\sin\\frac{n\\pi x}{L}, \\ \\lambda = \\left(\\frac{n\\pi}{L}\\right)^2', 'T\'\' + c^2\\lambda T = 0 \\Rightarrow T = a_n\\cos\\frac{n\\pi ct}{L} + b_n\\sin\\frac{n\\pi ct}{L}'],
    laplace: ['u = X(x)\\,Y(y): \\ \\frac{X\'\'}{X} = -\\frac{Y\'\'}{Y} = -\\lambda', 'X = \\sin\\frac{n\\pi x}{a}, \\ \\lambda = \\left(\\frac{n\\pi}{a}\\right)^2', 'Y\'\' - \\lambda Y = 0, \\ Y(0) = 0 \\Rightarrow Y = \\sinh\\frac{n\\pi y}{a}'],
  }[kind];
  steps.push({ title: 'Separate the variables', formula: { heat: 'u_t = c^2u_{xx}', wave: 'u_{tt} = c^2u_{xx}', laplace: 'u_{xx} + u_{yy} = 0' }[kind], depth: 0, lines: sep });
  // sine coefficients of f
  // f = 0 (wave released with a push only): all its coefficients are 0
  const fZero = isZeroF(f);
  const fs = fZero ? { bn: '0', first: [1, 2, 3].map((n) => ({ n, b: '0' })), special: [], steps: [], verified: true, notes: [] } : fourier({ mode: 'half-sin', f, from: '0', to: isPi ? 'pi' : String(Lv) });
  const fsSteps = fs.steps.map((s) => ({ ...s, depth: (s.depth || 0) + 1 }));
  const special = (r) => (r.special || []).filter((q) => q.which === 'b');
  const coefLine = (name, r, scale = '') => {
    const sp = special(r);
    return [`${name} = ${scale}${scale ? '\\left(' : ''}${r.bn}${scale ? '\\right)' : ''}`, ...sp.map((q) => `${name.replace('_n', `_{${q.n}}`)} = ${scale ? `${scale}\\cdot ` : ''}${q.value} \\ (\\text{worked out on its own})`)];
  };
  let series, first, verified = fs.verified;
  const notes = [];
  if (kind === 'heat') {
    // exponent c²π²n²t/L²: π² cancels when L is a multiple of π
    const r1 = (cv * cv * Math.PI * Math.PI) / (Lv * Lv), r2 = (cv * cv) / (Lv * Lv);
    const rT = /\d\.\d/.test(exactTex(r1)) ? `${exactTex(r2) === '1' ? '' : exactTex(r2)}\\pi^{2}` : exactTex(r1);
    steps.push({ title: 'Use u(x, 0) = f(x)', formula: 'f(x) = \\sum b_n \\sin\\frac{n\\pi x}{L} \\Rightarrow b_n = \\frac{2}{L}\\int_0^L f(x)\\sin\\frac{n\\pi x}{L}dx', depth: 0, lines: coefLine('b_n', fs) });
    fsSteps.forEach((s) => steps.push(s));
    series = `u(x, t) = \\sum_{n=1}^{\\infty} b_n \\sin ${k('x')}\\; e^{-${rT === '1' ? '' : rT} n^{2} t}`;
    first = fs.first.map((q) => ({ n: q.n, c: q.b }));
  } else if (kind === 'wave') {
    steps.push({ title: 'Use u(x, 0) = f(x)', formula: 'a_n = \\frac{2}{L}\\int_0^L f(x)\\sin\\frac{n\\pi x}{L}dx', depth: 0, lines: coefLine('a_n', fs) });
    fsSteps.forEach((s) => steps.push(s));
    let gb = null;
    if (!isZeroF(g)) {
      gb = fourier({ mode: 'half-sin', f: g, from: '0', to: isPi ? 'pi' : String(Lv) });
      verified = verified && gb.verified;
      const sc = `\\frac{${isPi ? '1' : Lt}}{n\\pi${cv === 1 ? '' : `\\cdot ${exactTex(cv)}`}}`.replace('\\frac{1}{n\\pi}', '\\frac{1}{n\\pi}');
      steps.push({ title: 'Use u_t(x, 0) = g(x)', formula: 'b_n\\frac{n\\pi c}{L} = \\frac{2}{L}\\int_0^L g(x)\\sin\\frac{n\\pi x}{L}dx', depth: 0, lines: coefLine('b_n', gb, isPi ? `\\frac{1}{n${cv === 1 ? '' : exactTex(cv)}}` : sc) });
      gb.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
    } else steps.push({ title: 'Use u_t(x, 0) = 0', depth: 0, lines: ['b_n = 0 \\ (\\text{released from rest})'] });
    const w = isPi ? `n${cv === 1 ? '' : exactTex(cv)}t` : Lt === '1' ? `${cv === 1 ? '' : exactTex(cv)}n\\pi t` : `\\frac{${cv === 1 ? '' : exactTex(cv)}n\\pi t}{${Lt}}`;
    series = `u(x, t) = \\sum_{n=1}^{\\infty} \\left(a_n\\cos ${w}${gb ? ` + b_n\\sin ${w}` : ''}\\right)\\sin ${k('x')}`;
    first = fs.first.map((q) => ({ n: q.n, c: q.b }));
  } else {
    steps.push({ title: 'Use u(x, b) = f(x)', formula: 'A_n\\sinh\\frac{n\\pi b}{a} = \\frac{2}{a}\\int_0^a f(x)\\sin\\frac{n\\pi x}{a}dx', depth: 0, lines: [...coefLine('B_n', fs), `A_n = \\frac{B_n}{\\sinh${isPi ? `(${exactTex(bv)}n)` : `\\frac{${exactTex(bv)}n\\pi}{${Lt}}`}}`.replace('(1n)', 'n')] });
    fsSteps.forEach((s) => steps.push(s));
    series = `u(x, y) = \\sum_{n=1}^{\\infty} A_n \\sin ${k('x')}\\, \\sinh ${k('y')}`;
    first = fs.first.map((q) => ({ n: q.n, c: q.b }));
    notes.push('Aₙ = Bₙ / sinh(nπb/a): the sinh makes the series converge fast inside the rectangle.');
  }
  steps.push({ title: 'The solution', depth: 0, lines: [series, `\\text{first sine coefficients of } f: ${first.map((q) => `${q.n}: ${q.c}`).join(', \\ ')}`] });
  return { kind, series, coef: fs.bn, first, steps, notes: [...notes, ...(fs.notes || []).filter((n) => !/dashed/.test(n))], verified, result: series };
}
