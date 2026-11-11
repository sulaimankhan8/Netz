/**
 * Complex variables (Unit 14), shared by the Batch 4 group 4A pages.
 *   readZ(text)          f(z) as a math.js node; i (or j) is √−1; z̄ as conj(z); |z| as abs(z)
 *   parts(node)          { u, v } with f = u(x, y) + i v(x, y), z = x + iy:
 *                          rational f exactly (u + iv = N·D̄ / |D|², expanded), else by the formulas for
 *                          eᶻ, sin, cos, sinh, cosh, log, conj, abs, Re, Im (checked numerically)
 *   C, cx                complex numbers (math.js) and helpers; cTex(c) exact LaTeX of a complex number
 *   polyZ(node)          coefficients of a polynomial in z with complex coefficients, or null
 *   rationalZ(node)      { N, D } complex polynomials, or null
 *   rootsZ(coeffs)       roots with multiplicity (Durand–Kerner, clustered and snapped)
 *   poles(node)          poles of f = A(z)/B(z) (B a polynomial): [{ a, order }]
 *   residue(node, a, m)  residue at a pole of order m: (1/(m−1)!) d^{m−1}/dz^{m−1}[(z − a)^m f] at z = a
 *   laurentTerms(...)    see laurent-series engine
 * Every value shown is computed with math.js complex numbers and written exactly when it is a simple
 * number (fractions, √k, π, e) via exactTex.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, sub, mul, div, pow, neg, paren, unwrap, polish, tidy, tex } from './tree';
import { tidyMulti, exactTex, mtex } from './multi';

export const C = (re, im = 0) => math.complex(re, im);
const ZERO = C(0, 0), ONE = C(1, 0);
const cadd = (a, b) => math.add(a, b), cmul = (a, b) => math.multiply(a, b), csub = (a, b) => math.subtract(a, b), cdiv = (a, b) => math.divide(a, b);
const asC = (v) => (typeof v === 'number' ? C(v, 0) : v);
const small = (c) => Math.hypot(c.re, c.im) < 1e-12;
const snapN = (v) => { if (Math.abs(v) < 1e-10) return 0; const f = toFraction(v, 1000, 1e-9); return f ? f.n / f.d : v; };
export const snapC = (c) => C(snapN(c.re), snapN(c.im));

/** LaTeX for a complex number: 3, −2i, 1 + 2i, \frac{1}{2} - \frac{\sqrt{3}}{2}i, πi … */
export function cTex(c0) {
  const c = snapC(asC(c0));
  const re = Math.abs(c.re) < 1e-10 ? 0 : c.re, im = Math.abs(c.im) < 1e-10 ? 0 : c.im;
  // \pi then i needs a space (\pii is not a command); a fraction takes the i after it
  const imPart = (v) => { const t = exactTex(Math.abs(v)); return t === '1' ? 'i' : /[+-]/.test(t.slice(1)) ? `\\left(${t}\\right)i` : /[a-zA-Z}]$/.test(t) ? `${t}\\,i` : `${t}i`; };
  if (!im) return exactTex(re);
  if (!re) return `${im < 0 ? '-' : ''}${imPart(im)}`;
  return `${exactTex(re)} ${im < 0 ? '-' : '+'} ${imPart(im)}`;
}
/** Plain text for a complex number (notes): 1 + 2i. */
export const cText = (c0) => { const c = snapC(asC(c0)); const r = Number(c.re.toPrecision(6)), i = Number(c.im.toPrecision(6)); return i === 0 ? `${r}` : r === 0 ? `${i}i` : `${r} ${i < 0 ? '−' : '+'} ${Math.abs(i)}i`; };

// ---------- reading ----------
const ALLOWED = new Set(['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'sqrt', 'conj', 'abs', 're', 'im', 'cot', 'sec', 'csc']);
/** f(z) as typed: 2z^2 + i z, e^z/(z^2 + 1), z conj(z); "z̄" and "zbar" mean conj(z); j means i. */
export function readZ(text, label = 'f(z)', letters = ['z']) {
  const raw = String(text ?? '').trim();
  if (!raw) throw new EngineError(`${label} is empty.`);
  const s = raw
    .replace(/z̄|\bzbar\b|\\bar\{z\}/g, 'conj(z)').replace(/\|([^|]+)\|/g, 'abs($1)')
    .replace(/π/g, 'pi').replace(/[−–]/g, '-').replace(/·|×/g, '*').replace(/\bln\s*\(/g, 'log(').replace(/\bRe\s*\(/g, 're(').replace(/\bIm\s*\(/g, 'im(')
    .replace(/\bj\b/g, 'i')
    // 2z, 3i, zi, iz, z(…) → products
    .replace(/(\d)\s*([a-z(])/gi, '$1*$2').replace(/\b(z|i)\s*(?=[a-z(])(?!\w*\()/g, '$1*').replace(/\)\s*(?=[a-z0-9(])/gi, ')*')
    .replace(/\b(z|i|x|y)\s*\(/g, '$1*(');
  let node;
  try { node = math.parse(s); } catch { throw new EngineError(`${label}: "${raw}" could not be read. Use ^ for powers and brackets for functions, e.g. e^z/(z^2 + 1).`); }
  node.traverse((n) => {
    if (n.isFunctionNode && !ALLOWED.has(n.fn.name)) throw new EngineError(`${label}: "${n.fn.name}" is not a function this page knows (use sin, cos, exp, log, sinh, cosh, conj, abs).`);
    if (n.isSymbolNode && !n.isFunctionNode && ![...letters, 'i', 'pi', 'e'].includes(n.name) && !ALLOWED.has(n.name)) throw new EngineError(`${label} may use only ${letters.join(', ')} (and i, π, e); it uses ${n.name}.`);
  });
  return node;
}

// ---------- complex polynomials in z ----------
/** Coefficients (ascending, complex) of a polynomial in z, or null. */
export function polyZ(node) {
  const go = (n) => {
    const x = unwrap(n);
    if (x.isConstantNode && typeof x.value === 'number') return [C(x.value)];
    if (x.isSymbolNode) {
      if (x.name === 'z') return [ZERO, ONE];
      if (x.name === 'i') return [C(0, 1)];
      if (x.name === 'pi') return [C(Math.PI)];
      if (x.name === 'e') return [C(Math.E)];
      return null;
    }
    if (x.isFunctionNode) {
      if (x.args.some((a) => !free(a))) return null;
      try { return [asC(x.evaluate({}))]; } catch { return null; }
    }
    if (!x.isOperatorNode) return null;
    const a = x.args.map(go);
    if (a.some((p) => p === null)) return null;
    switch (x.fn) {
      case 'unaryMinus': return a[0].map((c) => cmul(c, C(-1)));
      case 'unaryPlus': return a[0];
      case 'add': return addP(a[0], a[1]);
      case 'subtract': return addP(a[0], a[1].map((c) => cmul(c, C(-1))));
      case 'multiply': return a.reduce(mulP);
      case 'divide': return a[1].length === 1 && !small(a[1][0]) ? a[0].map((c) => cdiv(c, a[1][0])) : null;
      case 'pow': {
        if (a[1].length !== 1 || Math.abs(a[1][0].im) > 1e-12) return null;
        const k = a[1][0].re;
        if (!Number.isInteger(k) || k < 0 || k > 12) return null;
        let r = [ONE];
        for (let t = 0; t < k; t++) r = mulP(r, a[0]);
        return r;
      }
      default: return null;
    }
  };
  const r = go(node);
  return r ? trimP(r) : null;
}
const free = (n) => { let f = true; n.traverse((m) => { if (m.isSymbolNode && m.name === 'z') f = false; }); return f; };
const trimP = (p) => { const q = [...p]; while (q.length > 1 && small(q[q.length - 1])) q.pop(); return q; };
export const addP = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => cadd(p[i] || ZERO, q[i] || ZERO));
export const mulP = (p, q) => { const r = Array.from({ length: p.length + q.length - 1 }, () => ZERO); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] = cadd(r[i + j], cmul(a, b)); })); return r; };
export const evalP = (p, z) => p.reduceRight((acc, c) => cadd(cmul(acc, z), c), ZERO);
export const derivP = (p) => p.slice(1).map((c, i) => cmul(c, C(i + 1)));
/** p ÷ (z − a)^m (exact division expected). */
export function divLinear(p, a, m = 1) {
  let q = trimP(p);
  for (let t = 0; t < m; t++) {
    const out = new Array(q.length - 1).fill(ZERO);
    let carry = ZERO;
    for (let i = q.length - 1; i >= 1; i--) { carry = cadd(q[i], cmul(carry, a)); out[i - 1] = carry; }
    q = out;
  }
  return q;
}

/** f as N(z)/D(z) with complex polynomial N and D, or null (one fraction on top level). */
export function rationalZ(node) {
  const go = (n) => {
    const x = unwrap(n);
    const p = polyZ(x);
    if (p) return { N: p, D: [ONE] };
    if (!x.isOperatorNode) return null;
    const a = x.args.map(go);
    if (a.some((r) => r === null)) return null;
    switch (x.fn) {
      case 'unaryMinus': return { N: a[0].N.map((c) => cmul(c, C(-1))), D: a[0].D };
      case 'add': return { N: addP(mulP(a[0].N, a[1].D), mulP(a[1].N, a[0].D)), D: mulP(a[0].D, a[1].D) };
      case 'subtract': return { N: addP(mulP(a[0].N, a[1].D), mulP(a[1].N, a[0].D).map((c) => cmul(c, C(-1)))), D: mulP(a[0].D, a[1].D) };
      case 'multiply': return a.reduce((p, q) => ({ N: mulP(p.N, q.N), D: mulP(p.D, q.D) }));
      case 'divide': return { N: mulP(a[0].N, a[1].D), D: mulP(a[0].D, a[1].N) };
      case 'pow': {
        // the power may be written −2 (a negation node), so evaluate it
        let kv = NaN;
        try { const e = x.args[1].evaluate({}); kv = typeof e === 'number' ? e : NaN; } catch { kv = NaN; }
        if (!(Number.isInteger(kv) && Math.abs(kv) <= 12)) return null;
        let r = { N: [ONE], D: [ONE] };
        for (let t = 0; t < Math.abs(kv); t++) r = { N: mulP(r.N, a[0].N), D: mulP(r.D, a[0].D) };
        return kv < 0 ? { N: r.D, D: r.N } : r;
      }
      default: return null;
    }
  };
  const r = go(node);
  return r ? { N: trimP(r.N), D: trimP(r.D) } : null;
}

/** Roots of a complex polynomial (ascending), with multiplicity. */
export function rootsZ(coeffs) {
  const c = trimP(coeffs);
  const n = c.length - 1;
  if (n < 1) return [];
  const lead = c[n];
  const a = c.map((v) => cdiv(v, lead)); // monic, ascending
  let zs = Array.from({ length: n }, (_, k) => C(0.4 * Math.cos((2 * Math.PI * k) / n + 0.3), 0.9 * Math.sin((2 * Math.PI * k) / n + 0.3)));
  for (let it = 0; it < 3000; it++) {
    let moved = 0;
    zs = zs.map((zi, i) => {
      let den = ONE;
      zs.forEach((zj, j) => { if (j !== i) den = cmul(den, csub(zi, zj)); });
      const step = cdiv(evalP(a, zi), den);
      moved = Math.max(moved, math.abs(step));
      return csub(zi, step);
    });
    if (moved < 1e-15) break;
  }
  // cluster repeated roots, refine on the derivative, snap
  const groups = [];
  for (const r of zs) {
    const g = groups.find((q) => math.abs(csub(cdiv(q.sum, C(q.m)), r)) < 2e-3);
    if (g) { g.m++; g.sum = cadd(g.sum, r); } else groups.push({ sum: r, m: 1 });
  }
  return groups.map((g) => {
    let z = cdiv(g.sum, C(g.m));
    let d = a;
    for (let k = 1; k < g.m; k++) d = derivP(d);
    const dd = derivP(d);
    for (let it = 0; it < 50 && dd.length; it++) { const den = evalP(dd, z); if (small(den)) break; const step = cdiv(evalP(d, z), den); z = csub(z, step); if (math.abs(step) < 1e-15) break; }
    return { a: snapC(z), order: g.m };
  }).sort((p, q) => p.a.re - q.a.re || p.a.im - q.a.im);
}

// ---------- u + iv ----------
// Polynomials in x, y with complex coefficients: Map "i,j" → C (xⁱyʲ)
const pAdd = (p, q, k = ONE) => { const r = new Map(p); q.forEach((v, key) => r.set(key, cadd(r.get(key) || ZERO, cmul(k, v)))); return r; };
const pMul = (p, q) => { let r = new Map(); p.forEach((a, k1) => q.forEach((b, k2) => { const [i1, j1] = k1.split(',').map(Number), [i2, j2] = k2.split(',').map(Number); r = pAdd(r, new Map([[`${i1 + i2},${j1 + j2}`, cmul(a, b)]])); })); return r; };
const pConj = (p) => new Map([...p].map(([k, v]) => [k, math.conj(v)]));
/** A polynomial in z (complex coefficients) at z = x + iy, as a polynomial in x, y. */
function atXY(coeffs) {
  const Z = new Map([['1,0', ONE], ['0,1', C(0, 1)]]);
  let pw = new Map([['0,0', ONE]]), out = new Map();
  coeffs.forEach((c, k) => { if (k) pw = pMul(pw, Z); if (!small(c)) out = pAdd(out, pw, c); });
  return out;
}
/** Real polynomial map → node in x, y (exact coefficients). */
function polyNodeXY(map) {
  const terms = [...map].filter(([, v]) => Math.abs(v) > 1e-12).map(([k, v]) => { const [i, j] = k.split(',').map(Number); return { i, j, v: snapN(v) }; })
    .sort((a, b) => b.i + b.j - (a.i + a.j) || b.i - a.i);
  if (!terms.length) return num(0);
  const mono = ({ i, j }) => [i ? (i === 1 ? sym('x') : pow(sym('x'), num(i))) : null, j ? (j === 1 ? sym('y') : pow(sym('y'), num(j))) : null].filter(Boolean);
  const coefNode = (v) => { const f = toFraction(Math.abs(v), 1000, 1e-9); return f ? (f.d === 1 ? num(f.n) : div(num(f.n), num(f.d))) : num(Number(Math.abs(v).toPrecision(10))); };
  return terms.reduce((acc, t, idx) => {
    const m = mono(t);
    const absOne = Math.abs(Math.abs(t.v) - 1) < 1e-12;
    const body = m.length ? (absOne ? m.reduce((p, q) => mul(p, q)) : [coefNode(t.v), ...m].reduce((p, q) => mul(p, q))) : coefNode(t.v);
    if (idx === 0) return t.v < 0 ? neg(body) : body;
    return t.v < 0 ? sub(acc, body) : add(acc, body);
  }, null);
}
const realMap = (p) => new Map([...p].map(([k, v]) => [k, v.re]));
const imagMap = (p) => new Map([...p].map(([k, v]) => [k, v.im]));

/** f(z) → { u, v, how } with nodes in x and y (in textbook order: 2xy, not 2x·y). */
export function parts(node) {
  const p = partsRaw(node);
  return { ...p, u: polish(tidy(p.u)), v: polish(tidy(p.v)) };
}
function partsRaw(node) {
  const r = rationalZ(node);
  if (r) {
    const N = atXY(r.N), D = atXY(r.D);
    if (r.D.length === 1) {
      const d = r.D[0];
      const scaled = new Map([...N].map(([k, v]) => [k, cdiv(v, d)]));
      return { u: polyNodeXY(realMap(scaled)), v: polyNodeXY(imagMap(scaled)), how: 'polynomial' };
    }
    const top = pMul(N, pConj(D)), bottom = pMul(D, pConj(D));
    const den = polyNodeXY(realMap(bottom));
    return { u: div(polyNodeXY(realMap(top)), den), v: div(polyNodeXY(imagMap(top)), den), how: 'rational', denominator: den };
  }
  const [u, v] = generalParts(node);
  return { u: tidyMulti(u, ['x', 'y']), v: tidyMulti(v, ['x', 'y']), how: 'formulas' };
}

/** u + iv by the formulas (any f built from z, i, numbers, + − × ÷, integer powers and the functions). */
function generalParts(node) {
  const X = sym('x'), Y = sym('y'), Z0 = num(0);
  const isZ = (n) => n.isConstantNode && n.value === 0;
  const A = (p, q) => (isZ(p) ? q : isZ(q) ? p : add(p, q));
  const M = (p, q) => (isZ(p) || isZ(q) ? Z0 : mul(p, q));
  const S = (p, q) => (isZ(q) ? p : isZ(p) ? neg(q) : sub(p, q));
  const go = (n) => {
    const x = unwrap(n);
    if (x.isConstantNode) return [x, Z0];
    if (x.isSymbolNode) {
      if (x.name === 'z') return [X, Y];
      if (x.name === 'i') return [Z0, num(1)];
      return [x, Z0];
    }
    if (x.isFunctionNode) {
      const [a, b] = go(x.args[0]);
      const real = isZ(b);
      switch (x.fn.name) {
        case 'exp': return real ? [fn('exp', a), Z0] : [M(fn('exp', a), fn('cos', b)), M(fn('exp', a), fn('sin', b))];
        case 'sin': return real ? [fn('sin', a), Z0] : [M(fn('sin', a), fn('cosh', b)), M(fn('cos', a), fn('sinh', b))];
        case 'cos': return real ? [fn('cos', a), Z0] : [M(fn('cos', a), fn('cosh', b)), neg(M(fn('sin', a), fn('sinh', b)))];
        case 'sinh': return real ? [fn('sinh', a), Z0] : [M(fn('sinh', a), fn('cos', b)), M(fn('cosh', a), fn('sin', b))];
        case 'cosh': return real ? [fn('cosh', a), Z0] : [M(fn('cosh', a), fn('cos', b)), M(fn('sinh', a), fn('sin', b))];
        case 'log': return [div(fn('log', add(pow(paren(a), num(2)), pow(paren(b), num(2)))), num(2)), fn('atan2', b, a)];
        case 'conj': return [a, isZ(b) ? Z0 : neg(b)];
        case 'abs': return [fn('sqrt', add(pow(paren(a), num(2)), pow(paren(b), num(2)))), Z0];
        case 're': return [a, Z0];
        case 'im': return [b, Z0];
        case 'sqrt': return go(math.parse(`exp(log(${x.args[0].toString()})/2)`));
        case 'tan': case 'cot': case 'sec': case 'csc': {
          const rewrite = { tan: 'sin(w)/cos(w)', cot: 'cos(w)/sin(w)', sec: '1/cos(w)', csc: '1/sin(w)' }[x.fn.name].replace(/w/g, `(${x.args[0].toString()})`);
          return go(math.parse(rewrite));
        }
        default: throw new EngineError(`${x.fn.name} is not supported here.`);
      }
    }
    if (!x.isOperatorNode) throw new EngineError('Could not read this function.');
    if (x.fn === 'unaryMinus') { const [a, b] = go(x.args[0]); return [isZ(a) ? Z0 : neg(a), isZ(b) ? Z0 : neg(b)]; }
    const [[a, b], [c, d]] = x.args.map(go);
    switch (x.fn) {
      case 'add': return [A(a, c), A(b, d)];
      case 'subtract': return [S(a, c), S(b, d)];
      case 'multiply': return [S(M(a, c), M(b, d)), A(M(a, d), M(b, c))];
      case 'divide': {
        if (isZ(d)) return [isZ(a) ? Z0 : div(a, paren(c)), isZ(b) ? Z0 : div(b, paren(c))];
        const den = add(pow(paren(c), num(2)), pow(paren(d), num(2)));
        return [div(A(M(a, c), M(b, d)), den), div(S(M(b, c), M(a, d)), den)];
      }
      case 'pow': {
        const k = unwrap(x.args[1]);
        // e^w is exp(w), not w-power of e by logs
        if (unwrap(x.args[0]).isSymbolNode && unwrap(x.args[0]).name === 'e') return go(fn('exp', x.args[1]));
        if (k.isConstantNode && Number.isInteger(k.value) && Math.abs(k.value) <= 8) {
          let r = [num(1), Z0];
          for (let t = 0; t < Math.abs(k.value); t++) r = [S(M(r[0], a), M(r[1], b)), A(M(r[0], b), M(r[1], a))];
          if (k.value >= 0) return r;
          const den = add(pow(paren(r[0]), num(2)), pow(paren(r[1]), num(2)));
          return [div(r[0], den), div(neg(r[1]), den)];
        }
        // w^p = e^{p log w}
        return go(math.parse(`exp((${x.args[1].toString()}) * log(${x.args[0].toString()}))`));
      }
      default: throw new EngineError('Could not read this function.');
    }
  };
  return go(node);
}

/** Does u + iv equal f(x + iy) at a few points? */
export function checkParts(node, u, v) {
  const pts = [[0.37, 0.81], [1.23, -0.44], [-0.71, 0.29], [0.52, 1.17]];
  let n = 0;
  for (const [x, y] of pts) {
    let fz, uu, vv;
    try { fz = asC(node.evaluate({ z: C(x, y) })); uu = u.evaluate({ x, y }); vv = v.evaluate({ x, y }); } catch { continue; }
    if (![fz.re, fz.im, uu, vv].every(Number.isFinite)) continue;
    n++;
    if (Math.abs(fz.re - uu) > 1e-7 * Math.max(1, Math.abs(uu)) || Math.abs(fz.im - vv) > 1e-7 * Math.max(1, Math.abs(vv))) return false;
  }
  return n >= 2;
}

// ---------- poles and residues ----------
/** f = A/B at the top level (B a polynomial in z): { A, B (coeffs) }, or null. */
export function splitTop(node) {
  const x = unwrap(node);
  const r = rationalZ(x);
  if (r) {
    // cancel common factors (z − a) first, so residues never see 0/0
    let N = r.N, D = r.D;
    for (const root of rootsZ(D)) {
      for (let k = 0; k < root.order && N.length > 1 && small(evalP(N, root.a)) && D.length > 1; k++) { N = divLinear(N, root.a); D = divLinear(D, root.a); }
    }
    return { A: null, Apoly: N, B: D };
  }
  if (x.isOperatorNode && x.fn === 'divide') {
    const B = polyZ(x.args[1]);
    if (B) return { A: x.args[0], B };
    const inner = splitTop(x.args[0]);
    if (inner && polyZ(x.args[1])) return { ...inner, B: mulP(inner.B, polyZ(x.args[1])) };
  }
  if (x.isOperatorNode && x.fn === 'multiply') {
    // g(z) · 1/B(z) or g(z) · (B(z))^(−k)
    for (let i = 0; i < x.args.length; i++) {
      const s = splitTop(x.args[i]);
      if (s && s.B.length > 1) {
        const rest = x.args.filter((_, j) => j !== i);
        const others = rest.reduce((p, q) => mul(p, q));
        return { A: s.A ? mul(others, s.A) : s.Apoly ? mul(others, polyNodeZ(s.Apoly)) : others, B: s.B };
      }
    }
  }
  if (x.isOperatorNode && x.fn === 'pow') {
    const k = unwrap(x.args[1]);
    const B = polyZ(x.args[0]);
    if (B && k.isConstantNode && Number.isInteger(k.value) && k.value < 0) {
      let P = [ONE];
      for (let t = 0; t < -k.value; t++) P = mulP(P, B);
      return { A: num(1), B: P };
    }
  }
  return null;
}
/** Complex polynomial → node in z (coefficients exact where simple). */
export function polyNodeZ(coeffs) {
  const terms = [];
  coeffs.forEach((c0, k) => {
    const c = snapC(c0);
    if (small(c)) return;
    const coefNode = Math.abs(c.im) < 1e-12 ? numNodeExact(c.re) : Math.abs(c.re) < 1e-12 ? mul(numNodeExact(c.im), sym('i')) : paren(add(numNodeExact(c.re), mul(numNodeExact(c.im), sym('i'))));
    const zk = k === 0 ? null : k === 1 ? sym('z') : pow(sym('z'), num(k));
    terms.push(zk ? (Math.abs(c.im) < 1e-12 && Math.abs(c.re - 1) < 1e-12 ? zk : mul(coefNode, zk)) : coefNode);
  });
  if (!terms.length) return num(0);
  return terms.reverse().reduce((p, q) => add(p, q));
}
const numNodeExact = (v) => { const f = toFraction(Math.abs(v), 1000, 1e-9); const n = f ? (f.d === 1 ? num(f.n) : div(num(f.n), num(f.d))) : num(Number(Math.abs(v).toPrecision(12))); return v < 0 ? neg(n) : n; };

/** Poles of f: zeros of B that are not cancelled by the top. [{ a, order }] */
export function poles(node) {
  const s = splitTop(node);
  if (!s || s.B.length < 2) return { list: [], split: s };
  const top = s.A ? (z) => asC(s.A.evaluate({ z })) : (z) => evalP(s.Apoly, z);
  const list = [];
  for (const r of rootsZ(s.B)) {
    // a zero of the top lowers the order (removable when it is cancelled completely)
    let m = r.order;
    if (s.Apoly) {
      let p = s.Apoly, k = 0;
      while (k < m && p.length > 1 && small(evalP(p, r.a))) { p = divLinear(p, r.a); k++; }
      m -= k;
    } else {
      let k = 0, g = s.A;
      while (k < m) { let val; try { val = asC(g.evaluate({ z: r.a })); } catch { break; } if (!small(val)) break; g = math.derivative(g, 'z'); k++; }
      m -= k;
    }
    if (m > 0) list.push({ a: r.a, order: m });
  }
  void top;
  return { list, split: s };
}

/** Residue of f at a pole a of order m. Returns { value, lines }. */
export function residue(node, a, m, split = splitTop(node)) {
  // (z − a)^m f = A(z) / (B(z)/(z − a)^m)
  const Bq = divLinear(split.B, a, m);
  const A = split.A || polyNodeZ(split.Apoly);
  let g = div(paren(A), paren(polyNodeZ(Bq)));
  const aTex = cTex(a);
  const lines = [];
  if (m === 1) {
    lines.push(`\\operatorname{Res}_{z = ${aTex}} = \\lim_{z \\to ${aTex}} (z - ${wrapA(aTex)})f(z) = \\left.${tex(polish(tidy(g)))}\\right|_{z = ${aTex}}`);
  } else {
    lines.push(`\\operatorname{Res}_{z = ${aTex}} = \\frac{1}{${m - 1}!}\\lim_{z \\to ${aTex}} \\frac{d^{${m - 1}}}{dz^{${m - 1}}}\\left[(z - ${wrapA(aTex)})^{${m}} f(z)\\right]`);
    lines.push(`(z - ${wrapA(aTex)})^{${m}} f(z) = ${tex(polish(tidy(g)))}`);
    for (let k = 0; k < m - 1; k++) g = math.derivative(g, 'z');
  }
  let v = asC(g.evaluate({ z: a }));
  let fact = 1;
  for (let k = 2; k < m; k++) fact *= k;
  v = cdiv(v, C(fact));
  lines.push(`\\operatorname{Res} = ${cTex(v)}`);
  return { value: snapC(v), lines };
}
const wrapA = (t) => (/[+-]/.test(t.slice(1)) ? `(${t})` : t);

/** Numerical check of a residue: (1/2πi)∮ f around a small circle about a. */
export function residueByCircle(node, a, r = 1e-3) {
  const N = 400;
  let s = ZERO;
  for (let k = 0; k < N; k++) {
    const t = (2 * Math.PI * k) / N;
    const w = C(Math.cos(t), Math.sin(t));
    const z = cadd(a, cmul(C(r), w));
    const dz = cmul(C(0, (2 * Math.PI * r) / N), w);
    s = cadd(s, cmul(asC(node.evaluate({ z })), dz));
  }
  return cdiv(s, C(0, 2 * Math.PI));
}

/** cos 0 → 1, sin 0 → 0, e⁰ → 1 …: functions of plain numbers with a simple value are worked out. */
export function foldConstants(node) {
  return node.transform((n) => {
    if (!(n.isFunctionNode || (n.isOperatorNode && n.fn === 'pow'))) return n;
    let constant = true;
    n.traverse((m) => { if (m.isSymbolNode && !(m.isFunctionNode) && !['pi', 'e'].includes(m.name) && !(n.isFunctionNode && m === n.fn)) constant = false; });
    if (!constant) return n;
    let v;
    try { v = n.evaluate({}); } catch { return n; }
    if (typeof v !== 'number' || !Number.isFinite(v)) return n;
    const f = toFraction(v, 100, 1e-12);
    return f ? (f.d === 1 ? num(f.n) : div(num(f.n), num(f.d))) : n;
  });
}

export { mtex };
