/**
 * Thomas algorithm for tridiagonal systems, with the working recorded.
 * Used by cubic splines, boundary value problems (finite differences) and the heat equation.
 *
 * The system, for i = 0 … n−1:   a[i]·x[i−1] + b[i]·x[i] + c[i]·x[i+1] = d[i]
 *   a = below-diagonal (a[0] is ignored), b = diagonal, c = above-diagonal (c[n−1] is ignored), d = right-hand side.
 */
import { EngineError, createRecord, isZero, clean, requireNumbers } from './steps';

export function thomas(a, b, c, d) {
  const n = b.length;
  if (!n) throw new EngineError('The system is empty.');
  if (a.length !== n || c.length !== n || d.length !== n) throw new EngineError('a, b, c and d need the same length.');
  requireNumbers([...a.slice(1), ...b, ...c.slice(0, -1), ...d], 'Every coefficient');

  const rec = createRecord(['i', 'aᵢ', 'bᵢ', 'cᵢ', 'dᵢ', "c′ᵢ", "d′ᵢ"]);
  const cp = new Array(n).fill(0);
  const dp = new Array(n).fill(0);

  // Forward sweep: remove the below-diagonal entries
  if (isZero(b[0])) throw new EngineError('The first diagonal entry is 0, so the Thomas method cannot start.');
  cp[0] = n > 1 ? c[0] / b[0] : 0;
  dp[0] = d[0] / b[0];
  rec.row(1, '—', b[0], n > 1 ? c[0] : '—', d[0], clean(cp[0]), clean(dp[0]));
  for (let i = 1; i < n; i++) {
    const m = b[i] - a[i] * cp[i - 1];
    if (isZero(m)) throw new EngineError(`A zero pivot appeared at row ${i + 1}, so the Thomas method cannot continue. Try Gauss elimination with pivoting.`);
    cp[i] = i < n - 1 ? c[i] / m : 0;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / m;
    rec.row(i + 1, a[i], b[i], i < n - 1 ? c[i] : '—', d[i], i < n - 1 ? clean(cp[i]) : '—', clean(dp[i]));
  }
  rec.note("Forward sweep: c′₁ = c₁/b₁, d′₁ = d₁/b₁; then c′ᵢ = cᵢ/(bᵢ − aᵢc′ᵢ₋₁) and d′ᵢ = (dᵢ − aᵢd′ᵢ₋₁)/(bᵢ − aᵢc′ᵢ₋₁).");

  // Back substitution
  const x = new Array(n).fill(0);
  x[n - 1] = dp[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
  rec.note("Back substitution: xₙ = d′ₙ, then xᵢ = d′ᵢ − c′ᵢxᵢ₊₁.");

  return rec.done(x.map(clean));
}
