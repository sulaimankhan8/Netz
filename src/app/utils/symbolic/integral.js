/**
 * Indefinite integrals, step by step (NETZ_METHODS_CATALOG.md 6E). Methods, in the order they are tried:
 *   linearity (constants out, sum term by term) → standard table (with a linear inside, e.g. sin(3x + 1))
 *   → expand polynomial products → partial fractions → u-substitution → integration by parts (ILATE).
 * Each step: { title, lines: [LaTeX], depth }. Returns a math.js node (no + C; the page adds it).
 * When no method fits it throws an EngineError, and the caller falls back to a numeric answer.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import {
  math, num, sym, fn, neg, add, sub, mul, div, pow, paren, unwrap, tidy, tex, polish, isConstantIn, simplifyExact, variablesOf,
} from './tree';
import { rationalParts, polynomialCoeffs } from './poly';

const CANT = 'NETZ can\'t integrate this step by step yet.';

// ---------- small helpers ----------
/** A number as an exact node: 2, or 3/2 as a fraction. */
const fracNode = (v) => {
  const f = toFraction(v, 1000, 1e-9);
  if (!f || f.d === 1) return num(f ? f.n : v);
  return f.n < 0 ? neg(div(num(-f.n), num(f.d))) : div(num(f.n), num(f.d));
};
/** √v as an exact node: √(3/4) → √3/2, √(1/4) → 1/2. */
const sqrtNode = (v) => {
  const f = toFraction(v, 10000, 1e-9);
  if (!f || f.n <= 0) return fn('sqrt', num(v));
  const m = f.n * f.d;
  let s = 1;
  for (let i = Math.floor(Math.sqrt(m)); i > 1; i--) if (m % (i * i) === 0) { s = i; break; }
  const rest = m / (s * s);
  if (rest === 1) return fracNode(s / f.d);
  return s === f.d ? fn('sqrt', num(rest)) : mul(fracNode(s / f.d), fn('sqrt', num(rest)));
};
/** c·node with the sign and a coefficient of 1 handled; terms [{ c, node }] joined with + and −. */
const scaled = (c, node) => (Math.abs(c - 1) < 1e-12 ? node : mul(fracNode(c), node));
const signedSum = (terms) => terms.reduce((acc, { c, node }) => {
  if (!acc) return c < 0 ? neg(scaled(-c, node)) : scaled(c, node);
  return c < 0 ? sub(acc, scaled(-c, node)) : add(acc, scaled(c, node));
}, null) || num(0);
/** body / a, written −(body/3) or 2·body (for a = ½) the way textbooks do. */
const overA = (body, a) => {
  if (Math.abs(a - 1) < 1e-12) return body;
  const minus = body.isOperatorNode && body.fn === 'unaryMinus';
  const inner = minus ? body.args[0] : body;
  const inv = 1 / a;
  if (Number.isInteger(Math.round(inv * 1e9) / 1e9)) return mul(num(minus ? -Math.round(inv) : Math.round(inv)), inner);
  return minus ? neg(div(inner, fracNode(a))) : div(inner, fracNode(a));
};
const isSym = (n, name) => n.isSymbolNode && n.name === name;
const absLog = (u) => fn('log', fn('abs', u));
const str = (n) => tidy(n).toString();
const sameExpr = (p, q) => {
  try { return str(simplifyExact(p)) === str(simplifyExact(q)); } catch { return str(p) === str(q); }
};
const subst = (node, name, value) => node.transform((n) => (n.isSymbolNode && n.name === name ? value : n));
const texN = (v) => {
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  return String(Number(v.toPrecision(6)));
};

/** Polynomial coefficients (ascending) in v, or null. */
export function polyCoeffs(node, v) {
  return polynomialCoeffs(node, v);
}
/** { a, b } when node = a·v + b with a ≠ 0, else null. */
function linear(node, v) {
  const c = polyCoeffs(node, v);
  if (!c || c.length !== 2 || Math.abs(c[1]) < 1e-12) return null;
  return { a: c[1], b: c[0] };
}
export const polyNode = (c, v) => {
  const terms = [];
  for (let k = c.length - 1; k >= 0; k--) {
    if (Math.abs(c[k]) < 1e-12) continue;
    terms.push({ c: c[k], node: k === 0 ? num(1) : k === 1 ? sym(v) : pow(sym(v), num(k)) });
  }
  // Constant terms: c·1 → c
  const out = signedSum(terms).transform((m) => (m.isOperatorNode && m.fn === 'multiply' && m.args[1].isConstantNode && m.args[1].value === 1 ? m.args[0] : m));
  return tidy(out);
};
const trimC = (c) => { const d = [...c]; while (d.length > 1 && Math.abs(d.at(-1)) < 1e-12) d.pop(); return d; };
const evalPoly = (c, x) => c.reduceRight((acc, k) => acc * x + k, 0);
const derivPoly = (c) => c.slice(1).map((k, i) => k * (i + 1));

/** Long division of ascending polynomials: { q, r }. */
function polyDivide(p, d) {
  p = trimC(p); d = trimC(d);
  const q = new Array(Math.max(1, p.length - d.length + 1)).fill(0);
  const r = [...p];
  for (let k = p.length - d.length; k >= 0; k--) {
    const coef = r[k + d.length - 1] / d.at(-1);
    q[k] = coef;
    for (let j = 0; j < d.length; j++) r[k + j] -= coef * d[j];
  }
  return { q: trimC(q), r: trimC(r.slice(0, Math.max(1, d.length - 1))) };
}

/** Rational roots of an ascending polynomial, with multiplicity: [{ r, m }], and what is left over. */
function rationalRoots(c) {
  let p = trimC(c);
  const found = [];
  // Scale to integers (coefficients are simple fractions in school problems)
  const den = p.reduce((acc, k) => { const f = toFraction(k, 1000, 1e-9); return f ? lcm(acc, f.d) : acc; }, 1);
  const ints = () => p.map((k) => Math.round(k * den));
  const divisors = (n) => { n = Math.abs(n); const out = []; for (let i = 1; i <= Math.min(n, 5000); i++) if (n % i === 0) out.push(i); return out.length ? out : [1]; };
  let guard = 0;
  while (p.length > 1 && guard++ < 20) {
    if (Math.abs(p[0]) < 1e-12) { push(found, 0); p = trimC(p.slice(1)); continue; }
    const P = ints();
    const cands = [];
    for (const a of divisors(P[0])) for (const b of divisors(P.at(-1))) cands.push(a / b, -a / b);
    const root = cands.find((x) => Math.abs(evalPoly(p, x)) < 1e-9 * Math.max(1, ...p.map(Math.abs)));
    if (root === undefined) break;
    push(found, root);
    p = polyDivide(p, [-root, 1]).q;
  }
  return { roots: found, rest: p };
  function push(arr, r) { const e = arr.find((x) => Math.abs(x.r - r) < 1e-9); if (e) e.m++; else arr.push({ r, m: 1 }); }
}
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
function lcm(a, b) { return (a * b) / gcd(a, b); }

/** Solve a small dense linear system (Gaussian elimination with partial pivoting). */
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
const snap = (v) => { const f = toFraction(v, 1000, 1e-7); return f ? f.n / f.d : v; };

// ---------- the integrator ----------
export function integrate(node, v = 'x') {
  const steps = [];
  let budget = 0;
  const intTex = (n, w = v) => `\\int ${tex(polish(n))}\\,d${w}`;

  function I(raw, w, depth) {
    if (++budget > 200) throw new EngineError('This integral is too big to show step by step.');
    const n = unwrap(tidy(raw));
    const record = (title, result, extraLines = [], formula = null) => {
      steps.push({ title, formula, depth, lines: [...extraLines, `${intTex(n, w)} = ${tex(polish(tidy(result)))}`] });
      return tidy(result);
    };

    // Constant
    if (isConstantIn(n, w)) return record('Constant rule', mul(n, sym(w)), [], `\\int k\\,d${w} = k${w}`);
    if (isSym(n, w)) return record('Power rule', div(pow(sym(w), num(2)), num(2)), [], `\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}`);

    if (n.isOperatorNode) {
      if (n.fn === 'unaryMinus') { const slot = reserve(); const r = neg(I(n.args[0], w, depth + 1)); return fill(slot, 'Take out the minus sign', n, w, r, depth); }
      if (n.fn === 'add' || n.fn === 'subtract') {
        const terms = [];
        const collect = (t, s) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0], s); collect(x.args[1], x.fn === 'subtract' ? -s : s); } else terms.push({ t: x, s }); };
        collect(n, 1);
        const slot = reserve();
        const parts = terms.map(({ t, s }) => ({ s, r: I(t, w, depth + 1) }));
        const r = parts.slice(1).reduce((acc, p) => (p.s > 0 ? add(acc, p.r) : sub(acc, p.r)), parts[0].s > 0 ? parts[0].r : neg(parts[0].r));
        return fill(slot, 'Integrate term by term', n, w, r, depth, `\\int (u \\pm v)\\,dx = \\int u\\,dx \\pm \\int v\\,dx`);
      }
      // Constant factors out: c·f, f/c
      if (n.fn === 'multiply' || n.fn === 'divide') {
        const factors = [];
        const collect = (t, inv) => {
          const x = unwrap(t);
          if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach((y) => collect(y, inv)); return; }
          if (x.isOperatorNode && x.fn === 'divide') { collect(x.args[0], inv); collect(x.args[1], !inv); return; }
          factors.push({ x, inv });
        };
        collect(n, false);
        const isOne = (x) => x.isConstantNode && x.value === 1;
        const consts = factors.filter((f) => isConstantIn(f.x, w) && !isOne(f.x));
        if (consts.length && consts.length < factors.length) {
          const build = (list) => list.reduce((acc, f) => (acc ? (f.inv ? div(acc, f.x) : mul(acc, f.x)) : (f.inv ? div(num(1), f.x) : f.x)), null);
          const c = build(consts);
          const rest = build(factors.filter((f) => !isConstantIn(f.x, w)));
          const slot = reserve();
          const r = mul(c, I(rest, w, depth + 1));
          return fill(slot, 'Take the constant outside', n, w, r, depth, `\\int k\\,f\\,dx = k\\int f\\,dx`);
        }
      }
    }

    // Standard table, with a linear inside
    const t = table(n, w);
    if (t) return record(t.title, t.result, t.lines || [], t.formula);
    const id = trigSquare(n, w);
    if (id) {
      const slot = reserve();
      const r = I(id.rewritten, w, depth + 1);
      return fill(slot, id.title, n, w, r, depth, id.formula, [`${tex(polish(n))} = ${tex(polish(id.rewritten))}`]);
    }
    const lg = logDerivative(n, w);
    if (lg) return record(lg.title, lg.result, lg.lines, lg.formula);
    const cyc = expTrig(n, w);
    if (cyc) return record(cyc.title, cyc.result, cyc.lines, cyc.formula);

    // Polynomial written as a product or power: expand first
    const pc = polyCoeffs(n, w);
    if (pc && !(n.isOperatorNode && (n.fn === 'add' || n.fn === 'subtract'))) {
      const expanded = polyNode(pc, w);
      const slot = reserve();
      const r = I(expanded, w, depth + 1);
      return fill(slot, 'Expand first', n, w, r, depth, null, [`${tex(polish(n))} = ${tex(polish(expanded))}`]);
    }

    // Rational function: partial fractions
    const pf = partialFractions(n, w, depth);
    if (pf) return pf;

    // u-substitution
    const us = uSubstitution(n, w, depth);
    if (us) return us;

    // Integration by parts
    const bp = byParts(n, w, depth);
    if (bp) return bp;

    throw new EngineError(CANT);
  }

  // Steps that wrap sub-steps are reserved first so they read outermost first
  function reserve() { steps.push(null); return steps.length - 1; }
  function fill(slot, title, n, w, result, depth, formula = null, before = []) {
    steps[slot] = { title, formula, depth, lines: [...before, `${intTex(n, w)} = ${tex(polish(tidy(result)))}`] };
    return tidy(result);
  }

  // ---- the table ----
  function table(n, w) {
    const W = sym(w);
    // Power of a linear inside: (ax + b)^k
    if (n.isOperatorNode && n.fn === 'pow') {
      const [base, ex] = n.args.map(unwrap);
      const lin = linear(base, w);
      if (lin && isConstantIn(ex, w)) {
        let k = null;
        try { const kv = ex.evaluate({}); if (typeof kv === 'number' && toFraction(kv, 1000, 1e-9)) k = kv; } catch { /* symbolic power */ }
        if (k !== null && Math.abs(k + 1) < 1e-12) return logRule(base, lin);
        let result;
        if (k === null) {
          const k1 = add(ex, num(1));
          result = div(pow(base, k1), lin.a === 1 ? k1 : mul(k1, fracNode(lin.a)));
        } else if (k + 1 < 0) {
          // x^-3 → -1/(2x^2): keep the power positive and the number exact
          result = neg(div(num(1), mul(fracNode(-(k + 1) * lin.a), pow(base, fracNode(-(k + 1))))));
        } else {
          result = mul(fracNode(1 / ((k + 1) * lin.a)), pow(base, fracNode(k + 1)));
        }
        return { title: isSym(base, w) ? 'Power rule' : 'Power rule (linear inside)', result, formula: `\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)` };
      }
      // a^(linear) and e^(linear)
      const linEx = linear(ex, w);
      if (linEx && isConstantIn(base, w)) {
        if (isSym(base, 'e')) return { title: 'Exponential rule', result: div(n, fracNode(linEx.a)), formula: `\\int e^{x}\\,dx = e^{x}` };
        return { title: 'Exponential rule (base a)', result: div(n, mul(fracNode(linEx.a), fn('log', base))), formula: `\\int a^{x}\\,dx = \\frac{a^{x}}{\\ln a}` };
      }
      // sec²(lin), csc²(lin)
      if (base.isFunctionNode && ex.isConstantNode && ex.value === 2) {
        const u = unwrap(base.args[0]); const l = linear(u, w);
        if (l && base.fn.name === 'sec') return { title: 'Standard integral: sec²', result: div(fn('tan', u), fracNode(l.a)), formula: `\\int \\sec^2 x\\,dx = \\tan x` };
        if (l && base.fn.name === 'csc') return { title: 'Standard integral: csc²', result: neg(div(fn('cot', u), fracNode(l.a))), formula: `\\int \\csc^2 x\\,dx = -\\cot x` };
      }
    }
    // c / (linear), and 1/(linear)^k written as a fraction
    if (n.isOperatorNode && n.fn === 'divide' && isConstantIn(n.args[0], w)) {
      const den = unwrap(n.args[1]);
      const lin = linear(den, w);
      if (lin) { const r = logRule(den, lin); return { ...r, result: mul(n.args[0], r.result) }; }
      if (den.isOperatorNode && den.fn === 'pow' && linear(unwrap(den.args[0]), w) && isConstantIn(den.args[1], w)) {
        const inner = table(pow(unwrap(den.args[0]), neg(unwrap(den.args[1]))), w);
        if (inner) return { ...inner, result: mul(n.args[0], inner.result) };
      }
      // c/(p + q x²) → arctan;  c/√(p − q x²) → arcsin
      const qc = polyCoeffs(den, w);
      if (qc && qc.length === 3 && Math.abs(qc[1]) < 1e-12 && qc[0] > 0 && qc[2] > 0) {
        const kx = (k) => { const f = toFraction(1 / k, 1000, 1e-9); if (f && f.d === 1) return f.n === 1 ? W : div(W, num(f.n)); return toFraction(k, 1000, 1e-9) ? mul(fracNode(k), W) : mul(sqrtNode(k * k), W); };
        const k = Math.sqrt(qc[2] / qc[0]);
        return { title: 'Standard integral: tan⁻¹', result: mul(div(n.args[0], sqrtNode(qc[0] * qc[2])), fn('atan', kx(k))), formula: `\\int \\frac{dx}{a^2 + x^2} = \\frac{1}{a}\\tan^{-1}\\frac{x}{a}` };
      }
      if (den.isFunctionNode && den.fn.name === 'sqrt') {
        const qs = polyCoeffs(unwrap(den.args[0]), w);
        if (qs && qs.length === 3 && Math.abs(qs[1]) < 1e-12 && qs[0] > 0 && qs[2] < 0) {
          const kx = (k) => { const f = toFraction(1 / k, 1000, 1e-9); if (f && f.d === 1) return f.n === 1 ? W : div(W, num(f.n)); return toFraction(k, 1000, 1e-9) ? mul(fracNode(k), W) : mul(sqrtNode(k * k), W); };
          const k = Math.sqrt(-qs[2] / qs[0]);
          return { title: 'Standard integral: sin⁻¹', result: mul(div(n.args[0], sqrtNode(-qs[2])), fn('asin', kx(k))), formula: `\\int \\frac{dx}{\\sqrt{a^2 - x^2}} = \\sin^{-1}\\frac{x}{a}` };
        }
      }
    }
    // sec·tan and csc·cot
    if (n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2) {
      const [p, q] = n.args.map(unwrap);
      const pair = (a, b, x, y) => a.isFunctionNode && b.isFunctionNode && a.fn.name === x && b.fn.name === y && str(a.args[0]) === str(b.args[0]);
      for (const [a, b] of [[p, q], [q, p]]) {
        const u = a.isFunctionNode ? unwrap(a.args[0]) : null; const l = u && linear(u, w);
        if (l && pair(a, b, 'sec', 'tan')) return { title: 'Standard integral: sec·tan', result: div(fn('sec', u), fracNode(l.a)), formula: `\\int \\sec x\\tan x\\,dx = \\sec x` };
        if (l && pair(a, b, 'csc', 'cot')) return { title: 'Standard integral: csc·cot', result: neg(div(fn('csc', u), fracNode(l.a))), formula: `\\int \\csc x\\cot x\\,dx = -\\csc x` };
      }
    }
    // f(linear)
    if (n.isFunctionNode && n.args.length === 1) {
      const u = unwrap(n.args[0]);
      const l = linear(u, w);
      if (!l) return null;
      const T = {
        sin: [neg(fn('cos', u)), '\\int \\sin x\\,dx = -\\cos x'],
        cos: [fn('sin', u), '\\int \\cos x\\,dx = \\sin x'],
        tan: [neg(absLog(fn('cos', u))), '\\int \\tan x\\,dx = -\\ln|\\cos x|'],
        cot: [absLog(fn('sin', u)), '\\int \\cot x\\,dx = \\ln|\\sin x|'],
        sec: [absLog(add(fn('sec', u), fn('tan', u))), '\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x|'],
        csc: [neg(absLog(add(fn('csc', u), fn('cot', u)))), '\\int \\csc x\\,dx = -\\ln|\\csc x + \\cot x|'],
        exp: [fn('exp', u), '\\int e^x\\,dx = e^x'],
        sinh: [fn('cosh', u), '\\int \\sinh x\\,dx = \\cosh x'],
        cosh: [fn('sinh', u), '\\int \\cosh x\\,dx = \\sinh x'],
        sqrt: [mul(div(num(2), num(3)), pow(u, div(num(3), num(2)))), '\\int \\sqrt{x}\\,dx = \\frac{2}{3}x^{3/2}'],
        log: [sub(mul(u, fn('log', u)), u), '\\int \\ln x\\,dx = x\\ln x - x'],
      }[n.fn.name];
      if (!T) return null;
      return { title: `Standard integral: ${n.fn.name === 'log' ? 'ln' : n.fn.name}${isSym(u, w) ? '' : ' (linear inside)'}`, result: overA(T[0], l.a), formula: T[1] };
    }
    return null;
  }
  /** ∫ table-integrable f times constants or a minus sign (for the tabular method). */
  function simpleInt(raw, w) {
    const n = unwrap(tidy(raw));
    if (n.isOperatorNode && n.fn === 'unaryMinus') { const r = simpleInt(n.args[0], w); return r && neg(r); }
    if (n.isOperatorNode && n.fn === 'divide' && isConstantIn(n.args[1], w)) { const r = simpleInt(n.args[0], w); return r && div(r, n.args[1]); }
    if (n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2) {
      const [p, q] = n.args;
      if (isConstantIn(p, w)) { const r = simpleInt(q, w); return r && mul(p, r); }
      if (isConstantIn(q, w)) { const r = simpleInt(p, w); return r && mul(q, r); }
    }
    const t = table(n, w);
    return t ? t.result : null;
  }

  /** sin²u, cos²u and tan²u (u linear) rewritten with an identity so the table can finish them. */
  function trigSquare(n, w) {
    if (!(n.isOperatorNode && n.fn === 'pow')) return null;
    const [base, ex] = n.args.map(unwrap);
    if (!(ex.isConstantNode && ex.value === 2 && base.isFunctionNode)) return null;
    const u = unwrap(base.args[0]);
    if (!linear(u, w)) return null;
    const twoU = tidy(mul(num(2), u));
    const half = (s) => div(paren(s), num(2));
    if (base.fn.name === 'sin') return { title: 'Use the identity sin²x = (1 − cos 2x)/2', formula: `\\sin^2 x = \\frac{1 - \\cos 2x}{2}`, rewritten: half(sub(num(1), fn('cos', twoU))) };
    if (base.fn.name === 'cos') return { title: 'Use the identity cos²x = (1 + cos 2x)/2', formula: `\\cos^2 x = \\frac{1 + \\cos 2x}{2}`, rewritten: half(add(num(1), fn('cos', twoU))) };
    if (base.fn.name === 'tan') return { title: 'Use the identity tan²x = sec²x − 1', formula: `\\tan^2 x = \\sec^2 x - 1`, rewritten: sub(pow(fn('sec', u), num(2)), num(1)) };
    return null;
  }

  /** ∫ f'(x)/f(x) dx = ln|f(x)| (up to a constant multiple). */
  function logDerivative(n, w) {
    if (!(n.isOperatorNode && n.fn === 'divide')) return null;
    const [top, bot] = n.args.map(unwrap);
    if (isConstantIn(bot, w) || linear(bot, w)) return null;
    let d;
    try { d = tidy(math.derivative(bot, w)); } catch { return null; }
    const ratios = [0.37, 1.29, 2.13].map((x) => { try { return top.evaluate({ [w]: x }) / d.evaluate({ [w]: x }); } catch { return NaN; } });
    if (!ratios.every(Number.isFinite) || ratios.some((r) => Math.abs(r - ratios[0]) > 1e-9 * Math.max(1, Math.abs(r)))) return null;
    const c = snap(ratios[0]);
    if (Math.abs(c) < 1e-12) return null;
    // ln(x² + 1) needs no |…|: an irreducible quadratic with a positive x² term is always positive
    const q = polyCoeffs(bot, w);
    const positive = q && q.length === 3 && q[2] > 0 && q[1] * q[1] - 4 * q[2] * q[0] < 0;
    const lnBot = positive ? fn('log', bot) : absLog(bot);
    return {
      title: 'The top is the derivative of the bottom', formula: `\int \frac{f'(x)}{f(x)}\,dx = \ln|f(x)|`,
      result: scaled(c, lnBot),
      lines: [`\frac{d}{d${w}}\left(${tex(polish(bot))}\right) = ${tex(polish(d))}${Math.abs(c - 1) < 1e-12 ? '' : `, \ \text{and the top is } ${texN(c)} \times \text{that}`}`],
    };
  }

  /** ∫ e^{ax} sin(bx) and e^{ax} cos(bx): parts twice, the integral comes back. */
  function expTrig(n, w) {
    if (!(n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2)) return null;
    const exU = (f) => (f.isFunctionNode && f.fn.name === 'exp' ? unwrap(f.args[0]) : f.isOperatorNode && f.fn === 'pow' && isSym(unwrap(f.args[0]), 'e') ? unwrap(f.args[1]) : null);
    for (const [E, T] of [n.args.map(unwrap), [...n.args].reverse().map(unwrap)]) {
      const u = exU(E);
      if (!u || !(T.isFunctionNode && ['sin', 'cos'].includes(T.fn.name))) continue;
      const lu = linear(u, w), v = unwrap(T.args[0]), lv = linear(v, w);
      if (!lu || !lv) continue;
      const a = lu.a, b = lv.a, s = a * a + b * b;
      const inner = T.fn.name === 'sin'
        ? signedSum([{ c: a, node: fn('sin', v) }, { c: -b, node: fn('cos', v) }])
        : signedSum([{ c: a, node: fn('cos', v) }, { c: b, node: fn('sin', v) }]);
      return {
        title: 'Integration by parts twice (the integral comes back)', formula: `\int u\,dv = uv - \int v\,du`,
        result: mul(div(E, fracNode(s)), paren(inner)),
        lines: [
          `I = \int ${tex(polish(n))}\,d${w}`,
          `\text{Parts twice (} u = \text{the trig part both times) brings back } -${texN(b * b / (a * a))}\,I \text{ on the right}`,
          `\text{Move it to the left: } ${texN(s / (a * a))}\,I = \ldots, \text{ then divide}`,
        ],
      };
    }
    return null;
  }

  function logRule(den, lin) {
    return { title: 'Standard integral: 1/x', result: div(absLog(den), fracNode(lin.a)), formula: `\\int \\frac{dx}{x} = \\ln|x|` };
  }

  // ---- partial fractions ----
  function partialFractions(n, w, depth) {
    const r = rationalParts(n, w);
    if (!r) return null;
    const { P, Q } = r;
    if (trimC(Q).length < 2) return null;
    const W = sym(w);
    const lines = [];
    let poly = null;
    let R = trimC(P);
    const Qt = trimC(Q);
    if (R.length >= Qt.length) {
      const { q, r: rem } = polyDivide(R, Qt);
      poly = polyNode(q, w);
      R = rem;
      lines.push(`\\text{Divide first: } \\frac{${tex(polish(polyNode(P, w)))}}{${tex(polish(polyNode(Qt, w)))}} = ${tex(polish(poly))} + \\frac{${tex(polish(polyNode(R, w)))}}{${tex(polish(polyNode(Qt, w)))}}`);
    }
    const lead = Qt.at(-1);
    const { roots, rest } = rationalRoots(Qt);
    let pieces = [];
    let integralParts = [];
    if (rest.length === 1) {
      // Linear factors only: R/Q = Σ A_ij / (x − r_i)^j; find the A's from sample points
      const unknowns = [];
      roots.forEach(({ r: rt, m }) => { for (let j = 1; j <= m; j++) unknowns.push({ rt, j }); });
      const xs = unknowns.map((_, k) => 0.37 + 1.13 * k + 0.071 * k * k);
      const A = xs.map((x) => unknowns.map(({ rt, j }) => 1 / (x - rt) ** j));
      const b = xs.map((x) => evalPoly(R, x) / evalPoly(Qt, x));
      const coef = solveLinear(A, b).map(snap);
      const factor = (rt) => (Math.abs(rt) < 1e-12 ? W : rt > 0 ? sub(W, fracNode(rt)) : add(W, fracNode(-rt)));
      unknowns.forEach(({ rt, j }, k) => {
        const c = coef[k];
        if (Math.abs(c) < 1e-12) return;
        pieces.push(`\\frac{${texN(c)}}{${tex(polish(j === 1 ? factor(rt) : pow(paren(factor(rt)), num(j))))}}`);
        integralParts.push(j === 1 ? { c, node: absLog(factor(rt)) } : { c: -c / (j - 1), node: div(num(1), j === 2 ? factor(rt) : pow(paren(factor(rt)), num(j - 1))) });
      });
      const facTex = roots.map(({ r: rt, m }) => `${tex(polish(paren(factor(rt))))}${m > 1 ? `^{${m}}` : ''}`).join('');
      lines.push(`${tex(polish(polyNode(Qt, w)))} = ${Math.abs(lead - 1) < 1e-12 ? '' : texN(lead)}${facTex}`);
      lines.push(`\\frac{${tex(polish(polyNode(R, w)))}}{${tex(polish(polyNode(Qt, w)))}} = ${pieces.join(' + ').replace(/\+ -/g, '- ')}`);
    } else if (Qt.length === 3 && rest.length === 3) {
      // One irreducible quadratic ax² + bx + c: split into a ln part and an arctan part
      const [c0, c1, c2] = Qt;
      if (R.length > 2) return null;
      const p1 = R[1] || 0, p0 = R[0] || 0;
      const h = c1 / (2 * c2), k2 = c0 / c2 - h * h;
      if (!(k2 > 0)) return null;
      const k = Math.sqrt(k2);
      const lnCoef = snap(p1 / (2 * c2));
      // (x + h)/k with h = p/q is written (qx + p)/(qk), e.g. (2x + 1)/√3
      const hf = toFraction(h, 1000, 1e-9) || { n: h, d: 1 };
      const qk = sqrtNode(hf.d * hf.d * k2);
      const atanCoef = snap(((p0 - p1 * h) / c2) * hf.d);
      if (Math.abs(lnCoef) > 1e-12) integralParts.push({ c: lnCoef, node: fn('log', polyNode(Qt, w)) });
      if (Math.abs(atanCoef) > 1e-12) integralParts.push({ c: atanCoef, node: div(fn('atan', div(polyNode([hf.n, hf.d], w), qk)), qk) });
      lines.push(`\\text{Complete the square: } ${tex(polish(polyNode(Qt, w)))} = ${texN(c2)}\\left[\\left(${w} ${h < 0 ? '-' : '+'} ${texN(Math.abs(h))}\\right)^2 + ${texN(k2)}\\right]`);
      lines.push(`\\text{Split the top into a multiple of the bottom's derivative (gives } \\ln\\text{) and a constant (gives } \\tan^{-1}\\text{).}`);
    } else {
      return null;
    }
    const slot = reserve();
    let result = signedSum(integralParts);
    if (poly) result = add(I(poly, w, depth + 1), result);
    return fill(slot, 'Partial fractions', n, w, result, depth, `\\frac{P(x)}{(x - a)(x - b)} = \\frac{A}{x - a} + \\frac{B}{x - b}`, lines);
  }

  // ---- u-substitution ----
  function uSubstitution(n, w, depth) {
    const candidates = [];
    const seen = new Set();
    n.traverse((m) => {
      const x = unwrap(m);
      if (x === n || isConstantIn(x, w) || isSym(x, w) || linear(x, w)) return;
      if (!(x.isFunctionNode || x.isOperatorNode)) return;
      const key = str(x);
      if (!seen.has(key)) { seen.add(key); candidates.push(x); }
    });
    candidates.sort((p, q) => str(p).length - str(q).length);
    for (const g of candidates.slice(0, 12)) {
      let dg;
      try { dg = math.derivative(g, w); } catch { continue; }
      if (isConstantIn(dg, w) && dg.isConstantNode && dg.value === 0) continue;
      let h;
      try { h = simplifyExact(div(n, dg)); } catch { continue; }
      const U = sym('u');
      const gs = str(simplifyExact(g));
      let hu = h.transform((m) => (str(m) === gs || str(m) === str(g) ? U : m));
      if (variablesOf(hu).has(w)) {
        // Try once more with g written the other way round (simplify may reorder sums)
        hu = h.transform((m) => (sameExpr(m, g) ? U : m));
        if (variablesOf(hu).has(w)) continue;
      }
      if (!variablesOf(hu).has('u') && isConstantIn(hu, 'u')) continue;
      const slot = reserve();
      let inner;
      try { inner = I(hu, 'u', depth + 1); } catch (e) { steps.length = slot; continue; }
      const result = subst(inner, 'u', paren(g));
      return fill(slot, `Substitution u = ${g.toString({ implicit: 'hide' }).replace(/ \^ /g, '^').replace(/log\(/g, 'ln(')}`, n, w, result, depth,
        `\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du`,
        [`u = ${tex(polish(g))}, \\quad du = ${tex(polish(tidy(dg)))}\\,d${w}`, `${intTex(n, w)} = ${intTex(hu, 'u')}`]);
    }
    return null;
  }

  // ---- integration by parts ----
  function byParts(n, w, depth) {
    if (!(n.isOperatorNode && n.fn === 'multiply')) {
      // ∫ ln(...) alone and inverse trig alone: u = f, dv = dx
      if (n.isFunctionNode && ['atan', 'asin'].includes(n.fn.name) && isSym(unwrap(n.args[0]), w)) return partsWith(n, num(1), w, depth);
      return null;
    }
    const factors = [];
    const collect = (t) => { const x = unwrap(t); if (x.isOperatorNode && x.fn === 'multiply') x.args.forEach(collect); else factors.push(x); };
    collect(n);
    if (factors.length !== 2) return null;
    // ILATE: Log, Inverse trig, Algebraic, Trig, Exponential — u is the earliest
    const rank = (f) => {
      if (f.isFunctionNode && f.fn.name === 'log') return 0;
      if (f.isFunctionNode && ['atan', 'asin', 'acos'].includes(f.fn.name)) return 1;
      if (polyCoeffs(f, w)) return 2;
      if (f.isFunctionNode && ['sin', 'cos'].includes(f.fn.name)) return 3;
      if ((f.isOperatorNode && f.fn === 'pow' && isConstantIn(f.args[0], w)) || (f.isFunctionNode && f.fn.name === 'exp')) return 4;
      return 9;
    };
    const [u, dv] = [...factors].sort((p, q) => rank(p) - rank(q));
    if (rank(u) === 9 || rank(dv) === 9) return null;
    const pu = polyCoeffs(u, w);
    // Tabular method: polynomial × (e^ax, sin ax, cos ax)
    if (pu && rank(dv) >= 3) {
      const ders = [];
      let c = trimC(pu);
      while (!(c.length === 1 && Math.abs(c[0]) < 1e-12) && ders.length < 8) { ders.push(c); c = derivPoly(c); if (!c.length) c = [0]; }
      const ints = [];
      let cur = dv;
      for (let i = 0; i < ders.length; i++) {
        const t2 = simpleInt(cur, w);
        if (!t2) return null;
        cur = tidy(t2);
        ints.push(cur);
      }
      let result = null;
      const rows = [];
      ders.forEach((d, i) => {
        const term = mul(polyNode(d, w), ints[i]);
        result = result ? (i % 2 ? sub(result, term) : add(result, term)) : term;
        rows.push(`${i % 2 ? '-' : '+'} \\ (${tex(polish(polyNode(d, w)))}) \\times (${tex(polish(ints[i]))})`);
      });
      const slot = reserve();
      return fill(slot, 'Integration by parts (tabular method)', n, w, result, depth, `\\int u\\,dv = uv - \\int v\\,du`,
        [`u = ${tex(polish(u))} \\ \\text{(differentiate until 0)}, \\quad dv = ${tex(polish(dv))}\\,d${w} \\ \\text{(integrate)}`, `\\text{Signs alternate: } ${rows.join(' \\; ')}`]);
    }
    return partsWith(u, dv, w, depth);
  }

  function partsWith(u, dv, w, depth) {
    const n = tidy(mul(u, dv));
    const slot = reserve();
    const vInt = (() => { try { return I(dv, w, depth + 1); } catch { return null; } })();
    if (!vInt) { steps.length = slot; return null; }
    const du = tidy(math.derivative(u, w));
    const rest = simplifyExact(mul(vInt, du));
    let restInt;
    try { restInt = I(rest, w, depth + 1); } catch { steps.length = slot; return null; }
    const result = sub(mul(u, vInt), restInt);
    return fill(slot, 'Integration by parts', n, w, result, depth, `\\int u\\,dv = uv - \\int v\\,du`,
      [`u = ${tex(polish(u))}, \\ dv = ${tex(polish(dv))}\\,d${w} \\ \\Rightarrow\\ du = ${tex(polish(du))}\\,d${w}, \\ v = ${tex(polish(vInt))}`,
        `${intTex(n, w)} = ${tex(polish(mul(u, vInt)))} - ${intTex(rest, w)}`]);
  }

  const result = tidy(I(node, v, 0));
  return { result, steps: steps.filter(Boolean) };
}
