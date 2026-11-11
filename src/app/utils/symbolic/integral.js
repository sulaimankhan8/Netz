/**
 * Indefinite integrals, step by step (docs/methods/NETZ_METHODS_CATALOG.md 6E). Methods, in the order they are tried:
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
/**
 * Like linear(), but the coefficient may also be a letter (n·x, −s·t, (2k + 1)x): { a, aNode, sym }.
 * a is the number when there is one (sym false), else NaN with aNode the coefficient as a node.
 */
function linearAny(node, v) {
  const l = linear(node, v);
  if (l) return { ...l, aNode: fracNode(l.a), sym: false };
  if (isConstantIn(node, v)) return null;
  let d;
  try { d = tidy(math.derivative(node, v)); } catch { return null; }
  if (!isConstantIn(d, v)) return null;
  const others = [...variablesOf(d)];
  const probe = Object.fromEntries(others.map((s, i) => [s, 1.37 + 0.71 * i]));
  let dv;
  try { dv = d.evaluate(probe); } catch { return null; }
  if (typeof dv !== 'number' || Math.abs(dv) < 1e-12) return null;
  let aNode = d;
  try { aNode = simplifyExact(d); } catch { /* keep d */ }
  return { a: NaN, b: NaN, aNode, sym: true };
}
/** body ÷ (the coefficient of a linear inside), written the textbook way. */
function overLin(body, l) {
  if (!l.sym) return overA(body, l.a);
  const minus = body.isOperatorNode && body.fn === 'unaryMinus';
  const inner = minus ? body.args[0] : body;
  const d = div(inner, l.aNode.isSymbolNode || l.aNode.isConstantNode ? l.aNode : paren(l.aNode));
  return minus ? neg(d) : d;
}
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
/** f^p, with f^1 = f. */
/** body ÷ a for a linear inside (numbers as before: body/a). */
const per = (body, l) => (l.sym ? overLin(body, l) : div(body, fracNode(l.a)));
const powT = (f, p) => (p === 1 ? f : pow(f, num(p)));

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

// ---------- rewriting an integrand the rules could not take as it was ----------
/**
 * One product/quotient written cleanly: every factor as base^power (√u = u^(1/2), sec = cos⁻¹, tan = sin·cos⁻¹ …),
 * equal bases merged, all e-powers merged into one; then back with sec, csc for lone cos, sin below.
 * A product of two sines/cosines becomes a sum (sin A cos B = ½[sin(A + B) + sin(A − B)] …), and sinᵏ/cos
 * becomes (1 − cos²)·sinᵏ⁻²/cos split term by term. Returns { node, title, formula } or null.
 */
function rewriteIntegrand(n, w) {
  const numberOf = (x) => { try { const k = x.evaluate({}); return typeof k === 'number' ? k : NaN; } catch { return NaN; } };
  const factors = [];
  let coef = 1;
  let ePow = null, eCount = 0;
  const push = (base, k) => {
    const f = factors.find((q) => str(q.base) === str(base));
    if (f) f.k += k; else factors.push({ base, k });
  };
  const collect = (t, sign) => {
    const x = unwrap(t);
    if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach((y) => collect(y, sign)); return; }
    if (x.isOperatorNode && x.fn === 'divide') { collect(x.args[0], sign); collect(x.args[1], -sign); return; }
    if (x.isOperatorNode && x.fn === 'unaryMinus') { coef = -coef; collect(x.args[0], sign); return; }
    if (x.isConstantNode && typeof x.value === 'number') { coef *= x.value ** sign; return; }
    if (x.isFunctionNode && x.fn.name === 'exp') { const e = sign > 0 ? x.args[0] : neg(x.args[0]); ePow = ePow ? add(ePow, e) : e; eCount++; return; }
    if (x.isOperatorNode && x.fn === 'pow' && isSym(unwrap(x.args[0]), 'e')) { const e = sign > 0 ? x.args[1] : neg(x.args[1]); ePow = ePow ? add(ePow, e) : e; eCount++; return; }
    if (x.isFunctionNode && x.fn.name === 'sqrt') { push(unwrap(x.args[0]), sign / 2); return; }
    if (x.isOperatorNode && x.fn === 'pow') {
      const k = numberOf(x.args[1]);
      if (Number.isFinite(k)) {
        const b = unwrap(x.args[0]);
        if (b.isFunctionNode && ['sec', 'csc', 'tan', 'cot'].includes(b.fn.name)) { for (let i = 0; i < Math.abs(k) && Number.isInteger(k); i++) collect(b, sign * Math.sign(k)); if (Number.isInteger(k)) return; }
        push(b, sign * k); return;
      }
    }
    if (x.isFunctionNode && x.args.length === 1) {
      const u = x.args[0];
      const R = { sec: [['cos', -1]], csc: [['sin', -1]], tan: [['sin', 1], ['cos', -1]], cot: [['cos', 1], ['sin', -1]] }[x.fn.name];
      if (R) { R.forEach(([f, k]) => push(fn(f, u), sign * k)); return; }
    }
    push(x, sign);
  };
  collect(n, 1);
  const live = factors.filter((f) => Math.abs(f.k) > 1e-12);
  const isTrig = (b, name) => b.isFunctionNode && b.fn.name === name;
  // e-powers merged
  let eNode = null;
  if (ePow) { let e = ePow; try { e = simplifyExact(ePow); } catch { /* keep */ } const ev = numberOf(e); if (!(Number.isFinite(ev) && Math.abs(ev) < 1e-12)) eNode = pow(sym('e'), e); }
  const pw = (b, k) => (Math.abs(k - 1) < 1e-12 ? b : pow(b, fracNode(k)));
  const up = live.filter((f) => f.k > 0), down = live.filter((f) => f.k < 0);
  // sinᵏ u / cos u (k ≥ 2): sin² = 1 − cos², then split
  const s2 = up.find((f) => isTrig(f.base, 'sin') && f.k >= 2 && Number.isInteger(f.k));
  const c1 = s2 && down.find((f) => isTrig(f.base, 'cos') && str(f.base.args[0]) === str(s2.base.args[0]));
  if (s2 && c1) {
    const u = s2.base.args[0];
    const rest = [...up.filter((f) => f !== s2).map((f) => pw(f.base, f.k)), ...(s2.k > 2 ? [pw(fn('sin', u), s2.k - 2)] : [])];
    const others = down.filter((f) => f !== c1).map((f) => pw(f.base, -f.k));
    const build = (top) => {
      const nume = [...rest, top].reduce((a, b) => mul(a, b));
      const deno = [pw(fn('cos', u), -c1.k), ...others].reduce((a, b) => mul(a, b));
      return mul(fracNode(coef), div(nume, deno));
    };
    const node = sub(build(num(1)), build(pow(fn('cos', u), num(2))));
    return { node: tidy(node), title: 'Use sin² = 1 − cos² and split', formula: '\\sin^2 x = 1 - \\cos^2 x' };
  }
  // two sines/cosines multiplied: product to sum
  const trigUp = up.filter((f) => (isTrig(f.base, 'sin') || isTrig(f.base, 'cos')) && f.k === 1);
  if (trigUp.length === 2 && !down.some((f) => isTrig(f.base, 'sin') || isTrig(f.base, 'cos'))) {
    const [p, q] = trigUp.sort((a, b) => (a.base.fn.name === 'sin' ? -1 : 1) - (b.base.fn.name === 'sin' ? -1 : 1));
    const A = p.base.args[0], B = q.base.args[0];
    const tidyArg = (z) => { try { return polish(simplifyExact(z)); } catch { return z; } };
    const plus = tidyArg(add(A, B)), minus = tidyArg(sub(A, B));
    const names = `${p.base.fn.name}${q.base.fn.name}`;
    const sum = names === 'sincos' ? add(fn('sin', plus), fn('sin', minus)) : names === 'coscos' ? add(fn('cos', minus), fn('cos', plus)) : sub(fn('cos', minus), fn('cos', plus));
    const formula = names === 'sincos' ? '\\sin A\\cos B = \\tfrac12[\\sin(A + B) + \\sin(A - B)]' : names === 'coscos' ? '\\cos A\\cos B = \\tfrac12[\\cos(A - B) + \\cos(A + B)]' : '\\sin A\\sin B = \\tfrac12[\\cos(A - B) - \\cos(A + B)]';
    const rest = [...up.filter((f) => f !== p && f !== q).map((f) => pw(f.base, f.k)), ...(eNode ? [eNode] : [])];
    const deno = down.map((f) => pw(f.base, -f.k));
    // split the sum so each term is a product the rules know
    const each = (t) => { let x = mul(fracNode(coef / 2), [...rest, t].reduce((a, b) => mul(a, b))); if (deno.length) x = div(x, deno.reduce((a, b) => mul(a, b))); return x; };
    const terms = sum.fn === 'add' ? add(each(sum.args[0]), each(sum.args[1])) : sub(each(sum.args[0]), each(sum.args[1]));
    return { node: tidy(terms), title: 'Product to sum', formula };
  }
  // otherwise: rebuild, with sec/csc for a lone cos/sin below
  const top = [...up.map((f) => pw(f.base, f.k)), ...(eNode ? [eNode] : [])];
  const bottom = [];
  for (const f of down) {
    if (isTrig(f.base, 'cos') && !top.length) { top.push(pw(fn('sec', f.base.args[0]), -f.k)); continue; }
    if (isTrig(f.base, 'sin') && !top.length) { top.push(pw(fn('csc', f.base.args[0]), -f.k)); continue; }
    // x^(−1/2) stays a power below when nothing is on top (so 1/√x → x^(−1/2))
    if (!Number.isInteger(f.k) && !top.length) { top.push(pow(f.base, fracNode(f.k))); continue; }
    bottom.push(pw(f.base, -f.k));
  }
  let node = top.length ? top.reduce((a, b) => mul(a, b)) : num(1);
  if (bottom.length) node = div(node, bottom.reduce((a, b) => mul(a, b)));
  if (Math.abs(coef - 1) > 1e-12) node = mul(fracNode(coef), node);
  return eCount > 1
    ? { node: tidy(node), title: 'Combine the powers of e', formula: 'e^{a}e^{b} = e^{a + b}' }
    : { node: tidy(node), title: 'Rewrite the integrand', formula: null };
}

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
    const tp = trigPower(n, w);
    if (tp && !tp.rewritten) return record(tp.title, tp.result, tp.lines, tp.formula);
    if (tp) {
      const slot = reserve();
      const r = I(tp.rewritten, w, depth + 1);
      return fill(slot, tp.title, n, w, r, depth, tp.formula, [`${tex(polish(n))} = ${tex(polish(tp.rewritten))}`]);
    }
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

    // sin A cos B and the like: as a sum before by parts (which would go round in circles on them)
    const rw = rewriteIntegrand(n, w);
    const useRw = rw && str(rw.node) !== str(n);
    if (useRw && (rw.title === 'Product to sum' || rw.title === 'Combine the powers of e')) {
      const slot = reserve();
      const r = I(rw.node, w, depth + 1);
      return fill(slot, rw.title, n, w, r, depth, rw.formula, [`${tex(polish(n))} = ${tex(polish(rw.node))}`]);
    }

    // Integration by parts
    const bp = byParts(n, w, depth);
    if (bp) return bp;

    // Last try: tidy the integrand (eˣ·eˣ = e²ˣ, 1/√x = x^(−1/2), sec x/cos x = sec²x …)
    if (useRw) {
      const slot = reserve();
      const r = I(rw.node, w, depth + 1);
      return fill(slot, rw.title, n, w, r, depth, rw.formula, [`${tex(polish(n))} = ${tex(polish(rw.node))}`]);
    }

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
      const lin = linearAny(base, w);
      if (lin && isConstantIn(ex, w)) {
        let k = null;
        try { const kv = ex.evaluate({}); if (typeof kv === 'number' && toFraction(kv, 1000, 1e-9)) k = kv; } catch { /* symbolic power */ }
        if (k !== null && Math.abs(k + 1) < 1e-12) return logRule(base, lin);
        let result;
        if (lin.sym) {
          const k1 = k === null ? add(ex, num(1)) : fracNode(k + 1);
          result = div(pow(base, k1), mul(k1, paren(lin.aNode)));
        } else if (k === null) {
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
      const linEx = linearAny(ex, w);
      if (linEx && isConstantIn(base, w)) {
        if (isSym(base, 'e')) return { title: 'Exponential rule', result: per(n, linEx), formula: `\\int e^{x}\\,dx = e^{x}` };
        return { title: 'Exponential rule (base a)', result: linEx.sym ? div(n, mul(paren(linEx.aNode), fn('log', base))) : div(n, mul(fracNode(linEx.a), fn('log', base))), formula: `\\int a^{x}\\,dx = \\frac{a^{x}}{\\ln a}` };
      }
      // sec²(lin), csc²(lin)
      if (base.isFunctionNode && ex.isConstantNode && ex.value === 2) {
        const u = unwrap(base.args[0]); const l = linearAny(u, w);
        if (l && base.fn.name === 'sec') return { title: 'Standard integral: sec²', result: per(fn('tan', u), l), formula: `\\int \\sec^2 x\\,dx = \\tan x` };
        if (l && base.fn.name === 'csc') return { title: 'Standard integral: csc²', result: neg(per(fn('cot', u), l)), formula: `\\int \\csc^2 x\\,dx = -\\cot x` };
      }
    }
    // c / (linear), and 1/(linear)^k written as a fraction
    if (n.isOperatorNode && n.fn === 'divide' && isConstantIn(n.args[0], w)) {
      const den = unwrap(n.args[1]);
      const lin = linearAny(den, w);
      if (lin) { const r = logRule(den, lin); return { ...r, result: mul(n.args[0], r.result) }; }
      if (den.isOperatorNode && den.fn === 'pow' && linearAny(unwrap(den.args[0]), w) && isConstantIn(den.args[1], w)) {
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
        // c/√(x² ± a²) (after taking out the x² coefficient) → ln|x + √(x² ± a²)|
        if (qs && qs.length === 3 && Math.abs(qs[1]) < 1e-12 && qs[2] > 0 && Math.abs(qs[0]) > 1e-12) {
          const A2 = qs[0] / qs[2];
          const root = fn('sqrt', polyNode([A2, 0, 1], w));
          const lnPart = absLog(add(W, root));
          const c = Math.abs(qs[2] - 1) < 1e-12 ? n.args[0] : div(n.args[0], sqrtNode(qs[2]));
          return {
            title: `Standard integral: 1/√(x² ${A2 > 0 ? '+' : '−'} a²)`,
            result: c.isConstantNode && c.value === 1 ? lnPart : mul(c, lnPart),
            formula: `\\int \\frac{dx}{\\sqrt{x^2 ${A2 > 0 ? '+' : '-'} a^2}} = \\ln\\left|x + \\sqrt{x^2 ${A2 > 0 ? '+' : '-'} a^2}\\right|`,
          };
        }
      }
    }
    // sec·tan and csc·cot
    if (n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2) {
      const [p, q] = n.args.map(unwrap);
      const pair = (a, b, x, y) => a.isFunctionNode && b.isFunctionNode && a.fn.name === x && b.fn.name === y && str(a.args[0]) === str(b.args[0]);
      for (const [a, b] of [[p, q], [q, p]]) {
        const u = a.isFunctionNode ? unwrap(a.args[0]) : null; const l = u && linearAny(u, w);
        if (l && pair(a, b, 'sec', 'tan')) return { title: 'Standard integral: sec·tan', result: per(fn('sec', u), l), formula: `\\int \\sec x\\tan x\\,dx = \\sec x` };
        if (l && pair(a, b, 'csc', 'cot')) return { title: 'Standard integral: csc·cot', result: neg(per(fn('csc', u), l)), formula: `\\int \\csc x\\cot x\\,dx = -\\csc x` };
      }
    }
    // f(linear)
    if (n.isFunctionNode && n.args.length === 1) {
      const u = unwrap(n.args[0]);
      if (n.fn.name === 'sqrt') { const sq = sqrtQuadratic(n, u, w); if (sq) return sq; }
      const l = linearAny(u, w);
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
      return { title: `Standard integral: ${n.fn.name === 'log' ? 'ln' : n.fn.name}${isSym(u, w) ? '' : ' (linear inside)'}`, result: overLin(T[0], l), formula: T[1] };
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

  /** √(a² − x²), √(x² + a²), √(x² − a²) (times a constant inside): the three standard results. */
  function sqrtQuadratic(n, u, w) {
    const q = polyCoeffs(u, w);
    if (!q || q.length !== 3 || Math.abs(q[1]) > 1e-12 || Math.abs(q[0]) < 1e-12) return null;
    const W = sym(w);
    const [c0, , c2] = q;
    const half = mul(div(W, num(2)), n);
    const coef = sqrtNode((c0 * c0) / (4 * Math.abs(c2)));
    const one = (x) => x.isConstantNode && x.value === 1;
    if (c2 < 0 && c0 > 0) {
      const A2 = c0 / -c2;
      const a = sqrtNode(A2);
      const af = toFraction(Math.sqrt(A2), 1000, 1e-9);
      // x/(3/2) is written 2x/3
      const arg = one(a) ? W : af && af.d > 1 ? div(mul(num(af.d), W), num(af.n)) : div(W, a);
      const ang = fn('asin', arg);
      return {
        title: 'Standard integral: √(a² − x²)',
        result: add(half, one(coef) ? ang : mul(coef, ang)),
        formula: '\\int \\sqrt{a^2 - x^2}\\,dx = \\frac{x}{2}\\sqrt{a^2 - x^2} + \\frac{a^2}{2}\\sin^{-1}\\frac{x}{a}',
      };
    }
    if (c2 > 0) {
      const A2 = c0 / c2;
      const lnPart = absLog(add(W, fn('sqrt', polyNode([A2, 0, 1], w))));
      const term = one(coef) ? lnPart : mul(coef, lnPart);
      const s = A2 > 0 ? '+' : '-';
      return {
        title: `Standard integral: √(x² ${A2 > 0 ? '+' : '−'} a²)`,
        result: c0 > 0 ? add(half, term) : sub(half, term),
        formula: `\\int \\sqrt{x^2 ${s} a^2}\\,dx = \\frac{x}{2}\\sqrt{x^2 ${s} a^2} ${s} \\frac{a^2}{2}\\ln\\left|x + \\sqrt{x^2 ${s} a^2}\\right|`,
      };
    }
    return null;
  }

  /**
   * sinᵐu·cosⁿu with u linear (m + n ≥ 3, or both at least 1):
   *   an odd power: keep one factor for du and turn the rest into the other function (sin² = 1 − cos²), so
   *   the integral becomes a polynomial in t = cos u (or sin u);
   *   both even: replace sin² and cos² by half-angle forms and integrate term by term.
   */
  function trigPower(n, w) {
    const part = (f) => {
      const x = unwrap(f);
      if (x.isFunctionNode && ['sin', 'cos'].includes(x.fn.name)) return { name: x.fn.name, u: unwrap(x.args[0]), p: 1 };
      if (x.isOperatorNode && x.fn === 'pow') {
        const [b, e] = x.args.map(unwrap);
        if (b.isFunctionNode && ['sin', 'cos'].includes(b.fn.name) && e.isConstantNode && Number.isInteger(e.value) && e.value > 0) return { name: b.fn.name, u: unwrap(b.args[0]), p: e.value };
      }
      return null;
    };
    let m = 0, k = 0, u = null;
    const add1 = (q) => { if (!q) return false; if (u && str(q.u) !== str(u)) return false; u = q.u; if (q.name === 'sin') m += q.p; else k += q.p; return true; };
    if (n.isOperatorNode && n.fn === 'multiply') {
      const fs = [];
      const collect = (t) => { const x = unwrap(t); if (x.isOperatorNode && x.fn === 'multiply') x.args.forEach(collect); else fs.push(x); };
      collect(n);
      if (!fs.every((f) => add1(part(f)))) return null;
      if (!(m > 0 && k > 0)) return null;
    } else if (!add1(part(n)) || m + k < 3) return null;
    const l = linearAny(u, w);
    if (!l) return null;
    const S = fn('sin', u), C = fn('cos', u);
    const T = sym('t');
    // One odd power: substitute the other function
    if (m % 2 === 1 || k % 2 === 1) {
      const useCos = m % 2 === 1; // sin odd → t = cos u
      const odd = useCos ? m : k, other = useCos ? k : m;
      const h = (odd - 1) / 2;
      // sinⁿx·cos x (and cosⁿx·sin x) is a plain u-substitution: leave it to that rule
      if (h === 0) return null;
      // ∫ (1 − t²)^h t^other dt, expanded
      const terms = [];
      for (let j = 0; j <= h; j++) terms.push({ c: binom(h, j) * (-1) ** j / (2 * j + other + 1), p: 2 * j + other + 1 });
      const sign = useCos ? -1 : 1;
      const tPoly = signedSum(terms.map((t2) => ({ c: t2.c, node: powT(T, t2.p) })));
      const back = (f) => signedSum(terms.map((t2) => ({ c: t2.c * sign, node: powT(f, t2.p) })));
      const result = overLin(back(useCos ? C : S), l);
      const uT = tex(polish(u));
      const aTex = l.sym ? `(${tex(polish(l.aNode))})` : texN(l.a);
      const oneA = !l.sym && Math.abs(l.a - 1) < 1e-12;
      const pw = (base, p) => (p === 0 ? '' : p === 1 ? base : `${base}^{${p}}`);
      const integrand = `${pw('(1 - t^2)', h)}${other ? ` ${pw('t', other)}` : ''}`;
      return {
        title: `Odd power: substitute t = ${useCos ? 'cos' : 'sin'} ${u.toString({ implicit: 'hide' })}`,
        formula: useCos ? '\\sin^2 x = 1 - \\cos^2 x' : '\\cos^2 x = 1 - \\sin^2 x',
        result,
        lines: [
          `t = ${useCos ? '\\cos' : '\\sin'} ${uT}, \\quad dt = ${useCos ? '-' : ''}${oneA ? '' : aTex}\\,${useCos ? '\\sin' : '\\cos'} ${uT}\\,d${w}, \\quad ${useCos ? `\\sin^2 ${uT} = 1 - t^2` : `\\cos^2 ${uT} = 1 - t^2`}`,
          `\\int ${tex(polish(n))}\\,d${w} = ${useCos ? '-' : ''}${oneA ? '' : `\\frac{1}{${aTex}}`}\\int ${integrand}\\,dt = ${useCos ? '-' : ''}${oneA ? '' : `\\frac{1}{${aTex}}`}\\left(${tex(polish(tPoly))}\\right)`,
          `\\text{Put back } t = ${useCos ? '\\cos' : '\\sin'} ${uT}`,
        ],
      };
    }
    // Both even: half-angle forms, then term by term
    const c2 = fn('cos', tidy(mul(num(2), u)));
    // ((1 − c)/2)^(m/2) · ((1 + c)/2)^(k/2) as a polynomial in c
    let poly = [1];
    for (let i = 0; i < m / 2; i++) poly = mulPoly(poly, [0.5, -0.5]);
    for (let i = 0; i < k / 2; i++) poly = mulPoly(poly, [0.5, 0.5]);
    const rewritten = signedSum(poly.map((c, j) => ({ c, node: j === 0 ? num(1) : powT(c2, j) })).filter((t2) => Math.abs(t2.c) > 1e-12));
    return {
      rewritten,
      title: 'Even powers: use the half-angle forms',
      formula: '\\sin^2 x = \\frac{1 - \\cos 2x}{2}, \\quad \\cos^2 x = \\frac{1 + \\cos 2x}{2}',
    };
    function mulPoly(p, q) { const r = new Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; }
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
      title: 'The top is the derivative of the bottom', formula: `\\int \\frac{f'(x)}{f(x)}\\,dx = \\ln|f(x)|`,
      result: scaled(c, lnBot),
      lines: [`\\frac{d}{d${w}}\\left(${tex(polish(bot))}\\right) = ${tex(polish(d))}${Math.abs(c - 1) < 1e-12 ? '' : `, \\ \\text{and the top is } ${texN(c)} \\times \\text{that}`}`],
    };
  }

  /** ∫ e^{ax} sin(bx) and e^{ax} cos(bx): parts twice, the integral comes back. */
  function expTrig(n, w) {
    if (!(n.isOperatorNode && n.fn === 'multiply' && n.args.length === 2)) return null;
    const exU = (f) => (f.isFunctionNode && f.fn.name === 'exp' ? unwrap(f.args[0]) : f.isOperatorNode && f.fn === 'pow' && isSym(unwrap(f.args[0]), 'e') ? unwrap(f.args[1]) : null);
    for (const [E, T] of [n.args.map(unwrap), [...n.args].reverse().map(unwrap)]) {
      const u = exU(E);
      if (!u || !(T.isFunctionNode && ['sin', 'cos'].includes(T.fn.name))) continue;
      const lu = linearAny(u, w), v = unwrap(T.args[0]), lv = linearAny(v, w);
      if (!lu || !lv) continue;
      if (lu.sym || lv.sym) {
        // Letters in the coefficients (e^{-st} sin t, e^{ax} cos bx): the same formula, kept symbolic
        const aN = paren(lu.aNode), bN = paren(lv.aNode);
        const s2 = add(pow(aN, num(2)), pow(bN, num(2)));
        const inner = T.fn.name === 'sin' ? sub(mul(aN, fn('sin', v)), mul(bN, fn('cos', v))) : add(mul(aN, fn('cos', v)), mul(bN, fn('sin', v)));
        return {
          title: 'Integration by parts twice (the integral comes back)', formula: T.fn.name === 'sin'
            ? '\\int e^{ax}\\sin bx\\,dx = \\frac{e^{ax}}{a^2 + b^2}(a\\sin bx - b\\cos bx)'
            : '\\int e^{ax}\\cos bx\\,dx = \\frac{e^{ax}}{a^2 + b^2}(a\\cos bx + b\\sin bx)',
          result: mul(div(E, paren(s2)), paren(inner)),
          lines: [`a = ${tex(polish(lu.aNode))}, \\quad b = ${tex(polish(lv.aNode))}`],
        };
      }
      const a = lu.a, b = lv.a, s = a * a + b * b;
      const inner = T.fn.name === 'sin'
        ? signedSum([{ c: a, node: fn('sin', v) }, { c: -b, node: fn('cos', v) }])
        : signedSum([{ c: a, node: fn('cos', v) }, { c: b, node: fn('sin', v) }]);
      return {
        title: 'Integration by parts twice (the integral comes back)', formula: `\\int u\\,dv = uv - \\int v\\,du`,
        result: mul(div(E, fracNode(s)), paren(inner)),
        lines: [
          `I = \\int ${tex(polish(n))}\\,d${w}`,
          `\\text{Parts twice (} u = \\text{the trig part both times) brings back } -${texN(b * b / (a * a))}\\,I \\text{ on the right}`,
          `\\text{Move it to the left: } ${texN(s / (a * a))}\\,I = \\ldots, \\text{ then divide}`,
        ],
      };
    }
    return null;
  }

  function logRule(den, lin) {
    return { title: 'Standard integral: 1/x', result: per(absLog(den), lin), formula: `\\int \\frac{dx}{x} = \\ln|x|` };
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
