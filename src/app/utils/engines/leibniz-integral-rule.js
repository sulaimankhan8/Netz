/**
 * Differentiation under the integral sign: the maths for /leibniz-integral-rule (Unit 6). The parameter is a.
 *   derivative  F(a) = ∫_{u(a)}^{v(a)} f(x, a) dx  ⇒  F′(a) = ∫_u^v ∂f/∂a dx + f(v, a)v′(a) − f(u, a)u′(a)
 *   evaluate    F(a) = ∫_p^q f(x, a) dx with fixed limits (q may be ∞): F′(a) = ∫ ∂f/∂a dx, often easy;
 *               then F(a) = ∫F′ da + C, with C from a value of a where F is known (f = 0 there, or a → ∞).
 *   Classic: ∫₀¹ (xᵃ − 1)/ln x dx = ln(a + 1);   ∫₀^∞ e^{−ax} sin x / x dx = π/2 − tan⁻¹a.
 * Both modes are checked numerically (a difference quotient of F, or F itself at two values of a).
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, sub, paren, tidy, polish } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti, integrandTex } from '../symbolic/multi';
import { substitute, definite, gaussLegendre } from '../symbolic/iterated';
import { antiderivative, numNode } from '../symbolic/ode';
import { integrate } from '../symbolic/integral';
import { onlyLetters, recognise } from '../symbolic/vectorint';
import { integrateToInfinity } from '../symbolic/laplace';

const T = (n) => mtex(polish(n));
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const INF = /^(\+?inf(inity)?|∞|oo)$/i;

/** ∫_lo^hi g(x) dx numerically (hi may be Infinity). */
function quad(g, lo, hi) {
  if (hi === Infinity) return integrateToInfinity((t) => evalAt(g, { x: lo + t }), []);
  const { xs, ws } = gaussLegendre(32);
  let s = 0; const n = 40;
  for (let k = 0; k < n; k++) { const A = lo + ((hi - lo) * k) / n, B = lo + ((hi - lo) * (k + 1)) / n, c = (A + B) / 2, h = (B - A) / 2; for (let i = 0; i < xs.length; i++) { const v = evalAt(g, { x: c + h * xs[i] }); if (Number.isFinite(v)) s += ws[i] * h * v; } }
  return s;
}

export function solve({ mode = 'evaluate', f, lo = '0', hi = '1', a0 = '' }) {
  const fx = readMulti(f, 'f(x, a)');
  onlyLetters([fx], ['x', 'a'], 'f(x, a)');
  const steps = [];
  const fa = tidyMulti(math.derivative(fx, 'a'), ['x', 'a']);
  if (mode === 'derivative') {
    const u = readMulti(lo, 'The lower limit'), v = INF.test(String(hi).trim()) ? null : readMulti(hi, 'The upper limit');
    if (!v) throw new EngineError('Use finite limits here (the evaluate mode allows ∞).');
    onlyLetters([u, v], ['a'], 'The limits');
    steps.push({ title: "Leibniz's rule", formula: "F'(a) = \\int_{u}^{v} \\frac{\\partial f}{\\partial a}\\,dx + f(v, a)\\,v'(a) - f(u, a)\\,u'(a)", depth: 0, lines: [`F(a) = \\int_{${T(u)}}^{${T(v)}} ${integrandTex(polish(fx))}\\,dx`, `\\frac{\\partial f}{\\partial a} = ${T(fa)}`] });
    let inner = null, innerLines = [];
    try { const d = definite(fa, 'x', u, v, ['a'], 0, { light: true }); inner = d.value; innerLines = d.lines; } catch { inner = null; }
    const du = tidy(math.derivative(u, 'a')), dv = tidy(math.derivative(v, 'a'));
    const bv = tidyMulti(mul(paren(substitute(fx, 'x', paren(v))), paren(dv)), ['a']), bu = tidyMulti(mul(paren(substitute(fx, 'x', paren(u))), paren(du)), ['a']);
    const lines = [...innerLines, `f(v, a)\\,v'(a) = ${T(bv)}, \\quad f(u, a)\\,u'(a) = ${T(bu)}`];
    let Fp = null;
    if (inner) { Fp = tidyMulti(sub(add(inner, bv), bu), ['a']); lines.push(`F'(a) = ${T(Fp)}`); }
    else lines.push(`F'(a) = \\int_{${T(u)}}^{${T(v)}} ${T(fa)}\\,dx + ${T(bv)} - (${T(bu)}) \\ (\\text{the integral is left as it is})`);
    steps.push({ title: 'Differentiate under the integral sign', depth: 0, lines });
    // check at a = 1.3 by a difference quotient
    const F = (av) => { const lo2 = evalAt(u, { a: av }), hi2 = evalAt(v, { a: av }); return quad(substitute(fx, 'a', numNode(av)), lo2, hi2); };
    const h = 1e-4, a1 = 1.3;
    const dq = (F(a1 + h) - F(a1 - h)) / (2 * h);
    const formula = Fp ? evalAt(Fp, { a: a1 }) : quad(substitute(fa, 'a', numNode(a1)), evalAt(u, { a: a1 }), evalAt(v, { a: a1 })) + evalAt(bv, { a: a1 }) - evalAt(bu, { a: a1 });
    const verified = Math.abs(dq - formula) < 1e-4 * Math.max(1, Math.abs(dq));
    return { mode, Fp: Fp ? T(Fp) : null, steps, notes: [], verified, result: Fp ? T(Fp) : 'F′(a)' };
  }
  // evaluate
  const p = Number(math.evaluate(String(lo))), qInf = INF.test(String(hi).trim()), q = qInf ? Infinity : Number(math.evaluate(String(hi)));
  if (!Number.isFinite(p) || !(q > p)) throw new EngineError('Give fixed limits with the lower one first (the upper may be inf).');
  steps.push({ title: 'Differentiate with respect to a', formula: "F'(a) = \\int \\frac{\\partial f}{\\partial a}\\,dx", depth: 0, lines: [`F(a) = \\int_{${exactTex(p)}}^{${qInf ? '\\infty' : exactTex(q)}} ${integrandTex(polish(fx))}\\,dx`, `\\frac{\\partial f}{\\partial a} = ${T(fa)}`] });
  // ∫ ∂f/∂a dx with a as a letter
  let G;
  try {
    const r = integrate(fa, 'x');
    const A = r.result;
    if (!(Math.abs(evalAt(math.derivative(A, 'x'), { x: 0.7, a: 1.3 }) - evalAt(fa, { x: 0.7, a: 1.3 })) < 1e-7)) throw new Error('check');
    const atHi = qInf ? null : substitute(A, 'x', numNode(q));
    // at ∞ the antiderivative must die away (checked at two values of a)
    if (qInf && ![1.3, 2.1].every((av) => Math.abs(evalAt(A, { x: 60, a: av })) < 1e-9)) throw new EngineError('At x → ∞ the antiderivative does not die away for a > 0, so this integral is not handled here.');
    const atLo = substitute(A, 'x', numNode(p));
    // 1^(a + 1) = 1 and 0^(a + 1) = 0 (for the a where the integral converges)
    const ones = (n) => n.transform((m) => { if (m.isOperatorNode && m.fn === 'pow') { const b = evalAt(m.args[0], {}); if (b === 1) return num(1); if (b === 0) return num(0); } return m; });
    G = tidyMulti(ones(qInf ? mul(num(-1), paren(atLo)) : sub(atHi, atLo)), ['a']);
    steps.push({ title: "F'(a)", depth: 1, lines: [`\\int ${T(fa)}\\,dx = ${T(tidyMulti(A, ['x', 'a']))}`, `F'(a) = ${T(G)}${qInf ? ' \\ (\\text{the } x \\to \\infty \\text{ end gives } 0 \\text{ for } a > 0)' : ''}`] });
  } catch (e) { if (e instanceof EngineError && /die away/.test(e.message)) throw e; throw new EngineError(`NETZ could not integrate ∂f/∂a = ${fa.toString()} with respect to x.`); }
  // F = ∫G da + C
  let H;
  try { H = antiderivative(G, 'a', ['a']).F; } catch { throw new EngineError(`NETZ could not integrate F′(a) = ${G.toString()} with respect to a.`); }
  // C from a known value: a₀ given, else where f(x, a₀) = 0 for all x, else a → ∞
  const Fnum = (av) => quad(substitute(fx, 'a', numNode(av)), p, q);
  let C, cLine;
  const given = String(a0 ?? '').trim();
  const zeroAt = (av) => [0.3, 0.7, 1.9].every((x) => Math.abs(evalAt(fx, { x, a: av })) < 1e-12);
  const cand = given ? [INF.test(given) ? Infinity : Number(math.evaluate(given))] : [0, 1, Infinity].filter((av) => (av === Infinity ? [200, 400].every((b) => Math.abs(Fnum(b)) < 1e-2) : zeroAt(av)));
  if (!cand.length) throw new EngineError('Give a value a₀ where F(a₀) is known (for example where the integrand is 0).');
  const a0v = cand[0];
  if (a0v === Infinity) {
    // F(∞) = 0: C = −lim H(a)
    // far enough out that tan⁻¹a is π/2 to 12 digits, so the constant is recognised
    const lim = evalAt(H, { a: 1e13 });
    C = -lim; cLine = `F(a) \\to 0 \\text{ as } a \\to \\infty \\Rightarrow C = ${recognise(C)}`;
  } else {
    const Fa0 = Fnum(a0v);
    C = Fa0 - evalAt(H, { a: a0v });
    cLine = `F(${exactTex(a0v)}) = ${recognise(Fa0)} \\Rightarrow C = ${recognise(C)}`;
  }
  const Ct = recognise(C);
  const Cnode = /\d\.\d/.test(Ct) ? numNode(C) : math.parse(Ct.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)').replace(/\\pi/g, 'pi').replace(/\\/g, ''));
  const Fa = tidyMulti(add(H, Cnode), ['a']);
  steps.push({ title: 'Integrate back', formula: "F(a) = \\int F'(a)\\,da + C", depth: 0, lines: [`F(a) = ${T(H)} + C`, cLine, `F(a) = ${T(Fa)}`] });
  const verified = [0.6, 1.7].every((av) => { const fv = Fnum(av), formula = evalAt(Fa, { a: av }); return Math.abs(fv - formula) < 1e-4 * Math.max(1, Math.abs(fv)); });
  return { mode, F: T(Fa), steps, notes: qInf ? ['Valid for a > 0, where the integral converges.'] : [], verified, result: T(Fa) };
}
