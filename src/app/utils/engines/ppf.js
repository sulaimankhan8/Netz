/**
 * Public Provident Fund (PPF): the maths for /ppf-calculator. The rate comes from src/app/data/rates/in.js
 * ('in.ppf.rate') or the student's own rate.
 * Interest is worked out on the lowest balance between the 5th and the end of each month and added once a year.
 *   timing 'start'  deposit by 5 April: the whole year's interest, so  F = D × [(1 + r)^n − 1]/r × (1 + r)
 *   timing 'end'    deposit at the end of the year (March): it earns nothing that year,  F = D × [(1 + r)^n − 1]/r
 * Same result shape as fd.js.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

/** The PPF rule in force on a date. */
export const ppfRule = (date) => requireRule(IN_RULES, 'in.ppf.rate', date);

export function solve({ deposit, rate, years = '15', timing = 'start', currency = 'INR', rule = ppfRule() }) {
  const D = readAmount(deposit, 'Yearly deposit', { positive: true });
  const { minDeposit, maxDeposit, lockInYears, extensionYears } = rule.data;
  if (D < minDeposit) throw new EngineError(`The smallest PPF deposit is ₹${minDeposit} a year.`);
  if (D > maxDeposit) throw new EngineError(`The most you can put in a PPF is ₹${maxDeposit.toLocaleString('en-IN')} a year. Deposits above that earn no interest.`);
  const R = readAmount(rate, 'Interest rate');
  if (R > 30) throw new EngineError('Use an interest rate of 30% a year or less.');
  const N = readAmount(years, 'Years', { positive: true });
  if (!Number.isInteger(N) || N < lockInYears || (N - lockInYears) % extensionYears || N > 50) {
    throw new EngineError(`A PPF runs for ${lockInYears} years and can be extended in blocks of ${extensionYears}: use ${lockInYears}, ${lockInYears + 5}, ${lockInYears + 10}, … (up to 50).`);
  }
  if (!['start', 'end'].includes(timing)) throw new EngineError('Choose when you deposit each year.');
  const M = (x) => texMoney(x, currency);
  const r = R / 100;

  let bal = 0;
  const rows = [];
  for (let y = 1; y <= N; y++) {
    const opening = bal;
    const earning = timing === 'start' ? opening + D : opening;
    const interest = earning * r;
    bal = opening + D + interest;
    rows.push({ year: y, opening, deposit: D, interest, closing: bal, invested: D * y });
  }
  const invested = D * N;
  const growth = r === 0 ? N : ((1 + r) ** N - 1) / r;
  const formula = timing === 'start' ? D * growth * (1 + r) : D * growth;
  const lines = [
    timing === 'start'
      ? 'F = D \\times \\frac{(1 + r)^{n} - 1}{r} \\times (1 + r) \\qquad \\text{(deposit by 5 April each year)}'
      : 'F = D \\times \\frac{(1 + r)^{n} - 1}{r} \\qquad \\text{(deposit at the end of each year)}',
    `r = \\frac{${n(R)}}{100} = ${n(r, 6)}, \\qquad n = ${N}`,
    r === 0
      ? `F = D \\times n = ${M(D)} \\times ${N} = ${M(formula)}`
      : `F = ${M(D)} \\times \\frac{(${n(1 + r, 6)})^{${N}} - 1}{${n(r, 6)}}${timing === 'start' ? ` \\times ${n(1 + r, 6)}` : ''} = ${M(formula)}`,
    `\\text{Interest} = F - D \\times n = ${M(bal)} - ${M(invested)} = ${M(bal - invested)}`,
  ];
  const notes = [
    `Interest is added once a year, at the end of the financial year (31 March). PPF interest and the maturity amount are tax-free.`,
    timing === 'start'
      ? 'Paying by the 5th of April gives the deposit a full year of interest.'
      : 'A deposit made in March earns no interest that year, so the same deposits grow to less.',
  ];
  if (N > lockInYears) notes.push(`${lockInYears} years plus ${(N - lockInYears) / extensionYears} extension${N - lockInYears > extensionYears ? 's' : ''} of ${extensionYears} years, with deposits continuing.`);
  return {
    result: bal,
    stats: [
      { label: 'Maturity amount', value: bal, strong: true },
      { label: 'Interest earned', value: bal - invested, strong: true },
      { label: `Total deposited (${N} × ${D.toLocaleString('en-IN')})`, value: invested },
    ],
    lines,
    notes,
    columns: [
      { key: 'year', label: 'Year', bold: true, kind: 'year' },
      { key: 'opening', label: 'Opening balance' },
      { key: 'deposit', label: 'Deposit' },
      { key: 'interest', label: 'Interest' },
      { key: 'closing', label: 'Closing balance', highlight: true },
    ],
    rows,
    bars: { series: ['Deposited', 'Interest earned'], rows: rows.map((x) => ({ label: String(x.year), parts: [x.invested, x.closing - x.invested] })) },
  };
}
