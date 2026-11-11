/**
 * Bilinear (Möbius) transformations: the maths for /bilinear-transformation (Unit 14).
 *   three:  the map w = (az + b)/(cz + d) sending z₁, z₂, z₃ to w₁, w₂, w₃ (∞ allowed), from the cross-ratio
 *           (w − w₁)(w₂ − w₃)/((w − w₃)(w₂ − w₁)) = (z − z₁)(z₂ − z₃)/((z − z₃)(z₂ − z₁)),
 *           worked with 2×2 matrices: T(z) for the z side, S(w) for the w side, the map is S⁻¹T.
 *   map:    a given w = (az + b)/(cz + d): ad − bc ≠ 0, fixed points cz² + (d − a)z − b = 0, the inverse, and
 *           the images of points.
 * Every answer is checked by mapping the points.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { C, cTex, snapC } from '../symbolic/complex';

const INF = 'inf';
const absC = (c) => Math.hypot(c.re, c.im);
const readPoint = (s, label) => {
  const t = String(s ?? '').trim();
  if (!t) throw new EngineError(`${label} is empty.`);
  if (/^(inf|∞|infinity)$/i.test(t)) return INF;
  let v;
  try { v = math.evaluate(t.replace(/\bj\b/g, 'i').replace(/π/g, 'pi').replace(/(\d)\s*i\b/g, '$1*i')); } catch { throw new EngineError(`${label}: "${t}" is not a number (write it like 1, -i, 2 + 3i or inf).`); }
  return typeof v === 'number' ? C(v) : C(v.re, v.im);
};
const sub = (a, b) => math.subtract(a, b), mul = (a, b) => math.multiply(a, b), add = (a, b) => math.add(a, b), dv = (a, b) => math.divide(a, b);
const pTex = (p) => (p === INF ? '\\infty' : cTex(p));

/** Matrix of z ↦ (z − p)(q − r)/((z − r)(q − p)) as [[α, β], [γ, δ]] (rows), with ∞ handled. */
function crossMatrix(p, q, r) {
  const one = C(1), zero = C(0);
  if (p === INF) return [[zero, sub(q, r)], [one, mul(C(-1), r)]];        // (q − r)/(z − r)
  if (q === INF) return [[one, mul(C(-1), p)], [one, mul(C(-1), r)]];     // (z − p)/(z − r)
  if (r === INF) return [[one, mul(C(-1), p)], [zero, sub(q, p)]];        // (z − p)/(q − p)
  return [[sub(q, r), mul(C(-1), mul(p, sub(q, r)))], [sub(q, p), mul(C(-1), mul(r, sub(q, p)))]];
}
const mm = (A, B) => [[add(mul(A[0][0], B[0][0]), mul(A[0][1], B[1][0])), add(mul(A[0][0], B[0][1]), mul(A[0][1], B[1][1]))], [add(mul(A[1][0], B[0][0]), mul(A[1][1], B[1][0])), add(mul(A[1][0], B[0][1]), mul(A[1][1], B[1][1]))]];
const inv = (A) => [[A[1][1], mul(C(-1), A[0][1])], [mul(C(-1), A[1][0]), A[0][0]]];
/** Scale a, b, c, d so the first non-zero of c, d, a … is 1 (and the others come out simple). */
function normal(M) {
  const flat = [M[1][0], M[1][1], M[0][0], M[0][1]];
  const pivot = flat.find((x) => absC(x) > 1e-12);
  return M.map((row) => row.map((x) => snapC(dv(x, pivot))));
}
/** w = (az + b)/(cz + d) as LaTeX. */
function mapTex([[a, b], [c, d]]) {
  const lin = (p, q) => {
    const pz = absC(p) < 1e-12 ? '' : `${coef(p)}z`;
    const qt = absC(q) < 1e-12 ? '' : cTex(q);
    if (!pz) return qt || '0';
    if (!qt) return pz;
    return `${pz} ${qt.startsWith('-') && !/[+-]/.test(qt.slice(1)) ? `- ${qt.slice(1)}` : `+ ${/[+-]/.test(qt.slice(1)) ? `(${qt})` : qt}`}`;
  };
  const top = lin(a, b), bottom = lin(c, d);
  return bottom === '1' ? `w = ${top}` : `w = \\frac{${top}}{${bottom}}`;
}
const coef = (c) => { const t = cTex(c); return t === '1' ? '' : t === '-1' ? '-' : /[+-]/.test(t.slice(1)) ? `(${t})` : t; };
/** Apply the map to a point (∞ aware). */
function apply([[a, b], [c, d]], z) {
  if (z === INF) return absC(c) < 1e-12 ? INF : snapC(dv(a, c));
  const den = add(mul(c, z), d);
  if (absC(den) < 1e-12) return INF;
  return snapC(dv(add(mul(a, z), b), den));
}
const same = (p, q) => (p === INF || q === INF ? p === q : absC(sub(p, q)) < 1e-7 * Math.max(1, absC(q)));

export function solve({ mode = 'three', z1 = '', z2 = '', z3 = '', w1 = '', w2 = '', w3 = '', a = '1', b = '0', c = '0', d = '1', points = '' }) {
  const steps = [];
  let M;
  if (mode === 'three') {
    const Z = [readPoint(z1, 'z₁'), readPoint(z2, 'z₂'), readPoint(z3, 'z₃')], W = [readPoint(w1, 'w₁'), readPoint(w2, 'w₂'), readPoint(w3, 'w₃')];
    const distinct = (L) => L.every((p, i) => L.every((q, j) => i === j || !same(p, q)));
    if (!distinct(Z) || !distinct(W)) throw new EngineError('The three z points must be different, and so must the three w points.');
    steps.push({ title: 'The cross-ratio is unchanged', formula: '\\frac{(w - w_1)(w_2 - w_3)}{(w - w_3)(w_2 - w_1)} = \\frac{(z - z_1)(z_2 - z_3)}{(z - z_3)(z_2 - z_1)}', depth: 0, lines: [`z: ${Z.map(pTex).join(', ')} \\ \\mapsto \\ w: ${W.map(pTex).join(', ')}`, '\\text{(a factor with } \\infty \\text{ is left out)}'] });
    const T = crossMatrix(...Z), S = crossMatrix(...W);
    M = normal(mm(inv(S), T));
    steps.push({ title: 'Solve for w', depth: 0, lines: [mapTex(M)] });
  } else {
    const rd = (s, l) => { const p = readPoint(s, l); if (p === INF) throw new EngineError(`${l} must be a number.`); return p; };
    M = [[rd(a, 'a'), rd(b, 'b')], [rd(c, 'c'), rd(d, 'd')]];
    const det = sub(mul(M[0][0], M[1][1]), mul(M[0][1], M[1][0]));
    if (absC(det) < 1e-12) throw new EngineError('ad − bc = 0, so this is a constant map, not a bilinear transformation.');
    steps.push({ title: 'The map', formula: 'ad - bc \\ne 0', depth: 0, lines: [mapTex(M), `ad - bc = ${cTex(snapC(det))} \\ne 0`] });
    steps.push({ title: 'Inverse', formula: 'z = \\frac{dw - b}{-cw + a}', depth: 0, lines: [mapTex(normal(inv(M))).replace(/^w = /, 'z = ').replace(/z/g, 'W').replace(/^W = /, 'z = ').replace(/W/g, 'w')] });
  }
  const [[A, B], [Cc, D]] = M;
  // fixed points: cz² + (d − a)z − b = 0
  let fixed;
  if (absC(Cc) < 1e-12) {
    fixed = absC(sub(D, A)) < 1e-12 ? (absC(B) < 1e-12 ? 'every point' : ['\\infty']) : [cTex(snapC(dv(B, sub(D, A))))].concat(['\\infty']);
  } else {
    const p = sub(D, A), disc = add(mul(p, p), mul(C(4), mul(Cc, B)));
    const sq = math.sqrt(disc);
    const r1 = snapC(dv(add(mul(C(-1), p), sq), mul(C(2), Cc))), r2 = snapC(dv(sub(mul(C(-1), p), sq), mul(C(2), Cc)));
    fixed = same(r1, r2) ? [cTex(r1)] : [cTex(r1), cTex(r2)];
  }
  steps.push({ title: 'Fixed points', formula: 'z = \\frac{az + b}{cz + d} \\iff cz^2 + (d - a)z - b = 0', depth: 0, lines: [Array.isArray(fixed) ? `z = ${fixed.join(', \\ ')}` : '\\text{every point is fixed (the identity)}'] });
  // images of extra points
  const extra = String(points).split(/[;,]/).map((s) => s.trim()).filter(Boolean).slice(0, 6).map((s) => readPoint(s, 'A point'));
  const images = extra.map((z) => ({ z: pTex(z), w: pTex(apply(M, z)) }));
  if (images.length) steps.push({ title: 'Images', depth: 0, lines: images.map((p) => `${p.z} \\mapsto ${p.w}`) });
  // check
  let ok = true;
  if (mode === 'three') {
    const Z = [z1, z2, z3].map((s, i) => readPoint(s, `z${i + 1}`)), W = [w1, w2, w3].map((s, i) => readPoint(s, `w${i + 1}`));
    ok = Z.every((z, i) => same(apply(M, z), W[i]));
    steps.push({ title: 'Check', depth: 1, lines: Z.map((z, i) => `${pTex(z)} \\mapsto ${pTex(apply(M, z))} ${ok ? '\\checkmark' : ''}`) });
  }
  return { map: mapTex(M), fixed: Array.isArray(fixed) ? fixed : [fixed], images, steps, notes: ['A bilinear map sends circles and lines to circles and lines, and keeps angles (it is conformal wherever cz + d ≠ 0).'], verified: ok, result: mapTex(M) };
}
