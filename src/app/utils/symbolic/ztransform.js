/**
 * Z-transforms (Unit 13), shared by the 4B pages. One-sided: Z{x(n)} = Σ_{n≥0} x(n) z^{−n}.
 *   zTransform(x)   x(n) a sum of terms c · nᵏ · aⁿ · (1 | cos θn | sin θn), plus δ(n − k), u(n) and 1/n!.
 *                   Built from three base transforms with two rules, so every textbook table entry follows:
 *                     Z{1} = z/(z − 1),  Z{cos θn} = z(z − cos θ)/(z² − 2z cos θ + 1),  Z{sin θn} = z sin θ/(…)
 *                     damping  Z{aⁿ f(n)} = F(z/a);   multiplication  Z{n f(n)} = −z F′(z)
 *                   Checked by summing the series at a point of the region of convergence.
 *   inverseZ(F)     F(z) rational: partial fractions of F(z)/z, then z/(z − p) ↔ pⁿ, z/(z − p)² ↔ n p^{n−1},
 *                   z/(z − p)³ ↔ n(n − 1)p^{n−2}/2; a conjugate pair p, p̄ gives a real 2|A| rⁿ cos(nθ + φ).
 *                   Long division gives the first terms as a check.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, mul, div, pow, neg, paren, unwrap, polish, tidy, tex } from './tree';
import { mtex, exactTex, tidyMulti } from './multi';
import { substitute } from './iterated';
import { rationalParts } from './poly';
import { polyTex, factorPolynomial } from './algebra';
import { C, cTex, snapC, rootsZ, rationalZ, divLinear, polyNodeZ, evalP } from './complex';
import { polyGcd, polyDiv } from './poly';

const Z = sym('z');
const absC = (c) => Math.hypot(c.re, c.im);
const snapN = (v) => { if (Math.abs(v) < 1e-10) return 0; const f = toFraction(v, 1000, 1e-9); return f ? f.n / f.d : v; };
const numNode = (v) => { const f = toFraction(Math.abs(v), 1000, 1e-9); const n = f ? (f.d === 1 ? num(f.n) : div(num(f.n), num(f.d))) : num(Number(Math.abs(v).toPrecision(12))); return v < 0 ? neg(n) : n; };

/** Read x(n): n is the variable; u(n) the unit step; delta(n − k) the impulse. */
export function readN(text, label = 'x(n)') {
  const raw = String(text ?? '').trim();
  if (!raw) throw new EngineError(`${label} is empty.`);
  const s = raw.replace(/π/g, 'pi').replace(/[−–]/g, '-').replace(/δ/g, 'delta').replace(/(\d)\s*([a-z(])/gi, '$1*$2').replace(/\bn\s*\(/g, 'n*(').replace(/\)\s*(?=[a-z0-9(])/gi, ')*');
  let node;
  try { node = math.parse(s); } catch { throw new EngineError(`${label}: "${raw}" could not be read. Write it like 2^n, n 3^n, cos(n pi/2) or delta(n - 1).`); }
  node.traverse((m) => {
    if (m.isFunctionNode && !['cos', 'sin', 'u', 'delta', 'factorial', 'exp'].includes(m.fn.name)) throw new EngineError(`${label}: "${m.fn.name}" is not supported here.`);
    if (m.isSymbolNode && !m.isFunctionNode && !['n', 'pi', 'e', 'cos', 'sin', 'u', 'delta', 'factorial', 'exp'].includes(m.name)) throw new EngineError(`${label} may use only n (it uses ${m.name}).`);
  });
  return node;
}
const hasN = (n) => { let f = false; n.traverse((m) => { if (m.isSymbolNode && m.name === 'n') f = true; }); return f; };
const val = (n) => { try { const v = n.evaluate({}); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };

/** Terms of a sum: [{ t, s }]. */
export function termsOf(node) {
  const out = [];
  const go = (t, s) => {
    const x = unwrap(t);
    if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0], s); go(x.args[1], x.fn === 'subtract' ? -s : s); return; }
    if (x.isOperatorNode && x.fn === 'unaryMinus') { go(x.args[0], -s); return; }
    out.push({ t: x, s });
  };
  go(node, 1);
  return out;
}
/** One term c · nᵏ · aⁿ · trig(θn) (or δ, u, 1/n!) → its pieces. */
export function classify(term) {
  const factors = [];
  const go = (t, inv) => { const x = unwrap(t); if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach((y) => go(y, inv)); return; } if (x.isOperatorNode && x.fn === 'divide') { go(x.args[0], inv); go(x.args[1], !inv); return; } factors.push({ x, inv }); };
  go(term, false);
  let c = 1, k = 0, a = 1, trig = null, theta = 0, special = null;
  for (const { x, inv } of factors) {
    if (!hasN(x)) { const v = val(x); if (!Number.isFinite(v)) throw new EngineError('Constants must be numbers.'); c = inv ? c / v : c * v; continue; }
    if (inv) {
      // 1/n! only
      if (((x.isOperatorNode && x.fn === 'factorial') || (x.isFunctionNode && x.fn.name === 'factorial')) && unwrap(x.args[0]).isSymbolNode) { special = 'invfact'; continue; }
      throw new EngineError('Only 1/n! may divide by something with n in it.');
    }
    if (x.isSymbolNode && x.name === 'n') { k += 1; continue; }
    if (x.isOperatorNode && x.fn === 'pow') {
      const [b, e] = x.args.map(unwrap);
      if (b.isSymbolNode && b.name === 'n') { const p = val(e); if (!(Number.isInteger(p) && p >= 0 && p <= 3)) throw new EngineError('Powers of n: use n, n², n³.'); k += p; continue; }
      if (!hasN(b)) {
        // aⁿ, a^(n + m) = aᵐ·aⁿ, a^(kn) = (aᵏ)ⁿ
        const e0 = val(substitute(e, 'n', num(0))), e1 = val(substitute(e, 'n', num(1)));
        const base = val(b);
        if (!Number.isFinite(base) || !Number.isFinite(e0) || !Number.isFinite(e1)) throw new EngineError('Write powers like 2^n or (1/2)^n.');
        a *= base ** (e1 - e0); c *= base ** e0;
        continue;
      }
    }
    if (x.isFunctionNode && ['cos', 'sin'].includes(x.fn.name)) {
      if (trig) throw new EngineError('Use at most one sin or cos per term (write products as sums first).');
      const t0 = val(substitute(x.args[0], 'n', num(0))), t1 = val(substitute(x.args[0], 'n', num(1)));
      if (Math.abs(t0) > 1e-12) throw new EngineError('Write the angle as θn, e.g. cos(n pi/2).');
      trig = x.fn.name; theta = t1;
      continue;
    }
    if (x.isFunctionNode && x.fn.name === 'u') { continue; } // u(n) = 1 for n ≥ 0
    if (x.isFunctionNode && x.fn.name === 'delta') {
      const s0 = val(substitute(x.args[0], 'n', num(0)));
      special = { delta: -s0 };
      continue;
    }
    throw new EngineError(`NETZ can't transform ${tex(x)} yet.`);
  }
  return { c, k, a, trig, theta, special };
}

/** Z{x(n)} with steps. Returns { F (node), Ftex, roc, lines, check }. */
export function zTransform(x) {
  const lines = [];
  let F = null;
  let roc = 0;
  for (const { t, s } of termsOf(x)) {
    const p = classify(t);
    let T, why;
    if (p.special === 'invfact') { T = fn('exp', div(num(1), Z)); why = '\\mathcal{Z}\\{1/n!\\} = e^{1/z}'; }
    else if (p.special && p.special.delta !== undefined) { const kk = p.special.delta; T = kk === 0 ? num(1) : pow(Z, num(-kk)); why = `\\mathcal{Z}\\{\\delta(n${kk ? ` - ${kk}` : ''})\\} = ${kk ? `z^{-${kk}}` : '1'}`; }
    else {
      // base
      const ct = snapN(Math.cos(p.theta)), st = snapN(Math.sin(p.theta));
      if (!p.trig) { T = div(Z, paren(add(Z, num(-1)))); why = '\\mathcal{Z}\\{1\\} = \\frac{z}{z - 1}'; }
      else {
        const den = math.parse(`z^2 - ${2 * ct} * z + 1`);
        T = p.trig === 'cos' ? div(mul(Z, paren(add(Z, numNode(-ct)))), paren(den)) : div(mul(numNode(st), Z), paren(den));
        why = `\\mathcal{Z}\\{\\${p.trig}(${exactTex(p.theta)}\\,n)\\} = ${tex(polish(tidy(T)))}`;
      }
      // damping aⁿ: z → z/a
      if (Math.abs(p.a - 1) > 1e-12) { T = substitute(T, 'z', div(Z, numNode(p.a))); why += `, \\ a^n: z \\to \\frac{z}{${exactTex(p.a)}}`; roc = Math.max(roc, Math.abs(p.a)); } else roc = Math.max(roc, 1);
      // nᵏ: −z d/dz, k times
      for (let j = 0; j < p.k; j++) T = mul(neg(Z), math.derivative(T, 'z'));
      if (p.k) why += `, \\ n^{${p.k}}: \\left(-z\\frac{d}{dz}\\right)^{${p.k}}`;
    }
    const term = mul(numNode(s * p.c), paren(T));
    F = F ? add(F, term) : term;
    lines.push(why);
  }
  const Fn = tidyZ(F);
  return { F: Fn, Ftex: fracTex(Fn), roc, lines };
}

/** One fraction in z with the bottom factored, when rational; else the tidy form. */
export function tidyZ(F) {
  const r = rationalParts(F, 'z');
  if (!r) return tidyMulti(F, ['z']);
  let P = r.P.map(Number), Q = r.Q.map(Number);
  const g = polyGcd(P, Q);
  if (g.length > 1) { P = polyDiv(P, g); Q = polyDiv(Q, g); }
  const lead = Q[Q.length - 1];
  P = P.map((v) => snapN(v / lead)); Q = Q.map((v) => snapN(v / lead));
  // whole-number coefficients: (8z² − 5z)/(2z² − 3z + 1), not halves
  const fr = [...P, ...Q].map((v) => toFraction(v, 1000, 1e-9));
  if (fr.every(Boolean)) {
    const g = (a, b) => (b ? g(b, a % b) : a);
    const L = fr.reduce((l, f) => (l * f.d) / g(l, f.d), 1);
    if (L > 1 && L <= 1000) { P = P.map((v) => Math.round(v * L)); Q = Q.map((v) => Math.round(v * L)); }
  }
  const node = div(paren(polyNodeR(P)), paren(polyNodeR(Q)));
  node.netzP = P; node.netzQ = Q;
  return node;
}
const polyNodeR = (c) => polyNodeZ(c.map((v) => C(v)));
/** LaTeX for a tidy F(z): \frac{top}{factored bottom}. */
export function fracTex(F) {
  if (F.netzP) {
    const top = polyTex(F.netzP, 'z');
    let bottom;
    try { bottom = factorPolynomial(F.netzQ, 'z').tex; } catch { bottom = polyTex(F.netzQ, 'z'); }
    return bottom === '1' ? top : `\\frac{${top}}{${bottom}}`;
  }
  return mtex(F);
}

/** Σ x(n) z^{−n} numerically (check). */
export function seriesAt(x, z, N = 400) {
  const f = (n) => { try { const v = x.evaluate({ n, u: () => 1, delta: (k) => (Math.abs(k) < 1e-12 ? 1 : 0) }); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
  let s = 0;
  for (let n = 0; n < N; n++) s += f(n) * z ** -n;
  return s;
}

/** x(n) from F(z) (rational, proper or improper). Returns { x (text LaTeX), terms: [{A, p, k}], at(n), lines }. */
export function inverseZ(Fnode) {
  const R = rationalZ(Fnode);
  if (!R || R.D.length < 2) throw new EngineError('F(z) must be a fraction of polynomials in z, e.g. z/((z - 1)(z - 2)).');
  // F/z = N/(z D)
  const D2 = [C(0), ...R.D];
  const roots = rootsZ(D2);
  // cancel common roots with the top
  const lines = [];
  const parts = [];
  // polynomial part of N/(zD) (only if improper)
  let Nn = R.N, Dn = D2;
  if (Nn.length >= Dn.length) throw new EngineError('F(z)/z should have a smaller top degree than bottom: check F(z).');
  for (const r of roots) {
    let m = r.order;
    // remove cancelled powers
    let k = 0, Nt = Nn;
    while (k < m && Nt.length > 1 && absC(evalP(Nt, r.a)) < 1e-12) { Nt = divLinear(Nt, r.a); k++; }
    if (k) { Nn = Nt; Dn = divLinear(Dn, r.a, k); m -= k; }
    if (m > 0) parts.push({ p: r.a, m });
  }
  // coefficients A_{p,j} of N/(z D) = Σ A_{p,j}/(z − p)^j
  const g0 = div(paren(polyNodeZ(Nn)), paren(polyNodeZ(Dn)));
  const pieces = [];
  for (const { p, m } of parts) {
    const g = div(paren(polyNodeZ(Nn)), paren(polyNodeZ(divLinear(Dn, p, m))));
    let d = g, fact = 1;
    for (let k = 0; k < m; k++) {
      if (k > 1) fact *= k;
      let v = d.evaluate({ z: p });
      v = typeof v === 'number' ? C(v) : v;
      pieces.push({ p, j: m - k, A: snapC(math.divide(v, C(k > 0 ? fact : 1))) });
      d = math.derivative(d, 'z');
    }
  }
  void g0;
  const fTex = (t) => `\\frac{${cTex(t.A)}}{${zMinus(t.p)}${t.j > 1 ? `^{${t.j}}` : ''}}`;
  lines.push(`\\frac{F(z)}{z} = ${pieces.filter((t) => absC(t.A) > 1e-12).map(fTex).join(' + ').replace(/\+ \\frac\{-/g, '- \\frac{')}`);
  // x(n) = Σ A · [term for z/(z − p)^j]
  const at = (n) => pieces.reduce((s, t) => {
    if (absC(t.A) < 1e-12) return s;
    // z/(z − p)^j ↔ C(n, j − 1) p^{n − j + 1}
    let b = 1; for (let i = 0; i < t.j - 1; i++) b = (b * (n - i)) / (i + 1);
    if (absC(t.p) < 1e-12) return math.add(s, n === t.j - 1 ? t.A : C(0)); // z/z^j ↔ δ(n − j + 1)
    return math.add(s, math.multiply(t.A, math.multiply(C(b), math.pow(t.p, n - t.j + 1))));
  }, C(0));
  return { pieces, at, lines, xTex: xnTex(pieces) };
}
const zMinus = (p) => (absC(p) < 1e-12 ? 'z' : `(z ${cTex(p).startsWith('-') ? '+' : '-'} ${/[+-]/.test(cTex(p).slice(1)) ? `(${cTex(p).replace(/^-/, '')})` : cTex(p).replace(/^-/, '')})`);

/** x(n) as LaTeX: real poles as A pⁿ (with n terms), conjugate pairs as 2|A| rⁿ cos(nθ + φ). */
function xnTex(pieces) {
  const used = new Set();
  const out = [];
  const powT = (p, e) => { const t = cTex(p); const base = /[+-]/.test(t.slice(1)) || t.startsWith('-') || t.includes('frac') || t.includes('sqrt') ? `\\left(${t}\\right)` : t; return e === 'n' ? `${base}^{n}` : `${base}^{${e}}`; };
  // C(n, k) as a polynomial in n (ascending coefficients): zero at n = 0 … k − 1, so it is right for every n ≥ 0
  const binomPoly = (k) => { let c = [1]; for (let i = 0; i < k; i++) { const nc = Array(c.length + 1).fill(0); c.forEach((v, d) => { nc[d + 1] += v / (i + 1); nc[d] -= (v * i) / (i + 1); }); c = nc; } return c; };
  pieces.forEach((t, i) => {
    if (used.has(i) || absC(t.A) < 1e-12) return;
    // a real pole p ≠ 0: Σ_j A_j C(n, j − 1) p^{n − j + 1} = (polynomial in n) · pⁿ
    if (Math.abs(t.p.im) < 1e-9 && absC(t.p) > 1e-12) {
      const p = t.p.re;
      let poly = [0];
      pieces.forEach((q, k) => {
        if (used.has(k) || Math.abs(q.p.im) > 1e-9 || Math.abs(q.p.re - p) > 1e-9 || absC(q.A) < 1e-12) return;
        used.add(k);
        const b = binomPoly(q.j - 1).map((v) => v * q.A.re * p ** -(q.j - 1));
        b.forEach((v, d) => { poly[d] = (poly[d] || 0) + v; });
      });
      poly = poly.map((v) => { const f = toFraction(v, 1000, 1e-11); return f ? f.n / f.d : v; });
      while (poly.length > 1 && Math.abs(poly.at(-1)) < 1e-12) poly.pop();
      if (poly.every((v) => Math.abs(v) < 1e-12)) return;
      // one term: exactTex knows surds (√5/5 for Fibonacci)
      const nz = poly.map((v, d) => [v, d]).filter(([v]) => Math.abs(v) > 1e-12);
      const pt = nz.length === 1 ? (() => { const [v, d] = nz[0]; const nn = d === 0 ? '' : d === 1 ? 'n' : `n^{${d}}`; const f = toFraction(v, 1000, 1e-11); const c = f && f.d > 1 ? `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}` : exactTex(v); return !nn ? c : c === '1' ? nn : c === '-1' ? `-${nn}` : `${c}${nn}`; })() : polyTex(poly, 'n');
      if (Math.abs(p - 1) < 1e-12) { out.push(pt); return; }
      const pw = powT(C(p), 'n');
      const single = poly.filter((v) => Math.abs(v) > 1e-12).length === 1;
      if (!single) { out.push(`\\left(${pt}\\right)${pw}`); return; }
      const coef = pt === '1' ? '' : pt === '-1' ? '-' : pt;
      out.push(`${coef}${/\d$/.test(coef) && /^\d/.test(pw) ? ' \\cdot ' : coef && !/^[-]?$/.test(coef) ? '\\,' : ''}${pw}`);
      return;
    }
    const nPoly = t.j === 1 ? '' : t.j === 2 ? 'n' : t.j === 3 ? '\\frac{n(n - 1)}{2}' : `\\binom{n}{${t.j - 1}}`;
    const e = t.j === 1 ? 'n' : t.j === 2 ? 'n - 1' : 'n - 2';
    if (absC(t.p) < 1e-12) { out.push(`${cTex(t.A)}\\,\\delta(n${t.j > 1 ? ` - ${t.j - 1}` : ''})`); return; }
    if (Math.abs(t.p.im) > 1e-9) {
      // pair with the conjugate
      const jdx = pieces.findIndex((q, k) => k !== i && !used.has(k) && q.j === t.j && absC(math.subtract(q.p, math.conj(t.p))) < 1e-9);
      if (jdx >= 0) {
        used.add(jdx);
        const r = absC(t.p), Aabs = absC(t.A);
        let th = Math.atan2(t.p.im, t.p.re), phi = Math.atan2(t.A.im, t.A.re);
        if (th < 0) { th = -th; phi = -phi; } // use the pole in the upper half plane
        const rT = Math.abs(r - 1) < 1e-12 ? '' : `${powT(C(r), 'n')}`;
        const thT = exactTex(th) + '\\,n';
        // cos(x − π/2) = sin x, cos(x + π/2) = −sin x, cos(x ± π) = −cos x
        const H = Math.PI / 2;
        let sign = '', f = '\\cos', phiT = '';
        if (Math.abs(phi) < 1e-12) { /* cos */ } else if (Math.abs(phi + H) < 1e-12) f = '\\sin';
        else if (Math.abs(phi - H) < 1e-12) { f = '\\sin'; sign = '-'; } else if (Math.abs(Math.abs(phi) - Math.PI) < 1e-12) sign = '-';
        else phiT = ` ${phi < 0 ? '-' : '+'} ${exactTex(Math.abs(phi))}`;
        const amp = exactTex(2 * Aabs);
        out.push(sign + [amp === '1' ? '' : amp, nPoly, rT, `${f}\\left(${thT}${phiT}\\right)`].filter(Boolean).join('\\,'));
        return;
      }
    }
    const A = cTex(t.A);
    const coef = A === '1' ? '' : A === '-1' ? '-' : /[+-]/.test(A.slice(1)) ? `\\left(${A}\\right)` : A;
    const pw = powT(t.p, e);
    const join = !nPoly && /\d$/.test(coef) && /^\d/.test(pw) ? ' \\cdot ' : '';
    out.push(Math.abs(t.p.re - 1) < 1e-12 && Math.abs(t.p.im) < 1e-12 ? `${coef}${nPoly}`.replace(/^$/, '1').replace(/^-$/, '-1') : `${coef}${join}${nPoly ? `${nPoly}\\,` : ''}${pw}`);
  });
  // positive terms first: 2^n - 1, not -1 + 2^n
  out.sort((p, q) => Number(p.startsWith('-')) - Number(q.startsWith('-')));
  return out.join(' + ').replace(/\+ -/g, '- ') || '0';
}

/** First terms of F(z) as a series in z^{-1} by long division (a check, and the "long division" method). */
export function longDivision(Fnode, count = 6) {
  const R = rationalZ(Fnode);
  if (!R) return null;
  // F = N(z)/D(z): divide in powers of 1/z
  const N = [...R.N].reverse(), D = [...R.D].reverse(); // descending
  const shift = R.D.length - R.N.length; // leading power z^{-shift}
  const out = [];
  let rem = N.map((c) => c);
  while (rem.length < D.length) rem.push(C(0));
  for (let k = 0; k < count + shift; k++) {
    const q = math.divide(rem[0] || C(0), D[0]);
    out.push(snapC(q));
    rem = rem.map((c, i) => math.subtract(c, math.multiply(q, D[i] || C(0)))).slice(1);
    while (rem.length < D.length) rem.push(C(0));
  }
  // x(n) for n = 0, 1, …
  const xs = [];
  for (let n = 0; n < count; n++) xs.push(n < shift ? C(0) : out[n - shift]);
  return xs;
}
