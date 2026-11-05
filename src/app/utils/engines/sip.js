/**
 * SIP (systematic investment plan), with an optional yearly step-up: the maths for /sip-calculator.
 * P is invested at the start of every month; the expected yearly return r is turned into a monthly rate i = r/12/100
 * (the convention used by Indian fund-house and broker calculators).
 *   No step-up   F = P × [(1 + i)^n − 1]/i × (1 + i),  n = 12 × years
 *   Step-up s%   year y's monthly amount is P(1 + s/100)^(y−1); each year's 12 payments are valued the same way
 *                and then grow for the remaining months:  F = Σ_y P_y × [(1 + i)^12 − 1]/i × (1 + i) × (1 + i)^(12(Y−y))
 * Same result shape as fd.js. Returns are not guaranteed: the page says so.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';

export function solve({ monthly, rate, years, stepUp = '0', currency = 'INR' }) {
  const P = readAmount(monthly, 'Monthly investment', { positive: true });
  const R = readAmount(rate, 'Expected return', { allowNegative: true });
  if (R <= -100 || R > 100) throw new EngineError('Use an expected return between −100% and 100% a year.');
  const Y = readAmount(years, 'Years', { positive: true });
  const N = Math.round(Y * 12);
  if (N < 1) throw new EngineError('Invest for at least 1 month.');
  if (Y > 60) throw new EngineError('Use 60 years or less.');
  const s = String(stepUp ?? '').trim() ? readAmount(stepUp, 'Step-up') : 0;
  if (s > 100) throw new EngineError('Use a yearly step-up of 100% or less.');
  const M = (x) => texMoney(x, currency);
  const i = R / 1200;

  // Month by month: pay at the start, then the month's return
  let bal = 0;
  let invested = 0;
  const rows = [];
  let amount = P;
  for (let m = 1; m <= N; m++) {
    if (m > 1 && (m - 1) % 12 === 0) amount *= 1 + s / 100;
    bal = (bal + amount) * (1 + i);
    invested += amount;
    if (m % 12 === 0 || m === N) rows.push({ year: m / 12, monthly: amount, invested, gains: bal - invested, closing: bal });
  }

  const factor = (k) => (i === 0 ? k : (((1 + i) ** k - 1) / i) * (1 + i));
  const lines = [`i = \\frac{${n(R)}}{12 \\times 100} = ${n(i, 6)} \\text{ per month}, \\qquad n = ${N} \\text{ months}`];
  const notes = ['Each payment is made at the start of the month and earns that month\'s return, as most SIP calculators assume.'];
  if (s === 0) {
    lines.push(
      'F = P \\times \\frac{(1 + i)^{n} - 1}{i} \\times (1 + i)',
      `F = ${M(P)} \\times \\frac{(${n(1 + i, 8)})^{${N}} - 1}{${n(i, 6)}} \\times ${n(1 + i, 8)} = ${M(P * factor(N))}`,
    );
  } else {
    const full = Math.floor(N / 12);
    lines.push(
      `\\text{Year } y \\text{ invests } P_y = P(1 + ${n(s / 100, 6)})^{y - 1} \\text{ a month}`,
      `F = \\sum_{y} P_y \\times \\frac{(1 + i)^{12} - 1}{i}(1 + i) \\times (1 + i)^{12(Y - y)}, \\qquad \\frac{(1 + i)^{12} - 1}{i}(1 + i) = ${n(factor(12), 8)}`,
    );
    notes.push(`The monthly amount rises by ${n(s)}% at the start of every year${full > 1 ? `, for ${full} years` : ''}; the table shows each year's amount.`);
  }
  lines.push(`\\text{Gains} = F - \\text{invested} = ${M(bal)} - ${M(invested)} = ${M(bal - invested)}`);
  if (N % 12) notes.push(`${n(Y)} years is ${N} months; the last row is part of a year.`);
  notes.push('Mutual fund returns go up and down; this shows what a steady return would give, not a promise.');
  return {
    result: bal,
    stats: [
      { label: 'Expected value', value: bal, strong: true },
      { label: 'Gains', value: bal - invested, strong: true },
      { label: 'Total invested', value: invested },
    ],
    lines,
    notes,
    columns: [
      { key: 'year', label: 'Year', bold: true, kind: 'year' },
      ...(s > 0 ? [{ key: 'monthly', label: 'Monthly amount' }] : []),
      { key: 'invested', label: 'Invested so far' },
      { key: 'gains', label: 'Gains so far' },
      { key: 'closing', label: 'Value', highlight: true },
    ],
    rows,
    bars: { series: ['Invested', 'Gains'], rows: rows.map((x) => ({ label: String(Number(x.year.toFixed(2))), parts: [x.invested, Math.max(0, x.gains)] })) },
  };
}
