/**
 * Simple and compound interest: the maths for /compound-interest.
 *   kind 'simple'    SI = PRT/100
 *   kind 'compound'  A = P(1 + R/(100n))^(nT), n = 1, 2, 4, 12 or 365 times a year, or continuous (A = Pe^(RT/100))
 * Part periods follow the NCERT convention: whole periods compound, the leftover part earns simple interest
 * (e.g. 2½ years yearly: A = P(1 + R/100)²(1 + R/200)).
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney, texPct } from '../finance/money';

export const FREQUENCIES = [
  { value: '1', label: 'Yearly', n: 1, word: 'year' },
  { value: '2', label: 'Half-yearly', n: 2, word: 'half-year' },
  { value: '4', label: 'Quarterly', n: 4, word: 'quarter' },
  { value: '12', label: 'Monthly', n: 12, word: 'month' },
  { value: '365', label: 'Daily', n: 365, word: 'day' },
  { value: 'continuous', label: 'Continuous', n: Infinity, word: '' },
];

/** Amount after T years. */
function amountAt(P, R, T, freq) {
  if (freq.n === Infinity) return P * Math.exp((R / 100) * T);
  const i = R / (100 * freq.n);
  const periods = freq.n * T;
  const whole = Math.floor(periods + 1e-9);
  const part = Math.max(0, periods - whole);
  return P * (1 + i) ** whole * (1 + i * part);
}

export function solve({ kind = 'compound', principal, rate, time, timeUnit = 'years', frequency = '1', currency = 'INR' }) {
  const P = readAmount(principal, 'Principal', { positive: true });
  const R = readAmount(rate, 'Rate of interest');
  if (R > 1000) throw new EngineError('Use a rate of 1000% a year or less.');
  const tIn = readAmount(time, 'Time', { positive: true });
  const T = timeUnit === 'months' ? tIn / 12 : tIn;
  if (T > 100) throw new EngineError('Use a time of 100 years or less.');
  const M = (x) => texMoney(x, currency);
  const years = Math.ceil(T - 1e-9);

  // Simple interest, also shown next to compound for comparison
  const si = (P * R * T) / 100;

  if (kind === 'simple') {
    const rows = Array.from({ length: years }, (_, k) => {
      const t = Math.min(k + 1, T);
      return { year: t, interest: (P * R * (t - Math.min(k, T))) / 100, total: (P * R * t) / 100, amount: P + (P * R * t) / 100 };
    });
    return {
      kind, P, R, T, interest: si, amount: P + si, rows, result: si,
      lines: [
        'SI = \\frac{P \\times R \\times T}{100}',
        `SI = \\frac{${M(P)} \\times ${n(R)} \\times ${n(T)}}{100} = ${M(si)}`,
        `A = P + SI = ${M(P)} + ${M(si)} = ${M(P + si)}`,
      ],
      notes: timeUnit === 'months' ? [`${n(tIn)} months = ${n(T)} years.`] : [],
      steps: { headers: [], rows: [] }, plot: null,
    };
  }

  const freq = FREQUENCIES.find((f) => f.value === String(frequency));
  if (!freq) throw new EngineError('Choose how often interest is compounded.');
  const A = amountAt(P, R, T, freq);
  const ci = A - P;
  const rows = Array.from({ length: years }, (_, k) => {
    const t = Math.min(k + 1, T);
    const open = amountAt(P, R, Math.min(k, T), freq);
    const close = amountAt(P, R, t, freq);
    return { year: t, opening: open, interest: close - open, amount: close };
  });

  const lines = [];
  const notes = [];
  if (timeUnit === 'months') notes.push(`${n(tIn)} months = ${n(T)} years.`);
  if (freq.n === Infinity) {
    lines.push('A = P e^{RT/100}', `A = ${M(P)} \\times e^{${n(R)} \\times ${n(T)} / 100} = ${M(P)} \\times e^{${n((R * T) / 100)}}`, `A = ${M(A)}`);
  } else {
    const i = R / (100 * freq.n);
    const periods = freq.n * T;
    const whole = Math.floor(periods + 1e-9);
    const part = periods - whole;
    if (freq.n === 1) lines.push('A = P\\left(1 + \\frac{R}{100}\\right)^{T}');
    else lines.push(`A = P\\left(1 + \\frac{R}{100 \\times ${freq.n}}\\right)^{${freq.n}T}`);
    lines.push(`\\text{Rate per ${freq.word}} = \\frac{${n(R)}}{${freq.n === 1 ? '100' : `100 \\times ${freq.n}`}} = ${n(i)}, \\quad \\text{number of ${freq.word}s} = ${n(periods)}`);
    if (part > 1e-9) {
      lines.push(`A = ${M(P)} \\times (1 + ${n(i)})^{${whole}} \\times (1 + ${n(i)} \\times ${n(part)})`);
      notes.push(`${n(periods)} ${freq.word}s is ${whole} whole ${freq.word}${whole === 1 ? '' : 's'} plus a part ${freq.word}. As in NCERT, the whole ${freq.word}s are compounded and the part earns simple interest.`);
    } else {
      lines.push(`A = ${M(P)} \\times (1 + ${n(i)})^{${whole}} = ${M(P)} \\times ${n((1 + i) ** whole)}`);
    }
    lines.push(`A = ${M(A)}`);
  }
  lines.push(`CI = A - P = ${M(A)} - ${M(P)} = ${M(ci)}`);

  // Effective annual rate and doubling time
  const ear = freq.n === Infinity ? (Math.exp(R / 100) - 1) * 100 : ((1 + R / (100 * freq.n)) ** freq.n - 1) * 100;
  const doubling = R > 0 ? (freq.n === Infinity ? Math.log(2) / (R / 100) : Math.log(2) / (freq.n * Math.log(1 + R / (100 * freq.n)))) : null;
  const extra = [
    freq.n === Infinity
      ? `\\text{Effective annual rate} = (e^{${n(R / 100)}} - 1) \\times 100 = ${texPct(ear)}`
      : `\\text{Effective annual rate} = \\left[\\left(1 + \\frac{${n(R)}}{100 \\times ${freq.n}}\\right)^{${freq.n}} - 1\\right] \\times 100 = ${texPct(ear)}`,
    ...(R > 0 ? [`\\text{Rule of 72: money doubles in about } \\frac{72}{${n(R)}} = ${n(72 / R, 4)} \\text{ years (exactly } ${n(doubling, 4)}\\text{)}`] : []),
  ];

  return {
    kind, P, R, T, freq: freq.value, freqLabel: freq.label, amount: A, interest: ci, rows,
    si, ear, doubling, ruleOf72: R > 0 ? 72 / R : null,
    lines, extra, notes, result: ci, steps: { headers: [], rows: [] }, plot: null,
  };
}
