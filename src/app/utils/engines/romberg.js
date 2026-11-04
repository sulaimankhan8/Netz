/**
 * Romberg integration: the maths for /romberg-integration.
 *   R(i, 0) = trapezoidal rule with 2ⁱ strips
 *   R(i, j) = R(i, j − 1) + [R(i, j − 1) − R(i − 1, j − 1)] / (4ʲ − 1)   (Richardson extrapolation)
 * The bottom-right entry R(k, k) is the answer; the change from R(k − 1, k − 1) estimates its error.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readFunction, readConstant, readWhole } from './input';

export function solve({ f: tf, a: ta, b: tb, levels: tl = '4' }) {
  const f = readFunction(tf, ['x'], 'f(x)');
  const a = readConstant(ta, 'Lower limit a');
  const b = readConstant(tb, 'Upper limit b');
  if (a === b) throw new EngineError('The limits are equal, so the integral is 0.');
  const k = readWhole(tl, 'Number of levels', 1, 10);

  const R = [];
  const trapLines = [];
  for (let i = 0; i <= k; i++) {
    const strips = 2 ** i;
    const h = (b - a) / strips;
    let t;
    if (i === 0) {
      t = (h / 2) * (f(a) + f(b));
    } else {
      // Reuse the previous level: only the new midpoints are added
      let mid = 0;
      for (let s = 1; s < strips; s += 2) mid += f(a + s * h);
      t = R[i - 1][0] / 2 + h * mid;
    }
    if (!Number.isFinite(t)) throw new EngineError('f(x) is not finite somewhere between the limits, so the integral can\'t be estimated this way.');
    R.push([t]);
    trapLines.push(`R(${i}, 0) = T_{${strips}} \\ (h = ${n(h)}) = ${n(t, 10)}`);
    for (let j = 1; j <= i; j++) {
      R[i].push(R[i][j - 1] + (R[i][j - 1] - R[i - 1][j - 1]) / (4 ** j - 1));
    }
  }
  const best = R[k][k];
  const error = k > 0 ? Math.abs(best - R[k - 1][k - 1]) : null;
  return {
    f: tf, a, b, k, R, best, error,
    lines: [
      ...trapLines,
      `R(i, j) = R(i, j - 1) + \\frac{R(i, j - 1) - R(i - 1, j - 1)}{4^j - 1}`,
      ...(k > 0 ? [`R(1, 1) = ${n(R[1][0], 10)} + \\frac{${n(R[1][0], 10)} - ${n(R[0][0], 10)}}{3} = ${n(R[1][1], 10)}`] : []),
      `\\int_{${n(a)}}^{${n(b)}} f(x)\\,dx \\approx R(${k}, ${k}) = ${n(best, 10)}`,
    ],
    result: best, steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
