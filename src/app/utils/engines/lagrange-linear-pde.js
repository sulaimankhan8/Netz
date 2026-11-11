/**
 * Lagrange's linear equation Pp + Qq = R: the maths for /lagrange-linear-pde (Unit 12).
 *   Auxiliary equations dx/P = dy/Q = dz/R. Two independent integrals u = c₁, v = c₂ give φ(u, v) = 0.
 *   Grouping   a pair whose ratio involves only its own two letters and separates, e.g. dx/x² = dy/y².
 *   Multipliers l, m, n with lP + mQ + nR = 0 and l dx + m dy + n dz an exact differential dU, from a list of
 *              the textbook choices (1, 1, 1), (x, y, z), (1/x, 1/y, 1/z), (y, x, 0), (yz, zx, xy) …
 *   A coefficient that is 0 gives an integral at once (P = 0: x = c).
 * Each integral is checked: P u_x + Q u_y + R u_z = 0. The two are checked to be independent.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, fn, add, mul, div, pow, neg, paren, polish, tidy, sub, unwrap } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { antiderivative, expSimplify } from '../symbolic/ode';
import { readEq, has, count, isolate, evalAt, zeroAt, sameAt, points, nicest, fractionParts , sqrtForm } from '../symbolic/pde';

const T = (n) => mtex(polish(sqrtForm(n)));
const L3 = ['x', 'y', 'z'];
const d = (n, v) => tidy(math.derivative(n, v));
const P_ = (s) => math.parse(s);

/** P u_x + Q u_y + R u_z ≡ 0 */
const isIntegral = (u, P, Q, R) => zeroAt(add(add(mul(P, d(u, 'x')), mul(Q, d(u, 'y'))), mul(R, d(u, 'z'))), L3, 1e-7);

/** Gradients of u and v not parallel at the test points. */
function independent(u, v) {
  const gu = ['x', 'y', 'z'].map((w) => d(u, w)), gv = ['x', 'y', 'z'].map((w) => d(v, w));
  let ok = 0;
  for (const s of points(L3, 6)) {
    const a = gu.map((g) => evalAt(g, s)), b = gv.map((g) => evalAt(g, s));
    if (![...a, ...b].every(Number.isFinite)) continue;
    const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    if (Math.hypot(...c) > 1e-8 * Math.max(1, Math.hypot(...a) * Math.hypot(...b))) ok++;
  }
  return ok >= 3;
}

/** The multiplicative factors of r split into those with a only and those with b only (constants go with a), or null. */
function splitFactors(r, a, b, consts) {
  const fs = [];
  const go = (t, inv) => { const x = unwrap(t); if (x.isOperatorNode && x.fn === 'multiply') { x.args.forEach((y) => go(y, inv)); return; } if (x.isOperatorNode && x.fn === 'divide') { go(x.args[0], inv); go(x.args[1], !inv); return; } if (x.isOperatorNode && x.fn === 'unaryMinus') { fs.push({ x: num(-1), inv: false }); go(x.args[0], inv); return; } fs.push({ x, inv }); };
  go(r, false);
  let fa = num(1), fb = num(1);
  for (const { x, inv } of fs) {
    const ha = has(x, a), hb = has(x, b);
    if (ha && hb) return null;
    const put = (acc) => (inv ? div(acc, paren(x)) : mul(acc, x));
    if (hb) fb = put(fb); else fa = put(fa);
  }
  void consts;
  return { fa: tidy(fa), fb: tidy(fb) };
}

/** Grouping: db/da = ratio(a, b) separable → U = ∫ db/g(b) − ∫ f(a) da. extra: letters treated as numbers (c₁). */
function grouping(top, bottom, a, b, extra = []) {
  const r = nicest(div(paren(top), paren(bottom)), [...L3, ...extra]);
  const other = L3.find((w) => w !== a && w !== b);
  if (has(r, other)) return null;
  const all = [a, b, ...extra];
  const sp = splitFactors(r, a, b, extra);
  if (!sp || !sameAt(mul(sp.fa, sp.fb), r, all)) return linearGroup(r, top, bottom, a, b, extra);
  let I1, I2;
  try { I1 = antiderivative(nicest(div(num(1), paren(sp.fb)), [b, ...extra]), b, [b, ...extra]).F; I2 = antiderivative(nicest(sp.fa, [a, ...extra]), a, [a, ...extra]).F; } catch { return null; }
  return { u: tidyIntegral(sub(I1, I2)), why: `\\frac{d${a}}{${T(bottom)}} = \\frac{d${b}}{${T(top)}} \\Rightarrow \\int ${T(nicest(div(num(1), paren(sp.fb)), [b]))}\\,d${b} = \\int ${T(sp.fa)}\\,d${a}` };
}

/** db/da = α(a)·b + β(a): integrating factor μ = e^{−∫α da}, so μb − ∫μβ da = c. */
function linearGroup(r, top, bottom, a, b, extra) {
  const all = [a, b, ...extra];
  let alpha;
  try { alpha = nicest(math.derivative(r, b), all); } catch { return null; }
  if (has(alpha, b)) return null;
  const beta = nicest(sub(r, mul(alpha, sym(b))), all);
  if (has(beta, b) || !sameAt(add(mul(alpha, sym(b)), beta), r, all)) return null;
  let mu, I;
  try {
    const A = antiderivative(alpha, a, [a, ...extra]).F;
    mu = tidyIntegral(fn('exp', neg(paren(A))));
    mu = nicest(expSimplify(mu), [a, ...extra]);
    I = antiderivative(nicest(mul(mu, paren(beta)), [a, ...extra]), a, [a, ...extra]).F;
  } catch { return null; }
  const U = nicest(sub(mul(mu, sym(b)), I), all);
  return { u: tidyIntegral(U), why: `\\frac{d${a}}{${T(bottom)}} = \\frac{d${b}}{${T(top)}} \\Rightarrow \\frac{d${b}}{d${a}} ${T(neg(alpha)).trim().startsWith('-') ? '' : '+'} ${T(nicest(neg(alpha), all))}\\,${b} = ${T(beta)} \\ (\\text{linear; I.F.} = ${T(mu)})` };
}

/**
 * An integral u = c in its plainest form: Σ kᵢ ln|wᵢ| → Π wᵢ^{kᵢ} (ln|y| − ln|x| → y/x), fractions cleared
 * (y²/2 − x²/2 → y² − x²). Any constant multiple of u, or function of it, is as good an integral.
 */
function tidyIntegral(U0) {
  let U = nicest(U0, L3);
  // logs only?
  const terms = [];
  const go = (t, s) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0], s); go(x.args[1], x.fn === 'subtract' ? -s : s); return; } if (x.isOperatorNode && x.fn === 'unaryMinus') { go(x.args[0], -s); return; } terms.push({ x, s }); };
  go(U, 1);
  const logs = terms.map(({ x, s }) => {
    let k = s, y = x;
    if (y.isOperatorNode && y.fn === 'multiply' && unwrap(y.args[0]).isConstantNode) { k *= Number(unwrap(y.args[0]).value); y = unwrap(y.args[1]); }
    if (y.isFunctionNode && y.fn.name === 'log' && y.args.length === 1) { let w = unwrap(y.args[0]); if (w.isFunctionNode && w.fn.name === 'abs') w = unwrap(w.args[0]); return { k, w }; }
    return null;
  });
  if (logs.length >= 2 && logs.every(Boolean)) {
    let prod = num(1);
    for (const { k, w } of logs) prod = Math.abs(k - 1) < 1e-12 ? mul(prod, paren(w)) : Math.abs(k + 1) < 1e-12 ? div(prod, paren(w)) : k < 0 ? div(prod, pow(paren(w), num(-k))) : mul(prod, pow(paren(w), num(k)));
    U = nicest(prod, L3);
  }
  const fp = fractionParts(U);
  if (fp && T(fp.D).trim() === '1' || (fp && fp.D.isConstantNode)) U = fp.N;
  return nicest(U, L3);
}

// multipliers (l, m, n) and, for the ones that are not "each a function of its own letter", the U with dU = l dx + m dy + n dz
const MULT = [
  ['1', '1', '1'], ['1', '-1', '0'], ['1', '0', '-1'], ['0', '1', '-1'], ['1', '1', '0'], ['1', '0', '1'], ['0', '1', '1'], ['1', '1', '-1'], ['1', '-1', '1'], ['-1', '1', '1'],
  ['x', 'y', 'z'], ['x', '-y', '0'], ['x', '0', '-z'], ['0', 'y', '-z'], ['x', 'y', '0'], ['x', '0', 'z'], ['0', 'y', 'z'], ['x', 'y', '-z'], ['x', '-y', 'z'], ['-x', 'y', 'z'],
  ['1/x', '1/y', '1/z'], ['1/x', '-1/y', '0'], ['1/x', '0', '-1/z'], ['0', '1/y', '-1/z'], ['1/x', '1/y', '0'], ['1/x', '1/y', '-1/z'],
  ['y', 'x', '0', 'x*y'], ['z', '0', 'x', 'x*z'], ['0', 'z', 'y', 'y*z'], ['y*z', 'x*z', 'x*y', 'x*y*z'], ['y', 'x', '-1', 'x*y - z'], ['z', '0', 'x', 'x*z'],
  ['x^2', 'y^2', 'z^2'], ['1/x^2', '1/y^2', '1/z^2'],
];
function multipliers(P, Q, R) {
  const out = [];
  for (const [ls, ms, ns, Us] of MULT) {
    const l = P_(ls), m = P_(ms), n = P_(ns);
    const S = add(add(mul(l, P), mul(m, Q)), mul(n, R));
    if (!zeroAt(S, L3, 1e-9)) continue;
    let U;
    if (Us) U = P_(Us);
    else {
      // each multiplier depends on its own letter only
      try { U = add(add(antiderivative(l, 'x').F, antiderivative(m, 'y').F), antiderivative(n, 'z').F); } catch { continue; }
    }
    U = tidyIntegral(U);
    out.push({ u: U, why: `\\text{multipliers } ${ls}, ${ms}, ${ns}: \\ ${ls}\\,P + ${ms}\\,Q + ${ns}\\,R = 0`.replace(/\*/g, '') + ` \\Rightarrow d\\left(${T(U)}\\right) = 0` });
  }
  return out;
}

export function solve({ eq }) {
  const { G } = readEq(eq, 'The equation', ['p', 'q']);
  G.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && ![...L3, 'p', 'q', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`Use x, y, z, p and q only (the equation uses ${m.name}).`); });
  const P = nicest(d(G, 'p'), L3), Q = nicest(d(G, 'q'), L3);
  const R = nicest(neg(paren(substitute(substitute(G, 'p', num(0)), 'q', num(0)))), L3);
  if (!sameAt(G, sub(add(mul(P, sym('p')), mul(Q, sym('q'))), R), [...L3, 'p', 'q'])) throw new EngineError('The equation must be linear in p and q: Pp + Qq = R with P, Q, R functions of x, y, z.');
  if (zeroAt(P, L3) && zeroAt(Q, L3)) throw new EngineError('The equation needs p or q in it.');
  const steps = [{ title: "Lagrange's form", formula: 'Pp + Qq = R', depth: 0, lines: [`P = ${T(P)}, \\quad Q = ${T(Q)}, \\quad R = ${T(R)}`] },
    { title: 'Auxiliary equations', formula: '\\frac{dx}{P} = \\frac{dy}{Q} = \\frac{dz}{R}', depth: 0, lines: [`\\frac{dx}{${T(P)}} = \\frac{dy}{${T(Q)}} = \\frac{dz}{${T(R)}}`] }];
  const found = [];
  const push = (c) => { if (!c || !isIntegral(c.u, P, Q, R)) return; if (found.some((f) => !independent(f.u, c.u))) return; found.push(c); };
  // a zero coefficient: that letter is constant
  [[P, 'x'], [Q, 'y'], [R, 'z']].forEach(([c, w]) => { if (zeroAt(c, L3)) push({ u: sym(w), why: `d${w} = 0 \\Rightarrow ${w} = c` }); });
  // grouping, then multipliers
  const pairs = [[Q, P, 'x', 'y'], [R, P, 'x', 'z'], [R, Q, 'y', 'z']];
  for (const [top, bottom, a, b] of pairs) { if (found.length >= 2) break; if (zeroAt(bottom, L3)) continue; try { push(grouping(top, bottom, a, b)); } catch { /* next */ } }
  if (found.length < 2) for (const c of multipliers(P, Q, R)) { if (found.length >= 2) break; push(c); }
  // second integral using the first: write one letter through u = c₁ and group the other two (c₁ kept as a letter)
  if (found.length === 1) {
    const u = found[0].u;
    for (const [top, bottom, a, b] of pairs) {
      if (found.length >= 2) break;
      if (zeroAt(bottom, L3)) continue;
      const w = L3.find((k) => k !== a && k !== b);
      const r = tidy(div(paren(top), paren(bottom)));
      if (!has(r, w) || count(u, w) !== 1) continue;
      const wv = isolate(u, w, sym('c1'));
      if (!wv) continue;
      const g = grouping(substitute(top, w, paren(wv)), substitute(bottom, w, paren(wv)), a, b, ['c1']);
      if (!g) continue;
      const back = nicest(substitute(g.u, 'c1', paren(u)), L3);
      push({ u: back, why: `${T(u)} = c_1 \\Rightarrow ${w} = ${T(wv).replace(/c1/g, 'c_1')}; \\ ${g.why.replace(/c1/g, 'c_1')}` });
    }
  }
  if (found.length < 2) throw new EngineError('NETZ found ' + (found.length ? 'only one integral' : 'no integrals') + ' by grouping or the standard multipliers; this equation needs a cleverer choice.');
  found.forEach((f, i) => steps.push({ title: `Integral ${i + 1}`, depth: 1, lines: [f.why, `u_{${i + 1}} = ${T(f.u)} = c_{${i + 1}}`] }));
  const ans = `\\phi\\left(${T(found[0].u)},\\ ${T(found[1].u)}\\right) = 0`;
  steps.push({ title: 'General solution', formula: '\\phi(u, v) = 0', depth: 0, lines: [ans, '\\text{(}\\phi \\text{ any function; } u, v \\text{ checked: } Pu_x + Qu_y + Ru_z = 0)'] });
  return { u: T(found[0].u), v: T(found[1].u), answer: ans, steps, notes: [], verified: true, result: ans };
}
