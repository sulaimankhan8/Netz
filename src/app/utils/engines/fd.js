/**
 * Fixed deposit (FD): the maths for /fd-calculator.
 *   Cumulative FD   A = P(1 + r/(100n))^(nT), compounded n times a year (Indian banks: quarterly).
 *                   Whole periods compound; a leftover part period earns simple interest (how banks treat odd days).
 *                   Deposits under 6 months earn simple interest, as at most Indian banks.
 *   Payout FD       interest is paid out each month or quarter, so the principal stays the same: P·r/(100·k) a time.
 * Result shape (shared by the savings engines, drawn by components/method/SavingsCalculator.js):
 *   { result, stats, lines, notes, columns, rows, bars }; money values are plain numbers, the page formats them.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney, texPct } from '../finance/money';

export const FD_FREQUENCIES = [
  { value: '4', label: 'Quarterly (most banks)', n: 4, word: 'quarter' },
  { value: '12', label: 'Monthly', n: 12, word: 'month' },
  { value: '2', label: 'Half-yearly', n: 2, word: 'half-year' },
  { value: '1', label: 'Yearly', n: 1, word: 'year' },
];

/** Tenure in years from years + months + days. */
export function readTenure(years, months, days) {
  const y = String(years ?? '').trim() ? readAmount(years, 'Years') : 0;
  const m = String(months ?? '').trim() ? readAmount(months, 'Months') : 0;
  const d = String(days ?? '').trim() ? readAmount(days, 'Days') : 0;
  const T = y + m / 12 + d / 365;
  if (!(T > 0)) throw new EngineError('Enter the tenure: years, months or days.');
  if (T > 50) throw new EngineError('Use a tenure of 50 years or less.');
  return { T, y, m, d };
}

/** "2 years 6 months" for notes. */
export function tenureWords({ y, m, d }) {
  const part = (v, w) => (v ? `${n(v)} ${w}${v === 1 ? '' : 's'}` : '');
  return [part(y, 'year'), part(m, 'month'), part(d, 'day')].filter(Boolean).join(' ');
}

function cumulativeAmount(P, R, T, k) {
  const i = R / (100 * k);
  const periods = k * T;
  const whole = Math.floor(periods + 1e-9);
  return P * (1 + i) ** whole * (1 + i * Math.max(0, periods - whole));
}

export function solve({ principal, rate, years, months, days, frequency = '4', payout = 'cumulative', currency = 'INR' }) {
  const P = readAmount(principal, 'Deposit amount', { positive: true });
  const R = readAmount(rate, 'Interest rate');
  if (R > 50) throw new EngineError('Use an interest rate of 50% a year or less.');
  const ten = readTenure(years, months, days);
  const { T } = ten;
  const M = (x) => texMoney(x, currency);
  const notes = [`Tenure: ${tenureWords(ten)} = ${n(T, 5)} years.`];
  const nYears = Math.ceil(T - 1e-9);
  const yearsCut = (k) => Math.min(k, T);

  // Payout FDs: the interest is paid out, nothing compounds
  if (payout === 'monthly' || payout === 'quarterly') {
    const k = payout === 'monthly' ? 12 : 4;
    const each = (P * R) / (100 * k);
    const total = (P * R * T) / 100;
    const rows = Array.from({ length: nYears }, (_, j) => ({
      year: yearsCut(j + 1), opening: P, interest: (P * R * (yearsCut(j + 1) - j)) / 100, paid: (P * R * yearsCut(j + 1)) / 100, closing: P,
    }));
    notes.push(payout === 'monthly'
      ? 'Many banks pay slightly less each month than this: they pay the quarterly interest discounted to a monthly amount. Your bank\'s figure may differ by a few rupees.'
      : 'The interest is paid to you, so it does not earn more interest. A cumulative FD at the same rate gives more.');
    return {
      result: P + total,
      stats: [
        { label: payout === 'monthly' ? 'Interest every month' : 'Interest every quarter', value: each, strong: true },
        { label: 'Total interest paid', value: total, strong: true },
        { label: 'Deposit returned at the end', value: P },
      ],
      lines: [
        `\\text{Interest each ${payout === 'monthly' ? 'month' : 'quarter'}} = \\frac{P \\times r}{100 \\times ${k}} = \\frac{${M(P)} \\times ${n(R)}}{${100 * k}} = ${M(each)}`,
        `\\text{Total interest} = \\frac{P \\times r \\times T}{100} = \\frac{${M(P)} \\times ${n(R)} \\times ${n(T, 5)}}{100} = ${M(total)}`,
      ],
      notes,
      columns: [
        { key: 'year', label: 'Year', bold: true, kind: 'year' },
        { key: 'interest', label: 'Interest paid this year' },
        { key: 'paid', label: 'Interest paid so far', highlight: true },
        { key: 'closing', label: 'Deposit' },
      ],
      rows,
      bars: { series: ['Deposit', 'Interest paid out'], rows: rows.map((r) => ({ label: String(Number(r.year.toFixed(2))), parts: [P, r.paid] })) },
    };
  }
  if (payout !== 'cumulative') throw new EngineError('Choose cumulative or an interest payout.');

  // Short deposits: simple interest
  if (T < 0.5) {
    const si = (P * R * T) / 100;
    notes.push('Deposits for less than 6 months earn simple interest at most Indian banks (no compounding).');
    return {
      result: P + si,
      stats: [{ label: 'Maturity amount', value: P + si, strong: true }, { label: 'Interest earned', value: si, strong: true }, { label: 'Deposit', value: P }],
      lines: [
        `\\text{Interest} = \\frac{P \\times r \\times T}{100} = \\frac{${M(P)} \\times ${n(R)} \\times ${n(T, 5)}}{100} = ${M(si)}`,
        `\\text{Maturity} = ${M(P)} + ${M(si)} = ${M(P + si)}`,
      ],
      notes,
      columns: [{ key: 'year', label: 'Year', bold: true, kind: 'year' }, { key: 'opening', label: 'Deposit' }, { key: 'interest', label: 'Interest' }, { key: 'closing', label: 'Maturity amount', highlight: true }],
      rows: [{ year: T, opening: P, interest: si, closing: P + si }],
      bars: { series: ['Deposit', 'Interest earned'], rows: [{ label: String(Number(T.toFixed(2))), parts: [P, si] }] },
    };
  }

  const freq = FD_FREQUENCIES.find((f) => f.value === String(frequency));
  if (!freq) throw new EngineError('Choose how often interest is compounded.');
  const k = freq.n;
  const i = R / (100 * k);
  const periods = k * T;
  const whole = Math.floor(periods + 1e-9);
  const part = Math.max(0, periods - whole);
  const A = cumulativeAmount(P, R, T, k);
  const lines = [
    `A = P\\left(1 + \\frac{r}{100 \\times ${k}}\\right)^{${k}T}`,
    `i = \\frac{${n(R)}}{${100 * k}} = ${n(i, 6)} \\text{ per ${freq.word}}, \\qquad ${k}T = ${k} \\times ${n(T, 5)} = ${n(periods, 6)}`,
  ];
  if (part > 1e-9) {
    lines.push(`A = ${M(P)} \\times (${n(1 + i, 8)})^{${whole}} \\times \\left(1 + ${n(i, 6)} \\times ${n(part, 5)}\\right) = ${M(A)}`);
    notes.push(`${n(periods, 6)} ${freq.word}s: ${whole} whole ${freq.word}s compound, and the last ${n(part, 4)} of a ${freq.word} earns simple interest.`);
  } else {
    lines.push(`A = ${M(P)} \\times (${n(1 + i, 8)})^{${whole}} = ${M(A)}`);
  }
  lines.push(`\\text{Interest} = A - P = ${M(A)} - ${M(P)} = ${M(A - P)}`);
  const eff = ((1 + i) ** k - 1) * 100;
  if (k > 1) lines.push(`\\text{Effective yearly rate} = \\left(1 + ${n(i, 6)}\\right)^{${k}} - 1 = ${texPct(eff, 4)}`);
  const rows = Array.from({ length: nYears }, (_, j) => {
    const open = cumulativeAmount(P, R, yearsCut(j), k);
    const close = cumulativeAmount(P, R, yearsCut(j + 1), k);
    return { year: yearsCut(j + 1), opening: open, interest: close - open, closing: close };
  });
  return {
    result: A,
    stats: [
      { label: 'Maturity amount', value: A, strong: true },
      { label: 'Interest earned', value: A - P, strong: true },
      { label: 'Effective yearly rate', value: eff, kind: 'pct' },
    ],
    lines,
    notes,
    columns: [
      { key: 'year', label: 'Year', bold: true, kind: 'year' },
      { key: 'opening', label: 'Opening amount' },
      { key: 'interest', label: 'Interest this year' },
      { key: 'closing', label: 'Closing amount', highlight: true },
    ],
    rows,
    bars: { series: ['Deposit', 'Interest earned'], rows: rows.map((r) => ({ label: String(Number(r.year.toFixed(2))), parts: [P, r.closing - P] })) },
  };
}
