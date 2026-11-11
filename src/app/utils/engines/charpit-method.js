/**
 * Non-linear first-order PDEs f(x, y, z, p, q) = 0 by Charpit's method: the maths for /charpit-method (Unit 12).
 *   Charpit's auxiliary equations  dp/(f_x + pf_z) = dq/(f_y + qf_z) = dz/(−pf_p − qf_q) = dx/(−f_p) = dy/(−f_q).
 *   The four standard forms each give a complete integral directly:
 *     I    f(p, q) = 0            p = a, q = b(a):      z = ax + b(a)y + c
 *     II   f(z, p, q) = 0         u = x + ay, q = ap:   ∫ dz/P(z) = x + ay + b
 *     III  f₁(x, p) = f₂(y, q)    both = a:             z = ∫p dx + ∫q dy + b
 *     IV   z = px + qy + g(p, q)  Clairaut:             z = ax + by + g(a, b)
 *   Otherwise, if f_x + pf_z = 0 (or f_y + qf_z = 0) the auxiliary equations give p = a (or q = a) at once.
 * The complete integral is put back into the equation as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, div, neg, paren, polish, tidy, sub, unwrap } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { antiderivative } from '../symbolic/ode';
import { readEq, has, count, isolate, evalAt, zeroAt, sameAt, nicest, coeffsIn , sqrtForm } from '../symbolic/pde';

const T = (n) => mtex(polish(sqrtForm(n)));
const L5 = ['x', 'y', 'z', 'p', 'q'];
const d = (n, v) => tidy(math.derivative(n, v));
const A = sym('a'), B = sym('b');

/** Additive terms of G grouped as A(x, p) + B(y, q), or null. */
function splitAdd(G) {
  const terms = [];
  const go = (t, s) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0], s); go(x.args[1], x.fn === 'subtract' ? -s : s); return; } if (x.isOperatorNode && x.fn === 'unaryMinus') { go(x.args[0], -s); return; } terms.push(s < 0 ? neg(paren(x)) : x); };
  go(G, 1);
  let fx = null, fy = null;
  for (const t of terms) {
    const left = has(t, 'x') || has(t, 'p'), right = has(t, 'y') || has(t, 'q');
    if (left && right) return null;
    if (right) fy = fy ? add(fy, t) : t; else fx = fx ? add(fx, t) : t;
  }
  return fx && fy ? { fx: tidy(fx), fy: tidy(fy) } : null;
}

/** Solve G = 0 for w (it must appear once, or G is quadratic in it with the + root taken). */
function solveFor(G, w) {
  if (count(G, w) === 1) { const r = isolate(G, w); if (r) return r; }
  // linear or quadratic in w (coefficients may hold other letters): the + root
  const letters = [...new Set([...L5, 'a', 'PP', w])];
  const c = coeffsIn(G, w, 2, letters);
  if (!c || c.length < 2) return null;
  if (c.length === 2) return div(neg(paren(c[0])), paren(c[1]));
  const [c0, c1, c2] = c;
  if (zeroAt(c1, letters)) return math.parse(`sqrt(-(${c0.toString()})/(${c2.toString()}))`);
  return math.parse(`(-(${c1.toString()}) + sqrt((${c1.toString()})^2 - 4*(${c2.toString()})*(${c0.toString()})))/(2*(${c2.toString()}))`);
}

export function solve({ eq }) {
  const { L, R, G } = readEq(eq, 'The equation', ['p', 'q']);
  G.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && ![...L5, 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`Use x, y, z, p and q only (the equation uses ${m.name}).`); });
  if (!has(G, 'p') && !has(G, 'q')) throw new EngineError('The equation needs p or q in it.');
  const steps = [];
  const fx = d(G, 'x'), fy = d(G, 'y'), fz = d(G, 'z'), fp = d(G, 'p'), fq = d(G, 'q');
  steps.push({ title: "Charpit's auxiliary equations", formula: '\\frac{dp}{f_x + pf_z} = \\frac{dq}{f_y + qf_z} = \\frac{dz}{-pf_p - qf_q} = \\frac{dx}{-f_p} = \\frac{dy}{-f_q}', depth: 0, lines: [`f = ${T(G)}`, `f_x = ${T(fx)}, \\ f_y = ${T(fy)}, \\ f_z = ${T(fz)}, \\ f_p = ${T(fp)}, \\ f_q = ${T(fq)}`] });
  let Z = null, form = '';
  const hasX = has(G, 'x'), hasY = has(G, 'y'), hasZ = has(G, 'z');
  // IV Clairaut: only through z − px − qy
  const shifted = substitute(substitute(substitute(G, 'x', num(0)), 'y', num(0)), 'z', sub(sub(sym('z'), mul(sym('p'), sym('x'))), mul(sym('q'), sym('y'))));
  if (hasZ && (hasX || hasY) && sameAt(G, shifted, L5, 1e-8)) {
    form = 'IV';
    const H = tidy(substitute(substitute(substitute(G, 'x', num(0)), 'y', num(0)), 'z', sym('ZZ')));
    const g = count(H, 'ZZ') === 1 ? isolate(H, 'ZZ') : null;
    if (!g) throw new EngineError("This is Clairaut's form, but NETZ could not write it as z = px + qy + g(p, q).");
    Z = nicest(add(add(mul(A, sym('x')), mul(B, sym('y'))), substitute(substitute(g, 'p', A), 'q', B)), ['x', 'y', 'a', 'b']);
    steps.push({ title: "Standard form IV (Clairaut)", formula: 'z = px + qy + g(p, q) \\Rightarrow z = ax + by + g(a, b)', depth: 0, lines: [`g(p, q) = ${T(nicest(g, ['p', 'q']))}`, `z = ${T(Z)}`] });
  } else if (!hasX && !hasY && !hasZ) {
    form = 'I';
    // p = a, q from f(a, q) = 0
    const qa = solveFor(substitute(G, 'p', A), 'q');
    if (qa) {
      const bq = nicest(qa, ['a']);
      Z = nicest(add(add(mul(A, sym('x')), mul(paren(bq), sym('y'))), sym('c')), ['x', 'y', 'a', 'c']);
      steps.push({ title: 'Standard form I: f(p, q) = 0', formula: 'p = a, \\ q = b \\text{ with } f(a, b) = 0', depth: 0, lines: [`f(a, q) = 0 \\Rightarrow q = ${T(bq)}`, `dz = a\\,dx + ${T(bq)}\\,dy \\Rightarrow z = ${T(Z)}`] });
    } else {
      const pa = solveFor(substitute(G, 'q', A), 'p');
      if (!pa) throw new EngineError('NETZ could not solve f(p, q) = 0 for p or q.');
      const ap = nicest(pa, ['a']);
      Z = nicest(add(add(mul(paren(ap), sym('x')), mul(A, sym('y'))), sym('c')), ['x', 'y', 'a', 'c']);
      steps.push({ title: 'Standard form I: f(p, q) = 0', formula: 'q = a, \\ p \\text{ from } f(p, a) = 0', depth: 0, lines: [`p = ${T(ap)}`, `z = ${T(Z)}`] });
    }
  } else if (!hasX && !hasY) {
    form = 'II';
    // q = a p, f(z, P, aP) = 0 → P = ψ(z), then ∫ dz/ψ = x + a y + b
    const H = substitute(substitute(G, 'q', mul(A, sym('p'))), 'p', sym('PP'));
    const psi = solveFor(tidy(H), 'PP');
    if (!psi) throw new EngineError('NETZ could not solve f(z, p, ap) = 0 for p.');
    const ps = nicest(psi, ['z', 'a']);
    let I;
    try { I = antiderivative(nicest(div(num(1), paren(ps)), ['z', 'a']), 'z', ['z', 'a']).F; } catch { throw new EngineError(`NETZ could not integrate dz/(${ps.toString()}).`); }
    const lhs = nicest(I, ['z', 'a']);
    Z = null;
    const rel = `${T(lhs)} = x + a\\,y + b`;
    steps.push({ title: 'Standard form II: f(z, p, q) = 0', formula: 'u = x + ay, \\ p = \\frac{dz}{du}, \\ q = a\\frac{dz}{du}', depth: 0, lines: [`f\\left(z, \\frac{dz}{du}, a\\frac{dz}{du}\\right) = 0 \\Rightarrow \\frac{dz}{du} = ${T(ps)}`, `\\int ${T(nicest(div(num(1), paren(ps)), ['z', 'a']))}\\,dz = \\int du \\Rightarrow ${rel}`] });
    // check: the relation F(z) = x + ay + b gives p = 1/F'(z), q = a/F'(z)
    const Fp = d(lhs, 'z');
    const verified = [0.3, 0.55].every((av) => sameAt((s) => { const fpv = evalAt(Fp, { ...s, a: av }); return evalAt(G, { ...s, p: 1 / fpv, q: av / fpv }); }, () => 0, ['z'], 1e-6));
    return { form, complete: rel, steps, notes: [], verified, result: rel };
  } else {
    // III: f₁(x, p) = f₂(y, q)
    const sideSplit = !has(L, 'y') && !has(L, 'q') && !has(L, 'z') && !has(R, 'x') && !has(R, 'p') && !has(R, 'z') ? { fx: L, fy: neg(paren(R)) } : null;
    const sp = !hasZ ? (sideSplit || splitAdd(G)) : null;
    if (sp) {
      form = 'III';
      const pv = solveFor(tidy(sub(sp.fx, A)), 'p'), qv = solveFor(tidy(add(sp.fy, A)), 'q');
      if (!pv || !qv) throw new EngineError('NETZ could not solve each side = a for p and q.');
      const pN = nicest(pv, ['x', 'a']), qN = nicest(qv, ['y', 'a']);
      let I1, I2;
      try { I1 = antiderivative(pN, 'x', ['x', 'a']).F; I2 = antiderivative(qN, 'y', ['y', 'a']).F; } catch { throw new EngineError('NETZ could not integrate p dx + q dy here.'); }
      Z = nicest(add(add(I1, I2), sym('b')), ['x', 'y', 'a', 'b']);
      steps.push({ title: 'Standard form III: f₁(x, p) = f₂(y, q)', formula: 'f_1(x, p) = a = f_2(y, q)', depth: 0, lines: [`${T(sp.fx)} = a \\Rightarrow p = ${T(pN)}`, `${T(nicest(neg(paren(sp.fy)), ['y', 'q']))} = a \\Rightarrow q = ${T(qN)}`, `z = \\int p\\,dx + \\int q\\,dy = ${T(Z)}`] });
    } else if (zeroAt(add(fx, mul(sym('p'), fz)), L5) || zeroAt(add(fy, mul(sym('q'), fz)), L5)) {
      // dp = 0 → p = a (or dq = 0 → q = a)
      const pConst = zeroAt(add(fx, mul(sym('p'), fz)), L5);
      const [c, o, cv, ov] = pConst ? ['p', 'q', 'x', 'y'] : ['q', 'p', 'y', 'x'];
      form = 'Charpit';
      const ov2 = solveFor(substitute(G, c, A), o);
      if (!ov2) throw new EngineError(`NETZ found ${c} = a but could not solve for ${o}.`);
      const oN = nicest(ov2, ['x', 'y', 'z', 'a']);
      if (has(oN, 'z')) throw new EngineError(`With ${c} = a, ${o} still depends on z; this needs more work than NETZ does here.`);
      let I;
      try { I = add(mul(A, sym(cv)), antiderivative(nicest(substitute(oN, cv, num(0)), [ov, 'a']), ov, [ov, 'a']).F); } catch { throw new EngineError('NETZ could not integrate dz here.'); }
      if (has(oN, cv)) throw new EngineError(`${o} depends on both x and y; dz is not integrated term by term here.`);
      Z = nicest(add(I, sym('b')), ['x', 'y', 'a', 'b']);
      steps.push({ title: `From the auxiliary equations: d${c} = 0`, formula: `f_${cv} + ${c}f_z = 0 \\Rightarrow ${c} = a`, depth: 0, lines: [`${o} = ${T(oN)}`, `dz = ${pConst ? `a\\,dx + ${T(oN)}\\,dy` : `${T(oN)}\\,dx + a\\,dy`} \\Rightarrow z = ${T(Z)}`] });
    } else throw new EngineError('This is not one of the four standard forms, and the auxiliary equations do not give p or q constant at once.');
  }
  const ans = `z = ${T(Z)}`;
  steps.push({ title: 'Complete integral', depth: 0, lines: [ans, '\\text{(}a, b \\text{ arbitrary constants)}'] });
  const verified = [[0.3, 0.4, 1.1], [0.55, -0.8, 0.3]].every(([av, bv, cv]) => {
    const z1 = substitute(substitute(substitute(Z, 'a', num(av)), 'b', num(bv)), 'c', num(cv));
    const p1 = d(z1, 'x'), q1 = d(z1, 'y');
    return sameAt((s) => evalAt(G, { ...s, z: evalAt(z1, s), p: evalAt(p1, s), q: evalAt(q1, s) }), () => 0, ['x', 'y'], 1e-6);
  });
  return { form, complete: ans, steps, notes: [], verified, result: ans };
}
