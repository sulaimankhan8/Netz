/**
 * Fourier series: the maths for /fourier-series-calculator (catalog 6H).
 *   full range on (c, c + 2L):  a₀ = (1/L)∫f,  aₙ = (1/L)∫f cos(nπx/L),  bₙ = (1/L)∫f sin(nπx/L)
 *   half range on (0, L):       cosine series aₙ = (2/L)∫₀ᴸ f cos(nπx/L);  sine series bₙ = (2/L)∫₀ᴸ f sin(nπx/L)
 * f may be one expression or pieces ("-1 for -pi < x < 0; 1 for 0 < x < pi"). The integrals are done with n as a
 * letter, then sin(nπ) = 0 and cos(nπ) = (−1)ⁿ are used. Values of n where the general formula breaks (n = 1 for
 * x sin x) are worked out separately. Each formula is checked against numerical integration at n = 1, 2, 3.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, fn, add, mul, div, pow, paren } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti } from '../symbolic/multi';
import { definite, gaussLegendre } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';

const N = sym('n'), X = sym('x');
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const num0 = (t) => { const v = math.evaluate(String(t).trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`"${t}" is not a number.`); return v; };

/** "x for -pi < x < 0; 0 for 0 < x < pi" or a single expression on (from, to). */
export function readPiecesX(text, from, to) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type f(x), or its pieces like "-1 for -pi < x < 0; 1 for 0 < x < pi".');
  if (parts.length === 1 && !/\bfor\b|\bif\b/.test(parts[0])) return [{ g: readMulti(parts[0], 'f(x)'), from, to }];
  return parts.map((p) => {
    const m = p.match(/^(.+?)\s+(?:for|if)\s+(.+?)\s*<\s*x\s*<\s*(.+)$/);
    if (!m) throw new EngineError(`Write each piece like "x for 0 < x < pi" (could not read "${p}").`);
    return { g: readMulti(m[1], 'A piece'), from: num0(m[2]), to: num0(m[3]) };
  });
}

/** sin(kπn) → 0 and cos(kπn) → (−1)^{kn} for whole k (n is a whole number). */
function integerN(node) {
  return node.transform((m) => {
    if (!(m.isFunctionNode && ['sin', 'cos'].includes(m.fn.name))) return m;
    const arg = m.args[0];
    const k1 = evalAt(arg, { n: 1.3 }) / (1.3 * Math.PI), k2 = evalAt(arg, { n: 2.7 }) / (2.7 * Math.PI);
    if (!(Number.isFinite(k1) && Math.abs(k1 - k2) < 1e-9 && Math.abs(k1 - Math.round(k1)) < 1e-9)) return m;
    const k = Math.round(k1);
    if (m.fn.name === 'sin') return num(0);
    return k % 2 === 0 ? num(1) : pow(paren(num(-1)), N);
  });
}

/** (1/L)∫ f·w over the pieces, as a node in n (or a number when w has no n). */
function coefficient(pieces, weight, scale, vars) {
  let total = null;
  const lines = [];
  const steps = [];
  for (const p of pieces) {
    const integrand = weight ? mul(p.g, weight) : p.g;
    const d = definite(integrand, 'x', numNode(p.from), numNode(p.to), vars);
    lines.push(...d.lines);
    d.steps.forEach((s) => steps.push(s));
    total = total ? add(total, d.value) : d.value;
  }
  const v = tidyMulti(integerN(mul(numNode(scale), paren(total))), ['n']);
  return { value: tidyMulti(integerN(v), ['n']), lines, steps };
}

/** ∫ g over the pieces numerically (Gauss–Legendre). */
function quad(pieces, w) {
  const { xs, ws } = gaussLegendre(40);
  let s = 0;
  for (const p of pieces) {
    const c = (p.from + p.to) / 2, h = (p.to - p.from) / 2;
    for (let i = 0; i < xs.length; i++) { const x = c + h * xs[i]; s += ws[i] * h * evalAt(p.g, { x }) * w(x); }
  }
  return s;
}

export function solve({ mode = 'full', f, from = '-pi', to = 'pi' }) {
  const c = num0(from), d = num0(to);
  if (!(d > c)) throw new EngineError('The interval should go from the smaller number to the larger one.');
  if ((mode === 'half-cos' || mode === 'half-sin') && Math.abs(c) > 1e-12) throw new EngineError('A half-range series is on (0, L): make the interval start at 0.');
  const pieces = readPiecesX(f, c, d);
  for (const p of pieces) {
    const bad = [...p.g.toString().matchAll(/[a-z]+/g)].map((m) => m[0]).filter((w) => !['x', 'pi', 'e', 'sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs', 'sinh', 'cosh'].includes(w));
    if (bad.length) throw new EngineError(`f may use only x (it uses ${bad.join(', ')}).`);
    if (p.from < c - 1e-9 || p.to > d + 1e-9) throw new EngineError('Every piece must lie inside the interval.');
  }
  const L = mode === 'full' ? (d - c) / 2 : d;
  const k = mode === 'full' ? 1 / L : 2 / L;
  const arg = Math.abs(L - Math.PI) < 1e-12 ? mul(N, X) : mul(div(mul(N, sym('pi')), numNode(L)), X);
  const argTex = Math.abs(L - Math.PI) < 1e-12 ? 'nx' : `\\frac{n\\pi x}{${exactTex(L)}}`;
  const vars = ['x', 'n'];
  const steps = [];
  const out = { mode, L: exactTex(L) };
  const wantA = mode !== 'half-sin', wantB = mode !== 'half-cos';
  const kTex = exactTex(k);
  const check = [];
  if (wantA) {
    const a0 = coefficient(pieces, null, k, ['x']);
    const a0v = evalAt(a0.value, {});
    out.a0 = exactTex(a0v).includes('.') && !/\d\.\d{3}/.test(mtex(a0.value)) ? mtex(a0.value) : exactTex(a0v);
    steps.push({ title: 'a₀', formula: `a_0 = ${kTex}\\int f(x)\\,dx`, depth: 0, lines: [...a0.lines, `a_0 = ${kTex} \\times (\\ldots) = ${out.a0}`] });
    const an = coefficient(pieces, fn('cos', arg), k, vars);
    out.an = mtex(an.value);
    steps.push({ title: 'aₙ', formula: `a_n = ${kTex}\\int f(x)\\cos ${argTex}\\,dx`, depth: 0, lines: [...an.lines, '\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:', `a_n = ${out.an}`] });
    an.steps.forEach((s) => steps.push(s));
    out.anNode = an.value;
    out.a0v = a0v;
    check.push(['a', an.value]);
  }
  if (wantB) {
    const bn = coefficient(pieces, fn('sin', arg), k, vars);
    out.bn = mtex(bn.value);
    steps.push({ title: 'bₙ', formula: `b_n = ${kTex}\\int f(x)\\sin ${argTex}\\,dx`, depth: 0, lines: [...bn.lines, '\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:', `b_n = ${out.bn}`] });
    bn.steps.forEach((s) => steps.push(s));
    out.bnNode = bn.value;
    check.push(['b', bn.value]);
  }
  // Values of n where the general formula breaks, and a numeric check of the rest
  const special = [];
  let verified = true;
  for (const [which, node] of check) {
    for (const n of [1, 2, 3]) {
      const w = which === 'a' ? (x) => Math.cos((n * Math.PI * x) / L) : (x) => Math.sin((n * Math.PI * x) / L);
      const numv = k * quad(pieces, w);
      const formula = evalAt(node, { n });
      if (!Number.isFinite(formula)) special.push({ which, n, value: exactTex(numv) });
      else if (Math.abs(formula - numv) > 1e-6 * Math.max(1, Math.abs(numv))) verified = false;
    }
  }
  if (special.length) steps.push({ title: 'Values the general formula misses', depth: 0, lines: special.map((s) => `${s.which}_{${s.n}} = ${s.value} \\ (\\text{the formula divides by 0 here, so it is worked out on its own})`) });
  out.special = special;
  // The series
  const terms = [];
  if (wantA) terms.push(`a_n\\cos ${argTex}`);
  if (wantB) terms.push(`b_n\\sin ${argTex}`);
  out.series = `f(x) = ${wantA ? '\\frac{a_0}{2} + ' : ''}\\sum_{n=1}^{\\infty}\\left(${terms.join(' + ')}\\right)`;
  // Partial sum for the plot
  const coef = (node, n, which) => { const sp = special.find((s) => s.which === which && s.n === n); if (sp) { const w = which === 'a' ? (x) => Math.cos((n * Math.PI * x) / L) : (x) => Math.sin((n * Math.PI * x) / L); return k * quad(pieces, w); } return evalAt(node, { n }); };
  const M = 15;
  const A = wantA ? Array.from({ length: M }, (_, i) => coef(out.anNode, i + 1, 'a')) : [];
  const B = wantB ? Array.from({ length: M }, (_, i) => coef(out.bnNode, i + 1, 'b')) : [];
  const partial = (x) => (wantA ? out.a0v / 2 : 0) + A.reduce((s, a, i) => s + a * Math.cos(((i + 1) * Math.PI * x) / L), 0) + B.reduce((s, b, i) => s + b * Math.sin(((i + 1) * Math.PI * x) / L), 0);
  const fAt = (x) => { const p = pieces.find((q) => x >= q.from && x <= q.to); return p ? evalAt(p.g, { x }) : NaN; };
  out.first = [1, 2, 3].map((n) => ({ n, a: wantA ? exactTex(coef(out.anNode, n, 'a')) : null, b: wantB ? exactTex(coef(out.bnNode, n, 'b')) : null }));
  out.plot = { fn: fAt, fn2: partial, view: { x0: c, x1: d, y0: Math.min(...[...Array(41)].map((_, i) => fAt(c + ((d - c) * i) / 40)).filter(Number.isFinite), 0), y1: Math.max(...[...Array(41)].map((_, i) => fAt(c + ((d - c) * i) / 40)).filter(Number.isFinite), 0) } };
  const notes = ['The dashed curve is the sum of the first 15 terms; at a jump it passes through the midpoint (Gibbs wiggles appear near jumps).'];
  if (!verified) notes.push('NETZ could not confirm every coefficient numerically; treat them with care.');
  delete out.anNode; delete out.bnNode;
  return { ...out, steps, notes, verified };
}

