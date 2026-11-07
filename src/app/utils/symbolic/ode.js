/**
 * Ordinary differential equations, step by step (catalog Unit 12; plan section 5.1, E3).
 * Reading: y', y'', dy/dx, d²y/dx², M dx + N dy = 0, and the operator form (D² − 3D + 2)y = e^(3x).
 * First order (written y' = F(x, y)):
 *   separable  F = g(x)h(y)          ∫ dy/h = ∫ g dx + C
 *   homogeneous F(tx, ty) = F(x, y)  y = vx, then separable in v and x
 *   linear     F = a(x)y + b(x)      integrating factor e^{∫P dx}
 *   Bernoulli  F = a(x)y + b(x)yⁿ    z = y^{1−n} makes it linear
 *   exact      M dx + N dy = 0 with M_y = N_x (and the four integrating-factor rules)
 * Higher order, linear:
 *   constant coefficients: auxiliary equation (complex roots too) → CF; PI by the 1/f(D) shortcuts when R is a
 *   single eᵃˣ / sin / cos / polynomial, otherwise by undetermined coefficients (any sum of xᵏeᵃˣcos bx, sin bx)
 *   variation of parameters (second order)
 *   Cauchy–Euler and Legendre: (x − r)ᵏ coefficients, x − r = eᵗ turns them into constant coefficients
 * Every answer is checked by putting it back into the equation at sample points.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, num, sym, fn, add, sub, mul, div, pow, neg, paren, tidy, polish, simplifyExact, variablesOf, unwrap } from './tree';
import { integrate } from './integral';
import { polynomialCoeffs } from './poly';
import { tidyMulti, equalAt, mtex, exactTex, snap, readMulti, squareSwap } from './multi';
import { substitute } from './iterated';

const Y_WORDS = ['yd', 'ydd', 'yddd', 'ydddd', 'DXX', 'DYY'];
const YD = ['y', 'yd', 'ydd', 'yddd', 'ydddd'];
const PRIME = ['y', "y'", "y''", "y'''", 'y^{(4)}'];

// ---------- small helpers ----------
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const free = (node, names) => ![...variablesOf(node)].some((v) => names.includes(v));
const isZeroNode = (node, vars) => {
  const pts = [[0.37, 0.61], [1.13, -0.42], [0.81, 1.37], [1.71, 0.29], [-0.53, 0.88]];
  let seen = 0;
  for (const p of pts) {
    const s = Object.fromEntries(vars.map((v, i) => [v, p[i % 2] + 0.07 * i]));
    const y = evalAt(node, s);
    if (!Number.isFinite(y)) continue;
    seen++;
    if (Math.abs(y) > 1e-9) return false;
  }
  return seen >= 2;
};
/** A number as an exact node: 3/2, √2/2 (when one fits), else a decimal. */
export function numNode(v) {
  if (Math.abs(v) < 1e-13) return num(0);
  const f = toFraction(v, 1000, 1e-9);
  if (f) return f.d === 1 ? num(f.n) : f.n < 0 ? neg(div(num(-f.n), num(f.d))) : div(num(f.n), num(f.d));
  for (const k of [2, 3, 5, 6, 7]) {
    const g = toFraction(v / Math.sqrt(k), 100, 1e-9);
    if (g) { const core = g.n === 1 && g.d === 1 ? fn('sqrt', num(k)) : mul(div(num(Math.abs(g.n)), num(g.d)), fn('sqrt', num(k))); return g.n < 0 ? neg(core) : core; }
  }
  return num(Number(v.toPrecision(12)));
}
const T = (node) => mtex(polish(node));
const C = (i) => sym(`C${i}`);

/** e^{a ln|u| + b ln u + rest} → |u|^a … written u^a (taking u > 0, as textbooks do), times e^{rest}. */
export function expSimplify(node) {
  return tidy(node.transform((n) => {
    const isExp = n.isFunctionNode && n.fn.name === 'exp';
    const isEpow = n.isOperatorNode && n.fn === 'pow' && n.args[0].isSymbolNode && n.args[0].name === 'e';
    if (!isExp && !isEpow) return n;
    const arg = unwrap(isExp ? n.args[0] : n.args[1]);
    const terms = [];
    const collect = (t, s) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0], s); collect(x.args[1], x.fn === 'subtract' ? -s : s); } else if (x.isOperatorNode && x.fn === 'unaryMinus') collect(x.args[0], -s); else terms.push({ t: x, s }); };
    collect(arg, 1);
    const logOf = (x) => { const y = unwrap(x); if (y.isFunctionNode && y.fn.name === 'log') { const a = unwrap(y.args[0]); return a.isFunctionNode && a.fn.name === 'abs' ? unwrap(a.args[0]) : a; } return null; };
    const factors = [];
    const rest = [];
    for (const { t, s } of terms) {
      let k = s, inner = logOf(t);
      if (!inner && t.isOperatorNode && t.fn === 'multiply' && t.args.length === 2) {
        const [p, q] = t.args.map(unwrap);
        const cnum = (z) => { try { return free(z, ['x', 'y', 't', 'v']) ? z.evaluate({}) : NaN; } catch { return NaN; } };
        if (logOf(q) && Number.isFinite(cnum(p))) { inner = logOf(q); k = s * cnum(p); }
        else if (logOf(p) && Number.isFinite(cnum(q))) { inner = logOf(p); k = s * cnum(q); }
      }
      if (!inner && t.isOperatorNode && t.fn === 'divide' && logOf(t.args[0])) {
        let d; try { d = t.args[1].evaluate({}); } catch { d = NaN; }
        if (Number.isFinite(d)) { inner = logOf(t.args[0]); k = s / d; }
      }
      if (inner) factors.push(Math.abs(k - 1) < 1e-12 ? paren(inner) : pow(paren(inner), numNode(k)));
      else rest.push(s > 0 ? t : neg(t));
    }
    if (!factors.length) return n;
    let out = factors.reduce((a, b) => mul(a, b));
    if (rest.length) out = mul(out, fn('exp', rest.reduce((a, b) => add(a, b))));
    return out;
  }));
}

/** sec, csc, cot written with sin and cos (a second chance for the integrator). */
const toSinCos = (node) => node.transform((n) => {
  if (!n.isFunctionNode) return n;
  const u = n.args[0];
  if (n.fn.name === 'sec') return div(num(1), fn('cos', u));
  if (n.fn.name === 'csc') return div(num(1), fn('sin', u));
  if (n.fn.name === 'cot') return div(fn('cos', u), fn('sin', u));
  if (n.fn.name === 'tan') return div(fn('sin', u), fn('cos', u));
  return n;
});

/**
 * An antiderivative of node in v, checked by differentiating it back. Tries the node as typed, simplified,
 * with sec/csc/cot/tan in sin and cos, and with sin² = 1 − cos². Returns { F, steps }.
 */
export function antiderivative(node, v, vars = [v]) {
  const letters = [...new Set([...variablesOf(node), ...vars, v])].filter((s) => !['pi', 'e'].includes(s));
  const tries = [node];
  const add1 = (f) => { try { tries.push(f()); } catch { /* skip */ } };
  add1(() => simplifyExact(node));
  add1(() => simplifyExact(toSinCos(node)));
  add1(() => simplifyExact(squareSwap(simplifyExact(toSinCos(node)), 'sin')));
  add1(() => simplifyExact(squareSwap(simplifyExact(toSinCos(node)), 'cos')));
  add1(() => math.rationalize(node));
  for (const t of tries) {
    let r;
    try { r = integrate(t, v); } catch { continue; }
    let d;
    try { d = math.derivative(r.result, v); } catch { continue; }
    if (equalAt(d, node, letters)) return { F: tidyMulti(r.result, letters, r.result), steps: r.steps };
  }
  throw new EngineError(`NETZ can't integrate ${T(node)} with respect to ${v} step by step yet.`);
}

// ---------- reading ----------
/**
 * Reads an ODE. Returns { order, E (node, = 0), parts } where y' … are the symbols yd, ydd, …
 * For the operator form, parts.op = { coeffs (a0 … an, numbers), R (node) }.
 */
export function readODE(text) {
  let s = String(text ?? '').trim();
  if (!s) throw new EngineError('Type the differential equation, e.g. dy/dx + y/x = x^2 or y\'\' - 3y\' + 2y = e^(3x).');
  s = s.replace(/[−–]/g, '-').replace(/′/g, "'").replace(/″/g, "''").replace(/²/g, '^2').replace(/³/g, '^3');
  // Operator form (D^2 - 3D + 2)y = R
  const op = s.match(/^\s*\(([^=]*D[^=]*)\)\s*y\s*=\s*(.+)$/);
  if (op) {
    const p = readMulti(op[1].replace(/D/g, 'm'), 'The operator f(D)');
    const c = polynomialCoeffs(p, 'm');
    if (!c || c.length < 2) throw new EngineError('f(D) should be a polynomial in D with constant coefficients, e.g. D^2 - 3D + 2.');
    const R = readMulti(op[2], 'The right side');
    return { order: c.length - 1, op: { coeffs: c.map(Number), R } };
  }
  s = s
    .replace(/d\^?4y\/dx\^?4/g, 'ydddd').replace(/d\^?3y\/dx\^?3/g, 'yddd').replace(/d\^?2y\/dx\^?2/g, 'ydd').replace(/dy\/dx/g, 'yd')
    .replace(/y''''/g, 'ydddd').replace(/y'''/g, 'yddd').replace(/y''/g, 'ydd').replace(/y'/g, 'yd');
  // Differential form M dx + N dy = 0
  if (/\bdx\b|dx\b/.test(s) && /dy\b/.test(s) && !/yd/.test(s)) {
    s = s.replace(/\)\s*dx/g, ')*DXX').replace(/\)\s*dy/g, ')*DYY').replace(/(\w)\s*dx\b/g, '$1*DXX').replace(/(\w)\s*dy\b/g, '$1*DYY').replace(/\bdx\b/g, 'DXX').replace(/\bdy\b/g, 'DYY');
  }
  const sides = s.split('=');
  if (sides.length > 2) throw new EngineError('The equation should have one = sign.');
  const L = readMulti(sides[0], 'The equation', Y_WORDS);
  const R = sides.length === 2 ? readMulti(sides[1], 'The equation', Y_WORDS) : num(0);
  const E = sides.length === 2 ? sub(L, R) : L;
  const vars = [...variablesOf(E)];
  if (vars.includes('DXX') || vars.includes('DYY')) {
    const M = tidy(math.derivative(E, 'DXX')), N = tidy(math.derivative(E, 'DYY'));
    if (!free(M, ['DXX', 'DYY']) || !free(N, ['DXX', 'DYY'])) throw new EngineError('Write the equation as M dx + N dy = 0.');
    return { order: 1, M, N };
  }
  let order = 0;
  YD.forEach((w, k) => { if (k > 0 && vars.includes(w)) order = Math.max(order, k); });
  if (order === 0) throw new EngineError('No derivative found: write y\' (or dy/dx), y\'\' (or d^2y/dx^2), …');
  const bad = vars.filter((v) => !['x', 'y', ...YD].includes(v));
  if (bad.length) throw new EngineError(`The equation may use x, y and its derivatives only (it also has ${bad.join(', ')}).`);
  return { order, E };
}

// ---------- first order ----------
/** y' = F(x, y) from E = A y' + B (A, B free of y'), or from M dx + N dy = 0 (y' = −M/N). */
function firstOrderForm(ode) {
  if (ode.M) {
    const F = tidyMulti(neg(div(paren(ode.M), paren(ode.N))), ['x', 'y']);
    return { F, M: ode.M, N: ode.N };
  }
  const A = tidy(math.derivative(ode.E, 'yd'));
  if (!free(A, ['yd'])) throw new EngineError('This first-order equation is not linear in y\' (e.g. Clairaut\'s form); NETZ handles equations that can be written y\' = F(x, y).');
  const B = tidy(substitute(ode.E, 'yd', num(0)));
  if (isZeroNode(A, ['x', 'y'])) throw new EngineError('y\' cancels out of this equation.');
  const F = tidyMulti(neg(div(paren(B), paren(A))), ['x', 'y']);
  return { F, M: B, N: A };
}

const PTS2 = [[0.7, 0.9], [1.3, 0.6], [0.9, 1.7], [1.8, 1.2], [1.1, 2.3], [2.4, 0.8]];
const Fn = (F) => (x, y) => evalAt(F, { x, y });

export function isSeparable(F) {
  const f = Fn(F);
  let seen = 0;
  for (let i = 0; i < PTS2.length; i++) for (let j = i + 1; j < PTS2.length; j++) {
    const [x1, y1] = PTS2[i], [x2, y2] = PTS2[j];
    const a = f(x1, y1) * f(x2, y2), b = f(x1, y2) * f(x2, y1);
    if (![a, b].every(Number.isFinite)) continue;
    seen++;
    if (Math.abs(a - b) > 1e-8 * Math.max(1, Math.abs(a))) return false;
  }
  return seen >= 4;
}
export function isHomogeneous0(F) {
  const f = Fn(F);
  let seen = 0;
  for (const [x, y] of PTS2) for (const t of [2, 0.5, 3]) {
    const a = f(x, y), b = f(t * x, t * y);
    if (![a, b].every(Number.isFinite)) continue;
    seen++;
    if (Math.abs(a - b) > 1e-8 * Math.max(1, Math.abs(a))) return false;
  }
  return seen >= 4;
}
/** { a, b } with F = a(x) y + b(x), or null. */
export function linearParts(F) {
  const Fy = tidy(math.derivative(F, 'y'));
  if (!isZeroNode(math.derivative(Fy, 'y'), ['x', 'y'])) return null;
  const a = tidyMulti(substitute(Fy, 'y', num(1.234567)), ['x']);
  if (!free(a, ['y'])) return null;
  return { a: tidyMulti(substitute(Fy, 'y', num(1)), ['x']), b: tidyMulti(substitute(F, 'y', num(0)), ['x']) };
}
/** { a, b, n } with F = a(x) y + b(x) yⁿ (n ≠ 0, 1), or null. */
export function bernoulliParts(F) {
  const Fy = tidy(math.derivative(F, 'y'));
  const H = sub(F, mul(sym('y'), Fy)); // = (1 − n) b yⁿ
  const Hy = math.derivative(H, 'y');
  const ns = PTS2.map(([x, y]) => (y * evalAt(Hy, { x, y })) / evalAt(H, { x, y })).filter(Number.isFinite);
  if (ns.length < 3 || ns.some((n) => Math.abs(n - ns[0]) > 1e-7)) return null;
  const n = snap(ns[0]);
  if (Math.abs(n) < 1e-9 || Math.abs(n - 1) < 1e-9) return null;
  const b = tidyMulti(div(substitute(H, 'y', num(1)), numNode(1 - n)), ['x']);
  const a = tidyMulti(sub(substitute(Fy, 'y', num(1)), mul(numNode(n), b)), ['x']);
  // Check F = a y + b yⁿ
  const back = add(mul(a, sym('y')), mul(b, pow(sym('y'), numNode(n))));
  if (!PTS2.every(([x, y]) => Math.abs(evalAt(back, { x, y }) - evalAt(F, { x, y })) < 1e-8 * Math.max(1, Math.abs(evalAt(F, { x, y }))))) return null;
  return { a, b, n };
}

/** Check an implicit solution G(x, y) = C of y' = F: G_x + G_y F = 0. */
function implicitOk(G, F) {
  const Gx = math.derivative(G, 'x'), Gy = math.derivative(G, 'y');
  let seen = 0;
  for (const [x, y] of PTS2) {
    const v = evalAt(Gx, { x, y }) + evalAt(Gy, { x, y }) * evalAt(F, { x, y });
    const scale = Math.max(1, Math.abs(evalAt(Gx, { x, y })));
    if (!Number.isFinite(v)) continue;
    seen++;
    if (Math.abs(v) > 1e-6 * scale) return false;
  }
  return seen >= 3;
}
/** Check an explicit solution y(x) (containing C) of y' = F. */
function explicitOk(Y, F) {
  const dY = math.derivative(Y, 'x');
  let seen = 0;
  for (const c of [1.3, -0.7]) for (const x of [0.6, 1.1, 1.7, 2.3]) {
    const s = { x, C: c };
    const y = evalAt(Y, s);
    const v = evalAt(dY, s) - evalAt(F, { x, y });
    if (!Number.isFinite(v)) continue;
    seen++;
    if (Math.abs(v) > 1e-6 * Math.max(1, Math.abs(evalAt(dY, s)))) return false;
  }
  return seen >= 3;
}
const nice = (n, vars) => tidyMulti(expSimplify(n), vars);

function solveSeparable(F) {
  const f = Fn(F);
  const pick = [[1, 1], [0, 1], [1, 0], [2, 1], [1, 2], [0.5, 1]].find(([x, y]) => { const v = f(x, y); return Number.isFinite(v) && Math.abs(v) > 1e-9; });
  if (!pick) throw new EngineError('F(x, y) is zero or undefined at the test points.');
  const [x0, y0] = pick;
  const h = tidyMulti(substitute(F, 'x', numNode(x0)), ['y']);
  const g = tidyMulti(div(substitute(F, 'y', numNode(y0)), numNode(f(x0, y0))), ['x']);
  const Hy = antiderivative(div(num(1), paren(h)), 'y', ['y']);
  const Gx = antiderivative(g, 'x', ['x']);
  const steps = [
    { title: 'Separate the variables', formula: '\\frac{dy}{h(y)} = g(x)\\,dx', lines: [`\\frac{dy}{dx} = ${T(F)} = \\left(${T(g)}\\right)\\left(${T(h)}\\right)`, `\\frac{dy}{${T(h)}} = ${T(g)}\\,dx`] },
    { title: 'Integrate both sides', lines: [`\\int \\frac{dy}{${T(h)}} = ${T(Hy.F)}, \\qquad \\int ${T(g)}\\,dx = ${T(Gx.F)}`] },
  ];
  Hy.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  Gx.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  const G = sub(Hy.F, Gx.F);
  const ok = implicitOk(G, F);
  let answer = `${T(Hy.F)} = ${T(Gx.F)} + C`, explicit = null;
  // ln|y| = … → y = C e^{…}
  const lnRatio = [1.3, 2.1, 0.6].map((y) => evalAt(Hy.F, { y }) / Math.log(Math.abs(y)));
  if (lnRatio.every((r) => Number.isFinite(r) && Math.abs(r - lnRatio[0]) < 1e-9)) {
    const k = snap(lnRatio[0]);
    explicit = nice(mul(sym('C'), fn('exp', div(Gx.F, numNode(k)))), ['x', 'C']);
    steps.push({ title: 'Solve for y', lines: [`${Math.abs(k - 1) < 1e-12 ? '' : exactTex(k)}\\ln|y| = ${T(Gx.F)} + c \\;\\Rightarrow\\; y = ${T(explicit)}`] });
  }
  if (explicit && !explicitOk(explicit, F)) explicit = null;
  steps.push({ title: 'General solution', lines: [explicit ? `y = ${T(explicit)}` : answer] });
  return { method: 'separable', answer: explicit ? `y = ${T(explicit)}` : answer, explicit, verified: ok, steps };
}

function solveHomogeneous(F) {
  const v = sym('v');
  const fv = tidyMulti(substitute(substitute(F, 'y', v), 'x', num(1)), ['v']);
  const den = tidyMulti(sub(fv, v), ['v']);
  const steps = [
    { title: 'Check: F(tx, ty) = F(x, y)', lines: ['\\text{So the equation is homogeneous: put } y = vx, \\ \\frac{dy}{dx} = v + x\\frac{dv}{dx}'] },
    { title: 'Substitute y = vx', lines: [`v + x\\frac{dv}{dx} = ${T(fv)}`, `x\\frac{dv}{dx} = ${T(den)}`] },
  ];
  if (isZeroNode(den, ['v'])) {
    steps.push({ title: 'v is constant', lines: ['\\frac{dv}{dx} = 0 \\Rightarrow v = C \\Rightarrow y = Cx'] });
    return { method: 'homogeneous', answer: 'y = Cx', explicit: math.parse('C*x'), verified: true, steps };
  }
  const Hv = antiderivative(div(num(1), paren(den)), 'v', ['v']);
  steps.push({ title: 'Separate and integrate', formula: '\\int \\frac{dv}{f(v) - v} = \\int \\frac{dx}{x}', lines: [`\\int \\frac{dv}{${T(den)}} = \\ln|x| + C \\;\\Rightarrow\\; ${T(Hv.F)} = \\ln|x| + C`] });
  Hv.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  const back = tidyMulti(substitute(Hv.F, 'v', div(sym('y'), sym('x'))), ['x', 'y']);
  const G = sub(back, fn('log', fn('abs', sym('x'))));
  const ok = implicitOk(G, F);
  const answer = `${T(back)} = \\ln|x| + C`;
  steps.push({ title: 'Put back v = y/x', lines: [answer] });
  return { method: 'homogeneous', answer, explicit: null, verified: ok, steps };
}

function solveLinear(F, parts, label = 'y') {
  const P = tidyMulti(neg(parts.a), ['x']), Q = parts.b;
  const steps = [{ title: 'Standard form', formula: '\\frac{dy}{dx} + P(x)\\,y = Q(x)', lines: [`\\frac{d${label}}{dx} + \\left(${T(P)}\\right)${label} = ${T(Q)}`, `P = ${T(P)}, \\qquad Q = ${T(Q)}`] }];
  const IP = antiderivative(P, 'x');
  const IF = nice(fn('exp', IP.F), ['x']);
  steps.push({ title: 'Integrating factor', formula: '\\text{IF} = e^{\\int P\\,dx}', lines: [`\\int P\\,dx = ${T(IP.F)} \\;\\Rightarrow\\; \\text{IF} = ${T(IF)}`] });
  const QI = tidyMulti(mul(Q, IF), ['x']);
  const IQ = antiderivative(QI, 'x');
  steps.push({ title: 'Multiply by the IF and integrate', formula: `${label}\\cdot\\text{IF} = \\int Q\\cdot\\text{IF}\\,dx + C`, lines: [`${label}\\left(${T(IF)}\\right) = \\int ${T(QI)}\\,dx = ${T(IQ.F)} + C`] });
  IQ.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  const Y = nice(div(paren(add(IQ.F, sym('C'))), paren(IF)), ['x', 'C']);
  steps.push({ title: 'Divide by the IF', lines: [`${label} = ${T(Y)}`] });
  return { Y, steps, IF };
}

function solveBernoulli(F, bp) {
  const { a, b, n } = bp;
  const m = 1 - n;
  const steps = [{ title: 'Bernoulli form', formula: '\\frac{dy}{dx} + Py = Qy^{n}', lines: [`\\frac{dy}{dx} + \\left(${T(neg(a))}\\right)y = \\left(${T(b)}\\right)y^{${exactTex(n)}}`, `n = ${exactTex(n)}: \\text{ put } z = y^{1-n} = y^{${exactTex(m)}}, \\quad \\frac{dz}{dx} = ${exactTex(m)}\\,y^{${exactTex(-n)}}\\frac{dy}{dx}`] }];
  const lin = { a: tidyMulti(mul(numNode(m), a), ['x']), b: tidyMulti(mul(numNode(m), b), ['x']) };
  steps.push({ title: 'A linear equation in z', lines: [`\\frac{dz}{dx} + \\left(${T(neg(lin.a))}\\right)z = ${T(lin.b)}`] });
  const r = solveLinear(F, lin, 'z');
  r.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  const Y = nice(pow(paren(r.Y), numNode(1 / m)), ['x', 'C']);
  const ok = explicitOk(Y, F) || implicitOk(sub(pow(sym('y'), numNode(m)), r.Y), F);
  const answer = `y^{${exactTex(m)}} = ${T(r.Y)}`;
  steps.push({ title: 'Put back z = y^{1−n}', lines: [answer] });
  return { method: 'bernoulli', answer, explicit: Math.abs(m + 1) < 1e-12 || Math.abs(m - 1) < 1e-12 ? Y : null, verified: ok, steps };
}

/** Integrating factors for M dx + N dy = 0 when it is not exact. */
function integratingFactor(M, N) {
  const My = math.derivative(M, 'y'), Nx = math.derivative(N, 'x');
  const diff = tidyMulti(sub(My, Nx), ['x', 'y']);
  const f1 = tidyMulti(div(paren(diff), paren(N)), ['x', 'y']);
  if (free(f1, ['y']) || isZeroNode(math.derivative(f1, 'y'), ['x', 'y'])) {
    const If = antiderivative(f1, 'x');
    return { mu: nice(fn('exp', If.F), ['x']), rule: `\\frac{M_y - N_x}{N} = ${T(f1)} \\text{ (a function of x only)} \\Rightarrow \\text{IF} = e^{\\int ${T(f1)}\\,dx}` };
  }
  const f2 = tidyMulti(div(neg(paren(diff)), paren(M)), ['x', 'y']);
  if (free(f2, ['x']) || isZeroNode(math.derivative(f2, 'x'), ['x', 'y'])) {
    const If = antiderivative(f2, 'y', ['y']);
    return { mu: nice(fn('exp', If.F), ['y']), rule: `\\frac{N_x - M_y}{M} = ${T(f2)} \\text{ (a function of y only)} \\Rightarrow \\text{IF} = e^{\\int ${T(f2)}\\,dy}` };
  }
  const homo = (node) => { const f = Fn(node); const r = PTS2.map(([x, y]) => Math.log(f(2 * x, 2 * y) / f(x, y)) / Math.log(2)); return r.every((v) => Number.isFinite(v) && Math.abs(v - r[0]) < 1e-8); };
  const xMyN = tidyMulti(add(mul(sym('x'), M), mul(sym('y'), N)), ['x', 'y']);
  if (homo(M) && homo(N) && !isZeroNode(xMyN, ['x', 'y'])) return { mu: tidyMulti(div(num(1), paren(xMyN)), ['x', 'y']), rule: `M, N \\text{ homogeneous} \\Rightarrow \\text{IF} = \\frac{1}{Mx + Ny} = \\frac{1}{${T(xMyN)}}` };
  const xMmyN = tidyMulti(sub(mul(sym('x'), M), mul(sym('y'), N)), ['x', 'y']);
  if (!isZeroNode(xMmyN, ['x', 'y'])) {
    const mu = tidyMulti(div(num(1), paren(xMmyN)), ['x', 'y']);
    const Mm = mul(mu, M), Nm = mul(mu, N);
    if (isZeroNode(sub(math.derivative(Mm, 'y'), math.derivative(Nm, 'x')), ['x', 'y'])) return { mu, rule: `M = yf(xy),\\ N = xg(xy) \\Rightarrow \\text{IF} = \\frac{1}{Mx - Ny} = \\frac{1}{${T(xMmyN)}}` };
  }
  return null;
}

function solveExact(M0, N0, F) {
  const steps = [];
  let M = M0, N = N0;
  const My = () => tidyMulti(math.derivative(M, 'y'), ['x', 'y']), Nx = () => tidyMulti(math.derivative(N, 'x'), ['x', 'y']);
  steps.push({ title: 'Write it as M dx + N dy = 0', lines: [`M = ${T(M)}, \\qquad N = ${T(N)}`] });
  let exact = isZeroNode(sub(My(), Nx()), ['x', 'y']);
  steps.push({ title: 'Test for exactness', formula: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}', lines: [`\\frac{\\partial M}{\\partial y} = ${T(My())}, \\qquad \\frac{\\partial N}{\\partial x} = ${T(Nx())} \\quad ${exact ? '\\text{(equal: exact)}' : '\\text{(not equal)}'}`] });
  if (!exact) {
    const f = integratingFactor(M, N);
    if (!f) throw new EngineError('The equation is not exact, and none of the four standard integrating-factor rules applies.');
    M = tidyMulti(mul(f.mu, M), ['x', 'y']); N = tidyMulti(mul(f.mu, N), ['x', 'y']);
    exact = isZeroNode(sub(math.derivative(M, 'y'), math.derivative(N, 'x')), ['x', 'y']);
    steps.push({ title: 'Integrating factor', lines: [f.rule, `\\text{IF} = ${T(f.mu)}: \\quad M = ${T(M)}, \\ N = ${T(N)}`] });
    if (!exact) throw new EngineError('Even after the integrating factor the equation is not exact; NETZ can\'t finish this one.');
  }
  const IM = antiderivative(M, 'x', ['x', 'y']);
  const hprime = tidyMulti(sub(N, math.derivative(IM.F, 'y')), ['x', 'y']);
  if (!free(hprime, ['x']) && !isZeroNode(math.derivative(hprime, 'x'), ['x', 'y'])) throw new EngineError('NETZ could not finish the exact equation (the leftover still depends on x).');
  const hy = isZeroNode(hprime, ['x', 'y']) ? { F: num(0), steps: [] } : antiderivative(tidyMulti(substitute(hprime, 'x', num(1)), ['y']), 'y', ['y']);
  steps.push({
    title: 'Integrate', formula: '\\int M\\,dx\\ (y\\text{ constant}) + \\int (\\text{terms of } N \\text{ without } x)\\,dy = C',
    lines: [`\\int M\\,dx = ${T(IM.F)}, \\qquad \\text{terms of N without x: } ${T(hprime)} \\Rightarrow \\int = ${T(hy.F)}`],
  });
  const G = tidyMulti(add(IM.F, hy.F), ['x', 'y']);
  const answer = `${T(G)} = C`;
  steps.push({ title: 'General solution', lines: [answer] });
  return { method: 'exact', answer, explicit: null, verified: implicitOk(G, F), steps };
}

// ---------- higher order, constant coefficients ----------
/** Roots of a real polynomial (ascending coefficients), Durand–Kerner, snapped; grouped with multiplicity. */
export function polyRootsComplex(c) {
  const a = [...c].reverse().map((v) => v / c.at(-1));
  const n = a.length - 1;
  let z = Array.from({ length: n }, (_, k) => ({ re: 0.4 * Math.cos((2 * Math.PI * k) / n + 0.3), im: 0.9 * Math.sin((2 * Math.PI * k) / n + 0.3) }));
  const mulC = (p, q) => ({ re: p.re * q.re - p.im * q.im, im: p.re * q.im + p.im * q.re });
  const divC = (p, q) => { const d = q.re * q.re + q.im * q.im; return { re: (p.re * q.re + p.im * q.im) / d, im: (p.im * q.re - p.re * q.im) / d }; };
  // Horner: p(x) = (…(1·x + a1)x + a2)…
  const evalP = (x) => a.reduce((acc, k) => { const m = mulC(acc, x); return { re: m.re + k, im: m.im }; }, { re: 0, im: 0 });
  for (let it = 0; it < 2000; it++) {
    let moved = 0;
    z = z.map((zi, i) => {
      let den = { re: 1, im: 0 };
      z.forEach((zj, j) => { if (j !== i) den = mulC(den, { re: zi.re - zj.re, im: zi.im - zj.im }); });
      const step = divC(evalP(zi), den);
      moved = Math.max(moved, Math.hypot(step.re, step.im));
      return { re: zi.re - step.re, im: zi.im - step.im };
    });
    if (moved < 1e-15) break;
  }
  // Group (repeated roots converge slowly: cluster within 1e-4) and snap
  const groups = [];
  for (const r of z) {
    const g = groups.find((q) => Math.hypot(q.re - r.re, q.im - r.im) < 1e-4);
    if (g) { g.m++; g.sre += r.re; g.sim += r.im; } else groups.push({ re: r.re, im: r.im, sre: r.re, sim: r.im, m: 1 });
  }
  return groups.map((g) => ({ re: snap(g.sre / g.m), im: Math.abs(g.sim / g.m) < 1e-7 ? 0 : snap(g.sim / g.m), m: g.m }))
    .filter((r) => r.im >= 0)
    .sort((p, q) => p.re - q.re || p.im - q.im);
}

const fTex = (coeffs, letter) => {
  const terms = [];
  for (let k = coeffs.length - 1; k >= 0; k--) {
    const c = coeffs[k];
    if (Math.abs(c) < 1e-12) continue;
    const body = k === 0 ? '' : k === 1 ? letter : `${letter}^{${k}}`;
    const mag = exactTex(Math.abs(c));
    const coef = body && mag === '1' ? '' : mag;
    terms.push({ s: c < 0 ? '-' : '+', t: `${coef}${body}` });
  }
  return terms.map((t, i) => (i === 0 ? (t.s === '-' ? '-' : '') : ` ${t.s} `) + t.t).join('');
};

/** The CF basis functions (nodes) for roots, in variable v. */
function cfBasis(roots, v = 'x') {
  const X = sym(v);
  const out = [];
  for (const r of roots) {
    for (let j = 0; j < r.m; j++) {
      const xp = j === 0 ? null : j === 1 ? X : pow(X, num(j));
      const e = Math.abs(r.re) < 1e-12 ? null : fn('exp', mul(numNode(r.re), X));
      const prod = (...f) => f.filter(Boolean).reduce((a, b) => (a ? mul(a, b) : b), null) || num(1);
      if (r.im === 0) out.push(prod(xp, e));
      else {
        const arg = Math.abs(r.im - 1) < 1e-12 ? X : mul(numNode(r.im), X);
        out.push(prod(xp, e, fn('cos', arg)), prod(xp, e, fn('sin', arg)));
      }
    }
  }
  return out;
}
const rootTex = (r) => (r.im === 0 ? exactTex(r.re) : `${Math.abs(r.re) < 1e-12 ? '' : `${exactTex(r.re)} `}\\pm ${Math.abs(r.im - 1) < 1e-12 ? '' : exactTex(r.im)}i`);

/** L[y] = Σ a_k y^(k) for a node y(v). */
const applyL = (coeffs, node, v) => {
  let d = node, sum = null;
  coeffs.forEach((c, k) => {
    if (k > 0) d = math.derivative(d, v);
    if (Math.abs(c) < 1e-14) return;
    const term = mul(numNode(c), d);
    sum = sum ? add(sum, term) : term;
  });
  return sum || num(0);
};

/** The kinds of terms in R: [{ a, b, k }] for xᵏ e^{ax} (cos, sin)(bx). */
/** Multiply products of sums out: 6(eᵗ − 1.5) → 6eᵗ − 9 (one level at a time, until nothing changes). */
function distribute(node) {
  let cur = node;
  for (let i = 0; i < 6; i++) {
    let changed = false;
    cur = cur.transform((n) => {
      const x = unwrap(n);
      if (!(x.isOperatorNode && x.fn === 'multiply' && x.args.length === 2)) return n;
      const [p, q] = x.args.map(unwrap);
      const isSum = (z) => z.isOperatorNode && (z.fn === 'add' || z.fn === 'subtract');
      if (isSum(q)) { changed = true; return new math.OperatorNode(q.op, q.fn, [mul(p, q.args[0]), mul(p, q.args[1])]); }
      if (isSum(p)) { changed = true; return new math.OperatorNode(p.op, p.fn, [mul(p.args[0], q), mul(p.args[1], q)]); }
      return n;
    });
    if (!changed) break;
  }
  return cur;
}

function termTypes(R, v) {
  const expanded = (() => { try { return simplifyExact(distribute(R).transform((n) => (n.isFunctionNode && n.fn.name === 'sinh' ? div(sub(fn('exp', n.args[0]), fn('exp', neg(n.args[0]))), num(2)) : n.isFunctionNode && n.fn.name === 'cosh' ? div(add(fn('exp', n.args[0]), fn('exp', neg(n.args[0]))), num(2)) : n))); } catch { return R; } })();
  const terms = [];
  const collect = (t) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { collect(x.args[0]); collect(x.args[1]); } else if (x.isOperatorNode && x.fn === 'unaryMinus') collect(x.args[0]); else terms.push(x); };
  collect(expanded);
  const types = [];
  for (const t of terms) {
    if (free(t, [v])) { types.push({ a: 0, b: 0, k: 0 }); continue; }
    let a = 0, b = 0, trig = 0;
    const factors = [];
    const fl = (z) => { const x = unwrap(z); if (x.isOperatorNode && x.fn === 'multiply') x.args.forEach(fl); else if (x.isOperatorNode && x.fn === 'divide' && free(x.args[1], [v])) fl(x.args[0]); else if (x.isOperatorNode && x.fn === 'unaryMinus') fl(x.args[0]); else factors.push(x); };
    fl(t);
    const poly = [];
    const slope = (u) => { const c = polynomialCoeffs(u, v); return c && c.length === 2 ? Number(c[1]) : c && c.length === 1 ? 0 : NaN; };
    for (const f of factors) {
      if (free(f, [v])) continue;
      if (f.isFunctionNode && f.fn.name === 'exp') { const s = slope(unwrap(f.args[0])); if (!Number.isFinite(s)) return null; a += s; continue; }
      if (f.isOperatorNode && f.fn === 'pow' && f.args[0].isSymbolNode && f.args[0].name === 'e') { const s = slope(unwrap(f.args[1])); if (!Number.isFinite(s)) return null; a += s; continue; }
      if (f.isFunctionNode && ['sin', 'cos'].includes(f.fn.name)) { const s = slope(unwrap(f.args[0])); if (!Number.isFinite(s)) return null; b = Math.abs(s); trig++; continue; }
      poly.push(f);
    }
    if (trig > 1) throw new EngineError('Write products of sines and cosines as sums first (e.g. 2 sin x cos x = sin 2x).');
    let k = 0;
    if (poly.length) {
      const c = polynomialCoeffs(poly.reduce((p, q) => mul(p, q)), v);
      if (!c) return null;
      k = c.length - 1;
    }
    types.push({ a: snap(a), b: snap(b), k });
  }
  // Merge equal (a, b)
  const merged = [];
  for (const t of types) {
    const g = merged.find((q) => Math.abs(q.a - t.a) < 1e-9 && Math.abs(q.b - t.b) < 1e-9);
    if (g) g.k = Math.max(g.k, t.k); else merged.push({ ...t });
  }
  return merged;
}

/** Particular integral by undetermined coefficients (exact coefficients by sampling + snapping). */
function particular(coeffs, roots, R, v) {
  const types = termTypes(R, v);
  if (!types) throw new EngineError('NETZ can find a particular integral when the right side is made of xᵏ, eᵃˣ, sin bx, cos bx (and their products and sums).');
  const X = sym(v);
  const basis = [];
  const trial = [];
  for (const t of types) {
    const root = roots.find((r) => Math.abs(r.re - t.a) < 1e-9 && Math.abs(r.im - t.b) < 1e-9);
    const s = root ? root.m : 0;
    for (let j = s; j <= t.k + s; j++) {
      const xp = j === 0 ? null : j === 1 ? X : pow(X, num(j));
      const e = Math.abs(t.a) < 1e-12 ? null : fn('exp', mul(numNode(t.a), X));
      const prod = (...f) => f.filter(Boolean).reduce((p, q) => (p ? mul(p, q) : q), null) || num(1);
      if (t.b === 0) basis.push(prod(xp, e));
      else {
        const arg = Math.abs(t.b - 1) < 1e-12 ? X : mul(numNode(t.b), X);
        basis.push(prod(xp, e, fn('cos', arg)), prod(xp, e, fn('sin', arg)));
      }
    }
    trial.push({ ...t, s });
  }
  const Lb = basis.map((bf) => applyL(coeffs, bf, v).compile());
  const Rc = R.compile();
  const m = basis.length;
  const xs = Array.from({ length: 3 * m + 3 }, (_, i) => 0.15 + (1.6 * i) / (3 * m + 3));
  const A = xs.map((x) => Lb.map((f) => f.evaluate({ [v]: x })));
  const bvec = xs.map((x) => Rc.evaluate({ [v]: x }));
  // Least squares: (AᵀA) c = Aᵀb
  const AtA = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => A.reduce((s, row) => s + row[i] * row[j], 0)));
  const Atb = Array.from({ length: m }, (_, i) => A.reduce((s, row, r) => s + row[i] * bvec[r], 0));
  const cvec = gauss(AtA, Atb);
  if (!cvec) throw new EngineError('NETZ could not find the particular integral.');
  const cs = cvec.map(snap);
  const resid = Math.max(...xs.map((x, r) => Math.abs(A[r].reduce((s, a2, i) => s + a2 * cs[i], 0) - bvec[r])));
  const scale = Math.max(1, ...bvec.map(Math.abs));
  const coefs = resid < 1e-7 * scale ? cs : cvec;
  let PI = null;
  basis.forEach((bf, i) => { if (Math.abs(coefs[i]) < 1e-12) return; const t = mul(numNode(coefs[i]), bf); PI = PI ? add(PI, t) : t; });
  return { PI: PI ? tidyMulti(PI, [v]) : num(0), trial, basis, coefs };
}
function gauss(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-13) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** f(a) for ascending coefficients, and its derivatives. */
const fAt = (c, a, d = 0) => { let s = 0; for (let k = d; k < c.length; k++) { let f = 1; for (let j = 0; j < d; j++) f *= k - j; s += c[k] * f * a ** (k - d); } return s; };

/**
 * Solves Σ a_k y^(k) = R with constant a_k in variable v. Returns { roots, cf, pi, Y, steps }.
 * ICs: [{ k, x0, val }] (y^(k)(x0) = val).
 */
export function solveConstant(coeffs, R, v = 'x', ics = [], show = true) {
  const n = coeffs.length - 1;
  const steps = [];
  const D = fTex(coeffs, 'D');
  steps.push({ title: 'Operator form', formula: 'f(D)\\,y = R', lines: [`\\left(${D}\\right)y = ${T(R)}`] });
  const roots = polyRootsComplex(coeffs);
  steps.push({ title: 'Auxiliary equation', formula: 'f(m) = 0', lines: [`${fTex(coeffs, 'm')} = 0 \\;\\Rightarrow\\; m = ${roots.map((r) => `${rootTex(r)}${r.m > 1 ? `\\ (\\text{${r.m} times})` : ''}`).join(', \\ ')}`] });
  const basis = cfBasis(roots, v);
  if (basis.length !== n) throw new EngineError('NETZ could not find all the roots of the auxiliary equation.');
  const cf = basis.map((b, i) => mul(C(i + 1), b)).reduce((a, b) => add(a, b));
  const cfT = tidy(cf);
  const rule = roots.some((r) => r.im) ? 'm = \\alpha \\pm i\\beta \\Rightarrow e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x)' : roots.some((r) => r.m > 1) ? '\\text{repeated } m \\Rightarrow (C_1 + C_2x)e^{mx}' : 'C_1e^{m_1x} + C_2e^{m_2x} + \\cdots';
  // the basis is already in v; only the rule's own x (not the x inside \text, \alpha …) changes
  steps.push({ title: 'Complementary function', formula: rule.replace(/(?<![a-zA-Z\\])x/g, v), lines: [`\\text{CF} = ${T(cfT)}`] });
  let piNode = num(0);
  const zeroR = isZeroNode(R, [v]);
  if (!zeroR) {
    const p = particular(coeffs, roots, R, v);
    piNode = p.PI;
    // Textbook shortcut lines for single simple right sides
    const t = p.trial;
    const lines = [];
    if (t.length === 1 && t[0].k === 0 && t[0].b === 0) {
      const a = t[0].a;
      const fa = fAt(coeffs, a);
      if (Math.abs(fa) > 1e-12) lines.push(`\\text{PI} = \\frac{1}{f(D)}${T(R)} = \\frac{${T(R)}}{f(${exactTex(a)})} = \\frac{${T(R)}}{${exactTex(fa)}}`);
      else lines.push(`f(${exactTex(a)}) = 0 \\ (\\text{a root ${t[0].s} time${t[0].s > 1 ? 's' : ''}}) \\Rightarrow \\text{PI} = \\frac{${v}^{${t[0].s}}}{f^{(${t[0].s})}(${exactTex(a)})}${T(R)}`.replace('^{1}', ''));
    } else if (t.length === 1 && t[0].a === 0 && t[0].b !== 0 && t[0].k === 0) {
      lines.push(`\\frac{1}{f(D)}${T(R)}: \\text{ put } D^2 = -${exactTex(t[0].b ** 2)}${t[0].s ? ' (a root, so multiply by ' + v + ')' : ''}`);
    } else if (t.length === 1 && t[0].a === 0 && t[0].b === 0) {
      lines.push(`\\text{PI} = [f(D)]^{-1}${T(R)}: \\text{ expand } [f(D)]^{-1} \\text{ in powers of } D`);
    } else {
      lines.push(`\\text{Trial: } y_p = ${p.basis.map((b, i) => `${String.fromCharCode(65 + i)}\\,${T(b)}`).join(' + ')}`);
      lines.push(`\\text{Put it in and match terms: } ${p.coefs.map((c, i) => `${String.fromCharCode(65 + i)} = ${exactTex(c)}`).join(', \\ ')}`);
    }
    lines.push(`\\text{PI} = ${T(piNode)}`);
    steps.push({ title: 'Particular integral', formula: '\\text{PI} = \\frac{1}{f(D)}R', lines });
  }
  let Y = tidy(add(cfT, piNode));
  steps.push({ title: 'General solution', formula: 'y = \\text{CF} + \\text{PI}', lines: [`y = ${T(Y)}`] });
  // Initial conditions
  if (ics.length) {
    if (ics.length !== n) throw new EngineError(`An order-${n} equation needs ${n} initial conditions (given ${ics.length}).`);
    const rows = ics.map(({ k, x0 }) => basis.map((b) => { let d = b; for (let j = 0; j < k; j++) d = math.derivative(d, v); return evalAt(d, { [v]: x0 }); }));
    const rhs = ics.map(({ k, x0, val }) => { let d = piNode; for (let j = 0; j < k; j++) d = math.derivative(d, v); return val - evalAt(d, { [v]: x0 }); });
    const cs = gauss(rows, rhs);
    if (!cs) throw new EngineError('These initial conditions don\'t fix the constants.');
    let sub1 = Y;
    cs.forEach((c, i) => { sub1 = substitute(sub1, `C${i + 1}`, numNode(snap(c))); });
    Y = tidyMulti(sub1, [v]);
    steps.push({ title: 'Use the initial conditions', lines: [`${cs.map((c, i) => `C_{${i + 1}} = ${exactTex(snap(c))}`).join(', \\ ')}`, `y = ${T(Y)}`] });
  }
  // Check: L[y] = R
  const resid = sub(applyL(coeffs, Y, v), R);
  const scope = { C1: 1.3, C2: -0.7, C3: 0.4, C4: 0.9 };
  const ok = [0.3, 0.8, 1.4, 2.1].every((x) => { const r = evalAt(resid, { ...scope, [v]: x }); return !Number.isFinite(r) || Math.abs(r) < 1e-6 * Math.max(1, Math.abs(evalAt(R, { [v]: x }))); });
  void show;
  return { roots, cf: cfT, pi: piNode, Y, steps, verified: ok, basis };
}

/** Reads "y(0) = 1, y'(0) = 0" into [{ k, x0, val }]. */
export function readICs(text) {
  const s = String(text ?? '').trim();
  if (!s) return [];
  return s.split(/[,;]/).map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = p.replace(/′/g, "'").match(/^y('*)\s*\(\s*([^)]+)\)\s*=\s*(.+)$/);
    if (!m) throw new EngineError(`Write each condition like y(0) = 1 or y'(0) = 2 (could not read "${p}").`);
    return { k: m[1].length, x0: math.evaluate(m[2].replace(/π/g, 'pi')), val: math.evaluate(m[3].replace(/π/g, 'pi')) };
  });
}

// ---------- linear higher order: coefficients ----------
/** For order ≥ 2: { coeffs: [c0(x) … cn(x)] nodes, R }, or throws if not linear. */
export function linearCoeffs(ode) {
  if (ode.op) return { coeffs: ode.op.coeffs.map(numNode), R: ode.op.R, numeric: ode.op.coeffs };
  const E = ode.E;
  const coeffs = YD.slice(0, ode.order + 1).map((w) => tidy(math.derivative(E, w)));
  if (coeffs.some((c) => !free(c, YD))) throw new EngineError('This equation is not linear in y and its derivatives.');
  let R0 = E;
  YD.slice(0, ode.order + 1).forEach((w) => { R0 = substitute(R0, w, num(0)); });
  const R = tidyMulti(neg(R0), ['x']);
  const numeric = coeffs.map((c) => (free(c, ['x']) ? c.evaluate({}) : null));
  return { coeffs: coeffs.map((c) => tidyMulti(c, ['x'])), R, numeric: numeric.every((v) => v !== null) ? numeric : null };
}

function solveVariation(lc) {
  const c = lc.numeric;
  if (!c || c.length !== 3) throw new EngineError('Variation of parameters here is for second-order equations with constant coefficients: a y\'\' + b y\' + c y = R(x).');
  const a = c[2];
  const coeffs = c.map((k) => k / a);
  const R = tidyMulti(div(lc.R, numNode(a)), ['x']);
  const base = solveConstant(coeffs, num(0), 'x');
  const [y1, y2] = base.basis;
  const W = tidyMulti(sub(mul(y1, math.derivative(y2, 'x')), mul(y2, math.derivative(y1, 'x'))), ['x']);
  const i1 = antiderivative(tidyMulti(div(mul(y2, R), paren(W)), ['x']), 'x');
  const i2 = antiderivative(tidyMulti(div(mul(y1, R), paren(W)), ['x']), 'x');
  const PI = tidyMulti(add(neg(mul(y1, i1.F)), mul(y2, i2.F)), ['x']);
  const steps = [
    ...base.steps.filter((s) => /Auxiliary|Complementary/.test(s.title)),
    { title: 'Wronskian', formula: 'W = y_1y_2\' - y_2y_1\'', lines: [`y_1 = ${T(y1)}, \\quad y_2 = ${T(y2)}, \\qquad W = ${T(W)}`] },
    { title: 'The two integrals', formula: '\\text{PI} = -y_1\\int \\frac{y_2R}{W}dx + y_2\\int \\frac{y_1R}{W}dx', lines: [`\\int \\frac{y_2R}{W}dx = ${T(i1.F)}, \\qquad \\int \\frac{y_1R}{W}dx = ${T(i2.F)}`] },
  ];
  i1.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  i2.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
  steps.push({ title: 'Particular integral', lines: [`\\text{PI} = ${T(PI)}`] });
  const Y = tidy(add(base.cf, PI));
  steps.push({ title: 'General solution', formula: 'y = \\text{CF} + \\text{PI}', lines: [`y = ${T(Y)}`] });
  const resid = sub(applyL(coeffs, PI, 'x'), R);
  const ok = [0.3, 0.7, 1.1].every((x) => { const r = evalAt(resid, { x }); return !Number.isFinite(r) || Math.abs(r) < 1e-6 * Math.max(1, Math.abs(evalAt(R, { x }))); });
  return { method: 'variation', answer: `y = ${T(Y)}`, Y, verified: ok, steps };
}

function solveCauchyEuler(lc, ics) {
  const n = lc.coeffs.length - 1;
  // c_n = a_n (x − r)^n: find r from c_n's polynomial
  const cn = polynomialCoeffs(lc.coeffs[n], 'x');
  if (!cn || cn.length !== n + 1) throw new EngineError(`For Cauchy–Euler the coefficient of the ${n}th derivative should be a·xⁿ (or a·(x − r)ⁿ for Legendre).`);
  const r = snap(-cn[n - 1] / (n * cn[n]));
  const u = sub(sym('x'), numNode(r));
  const a = lc.coeffs.map((ck, k) => {
    const vals = [0.7, 1.3, 2.2].map((x) => evalAt(ck, { x }) / (x - r) ** k);
    if (vals.some((v) => !Number.isFinite(v) || Math.abs(v - vals[0]) > 1e-9 * Math.max(1, Math.abs(vals[0])))) throw new EngineError(`The coefficient of ${PRIME[k]} should be a constant times ${r === 0 ? 'x' : '(x − r)'}^${k}.`);
    return snap(vals[0]);
  });
  // xᵏDᵏ = θ(θ − 1)…(θ − k + 1)
  let theta = [0];
  a.forEach((ak, k) => {
    // Ascending coefficients of θ(θ − 1)…(θ − k + 1)
    let p = [1];
    for (let j = 0; j < k; j++) { const q = new Array(p.length + 1).fill(0); p.forEach((c, i) => { q[i + 1] += c; q[i] -= j * c; }); p = q; }
    while (theta.length < p.length) theta.push(0);
    p.forEach((c, i) => { theta[i] += ak * c; });
  });
  theta = theta.map(snap);
  const legendre = Math.abs(r) > 1e-12;
  const uTex = legendre ? `(${T(u)})` : 'x';
  const steps = [
    { title: legendre ? 'Legendre form: put x − r = eᵗ' : 'Cauchy–Euler form: put x = eᵗ', formula: `${uTex}D = \\theta, \\ ${uTex}^2D^2 = \\theta(\\theta - 1), \\ \\theta = \\frac{d}{dt}`, lines: [`${uTex} = e^{t}, \\quad t = \\ln ${uTex}`, `\\left(${fTex(theta, '\\theta')}\\right)y = R`] },
  ];
  // ln(eᵗ) → t, (eᵗ)ᵏ → e^{kt}, so the particular integral sees plain t and exponentials
  const flat = (node) => node.transform((m) => {
    const z = unwrap(m);
    if (z.isFunctionNode && z.fn.name === 'log' && unwrap(z.args[0]).isFunctionNode && unwrap(z.args[0]).fn.name === 'exp') return unwrap(z.args[0]).args[0];
    if (z.isOperatorNode && z.fn === 'pow' && unwrap(z.args[0]).isFunctionNode && unwrap(z.args[0]).fn.name === 'exp') return fn('exp', mul(z.args[1], unwrap(z.args[0]).args[0]));
    return m;
  });
  // x = eᵗ (Legendre: x = r + eᵗ); with r = 0 no "0 +" so ln(eᵗ) and (eᵗ)ᵏ simplify
  const xOfT = Math.abs(r) < 1e-12 ? fn('exp', sym('t')) : add(numNode(r), fn('exp', sym('t')));
  const Rt = tidyMulti(flat(flat(substitute(lc.R, 'x', xOfT))), ['t']);
  const cc = solveConstant(theta, Rt, 't', [], false);
  cc.steps.slice(1).forEach((s) => steps.push({ ...s, depth: 1 }));
  const back = nice(substitute(cc.Y, 't', fn('log', u)), ['x']);
  let Y = back;
  steps.push({ title: `Put back t = ln ${legendre ? `(${u.toString()})` : 'x'}`, lines: [`y = ${T(Y)}`] });
  if (ics.length) {
    const basisX = cc.basis.map((b) => substitute(b, 't', fn('log', u)));
    const piX = substitute(cc.pi, 't', fn('log', u));
    const rows = ics.map(({ k, x0 }) => basisX.map((b) => { let d = b; for (let j = 0; j < k; j++) d = math.derivative(d, 'x'); return evalAt(d, { x: x0 }); }));
    const rhs = ics.map(({ k, x0, val }) => { let d = piX; for (let j = 0; j < k; j++) d = math.derivative(d, 'x'); return val - evalAt(d, { x: x0 }); });
    const cs = gauss(rows, rhs);
    if (!cs) throw new EngineError('These initial conditions don\'t fix the constants.');
    cs.forEach((c, i) => { Y = substitute(Y, `C${i + 1}`, numNode(snap(c))); });
    Y = nice(Y, ['x']);
    steps.push({ title: 'Use the initial conditions', lines: [`${cs.map((c, i) => `C_{${i + 1}} = ${exactTex(snap(c))}`).join(', \\ ')}`, `y = ${T(Y)}`] });
  }
  const residNode = applyLNode(lc.coeffs, Y, 'x');
  const ok = [r + 0.6, r + 1.3, r + 2.2].every((x) => { const s = { x, C1: 1.3, C2: -0.7, C3: 0.4 }; const v = evalAt(sub(residNode, lc.R), s); return !Number.isFinite(v) || Math.abs(v) < 1e-6 * Math.max(1, Math.abs(evalAt(lc.R, s))); });
  return { method: 'cauchy-euler', answer: `y = ${T(Y)}`, Y, verified: ok, steps, legendre };
}

/** applyL for node coefficients (Cauchy–Euler); numbers go through numNode. */
function applyLNode(coeffs, node, v) { return coeffs.reduce((acc, ck, k) => { let d = node; for (let j = 0; j < k; j++) d = math.derivative(d, v); const t = mul(ck, d); return acc ? add(acc, t) : t; }, null); }

// ---------- the solver ----------
export const METHODS = {
  separable: 'Variables separable', homogeneous: 'Homogeneous', linear: 'Linear (integrating factor)', bernoulli: 'Bernoulli',
  exact: 'Exact', constant: 'Constant coefficients', variation: 'Variation of parameters', 'cauchy-euler': 'Cauchy–Euler / Legendre',
};

/** Which first-order types an equation fits. */
export function classifyFirst(fo) {
  const F = fo.F;
  const types = [];
  if (isSeparable(F)) types.push('separable');
  const lp = linearParts(F);
  if (lp) types.push('linear');
  if (isHomogeneous0(F)) types.push('homogeneous');
  const bp = lp ? null : bernoulliParts(F);
  if (bp) types.push('bernoulli');
  const exact = isZeroNode(sub(math.derivative(fo.M, 'y'), math.derivative(fo.N, 'x')), ['x', 'y']);
  if (exact) types.push('exact');
  return { types, lp, bp };
}

/**
 * Solve an ODE. method: 'auto' or one of METHODS (the type pages force one).
 * Returns { order, method, methodName, types, answer (LaTeX), steps, verified, notes, eq }.
 */
export function solveODE(text, { method = 'auto', ics = '' } = {}) {
  const ode = readODE(text);
  const conds = readICs(ics);
  const notes = [];
  if (ode.order === 1) {
    const fo = firstOrderForm(ode);
    const { types, lp, bp } = classifyFirst(fo);
    const eq = `\\frac{dy}{dx} = ${T(fo.F)}`;
    const want = method === 'auto' ? ['separable', 'linear', 'homogeneous', 'bernoulli', 'exact'].find((m) => types.includes(m)) : method;
    if (method !== 'auto' && !types.includes(method)) {
      const why = {
        separable: 'F(x, y) does not split into g(x)·h(y).',
        homogeneous: 'F(tx, ty) is not equal to F(x, y), so y = vx won\'t separate it.',
        linear: 'F is not of the form a(x)·y + b(x).',
        bernoulli: lp ? 'it is linear (n = 0 or 1): use the linear equation page.' : 'F is not of the form a(x)·y + b(x)·yⁿ.',
        exact: 'it may still be solvable with an integrating factor — NETZ tries that below.',
      }[method];
      if (method !== 'exact') throw new EngineError(`This equation is not ${METHODS[method].toLowerCase()}: ${why}${types.length ? ` It is ${types.map((t) => METHODS[t].toLowerCase()).join(', ')}.` : ''}`);
    }
    if (!want) {
      // Not a recognised type: try an integrating factor for M dx + N dy
      const r = solveExact(fo.M, fo.N, fo.F);
      return { order: 1, eq, method: 'exact', methodName: 'Exact (after an integrating factor)', types, ...r, notes };
    }
    let r;
    if (want === 'separable') r = solveSeparable(fo.F);
    else if (want === 'homogeneous') r = solveHomogeneous(fo.F);
    else if (want === 'linear') { const s = solveLinear(fo.F, lp); r = { method: 'linear', answer: `y = ${T(s.Y)}`, explicit: s.Y, verified: explicitOk(s.Y, fo.F), steps: s.steps }; }
    else if (want === 'bernoulli') r = solveBernoulli(fo.F, bp);
    else r = solveExact(fo.M, fo.N, fo.F);
    if (r.explicit && conds.length) {
      const { x0, val } = conds[0];
      const f = (c) => evalAt(r.explicit, { x: x0, C: c }) - val;
      const c0 = f(0), c1 = f(1);
      const Cv = snap(-c0 / (c1 - c0));
      if (Number.isFinite(Cv) && Math.abs(f(Cv)) < 1e-8) {
        const Yp = nice(substitute(r.explicit, 'C', numNode(Cv)), ['x']);
        r.steps.push({ title: 'Use the initial condition', lines: [`y(${exactTex(x0)}) = ${exactTex(val)} \\Rightarrow C = ${exactTex(Cv)}`, `y = ${T(Yp)}`] });
        r.answer = `y = ${T(Yp)}`;
      } else notes.push('The initial condition could not be applied to this form; put the values into the general solution to find C.');
    } else if (conds.length) notes.push('The solution is implicit: put the initial values into it to find C.');
    if (types.length > 1) notes.push(`This equation is also ${types.filter((t) => t !== want).map((t) => METHODS[t].toLowerCase()).join(' and ')}.`);
    return { order: 1, eq, methodName: METHODS[r.method] || r.method, types, ...r, notes };
  }
  // Higher order
  const lc = linearCoeffs(ode);
  const eq = ode.op ? `\\left(${fTex(ode.op.coeffs, 'D')}\\right)y = ${T(ode.op.R)}` : `${lc.coeffs.map((c, k) => ({ c, k })).reverse().filter(({ c }) => !isZeroNode(c, ['x'])).map(({ c, k }) => `\\left(${T(c)}\\right)${PRIME[k]}`).join(' + ')} = ${T(lc.R)}`;
  const isCE = !lc.numeric && (() => { try { const cn = polynomialCoeffs(lc.coeffs.at(-1), 'x'); return cn && cn.length === lc.coeffs.length; } catch { return false; } })();
  const want = method === 'auto' ? (lc.numeric ? 'constant' : isCE ? 'cauchy-euler' : null) : method;
  if (!want) throw new EngineError('NETZ solves linear equations with constant coefficients, or with xᵏ coefficients (Cauchy–Euler). This one has other variable coefficients.');
  if (want === 'constant') {
    if (!lc.numeric) throw new EngineError('The coefficients are not constants: try the Cauchy–Euler page if they are powers of x.');
    const r = solveConstant(lc.numeric, lc.R, 'x', conds);
    return { order: ode.order, eq, method: 'constant', methodName: METHODS.constant, types: ['constant'], answer: `y = ${T(r.Y)}`, steps: r.steps, verified: r.verified, notes };
  }
  if (want === 'variation') { const r = solveVariation(lc); return { order: ode.order, eq, methodName: METHODS.variation, types: ['variation'], ...r, notes }; }
  if (want === 'cauchy-euler') { const r = solveCauchyEuler(lc, conds); if (r.legendre) notes.push('Legendre\'s form: the substitution uses the linear factor instead of x.'); notes.push('x (or the linear factor) is taken positive, so ln works without |…|.'); return { order: ode.order, eq, methodName: METHODS['cauchy-euler'], types: ['cauchy-euler'], ...r, notes }; }
  throw new EngineError(`${METHODS[want] || want} is for first-order equations; this one has order ${ode.order}.`);
}
