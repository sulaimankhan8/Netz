/**
 * Monte Carlo integration: the maths for /monte-carlo-integration (Units 1–5).
 *   mean   ∫_a^b f dx ≈ (b − a)·(1/N)Σ f(xᵢ), xᵢ uniform on [a, b]; standard error (b − a)·s/√N
 *   hit    for f ≥ 0 under a box of height M: ∫ ≈ (b − a)M·(hits/N), a point (x, y) hits when y ≤ f(x)
 * The random numbers come from a fixed seed, so the same inputs always give the same estimate. The estimate is
 * compared with an accurate value of the integral, and a table shows the error shrinking like 1/√N.
 */
import { EngineError } from '../numeric/steps';
import { readMulti, exactTex } from '../symbolic/multi';
import { rng } from '../numeric/extras';
import { integrate1, onlyLetters, recognise, numberIn } from '../symbolic/vectorint';

const r6 = (v) => Number(v.toPrecision(6));

export function solve({ mode = 'mean', f, a = '0', b = '1', N = '1000', seed = '1' }) {
  const F = readMulti(f, 'f(x)');
  onlyLetters([F], ['x'], 'f(x)');
  const A = numberIn(a, 'a'), B = numberIn(b, 'b');
  if (!(B > A)) throw new EngineError('Make b bigger than a.');
  const n = Math.round(Number(N));
  if (!(n >= 10 && n <= 200000)) throw new EngineError('Use N from 10 to 200000 samples.');
  const sd = Math.round(Number(seed) || 1);
  const fc = F.compile();
  const fv = (x) => { try { const y = fc.evaluate({ x }); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };
  for (let k = 0; k <= 200; k++) if (!Number.isFinite(fv(A + ((B - A) * k) / 200))) throw new EngineError('f is not defined everywhere on [a, b].');
  const exact = integrate1(F, 'x', A, B, ['x']);
  const exactTexV = exact.exact ? recognise(exact.number) : `\\approx ${r6(exact.number)}`;
  let M = 0;
  if (mode === 'hit') {
    for (let k = 0; k <= 400; k++) { const y = fv(A + ((B - A) * k) / 400); if (y < -1e-12) throw new EngineError('Hit-or-miss needs f ≥ 0 on [a, b]; use the sample-mean method.'); M = Math.max(M, y); }
    M *= 1.05;
    if (!(M > 0)) throw new EngineError('f is 0 on the whole interval.');
  }
  const run = (count) => {
    const u = rng(sd);
    let s = 0, s2 = 0, hits = 0;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const x = A + (B - A) * u();
      if (mode === 'hit') { const y = M * u(); const hit = y <= fv(x); if (hit) hits++; if (pts.length < 300) pts.push({ x, y, hit }); }
      else { const y = fv(x); s += y; s2 += y * y; if (pts.length < 300) pts.push({ x, y }); }
    }
    if (mode === 'hit') { const p = hits / count; return { est: (B - A) * M * p, se: (B - A) * M * Math.sqrt((p * (1 - p)) / count), pts, hits }; }
    const mean = s / count, v = Math.max(0, s2 / count - mean * mean);
    return { est: (B - A) * mean, se: (B - A) * Math.sqrt(v / count), pts };
  };
  const main = run(n);
  const sizes = [...new Set([100, 1000, 10000, n].filter((k) => k <= Math.max(n, 10000)))].sort((p, q) => p - q);
  const rows = sizes.map((k) => { const r = k === n ? main : run(k); return { N: k, est: r6(r.est), se: r6(r.se), err: r6(Math.abs(r.est - exact.number)) }; });
  const steps = [
    { title: mode === 'hit' ? 'Hit or miss' : 'Sample mean', formula: mode === 'hit' ? '\\int_a^b f\\,dx \\approx (b - a)\\,M\\,\\frac{\\text{hits}}{N}' : '\\int_a^b f\\,dx \\approx \\frac{b - a}{N}\\sum_{i=1}^{N} f(x_i)', depth: 0, lines: [`N = ${n}, \\ \\text{seed} = ${sd}${mode === 'hit' ? `, \\ M = ${r6(M)}, \\ \\text{hits} = ${main.hits}` : ''}`, `\\text{estimate} = ${r6(main.est)} \\pm ${r6(main.se)} \\ (\\text{one standard error})`] },
    { title: 'Compare', depth: 0, lines: [`\\int_{${exactTex(A)}}^{${exactTex(B)}} f\\,dx = ${exactTexV}`, `\\text{error} = ${r6(Math.abs(main.est - exact.number))}`] },
  ];
  const plot = mode === 'hit' ? { points: main.pts.slice(0, 200).map((p) => ({ x: p.x, y: p.y, label: p.hit ? '' : '' })), fn: fv, view: { x0: A, x1: B, y0: 0, y1: M } } : { points: [], fn: fv, view: null };
  return { mode, estimate: r6(main.est), se: r6(main.se), exact: exactTexV, error: r6(Math.abs(main.est - exact.number)), table: { columns: [{ key: 'N', label: 'N', bold: true }, { key: 'est', label: 'Estimate', highlight: true }, { key: 'se', label: 'Standard error' }, { key: 'err', label: 'Actual error' }], rows }, plot, steps, notes: ['The error falls roughly like 1/√N: 100 times more samples for one more correct digit.'], verified: Math.abs(main.est - exact.number) < 6 * main.se + 1e-9, result: r6(main.est) };
}
