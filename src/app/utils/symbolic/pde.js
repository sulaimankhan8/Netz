/**
 * Shared helpers for the Unit 12 first-order and PDE pages (4C).
 *   isolate(lhs, v, rhs)   solve lhs = rhs for v when v appears once (undo + − × ÷, powers, exp/log, sqrt, trig)
 *   readEq(text, letters)  "y = px + p^2" → node L − R, read with readMulti (p, q, x, y, z as letters)
 *   sameAt / zeroAt        numerical identity checks at scattered points (skipping points outside the domain)
 *   fitPoly2(f)            a function of x, y that is a polynomial of degree ≤ 2 → its node, else null
 *   coeffsIn(node, v, max) coefficients of a polynomial in v whose coefficients may contain other letters
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, neg, paren, unwrap, tidy } from './tree';
import { readMulti, tidyMulti } from './multi';
import { substitute } from './iterated';
import { numNode, distribute } from './ode';

export const has = (node, v) => { let f = false; node.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && m.name === v) f = true; }); return f; };
export const count = (node, v) => { let k = 0; node.traverse((m, path, parent) => { if (m.isSymbolNode && m.name === v && !(parent && parent.isFunctionNode && parent.fn === m)) k++; }); return k; };
export const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const snap = (v) => { if (Math.abs(v) < 1e-10) return 0; const f = toFraction(v, 1000, 1e-9); return f ? f.n / f.d : v; };

/** Points to test identities at: scattered and away from 0 and 1 (each letter gets its own sequence). */
export function points(letters, n = 8) {
  const base = [0.73, 1.37, 0.41, 1.91, 0.58, 1.12, 2.3, 0.87, 1.64, 0.29];
  return Array.from({ length: n }, (_, i) => Object.fromEntries(letters.map((v, j) => [v, base[(i + 3 * j) % base.length] + 0.13 * j])));
}
/** a ≡ b at the test points (at least 3 must be defined). */
export function sameAt(a, b, letters, tol = 1e-7) {
  let ok = 0;
  for (const s of points(letters, 10)) {
    const x = typeof a === 'function' ? a(s) : evalAt(a, s), y = typeof b === 'function' ? b(s) : evalAt(b, s);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (Math.abs(x - y) > tol * Math.max(1, Math.abs(x), Math.abs(y))) return false;
    ok++;
  }
  return ok >= 3;
}
export const zeroAt = (a, letters, tol) => sameAt(a, () => 0, letters, tol);

/** Solve lhs = rhs for v, when v appears exactly once in lhs. Returns the node, or null. */
export function isolate(lhs0, v, rhs0 = num(0)) {
  let lhs = unwrap(lhs0), rhs = rhs0;
  for (let guard = 0; guard < 40; guard++) {
    if (lhs.isSymbolNode && lhs.name === v) return rhs;
    if (lhs.isParenthesisNode) { lhs = unwrap(lhs); continue; }
    if (lhs.isOperatorNode) {
      const [a, b] = lhs.args.map(unwrap);
      const inA = has(a, v), inB = b ? has(b, v) : false;
      if (inA && inB) return null;
      switch (lhs.fn) {
        case 'unaryMinus': rhs = neg(paren(rhs)); lhs = a; continue;
        case 'unaryPlus': lhs = a; continue;
        case 'add': rhs = add(rhs, neg(paren(inA ? b : a))); lhs = inA ? a : b; continue;
        case 'subtract': if (inA) { rhs = add(rhs, b); lhs = a; } else { rhs = add(a, neg(paren(rhs))); lhs = b; } continue;
        case 'multiply': rhs = div(paren(rhs), paren(inA ? b : a)); lhs = inA ? a : b; continue;
        case 'divide': if (inA) { rhs = mul(paren(rhs), paren(b)); lhs = a; } else { rhs = div(paren(a), paren(rhs)); lhs = b; } continue;
        case 'pow':
          if (inA) { rhs = pow(paren(rhs), div(num(1), paren(b))); lhs = a; } else { rhs = div(fn('log', rhs), fn('log', a)); lhs = b; }
          if (!inA && a.isSymbolNode && a.name === 'e') rhs = fn('log', rhs.args[0].args[0]);
          continue;
        default: return null;
      }
    }
    if (lhs.isFunctionNode) {
      const a = unwrap(lhs.args[0]);
      const inv = { exp: 'log', log: 'exp', sqrt: null, sin: 'asin', cos: 'acos', tan: 'atan', asin: 'sin', acos: 'cos', atan: 'tan', sinh: 'asinh', cosh: 'acosh', tanh: 'atanh' }[lhs.fn.name];
      if (lhs.fn.name === 'sqrt') { rhs = pow(paren(rhs), num(2)); lhs = a; continue; }
      if (lhs.fn.name === 'log' && lhs.args.length === 1) { rhs = fn('exp', rhs); lhs = a; continue; }
      if (!inv || lhs.args.length !== 1) return null;
      rhs = fn(inv, rhs); lhs = a;
      continue;
    }
    return null;
  }
  return null;
}

/** Reads one equation "left = right" (or an expression = 0) as L − R. */
export function readEq(text, label = 'The equation', extra = []) {
  const raw = String(text ?? '').replace(/[−–]/g, '-').replace(/∂z\/∂x|dz\/dx|z_x/g, 'p').replace(/∂z\/∂y|dz\/dy|z_y/g, 'q')
    // x(y − z) is a product, not a function x
    .replace(/(?<![a-zA-Z])([xyzpq])\s*\(/g, '$1*(').trim();
  if (!raw) throw new EngineError(`${label} is empty.`);
  const sides = raw.split('=');
  if (sides.length > 2) throw new EngineError(`${label}: use one = sign.`);
  const L = readMulti(sides[0], label, extra);
  const R = sides.length === 2 ? readMulti(sides[1], label, extra) : num(0);
  return { L, R, G: tidy(add(L, neg(paren(R)))) };
}

/** Coefficients c_0 … c_max of node as a polynomial in v (each may contain other letters), or null if the degree is higher. */
export function coeffsIn(node, v, max, letters) {
  const out = [];
  let d = node, fact = 1;
  for (let k = 0; k <= max + 1; k++) {
    if (k > 1) fact *= k;
    const c = substitute(d, v, num(0));
    if (k === max + 1) { if (!zeroAt(d, letters)) return null; break; }
    out.push(tidyMulti(div(c, num(fact)), letters.filter((s) => s !== v)));
    try { d = math.derivative(d, v); } catch { return null; }
  }
  while (out.length > 1 && zeroAt(out.at(-1), letters)) out.pop();
  return out;
}

/** f(x, y) on a small patch: a polynomial of degree ≤ 2 in x and y (or that over x or y)? → node, else null. */
export function fitPoly2(f, check) {
  const mons = [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2]];
  const pts = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pts.push([1.2 + 0.17 * i + 0.03 * j, 0.45 + 0.11 * j + 0.02 * i]);
  for (const [over, mk] of [['', (x, y) => 1], ['x', (x) => x], ['y', (x, y) => y]]) {
    const rows = pts.map(([x, y]) => mons.map(([a, b]) => x ** a * y ** b));
    const ys = pts.map(([x, y]) => f(x, y) * mk(x, y));
    if (!ys.every(Number.isFinite)) return null;
    // least squares via normal equations
    const n = mons.length;
    const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
    const bv = Array.from({ length: n }, (_, i) => rows.reduce((s, r, k) => s + r[i] * ys[k], 0));
    const c = gaussSolve(A, bv);
    if (!c) continue;
    const cs = c.map(snap);
    let node = null;
    mons.forEach(([a, b], i) => {
      if (Math.abs(cs[i]) < 1e-9) return;
      const t = mul(numNode(cs[i]), mul(a ? pow(sym('x'), num(a)) : num(1), b ? pow(sym('y'), num(b)) : num(1)));
      node = node ? add(node, t) : t;
    });
    node = node || num(0);
    if (over) node = div(paren(node), sym(over));
    node = tidyMulti(node, ['x', 'y']);
    if (check(node)) return node;
  }
  return null;
}
function gaussSolve(A0, b0) {
  const n = b0.length, M = A0.map((r, i) => [...r, b0[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    if (Math.abs(M[p][i]) < 1e-12) return null;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** The functions of v in node's terms, without their number factors: 3e^{t} − 2sin 2t → [e^{t}, sin 2t]. */
function units(node, v) {
  const out = [];
  const go = (t) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0]); go(x.args[1]); return; } if (x.isOperatorNode && x.fn === 'unaryMinus') { go(x.args[0]); return; }
    const fs = []; const fl = (z) => { const y = unwrap(z); if (y.isOperatorNode && y.fn === 'multiply') y.args.forEach(fl); else if (y.isOperatorNode && y.fn === 'divide' && !has(y.args[1], v)) fl(y.args[0]); else fs.push(y); };
    fl(x);
    const keep = fs.filter((f) => has(f, v));
    out.push(keep.length ? keep.reduce((a, b) => mul(a, b)) : num(1)); };
  let e = node;
  try { e = distribute(node); } catch { /* keep */ }
  go(e);
  return out;
}
/** node as Σ cₖ·uₖ over the functions found in the seeds (and their derivatives), fitted exactly and checked; else null. */
export function collectOnto(node, seeds, v = 't') {
  const us = [];
  for (const sd of seeds) for (const u of units(sd, v)) {
    for (const w of [u, (() => { try { return math.derivative(u, v); } catch { return null; } })()]) {
      if (!w) continue;
      for (const z of units(w, v)) if (!us.some((q) => sameAt(q, z, [v], 1e-9))) us.push(z);
    }
  }
  if (!us.length || us.length > 10) return null;
  const xs = Array.from({ length: 16 }, (_, i) => 0.15 + 0.17 * i);
  const rows = xs.map((x) => us.map((u) => evalAt(u, { [v]: x })));
  const ys = xs.map((x) => evalAt(node, { [v]: x }));
  if (!ys.every(Number.isFinite) || !rows.flat().every(Number.isFinite)) return null;
  const n = us.length;
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
  const b = Array.from({ length: n }, (_, i) => rows.reduce((s, r, k) => s + r[i] * ys[k], 0));
  const c = gaussSolve(A, b);
  if (!c) return null;
  let out = null;
  c.map(snap).forEach((k, i) => { if (Math.abs(k) < 1e-10) return; const t = mul(numNode(k), us[i]); out = out ? add(out, t) : t; });
  out = out ? tidy(out) : num(0);
  return sameAt(out, node, [v], 1e-8) ? out : null;
}

// ---------- exact rational normal form in several letters ----------
// polynomial: Map "x^2*y" → coefficient; rational: { n, d }
const mkey = (m) => Object.keys(m).sort().filter((k) => m[k]).map((k) => (m[k] === 1 ? k : `${k}^${m[k]}`)).join('*');
const parseKey = (k) => (k ? Object.fromEntries(k.split('*').map((t) => { const [v, e] = t.split('^'); return [v, e ? Number(e) : 1]; })) : {});
const pc = (c) => new Map([['', c]]);
const pAdd = (a, b, s = 1) => { const r = new Map(a); for (const [k, v] of b) { const w = (r.get(k) || 0) + s * v; if (Math.abs(w) < 1e-12) r.delete(k); else r.set(k, w); } return r; };
const pMul = (a, b) => { let r = new Map(); for (const [k1, v1] of a) for (const [k2, v2] of b) { const m = parseKey(k1), n = parseKey(k2); for (const [v, e] of Object.entries(n)) m[v] = (m[v] || 0) + e; r = pAdd(r, new Map([[mkey(m), v1 * v2]])); } return r; };
const rat = (n, d = pc(1)) => ({ n, d });
const rAdd = (a, b, s = 1) => rat(pAdd(pMul(a.n, b.d), pMul(b.n, a.d), s), pMul(a.d, b.d));
const rMul = (a, b) => rat(pMul(a.n, b.n), pMul(a.d, b.d));
function toRat(node) {
  const x = unwrap(node);
  if (x.isConstantNode) return rat(pc(Number(x.value)));
  if (x.isSymbolNode) { if (x.name === 'pi' || x.name === 'e') return null; return rat(new Map([[x.name, 1]])); }
  if (x.isOperatorNode) {
    const a = x.args.map(toRat);
    if (a.some((t) => !t)) return null;
    switch (x.fn) {
      case 'add': return rAdd(a[0], a[1]);
      case 'subtract': return rAdd(a[0], a[1], -1);
      case 'unaryMinus': return rat(pAdd(new Map(), a[0].n, -1), a[0].d);
      case 'unaryPlus': return a[0];
      case 'multiply': return a.reduce(rMul);
      case 'divide': return rMul(a[0], rat(a[1].d, a[1].n));
      case 'pow': {
        const e = unwrap(x.args[1]);
        if (!e.isConstantNode && !(e.isOperatorNode && e.fn === 'unaryMinus' && unwrap(e.args[0]).isConstantNode)) return null;
        let k = Number(e.isConstantNode ? e.value : -unwrap(e.args[0]).value);
        if (!Number.isInteger(k) || Math.abs(k) > 8) return null;
        let base = a[0];
        if (k < 0) { base = rat(base.d, base.n); k = -k; }
        let r = rat(pc(1));
        for (let i = 0; i < k; i++) r = rMul(r, base);
        return r;
      }
      default: return null;
    }
  }
  return null;
}
/** Cancel the common monomial and the number factor, make the bottom's first coefficient positive. */
function cancel({ n, d }) {
  if (!n.size) return rat(new Map(), pc(1));
  const keys = [...n.keys(), ...d.keys()].map(parseKey);
  const vars = [...new Set(keys.flatMap((m) => Object.keys(m)))];
  const minE = {}; for (const v of vars) { const en = Math.min(...[...n.keys()].map((k) => parseKey(k)[v] || 0)); const ed = Math.min(...[...d.keys()].map((k) => parseKey(k)[v] || 0)); minE[v] = Math.min(en, ed); }
  const strip = (P) => new Map([...P].map(([k, v]) => { const m = parseKey(k); for (const w of vars) if (minE[w]) m[w] -= minE[w]; return [mkey(m), v]; }));
  let N = strip(n), D = strip(d);
  // the bottom's coefficients over their first: divide both by it
  const lead = [...D.values()][0];
  N = new Map([...N].map(([k, v]) => [k, snap(v / lead)])); D = new Map([...D].map(([k, v]) => [k, snap(v / lead)]));
  return rat(N, D);
}
const polyNodeM = (P) => {
  let out = null;
  const entries = [...P].sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]));
  for (const [k, v] of entries) {
    const m = parseKey(k);
    let t = null;
    for (const [w, e] of Object.entries(m)) { const f = e === 1 ? sym(w) : pow(sym(w), num(e)); t = t ? mul(t, f) : f; }
    const c = Math.abs(v);
    const cn = numNode(c);
    t = t ? (Math.abs(c - 1) < 1e-12 ? t : mul(cn, t)) : cn;
    out = out ? (v < 0 ? new math.OperatorNode('-', 'subtract', [out, t]) : add(out, t)) : (v < 0 ? neg(t) : t);
  }
  return out || num(0);
};
/** node in lowest terms as one fraction of expanded polynomials, or null if it is not rational in its letters. */
export function rationalNormal(node) {
  const r = toRat(node);
  if (!r) return null;
  const c = cancel(r);
  const N = polyNodeM(c.n);
  const onlyOne = c.d.size === 1 && c.d.has('') && Math.abs(c.d.get('') - 1) < 1e-12;
  return onlyOne ? N : div(paren(N), paren(polyNodeM(c.d)));
}

/** node = N/D with whole-number coefficients in both (D = 1 when it is a polynomial), or null. */
export function fractionParts(node) {
  const r = toRat(node);
  if (!r) return null;
  const c = cancel(r);
  const g = (a, b) => (b ? g(b, a % b) : a);
  let L = 1;
  for (const v of [...c.n.values(), ...c.d.values()]) { const f = toFraction(v, 1000, 1e-9); if (!f) return null; L = (L * f.d) / g(L, f.d); }
  const scale = (P) => new Map([...P].map(([k, v]) => [k, Math.round(v * L)]));
  return { N: polyNodeM(scale(c.n)), D: polyNodeM(scale(c.d)) };
}

/** The shortest of a few equal forms (tidy, simplify, rationalize), checked to be equal. */
export function nicest(node, letters) {
  const cands = [];
  const tryAdd = (f) => { try { const n = f(); if (n) cands.push(n); } catch { /* skip */ } };
  tryAdd(() => rationalNormal(node));
  // a polynomial written out term by term with fraction coefficients: x³/6 + x²y/2
  tryAdd(() => { const r = toRat(node); if (!r) return null; const c = cancel(r); if (!(c.d.size === 1 && c.d.has(''))) return null; const k = c.d.get(''); return polyNodeM(new Map([...c.n].map(([m, v]) => [m, snap(v / k)]))); });
  tryAdd(() => tidyMulti(node, letters));
  if (node.toString().length < 160) tryAdd(() => math.simplify(node));
  let best = null, bestLen = Infinity;
  for (const c of cands) {
    if (!sameAt(c, node, letters, 1e-8)) continue;
    const str = c.toString().replace(/\s/g, '');
    const len = str.length + 2 * (str.split('(').length - 1);
    if (len < bestLen) { best = c; bestLen = len; }
  }
  return best || node;
}

/** u^(1/2) → √u, u^(−1/2) → 1/√u, u^(3/2) → u√u: square roots the way textbooks print them. */
export function sqrtForm(node) {
  return node.transform((m) => {
    if (!(m.isOperatorNode && m.fn === 'pow')) return m;
    const e = evalAt(m.args[1], {});
    if (!Number.isFinite(e) || Math.abs(e * 2 - Math.round(e * 2)) > 1e-12 || Number.isInteger(e)) return m;
    const base = sqrtForm(m.args[0]);
    const root = fn('sqrt', unwrap(base));
    const k = Math.round(e - 0.5);
    if (k === 0) return root;
    if (k === -1) return div(num(1), root);
    if (k > 0) return mul(k === 1 ? paren(base) : pow(paren(base), num(k)), root);
    return div(num(1), mul(pow(paren(base), num(-k - 1)), root));
  });
}

/** A polynomial in several letters as [{ pow: { x: 2, … }, c }], or null if it is not one. */
export function polyTerms(node) {
  const r = toRat(node);
  if (!r) return null;
  const c = cancel(r);
  if (!(c.d.size === 1 && c.d.has(''))) return null;
  const k = c.d.get('');
  return [...c.n].map(([m, v]) => ({ pow: parseKey(m), c: v / k }));
}
