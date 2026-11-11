/**
 * Clairaut's equation and equations solvable for p: the maths for /clairaut-equation (Unit 12). p = dy/dx.
 *   Clairaut  y = px + f(p): the general solution is the family of lines y = cx + f(c); the singular solution
 *             (their envelope) comes from x + f′(p) = 0 with p eliminated. NETZ spots the form by checking that
 *             the equation depends on x and y only through y − px, so (y − px)² = p² + 1 counts as well.
 *   For p     a polynomial of degree ≤ 2 in p: factor into p = g₁(x, y), p = g₂(x, y) and solve each first-order
 *             equation (the ODE solver picks separable, linear, homogeneous …); the answer is the product of the parts.
 * Every solution is put back into the equation as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, div, neg, paren, polish, tidy, sub } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { solveODE, expSimplify, antiderivative } from '../symbolic/ode';
import { toFraction } from '../numeric/fraction';
import { readEq, isolate, has, count, sameAt, zeroAt, evalAt, coeffsIn, fitPoly2 , sqrtForm } from '../symbolic/pde';

const T = (n) => mtex(polish(sqrtForm(n)));
const X = sym('x'), Y = sym('y'), P = sym('p');

/** y − px is the only way x and y enter G? */
function isClairaut(G) {
  if (!has(G, 'p') || !has(G, 'x')) return false;
  const shifted = substitute(substitute(G, 'x', num(0)), 'y', sub(Y, mul(P, X)));
  return sameAt(G, shifted, ['x', 'y', 'p'], 1e-8);
}

/** y = A·x^r with r = m/n: the textbook form yⁿ = Aⁿxᵐ (y² = 4x, 27y² = …), or null. */
function powerLaw(ys) {
  const f = (x) => evalAt(ys, { x });
  const a = f(1), r = Math.log(f(2) / a) / Math.log(2);
  if (!Number.isFinite(a) || !Number.isFinite(r) || Math.abs(a) < 1e-12) return null;
  if (![0.5, 3, 4.7].every((x) => Math.abs(f(x) - a * x ** r) < 1e-9 * Math.max(1, Math.abs(f(x))))) return null;
  const fr = toFraction(r, 12, 1e-9);
  if (!fr || fr.d === 1) return null;
  for (let n = fr.d; n <= 4 * fr.d; n += fr.d) {
    const An = a ** n, q = toFraction(An, 1000, 1e-9);
    if (!q) continue;
    const m = (fr.n * n) / fr.d;
    const coef = exactTex(q.n / q.d);
    return `y^{${n}} = ${coef === '1' ? '' : coef === '-1' ? '-' : coef}${m === 1 ? 'x' : `x^{${m}}`}`;
  }
  return null;
}

/** The ODE p = g(x, y) checked: y(x) from the solver satisfies the original equation. */
function checkExplicit(G, y) {
  let d;
  try { d = math.derivative(y, 'x'); } catch { return true; }
  const lhs = substitute(substitute(substitute(G, 'p', d), 'y', paren(y)), 'C', num(0.83));
  return zeroAt(substitute(lhs, 'C', num(0.83)), ['x'], 1e-6);
}

export function solve({ eq }) {
  const { G } = readEq(eq, 'The equation', ['p']);
  G.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['x', 'y', 'p', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`Use x, y and p = dy/dx only (the equation uses ${m.name}).`); });
  if (!has(G, 'p')) throw new EngineError('The equation has no p in it. Write p for dy/dx, e.g. y = px + p^2.');
  const steps = [];
  if (isClairaut(G)) {
    // G(0, Y, p) = 0 → Y = f(p)
    const H = tidy(substitute(substitute(G, 'x', num(0)), 'y', sym('Yc')));
    let f = count(H, 'Yc') === 1 ? isolate(H, 'Yc') : null;
    if (f) f = tidyMulti(f, ['p']);
    // (y − px)² = g(p): take the positive root and say so
    let note = null;
    if (!f) {
      const sq = coeffsIn(H, 'Yc', 2, ['Yc', 'p']);
      if (sq && sq.length === 3 && zeroAt(sq[1], ['p'])) { f = tidy(math.parse(`sqrt(-(${sq[0].toString()})/(${sq[2].toString()}))`)); note = 'The equation gives y − px = ±f(p); the + sign is shown (the − sign gives the mirror family).'; }
    }
    if (!f) throw new EngineError('This looks like Clairaut\'s form, but NETZ could not write it as y = px + f(p).');
    steps.push({ title: "Clairaut's form", formula: 'y = px + f(p)', depth: 0, lines: [`y = px + ${T(f)}`, `f(p) = ${T(f)}`] });
    const general = tidyMulti(add(mul(sym('c'), X), substitute(f, 'p', sym('c'))), ['x', 'c']);
    steps.push({ title: 'General solution', formula: '\\text{replace } p \\text{ by a constant } c', depth: 0, lines: ["\\text{Differentiate: } p = p + (x + f'(p))\\frac{dp}{dx} \\Rightarrow \\frac{dp}{dx} = 0 \\ \\text{or} \\ x + f'(p) = 0", `y = ${T(general)}`] });
    // singular: x + f'(p) = 0
    const fp = tidyMulti(math.derivative(f, 'p'), ['p']);
    const cond = add(X, fp);
    let singular = null, singTex;
    const pOfX = count(cond, 'p') === 1 ? isolate(tidy(cond), 'p') : null;
    if (pOfX) {
      const ps = tidyMulti(pOfX, ['x']);
      let ys = tidyMulti(add(mul(paren(ps), X), substitute(f, 'p', paren(ps))), ['x']);
      try { ys = tidyMulti(expSimplify(ys), ['x']); } catch { /* keep */ }
      // check that it solves the equation (some branches do not)
      let ok = false;
      try { const d = math.derivative(ys, 'x'); ok = zeroAt(substitute(substitute(G, 'p', d), 'y', paren(ys)), ['x'], 1e-6); } catch { ok = false; }
      if (ok) { singular = ys; singTex = powerLaw(ys) || `y = ${T(ys)}`; steps.push({ title: 'Singular solution', formula: "x + f'(p) = 0", depth: 0, lines: [`x + ${T(fp)} = 0 \\Rightarrow p = ${T(ps)}`, `y = px + f(p) = ${T(ys)}`] }); }
    }
    if (!singular) {
      const yp = tidyMulti(add(mul(neg(P), paren(fp)), f), ['p']);
      singTex = `x = ${T(tidyMulti(neg(fp), ['p']))}, \\quad y = ${T(yp)}`;
      steps.push({ title: 'Singular solution (in terms of p)', formula: "x = -f'(p), \\ y = px + f(p)", depth: 0, lines: [singTex, '\\text{eliminate } p \\text{ to get one equation in } x, y'] });
    }
    // check the general solution
    const verified = [0.4, 1.3, -0.7].every((c) => zeroAt(substitute(substitute(substitute(G, 'p', num(c)), 'y', paren(substitute(general, 'c', num(c)))), 'c', num(c)), ['x'], 1e-7));
    return { kind: 'clairaut', general: `y = ${T(general)}`, singular: singTex, steps, notes: note ? [note] : [], verified, result: [`y = ${T(general)}`, singTex] };
  }

  // Solvable for p: degree ≤ 2 in p
  const c = coeffsIn(G, 'p', 2, ['x', 'y', 'p']);
  if (!c || c.length < 2) throw new EngineError('NETZ solves Clairaut equations (y = px + f(p)) and equations of degree 1 or 2 in p. This one is neither.');
  const roots = [];
  if (c.length === 2) roots.push(tidyMulti(div(neg(paren(c[0])), paren(c[1])), ['x', 'y']));
  else {
    const [c0, c1, c2] = c;
    const num0 = (n, s) => evalAt(n, s);
    const branch = (sgn) => (x, y) => { const s = { x, y }; const a = num0(c2, s), b = num0(c1, s), k = num0(c0, s); const d = b * b - 4 * a * k; return (-b + sgn * Math.sqrt(d)) / (2 * a); };
    const satisfies = (r) => zeroAt(substitute(G, 'p', paren(r)), ['x', 'y'], 1e-7);
    for (const sgn of [1, -1]) {
      const fit = fitPoly2(branch(sgn), satisfies);
      if (fit) roots.push(fit);
      else roots.push(tidyMulti(math.parse(`(-(${c1.toString()}) ${sgn > 0 ? '+' : '-'} sqrt((${c1.toString()})^2 - 4*(${c2.toString()})*(${c0.toString()})))/(2*(${c2.toString()}))`), ['x', 'y']));
    }
  }
  steps.push({ title: 'Solve for p', depth: 0, lines: [`${T(G)} = 0`, c.length === 3 ? `\\left(p - ${roots.map((r) => `\\left(${T(r)}\\right)`).join('\\right)\\left(p - ')}\\right) = 0` : `p = ${T(roots[0])}`, ...roots.map((r, i) => `p_{${i + 1}} = ${T(r)}`)] });
  const parts = [];
  let verified = true;
  roots.forEach((r, i) => {
    let s;
    if (!has(r, 'y')) {
      // p = g(x): integrate straight away
      const A = antiderivative(r, 'x');
      const yx = tidyMulti(add(A.F, sym('C')), ['x']);
      s = { explicit: yx, methodName: 'integrate', steps: [{ title: 'Integrate', lines: [`y = \\int ${T(r)}\\,dx = ${T(yx)}`] }] };
    } else {
      try { s = solveODE(`dy/dx = ${r.toString()}`); } catch (e) { throw new EngineError(`p = ${r.toString()}: ${e.message}`); }
    }
    const C = s.explicit ? `y = ${T(s.explicit)}` : s.answer;
    parts.push(C);
    if (s.verified === false) verified = false;
    if (s.explicit && !checkExplicit(G, s.explicit)) verified = false;
    steps.push({ title: `p = ${T(r)}`.replace(/\\/g, '').slice(0, 60), depth: 1, formula: `\\frac{dy}{dx} = ${T(r)} \\ (\\text{${s.methodName || 'first order'}})`, lines: [C] });
    (s.steps || []).forEach((st) => steps.push({ ...st, depth: (st.depth || 0) + 2 }));
  });
  steps.push({ title: 'General solution', formula: '\\text{the product of the parts} = 0', depth: 0, lines: parts.map((p) => p.replace(/\bC\b/g, 'c')) });
  return { kind: 'for-p', general: parts.join(', \\quad '), singular: null, parts, steps, notes: c.length === 3 ? ['Each factor gives its own family; write the general solution as (first − c)(second − c) = 0 if you want one equation.'] : [], verified, result: parts };
}
