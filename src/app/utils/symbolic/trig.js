/**
 * Trigonometry helpers shared by the identity, equation and inverse-trig pages.
 *   toSinCos(node)     tan → sin/cos, sec → 1/cos, csc → 1/sin, cot → cos/sin
 *   expandAngles(node) sin 2u, cos 2u, sin 3u, cos 3u, tan 2u and sin(a ± b), cos(a ± b) written out
 *   angleTex(α)        an angle in radians as LaTeX: a multiple of π with a small denominator, or a decimal
 *   valueTex(v)        a value such as √3/2, 1/√2 (as √2/2) or a decimal
 */
import { toFraction } from '../numeric/fraction';
import { math, unwrap, variablesOf } from './tree';

const K = (s) => math.parse(s);

export function toSinCos(node) {
  return node.transform((n) => {
    if (!n.isFunctionNode) return n;
    const a = n.args[0].toString();
    switch (n.fn.name) {
      case 'tan': return K(`(sin(${a}) / cos(${a}))`);
      case 'sec': return K(`(1 / cos(${a}))`);
      case 'csc': return K(`(1 / sin(${a}))`);
      case 'cot': return K(`(cos(${a}) / sin(${a}))`);
      default: return n;
    }
  });
}

/** k·u for a whole number k (2 or 3), or null. */
function multiple(arg) {
  const x = unwrap(arg);
  if (x.isOperatorNode && x.fn === 'multiply' && x.args.length === 2 && x.args[0].isConstantNode && [2, 3].includes(x.args[0].value)) return { k: x.args[0].value, u: x.args[1].toString() };
  return null;
}

export function expandAngles(node) {
  let changed = false;
  const out = node.transform((n) => {
    if (!(n.isFunctionNode && ['sin', 'cos', 'tan'].includes(n.fn.name))) return n;
    const x = unwrap(n.args[0]);
    // sin(a ± b), cos(a ± b)
    if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract') && n.fn.name !== 'tan') {
      const [a, b] = x.args.map((t) => t.toString());
      const s = x.fn === 'add' ? '+' : '-';
      const t = x.fn === 'add' ? '-' : '+';
      changed = true;
      return n.fn.name === 'sin' ? K(`(sin(${a}) cos(${b}) ${s} cos(${a}) sin(${b}))`) : K(`(cos(${a}) cos(${b}) ${t} sin(${a}) sin(${b}))`);
    }
    const m = multiple(x);
    if (!m) return n;
    const u = m.u;
    changed = true;
    if (m.k === 2) {
      if (n.fn.name === 'sin') return K(`(2 sin(${u}) cos(${u}))`);
      if (n.fn.name === 'cos') return K(`(cos(${u})^2 - sin(${u})^2)`);
      return K(`(2 tan(${u}) / (1 - tan(${u})^2))`);
    }
    if (n.fn.name === 'sin') return K(`(3 sin(${u}) - 4 sin(${u})^3)`);
    if (n.fn.name === 'cos') return K(`(4 cos(${u})^3 - 3 cos(${u}))`);
    return n;
  });
  return { node: out, changed };
}

/** An angle in radians as LaTeX. */
export function angleTex(a) {
  if (Math.abs(a) < 1e-12) return '0';
  const f = toFraction(a / Math.PI, 24, 1e-9);
  if (f) {
    const sign = f.n < 0 ? '-' : '';
    const p = Math.abs(f.n);
    const top = p === 1 ? '\\pi' : `${p}\\pi`;
    return f.d === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${f.d}}`;
  }
  return String(Number(a.toFixed(4)));
}

/** An angle in degrees as text, e.g. 30°, or 41.41°. */
export const degText = (a) => `${Number(((a * 180) / Math.PI).toFixed(2))}°`;

/** A value as LaTeX: integers, fractions, (a√b)/c when v² is rational, or a decimal. */
export function valueTex(v) {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '-\\infty';
  if (Math.abs(v) < 1e-12) return '0';
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  const g = toFraction(v * v, 1000, 1e-9);
  if (g) {
    let out = 1, rest = g.n * g.d;
    for (let k = Math.floor(Math.sqrt(rest)); k > 1; k--) if (rest % (k * k) === 0) { out *= k; rest /= k * k; }
    const top = `${out === 1 ? '' : out}\\sqrt{${rest}}`;
    return `${v < 0 ? '-' : ''}${g.d === 1 ? top : `\\frac{${top}}{${g.d}}`}`;
  }
  return String(Number(v.toFixed(4)));
}

/** The distinct trig calls in a node: [{ fn, arg }] with arg as text. */
export function trigCalls(node) {
  const seen = new Map();
  node.traverse((n) => {
    if (n.isFunctionNode && ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(n.fn.name)) {
      const key = `${n.fn.name}(${n.args[0].toString()})`;
      if (!seen.has(key)) seen.set(key, { fn: n.fn.name, arg: n.args[0].toString(), argNode: n.args[0] });
    }
  });
  return [...seen.values()];
}

// ---------- Rational functions of s = sin u and c = cos u, reduced with s² + c² = 1 ----------
// A polynomial is a Map "i,j" → coefficient of sⁱcʲ; a rational function is { N, D }.
const P = (entries) => new Map(entries);
const addP = (p, q, k = 1) => { const r = new Map(p); q.forEach((v, key) => r.set(key, (r.get(key) || 0) + k * v)); [...r].forEach(([key, v]) => { if (Math.abs(v) < 1e-12) r.delete(key); }); return r; };
const mulP = (p, q) => { let r = new Map(); p.forEach((a, k1) => q.forEach((b, k2) => { const [i1, j1] = k1.split(',').map(Number), [i2, j2] = k2.split(',').map(Number); r = addP(r, P([[`${i1 + i2},${j1 + j2}`, a * b]])); })); return r; };
const ONE = () => P([['0,0', 1]]);
/** sⁱ with i ≥ 2 → sⁱ⁻²(1 − c²), until only s⁰ and s¹ remain. */
export function reduceSC(p) {
  let r = new Map(p), again = true;
  while (again) {
    again = false;
    for (const [key, v] of r) {
      const [i, j] = key.split(',').map(Number);
      if (i < 2) continue;
      r.delete(key);
      r = addP(r, P([[`${i - 2},${j}`, v], [`${i - 2},${j + 2}`, -v]]));
      again = true;
      break;
    }
  }
  return r;
}
const isZeroP = (p) => [...reduceSC(p).values()].every((v) => Math.abs(v) < 1e-9);
const swapSC = (p) => new Map([...p].map(([k, v]) => { const [i, j] = k.split(',').map(Number); return [`${j},${i}`, v]; }));
/** The other way round: cʲ with j ≥ 2 → cʲ⁻²(1 − s²). */
export const reduceCS = (p) => swapSC(reduceSC(swapSC(p)));

/**
 * Node → { N, D } in s = sin(u), c = cos(u), or null when the node has anything else.
 * mode 'sin' (default) cuts powers of sin with sin² = 1 − cos²; 'cos' cuts powers of cos; null keeps both.
 */
export function toRationalSC(node, u, mode = 'sin') {
  const go = (n) => {
    const x = unwrap(n);
    if (x.isConstantNode && typeof x.value === 'number') return { N: P([['0,0', x.value]]), D: ONE() };
    // number-only parts such as √3 or π/4
    if (variablesOf(x).size === 0) { try { const v = x.evaluate(); if (typeof v === 'number' && Number.isFinite(v)) return { N: P([['0,0', v]]), D: ONE() }; } catch { /* not a number */ } return null; }
    if (x.isFunctionNode && ['sin', 'cos'].includes(x.fn.name) && x.args[0].toString() === u) return { N: P([[x.fn.name === 'sin' ? '1,0' : '0,1', 1]]), D: ONE() };
    if (!x.isOperatorNode) return null;
    const a = x.args.map(go);
    if (a.some((y) => y === null)) return null;
    switch (x.fn) {
      case 'unaryMinus': return { N: addP(new Map(), a[0].N, -1), D: a[0].D };
      case 'unaryPlus': return a[0];
      case 'add': return { N: addP(mulP(a[0].N, a[1].D), mulP(a[1].N, a[0].D)), D: mulP(a[0].D, a[1].D) };
      case 'subtract': return { N: addP(mulP(a[0].N, a[1].D), mulP(a[1].N, a[0].D), -1), D: mulP(a[0].D, a[1].D) };
      case 'multiply': return a.reduce((p, q) => ({ N: mulP(p.N, q.N), D: mulP(p.D, q.D) }));
      case 'divide': return { N: mulP(a[0].N, a[1].D), D: mulP(a[0].D, a[1].N) };
      case 'pow': {
        const k = unwrap(x.args[1]);
        if (!(k.isConstantNode && Number.isInteger(k.value) && Math.abs(k.value) <= 8)) return null;
        let r = { N: ONE(), D: ONE() };
        for (let t = 0; t < Math.abs(k.value); t++) r = { N: mulP(r.N, a[0].N), D: mulP(r.D, a[0].D) };
        return k.value < 0 ? { N: r.D, D: r.N } : r;
      }
      default: return null;
    }
  };
  const r = go(node);
  if (!r) return null;
  const red = mode === 'sin' ? reduceSC : mode === 'cos' ? reduceCS : (p) => p;
  return tidyRational({ N: red(r.N), D: red(r.D) });
}

/** Divide top and bottom by a common monomial sⁱcʲ and make the bottom's lead coefficient positive. */
function tidyRational({ N, D }) {
  const keys = [...N.keys(), ...D.keys()].map((k) => k.split(',').map(Number));
  if (!N.size) return { N, D: ONE() };
  const mi = Math.min(...keys.map((k) => k[0])), mj = Math.min(...keys.map((k) => k[1]));
  const shift = (p) => new Map([...p].map(([k, v]) => { const [i, j] = k.split(',').map(Number); return [`${i - mi},${j - mj}`, v]; }));
  let n = shift(N), d = shift(D);
  // a single-term bottom with a coefficient: divide through
  const lead = [...d.values()][0];
  if (d.size >= 1 && Math.abs(lead) > 1e-12 && [...d.values()].every((v) => Math.abs(Math.abs(v) - Math.abs(lead)) < 1e-12 || d.size === 1)) {
    if (d.size === 1) { n = new Map([...n].map(([k, v]) => [k, v / lead])); d = new Map([...d].map(([k]) => [k, 1])); }
  }
  return { N: n, D: d };
}

/** Do two rational functions agree (N₁D₂ − N₂D₁ = 0 after s² + c² = 1)? */
export const sameRational = (a, b) => isZeroP(addP(mulP(a.N, b.D), mulP(b.N, a.D), -1));

/** LaTeX for a polynomial in sin u, cos u. */
export function polySCTex(p, uTex) {
  if (!p.size) return '0';
  const terms = [...p].map(([k, v]) => { const [i, j] = k.split(',').map(Number); return { i, j, v }; })
    .sort((a, b) => b.i + b.j - (a.i + a.j) || b.i - a.i);
  const pw = (f, k) => (k === 0 ? '' : k === 1 ? `\\${f} ${uTex}` : `\\${f}^{${k}} ${uTex}`);
  return terms.map((t, idx) => {
    const body = [pw('sin', t.i), pw('cos', t.j)].filter(Boolean).join(' \\, ');
    const a = Math.abs(t.v);
    const coef = body && Math.abs(a - 1) < 1e-12 ? '' : valueTex(a);
    const sign = t.v < 0 ? '-' : idx ? '+' : '';
    return `${sign} ${coef}${body ? (coef ? ' ' : '') + body : ''}`.trim();
  }).join(' ').replace(/\s+/g, ' ');
}
export function rationalSCTex(r, uTex) {
  const top = polySCTex(r.N, uTex);
  const isOne = r.D.size === 1 && r.D.get('0,0') === 1;
  return isOne ? top : `\\frac{${top}}{${polySCTex(r.D, uTex)}}`;
}
