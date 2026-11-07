/**
 * Euler's theorem on homogeneous functions: the maths for /euler-theorem-homogeneous (catalog 6D).
 * u is homogeneous of degree n when u(tx, ty) = tⁿ u(x, y). Then
 *   x u_x + y u_y = n u                      (and with z: + z u_z)
 *   x² u_xx + 2xy u_xy + y² u_yy = n(n − 1) u
 * Composite form: if u = F⁻¹(z) with z homogeneous of degree n (u = sin⁻¹ z, tan⁻¹ z, log z, …), then
 *   x u_x + y u_y = g(u) = n F(u)/F′(u)   and   x² u_xx + 2xy u_xy + y² u_yy = g(u)[g′(u) − 1].
 * The degree is found numerically (u(2x, 2y)/u(x, y) = 2ⁿ at several points) and every identity is checked numerically.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { math, add, mul, sym, num, polish, unwrap } from '../symbolic/tree';
import { readMulti, partial, lettersOf, mtex, equalAt } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { differentiate } from '../symbolic/derivative';

// Small positive points: functions like sin⁻¹((x² + y²)/(x + y)) are only defined for small x, y
const PTS = [[0.21, 0.37, 0.13], [0.33, 0.11, 0.27], [0.19, 0.41, 0.29], [0.37, 0.16, 0.08], [0.12, 0.29, 0.41]];

/** Degree of homogeneity, or null. */
export function homogeneousDegree(node, vars) {
  const ev = (scale, p) => { try { return node.evaluate(Object.fromEntries(vars.map((v, i) => [v, scale * p[i]]))); } catch { return NaN; } };
  const ns = [];
  for (const p of PTS) {
    const u1 = ev(1, p), u2 = ev(2, p), u3 = ev(3, p);
    if (![u1, u2, u3].every((y) => typeof y === 'number' && Number.isFinite(y)) || Math.abs(u1) < 1e-12) continue;
    if (u2 / u1 <= 0) return null;
    const n2 = Math.log(u2 / u1) / Math.log(2), n3 = Math.log(u3 / u1) / Math.log(3);
    if (Math.abs(n2 - n3) > 1e-7) return null;
    ns.push(n2);
  }
  if (ns.length < 3 || ns.some((n) => Math.abs(n - ns[0]) > 1e-7)) return null;
  const f = toFraction(ns[0], 100, 1e-7);
  return f ? f.n / f.d : ns[0];
}
/** n·u written the textbook way: u, 3u, ½u, 0. */
const nU = (n, u = 'u') => (Math.abs(n) < 1e-12 ? '0' : Math.abs(n - 1) < 1e-12 ? u : Math.abs(n + 1) < 1e-12 ? `-${u}` : `${nTex(n)}\\,${u}`);
const nText = (n) => { const f = toFraction(n, 100, 1e-9); return !f ? String(Number(n.toPrecision(6))) : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`; };
const nTex = (n) => { const f = toFraction(n, 100, 1e-9); return !f ? String(Number(n.toPrecision(6))) : f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`; };

// u = F⁻¹(z): the function F that makes F(u) = z, as a function of the symbol u
const INVERSES = {
  asin: { F: 'sin(u)', name: '\\sin u' }, acos: { F: 'cos(u)', name: '\\cos u' }, atan: { F: 'tan(u)', name: '\\tan u' },
  log: { F: 'exp(u)', name: 'e^{u}' },
};

export function solve({ u: text, second = 'yes' }) {
  const node = readMulti(text, 'u');
  const vars = lettersOf(node);
  if (vars.length < 2 || vars.length > 3) throw new EngineError('u should be a function of two or three letters (x, y or x, y, z).');
  const steps = [];
  const notes = [];
  const V = vars.map(sym);
  const firstSum = (d) => vars.map((v, i) => mul(V[i], d[i])).reduce((a, b) => add(a, b));
  const lhsTex = vars.map((v) => `${v}\\,u_{${v}}`).join(' + ');
  const secondLhsTex = vars.length === 2 ? 'x^2 u_{xx} + 2xy\\,u_{xy} + y^2 u_{yy}' : `\\sum_{i,j} x_i x_j\\, u_{x_i x_j}`;
  const tVars = vars.map((v) => mul(sym('t'), sym(v)));
  let scaled = node;
  vars.forEach((v, i) => { scaled = substitute(scaled, v, tVars[i]); });

  let n = homogeneousDegree(node, vars);
  let composite = null;
  if (n === null) {
    // Composite: u = F⁻¹(z) with z homogeneous
    const top = unwrap(node);
    const inv = top.isFunctionNode && INVERSES[top.fn.name];
    if (inv) {
      const z = unwrap(top.args[0]);
      const nz = homogeneousDegree(z, vars);
      if (nz !== null) composite = { z, n: nz, inv };
    }
    if (!composite) throw new EngineError('u is not homogeneous: u(tx, ty) is not tⁿ·u(x, y) for any n. (NETZ also tries u = sin⁻¹ z, cos⁻¹ z, tan⁻¹ z and log z with z homogeneous.)');
    n = composite.n;
  }

  const d = vars.map((v) => partial(node, v, vars).result);
  const S1 = firstSum(d);

  if (!composite) {
    steps.push({
      title: `Check that u is homogeneous`, formula: 'u(tx, ty) = t^{n} u(x, y)',
      lines: [`u(${vars.map((v) => `t${v}`).join(', ')}) = ${mtex(polish(scaled))} = t^{${nTex(n)}}\\, u(${vars.join(', ')})`, `\\text{So u is homogeneous of degree } n = ${nTex(n)}.`],
    });
    steps.push({ title: 'First partial derivatives', lines: vars.map((v, i) => `u_{${v}} = ${mtex(d[i])}`) });
    const ok1 = equalAt(S1, mul(num(n), node), vars);
    steps.push({
      title: "Euler's theorem (first order)", formula: `${lhsTex} = n\\,u`,
      lines: [`${lhsTex} = ${mtex(polish(S1))}`, `= ${nU(n)} = ${nU(n, `\\left(${mtex(polish(node))}\\right)`)}`],
    });
    const results = [{ lhs: lhsTex, rhs: nU(n), ok: ok1 }];
    if (second === 'yes' && vars.length === 2) {
      const dd = [partial(d[0], 'x', vars).result, partial(d[0], 'y', vars).result, partial(d[1], 'y', vars).result];
      const [X, Y] = V;
      const S2 = add(add(mul(mul(X, X), dd[0]), mul(mul(num(2), mul(X, Y)), dd[1])), mul(mul(Y, Y), dd[2]));
      const ok2 = equalAt(S2, mul(num(n * (n - 1)), node), vars);
      steps.push({ title: 'Second partial derivatives', lines: [`u_{xx} = ${mtex(dd[0])}, \\quad u_{xy} = ${mtex(dd[1])}, \\quad u_{yy} = ${mtex(dd[2])}`] });
      steps.push({ title: "Euler's theorem (second order)", formula: `${secondLhsTex} = n(n-1)\\,u`, lines: [`${secondLhsTex} = ${nTex(n)}(${nTex(n)} - 1)\\,u = ${nU(n * (n - 1))}`] });
      results.push({ lhs: secondLhsTex, rhs: nU(n * (n - 1)), ok: ok2 });
    }
    notes.push('Every identity here is checked by putting numbers in for the letters.');
    return { n, nTex: nTex(n), nText: nText(n), composite: false, u: mtex(polish(node)), results, steps, notes, verified: results.every((r) => r.ok) };
  }

  // Composite case: F(u) = z
  const { z, inv } = composite;
  const F = math.parse(inv.F);
  const Fp = differentiate(F, 'u').result;
  // g(u) = n F(u)/F'(u), written the textbook way for the common cases
  const G = { asin: { tex: nU(n, '\\tan u'), node: `${n}*tan(u)` }, acos: { tex: nU(-n, '\\cot u'), node: `-${n}*cot(u)` }, atan: { tex: nU(n / 2, '\\sin 2u'), node: `${n}/2*sin(2*u)` }, log: { tex: nTex(n), node: `${n}` } }[unwrap(node).fn.name];
  const g = math.parse(G.node);
  const gAt = (scope) => g.evaluate({ u: node.evaluate(scope) });
  const check = (lhs, rhs) => PTS.every((p) => { const s = Object.fromEntries(vars.map((v, i) => [v, p[i]])); const a = lhs.evaluate(s), b = rhs(s); return !Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a)); });
  const ok1 = check(S1, gAt);
  steps.push({
    title: 'u itself is not homogeneous, but F(u) is', formula: `F(u) = z \\text{ homogeneous of degree } n \\Rightarrow ${lhsTex} = n\\frac{F(u)}{F'(u)}`,
    lines: [`${inv.name} = z = ${mtex(polish(z))}, \\quad z(${vars.map((v) => `t${v}`).join(', ')}) = t^{${nTex(n)}} z \\Rightarrow n = ${nTex(n)}`],
  });
  steps.push({ title: 'Apply Euler\'s theorem to z', lines: [`${lhsTex} = ${nTex(n)}\\,\\frac{${inv.name}}{${mtex(Fp)}} = ${G.tex}`] });
  const results = [{ lhs: lhsTex, rhs: G.tex, ok: ok1 }];
  if (second === 'yes' && vars.length === 2) {
    const gp = differentiate(g, 'u').result;
    const [X, Y] = V;
    const dd = [partial(d[0], 'x', vars).result, partial(d[0], 'y', vars).result, partial(d[1], 'y', vars).result];
    const S2 = add(add(mul(mul(X, X), dd[0]), mul(mul(num(2), mul(X, Y)), dd[1])), mul(mul(Y, Y), dd[2]));
    const rhs2 = (s) => { const uu = node.evaluate(s); return g.evaluate({ u: uu }) * (gp.evaluate({ u: uu }) - 1); };
    const ok2 = check(S2, rhs2);
    const rhsTex = unwrap(node).fn.name === 'log' ? nTex(-n) : `${G.tex}\\left(${mtex(gp)} - 1\\right)`;
    steps.push({ title: 'Second order', formula: `${secondLhsTex} = g(u)\\,[g'(u) - 1]`, lines: [`g(u) = ${G.tex}, \\quad g'(u) = ${mtex(gp)}`, `${secondLhsTex} = ${rhsTex}`] });
    results.push({ lhs: secondLhsTex, rhs: rhsTex, ok: ok2 });
  }
  notes.push('Every identity here is checked by putting numbers in for the letters.');
  return { n, nTex: nTex(n), nText: nText(n), composite: true, u: mtex(polish(node)), results, steps, notes, verified: results.every((r) => r.ok) };
}
