/**
 * Difference equations by the Z-transform: the maths for /difference-equation-z-transform (Unit 13).
 *   Σ a_k y(n + k) = r(n), y(0) … y(K − 1) given.  Shift rule  Z{y(n + k)} = z^k Y − Σ_{j<k} y(j) z^{k−j}.
 *   So A(z)Y − B(z) = R(z), Y = (R + B)/A, then y(n) = Z⁻¹{Y} by partial fractions of Y/z.
 *   Equations written with y(n − 1), y(n − 2) are shifted up first (n → n + 2), so the conditions are y(0), y(1).
 *   The answer is checked against the recurrence run step by step from the conditions.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, add, mul, div, pow, paren, polish } from '../symbolic/tree';
import { mtex, exactTex, tidyMulti } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';
import { numNode } from '../symbolic/ode';
import { cText } from '../symbolic/complex';
import { readN, zTransform, inverseZ, tidyZ, fracTex } from '../symbolic/ztransform';

const Z = sym('z');
const YRE = /y\s*(?:\(\s*n\s*(?:([+-])\s*(\d+))?\s*\)|_\{?\s*n\s*(?:([+-])\s*(\d+))?\s*\}?)/g;
const evalAt = (node, scope) => { try { const v = node.evaluate(scope); return typeof v === 'number' ? v : NaN; } catch { return NaN; } };
const zp = (k) => (k === 0 ? num(1) : k === 1 ? Z : pow(Z, num(k)));

/** "y(n+2) - 3y(n+1) + 2y(n) = 2^n" → { a: [a0..aK], r (node in n), shift }. */
export function readDifference(text) {
  const raw = String(text ?? '').replace(/[−–]/g, '-').trim();
  const sides = raw.split('=');
  if (sides.length !== 2) throw new EngineError('Write it as  left side = right side, e.g. y(n+2) - 3y(n+1) + 2y(n) = 0.');
  const offsets = [];
  const mark = (s) => s.replace(YRE, (m, s1, d1, s2, d2) => { const sg = s1 || s2, d = Number(d1 || d2 || 0); const k = sg === '-' ? -d : d; offsets.push(k); return `(Y${k < 0 ? 'm' : ''}${Math.abs(k)})`; });
  const L = mark(sides[0]), R = mark(sides[1]);
  if (!offsets.length) throw new EngineError('Use y(n), y(n+1), y(n+2) … (or y_n, y_{n+1}) for the unknown sequence.');
  const lo = Math.min(...offsets), hi = Math.max(...offsets);
  const K = hi - lo;
  if (K < 1 || K > 4) throw new EngineError('Use an equation of order 1 to 4 (between y(n) and y(n+4)).');
  let node;
  try { node = math.parse(`(${L}) - (${R})`.replace(/(\d)\s*\(/g, '$1*(').replace(/\)\s*\(/g, ')*(').replace(/(\d)\s*([a-z])/gi, '$1*$2').replace(/\bn\s*\(/g, 'n*(')); } catch { throw new EngineError('The equation could not be read.'); }
  const names = [...new Set(offsets)].map((k) => [k, `Y${k < 0 ? 'm' : ''}${Math.abs(k)}`]);
  const zero = Object.fromEntries(names.map(([, s]) => [s, 0]));
  const a = Array(K + 1).fill(0);
  for (const [k, s] of names) {
    const c = [0, 1, 2.5, 4].map((n) => evalAt(node, { ...zero, [s]: 1, n, u: () => 1, delta: () => 0 }) - evalAt(node, { ...zero, n, u: () => 1, delta: () => 0 }));
    if (!c.every(Number.isFinite) || c.some((v) => Math.abs(v - c[0]) > 1e-9)) throw new EngineError('The numbers in front of y(n + k) must be constants.');
    a[k - lo] = c[0];
  }
  if (Math.abs(a[K]) < 1e-14 || Math.abs(a[0]) < 1e-14) throw new EngineError('Check the equation: the highest and lowest y terms need non-zero coefficients.');
  // r(n) = −(node with every Y = 0), shifted n → n − lo
  let r = node;
  for (const [, s] of names) r = substitute(r, s, num(0));
  r = mul(num(-1), paren(r));
  if (lo !== 0) r = substitute(r, 'n', add(sym('n'), num(-lo)));
  try { r = tidyMulti(r, ['n']); } catch { /* keep */ }
  r.traverse((m) => { if (m.isSymbolNode && !m.isFunctionNode && /^Y/.test(m.name)) throw new EngineError('The equation must be linear in y.'); });
  return { a, r, shift: -lo, K };
}

/** "y(0) = 0, y(1) = 1" → Map k → value. */
export function readConds(text) {
  const out = new Map();
  const re = /y\s*(?:\(\s*(-?\d+)\s*\)|_?\{?\s*(-?\d+)\s*\}?)\s*=\s*([^,;]+)/g;
  let m;
  while ((m = re.exec(String(text ?? '')))) {
    let v;
    try { v = math.evaluate(m[3].trim()); } catch { v = NaN; }
    if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`"${m[3].trim()}" is not a number.`);
    out.set(Number(m[1] ?? m[2]), v);
  }
  return out;
}

export function solve({ eq, ics = '' }) {
  const { a, r, shift, K } = readDifference(eq);
  const conds = readConds(ics);
  const y0 = [];
  for (let j = 0; j < K; j++) {
    if (!conds.has(j)) throw new EngineError(`Give y(0)${K > 1 ? ` … y(${K - 1})` : ''}: an order-${K} equation needs ${K} starting value${K > 1 ? 's' : ''}${shift ? ' (after shifting n up so the lowest term is y(n))' : ''}.`);
    y0.push(conds.get(j));
  }
  const steps = [];
  const yName = (k) => `y(n${k ? ` + ${k}` : ''})`;
  const lhsTex = a.map((c, k) => (Math.abs(c) < 1e-14 ? null : { c, k })).filter(Boolean).reverse()
    .map(({ c, k }, i) => `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : exactTex(Math.abs(c))}${yName(k)}`).join('');
  let rIsZero = [0, 1, 2, 3.5].every((n) => Math.abs(evalAt(r, { n, u: () => 1, delta: (k) => (k === 0 ? 1 : 0) })) < 1e-14);
  const rTex = rIsZero ? '0' : mtex(polish(r));
  steps.push({ title: shift ? `Shift n → n + ${shift}` : 'The equation', depth: 0, lines: [`${lhsTex} = ${rTex}`, y0.map((v, j) => `y(${j}) = ${exactTex(v)}`).join(', \\ ')] });
  // Transform each y(n + k)
  const shiftLines = [];
  for (let k = 1; k <= K; k++) {
    if (Math.abs(a[k]) < 1e-14) continue;
    const parts = [`${k === 1 ? 'z' : `z^{${k}}`}Y`];
    for (let j = 0; j < k; j++) parts.push(`${k - j === 1 ? 'z' : `z^{${k - j}}`}y(${j})`);
    shiftLines.push(`\\mathcal{Z}\\{${yName(k)}\\} = ${parts.join(' - ')}`);
  }
  steps.push({ title: 'Shift rule', formula: '\\mathcal{Z}\\{y(n + k)\\} = z^kY(z) - \\sum_{j=0}^{k-1} y(j)\\,z^{k-j}', depth: 0, lines: shiftLines });
  // A(z), B(z), R(z)
  let A = null, B = null;
  a.forEach((c, k) => {
    if (Math.abs(c) < 1e-14) return;
    const t = mul(numNode(c), zp(k));
    A = A ? add(A, t) : t;
    for (let j = 0; j < k; j++) {
      if (Math.abs(y0[j]) < 1e-14) continue;
      const bt = mul(numNode(c * y0[j]), zp(k - j));
      B = B ? add(B, bt) : bt;
    }
  });
  let R = num(0), rLines = [];
  if (!rIsZero) {
    const zt = zTransform(readN(r.toString(), 'The right side'));
    R = zt.F;
    rLines = [`\\mathcal{Z}\\{${rTex}\\} = ${zt.Ftex}`];
  }
  const Y = div(paren(add(R, B || num(0))), paren(A));
  const Yt = tidyZ(Y);
  if (!Yt.netzP) throw new EngineError('The right side must have a Z-transform that is a fraction of polynomials (like 2^n, n, cos(n pi/2)).');
  steps.push({ title: 'Solve for Y(z)', depth: 0, lines: [...rLines, `(${mtex(polish(A))})\\,Y ${B ? `- (${mtex(polish(B))})` : ''} = ${rIsZero ? '0' : 'R(z)'}`.replace('Y - ', 'Y - '), `Y(z) = ${fracTex(Yt)}`] });
  const inv = inverseZ(Yt);
  steps.push({ title: 'Invert (partial fractions of Y/z)', formula: '\\frac{z}{z - p} \\leftrightarrow p^n', depth: 0, lines: [...inv.lines, `y(n) = ${inv.xTex}`] });
  // check: run the recurrence
  const rv = (n) => evalAt(r, { n, u: () => 1, delta: (k) => (Math.abs(k) < 1e-12 ? 1 : 0) });
  const seq = [...y0];
  for (let n = 0; seq.length < 12; n++) { let s = rv(n); for (let k = 0; k < K; k++) s -= a[k] * seq[n + k]; seq.push(s / a[K]); }
  const verified = seq.every((v, n) => { const w = inv.at(n); return Math.abs(w.im) < 1e-6 * Math.max(1, Math.abs(v)) && Math.abs(w.re - v) < 1e-6 * Math.max(1, Math.abs(v)); });
  const table = { columns: [{ key: 'n', label: 'n', bold: true }, { key: 'rec', label: 'y(n) from the recurrence' }, { key: 'f', label: 'y(n) from the formula', highlight: true }], rows: seq.slice(0, 8).map((v, n) => ({ n, rec: String(Number(v.toPrecision(8))), f: cText(inv.at(n)) })) };
  return { yTex: inv.xTex, Ytex: fracTex(Yt), steps, table, notes: shift ? [`The equation was shifted by ${shift}, so y(0) is the first value used.`] : [], verified, result: inv.xTex };
}
