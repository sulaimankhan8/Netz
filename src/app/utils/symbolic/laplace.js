/**
 * Laplace transforms, step by step (catalog Unit 13; plan section 5.1, E4).
 * Forward L{f(t)} = F(s):  linearity, the table (tⁿ, eᵃᵗ, sin, cos, sinh, cosh), first shift eᵃᵗf(t) → F(s − a),
 *   multiplication by tⁿ → (−1)ⁿ dⁿF/dsⁿ, division by t → ∫ₛ^∞ F(u) du, second shift f(t)u(t − a) → e^{−as}L{f(t + a)},
 *   δ(t − a) → e^{−as}, products and squares of sin/cos rewritten first, periodic functions.
 * Inverse L⁻¹{F(s)}: split by delays e^{−as}, partial fractions over real and complex roots (repeated too), a short
 *   table for log and tan⁻¹ forms, and convolution. ODEs: transform, solve for Y(s), invert.
 * Forward results are checked against ∫₀^∞ e^{−st} f(t) dt numerically; inverse results by transforming them back.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, sub, mul, div, pow, neg, paren, tidy, polish, simplifyExact, variablesOf, unwrap } from './tree';
import { rationalParts } from './poly';
import { tidyMulti, mtex, exactTex, snap, readMulti } from './multi';
import { substitute, gaussLegendre, definite } from './iterated';
import { polyRootsComplex, numNode, antiderivative } from './ode';
import { limit } from './limit';

// Unit step and delta for numeric checks
try { math.import({ heaviside: (x) => (x >= 0 ? 1 : 0), dirac: () => 0 }, { override: false }); } catch { /* already there */ }

const S = sym('s'), Tt = sym('t');
const T = (n) => mtex(polish(n));
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const freeOf = (node, v) => !variablesOf(node).has(v);
// a shift as an exact node: 3.14159… → π, 1.5707… → π/2 (whole numbers and fractions stay numbers)
const piNode = (v) => {
  if (toFraction(v, 1000, 1e-9)) return numNode(v);
  const f = toFraction(v / Math.PI, 24, 1e-9);
  if (!f) return numNode(v);
  const k = f.n / f.d;
  return k === 1 ? sym('pi') : f.n === 1 ? div(sym('pi'), num(f.d)) : mul(numNode(k), sym('pi'));
};
// cos and sin of a shift: 6.1e-17 → 0, 0.99999999 → 1
const snapTrig = (v) => { const r = Math.round(v * 1e9) / 1e9; return Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : r; };
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
/** a·t + b → { a, b } (numbers), or null. */
function linearIn(node, v) {
  try {
    const d = math.derivative(node, v);
    if (!freeOf(d, v)) return null;
    const a = d.evaluate({}), b = substitute(node, v, num(0)).evaluate({});
    return Number.isFinite(a) && Number.isFinite(b) ? { a: snap(a), b: snap(b) } : null;
  } catch { return null; }
}
const neat = (n) => tidyMulti(n, ['s']);

/** Reads f(t) or F(s): u(t − a), H(t − a) and heaviside(…) are the unit step; delta(…) is Dirac's δ. */
export function readLaplace(text, label, v = 't') {
  const s = String(text ?? '').replace(/\b(?:u|H|heaviside)\s*\(/g, 'heaviside(').replace(/\b(?:delta|δ)\s*\(/g, 'dirac(').replace(/δ\s*\(/g, 'dirac(');
  const node = readMulti(s, label);
  const bad = [...variablesOf(node)].filter((x) => x !== v);
  if (bad.length) throw new EngineError(`${label} may use only ${v} (it uses ${bad.join(', ')}).`);
  return node;
}

// ---------- forward ----------
/** Additive terms with their signs. */
function termsOf(node) {
  const out = [];
  const collect = (t, sg) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0], sg); collect(x.args[1], x.fn === 'subtract' ? -sg : sg); } else if (x.isOperatorNode && x.fn === 'unaryMinus') collect(x.args[0], -sg); else out.push({ t: x, sg }); };
  collect(node, 1);
  return out;
}
/** Factors of a product (divisions by constants or by t kept as a power). */
function factorsOf(node) {
  const fs = [];
  const fl = (z, inv) => {
    const x = unwrap(z);
    if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach((y) => fl(y, inv)); return; }
    if (x.isOperatorNode && x.fn === 'divide') { fl(x.args[0], inv); fl(x.args[1], !inv); return; }
    fs.push(inv ? pow(x, num(-1)) : x);
  };
  fl(node, false);
  return fs;
}
const product = (fs) => (fs.length ? fs.reduce((a, b) => mul(a, b)) : num(1));

/** sin², cos², sin·cos, sin·sin, cos·cos rewritten as sums (so the table can take them). */
function trigToSums(node) {
  return node.transform((n) => {
    const x = unwrap(n);
    if (x.isOperatorNode && x.fn === 'pow' && unwrap(x.args[0]).isFunctionNode && ['sin', 'cos'].includes(unwrap(x.args[0]).fn.name) && x.args[1].isConstantNode && x.args[1].value === 2) {
      const f = unwrap(x.args[0]), u2 = mul(num(2), f.args[0]);
      return paren(div(f.fn.name === 'sin' ? sub(num(1), fn('cos', u2)) : add(num(1), fn('cos', u2)), num(2)));
    }
    if (x.isOperatorNode && x.fn === 'multiply' && x.args.length === 2) {
      const [p, q] = x.args.map(unwrap);
      // both angles must contain t: sin t · cos π is a number times sin t, not a product to turn into a sum
      if (p.isFunctionNode && q.isFunctionNode && ['sin', 'cos'].includes(p.fn.name) && ['sin', 'cos'].includes(q.fn.name) && !freeOf(p.args[0], 't') && !freeOf(q.args[0], 't')) {
        const A = p.args[0], B = q.args[0];
        const sm = add(A, B), df = sub(A, B);
        const k = p.fn.name + q.fn.name;
        if (k === 'sincos') return paren(div(add(fn('sin', sm), fn('sin', df)), num(2)));
        if (k === 'cossin') return paren(div(sub(fn('sin', sm), fn('sin', df)), num(2)));
        if (k === 'sinsin') return paren(div(sub(fn('cos', df), fn('cos', sm)), num(2)));
        if (k === 'coscos') return paren(div(add(fn('cos', df), fn('cos', sm)), num(2)));
      }
    }
    return n;
  });
}

/** L of one term without a constant factor. Returns { F, rule, lines, steps }. */
function lapTerm(g, steps, depth) {
  const fs = factorsOf(g).filter((f) => !freeOf(f, 't') || !(f.isConstantNode && f.value === 1));
  const isStep = (f) => f.isFunctionNode && f.fn.name === 'heaviside';
  const isDelta = (f) => f.isFunctionNode && f.fn.name === 'dirac';
  const expLin = (f) => { const e = f.isFunctionNode && f.fn.name === 'exp' ? f.args[0] : f.isOperatorNode && f.fn === 'pow' && unwrap(f.args[0]).isSymbolNode && unwrap(f.args[0]).name === 'e' ? f.args[1] : null; return e ? linearIn(unwrap(e), 't') : null; };
  const tPow = (f) => { if (f.isSymbolNode && f.name === 't') return 1; if (f.isOperatorNode && f.fn === 'pow' && unwrap(f.args[0]).isSymbolNode && unwrap(f.args[0]).name === 't' && freeOf(f.args[1], 't')) { const k = evalAt(f.args[1], {}); return Number.isFinite(k) ? k : null; } return null; };
  // the inner function may be a sum or a constant (t + 1, 1 …), so it goes through lapAll
  const rec = (h, title, formula, wrap) => { const inner = { F: lapAll(h, steps, depth + 1) }; const F = neat(wrap(inner.F)); steps.push({ title, formula, depth, lines: [`\\mathcal{L}\\{${T(g)}\\} = ${T(F)}`] }); return { F }; };

  // δ(t − a)
  if (fs.length === 1 && isDelta(fs[0])) {
    const l = linearIn(unwrap(fs[0].args[0]), 't');
    if (!l || Math.abs(l.a - 1) > 1e-12) throw new EngineError('Write the delta function as δ(t − a).');
    const a = -l.b;
    const F = a === 0 ? num(1) : fn('exp', mul(numNode(-a), S));
    steps.push({ title: 'Dirac delta', formula: '\\mathcal{L}\\{\\delta(t - a)\\} = e^{-as}', depth, lines: [`\\mathcal{L}\\{${T(g)}\\} = ${T(F)}`] });
    return { F };
  }
  // Second shift: h(t)·u(t − a)
  const step = fs.find(isStep);
  if (step) {
    const l = linearIn(unwrap(step.args[0]), 't');
    if (!l || Math.abs(l.a - 1) > 1e-12) throw new EngineError('Write the unit step as u(t − a).');
    const a = -l.b;
    const h = product(fs.filter((f) => f !== step));
    if (a <= 0) return { F: lapAll(h, steps, depth) };
    const shifted = tidyMulti(substitute(h, 't', add(Tt, piNode(a))), ['t']);
    return rec(shifted, 'Second shifting theorem', '\\mathcal{L}\\{f(t)u(t - a)\\} = e^{-as}\\mathcal{L}\\{f(t + a)\\}', (F) => mul(fn('exp', neg(mul(piNode(a), S))), paren(F)));
  }
  // First shift: e^{at} h(t)
  const ex = fs.find((f) => expLin(f) && !freeOf(f, 't'));
  if (ex && fs.length > 1) {
    const { a, b } = expLin(ex);
    const h = product(fs.filter((f) => f !== ex));
    const c = Math.abs(b) < 1e-12 ? null : fn('exp', numNode(b));
    return rec(h, 'First shifting theorem', '\\mathcal{L}\\{e^{at}f(t)\\} = F(s - a)', (F) => { const sh = substitute(F, 's', sub(S, numNode(a))); return c ? mul(c, sh) : sh; });
  }
  // Division by t
  const tdiv = fs.find((f) => tPow(f) === -1);
  if (tdiv) {
    const h = product(fs.filter((f) => f !== tdiv));
    const inner = { F: lapAll(h, steps, depth + 1) };
    const U = sym('u');
    const Fu = substitute(inner.F, 's', U);
    const anti = antiderivative(Fu, 'u', ['u']);
    const val = limit(anti.F, 'u', Infinity).value;
    if (!Number.isFinite(val)) throw new EngineError('∫ₛ^∞ F(u) du does not converge here, so f(t)/t has no transform by this rule.');
    // π/2 (from tan⁻¹) stays exact
    // the limit at ∞ is often numeric (1.5707962 for tan⁻¹): a simple multiple of π within 1e-6 is taken as exact
    const kPi = toFraction(val / Math.PI, 100, 1e-6);
    const whole = toFraction(val, 1000, 1e-6);
    const infNode = Math.abs(val) < 1e-9 ? num(0) : kPi && !toFraction(val, 1000, 1e-9) ? mul(numNode(kPi.n / kPi.d), sym('pi')) : whole ? numNode(whole.n / whole.d) : numNode(val);
    const F = neat(sub(infNode, substitute(anti.F, 'u', S)));
    steps.push({ title: 'Division by t', formula: '\\mathcal{L}\\left\\{\\frac{f(t)}{t}\\right\\} = \\int_s^{\\infty} F(u)\\,du', depth, lines: [`\\int_s^{\\infty} ${T(Fu)}\\,du = \\Big[${T(anti.F)}\\Big]_s^{\\infty} = ${T(F)}`] });
    return { F };
  }
  // Multiplication by tⁿ (with something else)
  const tp = fs.find((f) => { const k = tPow(f); return k !== null && Number.isInteger(k) && k > 0; });
  if (tp && fs.length > 1) {
    const n = tPow(tp);
    const h = product(fs.filter((f) => f !== tp));
    return rec(h, `Multiplication by t${n > 1 ? `^${n}` : ''}`, `\\mathcal{L}\\{t^nf(t)\\} = (-1)^n\\frac{d^n}{ds^n}F(s)`, (F) => { let d = F; for (let i = 0; i < n; i++) d = math.derivative(d, 's'); return n % 2 ? neg(paren(d)) : d; });
  }
  if (fs.length !== 1) throw new EngineError(`NETZ can't find the Laplace transform of ${T(g)} yet.`);
  const f = fs[0];
  // Table
  const k = tPow(f);
  if (k !== null) {
    if (k <= -1) throw new EngineError(`tⁿ needs n > −1 for the Laplace transform to exist (here n = ${k}).`);
    const F = Number.isInteger(k) ? div(numNode(fact(k)), pow(S, num(k + 1))) : div(fn('gamma', numNode(k + 1)), pow(S, numNode(k + 1)));
    steps.push({ title: 'Table: tⁿ', formula: '\\mathcal{L}\\{t^n\\} = \\frac{n!}{s^{n+1}}', depth, lines: [`\\mathcal{L}\\{${T(f)}\\} = ${T(F)}`] });
    return { F: Number.isInteger(k) ? neat(F) : F };
  }
  const el = expLin(f);
  if (el) {
    const F = neat(mul(Math.abs(el.b) < 1e-12 ? num(1) : fn('exp', numNode(el.b)), div(num(1), sub(S, numNode(el.a)))));
    steps.push({ title: 'Table: eᵃᵗ', formula: '\\mathcal{L}\\{e^{at}\\} = \\frac{1}{s - a}', depth, lines: [`\\mathcal{L}\\{${T(f)}\\} = ${T(F)}`] });
    return { F };
  }
  if (f.isFunctionNode && ['sin', 'cos', 'sinh', 'cosh'].includes(f.fn.name)) {
    const l = linearIn(unwrap(f.args[0]), 't');
    if (!l) throw new EngineError(`The argument of ${f.fn.name} should be a multiple of t.`);
    if (Math.abs(l.b) > 1e-12) {
      // sin(bt + c) = sin bt cos c + cos bt sin c
      // cos c and sin c as numbers (sin(t + π) = −sin t), so no cos(3.14159) is left in the answer
      const bt = mul(numNode(l.a), Tt);
      const cc = snapTrig(Math.cos(l.b)), sc = snapTrig(Math.sin(l.b));
      const part = (k, node) => (k === 0 ? null : k === 1 ? node : mul(numNode(k), node));
      const pieces = f.fn.name === 'sin' ? [part(cc, fn('sin', bt)), part(sc, fn('cos', bt))] : f.fn.name === 'cos' ? [part(cc, fn('cos', bt)), part(-sc, fn('sin', bt))] : null;
      const expanded = pieces && pieces.filter(Boolean).reduce((a, b) => add(a, b));
      if (!expanded) throw new EngineError('Write sinh and cosh with a pure multiple of t.');
      return { F: lapAll(expanded, steps, depth) };
    }
    const b = numNode(l.a), b2 = numNode(l.a * l.a);
    const F = neat({ sin: div(b, add(pow(S, num(2)), b2)), cos: div(S, add(pow(S, num(2)), b2)), sinh: div(b, sub(pow(S, num(2)), b2)), cosh: div(S, sub(pow(S, num(2)), b2)) }[f.fn.name]);
    const formula = { sin: '\\frac{b}{s^2 + b^2}', cos: '\\frac{s}{s^2 + b^2}', sinh: '\\frac{b}{s^2 - b^2}', cosh: '\\frac{s}{s^2 - b^2}' }[f.fn.name];
    steps.push({ title: `Table: ${f.fn.name} bt`, formula: `\\mathcal{L}\\{\\${f.fn.name}\\,bt\\} = ${formula}`, depth, lines: [`\\mathcal{L}\\{${T(f)}\\} = ${T(F)}`] });
    return { F };
  }
  throw new EngineError(`NETZ can't find the Laplace transform of ${T(f)} yet.`);
}

/** (e^u)^k → e^(ku), 1/e^u → e^(−u) (the simplifier writes e^(−t) as (eᵗ)⁻¹, which the table can't read). */
function expForms(node) {
  const isE = (n) => unwrap(n).isSymbolNode && unwrap(n).name === 'e';
  const expArg = (n) => { const x = unwrap(n); return x.isFunctionNode && x.fn.name === 'exp' ? x.args[0] : x.isOperatorNode && x.fn === 'pow' && isE(x.args[0]) ? x.args[1] : null; };
  return node.transform((n) => {
    const x = unwrap(n);
    if (x.isOperatorNode && x.fn === 'pow') { const a = expArg(x.args[0]); if (a) return pow(sym('e'), mul(x.args[1], paren(a))); }
    if (x.isOperatorNode && x.fn === 'divide') { const a = expArg(x.args[1]); if (a) return mul(x.args[0], pow(sym('e'), neg(paren(a)))); }
    return n;
  });
}
/** c·(a ± b) and (a ± b)/c → c·a ± c·b, so a sum hidden in a product becomes separate terms ((1 − cos 2t)/2). */
function spreadSums(node) {
  let cur = node;
  for (let i = 0; i < 6; i++) {
    let changed = false;
    cur = cur.transform((n) => {
      const x = unwrap(n);
      const isSum = (z) => { const u = unwrap(z); return u.isOperatorNode && (u.fn === 'add' || u.fn === 'subtract'); };
      const parts = (z) => unwrap(z).args;
      const op = (z) => unwrap(z);
      if (x.isOperatorNode && x.fn === 'multiply' && x.args.length === 2) {
        const [p, q] = x.args;
        if (isSum(q)) { changed = true; const [a, b] = parts(q); return new math.OperatorNode(op(q).op, op(q).fn, [mul(p, a), mul(p, b)]); }
        if (isSum(p)) { changed = true; const [a, b] = parts(p); return new math.OperatorNode(op(p).op, op(p).fn, [mul(a, q), mul(b, q)]); }
      }
      if (x.isOperatorNode && x.fn === 'divide' && isSum(x.args[0]) && freeOf(x.args[1], 't')) {
        changed = true; const [a, b] = parts(x.args[0]); return new math.OperatorNode(op(x.args[0]).op, op(x.args[0]).fn, [div(a, x.args[1]), div(b, x.args[1])]);
      }
      return n;
    });
    if (!changed) break;
  }
  return cur;
}

function lapAll(node, steps, depth = 0) {
  const prepared = spreadSums(expForms(trigToSums(node)));
  let expanded = prepared;
  try { expanded = spreadSums(expForms(simplifyExact(prepared))); } catch { /* keep */ }
  const terms = termsOf(expanded).length >= termsOf(prepared).length ? termsOf(expanded) : termsOf(prepared);
  const parts = terms.map(({ t, sg }) => {
    const fs = factorsOf(t);
    const c = product(fs.filter((f) => freeOf(f, 't')));
    const g = product(fs.filter((f) => !freeOf(f, 't')));
    if (freeOf(t, 't')) {
      steps.push({ title: 'Table: a constant', formula: '\\mathcal{L}\\{1\\} = \\frac{1}{s}', depth, lines: [`\\mathcal{L}\\{${T(t)}\\} = \\frac{${T(t)}}{s}`] });
      return mul(numNode(sg), div(t, S));
    }
    const r = lapTerm(g, steps, depth);
    return mul(mul(numNode(sg), c), paren(r.F));
  });
  return neat(parts.reduce((a, b) => add(a, b)));
}

/** ∫₀^∞ g(t) dt numerically (t = u/(1 − u), Gauss–Legendre on many pieces), with breaks at the given points. */
export function integrateToInfinity(g, breaks = []) {
  const { xs, ws } = gaussLegendre(32);
  const piece = (A, B, h) => { const c = (A + B) / 2, w = (B - A) / 2; let s = 0; for (let i = 0; i < xs.length; i++) s += ws[i] * h(c + w * xs[i]); return s * w; };
  const map = (u) => u / (1 - u);
  const h = (u) => { const t = map(u); const y = g(t) / (1 - u) ** 2; return Number.isFinite(y) ? y : 0; };
  const cuts = [...new Set([0, ...breaks.filter((b) => b > 0).map((b) => b / (1 + b)), 1])].sort((a, b) => a - b);
  let total = 0;
  for (let i = 0; i < cuts.length - 1; i++) {
    const n = 24;
    for (let k = 0; k < n; k++) {
      const A = cuts[i] + ((cuts[i + 1] - cuts[i]) * k) / n, B = cuts[i] + ((cuts[i + 1] - cuts[i]) * (k + 1)) / n;
      total += piece(A, B, h);
    }
  }
  return total;
}
const stepPoints = (node) => { const pts = []; node.traverse((n) => { if (n.isFunctionNode && n.fn.name === 'heaviside') { const l = linearIn(unwrap(n.args[0]), 't'); if (l) pts.push(-l.b / l.a); } }); return pts; };

/** Forward transform: { F, steps, verified }. */
export function laplace(f) {
  const steps = [];
  const F = lapAll(f, steps, 0);
  let hasDelta = false;
  f.traverse((n) => { if (n.isFunctionNode && n.fn.name === 'dirac') hasDelta = true; });
  const brk = stepPoints(f);
  // check at s above the growth rate (e^(2t) sin 3t only has a transform for s > 2)
  let growth = 0;
  f.traverse((n) => {
    const ex = n.isFunctionNode && n.fn.name === 'exp' ? n.args[0] : n.isOperatorNode && n.fn === 'pow' && unwrap(n.args[0]).isSymbolNode && unwrap(n.args[0]).name === 'e' ? n.args[1] : n.isFunctionNode && ['sinh', 'cosh'].includes(n.fn.name) ? n.args[0] : null;
    const l = ex && linearIn(unwrap(ex), 't');
    if (l) growth = Math.max(growth, n.isFunctionNode && ['sinh', 'cosh'].includes(n.fn.name) ? Math.abs(l.a) : l.a);
  });
  const verified = hasDelta || [growth + 1.7, growth + 2.9].every((s) => {
    const num0 = integrateToInfinity((t) => Math.exp(-s * t) * evalAt(f, { t }), brk);
    const val = evalAt(F, { s });
    return !Number.isFinite(num0) || !Number.isFinite(val) || Math.abs(num0 - val) < 1e-5 * Math.max(1, Math.abs(val));
  });
  return { F, steps, verified };
}

// ---------- inverse ----------
/** Splits F(s) into [{ a, G }] with F = Σ e^{−as} G(s). */
export function byShift(F) {
  const groups = [];
  for (const { t, sg } of termsOf(F)) {
    const fs = factorsOf(t);
    let a = 0;
    const rest = [];
    for (const f of fs) {
      const e = f.isFunctionNode && f.fn.name === 'exp' ? f.args[0] : f.isOperatorNode && f.fn === 'pow' && unwrap(f.args[0]).isSymbolNode && unwrap(f.args[0]).name === 'e' ? f.args[1] : null;
      const l = e ? linearIn(unwrap(e), 's') : null;
      if (l && Math.abs(l.b) < 1e-12 && l.a <= 0) a += -l.a;
      else rest.push(f);
    }
    const G = mul(numNode(sg), product(rest));
    const g = groups.find((q) => Math.abs(q.a - a) < 1e-12);
    if (g) g.G = add(g.G, G); else groups.push({ a: snap(a), G });
  }
  return groups.map((g) => ({ a: g.a, G: tidyMulti(g.G, ['s']) }));
}

/** Partial fractions and the inverse of a rational G(s). Returns { g (node in t), lines }. */
function inverseRational(G) {
  const r = rationalParts(G, 's');
  if (!r) return null;
  const P = r.P.map(Number), Q = r.Q.map(Number);
  while (P.length > 1 && Math.abs(P.at(-1)) < 1e-14) P.pop();
  while (Q.length > 1 && Math.abs(Q.at(-1)) < 1e-14) Q.pop();
  if (P.length >= Q.length) throw new EngineError('The degree of the top is not less than the bottom: this F(s) has no ordinary inverse (it would need δ functions).');
  if (Q.length === 1) return { g: num(0), lines: [] };
  const roots = polyRootsComplex(Q);
  // Basis pieces (in s) and their inverses (in t)
  const basis = [];
  const t = Tt;
  const eat = (a) => (Math.abs(a) < 1e-12 ? null : fn('exp', mul(numNode(a), t)));
  const prod = (...f) => f.filter(Boolean).reduce((x, y) => (x ? mul(x, y) : y), null) || num(1);
  for (const rt of roots) {
    if (rt.im === 0) {
      for (let j = 1; j <= rt.m; j++) {
        const den = j === 1 ? sub(S, numNode(rt.re)) : pow(paren(sub(S, numNode(rt.re))), num(j));
        basis.push({ s: div(num(1), den), t: prod(j > 1 ? div(pow(t, num(j - 1)), num(fact(j - 1))) : null, eat(rt.re)), tex: `\\frac{1}{${T(den)}}` });
      }
    } else {
      const { re: al, im: be } = rt;
      const q = add(pow(paren(sub(S, numNode(al))), num(2)), numNode(be * be));
      const sa = sub(S, numNode(al));
      const bt = mul(numNode(be), t);
      basis.push({ s: div(sa, q), t: prod(eat(al), fn('cos', bt)), tex: `\\frac{${T(sa)}}{${T(q)}}` });
      basis.push({ s: div(num(1), q), t: prod(eat(al), div(fn('sin', bt), numNode(be))), tex: `\\frac{1}{${T(q)}}` });
      if (rt.m >= 2) {
        const q2 = pow(paren(q), num(2));
        // L⁻¹{s/(s²+b²)²} = t sin bt/(2b), L⁻¹{1/(s²+b²)²} = (sin bt − bt cos bt)/(2b³), shifted by α
        basis.push({ s: div(sa, q2), t: prod(eat(al), div(mul(t, fn('sin', bt)), numNode(2 * be))), tex: `\\frac{${T(sa)}}{${T(q2)}}` });
        basis.push({ s: div(num(1), q2), t: prod(eat(al), div(sub(fn('sin', bt), mul(bt, fn('cos', bt))), numNode(2 * be ** 3))), tex: `\\frac{1}{${T(q2)}}` });
      }
      if (rt.m > 2) throw new EngineError('Complex roots repeated more than twice are not supported.');
    }
  }
  // Coefficients by sampling real s
  const m = basis.length;
  const ss = Array.from({ length: 3 * m + 4 }, (_, i) => 7.3 + 1.37 * i);
  const Gc = G.compile();
  const A = ss.map((s) => basis.map((b) => evalAt(b.s, { s })));
  const bv = ss.map((s) => Gc.evaluate({ s }));
  const AtA = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => A.reduce((acc, row) => acc + row[i] * row[j], 0)));
  const Atb = Array.from({ length: m }, (_, i) => A.reduce((acc, row, k) => acc + row[i] * bv[k], 0));
  const c = solveSmall(AtA, Atb);
  if (!c) throw new EngineError('NETZ could not split F(s) into partial fractions.');
  // least squares leaves ~1e-9 noise: 0.500000003 → 1/2 (a looser snap, then the result is checked anyway)
  const coefs = c.map((v) => { const s1 = snap(v); if (s1 !== v) return s1; const f = toFraction(v, 1000, 1e-6); return f ? f.n / f.d : v; });
  let g = null;
  const pieces = [];
  basis.forEach((b, i) => {
    const k = coefs[i];
    if (Math.abs(k) < 1e-10) return;
    pieces.push({ k, tex: b.tex, t: b.t });
    const term = mul(numNode(k), b.t);
    g = g ? add(g, term) : term;
  });
  const sum = (arr, f) => arr.map((p, i) => `${i === 0 ? (p.k < 0 ? '-' : '') : p.k < 0 ? ' - ' : ' + '}${f(p)}`).join('');
  const kt = (k) => (Math.abs(Math.abs(k) - 1) < 1e-12 ? '' : `${exactTex(Math.abs(k))}\\,`);
  const lines = [
    `F(s) = ${sum(pieces, (p) => `${kt(p.k)}${p.tex}`)}`,
    `f(t) = ${sum(pieces, (p) => `${kt(p.k)}${T(p.t)}`)}`,
  ];
  return { g: g ? tidyMulti(g, ['t']) : num(0), lines, roots };
}
function solveSmall(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-14) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** Table entries for non-rational F(s): log and tan⁻¹ forms, 1/√s. */
function inverseSpecial(G) {
  const fs = factorsOf(G);
  const c = product(fs.filter((f) => freeOf(f, 's')));
  const rest = fs.filter((f) => !freeOf(f, 's'));
  if (rest.length !== 1) return null;
  const f = rest[0];
  const t = Tt;
  if (f.isFunctionNode && f.fn.name === 'log') {
    const r = rationalParts(f.args[0], 's');
    if (r && r.P.length === 2 && r.Q.length === 2) {
      const a = -r.P[0] / r.P[1], b = -r.Q[0] / r.Q[1];
      // ln((s − a)/(s − b)) ↔ (e^{bt} − e^{at})/t
      return { g: mul(c, div(sub(fn('exp', mul(numNode(snap(b)), t)), fn('exp', mul(numNode(snap(a)), t))), t)), lines: ['\\mathcal{L}^{-1}\\left\\{\\ln\\frac{s - a}{s - b}\\right\\} = \\frac{e^{bt} - e^{at}}{t}'] };
    }
  }
  if (f.isFunctionNode && f.fn.name === 'atan') {
    const r = rationalParts(f.args[0], 's');
    if (r && r.P.length === 1 && r.Q.length === 2 && Math.abs(r.Q[0]) < 1e-12) {
      const a = r.P[0] / r.Q[1];
      return { g: mul(c, div(fn('sin', mul(numNode(snap(a)), t)), t)), lines: ['\\mathcal{L}^{-1}\\left\\{\\tan^{-1}\\frac{a}{s}\\right\\} = \\frac{\\sin at}{t}'] };
    }
  }
  if (f.isOperatorNode && f.fn === 'pow' && unwrap(f.args[0]).isFunctionNode && unwrap(f.args[0]).fn.name === 'sqrt' && evalAt(f.args[1], {}) === -1 && unwrap(unwrap(f.args[0]).args[0]).isSymbolNode) {
    return { g: mul(c, div(num(1), fn('sqrt', mul(sym('pi'), t)))), lines: ['\\mathcal{L}^{-1}\\left\\{\\frac{1}{\\sqrt{s}}\\right\\} = \\frac{1}{\\sqrt{\\pi t}}'] };
  }
  return null;
}

/** Inverse transform: { f (node in t), steps, verified }. */
export function inverseLaplace(F) {
  const steps = [];
  const groups = byShift(F);
  let total = null;
  for (const { a, G } of groups) {
    const r = inverseRational(G) || inverseSpecial(G);
    if (!r) throw new EngineError(`NETZ can't invert ${T(G)} yet: it handles fractions of polynomials in s, e^{−as} delays, and the log and tan⁻¹ forms.`);
    steps.push({ title: r.roots ? 'Partial fractions' : 'Standard result', formula: r.roots ? '\\frac{P(s)}{Q(s)} = \\sum \\frac{A}{(s - a)^k} + \\frac{Bs + C}{(s - \\alpha)^2 + \\beta^2}' : null, depth: 0, lines: r.lines.length ? r.lines : [`\\mathcal{L}^{-1}\\{${T(G)}\\} = ${T(r.g)}`] });
    let g = r.g;
    if (a > 0) {
      g = tidyMulti(mul(substitute(g, 't', sub(Tt, numNode(a))), fn('heaviside', sub(Tt, numNode(a)))), ['t']);
      steps.push({ title: 'Second shifting theorem', formula: '\\mathcal{L}^{-1}\\{e^{-as}F(s)\\} = f(t - a)\\,u(t - a)', depth: 0, lines: [`\\mathcal{L}^{-1}\\{e^{-${exactTex(a)}s}\\,(${T(G)})\\} = ${T(g)}`] });
    }
    total = total ? add(total, g) : g;
  }
  const f = total ? tidyMulti(total, ['t']) : num(0);
  const brk = groups.map((g) => g.a);
  const verified = [2.3, 3.7].every((s) => {
    const back = integrateToInfinity((t) => Math.exp(-s * t) * evalAt(f, { t }), brk);
    const val = evalAt(F, { s });
    return !Number.isFinite(back) || !Number.isFinite(val) || Math.abs(back - val) < 1e-5 * Math.max(1, Math.abs(val));
  });
  return { f, steps, verified };
}

/** Convolution: L⁻¹{F₁F₂} = ∫₀ᵗ f₁(u) f₂(t − u) du. */
export function convolution(F1, F2) {
  const a = inverseLaplace(F1), b = inverseLaplace(F2);
  const U = sym('u');
  const integrand = tidyMulti(mul(substitute(a.f, 't', U), substitute(b.f, 't', sub(Tt, U))), ['u', 't']);
  const d = definite(integrand, 'u', num(0), Tt, ['u', 't']);
  const f = tidyMulti(d.value, ['t']);
  const steps = [
    { title: 'Invert each factor', depth: 0, lines: [`f_1(t) = \\mathcal{L}^{-1}\\{${T(F1)}\\} = ${T(a.f)}, \\qquad f_2(t) = \\mathcal{L}^{-1}\\{${T(F2)}\\} = ${T(b.f)}`] },
    { title: 'Convolution theorem', formula: '\\mathcal{L}^{-1}\\{F_1F_2\\} = \\int_0^t f_1(u)f_2(t - u)\\,du', depth: 0, lines: d.lines },
    ...d.steps,
  ];
  return { f, steps };
}

/** Periodic f with period T given by pieces [{ g, from, to }] on [0, T): F = ∫₀ᵀ e^{−st} f dt / (1 − e^{−sT}). */
export function laplacePeriodic(pieces, period) {
  const steps = [];
  let integral = null;
  for (const p of pieces) {
    const integrand = mul(fn('exp', neg(mul(S, Tt))), p.g);
    const d = definite(tidy(integrand), 't', numNode(p.from), numNode(p.to), ['t', 's']);
    steps.push({ title: `∫ e^(−st) f(t) dt from ${p.from} to ${p.to}`, depth: 0, lines: d.lines });
    integral = integral ? add(integral, d.value) : d.value;
  }
  const F = tidyMulti(div(paren(integral), paren(sub(num(1), fn('exp', mul(numNode(-period), S))))), ['s']);
  steps.unshift({ title: 'Periodic function', formula: '\\mathcal{L}\\{f(t)\\} = \\frac{1}{1 - e^{-sT}}\\int_0^T e^{-st}f(t)\\,dt', depth: 0, lines: [`T = ${exactTex(period)}`] });
  steps.push({ title: 'Divide by 1 − e^(−sT)', depth: 0, lines: [`F(s) = ${T(F)}`] });
  return { F, steps };
}

/** Reads "t for 0 < t < 1; 2 - t for 1 < t < 2" into [{ g, from, to }]. */
export function readPieces(text) {
  const parts = String(text ?? '').split(/[;\n]/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) throw new EngineError('Type the pieces, e.g. t for 0 < t < 1; 1 for t > 1.');
  // each piece adds unit steps and the work grows fast (8 pieces ≈ 3 s, 10 ≈ 14 s, 12 ≈ 3 min): at most 8
  if (parts.length > 8) throw new EngineError(`Use at most 8 pieces (there are ${parts.length}).`);
  const pieces = parts.map((p) => {
    let m = p.match(/^(.+?)\s+(?:for|if|,)\s*(.+?)\s*<\s*t\s*<\s*(.+)$/);
    if (m) return { g: readLaplace(m[1], 'A piece'), from: math.evaluate(m[2].replace(/π/g, 'pi')), to: /^(inf|∞|infinity)$/i.test(m[3].trim()) ? Infinity : math.evaluate(m[3].replace(/π/g, 'pi')) };
    m = p.match(/^(.+?)\s+(?:for|if|,)\s*t\s*>\s*(.+)$/);
    if (m) return { g: readLaplace(m[1], 'A piece'), from: math.evaluate(m[2].replace(/π/g, 'pi')), to: Infinity };
    throw new EngineError(`Write each piece like "t for 0 < t < 1" or "1 for t > 2" (could not read "${p}").`);
  });
  // pieces must not overlap (each t belongs to one piece)
  const sorted = [...pieces].sort((a, b) => a.from - b.from);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from < sorted[i - 1].to - 1e-12) throw new EngineError(`The pieces overlap near t = ${Number(sorted[i].from.toPrecision(6))}: each value of t should belong to one piece only.`);
  }
  return pieces;
}
/** Pieces → one expression with unit steps: Σ gᵢ(t)[u(t − aᵢ) − u(t − bᵢ)]. */
export function piecesToSteps(pieces) {
  // Written out term by term (g·u(t − a) − g·u(t − b)), so each term can be transformed on its own
  let f = null;
  const push = (node, plus) => { f = f ? (plus ? add(f, node) : sub(f, node)) : (plus ? node : neg(node)); };
  for (const { g, from, to } of pieces) {
    push(from <= 0 ? g : mul(g, fn('heaviside', sub(Tt, numNode(from)))), true);
    if (Number.isFinite(to)) push(mul(g, fn('heaviside', sub(Tt, numNode(to)))), false);
  }
  return f;
}

export { S, Tt, toFraction, neat, T as lapTex };
