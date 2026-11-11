/**
 * Line, surface and volume integrals (F4), shared by the 4D pages.
 *   readPath(text, t0, t1)   "x = cos(t), y = sin(t), z = t" (t from t0 to t1) or a polyline "(0,0) -> (1,0) -> (1,1)"
 *                            → [{ r: [x, y, z] nodes in t, t0, t1, label }]
 *   lineIntegral(F | f, path, kind)   work ∫F·dr = Σ∫F(r(t))·r′(t) dt, or ∫f ds = Σ∫f(r(t))|r′(t)| dt
 *   iterated(f, dims)        ∫…∫ f with dims innermost first [{ v, lo, hi }] (limits may use outer letters):
 *                            by hand (definite, stage by stage) when it can, else Gauss–Legendre, labelled ≈
 *   surface(kind, …)         r(u, v) and its ranges for the standard surfaces (graph, sphere, cylinder, plane, custom)
 *   flux / scalar over a surface: ∬F·(r_u × r_v) du dv, ∬f|r_u × r_v| du dv
 * Every value is also worked out numerically; a mismatch is reported.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, sub, div, paren, tidy, polish } from './tree';
import { readMulti, mtex, exactTex, tidyMulti, integrandTex } from './multi';
import { definite, substitute, gaussLegendre, numericIterated, fnOf, texVar } from './iterated';
import { numNode } from './ode';
import { toFraction } from '../numeric/fraction';

export const XYZ = ['x', 'y', 'z'];
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
export const numberIn = (t, label) => {
  const s = String(t ?? '').trim();
  if (!s) throw new EngineError(`${label} is empty.`);
  let v;
  try { v = math.evaluate(s.replace(/π/g, 'pi').replace(/(\d)\s*pi/g, '$1*pi')); } catch { v = NaN; }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label}: "${s}" is not a number.`);
  return v;
};
export const comp = (t, label, extra = []) => { const s = String(t ?? '').trim(); return s ? readMulti(s, label, extra) : num(0); };
export const vecTex = (nodes) => `\\left(${nodes.map((n) => mtex(polish(n))).join(',\\ ')}\\right)`;

/** Letters other than the allowed ones → error. */
export function onlyLetters(nodes, allowed, label) {
  for (const n of nodes) n.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !allowed.includes(m.name) && !['pi', 'e'].includes(m.name) && !(m.name in math && typeof math[m.name] === 'function')) throw new EngineError(`${label} may use only ${allowed.join(', ')} (it uses ${m.name}).`); });
}

/** A path: a parametrised curve or a polyline of points. */
export function readPath(text, t0, t1) {
  const s = String(text ?? '').trim();
  if (!s) throw new EngineError('Describe the path: x = …, y = … in t, or points like (0,0) -> (1,0) -> (1,1).');
  if (/->|→/.test(s)) {
    const pts = s.split(/->|→/).map((p) => p.trim().replace(/^\(|\)$/g, '').split(',').map((v) => numberIn(v, 'A point')));
    if (pts.length < 2) throw new EngineError('A polyline needs at least two points.');
    if (pts.some((p) => p.length !== pts[0].length || p.length < 2 || p.length > 3)) throw new EngineError('Give every point as (x, y) or (x, y, z), all the same size.');
    const P = pts.map((p) => [p[0], p[1], p[2] ?? 0]);
    return P.slice(1).map((q, i) => {
      const p = P[i];
      const r = [0, 1, 2].map((k) => tidy(add(numNode(p[k]), mul(numNode(q[k] - p[k]), sym('t')))));
      return { r, t0: 0, t1: 1, label: `(${p.slice(0, pts[0].length).map(exactTex).join(', ')}) \\to (${q.slice(0, pts[0].length).map(exactTex).join(', ')})` };
    });
  }
  const parts = Object.fromEntries(s.split(/[,;]/).map((p) => p.trim()).filter(Boolean).map((p) => { const m = p.match(/^([xyz])\s*=\s*(.+)$/); if (!m) throw new EngineError(`Write the path as x = …, y = …, z = … in t (could not read "${p}").`); return [m[1], readMulti(m[2], m[1])]; }));
  if (!parts.x || !parts.y) throw new EngineError('Give at least x = … and y = … in terms of t.');
  const r = [parts.x, parts.y, parts.z || num(0)];
  onlyLetters(r, ['t'], 'The path');
  return [{ r, t0: numberIn(t0, 'The start t'), t1: numberIn(t1, 'The end t'), label: `t: ${exactTex(numberIn(t0, 't'))} \\to ${exactTex(numberIn(t1, 't'))}` }];
}

/** One-variable definite integral by hand, else numerically. { number, tex, lines, exact } */
export function integrate1(f, v, a, b, vars = [v]) {
  if (f.toString().length < 180) try {
    const d = definite(tidy(f), v, numNode(a), numNode(b), vars, 0, { light: true });
    // valueTex is "exact" or "exact \approx decimal" (or only "\approx …" when no exact form was found)
    if (d.number !== null && Number.isFinite(d.number)) return { number: d.number, tex: d.valueTex, lines: d.lines, exact: !/^\s*\\approx/.test(d.valueTex) && !/\d\.\d/.test(d.valueTex.replace(/\\approx.*$/, '')) };
  } catch { /* numeric */ }
  const { xs, ws } = gaussLegendre(48);
  const fv = fnOf(f);
  let s = 0;
  const n = 32;
  for (let k = 0; k < n; k++) {
    const A = a + ((b - a) * k) / n, B = a + ((b - a) * (k + 1)) / n, c = (A + B) / 2, h = (B - A) / 2;
    for (let i = 0; i < xs.length; i++) s += ws[i] * h * fv({ [v]: c + h * xs[i] });
  }
  return { number: s, tex: `\\approx ${Number(s.toPrecision(8))}`, lines: [`\\int_{${exactTex(a)}}^{${exactTex(b)}} ${integrandTex(polish(f))}\\,d${texVar(v)} \\approx ${Number(s.toPrecision(8))} \\ (\\text{numerically})`], exact: false };
}

/** An exact form for a number: exactTex, else a fraction (1/28), else a fraction times π or over π. Decimals stay. */
export function recognise(v) {
  const t = exactTex(v);
  if (!/\d\.\d/.test(t)) return t;
  const frac = (x) => { const f = toFraction(x, 5000, 1e-11); return f ? { n: f.n, d: f.d } : null; };
  // n·extra/d, with 1·π written as π
  const ft = ({ n, d }, extra = '') => {
    const top = extra && Math.abs(n) === 1 ? extra : `${Math.abs(n)}${extra}`;
    return d === 1 ? `${n < 0 ? '-' : ''}${top}` : `${n < 0 ? '-' : ''}\\frac{${top}}{${d}}`;
  };
  // every reading (plain, ×π, ×π², ÷π, ÷π²) with a relative tolerance; the one with the smallest numbers wins
  const rel = (x) => { const f = toFraction(x, 1000, 1e-10 * Math.max(1e-3, Math.abs(x))); return f && Math.abs(f.n / f.d - x) < 1e-10 * Math.max(1e-3, Math.abs(x)) ? { n: f.n, d: f.d } : null; };
  const over = (q, s) => `${q.n < 0 ? '-' : ''}\\frac{${Math.abs(q.n)}}{${q.d === 1 ? '' : q.d}${s}}`;
  const cands = [
    [rel(v), (q) => ft(q)],
    [rel(v / Math.PI), (q) => ft(q, '\\pi')], [rel(v / (Math.PI * Math.PI)), (q) => ft(q, '\\pi^{2}')],
    [rel(v * Math.PI), (q) => over(q, '\\pi')], [rel(v * Math.PI * Math.PI), (q) => over(q, '\\pi^{2}')],
  ].filter(([q]) => q).sort((p, q) => Math.abs(p[0].n) + p[0].d - (Math.abs(q[0].n) + q[0].d));
  if (cands.length) return cands[0][1](cands[0][0]);
  void frac;
  return t;
}

/** Composite Gauss–Legendre for one or two dimensions (panels make √ end points behave). */
function compositeIterated(f, dims, n, panels) {
  const { xs, ws } = gaussLegendre(n);
  const rec = (k, scope) => {
    if (k < 0) return f(scope);
    const d = dims[k];
    const a = d.lo(scope), b = d.hi(scope);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
    let s = 0;
    for (let p = 0; p < panels; p++) {
      const A = a + ((b - a) * p) / panels, B = a + ((b - a) * (p + 1)) / panels, m = (A + B) / 2, h = (B - A) / 2;
      for (let i = 0; i < xs.length; i++) s += ws[i] * h * rec(k - 1, { ...scope, [d.v]: m + h * xs[i] });
    }
    return s;
  };
  return rec(dims.length - 1, {});
}

/** Composite Gauss–Legendre on [a, b] with n points per panel. */
function gl(fv, v, a, b, n, panels = 24) {
  const { xs, ws } = gaussLegendre(n);
  let s = 0;
  for (let k = 0; k < panels; k++) {
    const A = a + ((b - a) * k) / panels, B = a + ((b - a) * (k + 1)) / panels, c = (A + B) / 2, h = (B - A) / 2;
    for (let i = 0; i < xs.length; i++) s += ws[i] * h * fv({ [v]: c + h * xs[i] });
  }
  return s;
}
/** A one-letter factor of a split integral: its value recognised from two quadrature orders (fast), else by hand. */
function integrateQuick(g, v, a, b) {
  const fv = fnOf(g);
  const v1 = gl(fv, v, a, b, 24), v2 = gl(fv, v, a, b, 32);
  const t = exactTex(v2);
  if (Number.isFinite(v2) && Math.abs(v1 - v2) < 1e-12 * Math.max(1, Math.abs(v2)) && !/\d\.\d/.test(t)) {
    return { number: v2, tex: t, lines: [`\\int_{${exactTex(a)}}^{${exactTex(b)}} ${integrandTex(polish(g))}\\,d${texVar(v)} = ${t}`], exact: true };
  }
  return integrate1(g, v, a, b, [v]);
}

/** |r′(t)|: a constant speed as an exact √k (the helix: √2), otherwise the tidy square root. */
function speedOf(d) {
  const s = tidyMulti(math.parse(`sqrt((${d[0]})^2 + (${d[1]})^2 + (${d[2]})^2)`), ['t']);
  const vals = [0.3, 1.1, 2.7].map((t) => evalAt(s, { t }));
  if (vals.every((v) => Number.isFinite(v) && Math.abs(v - vals[0]) < 1e-12)) {
    const sq = vals[0] * vals[0], k = Math.round(sq);
    if (Math.abs(sq - k) < 1e-9) { const r = Math.round(Math.sqrt(k)); return r * r === k ? num(r) : math.parse(`sqrt(${k})`); }
    return numNode(vals[0]);
  }
  return s;
}

/** ∫_C F·dr (kind 'work') or ∫_C f ds (kind 'scalar') over the path pieces. */
export function lineIntegral(F, path, kind = 'work') {
  const lines = [];
  let total = 0, exact = true;
  const texParts = [];
  for (const piece of path) {
    const [x, y, z] = piece.r;
    const d = piece.r.map((c) => tidy(math.derivative(c, 't')));
    const at = (node) => substitute(substitute(substitute(node, 'x', paren(x)), 'y', paren(y)), 'z', paren(z));
    let integrand;
    if (kind === 'work') integrand = tidyMulti(add(add(mul(paren(at(F[0])), paren(d[0])), mul(paren(at(F[1])), paren(d[1]))), mul(paren(at(F[2])), paren(d[2]))), ['t']);
    else integrand = tidyMulti(mul(paren(at(F)), speedOf(d)), ['t']);
    const r = integrate1(integrand, 't', piece.t0, piece.t1, ['t']);
    lines.push(`\\text{${path.length > 1 ? 'piece ' : ''}}${piece.label}: \\ r(t) = ${vecTex(piece.r)}, \\ r'(t) = ${vecTex(d)}`);
    lines.push(`${kind === 'work' ? 'F \\cdot r\'' : 'f\\,|r\'|'} = ${mtex(polish(integrand))}`);
    lines.push(...r.lines.slice(-1).map((l) => (/^=/.test(l) ? `\\int = ${l.slice(1)}` : l)));
    total += r.number;
    if (!r.exact) exact = false;
    texParts.push(r.tex.replace(/\s*\\approx.*$/, ''));
  }
  // the total: a plain exact number, else the exact pieces added (with the decimal), else the decimal
  const tex = exactTex(total);
  const dec = Number(total.toPrecision(8));
  let out;
  if (!/\d\.\d/.test(tex)) out = tex;
  else if (exact && path.length === 1) out = `${texParts[0]} \\approx ${dec}`;
  else if (exact) out = `${texParts.join(' + ').replace(/\+ -/g, '- ')} \\approx ${dec}`;
  else out = `\\approx ${dec}`;
  return { number: total, tex: out, lines, exact };
}

/** ∫…∫ f over dims (innermost first). Hand rules stage by stage; else numerically. { number, tex, lines, exact } */
export function iterated(f, dims) {
  const letters = dims.map((d) => d.v);
  const lines = [];
  // constant limits and f = g₁(u)·g₂(v)·…: one integral per letter, multiplied (cos²θ + sin²θ tidies away per letter)
  const constLimits = dims.every((d) => [d.lo, d.hi].every((n) => !letters.some((l) => { let h = false; n.traverse((m) => { if (m.isSymbolNode && m.name === l) h = true; }); return h; })));
  if (dims.length > 1 && constLimits) {
    const sp = separate(tidy(f), letters);
    if (sp) {
      const range = (v) => { const d = dims.find((q) => q.v === v); return [evalAt(d.lo, {}), evalAt(d.hi, {})]; };
      // numerically first: when the product of the factors is a recognisable number, the hand rules are not needed
      const quick = sp.map(({ v, g }) => { const [a, b] = range(v); const fv = fnOf(g); return [gl(fv, v, a, b, 24), gl(fv, v, a, b, 32)]; });
      const qp = quick.reduce((s, [, b]) => s * b, 1), qp1 = quick.reduce((s, [a]) => s * a, 1);
      const qt = exactTex(qp);
      if (Number.isFinite(qp) && Math.abs(qp - qp1) < 1e-11 * Math.max(1, Math.abs(qp)) && !/\d\.\d/.test(qt)) {
        return { number: qp, tex: qt, lines: [`\\text{the integrand splits into one-letter factors: } ${sp.map((q) => `\\left(${mtex(polish(q.g))}\\right)`).join('\\cdot')}`, ...sp.map((q, i) => { const [a, b] = range(q.v); const t = exactTex(quick[i][1]); return `\\int_{${exactTex(a)}}^{${exactTex(b)}} (\\ldots)\\,d${texVar(q.v)} ${/\d\.\d/.test(t) ? '\\approx ' + Number(quick[i][1].toPrecision(8)) : '= ' + t}`; }), `\\text{product} = ${qt}`], exact: true };
      }
      const vals = sp.map(({ v, g }) => { const [a, b] = range(v); return { v, g, r: integrateQuick(g, v, a, b) }; });
      const prod = vals.reduce((s, q) => s * q.r.number, 1);
      const t = exactTex(prod);
      if (Number.isFinite(prod) && (vals.every((q) => q.r.exact) || !/\d\.\d/.test(t))) {
        const sl = [`\\text{the integrand splits: } ${vals.map((q) => `\\left(${mtex(polish(q.g))}\\right)`).join('\\cdot')}`, ...vals.map((q) => `\\int ${integrandTex(polish(q.g))}\\,d${texVar(q.v)} = ${q.r.tex}`), `\\text{product} = ${/\d\.\d/.test(t) ? `\\approx ${Number(prod.toPrecision(8))}` : t}`];
        return { number: prod, tex: /\d\.\d/.test(t) ? `\\approx ${Number(prod.toPrecision(8))}` : t, lines: sl, exact: !/\d\.\d/.test(t) };
      }
    }
  }
  let cur = tidy(f);
  // very long integrands go straight to the numbers (the hand rules spend seconds failing on them)
  let ok = cur.toString().length < 220;
  for (let k = 0; ok && k < dims.length; k++) {
    const d = dims[k];
    const outer = letters.slice(k + 1);
    try {
      const r = definite(cur, d.v, d.lo, d.hi, outer.length ? outer : [d.v], 0, { light: true });
      lines.push(r.lines[0], ...r.lines.slice(1));
      cur = r.value;
    } catch { ok = false; break; }
  }
  // numeric value (always, as a check)
  const nd = dims.map((d) => ({ v: d.v, lo: fnOf(d.lo), hi: fnOf(d.hi) }));
  const fv = fnOf(f);
  const numv = dims.length <= 2 ? compositeIterated(fv, nd, 16, 8) : numericIterated(fv, nd, 32);
  if (ok) {
    const v = evalAt(cur, {});
    // the hand result is checked stage by stage (by differentiating); the quadrature only has to roughly agree,
    // since √ end points (a quarter disc) keep it to about 6 digits
    if (Number.isFinite(v) && Math.abs(v - numv) < 1e-4 * Math.max(1, Math.abs(v))) {
      const t = recognise(v);
      const exactForm = /\d\.\d/.test(t) ? (() => { const s = mtex(polish(cur)); return /\d\.\d/.test(s) || s.length > 120 ? null : s; })() : t;
      return { number: v, tex: exactForm ? (/\d\.\d/.test(t) ? `${exactForm} \\approx ${Number(v.toPrecision(8))}` : exactForm) : `\\approx ${Number(v.toPrecision(8))}`, lines, exact: !!exactForm };
    }
  }
  // a smooth integrand: two quadrature orders agreeing to 12 digits make the value safe to recognise (32π, 4/3)
  const numv2 = dims.length <= 2 ? compositeIterated(fv, nd, 12, 6) : numericIterated(fv, nd, 24);
  const known = Math.abs(numv - numv2) < 1e-12 * Math.max(1, Math.abs(numv)) ? recognise(numv) : null;
  if (known && !/\d\.\d/.test(known)) return { number: numv, tex: known, lines: [...lines, `\\text{(evaluated numerically: } ${Number(numv.toPrecision(10))} = ${known})`], exact: true };
  // only the digits the two quadrature orders agree on
  const rel = Math.abs(numv - numv2) / Math.max(1e-300, Math.abs(numv));
  const digits = Math.max(3, Math.min(8, Math.floor(-Math.log10(rel || 1e-16)) - 1));
  const shown = Number(numv.toPrecision(digits));
  return { number: numv, tex: `\\approx ${shown}`, lines: [...lines, `\\text{(evaluated numerically: } \\approx ${shown})`], exact: false };
}

/** Evaluate the parts with no letters (sin(π/2) → 1, cos(π/2) → 0), keeping π-free exact numbers. */
export function foldConst(node) {
  const free = (n) => { let f = true; n.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['pi', 'e'].includes(m.name)) f = false; }); return f; };
  const go = (n) => {
    if (n.isConstantNode || n.isSymbolNode) return n;
    if (free(n)) {
      const v = evalAt(n, {});
      if (Number.isFinite(v)) {
        if (Math.abs(v) < 1e-13) return num(0);
        if (Math.abs(v - Math.round(v)) < 1e-12) return numNode(Math.round(v));
      }
      return n;
    }
    return n.map((c) => go(c));
  };
  return tidy(go(node));
}

/** The cross product r_u × r_v of two node vectors. */
export const cross = (a, b) => [sub(mul(a[1], b[2]), mul(a[2], b[1])), sub(mul(a[2], b[0]), mul(a[0], b[2])), sub(mul(a[0], b[1]), mul(a[1], b[0]))].map((n) => foldConst(tidy(n)));
const lettersIn = (...vs) => { const s = new Set(); vs.flat().forEach((n) => n.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && !['pi', 'e'].includes(m.name)) s.add(m.name); })); return [...s]; };
export const dot = (a, b) => a.map((c, i) => mul(paren(c), paren(b[i]))).reduce((p, q) => add(p, q));
export const at3 = (node, r) => substitute(substitute(substitute(node, 'x', paren(r[0])), 'y', paren(r[1])), 'z', paren(r[2]));

/**
 * Standard surfaces as r(u, v) with ranges (outer v, inner u), oriented outward / upward.
 *   graph    z = g(x, y), x in [a, b], y in [c(x), d(x)]    r = (x, y, g)          n up
 *   sphere   radius a, whole or upper half                   r = a(sinφcosθ, sinφsinθ, cosφ)   n out
 *   cylinder x² + y² = a², 0 ≤ z ≤ h (the side)              r = (a cosθ, a sinθ, z)            n out
 *   disc     z = h, x² + y² ≤ a²                              r = (ρcosθ, ρsinθ, h)              n up
 */
export function surface(kind, p) {
  const P = (s) => math.parse(String(s));
  if (kind === 'graph') {
    const g = readMulti(p.g, 'z = g(x, y)');
    onlyLetters([g], ['x', 'y'], 'g(x, y)');
    const ylo = readMulti(p.ylo, 'The lower y limit'), yhi = readMulti(p.yhi, 'The upper y limit');
    onlyLetters([ylo, yhi], ['x'], 'The y limits');
    return { r: [sym('x'), sym('y'), g], u: 'y', v: 'x', dims: [{ v: 'y', lo: ylo, hi: yhi }, { v: 'x', lo: numNode(numberIn(p.xlo, 'The lower x limit')), hi: numNode(numberIn(p.xhi, 'The upper x limit')) }], tex: `z = ${mtex(polish(g))}`, swap: true };
  }
  if (kind === 'sphere') {
    const a = numberIn(p.a, 'The radius');
    const top = p.half ? 'pi/2' : 'pi';
    return { r: [P(`${a}*sin(phi)*cos(theta)`), P(`${a}*sin(phi)*sin(theta)`), P(`${a}*cos(phi)`)], u: 'phi', v: 'theta', dims: [{ v: 'phi', lo: num(0), hi: P(top) }, { v: 'theta', lo: num(0), hi: P('2*pi') }], tex: `x^2 + y^2 + z^2 = ${exactTex(a * a)}${p.half ? ', \\ z \\ge 0' : ''}` };
  }
  if (kind === 'cylinder') {
    const a = numberIn(p.a, 'The radius'), h = numberIn(p.h, 'The height');
    return { r: [P(`${a}*cos(theta)`), P(`${a}*sin(theta)`), sym('z')], u: 'z', v: 'theta', dims: [{ v: 'z', lo: num(0), hi: numNode(h) }, { v: 'theta', lo: num(0), hi: P('2*pi') }], tex: `x^2 + y^2 = ${exactTex(a * a)}, \\ 0 \\le z \\le ${exactTex(h)}`, swap: true };
  }
  if (kind === 'disc') {
    const a = numberIn(p.a, 'The radius'), h = p.h === undefined ? 0 : numberIn(p.h, 'The height');
    return { r: [P('rho*cos(theta)'), P('rho*sin(theta)'), numNode(h)], u: 'rho', v: 'theta', dims: [{ v: 'rho', lo: num(0), hi: numNode(a) }, { v: 'theta', lo: num(0), hi: P('2*pi') }], tex: `z = ${exactTex(h)}, \\ x^2 + y^2 \\le ${exactTex(a * a)}`, down: !!p.down };
  }
  throw new EngineError('Pick a surface.');
}

/** Normal vector N = r_u × r_v (with the orientation flag applied). */
export function normalOf(S) {
  const ru = S.r.map((c) => tidy(math.derivative(c, S.u))), rv = S.r.map((c) => tidy(math.derivative(c, S.v)));
  let N = cross(ru, rv);
  if (S.swap || S.down) N = N.map((n) => tidy(mul(num(-1), paren(n))));
  return { ru, rv, N };
}

/** ∬_S F·n dS (flux) or ∬_S f dS. */
export function surfaceIntegral(F, S, kind = 'flux') {
  const { ru, rv, N } = normalOf(S);
  const vars = [S.u, S.v];
  let integrand;
  const light = (n) => { const t = foldConst(tidy(n)); return t.toString().length < 160 ? tidyMulti(t, vars) : t; };
  if (kind === 'flux') integrand = light(dot(F.map((c) => at3(c, S.r)), N));
  else integrand = light(mul(paren(at3(F, S.r)), math.parse(`sqrt((${N[0]})^2 + (${N[1]})^2 + (${N[2]})^2)`)));
  const r = iterated(integrand, S.dims);
  return { ...r, ru, rv, N, integrand };
}

/**
 * Solid regions for volume integrals: { map: [x, y, z] in the region's own letters, jac, dims (innermost first), tex }.
 *   box (x, y, z ranges) · sphere radius a (spherical, r² sin φ) · cylinder radius a, 0 ≤ z ≤ h (cylindrical, ρ)
 *   limits: z from h₁(x, y) to h₂(x, y), y from g₁(x) to g₂(x), x from a to b
 */
export function volumeRegion(kind, p) {
  const P = (s) => math.parse(String(s));
  if (kind === 'box') {
    const r = ['x', 'y', 'z'].map((v) => [numberIn(p[`${v}lo`], `The lower ${v}`), numberIn(p[`${v}hi`], `The upper ${v}`)]);
    return { map: [sym('x'), sym('y'), sym('z')], jac: num(1), dims: ['z', 'y', 'x'].map((v) => { const k = 'xyz'.indexOf(v); return { v, lo: numNode(r[k][0]), hi: numNode(r[k][1]) }; }), tex: r.map(([a, b], k) => `${exactTex(a)} \le ${'xyz'[k]} \le ${exactTex(b)}`).join(', \ '), faces: r };
  }
  if (kind === 'sphere') {
    const a = numberIn(p.a, 'The radius');
    return { map: [P('r*sin(phi)*cos(theta)'), P('r*sin(phi)*sin(theta)'), P('r*cos(phi)')], jac: P('r^2*sin(phi)'), dims: [{ v: 'r', lo: num(0), hi: numNode(a) }, { v: 'phi', lo: num(0), hi: P('pi') }, { v: 'theta', lo: num(0), hi: P('2*pi') }], tex: `x^2 + y^2 + z^2 \le ${exactTex(a * a)} \ (dV = r^2\sin\phi\,dr\,d\phi\,d\theta)`, a };
  }
  if (kind === 'cylinder') {
    const a = numberIn(p.a, 'The radius'), h = numberIn(p.h, 'The height');
    return { map: [P('rho*cos(theta)'), P('rho*sin(theta)'), sym('z')], jac: sym('rho'), dims: [{ v: 'rho', lo: num(0), hi: numNode(a) }, { v: 'z', lo: num(0), hi: numNode(h) }, { v: 'theta', lo: num(0), hi: P('2*pi') }], tex: `x^2 + y^2 \le ${exactTex(a * a)}, \ 0 \le z \le ${exactTex(h)} \ (dV = \rho\,d\rho\,dz\,d\theta)`, a, h };
  }
  if (kind === 'limits') {
    const zlo = readMulti(p.zlo, 'The lower z'), zhi = readMulti(p.zhi, 'The upper z');
    const ylo = readMulti(p.ylo, 'The lower y'), yhi = readMulti(p.yhi, 'The upper y');
    onlyLetters([zlo, zhi], ['x', 'y'], 'The z limits');
    onlyLetters([ylo, yhi], ['x'], 'The y limits');
    return { map: [sym('x'), sym('y'), sym('z')], jac: num(1), dims: [{ v: 'z', lo: zlo, hi: zhi }, { v: 'y', lo: ylo, hi: yhi }, { v: 'x', lo: numNode(numberIn(p.xlo, 'The lower x')), hi: numNode(numberIn(p.xhi, 'The upper x')) }], tex: `${mtex(polish(zlo))} \le z \le ${mtex(polish(zhi))}, \ ${mtex(polish(ylo))} \le y \le ${mtex(polish(yhi))}, \ ${exactTex(numberIn(p.xlo, 'x'))} \le x \le ${exactTex(numberIn(p.xhi, 'x'))}` };
  }
  throw new EngineError('Pick a region.');
}
export function volumeIntegral(f, V) {
  const letters = V.dims.map((d) => d.v);
  const integrand = tidyMulti(mul(paren(at3(f, V.map)), V.jac), letters);
  return { ...iterated(integrand, V.dims), integrand };
}

/**
 * node(u, v, …) = c·g₁(u)·g₂(v)·…? Found by putting the other letters at simple values (0, π/2, π/4, 1) and checked
 * at scattered points. Returns [{ v, g }] (the constant folded into the first), or null.
 */
export function separate(node, vars) {
  const anchors = [0, Math.PI / 2, 1, Math.PI / 4, 0.5];
  const anchorNode = (a) => (a === 0 ? num(0) : a === Math.PI / 2 ? math.parse('pi/2') : a === Math.PI / 4 ? math.parse('pi/4') : numNode(a));
  for (const a of anchors) {
    const base = Object.fromEntries(vars.map((v) => [v, a]));
    const c = evalAt(node, base);
    if (!Number.isFinite(c) || Math.abs(c) < 1e-9) continue;
    // separable: f(p)·c^{k−1} = Π f(p with all but one letter at the anchor)
    const pts = [[0.37, 1.21, 0.83], [1.43, 0.67, 2.1], [0.92, 2.48, 0.29], [2.11, 0.33, 1.57]];
    const ok = pts.every((p) => {
      const s = Object.fromEntries(vars.map((v, i) => [v, p[i]]));
      const whole = evalAt(node, s);
      let prod = 1;
      for (const v of vars) prod *= evalAt(node, { ...base, [v]: s[v] });
      return Number.isFinite(whole) && Math.abs(whole * c ** (vars.length - 1) - prod) < 1e-9 * Math.max(1, Math.abs(prod));
    });
    if (!ok) return null;
    const parts = vars.map((v) => {
      let g = node;
      for (const w of vars) if (w !== v) g = substitute(g, w, anchorNode(a));
      g = foldConst(g);
      return { v, g: g.toString().length < 200 ? tidyMulti(g, [v]) : g };
    });
    // Π g_v = c^{k−1}·node: divide the first by c^{k−1}
    const k = c ** (vars.length - 1);
    // (no string round trip: "rho (π + 2)" would be read back as a function rho)
    if (Math.abs(k - 1) > 1e-12) parts[0].g = tidyMulti(div(paren(parts[0].g), numNode(k)), [parts[0].v]);
    return parts;
  }
  return null;
}
