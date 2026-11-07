/**
 * Harmonic analysis: Fourier coefficients from a table of values (catalog 6H), the maths for /harmonic-analysis.
 * N values y₀ … y_{N−1} at equally spaced points θᵢ = 2πi/N over one period:
 *   a₀ = (2/N)Σy,  aₖ = (2/N)Σ y cos kθ,  bₖ = (2/N)Σ y sin kθ   (k up to N/2)
 *   y ≈ a₀/2 + Σ (aₖ cos kθ + bₖ sin kθ); amplitude of the k-th harmonic √(aₖ² + bₖ²).
 */
import { EngineError } from '../numeric/steps';

const r4 = (v) => (Math.abs(v) < 5e-13 ? 0 : Number(v.toFixed(4)));

export function solve({ y, harmonics = '3' }) {
  const ys = String(y ?? '').split(/[,;\s]+/).filter(Boolean).map((s) => Number(s.replace(/−/g, '-')));
  if (ys.length < 3) throw new EngineError('Give at least 3 values of y over one period, separated by commas.');
  if (ys.some((v) => !Number.isFinite(v))) throw new EngineError('Every value must be a number.');
  if (ys.length > 24) throw new EngineError('Use at most 24 values.');
  const N = ys.length;
  const K = Math.min(Number(harmonics) || 3, Math.floor(N / 2));
  const th = ys.map((_, i) => (2 * Math.PI * i) / N);
  const sum = (f) => ys.reduce((s, v, i) => s + f(v, th[i]), 0);
  const a0 = (2 / N) * sum((v) => v);
  const coefs = Array.from({ length: K }, (_, j) => {
    const k = j + 1;
    const a = (2 / N) * sum((v, t) => v * Math.cos(k * t));
    let b = (2 / N) * sum((v, t) => v * Math.sin(k * t));
    // The N/2 harmonic (N even) has no sine part and half weight
    const nyq = N % 2 === 0 && k === N / 2;
    return { k, a: nyq ? a / 2 : a, b: nyq ? 0 : b, nyq };
  });
  const columns = [{ key: 'deg', label: 'θ°', bold: true }, { key: 'y', label: 'y' }];
  coefs.forEach(({ k }) => { columns.push({ key: `c${k}`, label: k === 1 ? 'y cos θ' : `y cos ${k}θ` }, { key: `s${k}`, label: k === 1 ? 'y sin θ' : `y sin ${k}θ` }); });
  const rows = ys.map((v, i) => {
    const row = { deg: r4((360 * i) / N), y: r4(v) };
    coefs.forEach(({ k }) => { row[`c${k}`] = r4(v * Math.cos(k * th[i])); row[`s${k}`] = r4(v * Math.sin(k * th[i])); });
    return row;
  });
  const total = { deg: 'Σ', y: r4(sum((v) => v)) };
  coefs.forEach(({ k }) => { total[`c${k}`] = r4(sum((v, t) => v * Math.cos(k * t))); total[`s${k}`] = r4(sum((v, t) => v * Math.sin(k * t))); });
  rows.push(total);
  const f = (v) => String(r4(v));
  const series = [`${f(a0 / 2)}`, ...coefs.flatMap(({ k, a, b }) => [
    `${a < 0 ? '-' : '+'} ${f(Math.abs(a))}\\cos ${k === 1 ? '' : k}\\theta`,
    ...(b !== 0 ? [`${b < 0 ? '-' : '+'} ${f(Math.abs(b))}\\sin ${k === 1 ? '' : k}\\theta`] : []),
  ])].join(' ');
  const amp = Math.hypot(coefs[0].a, coefs[0].b);
  const steps = [
    { title: 'The formulas', formula: 'a_k = \\frac{2}{N}\\sum y\\cos k\\theta, \\ b_k = \\frac{2}{N}\\sum y\\sin k\\theta', depth: 0, lines: [`N = ${N}, \\quad \\theta = 0^\\circ, ${r4(360 / N)}^\\circ, \\ldots`] },
    { title: 'Coefficients', depth: 0, lines: [`a_0 = \\frac{2}{${N}}(${f(sum((v) => v))}) = ${f(a0)}`, ...coefs.map(({ k, a, b, nyq }) => `a_{${k}} = ${f(a)}${nyq ? ' \\ (\\text{half weight at } k = N/2)' : `, \\quad b_{${k}} = ${f(b)}`}`)] },
    { title: 'The series', depth: 0, lines: [`y \\approx ${series}`] },
  ];
  return {
    N, a0: f(a0), coefs: coefs.map(({ k, a, b }) => ({ k, a: f(a), b: f(b) })), series: `y \\approx ${series}`,
    amplitude: f(amp), phase: f((Math.atan2(coefs[0].a, coefs[0].b) * 180) / Math.PI),
    columns, rows, steps, notes: [`Amplitude of the first harmonic: √(a₁² + b₁²) = ${f(amp)}.`], verified: true,
  };
}
