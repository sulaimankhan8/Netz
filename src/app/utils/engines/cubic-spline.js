/**
 * Cubic spline interpolation: the maths for /cubic-spline. Works for unequal spacing.
 * Unknowns are the second derivatives Mᵢ = S″(xᵢ). Each interior point gives
 *   hᵢ₋₁Mᵢ₋₁ + 2(hᵢ₋₁ + hᵢ)Mᵢ + hᵢMᵢ₊₁ = 6[(yᵢ₊₁ − yᵢ)/hᵢ − (yᵢ − yᵢ₋₁)/hᵢ₋₁]
 *   natural: M₀ = Mₙ = 0      clamped: S′(x₀) = s₀ and S′(xₙ) = sₙ are given
 * The system is tridiagonal, so it is solved by the Thomas algorithm (utils/numeric/tridiagonal.js).
 */
import { EngineError } from '../numeric/steps';
import { thomas } from '../numeric/tridiagonal';
import { n } from '../numeric/geometry';
import { readList, readNumber } from './input';

export function solve({ x: tx, y: ty, at = '', type = 'natural', s0 = '', sn = '' }) {
  const x = readList(tx, 'x values', 2);
  const y = readList(ty, 'y values', 2);
  if (x.length !== y.length) throw new EngineError(`x has ${x.length} values but y has ${y.length}. They need the same number.`);
  if (x.length > 40) throw new EngineError('Use 40 points or fewer.');
  for (let i = 1; i < x.length; i++) if (!(x[i] > x[i - 1])) throw new EngineError('The x values must be in increasing order, with no repeats.');
  const N = x.length - 1; // number of intervals
  const h = x.slice(1).map((v, i) => v - x[i]);
  const slope = h.map((hi, i) => (y[i + 1] - y[i]) / hi);

  let M;
  let system;
  if (type === 'clamped') {
    const a0 = readNumber(s0, "Slope at the start S′(x₀)");
    const an = readNumber(sn, "Slope at the end S′(xₙ)");
    const A = [], B = [], C = [], D = [];
    A.push(0); B.push(2 * h[0]); C.push(h[0]); D.push(6 * (slope[0] - a0));
    for (let i = 1; i < N; i++) { A.push(h[i - 1]); B.push(2 * (h[i - 1] + h[i])); C.push(h[i]); D.push(6 * (slope[i] - slope[i - 1])); }
    A.push(h[N - 1]); B.push(2 * h[N - 1]); C.push(0); D.push(6 * (an - slope[N - 1]));
    M = thomas(A, B, C, D).result;
    system = { A, B, C, D, offset: 0 };
  } else if (N === 1) {
    M = [0, 0]; // two points: the natural spline is the straight line
    system = null;
  } else {
    const A = [], B = [], C = [], D = [];
    for (let i = 1; i < N; i++) { A.push(h[i - 1]); B.push(2 * (h[i - 1] + h[i])); C.push(h[i]); D.push(6 * (slope[i] - slope[i - 1])); }
    M = [0, ...thomas(A, B, C, D).result, 0];
    system = { A, B, C, D, offset: 1 };
  }

  // Each piece as Sᵢ(x) = aᵢ + bᵢ(x − xᵢ) + cᵢ(x − xᵢ)² + dᵢ(x − xᵢ)³
  const pieces = h.map((hi, i) => ({
    from: x[i], to: x[i + 1],
    a: y[i], b: slope[i] - (hi * (2 * M[i] + M[i + 1])) / 6, c: M[i] / 2, d: (M[i + 1] - M[i]) / (6 * hi),
  }));
  const evaluate = (X) => {
    let i = pieces.findIndex((p) => X <= p.to);
    if (i < 0) i = pieces.length - 1;
    const p = pieces[i];
    const t = X - p.from;
    return p.a + t * (p.b + t * (p.c + t * p.d));
  };

  let value = null, piece = null;
  if (String(at ?? '').trim()) {
    const X = readNumber(at, 'The x to interpolate at');
    if (X < x[0] || X > x[N]) throw new EngineError(`${n(X)} is outside the data (${n(x[0])} to ${n(x[N])}). A spline only interpolates inside it.`);
    value = evaluate(X);
    piece = pieces.findIndex((p) => X <= p.to);
    piece = { index: piece, X };
  }

  const lines = [];
  if (system) {
    const names = (i) => `M_{${i}}`;
    for (let r = 0; r < system.B.length; r++) {
      const i = r + system.offset;
      const parts = [];
      if (system.A[r] && i > 0) parts.push(`${n(system.A[r])}${names(i - 1)}`);
      parts.push(`${n(system.B[r])}${names(i)}`);
      if (system.C[r] && i < N) parts.push(`${n(system.C[r])}${names(i + 1)}`);
      lines.push(`${parts.join(' + ')} = ${n(system.D[r])}`);
    }
  }
  return {
    type, x, y, h, M, pieces, value, piece, evaluate, lines,
    result: value, steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
