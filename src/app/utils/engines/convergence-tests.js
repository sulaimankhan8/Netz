/**
 * Convergence of Σ aₙ: the maths for /convergence-tests (src/app/utils/symbolic/series.js does the work).
 * Tries the nth-term, geometric, p-series, ratio, root, limit-comparison and alternating-series tests in turn
 * and stops at the first that decides. Partial sums are shown for a feel of the value.
 */
import { EngineError } from '../numeric/steps';
import { polish } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readTerm, testSeries, partialSums } from '../symbolic/series';

export function solve({ a, n0 = '1' }) {
  const node = readTerm(a, 'aₙ');
  const start = Number(String(n0).trim() || 1);
  if (!Number.isInteger(start) || start < 0 || start > 100) throw new EngineError('Start the sum at a whole number n₀ between 0 and 100.');
  const r = testSeries(node, start);
  const steps = r.tests.map((t) => ({ title: `${t.name}: ${t.result}`, lines: t.lines, depth: 0 }));
  const sums = r.verdict.startsWith('converges') ? partialSums(node, start) : [];
  const notes = [];
  if (r.verdict === 'inconclusive') notes.push('None of the standard tests decided this series. Try the integral test or a direct comparison by hand.');
  if (r.tests.some((t) => t.lines.some((l) => l.includes('numerically')))) notes.push('Limits marked "numerically" were estimated from very large n (with 60-digit arithmetic), not found by algebra.');
  return {
    series: `\\sum_{n=${start}}^{\\infty} ${mtex(polish(node))}`, verdict: r.verdict, by: r.by, sum: r.sum || null, sums,
    steps, notes, verified: true,
  };
}
