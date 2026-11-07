/**
 * Confidence intervals: the maths for /confidence-interval (Unit 5, estimation).
 *   mean, σ known:     x̄ ± z·σ/√n
 *   mean, σ unknown:   x̄ ± t_{n−1}·s/√n          (t from the t distribution, two-tailed)
 *   proportion:        p̂ ± z·√(p̂(1 − p̂)/n)
 * z = Φ⁻¹(1 − α/2): 1.645 (90%), 1.96 (95%), 2.576 (99%).
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { normalInverse } from '../numeric/distributions';
import { tCritical } from '../criticalValues';

const r4 = (v) => Number(v.toFixed(4));

export function solve({ mode = 'z', xbar = '', sd = '', n, level = '95', x = '' }) {
  const N = Math.round(readConstant(n, 'n'));
  if (!(N >= 2)) throw new EngineError('n must be at least 2.');
  const C = readConstant(level, 'The confidence level');
  if (!(C > 0 && C < 100)) throw new EngineError('The confidence level is a percentage between 0 and 100.');
  const alpha = 1 - C / 100;
  const steps = [];
  let centre, margin, crit, critName, se, seLine;
  if (mode === 'proportion') {
    const successes = readConstant(x, 'The number of successes');
    if (!(successes >= 0 && successes <= N)) throw new EngineError('The number of successes must be between 0 and n.');
    const ph = successes / N;
    centre = ph; crit = normalInverse(1 - alpha / 2); critName = 'z';
    se = Math.sqrt((ph * (1 - ph)) / N);
    seLine = `\\hat p = \\frac{${successes}}{${N}} = ${r4(ph)}, \\quad SE = \\sqrt{\\frac{\\hat p(1 - \\hat p)}{n}} = ${r4(se)}`;
    if (N * ph < 5 || N * (1 - ph) < 5) steps.push({ title: 'Warning', depth: 0, lines: ['n\\hat p \\text{ or } n(1 - \\hat p) < 5: \\text{ the normal approximation is rough here}'] });
  } else {
    centre = readConstant(xbar, 'x̄');
    const s = readConstant(sd, mode === 'z' ? 'σ' : 's');
    if (!(s > 0)) throw new EngineError('The standard deviation must be positive.');
    se = s / Math.sqrt(N);
    if (mode === 'z') { crit = normalInverse(1 - alpha / 2); critName = 'z'; }
    else { crit = tCritical(N - 1, alpha); critName = `t_{${N - 1}}`; }
    seLine = `SE = \\frac{${mode === 'z' ? '\\sigma' : 's'}}{\\sqrt{n}} = \\frac{${s}}{\\sqrt{${N}}} = ${r4(se)}`;
  }
  margin = crit * se;
  const lo = centre - margin, hi = centre + margin;
  steps.unshift({ title: 'Standard error', depth: 0, lines: [seLine] });
  steps.push({ title: 'Critical value', formula: mode === 't' ? 't_{\\alpha/2,\\,n-1}' : 'z_{\\alpha/2} = \\Phi^{-1}(1 - \\alpha/2)', depth: 0, lines: [`${C}\\% \\Rightarrow \\alpha = ${r4(alpha)}, \\quad ${critName} = ${r4(crit)}`] });
  steps.push({ title: 'The interval', formula: '\\text{estimate} \\pm (\\text{critical value})(SE)', depth: 0, lines: [`${r4(centre)} \\pm ${r4(crit)} \\times ${r4(se)} = ${r4(centre)} \\pm ${r4(margin)}`, `(${r4(lo)}, \\ ${r4(hi)})`] });
  return {
    interval: `(${r4(lo)}, ${r4(hi)})`, centre: r4(centre), margin: r4(margin), crit: r4(crit), critName, level: C, steps,
    notes: [`We are ${C}% confident the true ${mode === 'proportion' ? 'proportion' : 'mean'} lies in this interval: if we repeated the sampling many times, about ${C}% of such intervals would contain it.`], verified: true,
  };
}
