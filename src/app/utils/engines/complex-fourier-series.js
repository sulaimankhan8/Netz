/**
 * Complex Fourier series and Parseval's identity: the maths for /complex-fourier-series (Unit 13).
 *   f(x) = Σ_{n=−∞}^{∞} cₙ e^{inπx/L} on (c, c + 2L),  cₙ = (1/2L)∫ f e^{−inπx/L} dx = (aₙ − ibₙ)/2,  c₀ = a₀/2
 *   Parseval: (1/2L)∫|f|² dx = Σ|cₙ|² = a₀²/4 + ½Σ(aₙ² + bₙ²)
 * aₙ and bₙ come from the Fourier series engine (by hand, checked numerically); the first cₙ are also worked out
 * numerically, and Parseval's two sides are compared (the sum with 400 terms each side).
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { exactTex, readMulti } from '../symbolic/multi';
import { solve as fourier, readPiecesX } from './fourier-series';
import { cTex, C } from '../symbolic/complex';
import { recognise, integrate1 } from '../symbolic/vectorint';
import { gaussLegendre } from '../symbolic/iterated';

const num0 = (t, label) => { let v; try { v = math.evaluate(String(t ?? '').trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; } if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: type a number like -pi or 0.`); return v; };

export function solve({ f, from = '-pi', to = 'pi' }) {
  const a = num0(from, 'The start'), b = num0(to, 'The end');
  if (!(b > a)) throw new EngineError('The interval needs start < end.');
  const L = (b - a) / 2;
  const fs = fourier({ mode: 'full', f, from, to });
  const pieces = readPiecesX(f, a, b);
  const isPi = Math.abs(L - Math.PI) < 1e-12;
  const arg = isPi ? 'nx' : `\\frac{n\\pi x}{${exactTex(L)}}`;
  const steps = [];
  steps.push({ title: 'The complex form', formula: `f(x) = \\sum_{n=-\\infty}^{\\infty} c_n e^{i${arg}}, \\quad c_n = \\frac{1}{${exactTex(2 * L)}}\\int f(x)\\,e^{-i${arg}}dx = \\frac{a_n - ib_n}{2}`, depth: 0, lines: [`a_0 = ${fs.a0}, \\quad a_n = ${fs.an}, \\quad b_n = ${fs.bn}`] });
  fs.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  // cₙ numerically for |n| ≤ 3, written exactly when it can be
  const { xs, ws } = gaussLegendre(32);
  // f sampled once at the quadrature points (weight × value), reused for every cₙ
  const X = [], WF = [];
  for (const p of pieces) { const g = p.g.compile(); const n = 60; for (let k = 0; k < n; k++) { const A = p.from + ((p.to - p.from) * k) / n, B = p.from + ((p.to - p.from) * (k + 1)) / n, c = (A + B) / 2, h = (B - A) / 2; for (let i = 0; i < xs.length; i++) { const x = c + h * xs[i]; let v; try { v = g.evaluate({ x }); } catch { v = NaN; } if (Number.isFinite(v)) { X.push(x); WF.push(ws[i] * h * v); } } } }
  const quad = (w) => { let s = 0; for (let i = 0; i < X.length; i++) s += WF[i] * w(X[i]); return s; };
  const cn = (n) => { const w = (n * Math.PI) / L; return C(quad((x) => Math.cos(w * x)) / (2 * L), -quad((x) => Math.sin(w * x)) / (2 * L)); };
  const first = [-3, -2, -1, 0, 1, 2, 3].map((n) => ({ n, c: cn(n) }));
  const cT = (z) => { const re = recognise(z.re), im = recognise(z.im); if (!/\d\.\d/.test(re + im)) { const reZ = Math.abs(z.re) < 1e-12, imZ = Math.abs(z.im) < 1e-12; if (reZ && imZ) return '0'; if (imZ) return re; const ii = im === '1' ? 'i' : im === '-1' ? '-i' : `${im}i`; return reZ ? ii : `${re} ${ii.startsWith('-') ? '-' : '+'} ${ii.replace(/^-/, '')}`; } return cTex(z); };
  steps.push({ title: 'The first coefficients', depth: 0, lines: [first.map((q) => `c_{${q.n}} = ${cT(q.c)}`).join(', \\quad ')] });
  // Parseval
  let lhsNum = 0, lhsTex = null;
  const sq = pieces.map((p) => ({ g: math.parse(`(${p.g.toString()})^2`), from: p.from, to: p.to }));
  let exactAll = true;
  const parts = sq.map((p) => { const r = integrate1(p.g, 'x', p.from, p.to, ['x']); if (!r.exact) exactAll = false; return r.number; });
  lhsNum = parts.reduce((s, v) => s + v, 0) / (2 * L);
  lhsTex = exactAll ? recognise(lhsNum) : `\\approx ${Number(lhsNum.toPrecision(8))}`;
  let rhs = 0;
  for (let n = -400; n <= 400; n++) { const z = cn(n); rhs += z.re * z.re + z.im * z.im; }
  const agree = Math.abs(rhs - lhsNum) < 5e-3 * Math.max(1, lhsNum);
  steps.push({ title: "Parseval's identity", formula: '\\frac{1}{2L}\\int |f|^2\\,dx = \\sum_{n=-\\infty}^{\\infty} |c_n|^2 = \\frac{a_0^2}{4} + \\frac{1}{2}\\sum_{n=1}^{\\infty}(a_n^2 + b_n^2)', depth: 0, lines: [`\\frac{1}{${exactTex(2 * L)}}\\int |f|^2\\,dx = ${lhsTex}`, `\\sum_{|n| \\le 400} |c_n|^2 \\approx ${Number(rhs.toPrecision(6))} \\ (${agree ? '\\text{agrees}' : '\\text{does not agree}'})`] });
  void readMulti;
  const cnTex = fs.an === '0' ? `c_n = -\\frac{i}{2}\\left(${fs.bn}\\right)` : fs.bn === '0' ? `c_n = \\frac{1}{2}\\left(${fs.an}\\right)` : `c_n = \\frac{1}{2}\\left(${fs.an} - i\\left(${fs.bn}\\right)\\right)`;
  return { cn: cnTex, c0: fs.a0 === '0' ? '0' : recognise(first[3].c.re), first: first.map((q) => ({ n: q.n, c: cT(q.c) })), parseval: lhsTex, steps, notes: ['Sums of |cₙ|² converge slowly when f has jumps, so the check uses 801 terms.'], verified: fs.verified && agree, result: lhsTex };
}
