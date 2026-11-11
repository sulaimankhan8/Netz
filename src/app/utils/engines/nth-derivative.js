/**
 * nth derivatives and Leibniz's theorem: the maths for /nth-derivative-leibniz (catalog 6B).
 * mode 'standard': yₙ for the standard forms (n stays a letter), each checked for n = 1, 2, 3, 4:
 *   e^{ax+b} → aⁿe^{ax+b};  (ax+b)^m → m(m−1)…(m−n+1)aⁿ(ax+b)^{m−n};  1/(ax+b) → (−1)ⁿn!aⁿ/(ax+b)^{n+1};
 *   ln(ax+b) → (−1)^{n−1}(n−1)!aⁿ/(ax+b)ⁿ;  sin(ax+b) → aⁿ sin(ax+b+nπ/2);  cos likewise;
 *   e^{ax} sin(bx+c) → rⁿe^{ax} sin(bx+c+nφ), r = √(a²+b²), φ = tan⁻¹(b/a);  rational functions by partial fractions.
 * mode 'leibniz': (uv)ₙ = Σ C(n,k) u_{n−k} v_k for a given n, checked against differentiating uv directly.
 */
import { EngineError } from '../numeric/steps';
import { math, num, add, mul, pow, parse, polish, variablesOf, unwrap } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, snap } from '../symbolic/multi';
import { rationalParts } from '../symbolic/poly';
import { polyRootsComplex } from '../symbolic/ode';

const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n, k) => fact(n) / (fact(k) * fact(n - k));
/** a·x + b → { a, b }, or null. */
const lin = (u) => { try { const d = math.derivative(u, 'x'); if ([...variablesOf(d)].length) return null; const a = d.evaluate({}), b = u.evaluate({ x: 0 }); return Number.isFinite(a) && a !== 0 ? { a: snap(a), b: snap(b) } : null; } catch { return null; } };
const t = (v) => exactTex(v);
const linTex = ({ a, b }) => `${a === 1 ? '' : a === -1 ? '-' : t(a)}x${b === 0 ? '' : b > 0 ? ` + ${t(b)}` : ` - ${t(-b)}`}`;
const powTex = (base, e) => (e === '1' ? base : `${base}^{${e}}`);

/** The standard-form result: { tex (yₙ with n a letter), at (n) → number function of x for checking }. */
function standard(node) {
  const f = unwrap(node);
  const P = (u) => (/[+-]/.test(linTex(u)) ? `(${linTex(u)})` : linTex(u));
  // c·g: take the constant out
  if (f.isOperatorNode && f.fn === 'multiply' && f.args.length === 2) {
    const [p, q] = f.args;
    for (const [c, g] of [[p, q], [q, p]]) {
      if (![...variablesOf(c)].length) {
        const inner = standard(g);
        if (inner) { const cv = c.evaluate({}); return { tex: `${t(cv)}\\left(${inner.tex}\\right)`, at: (n) => (x) => cv * inner.at(n)(x), rule: inner.rule }; }
      }
    }
  }
  const expArg = (g) => (g.isFunctionNode && g.fn.name === 'exp' ? unwrap(g.args[0]) : g.isOperatorNode && g.fn === 'pow' && unwrap(g.args[0]).isSymbolNode && unwrap(g.args[0]).name === 'e' ? unwrap(g.args[1]) : null);
  const e = expArg(f);
  if (e && lin(e)) { const u = lin(e); return { tex: `${powTex(t(u.a), 'n')}e^{${linTex(u)}}`, at: (n) => (x) => u.a ** n * Math.exp(u.a * x + u.b), rule: 'y = e^{ax+b} \\Rightarrow y_n = a^n e^{ax+b}' }; }
  if (f.isFunctionNode && ['sin', 'cos'].includes(f.fn.name) && lin(unwrap(f.args[0]))) {
    const u = lin(unwrap(f.args[0]));
    const F = f.fn.name === 'sin' ? Math.sin : Math.cos;
    return { tex: `${powTex(t(u.a), 'n')}\\${f.fn.name}\\left(${linTex(u)} + \\frac{n\\pi}{2}\\right)`, at: (n) => (x) => u.a ** n * F(u.a * x + u.b + (n * Math.PI) / 2), rule: `y = \\${f.fn.name}(ax + b) \\Rightarrow y_n = a^n\\${f.fn.name}\\left(ax + b + \\frac{n\\pi}{2}\\right)` };
  }
  if (f.isFunctionNode && f.fn.name === 'log' && lin(unwrap(f.args[0]))) {
    const u = lin(unwrap(f.args[0]));
    return { tex: `\\frac{(-1)^{n-1}(n-1)!\\,${powTex(t(u.a), 'n')}}{${P(u)}^{n}}`, at: (n) => (x) => ((-1) ** (n - 1) * fact(n - 1) * u.a ** n) / (u.a * x + u.b) ** n, rule: 'y = \\ln(ax + b) \\Rightarrow y_n = \\frac{(-1)^{n-1}(n-1)!\\,a^n}{(ax + b)^n}' };
  }
  if (f.isOperatorNode && f.fn === 'pow' && lin(unwrap(f.args[0])) && ![...variablesOf(f.args[1])].length) {
    const u = lin(unwrap(f.args[0])), m = f.args[1].evaluate({});
    if (m === -1) return { tex: `\\frac{(-1)^n n!\\,${powTex(t(u.a), 'n')}}{${P(u)}^{n+1}}`, at: (n) => (x) => ((-1) ** n * fact(n) * u.a ** n) / (u.a * x + u.b) ** (n + 1), rule: 'y = \\frac{1}{ax + b} \\Rightarrow y_n = \\frac{(-1)^n n!\\,a^n}{(ax + b)^{n+1}}' };
    const fall = (n) => { let s = 1; for (let j = 0; j < n; j++) s *= m - j; return s; };
    return { tex: `${t(m)}(${t(m)} - 1)\\cdots(${t(m)} - n + 1)\\,${powTex(t(u.a), 'n')}${P(u)}^{${t(m)} - n}`, at: (n) => (x) => fall(n) * u.a ** n * (u.a * x + u.b) ** (m - n), rule: 'y = (ax + b)^m \\Rightarrow y_n = m(m-1)\\cdots(m-n+1)\\,a^n(ax + b)^{m-n}' };
  }
  if (f.isOperatorNode && f.fn === 'divide' && ![...variablesOf(f.args[0])].length) {
    const c = f.args[0].evaluate({});
    const inner = standard(mul(num(c), pow(f.args[1], num(-1))));
    if (inner) return inner;
  }
  // e^{ax} sin(bx + c) or cos
  if (f.isOperatorNode && f.fn === 'multiply' && f.args.length === 2) {
    for (const [p, q] of [[f.args[0], f.args[1]], [f.args[1], f.args[0]]]) {
      const ee = expArg(unwrap(p)); const tr = unwrap(q);
      if (ee && lin(ee) && tr.isFunctionNode && ['sin', 'cos'].includes(tr.fn.name) && lin(unwrap(tr.args[0]))) {
        const A = lin(ee), Bq = lin(unwrap(tr.args[0]));
        const r = Math.hypot(A.a, Bq.a), phi = Math.atan2(Bq.a, A.a);
        const F = tr.fn.name === 'sin' ? Math.sin : Math.cos;
        // r = √(a² + b²) exactly: √13, 2√5, 5 (not 3.60555)
        const r2 = A.a ** 2 + Bq.a ** 2;
        const sqrtInt = (m) => { let out = 1, rest = m; for (let q = Math.floor(Math.sqrt(rest)); q > 1; q--) if (rest % (q * q) === 0) { out = q; rest /= q * q; break; } return rest === 1 ? String(out) : `${out === 1 ? '' : out}\\sqrt{${rest}}`; };
        const rTex = Number.isInteger(r2) ? sqrtInt(r2) : exactTex(r), phiTex = `\\tan^{-1}\\frac{${t(Bq.a)}}{${t(A.a)}}`;
        return { tex: `${/sqrt|frac/.test(rTex) ? `(${rTex})` : rTex}^{n}e^{${linTex(A)}}\\${tr.fn.name}\\left(${linTex(Bq)} + n${phiTex}\\right)`, at: (n) => (x) => r ** n * Math.exp(A.a * x + A.b) * F(Bq.a * x + Bq.b + n * phi), rule: 'y = e^{ax}\\sin(bx + c) \\Rightarrow y_n = r^n e^{ax}\\sin(bx + c + n\\phi), \\ r = \\sqrt{a^2 + b^2}, \\ \\phi = \\tan^{-1}\\frac{b}{a}' };
      }
    }
  }
  return null;
}

/** Rational f with simple real poles: partial fractions, then the 1/(x − a) rule. */
function rational(node) {
  const r = rationalParts(node, 'x');
  if (!r) return null;
  const P = r.P.map(Number), Q = r.Q.map(Number);
  if (P.length >= Q.length || Q.length < 3) return null;
  const roots = polyRootsComplex(Q);
  if (roots.some((x) => x.im !== 0 || x.m > 1)) return null;
  // A_i = P(r_i)/Q'(r_i)
  const ev = (c, x) => c.reduceRight((s, k) => s * x + k, 0);
  const dQ = Q.slice(1).map((k, i) => k * (i + 1));
  const parts = roots.map((x) => ({ r: x.re, A: snap(ev(P, x.re) / ev(dQ, x.re)) }));
  const pf = parts.map(({ r, A }, i) => `${i === 0 ? (A < 0 ? '-' : '') : A < 0 ? ' - ' : ' + '}\\frac{${t(Math.abs(A))}}{x ${r < 0 ? '+' : '-'} ${t(Math.abs(r))}}`).join('');
  const tex = parts.map(({ r, A }, i) => `${i === 0 ? (A < 0 ? '-' : '') : A < 0 ? ' - ' : ' + '}\\frac{${t(Math.abs(A)) === '1' ? '' : t(Math.abs(A))}(-1)^n n!}{(x ${r < 0 ? '+' : '-'} ${t(Math.abs(r))})^{n+1}}`).join('');
  return { tex, pf, at: (n) => (x) => parts.reduce((s, { r, A }) => s + (A * (-1) ** n * fact(n)) / (x - r) ** (n + 1), 0), rule: '\\text{partial fractions, then } \\frac{1}{x - a} \\Rightarrow \\frac{(-1)^n n!}{(x - a)^{n+1}}' };
}

export function solve({ mode = 'standard', f = '', u = '', v = '', n = '3' }) {
  const steps = [];
  if (mode === 'standard') {
    const node = parse(f, 'y');
    if ([...variablesOf(node)].some((w) => w !== 'x')) throw new EngineError('Write y in x only.');
    const s = standard(node) || rational(node);
    if (!s) throw new EngineError('NETZ knows the nth-derivative formulas for eᵃˣ⁺ᵇ, (ax + b)ᵐ, 1/(ax + b), ln(ax + b), sin/cos(ax + b), eᵃˣ sin/cos(bx + c), and fractions with distinct linear factors. Use the Leibniz mode for a product.');
    if (s.pf) steps.push({ title: 'Partial fractions', depth: 0, lines: [`y = ${s.pf}`] });
    steps.push({ title: 'Standard result', formula: s.rule, depth: 0, lines: [`y_n = ${s.tex}`] });
    // Check against direct differentiation for n = 1 … 4
    let d = node, ok = true;
    for (let k = 1; k <= 4; k++) {
      d = math.derivative(d, 'x');
      for (const x of [0.37, 0.81, 1.43]) {
        const a1 = evalAt(d, { x }), a2 = s.at(k)(x);
        if (Number.isFinite(a1) && Number.isFinite(a2) && Math.abs(a1 - a2) > 1e-7 * Math.max(1, Math.abs(a1))) ok = false;
      }
    }
    steps.push({ title: 'Check', depth: 0, lines: [ok ? '\\text{The formula agrees with differentiating directly for } n = 1, 2, 3, 4.' : '\\text{The check failed.}'] });
    return { mode, y: mtex(polish(node)), yn: s.tex, steps, notes: [], verified: ok };
  }
  // Leibniz
  const U = parse(u, 'u'), V = parse(v, 'v');
  const N = Number(n);
  if (!Number.isInteger(N) || N < 1 || N > 12) throw new EngineError('n should be a whole number from 1 to 12.');
  const du = [U], dv = [V];
  for (let k = 1; k <= N; k++) { du.push(tidyMulti(math.derivative(du[k - 1], 'x'), ['x'])); dv.push(tidyMulti(math.derivative(dv[k - 1], 'x'), ['x'])); }
  const zero = (node) => [0.3, 0.9, 1.7].every((x) => Math.abs(evalAt(node, { x })) < 1e-12);
  const terms = [];
  let sum = null;
  for (let k = 0; k <= N; k++) {
    const a = du[N - k], b = dv[k];
    if (zero(a) || zero(b)) continue;
    const c = binom(N, k);
    terms.push(`${c === 1 ? '' : `${c}\\,`}\\left(${mtex(a)}\\right)\\left(${mtex(b)}\\right)`);
    const term = mul(num(c), mul(a, b));
    sum = sum ? add(sum, term) : term;
  }
  const result = sum ? tidyMulti(sum, ['x']) : num(0);
  steps.push({ title: "Leibniz's theorem", formula: '(uv)_n = \\sum_{k=0}^{n}\\binom{n}{k}u_{n-k}v_k', depth: 0, lines: [`u = ${mtex(polish(U))}, \\quad v = ${mtex(polish(V))}`, `\\text{derivatives of } v \\text{: } ${dv.slice(0, Math.min(N, 4) + 1).map((d2, k) => `v_{${k}} = ${mtex(d2)}`).join(', \\ ')}`] });
  steps.push({ title: `Terms (n = ${N})`, depth: 0, lines: [`(uv)_{${N}} = ${terms.join(' + ') || '0'}`, `= ${mtex(result)}`] });
  let direct = mul(U, V);
  for (let k = 0; k < N; k++) direct = math.derivative(direct, 'x');
  const ok = [0.37, 0.81, 1.43].every((x) => { const p = evalAt(direct, { x }), q = evalAt(result, { x }); return !Number.isFinite(p) || Math.abs(p - q) < 1e-7 * Math.max(1, Math.abs(p)); });
  return { mode, y: `${mtex(polish(U))}\\cdot ${mtex(polish(V))}`, yn: mtex(result), n: N, steps, notes: ['Terms where a derivative is 0 (e.g. high derivatives of a polynomial) are left out.'], verified: ok };
}
