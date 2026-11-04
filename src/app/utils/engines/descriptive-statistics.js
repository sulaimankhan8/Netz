/**
 * Descriptive statistics for raw data, a discrete frequency table, or grouped (class interval) data:
 * mean, median, mode, quartiles, range, variance and standard deviation (population and sample),
 * coefficient of variation, Karl Pearson's skewness, and moment measures (β₁, γ₁, β₂, γ₂).
 * Grouped data use the textbook formulas: median = L + (N/2 − cf)/f · h, mode = L + (f₁ − f₀)/(2f₁ − f₀ − f₂) · h.
 */
import { EngineError } from '../numeric/steps';
import { readList } from './input';
import { sum } from '../numeric/distributions';

const n4 = (v) => String(Number(Number(v).toFixed(4)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));

/** "0-10, 10-20" → [[0, 10], [10, 20]]. */
function readClasses(text) {
  const parts = String(text ?? '').split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) throw new EngineError('Enter at least two classes, like 0-10, 10-20, 20-30.');
  return parts.map((p, i) => {
    const m = p.match(/^(-?\d*\.?\d+)\s*(?:-|–|to)\s*(-?\d*\.?\d+)$/);
    if (!m) throw new EngineError(`Class ${i + 1}, "${p}", should look like 10-20.`);
    const [lo, hi] = [Number(m[1]), Number(m[2])];
    if (!(hi > lo)) throw new EngineError(`Class ${i + 1}: the upper limit must be bigger than the lower one.`);
    return [lo, hi];
  });
}

export function solve({ mode = 'raw', data = '', x: tx = '', f: tf = '', classes = '' }) {
  if (!['raw', 'discrete', 'grouped'].includes(mode)) throw new EngineError('Choose raw data, a frequency table or grouped data.');
  let xs, fs, bounds = null;
  if (mode === 'raw') {
    xs = readList(data, 'The data', 2);
    fs = xs.map(() => 1);
  } else {
    fs = readList(tf, 'The frequencies', 2);
    if (fs.some((v) => v < 0 || !Number.isFinite(v))) throw new EngineError('Frequencies cannot be negative.');
    if (mode === 'discrete') {
      xs = readList(tx, 'The values x', 2);
    } else {
      bounds = readClasses(classes);
      xs = bounds.map(([lo, hi]) => (lo + hi) / 2);
    }
    if (xs.length !== fs.length) throw new EngineError(`There are ${xs.length} ${mode === 'grouped' ? 'classes' : 'values'} but ${fs.length} frequencies.`);
  }
  const N = sum(fs);
  if (!(N > 0)) throw new EngineError('The frequencies add up to 0.');
  const steps = [];

  // Mean and moments (raw data are a frequency table with every f = 1)
  const mean = sum(xs.map((x, i) => fs[i] * x)) / N;
  const m = (k) => sum(xs.map((x, i) => fs[i] * (x - mean) ** k)) / N;
  const m2 = m(2), m3 = m(3), m4 = m(4);
  const sd = Math.sqrt(m2), sampleVar = N > 1 ? (m2 * N) / (N - 1) : NaN;
  const X = mode === 'grouped' ? 'm' : 'x';
  steps.push({
    title: 'Mean',
    formula: mode === 'raw' ? '\\bar x = \\frac{\\sum x}{n}' : `\\bar x = \\frac{\\sum f${X}}{N}`,
    lines: [`\\bar x = \\frac{${n6(sum(xs.map((x, i) => fs[i] * x)))}}{${n6(N)}} = ${n6(mean)}`],
  });

  // Median, quartiles and mode
  let median, q1, q3, modes, modeValue = null;
  if (mode === 'grouped') {
    const cf = []; fs.reduce((acc, v, i) => (cf[i] = acc + v), 0);
    const h = (i) => bounds[i][1] - bounds[i][0];
    const at = (pos) => {
      const i = cf.findIndex((c) => c >= pos);
      const before = i > 0 ? cf[i - 1] : 0;
      return { i, value: bounds[i][0] + ((pos - before) / fs[i]) * h(i), before };
    };
    const md = at(N / 2);
    median = md.value;
    q1 = at(N / 4).value; q3 = at((3 * N) / 4).value;
    steps.push({
      title: 'Median (grouped data)',
      formula: '\\text{Median} = L + \\frac{\\frac{N}{2} - cf}{f} \\times h',
      lines: [`\\frac{N}{2} = ${n6(N / 2)} \\Rightarrow \\text{median class } ${bounds[md.i][0]}\\text{–}${bounds[md.i][1]}`, `= ${bounds[md.i][0]} + \\frac{${n6(N / 2)} - ${n6(md.before)}}{${n6(fs[md.i])}} \\times ${n6(h(md.i))} = ${n6(median)}`],
    });
    const k = fs.indexOf(Math.max(...fs));
    const f0 = k > 0 ? fs[k - 1] : 0, f1 = fs[k], f2 = k < fs.length - 1 ? fs[k + 1] : 0;
    const den = 2 * f1 - f0 - f2;
    modeValue = den === 0 ? (bounds[k][0] + bounds[k][1]) / 2 : bounds[k][0] + ((f1 - f0) / den) * h(k);
    modes = [modeValue];
    steps.push({
      title: 'Mode (grouped data)',
      formula: '\\text{Mode} = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h',
      lines: [`\\text{Modal class } ${bounds[k][0]}\\text{–}${bounds[k][1]} \\ (f_1 = ${n6(f1)}, \\ f_0 = ${n6(f0)}, \\ f_2 = ${n6(f2)})`, `= ${bounds[k][0]} + \\frac{${n6(f1 - f0)}}{${n6(den)}} \\times ${n6(h(k))} = ${n6(modeValue)}`],
    });
  } else {
    // Sorted list of observations (frequencies expand the values)
    const pairs = xs.map((x, i) => [x, fs[i]]).sort((a, b) => a[0] - b[0]);
    const valueAt = (pos) => { // 1-based position, may be fractional: interpolate between neighbours
      const k = Math.floor(pos), frac = pos - k;
      const nth = (j) => { let c = 0; for (const [x, f] of pairs) { c += f; if (c >= j) return x; } return pairs.at(-1)[0]; };
      return frac === 0 ? nth(Math.max(1, k)) : nth(k) + frac * (nth(k + 1) - nth(k));
    };
    median = valueAt((N + 1) / 2);
    q1 = valueAt((N + 1) / 4); q3 = valueAt((3 * (N + 1)) / 4);
    steps.push({ title: 'Median', formula: '\\text{the } \\left(\\frac{N + 1}{2}\\right)^{\\text{th}} \\text{ value in order}', lines: [`\\frac{${n6(N)} + 1}{2} = ${n6((N + 1) / 2)}^{\\text{th}} \\text{ value} = ${n6(median)}`] });
    // Mode: the most frequent value(s)
    const freq = new Map();
    pairs.forEach(([x, f]) => freq.set(x, (freq.get(x) || 0) + f));
    const top = Math.max(...freq.values());
    modes = top > 1 || mode === 'discrete' ? [...freq.entries()].filter(([, f]) => f === top).map(([x]) => x) : [];
    if (mode === 'raw' && modes.length === freq.size) modes = [];
    modeValue = modes.length === 1 ? modes[0] : null;
    steps.push({ title: 'Mode', lines: [modes.length ? `\\text{Most frequent: } ${modes.map(n6).join(', ')} \\ (${top} \\text{ times})` : '\\text{No value repeats more than the others: no mode}'] });
  }

  steps.push({
    title: 'Variance and standard deviation',
    formula: '\\sigma^2 = \\frac{\\sum f(x - \\bar x)^2}{N}, \\quad s^2 = \\frac{\\sum f(x - \\bar x)^2}{N - 1}',
    lines: [`\\sigma^2 = \\frac{${n6(m2 * N)}}{${n6(N)}} = ${n6(m2)}, \\quad \\sigma = ${n6(sd)}`, `\\text{Sample: } s^2 = \\frac{${n6(m2 * N)}}{${n6(N - 1)}} = ${n6(sampleVar)}, \\quad s = ${n6(Math.sqrt(sampleVar))}`],
  });

  const skewPearson = sd > 0 ? (3 * (mean - median)) / sd : 0;
  const beta1 = m2 > 0 ? (m3 * m3) / (m2 ** 3) : 0, gamma1 = m2 > 0 ? m3 / m2 ** 1.5 : 0;
  const beta2 = m2 > 0 ? m4 / (m2 * m2) : 0, gamma2 = beta2 - 3;
  steps.push({
    title: 'Skewness and kurtosis',
    formula: 'S_k = \\frac{3(\\bar x - \\text{median})}{\\sigma}, \\ \\beta_1 = \\frac{\\mu_3^2}{\\mu_2^3}, \\ \\beta_2 = \\frac{\\mu_4}{\\mu_2^2}',
    lines: [
      `S_k = \\frac{3(${n6(mean)} - ${n6(median)})}{${n6(sd)}} = ${n4(skewPearson)}`,
      `\\mu_2 = ${n6(m2)}, \\ \\mu_3 = ${n6(m3)}, \\ \\mu_4 = ${n6(m4)}`,
      `\\beta_1 = ${n4(beta1)}, \\ \\gamma_1 = ${n4(gamma1)}, \\quad \\beta_2 = ${n4(beta2)}, \\ \\gamma_2 = \\beta_2 - 3 = ${n4(gamma2)}`,
      `${Math.abs(gamma1) < 0.05 ? '\\text{About symmetric}' : gamma1 > 0 ? '\\text{Positively skewed (long right tail)}' : '\\text{Negatively skewed (long left tail)}'}; \\ ${Math.abs(gamma2) < 0.05 ? '\\text{mesokurtic}' : gamma2 > 0 ? '\\text{leptokurtic (peaked)}' : '\\text{platykurtic (flat)}'}`,
    ],
  });

  // The working table
  let table;
  if (mode === 'raw') {
    table = { columns: [{ key: 'x', label: 'x' }, { key: 'd', label: 'x − x̄' }, { key: 'd2', label: '(x − x̄)²' }], rows: [...xs.map((x) => ({ x: n6(x), d: n4(x - mean), d2: n4((x - mean) ** 2) })), { x: `Σ = ${n6(sum(xs))}`, d: '0', d2: n4(m2 * N) }] };
  } else {
    const cf = []; fs.reduce((acc, v, i) => (cf[i] = acc + v), 0);
    table = {
      columns: [...(mode === 'grouped' ? [{ key: 'cls', label: 'Class' }] : []), { key: 'x', label: mode === 'grouped' ? 'm' : 'x' }, { key: 'f', label: 'f' }, { key: 'fx', label: mode === 'grouped' ? 'fm' : 'fx' }, { key: 'cf', label: 'cf' }, { key: 'fd2', label: mode === 'grouped' ? 'f(m − x̄)²' : 'f(x − x̄)²' }],
      rows: [...xs.map((x, i) => ({ cls: bounds ? `${bounds[i][0]}–${bounds[i][1]}` : '', x: n6(x), f: n6(fs[i]), fx: n6(fs[i] * x), cf: n6(cf[i]), fd2: n4(fs[i] * (x - mean) ** 2) })), { cls: 'Total', x: '', f: n6(N), fx: n6(sum(xs.map((x, i) => fs[i] * x))), cf: '', fd2: n4(m2 * N) }],
    };
  }

  const results = {
    n: N, mean, median, mode: modeValue, modes, q1, q3, iqr: q3 - q1,
    min: Math.min(...(bounds ? bounds.map((b) => b[0]) : xs)), max: Math.max(...(bounds ? bounds.map((b) => b[1]) : xs)),
    variance: m2, sd, sampleVariance: sampleVar, sampleSd: Math.sqrt(sampleVar), cv: mean !== 0 ? (sd / Math.abs(mean)) * 100 : NaN,
    skewPearson, beta1, gamma1, beta2, gamma2,
  };
  results.range = results.max - results.min;
  const summary = [
    ['Number of values', n6(N)], ['Mean x̄', n6(mean)], ['Median', n6(median)], ['Mode', modes.length ? modes.map(n6).join(', ') : 'none'],
    ['Q₁ / Q₃', `${n6(q1)} / ${n6(q3)}`], ['Range', n6(results.range)], ['Variance σ² (population)', n6(m2)], ['Standard deviation σ', n6(sd)],
    ['Sample variance s² / s', `${n6(sampleVar)} / ${n6(Math.sqrt(sampleVar))}`], ['Coefficient of variation', `${n4(results.cv)}%`],
    ['Skewness (Pearson) S_k', n4(skewPearson)], ['Kurtosis β₂', n4(beta2)],
  ];
  return { mode, ...results, summary, steps, table, verified: true, result: results, notes: mode === 'grouped' ? ['Grouped data: values are taken at the class marks (mid-points), so these are estimates.'] : [], plot: null };
}
