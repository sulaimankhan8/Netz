/**
 * Formation of partial differential equations: the maths for /formation-of-pde (Unit 12). p = ∂z/∂x, q = ∂z/∂y.
 *   Constants   z = F(x, y, a, b): p = F_x, q = F_y; solve these for a, b (linear by Cramer's rule, else by undoing
 *               operations) and put them back into z = F. One constant needs only p (or q).
 *   z = g + h·f(u)   one arbitrary function: f = (z − g)/h, and p, q each hold f′(u), so eliminating f′ gives
 *               (p − g_x − h_x f)·u_y = (q − g_y − h_y f)·u_x.   (z = f(u) gives p u_y = q u_x.)
 *   f(u, v) = 0  u, v functions of x, y, z: Lagrange's form Pp + Qq = R with
 *               P = ∂(u, v)/∂(y, z), Q = ∂(u, v)/∂(z, x), R = ∂(u, v)/∂(x, y).
 * Each PDE is checked: on a sample surface of the family, the computed p, q satisfy it.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, fn, add, mul, div, neg, paren, polish, tidy, sub, unwrap } from '../symbolic/tree';
import { mtex, tidyMulti, readMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { has, count, isolate, evalAt, zeroAt, sameAt, nicest, fractionParts , sqrtForm } from '../symbolic/pde';

const T = (n) => mtex(polish(sqrtForm(n)));
const d = (n, v) => tidy(math.derivative(n, v));

/** The PDE "left = right" for display, with fractions cleared when the result is one fraction. */
function eqTex(z, rhs) {
  const fp = fractionParts(rhs);
  if (fp) { const dT = T(fp.D).trim(); return dT === '1' ? `${z} = ${T(fp.N)}` : `${dT}\\,${z} = ${T(fp.N)}`; }
  const r = unwrap(rhs);
  if (r.isOperatorNode && r.fn === 'divide') return `${T(r.args[1])}\\,${z} = ${T(r.args[0])}`;
  return `${z} = ${T(rhs)}`;
}
/** Largest whole number k ≤ 12 dividing P, Q, R at every whole-number point (to tidy 2(z − y)p + … ). */
function commonFactor(nodes) {
  for (let k = 12; k >= 2; k--) {
    let ok = true;
    for (const x of [1, 2, 3]) for (const y of [1, 2, 5]) for (const z of [1, 3, 4]) {
      for (const n of nodes) { const v = evalAt(n, { x, y, z }); if (!Number.isFinite(v) || Math.abs(v / k - Math.round(v / k)) > 1e-9) ok = false; }
    }
    if (ok) return k;
  }
  return 1;
}

function fromConstants(zText) {
  const s = String(zText).replace(/^\s*z\s*=\s*/, '');
  const F = readMulti(s, 'z');
  const consts = ['a', 'b', 'c'].filter((k) => has(F, k));
  if (!consts.length) throw new EngineError('Use a and b for the arbitrary constants, e.g. z = (x - a)^2 + (y - b)^2.');
  if (consts.length > 2) throw new EngineError('Use at most two constants (a and b): with three, second derivatives are needed.');
  F.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['x', 'y', 'a', 'b', 'c', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`z may use x, y and the constants a, b (it uses ${m.name}).`); });
  const Fx = d(F, 'x'), Fy = d(F, 'y');
  const steps = [{ title: 'Differentiate', formula: 'p = \\frac{\\partial z}{\\partial x}, \\quad q = \\frac{\\partial z}{\\partial y}', depth: 0, lines: [`z = ${T(F)}`, `p = ${T(Fx)}`, `q = ${T(Fy)}`] }];
  const letters = ['x', 'y', 'p', 'q', 'z'];
  const sol = {};
  if (consts.length === 1) {
    const k = consts[0];
    // from p, else q, else z itself
    const tries = [[Fx, sym('p'), 'p'], [Fy, sym('q'), 'q'], [F, sym('z'), 'z']];
    for (const [e, rhs, name] of tries) {
      if (count(e, k) !== 1) continue;
      const v = isolate(e, k, rhs);
      if (v) { sol[k] = tidyMulti(v, letters); steps.push({ title: `Find ${k}`, depth: 0, lines: [`${name} = ${T(e)} \\Rightarrow ${k} = ${T(sol[k])}`] }); break; }
    }
    if (!sol[k]) throw new EngineError(`NETZ could not solve for ${k}.`);
  } else {
    let [a, b] = consts;
    const inPQ = consts.filter((k) => has(Fx, k) || has(Fy, k));
    if (inPQ.length === 1) {
      // the other constant only adds to z: eliminate the one left between p and q
      const k = inPQ[0];
      for (const [e1, n1, e2, n2] of [[Fx, 'p', Fy, 'q'], [Fy, 'q', Fx, 'p']]) {
        if (count(e1, k) !== 1) continue;
        const kv = isolate(e1, k, sym(n1));
        if (!kv) continue;
        const rel = nicest(substitute(e2, k, paren(kv)), letters);
        const pde = eqTex(n2, rel);
        steps.push({ title: `Find ${k} and remove it`, depth: 0, lines: [`${n1} = ${T(e1)} \\Rightarrow ${k} = ${T(tidyMulti(kv, letters))}`, `${n2} = ${T(e2)} \\Rightarrow ${pde}`] });
        const verified = [0.7, 1.9].every((av) => { const Fn = substitute(substitute(F, k, num(av)), consts.find((c) => c !== k), num(0.4)); const pn = d(Fn, 'x'), qn = d(Fn, 'y'); return sameAt((sc) => evalAt(rel, { ...sc, p: evalAt(pn, sc), q: evalAt(qn, sc) }), (sc) => evalAt(n2 === 'q' ? qn : pn, sc), ['x', 'y'], 1e-6); });
        return { pde, steps, verified, result: pde };
      }
      throw new EngineError(`NETZ could not solve for ${k}.`);
    }
    // linear in a and b?
    const lin = [Fx, Fy].every((e) => [a, b].every((u) => [a, b].every((w) => zeroAt(d(d(e, u), w), ['x', 'y', a, b]))));
    if (lin) {
      const m = [[d(Fx, a), d(Fx, b)], [d(Fy, a), d(Fy, b)]];
      const c0 = [tidy(substitute(substitute(Fx, a, num(0)), b, num(0))), tidy(substitute(substitute(Fy, a, num(0)), b, num(0)))];
      const r = [sub(sym('p'), c0[0]), sub(sym('q'), c0[1])];
      const det = tidy(sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0])));
      if (zeroAt(det, ['x', 'y'])) throw new EngineError('The equations for p and q do not fix both constants (try fewer constants).');
      sol[a] = tidyMulti(div(sub(mul(paren(r[0]), m[1][1]), mul(m[0][1], paren(r[1]))), paren(det)), letters);
      sol[b] = tidyMulti(div(sub(mul(m[0][0], paren(r[1])), mul(paren(r[0]), m[1][0])), paren(det)), letters);
    } else {
      // undo operations: a from one equation, then b from the other
      for (const [e1, n1, e2, n2] of [[Fx, 'p', Fy, 'q'], [Fy, 'q', Fx, 'p']]) {
        for (const [u, w] of [[a, b], [b, a]]) {
          if (count(e1, u) !== 1 || has(e1, w)) continue;
          const uv = isolate(e1, u, sym(n1));
          if (!uv) continue;
          const e2s = substitute(e2, u, paren(uv));
          if (count(e2s, w) !== 1) continue;
          const wv = isolate(e2s, w, sym(n2));
          if (!wv) continue;
          sol[u] = tidyMulti(uv, letters); sol[w] = tidyMulti(wv, letters);
          break;
        }
        if (sol[a]) break;
      }
      if (!sol[a]) throw new EngineError('NETZ could not solve the p and q equations for a and b.');
    }
    steps.push({ title: `Solve for ${a} and ${b}`, depth: 0, lines: [`${a} = ${T(sol[a])}`, `${b} = ${T(sol[b])}`] });
  }
  let Z = F;
  for (const [k, v] of Object.entries(sol)) Z = substitute(Z, k, paren(v));
  Z = nicest(Z, letters);
  if (!has(Z, 'p') && !has(Z, 'q')) throw new EngineError('Eliminating the constants left no p or q: check that z really depends on them.');
  const pde = eqTex('z', Z);
  steps.push({ title: 'Put them back into z', depth: 0, lines: [pde] });
  // check with sample constants
  const verified = [[0.7, -1.3], [1.9, 0.4]].every(([av, bv]) => {
    const vals = { [consts[0]]: av, [consts[1] || 'zz']: bv };
    let Fn = F; for (const k of consts) Fn = substitute(Fn, k, num(vals[k]));
    const pn = d(Fn, 'x'), qn = d(Fn, 'y');
    return sameAt((s) => evalAt(Z, { ...s, p: evalAt(pn, s), q: evalAt(qn, s), z: evalAt(Fn, s) }), (s) => evalAt(Fn, s), ['x', 'y'], 1e-6);
  });
  return { pde, steps, verified, result: pde };
}

/**
 * A p + B q = C tidied the textbook way: denominators cleared, a common whole-number factor taken out,
 * the p term (else the q term) made positive. Returns { A, B, C, tex }.
 */
function linearPde(A0, B0, C0) {
  const L = ['x', 'y', 'z'];
  let cs = [A0, B0, C0].map((n) => nicest(n, L));
  // clear denominators: multiply by each distinct bottom in turn
  for (let round = 0; round < 3; round++) {
    const den = cs.map((n) => { try { const r = math.rationalize(n, {}, true); return r.denominator; } catch { return null; } }).find((dn) => dn && !(dn.isConstantNode));
    if (!den) break;
    cs = cs.map((n) => nicest(mul(paren(n), paren(den)), L));
  }
  const k = commonFactor(cs);
  if (k > 1) cs = cs.map((n) => nicest(div(paren(n), num(k)), L));
  const lead = cs.find((n) => !zeroAt(n, L));
  if (lead && T(lead).trim().startsWith('-')) cs = cs.map((n) => nicest(neg(paren(n)), L));
  const [A, B, C] = cs;
  const term = (c, name) => { if (zeroAt(c, L)) return null; const t0 = T(c).trim(); const t = /^-?\s*[a-z0-9]+$/.test(t0) ? t0.replace(/\s+/g, '') : t0; return t === '1' ? name : t === '-1' ? `-${name}` : /^-?[a-z0-9]+$/.test(t) ? `${t}${name}` : `\\left(${t}\\right)${name}`; };
  const tex = `${[term(A, 'p'), term(B, 'q')].filter(Boolean).join(' + ').replace(/\+ -/g, '- ')} = ${zeroAt(C, L) ? '0' : T(C).trim()}`;
  return { A, B, C, tex };
}

/** Find the call f(...) (any one-letter function name not built in). */
function arbitraryCalls(node) {
  const calls = [];
  node.traverse((m) => { if (m.isFunctionNode && /^[fghφψ]$/.test(m.fn.name)) calls.push(m); });
  return calls;
}

function fromFunction(text) {
  const raw = String(text).replace(/φ/g, 'f').replace(/ψ/g, 'g').trim();
  const sides = raw.split('=');
  if (sides.length !== 2) throw new EngineError('Write z = f(x² + y²), z = y f(x/y) or f(x + y + z, xyz) = 0.');
  const L = math.parse(sides[0].replace(/(\d)\s*([a-z(])/gi, '$1*$2')), Rn = math.parse(sides[1].replace(/(\d)\s*([a-z(])/gi, '$1*$2').replace(/\)\s*([a-z])/gi, ')*$1').replace(/([a-z])\s+([a-z])/gi, '$1*$2'));
  const steps = [];
  // f(u, v) = 0
  const lc = arbitraryCalls(L);
  if (lc.length === 1 && lc[0].args.length === 2 && Rn.isConstantNode && Number(Rn.value) === 0) {
    const [u, v] = lc[0].args.map((a) => tidy(readMulti(a.toString(), 'u')));
    const J = (A, B) => tidyMulti(sub(mul(d(u, A), d(v, B)), mul(d(u, B), d(v, A))), ['x', 'y', 'z']);
    const P0 = J('y', 'z'), Q0 = J('z', 'x'), R0 = J('x', 'y');
    steps.push({ title: 'Two functions', depth: 0, lines: [`u = ${T(u)}, \\quad v = ${T(v)}`] });
    steps.push({ title: "Lagrange's form", formula: 'P = \\frac{\\partial(u, v)}{\\partial(y, z)}, \\ Q = \\frac{\\partial(u, v)}{\\partial(z, x)}, \\ R = \\frac{\\partial(u, v)}{\\partial(x, y)}', depth: 0, lines: [`P = ${T(P0)}, \\quad Q = ${T(Q0)}, \\quad R = ${T(R0)}`] });
    const lp = linearPde(P0, Q0, R0);
    const P = lp.A, Q = lp.B, R = lp.C;
    const pde = lp.tex;
    steps.push({ title: 'The PDE', depth: 0, lines: [pde] });
    // check: on a level surface u = sin(v) + c, implicit p = −F_x/F_z, q = −F_y/F_z
    const Fs = sub(u, fn('sin', v));
    const Fx = d(Fs, 'x'), Fy = d(Fs, 'y'), Fz = d(Fs, 'z');
    const verified = sameAt((s) => { const fz = evalAt(Fz, s); const p = -evalAt(Fx, s) / fz, q = -evalAt(Fy, s) / fz; return evalAt(P, s) * p + evalAt(Q, s) * q; }, (s) => evalAt(R, s), ['x', 'y', 'z'], 1e-6);
    return { pde, steps, verified, result: pde };
  }
  // z = g + h·f(u)
  if (!(L.isSymbolNode && L.name === 'z')) throw new EngineError('Write it as z = (something with f(u)), or f(u, v) = 0.');
  const rc = arbitraryCalls(Rn);
  if (rc.length !== 1 || rc[0].args.length !== 1) throw new EngineError('Use one arbitrary function f(u) on the right (two functions like f(x + y) + g(x − y) need second derivatives).');
  const call = rc[0];
  const u = tidy(readMulti(call.args[0].toString(), 'u'));
  const withF = Rn.transform((m) => (m === call ? sym('FF') : m));
  const expr = tidy(readMulti(withF.toString(), 'z', ['FF']));
  for (const n of [expr, u]) n.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['x', 'y', 'z', 'FF', 'pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`Use numbers for constants (the relation uses ${m.name}).`); });
  const g = tidy(substitute(expr, 'FF', num(0))), h = tidy(sub(substitute(expr, 'FF', num(1)), g));
  if (!sameAt(expr, add(g, mul(h, sym('FF'))), ['x', 'y', 'FF'])) throw new EngineError('z must be linear in f(u), like z = f(u), z = x f(u) or z = x + y f(u).');
  const fNode = tidy(div(paren(sub(sym('z'), g)), paren(h)));
  const ux = d(u, 'x'), uy = d(u, 'y');
  const lhs = tidyMulti(mul(paren(sub(sub(sym('p'), d(g, 'x')), mul(d(h, 'x'), paren(fNode)))), uy), ['x', 'y', 'z', 'p', 'q']);
  const rhs = tidyMulti(mul(paren(sub(sub(sym('q'), d(g, 'y')), mul(d(h, 'y'), paren(fNode)))), ux), ['x', 'y', 'z', 'p', 'q']);
  steps.push({ title: 'Differentiate', formula: "f' \\text{ appears in both}", depth: 0, lines: [`u = ${T(u)}, \\quad u_x = ${T(ux)}, \\quad u_y = ${T(uy)}`, `p = ${T(tidy(add(d(g, 'x'), add(mul(d(h, 'x'), sym('f')), mul(mul(h, sym("f'")), ux)))))}`.replace(/f'/g, "f'(u)").replace(/\bf\b(?!')/g, 'f(u)'), `q = ${T(tidy(add(d(g, 'y'), add(mul(d(h, 'y'), sym('f')), mul(mul(h, sym("f'")), uy)))))}`.replace(/f'/g, "f'(u)").replace(/\bf\b(?!')/g, 'f(u)')] });
  if (!zeroAt(h, ['x', 'y']) && !(h.isConstantNode)) steps.push({ title: 'Remove f', depth: 0, lines: [`f(u) = \\frac{z - (${T(g)})}{${T(h)}}`.replace('z - (0)', 'z')] });
  // collect: lhs − rhs = 0, written as A p + B q = C
  const E = tidyMulti(sub(lhs, rhs), ['x', 'y', 'z', 'p', 'q']);
  const lp = linearPde(d(E, 'p'), d(E, 'q'), neg(paren(substitute(substitute(E, 'p', num(0)), 'q', num(0)))));
  const A = lp.A, B = lp.B, C = lp.C;
  const pde = lp.tex;
  steps.push({ title: 'Eliminate f′(u)', formula: "\\frac{p - g_x - h_x f}{u_x} = \\frac{q - g_y - h_y f}{u_y} \\ (= h f')", depth: 0, lines: [pde] });
  // check with f = sin
  const zS = tidy(add(g, mul(h, fn('sin', u))));
  const pS = d(zS, 'x'), qS = d(zS, 'y');
  const verified = sameAt((s) => { const sc = { ...s, z: evalAt(zS, s), p: evalAt(pS, s), q: evalAt(qS, s) }; return evalAt(A, sc) * sc.p + evalAt(B, sc) * sc.q; }, (s) => evalAt(C, { ...s, z: evalAt(zS, s) }), ['x', 'y'], 1e-6);
  return { pde, steps, verified, result: pde };
}

export function solve({ mode = 'constants', z }) {
  if (!String(z ?? '').trim()) throw new EngineError('Type the relation first.');
  const r = mode === 'constants' ? fromConstants(z) : fromFunction(z);
  return { mode, notes: [], ...r };
}
