/**
 * Fourier series: the maths for /fourier-series-calculator (catalog 6H).
 *   full range on (c, c + 2L):  a₀ = (1/L)∫f,  aₙ = (1/L)∫f cos(nπx/L),  bₙ = (1/L)∫f sin(nπx/L)
 *   half range on (0, L):       cosine series aₙ = (2/L)∫₀ᴸ f cos(nπx/L);  sine series bₙ = (2/L)∫₀ᴸ f sin(nπx/L)
 * f may be one expression or pieces ("-1 for -pi < x < 0; 1 for 0 < x < pi"). The integrals are done with n as a
 * letter, then sin(nπ) = 0 and cos(nπ) = (−1)ⁿ are used. Values of n where the general formula breaks (n = 1 for
 * x sin x) are worked out separately. Each formula is checked against numerical integration at n = 1, 2, 3.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, paren } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti } from '../symbolic/multi';
import { definite, gaussLegendre } from '../symbolic/iterated';
import { numNode, distribute } from '../symbolic/ode';
import { rationalParts, polyGcd, polyDiv, polyAdd, polyMul, polyScale } from '../symbolic/poly';
import { polyNode } from '../symbolic/integral';
import { polyTex } from '../symbolic/algebra';

const N = sym('n'), X = sym('x');
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const num0 = (t, label = 'An end of the interval') => {
  if (!String(t ?? '').trim()) throw new EngineError(`${label} is empty: type a number such as 0, pi or -pi.`);
  let v;
  try { v = math.evaluate(String(t).trim().replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: "${t}" is not a number.`);
  return v;
};

/** "x for -pi < x < 0; 0 for 0 < x < pi" or a single expression on (from, to). */
export function readPiecesX(text, from, to) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type f(x), or its pieces like "-1 for -pi < x < 0; 1 for 0 < x < pi".');
  if (parts.length === 1 && !/\bfor\b|\bif\b/.test(parts[0])) return [{ g: readMulti(parts[0], 'f(x)'), from, to }];
  if (parts.length > 8) throw new EngineError(`Use at most 8 pieces (there are ${parts.length}).`);
  return parts.map((p) => {
    const m = p.match(/^(.+?)\s+(?:for|if)\s+(.+?)\s*<\s*x\s*<\s*(.+)$/);
    if (!m) throw new EngineError(`Write each piece like "x for 0 < x < pi" (could not read "${p}").`);
    return { g: readMulti(m[1], 'A piece'), from: num0(m[2]), to: num0(m[3]) };
  });
}

/**
 * For a whole number n: sin(π(kn + c)) → 0 and cos(π(kn + c)) → (−1)^{kn + c} for whole k and c
 * (so sin(π(n + 1)) = 0 and cos(π(n + 1)) = −(−1)ⁿ, which the product-to-sum integrals produce).
 */
function integerN(node) {
  return node.transform((m) => {
    if (!(m.isFunctionNode && ['sin', 'cos'].includes(m.fn.name))) return m;
    const arg = m.args[0];
    const at = (n) => evalAt(arg, { n }) / Math.PI;
    const a1 = at(1.3), a2 = at(2.7), a3 = at(4.1);
    if (![a1, a2, a3].every(Number.isFinite)) return m;
    const k = (a2 - a1) / 1.4, c = a1 - 1.3 * k;
    const whole = (v) => Math.abs(v - Math.round(v)) < 1e-9;
    if (!(whole(k) && whole(c) && Math.abs(a3 - (k * 4.1 + c)) < 1e-9)) return m;
    if (m.fn.name === 'sin') return num(0);
    const sign = Math.round(c) % 2 === 0 ? 1 : -1;
    const alt = Math.round(k) % 2 === 0 ? num(1) : pow(paren(num(-1)), N);
    return sign > 0 ? alt : mul(num(-1), alt);
  });
}

/**
 * One fraction for a coefficient c(n) = A(n) + (−1)ⁿ B(n): (−1)^{n+c} written as ±(−1)ⁿ, A and B made exact
 * rational functions of n (common factors cancelled), over one denominator, with a factor π^k pulled out.
 * 2(−1)^{n+1}/(n² − 1) instead of a page of sin(π(n + 1)) terms. Returns null when c(n) is not of that kind.
 */
function oneFraction(node) {
  const Q = sym('q');
  // (−1)^(n + c) → (−1)^c · q
  let ok = true;
  const withQ = node.transform((m) => {
    if (!(m.isOperatorNode && m.fn === 'pow')) return m;
    const b = evalAt(m.args[0], {});
    if (b !== -1) return m;
    const e0 = evalAt(m.args[1], { n: 0 }), e1 = evalAt(m.args[1], { n: 1 });
    if (!(Math.abs(e1 - e0 - 1) < 1e-12 && Math.abs(e0 - Math.round(e0)) < 1e-12)) { ok = false; return m; }
    return Math.round(e0) % 2 === 0 ? Q : mul(num(-1), Q);
  });
  if (!ok) return null;
  const sub = (q) => withQ.transform((m) => (m.isSymbolNode && m.name === 'q' ? num(q) : m));
  const A = rationalParts(sub(0), 'n'), A1 = rationalParts(sub(1), 'n');
  if (!A || !A1) return null;
  // B = (A + B) − A, as fractions
  const reduce = ({ P, Q: D }) => { const g = polyGcd(P, D); return g.length > 1 ? { P: polyDiv(P, g), Q: polyDiv(D, g) } : { P: [...P], Q: [...D] }; };
  const a = reduce({ P: A.P.map(Number), Q: A.Q.map(Number) }), s = reduce({ P: A1.P.map(Number), Q: A1.Q.map(Number) });
  const b = reduce({ P: polyAdd(polyMul(s.P, a.Q), polyScale(polyMul(a.P, s.Q), -1)), Q: polyMul(s.Q, a.Q) });
  // common denominator
  const g = polyGcd(a.Q, b.Q);
  const D = polyMul(a.Q, polyDiv(b.Q, g));
  const pa = polyMul(a.P, polyDiv(D, a.Q)), pb = polyMul(b.P, polyDiv(D, b.Q));
  // monic denominator, then pull out π^k so the rest has rational coefficients
  const lead = D[D.length - 1];
  const Dn = D.map((v) => v / lead), An = pa.map((v) => v / lead), Bn = pb.map((v) => v / lead);
  const all = [...An, ...Bn].filter((v) => Math.abs(v) > 1e-12);
  if (!all.length) return num(0);
  const k = [0, -1, 1, -2, 2].find((p) => [...all, ...Dn].every((v, i) => toFraction(i < all.length ? v / Math.PI ** p : v, 1000, 1e-8)));
  if (k === undefined) return null;
  const ex = (v) => { const f = toFraction(v, 1000, 1e-8); return f ? f.n / f.d : v; };
  const Ar = An.map((v) => ex(v / Math.PI ** k)), Br = Bn.map((v) => ex(v / Math.PI ** k)), Dr = Dn.map(ex);
  const nonzero = (c) => c.some((v) => Math.abs(v) > 1e-12);
  const alt = pow(paren(num(-1)), N);
  let top = null;
  if (nonzero(Ar)) top = polyNode(Ar, 'n');
  if (nonzero(Br)) { const t = mul(alt, paren(polyNode(Br, 'n'))); top = top ? add(top, t) : t; }
  if (!top) return num(0);
  let out = Dr.length > 1 || Math.abs(Dr[0] - 1) > 1e-12 ? div(paren(top), paren(polyNode(Dr, 'n'))) : top;
  if (k > 0) out = mul(k === 1 ? sym('pi') : pow(sym('pi'), num(k)), out);
  if (k < 0) out = div(out, k === -1 ? sym('pi') : pow(sym('pi'), num(-k)));
  // must still equal the original at whole n (away from the special values)
  const same = [4, 5, 6, 7].every((n) => { const p = evalAt(out, { n }), q0 = evalAt(node, { n }); return !Number.isFinite(q0) || Math.abs(p - q0) < 1e-9 * Math.max(1, Math.abs(q0)); });
  if (!same) return null;
  // LaTeX the textbook way: 2(-1)^{n+1} on top, π beside the denominator
  const isConst = (c) => c.slice(1).every((v) => Math.abs(v) < 1e-12);
  let altTex = '';
  if (nonzero(Br)) {
    if (isConst(Br)) {
      const c = Br[0], m = Math.abs(c);
      altTex = `${m === 1 ? '' : exactTex(m)}(-1)^{${c < 0 ? 'n+1' : 'n'}}`;
    } else altTex = `(-1)^{n}\\left(${polyTex(Br, 'n')}\\right)`;
  }
  const aTex = nonzero(Ar) ? polyTex(Ar, 'n') : '';
  const topTex = aTex && altTex ? `${aTex} + ${altTex}` : aTex || altTex;
  const piTex = k === 0 ? '' : Math.abs(k) === 1 ? '\\pi' : `\\pi^{${Math.abs(k)}}`;
  const denTex = Dr.length > 1 ? polyTex(Dr, 'n') : '';
  // nπ for a single term, π(n² − 1) for a sum
  const single = denTex && !/[+-]/.test(denTex);
  const lowTex = k < 0 ? (denTex ? (single ? `${denTex}${piTex}` : `${piTex}\\left(${denTex}\\right)`) : piTex) : denTex;
  // −2/n → −\frac{2}{n} when the top is one negative term
  const lone = /^-[^+-]+$/.test(topTex);
  const frac = lowTex ? `\\frac{${lone ? topTex.slice(1) : topTex}}{${lowTex}}` : topTex;
  out.netzTex = `${lone && lowTex ? '-' : ''}${k > 0 ? piTex : ''}${frac}`;
  return out;
}

/** Numbers in a node made exact where they are simple: 2.0000000000014 → 2, 0.63662 → 2/π, 1.5708 → π/2. */
function exactConstants(node) {
  return node.transform((m) => {
    if (!(m.isConstantNode && typeof m.value === 'number')) return m;
    const v = m.value;
    if (Math.abs(v) < 1e-12) return num(0);
    const f = toFraction(v, 1000, 1e-9);
    if (f) return numNode(f.n / f.d);
    const over = toFraction(v * Math.PI, 1000, 1e-9);
    if (over) return div(numNode(over.n / over.d), sym('pi'));
    const times = toFraction(v / Math.PI, 1000, 1e-9);
    if (times) return mul(numNode(times.n / times.d), sym('pi'));
    const over2 = toFraction(v * Math.PI * Math.PI, 1000, 1e-9);
    if (over2) return div(numNode(over2.n / over2.d), pow(sym('pi'), num(2)));
    return m;
  });
}

/** (1/L)∫ f·w over the pieces, as a node in n (or a number when w has no n). */
function coefficient(pieces, weight, scale, vars) {
  let total = null;
  const lines = [];
  const steps = [];
  for (const p of pieces) {
    const integrand = weight ? mul(p.g, weight) : p.g;
    let parts;
    try { parts = [definite(integrand, 'x', numNode(p.from), numNode(p.to), vars, 0, { light: true, noNeat: true })]; } catch (e) {
      // sin x + 3 sin 2x: integrate each term of f against the weight
      const ts = [];
      const go = (t, s) => { const x = t.isParenthesisNode ? t.content : t; if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0], s); go(x.args[1], x.fn === 'subtract' ? -s : s); return; } ts.push(s < 0 ? mul(num(-1), x) : x); };
      go(p.g, 1);
      // x(π − x)·sin nx: multiply out first
      if (ts.length < 2) { try { parts = [definite(distribute(weight ? mul(p.g, weight) : p.g), 'x', numNode(p.from), numNode(p.to), vars, 0, { light: true, noNeat: true })]; } catch { /* try terms */ } }
      if (!parts) { let ex; try { ex = distribute(p.g); } catch { throw e; } ts.length = 0; go(ex, 1); }
      if (!parts && ts.length < 2) throw e;
      if (!parts) parts = ts.map((t) => definite(weight ? mul(t, weight) : t, 'x', numNode(p.from), numNode(p.to), vars, 0, { light: true, noNeat: true }));
    }
    for (const d of parts) {
      lines.push(...d.lines);
      d.steps.forEach((s) => steps.push(s));
      total = total ? add(total, d.value) : d.value;
    }
  }
  const v = tidyMulti(integerN(mul(numNode(scale), paren(total))), ['n']);
  const exact = tidyMulti(exactConstants(integerN(v)), ['n']);
  // long sums of fractions: one fraction in n and (−1)ⁿ (kept only when it is shorter)
  let best = exact;
  try { const f = oneFraction(integerN(v)); if (f && (f.netzTex ?? mtex(f)).length <= mtex(exact).length) best = f; } catch { /* keep */ }
  return { value: best, lines, steps };
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
  const c = num0(from, 'The start of the interval'), d = num0(to, 'The end of the interval');
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
    out.an = an.value.netzTex ?? mtex(an.value);
    steps.push({ title: 'aₙ', formula: `a_n = ${kTex}\\int f(x)\\cos ${argTex}\\,dx`, depth: 0, lines: [...an.lines, '\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:', `a_n = ${out.an}`] });
    an.steps.forEach((s) => steps.push(s));
    out.anNode = an.value;
    out.a0v = a0v;
    check.push(['a', an.value]);
  }
  if (wantB) {
    const bn = coefficient(pieces, fn('sin', arg), k, vars);
    out.bn = bn.value.netzTex ?? mtex(bn.value);
    steps.push({ title: 'bₙ', formula: `b_n = ${kTex}\\int f(x)\\sin ${argTex}\\,dx`, depth: 0, lines: [...bn.lines, '\\text{with } \\sin n\\pi = 0, \\ \\cos n\\pi = (-1)^n:', `b_n = ${out.bn}`] });
    bn.steps.forEach((s) => steps.push(s));
    out.bnNode = bn.value;
    check.push(['b', bn.value]);
  }
  // Values of n where the general formula breaks, and a numeric check of the rest
  const special = [];
  let verified = true;
  for (const [which, node] of check) {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      const w = which === 'a' ? (x) => Math.cos((n * Math.PI * x) / L) : (x) => Math.sin((n * Math.PI * x) / L);
      const numv = k * quad(pieces, w);
      const formula = evalAt(node, { n });
      const off = Number.isFinite(formula) && Math.abs(formula - numv) > 1e-6 * Math.max(1, Math.abs(numv));
      // n ≤ 3 where the general formula is 0/0 (or lost a term when sin nπ = 0 was used): worked out on its own;
      // the formula must still hold from n = 4 on
      if (n <= 3 && (!Number.isFinite(formula) || off)) special.push({ which, n, value: exactTex(numv) });
      else if (off || (n > 3 && !Number.isFinite(formula))) verified = false;
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

