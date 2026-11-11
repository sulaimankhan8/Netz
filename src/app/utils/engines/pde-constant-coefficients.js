/**
 * Homogeneous linear PDEs with constant coefficients: the maths for /pde-constant-coefficients (Unit 12).
 *   f(D, D′)z = F(x, y), D = ∂/∂x, D′ = ∂/∂y, every term of f of the same order n.
 *   Auxiliary equation: put D = m, D′ = 1: f(m, 1) = 0.
 *   CF: a root m gives φ(y + mx); a root repeated k times gives φ₁(y + mx) + xφ₂(y + mx) + …;
 *       a missing top power (a factor D′) gives φ(x).
 *   PI, term by term:  e^{ax+by} → e^{ax+by}/f(a, b);   sin/cos(ax + by) in second order: D² → −a², DD′ → −ab, D′² → −b²;
 *       otherwise the general rule  1/(D − mD′) F(x, y) = ∫ F(x, c − mx) dx, then c → y + mx, once per factor.
 * The PI is put back into the equation as a check.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, fn, add, mul, div, neg, paren, polish, tidy, sub, unwrap } from '../symbolic/tree';
import { mtex, exactTex, readMulti, tidyMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { antiderivative, polyRootsComplex, numNode } from '../symbolic/ode';
import { evalAt, sameAt, zeroAt, polyTerms, nicest, sqrtForm } from '../symbolic/pde';

const T = (n) => mtex(polish(sqrtForm(n))).replace(/phi(\d)/g, '\\phi_{$1}');
const XY = ['x', 'y'];

/** "(D^2 - 2DD' + D'^2)z = …" or "z_xx - 2z_xy + z_yy = …" (or r − 2s + t) → { terms: [{ i, j, c }] (DⁱD′ʲ), F }. */
function readOperator(text) {
  let s = String(text ?? '').replace(/[−–]/g, '-').replace(/′/g, "'").trim();
  if (!s) throw new EngineError('Type the equation, e.g. (D^2 - 2DD\' + D\'^2)z = e^(x + y).');
  const sides = s.split('=');
  if (sides.length !== 2) throw new EngineError('Write it as left side = right side.');
  let left = sides[0];
  const op = left.match(/^\s*\((.*)\)\s*z\s*$/);
  if (op) left = op[1].replace(/D'/g, 'E');
  else {
    left = left.replace(/z_\{?xx\}?|∂\^?2z\/∂x\^?2/g, '(D^2)').replace(/z_\{?xy\}?|z_\{?yx\}?/g, '(D*E)').replace(/z_\{?yy\}?|∂\^?2z\/∂y\^?2/g, '(E^2)')
      .replace(/z_\{?xxx\}?/g, '(D^3)').replace(/z_\{?x\}?/g, '(D)').replace(/z_\{?y\}?/g, '(E)');
    if (!/[DE]/.test(left)) left = left.replace(/(?<![a-zA-Z])r(?![a-zA-Z])/g, '(D^2)').replace(/(?<![a-zA-Z])s(?![a-zA-Z])/g, '(D*E)').replace(/(?<![a-zA-Z])t(?![a-zA-Z])/g, '(E^2)');
    if (/\bz\b/.test(left)) throw new EngineError('This page is for equations where every term has the same order (no plain z or first-order terms mixed with second-order ones).');
  }
  const Ln = readMulti(left.replace(/D(?=[DE(])/g, 'D*').replace(/E(?=[DE(])/g, 'E*'), 'The operator', ['D', 'E']);
  const pt = polyTerms(Ln);
  if (!pt) throw new EngineError('The left side should be a polynomial in D and D′ with constant coefficients.');
  const terms = pt.map(({ pow: p, c }) => {
    const extra = Object.keys(p).filter((k) => k !== 'D' && k !== 'E');
    if (extra.length) throw new EngineError('The coefficients must be numbers (only D and D′ in the operator).');
    return { i: p.D || 0, j: p.E || 0, c };
  }).filter((t) => Math.abs(t.c) > 1e-14);
  const n = Math.max(...terms.map((t) => t.i + t.j));
  if (terms.some((t) => t.i + t.j !== n)) throw new EngineError('Every term must have the same order (homogeneous), like D² − 2DD′ + D′². Equations such as D² − D′ need a different method.');
  if (n < 1 || n > 4) throw new EngineError('Use an operator of order 1 to 4.');
  const F = readMulti(sides[1], 'The right side');
  return { terms, n, F };
}

const opTex = (terms) => terms.slice().sort((a, b) => b.i - a.i).map((t, k) => {
  const body = `${t.i ? `D${t.i > 1 ? `^{${t.i}}` : ''}` : ''}${t.j ? `D'${t.j > 1 ? `^{${t.j}}` : ''}` : ''}`;
  const mag = exactTex(Math.abs(t.c));
  return `${k === 0 ? (t.c < 0 ? '-' : '') : t.c < 0 ? ' - ' : ' + '}${mag === '1' ? '' : mag}${body}`;
}).join('');

/** Apply f(D, D′) to a node. */
function applyOp(terms, z) {
  let out = num(0);
  for (const t of terms) {
    let d = z;
    for (let k = 0; k < t.i; k++) d = math.derivative(d, 'x');
    for (let k = 0; k < t.j; k++) d = math.derivative(d, 'y');
    out = add(out, mul(numNode(t.c), d));
  }
  return out;
}
const fAt = (terms, a, b) => terms.reduce((s, t) => s + t.c * a ** t.i * b ** t.j, 0);

/** Additive terms of F (each gets its own PI). */
function termsOf(node) {
  const out = [];
  const go = (t, s) => { const x = unwrap(t); if (x.isOperatorNode && (x.fn === 'add' || x.fn === 'subtract')) { go(x.args[0], s); go(x.args[1], x.fn === 'subtract' ? -s : s); return; } if (x.isOperatorNode && x.fn === 'unaryMinus') { go(x.args[0], -s); return; } out.push(s < 0 ? neg(paren(x)) : x); };
  go(node, 1);
  return out;
}
/** e^{ax+by} or c·e^{ax+by}: { a, b } */
function expOf(t) {
  const lin = (u) => { const a = evalAt(u, { x: 1, y: 0 }) - evalAt(u, { x: 0, y: 0 }), b = evalAt(u, { x: 0, y: 1 }) - evalAt(u, { x: 0, y: 0 }); const c0 = evalAt(u, { x: 0, y: 0 }); return [a, b, c0].every(Number.isFinite) && sameAt(u, add(add(mul(numNode(a), sym('x')), mul(numNode(b), sym('y'))), numNode(c0)), XY) ? { a, b } : null; };
  let found = null, kind = null, bad = false;
  t.traverse((m) => {
    const arg = m.isFunctionNode && m.fn.name === 'exp' ? m.args[0] : m.isOperatorNode && m.fn === 'pow' && unwrap(m.args[0]).isSymbolNode && unwrap(m.args[0]).name === 'e' ? m.args[1] : m.isFunctionNode && ['sin', 'cos'].includes(m.fn.name) ? m.args[0] : null;
    if (!arg) return;
    const l = lin(unwrap(arg));
    if (!l || found) { bad = true; return; }
    found = l; kind = m.isFunctionNode && ['sin', 'cos'].includes(m.fn.name) ? 'trig' : 'exp';
  });
  if (bad || !found) return null;
  // the rest must be a constant
  const probe = (s) => evalAt(t, s);
  const base = kind === 'exp' ? fn('exp', add(mul(numNode(found.a), sym('x')), mul(numNode(found.b), sym('y')))) : null;
  if (kind === 'exp' && !sameAt((s) => probe(s) / evalAt(base, s), (s) => probe({ x: 0.3, y: 0.2 }) / evalAt(base, { x: 0.3, y: 0.2 }), XY)) return null;
  return { ...found, kind };
}

export function solve({ eq }) {
  const { terms, n, F } = readOperator(eq);
  const steps = [];
  steps.push({ title: 'Operator form', formula: "f(D, D')\\,z = F(x, y)", depth: 0, lines: [`\\left(${opTex(terms)}\\right)z = ${T(F)}`] });
  // auxiliary equation f(m, 1): coefficient of m^i
  const c = Array(n + 1).fill(0);
  for (const t of terms) c[t.i] += t.c;
  let top = n;
  while (top > 0 && Math.abs(c[top]) < 1e-14) top--;
  const missing = n - top; // a factor D′^missing
  const roots = top > 0 ? polyRootsComplex(c.slice(0, top + 1)) : [];
  const rootTex = (r) => (r.im ? `${exactTex(r.re)} \\pm ${exactTex(r.im)}i`.replace(/^0 \\pm /, '\\pm ') : exactTex(r.re));
  const aux = c.slice(0, top + 1).map((v, i) => ({ v, i })).reverse().filter(({ v }) => Math.abs(v) > 1e-14).map(({ v, i }, k) => `${k === 0 ? (v < 0 ? '-' : '') : v < 0 ? ' - ' : ' + '}${exactTex(Math.abs(v)) === '1' && i ? '' : exactTex(Math.abs(v))}${i ? `m${i > 1 ? `^{${i}}` : ''}` : ''}`).join('');
  steps.push({ title: 'Auxiliary equation', formula: "D = m, \\ D' = 1", depth: 0, lines: [top > 0 ? `${aux} = 0 \\Rightarrow m = ${roots.map((r) => `${rootTex(r)}${r.m > 1 ? ` \\ (\\text{${r.m} times})` : ''}`).join(', \\ ')}` : '\\text{no } D \\text{ terms}', ...(missing ? [`\\text{a factor } D'${missing > 1 ? `^{${missing}}` : ''} \\text{ gives } \\phi(x)${missing > 1 ? ' + y\\,\\phi(x) + \\cdots' : ''}`] : [])] });
  // CF
  let k = 0;
  const cf = [];
  const arg = (m) => (Math.abs(m) < 1e-14 ? 'y' : `y ${m < 0 ? '-' : '+'} ${exactTex(Math.abs(m)) === '1' ? '' : exactTex(Math.abs(m))}x`);
  for (const r of roots) {
    const mults = r.im ? [r.re, null] : [r.re];
    for (let j = 0; j < r.m; j++) {
      const xs = j === 0 ? '' : j === 1 ? 'x\\,' : `x^{${j}}\\,`;
      if (r.im) {
        const im = exactTex(r.im) === '1' ? 'i' : `${exactTex(r.im)}i`;
        for (const sg of ['+', '-']) cf.push(`${xs}\\phi_{${++k}}(y + ${Math.abs(r.re) < 1e-14 ? `${sg === '-' ? '-' : ''}${im}x` : `(${exactTex(r.re)} ${sg} ${im})x`})`.replace('y + -', 'y - '));
      }
      else cf.push(`${xs}\\phi_{${++k}}(${arg(mults[0])})`);
    }
  }
  for (let j = 0; j < missing; j++) cf.push(`${j === 0 ? '' : j === 1 ? 'y\\,' : `y^{${j}}\\,`}\\phi_{${++k}}(x)`);
  const cfTex = cf.join(' + ');
  steps.push({ title: 'Complementary function', formula: 'm \\Rightarrow \\phi(y + mx); \\ \\text{repeated } m \\Rightarrow \\phi_1(y + mx) + x\\,\\phi_2(y + mx)', depth: 0, lines: [`\\text{CF} = ${cfTex}`] });
  // PI
  const Fzero = zeroAt(F, XY);
  let PI = num(0);
  if (!Fzero) {
    const realRoots = roots.every((r) => !r.im);
    for (const t of termsOf(F)) {
      const e = expOf(t);
      const lines = [];
      let p = null;
      if (e && e.kind === 'exp' && Math.abs(fAt(terms, e.a, e.b)) > 1e-12) {
        const v = fAt(terms, e.a, e.b);
        p = nicest(div(t, numNode(v)), XY);
        lines.push(`\\frac{1}{f(D, D')}${T(t)} = \\frac{${T(t)}}{f(${exactTex(e.a)}, ${exactTex(e.b)})} = ${T(p)}`);
      } else if (e && e.kind === 'trig' && n === 2) {
        // D² → −a², DD′ → −ab, D′² → −b²
        const v = terms.reduce((s, q) => s + q.c * (q.i === 2 ? -(e.a ** 2) : q.i === 1 ? -(e.a * e.b) : -(e.b ** 2)), 0);
        if (Math.abs(v) > 1e-12) { p = nicest(div(t, numNode(v)), XY); lines.push(`D^2 \\to -${exactTex(e.a ** 2)}, \\ DD' \\to -${exactTex(e.a * e.b)}, \\ D'^2 \\to -${exactTex(e.b ** 2)}: \\ \\text{PI} = \\frac{${T(t)}}{${exactTex(v)}} = ${T(p)}`); }
      }
      if (!p) {
        if (!realRoots) throw new EngineError('With complex roots NETZ can only do e^(ax + by) right sides (and sin/cos in second order).');
        // general rule, factor by factor: f = c_top Π (D − mD′) · D′^missing
        let cur = div(t, numNode(c[top] || c[0]));
        lines.push(`\\text{PI} = \\frac{1}{${exactTex(c[top])}}\\cdot ${roots.map((r) => `\\frac{1}{(D ${r.re < 0 ? '+' : '-'} ${exactTex(Math.abs(r.re)) === '1' ? '' : exactTex(Math.abs(r.re))}D')${r.m > 1 ? `^{${r.m}}` : ''}}`).join('')}${missing ? `\\frac{1}{D'${missing > 1 ? `^{${missing}}` : ''}}` : ''}\\,${T(t)}`.replace(/\(D - 0D'\)|\(D \+ 0D'\)|\(D - D'\)(?=x)/g, (m0) => m0));
        for (let j = 0; j < missing; j++) { cur = antiderivative(nicest(cur, XY), 'y', XY).F; lines.push(`\\frac{1}{D'}: \\ \\int (\\ldots)\\,dy = ${T(nicest(cur, XY))}`); }
        for (const r of roots) for (let j = 0; j < r.m; j++) {
          const m = r.re;
          const inX = nicest(substitute(cur, 'y', sub(sym('c'), mul(numNode(m), sym('x')))), ['x', 'c']);
          let I;
          try { I = antiderivative(inX, 'x', ['x', 'c']).F; } catch { throw new EngineError(`NETZ could not integrate ${inX.toString()} with respect to x.`); }
          cur = nicest(substitute(I, 'c', add(sym('y'), mul(numNode(m), sym('x')))), XY);
          lines.push(`\\frac{1}{D ${m < 0 ? '+' : '-'} ${exactTex(Math.abs(m)) === '1' ? '' : exactTex(Math.abs(m))}D'}: \\ \\int (\\ldots)\\big|_{y = c ${m < 0 ? '+' : '-'} ${exactTex(Math.abs(m)) === '1' ? '' : exactTex(Math.abs(m))}x}\\,dx, \\ c \\to y ${m < 0 ? '-' : '+'} ${exactTex(Math.abs(m)) === '1' ? '' : exactTex(Math.abs(m))}x: \\ ${T(cur)}`.replace(/- 0x|\+ 0x|- 0D'|\+ 0D'/g, '').replace(/c \\to y \s*:/, 'c \\to y:'));
        }
        p = cur;
      }
      PI = add(PI, p);
      steps.push({ title: `PI of ${T(t)}`.replace(/\\[a-z]+/g, '').replace(/[{}]/g, '').slice(0, 50), depth: 1, lines });
    }
    PI = nicest(PI, XY);
    steps.push({ title: 'Particular integral', formula: "\\text{PI} = \\frac{1}{f(D, D')}F", depth: 0, lines: [`\\text{PI} = ${T(PI)}`] });
  }
  const answer = `z = ${cfTex}${Fzero ? '' : ` + ${T(PI)}`}`;
  steps.push({ title: 'General solution', formula: 'z = \\text{CF} + \\text{PI}', depth: 0, lines: [answer] });
  // check: f(D, D′)PI = F, and a sample CF term is annihilated
  const piOk = Fzero || sameAt(applyOp(terms, PI), F, XY, 1e-6);
  const cfOk = roots.filter((r) => !r.im).every((r) => zeroAt(applyOp(terms, fn('sin', add(sym('y'), mul(numNode(r.re), sym('x'))))), XY, 1e-8));
  return { cf: cfTex, pi: Fzero ? null : T(PI), answer, steps, notes: [], verified: piOk && cfOk, result: answer };
}
