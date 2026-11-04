/**
 * Where is f(x) = 0 (and where is f undefined)? Used by tangent/normal, increasing/decreasing,
 * maxima/minima and area pages.
 *   polynomials            exact: rational roots (rational root theorem), then the quadratic formula,
 *                          then a careful numerical search for anything left
 *   fractions P(x)/Q(x)    zeros of P that are not zeros of Q; Q = 0 gives "undefined" points
 *   anything else          numerical: sign changes on a fine grid, refined by bisection, on a finite interval
 * Every point comes with LaTeX: exact where possible (1/3, 2 ± √3, π/4), else 6 significant figures.
 */
import { toFraction } from '../numeric/fraction';
import { rationalParts } from './poly';
import { recognise } from './present';

const EPS = 1e-9;
const trim = (c) => { const d = [...c]; while (d.length > 1 && Math.abs(d.at(-1)) < 1e-12) d.pop(); return d; };
const evalPoly = (c, x) => c.reduceRight((acc, k) => acc * x + k, 0);
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a * b) / gcd(a, b);

/** Plain number as LaTeX: exact when recognisable, else 6 significant figures. */
export function texOf(x) {
  if (Math.abs(x) < 1e-12) return '0';
  return recognise(x) || String(Number(x.toPrecision(6)));
}
const fracTex = (v) => {
  const f = toFraction(v, 10000, 1e-9);
  if (!f) return String(Number(v.toPrecision(6)));
  return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
};

/** Divide an ascending polynomial by (x − r). */
function deflate(c, r) {
  const desc = [...c].reverse();
  const out = [desc[0]];
  for (let i = 1; i < desc.length - 1; i++) out.push(desc[i] + out[i - 1] * r);
  return out.reverse();
}

/** √(n/d) as { k, r } with √(n/d) = k·√r, r square-free whole number (r = 1 means rational). */
function surd(v) {
  const f = toFraction(v, 100000, 1e-12);
  if (!f || f.n <= 0) return null;
  const m = f.n * f.d;
  if (!Number.isSafeInteger(m)) return null;
  let s = 1;
  for (let i = Math.floor(Math.sqrt(m)); i > 1; i--) if (m % (i * i) === 0) { s = i; break; }
  return { k: s / f.d, r: m / (s * s) };
}

/**
 * Real roots of an ascending-coefficient polynomial: [{ x, tex, m }] sorted, m = multiplicity.
 */
export function polyRoots(coeffs) {
  let c = trim(coeffs);
  if (c.length <= 1) return [];
  const found = [];
  const push = (x, tex) => {
    const e = found.find((r) => Math.abs(r.x - x) < 1e-7);
    if (e) e.m++; else found.push({ x, tex, m: 1 });
  };
  // Zero roots
  while (c.length > 1 && Math.abs(c[0]) < 1e-12) { push(0, '0'); c = c.slice(1); }
  // Rational roots, on integer-scaled coefficients
  for (let guard = 0; guard < 40 && c.length > 1; guard++) {
    let den = 1;
    for (const k of c) { const f = toFraction(k, 1000, 1e-9); if (!f) { den = 0; break; } den = lcm(den, f.d); if (den > 1e6) { den = 0; break; } }
    if (!den) break;
    const P = c.map((k) => Math.round(k * den));
    const divisors = (n) => { n = Math.abs(n); const out = []; for (let i = 1; i <= Math.min(n, 20000); i++) if (n % i === 0) out.push(i); return out.length ? out : [1]; };
    let root = null;
    const scale = Math.max(1, ...c.map(Math.abs));
    for (const p of divisors(P[0])) {
      for (const q of divisors(P.at(-1))) {
        for (const x of [p / q, -p / q]) if (root === null && Math.abs(evalPoly(c, x)) < 1e-9 * scale) root = x;
      }
    }
    if (root === null) break;
    push(root, fracTex(root));
    c = trim(deflate(c, root));
  }
  // What is left: linear, quadratic (exact surds) or higher (numerical)
  if (c.length === 2) push(-c[0] / c[1], fracTex(-c[0] / c[1]));
  else if (c.length === 3) {
    const [C, B, A] = c;
    const D = B * B - 4 * A * C;
    if (Math.abs(D) < 1e-12) push(-B / (2 * A), fracTex(-B / (2 * A)));
    else if (D > 0) {
      const p = -B / (2 * A), s = surd(D);
      const q = s ? s.k / (2 * Math.abs(A)) : Math.sqrt(D) / (2 * Math.abs(A));
      const qTex = s ? `${Math.abs(q - 1) < 1e-12 ? '' : fracTex(q)}\\sqrt{${s.r}}` : String(Number(q.toPrecision(6)));
      const pTex = Math.abs(p) < 1e-12 ? '' : fracTex(p);
      const qv = s ? q * Math.sqrt(s.r) : q;
      push(p - qv, pTex ? `${pTex} - ${qTex}` : `-${qTex}`);
      push(p + qv, pTex ? `${pTex} + ${qTex}` : qTex);
    }
  } else if (c.length > 3) {
    // Cauchy bound, then sign changes (and double roots at local minima of |p|)
    const R = 1 + Math.max(...c.slice(0, -1).map((k) => Math.abs(k / c.at(-1))));
    const f = (x) => evalPoly(c, x);
    for (const x of numericRoots(f, -R, R, 8000).zeros) push(x, String(Number(x.toPrecision(6))));
  }
  return found.sort((a, b) => a.x - b.x);
}

/** Zeros and poles of a plain function on [lo, hi]: sign changes refined by bisection; tiny |f| caught too. */
export function numericRoots(f, lo, hi, n = 4000) {
  const xs = [], ys = [];
  for (let k = 0; k <= n; k++) { const x = lo + ((hi - lo) * k) / n; xs.push(x); ys.push(f(x)); }
  const zeros = [], poles = [];
  const add = (list, x) => { if (!list.some((y) => Math.abs(y - x) < 1e-7 * Math.max(1, Math.abs(x)))) list.push(x); };
  for (let k = 0; k < n; k++) {
    const [a, b, fa, fb] = [xs[k], xs[k + 1], ys[k], ys[k + 1]];
    if (!Number.isFinite(fa) || !Number.isFinite(fb)) continue;
    if (fa === 0) { add(zeros, a); continue; }
    if (fa * fb < 0) {
      let [l, r, fl] = [a, b, fa];
      for (let i = 0; i < 100; i++) { const m = (l + r) / 2, fm = f(m); if (!Number.isFinite(fm)) break; if (fl * fm <= 0) r = m; else { l = m; fl = fm; } }
      const x = (l + r) / 2, fx = Math.abs(f(x));
      // A sign change with huge values either side is a pole (like tan x at π/2), not a zero
      if (fx < 1e-6 * Math.max(1, Math.min(Math.abs(fa), Math.abs(fb)))) add(zeros, x); else add(poles, x);
    }
  }
  if (Number.isFinite(ys[n]) && ys[n] === 0) add(zeros, xs[n]);
  // Touching zeros (f ≥ 0 with f = 0 at one point): local minima of |f| that are tiny
  for (let k = 1; k < n; k++) {
    const [p, q, r] = [Math.abs(ys[k - 1]), Math.abs(ys[k]), Math.abs(ys[k + 1])];
    if (!(q <= p && q <= r) || !Number.isFinite(q) || ys[k - 1] * ys[k + 1] < 0) continue;
    let [l, h] = [xs[k - 1], xs[k + 1]];
    for (let i = 0; i < 100; i++) { const m1 = l + (h - l) / 3, m2 = h - (h - l) / 3; if (Math.abs(f(m1)) < Math.abs(f(m2))) h = m2; else l = m1; }
    const x = (l + h) / 2;
    if (Math.abs(f(x)) < 1e-10) add(zeros, x);
  }
  return { zeros: zeros.sort((a, b) => a - b), poles: poles.sort((a, b) => a - b) };
}

/** Points in (lo, hi) where the plain function is undefined, as a few sample edges (e.g. ln x for x ≤ 0). */
function undefinedEdges(f, lo, hi, n = 4000) {
  const edges = [];
  let prev = Number.isFinite(f(lo));
  for (let k = 1; k <= n; k++) {
    const x = lo + ((hi - lo) * k) / n;
    const ok = Number.isFinite(f(x));
    if (ok !== prev) {
      let [l, r] = [lo + ((hi - lo) * (k - 1)) / n, x];
      for (let i = 0; i < 60; i++) { const m = (l + r) / 2; if (Number.isFinite(f(m)) === prev) l = m; else r = m; }
      edges.push((l + r) / 2);
    }
    prev = ok;
  }
  return edges;
}

/**
 * Where g(x) = 0 and where g is undefined, for a math.js node g in variable v.
 * range: { lo, hi } (finite) for the numerical case; exact cases find all real points and keep those in range.
 * Returns { zeros: [{x, tex}], undefinedAt: [{x, tex}], exact: boolean }.
 */
export function zerosOf(node, v, range = { lo: -10, hi: 10 }) {
  const inRange = (p) => p.x >= range.lo - EPS && p.x <= range.hi + EPS;
  const r = rationalParts(node, v);
  if (r) {
    const P = trim(r.P), Q = trim(r.Q);
    if (P.length === 1 && Math.abs(P[0]) < 1e-12) return { zeros: [], undefinedAt: [], exact: true, identicallyZero: true };
    const qRoots = Q.length > 1 ? polyRoots(Q) : [];
    const pRoots = polyRoots(P).filter((p) => !qRoots.some((q) => Math.abs(q.x - p.x) < 1e-7));
    return { zeros: pRoots.filter(inRange), undefinedAt: qRoots.filter(inRange), exact: true };
  }
  const f = (x) => { try { const y = node.evaluate({ [v]: x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  const { zeros, poles } = numericRoots(f, range.lo, range.hi);
  const edges = undefinedEdges(f, range.lo, range.hi);
  const mark = (x) => ({ x, tex: texOf(x) });
  return { zeros: zeros.map(mark), undefinedAt: [...poles, ...edges].sort((a, b) => a - b).map(mark), exact: false };
}

