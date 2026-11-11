/**
 * Numeric extras for the 4F pages (F6).
 *   rng(seed)          a seeded random generator (mulberry32), so Monte Carlo pages give the same answer every time
 *   jacobiEigen(S)     eigenvalues and orthonormal eigenvectors of a symmetric matrix (cyclic Jacobi rotations)
 *   readMatrix(text)   rows of numbers (fractions allowed), separated by ; or new lines
 *   ieee(x, bits)      the IEEE-754 single (32) or double (64) layout: sign, exponent, mantissa, and the value stored
 */
import { EngineError } from './steps';

export function rng(seed = 12345) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function readMatrix(text, label = 'The matrix', max = 8) {
  const rows = String(text ?? '').replace(/[[\]]/g, ' ').trim().split(/[;\n]/).map((r) => r.trim()).filter(Boolean)
    .map((r, i) => r.split(/[\s,]+/).filter(Boolean).map((x) => {
      let v;
      try { v = x.includes('/') ? Number(x.split('/')[0]) / Number(x.split('/')[1]) : Number(x); } catch { v = NaN; }
      if (!Number.isFinite(v)) throw new EngineError(`${label}, row ${i + 1}: "${x}" is not a number.`);
      return v;
    }));
  if (!rows.length) throw new EngineError(`${label} is empty: type rows of numbers separated by ;`);
  if (rows.some((r) => r.length !== rows[0].length)) throw new EngineError(`${label}: every row needs the same number of entries.`);
  if (rows.length > max || rows[0].length > max) throw new EngineError(`${label}: up to ${max} × ${max} here.`);
  return rows;
}
export const readVector = (text, label) => {
  const v = String(text ?? '').replace(/[[\]()]/g, ' ').trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (!v.length || v.some((x) => !Number.isFinite(x))) throw new EngineError(`${label}: type numbers separated by commas.`);
  return v;
};

export const T = (A) => A[0].map((_, j) => A.map((r) => r[j]));
export const mul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
export const mv = (A, x) => A.map((r) => r.reduce((s, v, k) => s + v * x[k], 0));
export const dotv = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

/** Eigen-decomposition of a symmetric matrix: { values (descending), vectors (columns of V) } */
export function jacobiEigen(S0) {
  const n = S0.length;
  const S = S0.map((r) => [...r]);
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += S[i][j] ** 2;
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(S[p][q]) < 1e-300) continue;
      const th = (S[q][q] - S[p][p]) / (2 * S[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const a = S[k][p], b = S[k][q]; S[k][p] = c * a - s * b; S[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = S[p][k], b = S[q][k]; S[p][k] = c * a - s * b; S[q][k] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  const order = [...Array(n).keys()].sort((a, b) => S[b][b] - S[a][a]);
  return { values: order.map((i) => S[i][i]), vectors: order.map((i) => V.map((r) => r[i])) };
}

/** IEEE-754 layout of x. */
export function ieee(x, bits = 32) {
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  let str;
  if (bits === 32) { dv.setFloat32(0, x); str = dv.getUint32(0).toString(2).padStart(32, '0'); }
  else { dv.setFloat64(0, x); str = dv.getUint32(0).toString(2).padStart(32, '0') + dv.getUint32(4).toString(2).padStart(32, '0'); }
  const eb = bits === 32 ? 8 : 11, bias = bits === 32 ? 127 : 1023;
  const sign = str[0], exp = str.slice(1, 1 + eb), man = str.slice(1 + eb);
  const stored = bits === 32 ? dv.getFloat32(0) : dv.getFloat64(0);
  const hex = (bits === 32 ? [dv.getUint32(0)] : [dv.getUint32(0), dv.getUint32(4)]).map((w) => w.toString(16).toUpperCase().padStart(8, '0')).join('');
  return { sign, exp, man, bias, e: parseInt(exp, 2), stored, hex, str };
}
