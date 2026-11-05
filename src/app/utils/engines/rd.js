/**
 * Recurring deposit (RD): the maths for /rd-calculator.
 * A fixed amount R is paid at the start of every month for N months; interest compounds quarterly (Indian banks).
 * Instalment k stays in for N − k + 1 months = (N − k + 1)/3 quarters, so it grows to R(1 + i)^((N−k+1)/3), i = r/400.
 * Adding them up gives the formula banks publish (for any N):
 *   M = R × [(1 + i)^(N/3) − 1] / [1 − (1 + i)^(−1/3)]
 * Same result shape as fd.js.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';

/** Value after `upto` months of the instalments paid so far. */
function valueAt(R, i, upto) {
  let v = 0;
  for (let k = 1; k <= upto; k++) v += R * (1 + i) ** ((upto - k + 1) / 3);
  return v;
}

export function solve({ instalment, rate, years, months, currency = 'INR' }) {
  const R = readAmount(instalment, 'Monthly instalment', { positive: true });
  const r = readAmount(rate, 'Interest rate');
  if (r > 50) throw new EngineError('Use an interest rate of 50% a year or less.');
  const y = String(years ?? '').trim() ? readAmount(years, 'Years') : 0;
  const mo = String(months ?? '').trim() ? readAmount(months, 'Months') : 0;
  const N = Math.round(y * 12 + mo);
  if (Math.abs(y * 12 + mo - N) > 1e-9) throw new EngineError('An RD runs for whole months: use whole months (years × 12 + months).');
  if (N < 1) throw new EngineError('Enter the tenure: at least 1 month.');
  if (N > 600) throw new EngineError('Use a tenure of 50 years (600 months) or less.');
  const M$ = (x) => texMoney(x, currency);
  const i = r / 400;
  const maturity = valueAt(R, i, N);
  const deposited = R * N;
  const formula = r === 0 ? deposited : (R * ((1 + i) ** (N / 3) - 1)) / (1 - (1 + i) ** (-1 / 3));

  const lines = [
    `i = \\frac{r}{400} = \\frac{${n(r)}}{400} = ${n(i, 6)} \\text{ per quarter}, \\qquad N = ${N} \\text{ months} = ${n(N / 3, 6)} \\text{ quarters}`,
    `\\text{Instalment } k \\text{ grows for } \\frac{N - k + 1}{3} \\text{ quarters: } \\ R(1 + i)^{(N - k + 1)/3}`,
  ];
  if (r > 0) {
    lines.push(
      `M = R \\times \\frac{(1 + i)^{N/3} - 1}{1 - (1 + i)^{-1/3}}`,
      `M = ${M$(R)} \\times \\frac{(${n(1 + i, 8)})^{${n(N / 3, 6)}} - 1}{1 - (${n(1 + i, 8)})^{-1/3}} = ${M$(formula)}`,
    );
  } else {
    lines.push(`\\text{At } 0\\%, \\ M = R \\times N = ${M$(R)} \\times ${N} = ${M$(deposited)}`);
  }
  lines.push(`\\text{Interest} = M - R \\times N = ${M$(maturity)} - ${M$(deposited)} = ${M$(maturity - deposited)}`);

  const nYears = Math.ceil(N / 12);
  const rows = Array.from({ length: nYears }, (_, j) => {
    const m = Math.min(12 * (j + 1), N);
    const value = valueAt(R, i, m);
    return { year: m / 12, deposited: R * m, interest: value - R * m, closing: value };
  });
  const notes = [
    'Payments are made at the start of each month, and interest is added every quarter, as at most Indian banks.',
  ];
  if (N % 3) notes.push(`${N} months is not a whole number of quarters; the formula still works with a fractional power, as banks calculate it.`);
  return {
    result: maturity,
    stats: [
      { label: 'Maturity amount', value: maturity, strong: true },
      { label: 'Interest earned', value: maturity - deposited, strong: true },
      { label: `Total paid in (${N} × instalment)`, value: deposited },
    ],
    lines,
    notes,
    columns: [
      { key: 'year', label: 'Year', bold: true, kind: 'year' },
      { key: 'deposited', label: 'Paid in so far' },
      { key: 'interest', label: 'Interest so far' },
      { key: 'closing', label: 'Value', highlight: true },
    ],
    rows,
    bars: { series: ['Paid in', 'Interest earned'], rows: rows.map((x) => ({ label: String(Number(x.year.toFixed(2))), parts: [x.deposited, x.interest] })) },
  };
}
