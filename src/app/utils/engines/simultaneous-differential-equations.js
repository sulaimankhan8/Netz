/**
 * Simultaneous linear ODEs with constant coefficients: the maths for /simultaneous-differential-equations (Unit 12).
 *   Two first-order equations in x(t), y(t), written with dx/dt, x′ or Dx. They are put in the form
 *     x′ = ax + by + f(t),  y′ = cx + dy + g(t),
 *   then y is eliminated:  x″ − (a + d)x′ + (ad − bc)x = f′ − df + bg,  and  y = (x′ − ax − f)/b.
 *   (b = 0: x is found first and then y from its own equation.) The CF + PI solver does each second-order step.
 *   Initial values x(0), y(0) fix C₁, C₂. Both answers are put back into both equations as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, div, neg, paren, polish, tidy, sub } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti, readMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { solveConstant, numNode } from '../symbolic/ode';
import { evalAt, zeroAt, collectOnto } from '../symbolic/pde';

const T = (n) => mtex(polish(n)).replace(/C(d)/g, 'C_{$1}');
const t = sym('t');
const VARS = ['XD', 'YD', 'x', 'y'];

function readOne(text, label) {
  let s = String(text ?? '').replace(/[−–]/g, '-').replace(/′/g, "'").trim();
  if (!s) throw new EngineError(`${label} is empty.`);
  s = s.replace(/dx\s*\/\s*dt/g, ' XD ').replace(/dy\s*\/\s*dt/g, ' YD ').replace(/\bx'/g, ' XD ').replace(/\by'/g, ' YD ').replace(/\bD\s*x\b/g, ' XD ').replace(/\bD\s*y\b/g, ' YD ');
  if (/\bD\b/.test(s)) throw new EngineError(`${label}: write D x as Dx (only first derivatives here), e.g. Dx + y = sin(t).`);
  const sides = s.split('=');
  if (sides.length !== 2) throw new EngineError(`${label}: write it as left side = right side.`);
  const G = tidy(sub(readMulti(sides[0], label, ['XD', 'YD']), readMulti(sides[1], label, ['XD', 'YD'])));
  G.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && ![...VARS, 't', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`${label}: use x, y, t and dx/dt, dy/dt only (it uses ${m.name}).`); });
  const zero = { XD: 0, YD: 0, x: 0, y: 0 };
  const coef = {};
  for (const v of VARS) {
    const vals = [0, 0.7, 1.9, 3.2].map((tt) => evalAt(G, { ...zero, [v]: 1, t: tt }) - evalAt(G, { ...zero, t: tt }));
    if (!vals.every(Number.isFinite) || vals.some((w) => Math.abs(w - vals[0]) > 1e-9)) throw new EngineError(`${label}: the numbers in front of x, y and their derivatives must be constants.`);
    // linear: doubling the value doubles the change
    const two = evalAt(G, { ...zero, [v]: 2, t: 0.7 }) - evalAt(G, { ...zero, t: 0.7 });
    if (Math.abs(two - 2 * vals[0]) > 1e-9) throw new EngineError(`${label} must be linear in x, y and their derivatives.`);
    coef[v] = vals[0];
  }
  let r = G;
  for (const v of VARS) r = substitute(r, v, num(0));
  r = tidyMulti(neg(paren(r)), ['t']);
  return { coef, r };
}

const lin = (a, b, f) => tidyMulti(add(add(mul(numNode(a), sym('x')), mul(numNode(b), sym('y'))), f), ['x', 'y', 't']);
const isZero = (n) => zeroAt(n, ['t']);
const snapF = (v) => { const r = Math.round(v * 1e6) / 1e6; return Math.abs(r - v) < 1e-9 ? r : v; };

export function solve({ eq1, eq2, ics = '' }) {
  const e1 = readOne(eq1, 'The first equation'), e2 = readOne(eq2, 'The second equation');
  // M [x′; y′] + K [x; y] = r
  const m11 = e1.coef.XD, m12 = e1.coef.YD, m21 = e2.coef.XD, m22 = e2.coef.YD;
  const det = m11 * m22 - m12 * m21;
  if (Math.abs(det) < 1e-12) throw new EngineError('The two equations do not give dx/dt and dy/dt separately (their derivative parts are proportional).');
  const inv = [[m22 / det, -m12 / det], [-m21 / det, m11 / det]];
  const k1 = [e1.coef.x, e1.coef.y], k2 = [e2.coef.x, e2.coef.y];
  const snap = (v) => Number(v.toPrecision(12));
  const a = snap(-(inv[0][0] * k1[0] + inv[0][1] * k2[0])), b = snap(-(inv[0][0] * k1[1] + inv[0][1] * k2[1]));
  const c = snap(-(inv[1][0] * k1[0] + inv[1][1] * k2[0])), d = snap(-(inv[1][0] * k1[1] + inv[1][1] * k2[1]));
  const comb = (u, v) => tidy(add(mul(numNode(snap(u)), paren(e1.r)), mul(numNode(snap(v)), paren(e2.r))));
  const f = comb(inv[0][0], inv[0][1]);
  const g = comb(inv[1][0], inv[1][1]);
  const steps = [];
  steps.push({ title: 'Normal form', formula: "x' = ax + by + f(t), \\quad y' = cx + dy + g(t)", depth: 0, lines: [`\\frac{dx}{dt} = ${T(lin(a, b, f))}`, `\\frac{dy}{dt} = ${T(lin(c, d, g))}`] });
  // initial values
  const iv = {};
  for (const m of String(ics).matchAll(/([xy])\s*\(\s*0\s*\)\s*=\s*([^,;]+)/g)) { const v = math.evaluate(m[2].trim()); if (typeof v !== 'number') throw new EngineError(`"${m[2]}" is not a number.`); iv[m[1]] = v; }
  if (String(ics).trim() && (iv.x === undefined || iv.y === undefined)) throw new EngineError('Give both starting values, like x(0) = 1, y(0) = 0 (or leave them out).');
  const has0 = iv.x !== undefined;
  let X, Yn;
  // y written basis function by basis function, so C₁e^{t}, C₂e^{3t} collect cleanly
  const each = (basis, pi, op) => { let out = op(pi); basis.forEach((bf, i) => { out = add(out, mul(sym(`C${i + 1}`), paren(op(bf)))); }); return tidyMulti(out, ['t', 'C1', 'C2']); };
  if (Math.abs(b) > 1e-12) {
    const R = tidy(add(add(math.derivative(f, 't'), mul(numNode(-d), paren(f))), mul(numNode(b), paren(g))));
    const coeffs = [snap(a * d - b * c), snap(-(a + d)), 1];
    const xTerm = (k, w) => (Math.abs(k) < 1e-12 ? '' : ` ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : exactTex(Math.abs(k))}${w}`);
    steps.push({ title: 'Eliminate y', formula: "x'' - (a + d)x' + (ad - bc)x = f' - df + bg", depth: 0, lines: [`y = \\frac{x' - (${T(lin(a, 0, f))})}{${exactTex(b)}}`, `x''${xTerm(coeffs[1], "x'")}${xTerm(coeffs[0], 'x')} = ${isZero(R) ? '0' : T(R)}`] });
    const sx = solveConstant(coeffs, R, 't', []);
    sx.steps.forEach((st) => steps.push({ ...st, depth: 1 }));
    X = sx.Y;
    const opY = (u) => tidyMulti(div(paren(sub(sub(math.derivative(u, 't'), mul(numNode(a), paren(u))), paren(f))), numNode(b)), ['t']);
    const opY0 = (u) => tidyMulti(div(paren(sub(math.derivative(u, 't'), mul(numNode(a), paren(u)))), numNode(b)), ['t']);
    const ypi = opY(sx.pi);
    const ypiNice = collectOnto(ypi, [sx.pi, f, g], 't') || ypi;
    Yn = tidyMulti(add(ypiNice, sx.basis.map((bf, i) => mul(sym(`C${i + 1}`), paren(opY0(bf)))).reduce((p, q) => add(p, q))), ['t', 'C1', 'C2']);
    void each;
    steps.push({ title: 'Then y', formula: "y = \\frac{x' - ax - f(t)}{b}", depth: 0, lines: [`y = ${T(Yn)}`] });
  } else {
    // x′ = ax + f on its own; then y′ − dy = cx + g by superposition (one PI per term of x)
    const sx = solveConstant([-a, 1], f, 't', []);
    sx.steps.forEach((st) => steps.push({ ...st, depth: 1, title: `x: ${st.title}` }));
    X = sx.Y;
    const sy = solveConstant([-d, 1], tidy(add(mul(numNode(c), paren(sx.pi)), g)), 't', []);
    let Yy = substitute(sy.Y, 'C1', sym('C2'));
    if (Math.abs(c) > 1e-12) Yy = add(Yy, mul(sym('C1'), paren(solveConstant([-d, 1], mul(numNode(c), paren(sx.basis[0])), 't', []).pi)));
    Yn = tidyMulti(Yy, ['t', 'C1', 'C2']);
    steps.push({ title: 'Then y', formula: "y' - dy = cx + g(t)", depth: 0, lines: [`y' ${d < 0 ? '+' : '-'} ${exactTex(Math.abs(d))}y = ${T(tidyMulti(add(mul(numNode(c), paren(X)), g), ['t', 'C1']))}`, `y = ${T(Yn)}`] });
  }
  if (has0) {
    // x(0), y(0) are linear in C₁, C₂
    const at = (node, c1, c2) => evalAt(node, { t: 0, C1: c1, C2: c2 });
    const m = [[at(X, 1, 0) - at(X, 0, 0), at(X, 0, 1) - at(X, 0, 0)], [at(Yn, 1, 0) - at(Yn, 0, 0), at(Yn, 0, 1) - at(Yn, 0, 0)]];
    const rhs = [iv.x - at(X, 0, 0), iv.y - at(Yn, 0, 0)];
    const dt = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    if (Math.abs(dt) < 1e-12) throw new EngineError('These starting values do not fix C₁ and C₂.');
    const c1 = snapF((rhs[0] * m[1][1] - m[0][1] * rhs[1]) / dt), c2 = snapF((m[0][0] * rhs[1] - m[1][0] * rhs[0]) / dt);
    const put = (n) => tidyMulti(substitute(substitute(n, 'C1', numNode(c1)), 'C2', numNode(c2)), ['t']);
    X = put(X); Yn = put(Yn);
    steps.push({ title: 'Use x(0) and y(0)', depth: 0, lines: [`C_{1} = ${exactTex(c1)}, \ C_{2} = ${exactTex(c2)}`, `x = ${T(X)}`, `y = ${T(Yn)}`] });
  }
  // check both original equations
  const scope = (tt) => ({ t: tt, C1: 1.3, C2: -0.7 });
  const res = (e, tt) => {
    const s = scope(tt);
    const xv = evalAt(X, s), yv = evalAt(Yn, s), xd = evalAt(math.derivative(X, 't'), s), yd = evalAt(math.derivative(Yn, 't'), s);
    return e.coef.XD * xd + e.coef.YD * yd + e.coef.x * xv + e.coef.y * yv - evalAt(e.r, { t: tt });
  };
  const verified = [0.3, 0.9, 1.7].every((tt) => [e1, e2].every((e) => { const r = res(e, tt); return Number.isFinite(r) && Math.abs(r) < 1e-6 * Math.max(1, Math.abs(evalAt(e.r, { t: tt }))); }));
  return { xTex: T(X), yTex: T(Yn), steps, notes: has0 ? [] : ['C₁ and C₂ are the same constants in x and y; give x(0) and y(0) to fix them.'], verified, result: [T(X), T(Yn)] };
}
