/**
 * Iterated (double and triple) integrals, one variable at a time, with every stage checked
 * (plan section 5.1, group 3A). Each stage: integrate with respect to one letter (the others held constant),
 * check the antiderivative numerically, put in the limits (which may contain the outer letters), tidy.
 * The final number is cross-checked by Gauss–Legendre quadrature over the same region.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sub, paren, tidy, polish, tex, simplifyExact, variablesOf, tidySigns } from './tree';
import { integrate, polyNode } from './integral';
import { polynomialCoeffs } from './poly';
import { tidyMulti, equalAt, lettersOf, mtex, exactTex, integrandTex, readMulti } from './multi';

/** Replace a letter by an expression. */
export const substitute = (node, name, value) => node.transform((n) => (n.isSymbolNode && n.name === name ? paren(value) : n));

/** Read a limit or integrand as students type it: xy = x·y, θ, φ, ρ, π, √, ² (see readMulti). */
export function readExpr(text, where) {
  return readMulti(text, where);
}

/**
 * (√A)² → A, (√A)⁴ → A². Safe here: a limit √A only makes sense where A ≥ 0, so after putting it in,
 * the square of the root is A itself.
 */
function squareRoots(node) {
  return node.transform((n) => {
    const m = n.isParenthesisNode ? n.content : n;
    if (!(m.isOperatorNode && m.fn === 'pow')) return n;
    const base = m.args[0].isParenthesisNode ? m.args[0].content : m.args[0];
    const ex = m.args[1];
    if (base.isFunctionNode && base.fn.name === 'sqrt' && ex.isConstantNode && Number.isInteger(ex.value) && ex.value % 2 === 0) {
      const inner = squareRoots(base.args[0]);
      return ex.value === 2 ? paren(inner) : math.parse(`(${inner.toString()})^${ex.value / 2}`);
    }
    return n;
  });
}

/** The tidiest equal form, expanded when it is a polynomial in one letter. */
function neat(raw, vars) {
  const node = squareRoots(raw);
  const left = [...variablesOf(node)].filter((v) => v !== 'pi' && v !== 'e');
  if (left.length === 1) {
    try { const c = polynomialCoeffs(node, left[0]); if (c && c.length <= 12) return polish(tidy(polyNode(c.map((k) => Number(k.toPrecision(12))), left[0]))); } catch { /* not a polynomial */ }
  }
  return tidyMulti(node, vars.length ? vars : ['x']);
}

/**
 * ∫_lo^hi f d(v). lo, hi: nodes (may contain outer letters). vars: every letter that can appear.
 * Returns { value (node), F, steps, lines }. Throws EngineError when no checked antiderivative is found.
 */
/** y = (a√k + b)/d with small whole a, b, d (d ≤ 100) and k square-free, as LaTeX, or null. */
export function surdForm(y) {
  const gcd = (p, q) => { p = Math.abs(p); q = Math.abs(q); while (q) [p, q] = [q, p % q]; return p; };
  for (let d = 1; d <= 100; d++) {
    for (const k of [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17]) {
      const r = Math.sqrt(k);
      for (let a = 1; a <= 400; a++) {
        for (const s of [1, -1]) {
          const b = y * d - s * a * r;
          const bi = Math.round(b);
          if (Math.abs(b - bi) > 1e-11 * Math.max(1, Math.abs(y * d))) continue;
          const g = gcd(gcd(a, bi), d);
          const A = a / g, Bv = bi / g, D = d / g;
          const surd = `${A === 1 ? '' : A}\\sqrt{${k}}`;
          const top = Bv === 0 ? `${s < 0 ? '-' : ''}${surd}` : s > 0 ? `${surd} ${Bv < 0 ? '-' : '+'} ${Math.abs(Bv)}` : `${Bv} - ${surd}`;
          return D === 1 ? top : `\\frac{${top}}{${D}}`;
        }
      }
    }
  }
  return null;
}

export function definite(f, v, lo, hi, vars, depth = 0, { light = false, noNeat = false } = {}) {
  let r;
  try { r = integrate(f, v); } catch (e) { throw new EngineError(`NETZ can't integrate ${tex(polish(f))} with respect to ${v} step by step yet.`); }
  const all = lettersOf(f, r.result).concat(vars).filter((x, i, a) => a.indexOf(x) === i && x !== 'pi' && x !== 'e');
  let dF;
  try { dF = math.derivative(r.result, v); } catch { dF = null; }
  // light: a quick tidy only (Fourier rebuilds the coefficient afterwards; the full tidy took seconds with n in it)
  const F = dF && equalAt(dF, f, all) ? (light ? polish(tidy(r.result)) : tidyMulti(r.result, all, r.result)) : null;
  if (!F) throw new EngineError(`NETZ found an antiderivative of ${tex(polish(f))} but it failed the check, so the steps are not shown.`);
  const Fhi = substitute(F, v, hi), Flo = substitute(F, v, lo);
  const loZero = (() => { try { return Math.abs(Flo.evaluate(Object.fromEntries(all.map((x, i) => [x, 0.7 + 0.3 * i])))) < 1e-14 && Math.abs(Flo.evaluate(Object.fromEntries(all.map((x, i) => [x, 1.3 + 0.2 * i])))) < 1e-14; } catch { return false; } })();
  const raw = loZero ? Fhi : sub(Fhi, Flo);
  const outer = all.filter((x) => x !== v);
  let value, valueTex, number = null;
  if (outer.every((x) => !variablesOf(raw).has(x))) {
    // Only numbers left: evaluate, and write it exactly when we recognise it (π/4, e − 1, …)
    number = raw.evaluate({});
    if (typeof number !== 'number' || !Number.isFinite(number)) throw new EngineError('The integral does not give a finite number with these limits.');
    value = num(number);
    valueTex = exactTex(number);
    // Not a simple number (e⁴/8 − 3e²/4 + e − 3/8): keep the exact expression, with its decimal value
    if (/\d\.\d/.test(valueTex)) {
      // each candidate must evaluate to the same number before it is shown (a tidy step once dropped a π)
      const forms = [() => tidyMulti(squareRoots(raw), ['x']), () => squareRoots(raw), () => tidyMulti(raw, ['x'])];
      // (a√k + b)/d with d up to 100: (80√10 − 8)/27 for the arc length of x^(3/2) on [0, 4]
      const surd = surdForm(number);
      if (surd) valueTex = `${surd} \\approx ${Number(number.toPrecision(8))}`;
      for (const make of surd ? [] : forms) {
        try {
          const node = make();
          const val = node.evaluate({});
          const exact = mtex(node);
          // a 5-digit number in the "exact" form means a decimal was turned into a fraction (77223/868 for 2π + 8π³/3)
          if (typeof val === 'number' && Math.abs(val - number) < 1e-9 * Math.max(1, Math.abs(number)) && !/\d\.\d/.test(exact) && !/\d{5}/.test(exact) && exact.length < 160) {
            valueTex = `${exact} \\approx ${Number(number.toPrecision(8))}`;
            break;
          }
        } catch { /* next form */ }
      }
    }
  } else {
    // noNeat: the caller tidies the value itself (Fourier coefficients), so the slow tidy is skipped
    value = noNeat ? tidy(raw) : neat(raw, outer);
    valueTex = mtex(value);
  }
  const lines = [
    `\\int_{${mtex(lo)}}^{${mtex(hi)}} ${integrandTex(polish(f))}\\,d${texVar(v)} = \\Big[\\,${mtex(F)}\\,\\Big]_{${texVar(v)} = ${mtex(lo)}}^{${mtex(hi)}}`,
    loZero ? `= ${mtex(polish(Fhi))} - 0` : `= ${mtex(polish(Fhi))} - \\left(${mtex(polish(Flo))}\\right)`,
    `= ${valueTex}`,
  ].map(tidySigns);
  return { value, valueTex, number, F, lines, steps: r.steps.map((s) => ({ ...s, depth: (s.depth || 0) + depth + 1 })) };
}

export const texVar = (v) => ({ theta: '\\theta', varphi: '\\varphi', rho: '\\rho' }[v] || v);

// ---------- Gauss–Legendre quadrature ----------
const GL = new Map();
/** Nodes and weights on [−1, 1]. */
export function gaussLegendre(n) {
  if (GL.has(n)) return GL.get(n);
  const xs = [], ws = [];
  for (let i = 1; i <= n; i++) {
    let x = Math.cos((Math.PI * (i - 0.25)) / (n + 0.5));
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = x;
      for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      const dp = (n * (x * p1 - p0)) / (x * x - 1);
      const dx = p1 / dp;
      x -= dx;
      if (Math.abs(dx) < 1e-15) {
        xs.push(x); ws.push(2 / ((1 - x * x) * dp * dp));
        break;
      }
    }
  }
  const r = { xs, ws };
  GL.set(n, r);
  return r;
}

/**
 * ∫…∫ f over nested limits by Gauss–Legendre. dims: innermost first, each { v, lo(scope), hi(scope) };
 * f(scope) → number. Returns NaN when the integrand blows up.
 */
export function numericIterated(f, dims, n = 24) {
  const { xs, ws } = gaussLegendre(n);
  const rec = (k, scope) => {
    if (k < 0) return f(scope);
    const d = dims[k];
    const a = d.lo(scope), b = d.hi(scope);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
    const h = (b - a) / 2, m = (a + b) / 2;
    let s = 0;
    for (let i = 0; i < xs.length; i++) s += ws[i] * rec(k - 1, { ...scope, [d.v]: m + h * xs[i] });
    return s * h;
  };
  return rec(dims.length - 1, {});
}

/** A compiled node as a function of a scope (NaN on errors). */
export const fnOf = (node) => {
  const c = node.compile();
  return (scope) => { try { const y = c.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
};

export { exactTex, tidyMulti, mtex, simplifyExact };
