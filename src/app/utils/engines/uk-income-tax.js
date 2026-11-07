/**
 * UK income tax and employee National Insurance, take-home pay: the maths for /uk-income-tax-calculator.
 * Rates: 'uk.incometax' in uk.js, one rule per tax year (6 April to 5 April).
 *   1. Pay for tax and NI = salary − pension by salary sacrifice
 *   2. Personal allowance £12,570, cut by £1 for every £2 above £100,000 (gone at £125,140)
 *   3. Income tax on pay − allowance, band by band (England, Wales, NI or Scotland)
 *   4. Class 1 NI: 8% between £12,570 and £50,270 a year, 2% above
 *   take-home = salary − pension − income tax − NI
 * Not covered: student loans, the marriage allowance, the blind person's allowance, savings and dividend rates.
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';
import { UK_RULES } from '../../data/rates/uk';
import { requireRule } from '../rates/getRule';
import { slabTax } from './income-tax';

const M = (x) => texMoney(x, 'GBP');

export function solve({ salary, region = 'ruk', year = '2026', pension = '' }) {
  const rule = requireRule(UK_RULES, 'uk.incometax', `${year}-07-01`);
  const S = readAmount(salary, 'Salary', { positive: true });
  const pct = String(pension).trim() ? readAmount(pension, 'Pension %') : 0;
  if (pct < 0 || pct > 100) throw new EngineError('The pension contribution must be between 0% and 100%.');
  const pen = (S * pct) / 100, pay = S - pen;
  const d = rule.data;
  const pa = Math.max(0, d.personalAllowance - Math.max(0, pay - d.taperFrom) / 2);
  const taxable = Math.max(0, pay - pa);
  // Scottish thresholds are quoted on gross income with the standard allowance; the top-rate threshold stays as it is
  const bands = region === 'scotland'
    ? d.scotlandGross.map(([from, to, r]) => [from >= 125140 ? from : from - d.personalAllowance, to === null ? null : to >= 125140 ? to : to - d.personalAllowance, r])
    : d.bands.ruk;
  const { tax, rows: brows } = slabTax(taxable, bands);
  const ni = d.ni;
  const niMain = (Math.max(0, Math.min(pay, ni.upperEarningsLimit) - ni.primaryThreshold) * ni.mainRate) / 100;
  const niUpper = (Math.max(0, pay - ni.upperEarningsLimit) * ni.upperRate) / 100;
  const NI = niMain + niUpper;
  const take = S - pen - tax - NI;
  const NAMES = region === 'scotland' ? ['starter', 'basic', 'intermediate', 'higher', 'advanced', 'top'] : ['basic', 'higher', 'additional'];
  const rows = brows.map((r, i) => ({ band: NAMES[i] || '', rate: `${r.rate}%`, inBand: formatMoney(r.inSlab, 'GBP'), tax: formatMoney(r.tax, 'GBP') }));
  const steps = [
    ...(pen ? [{ title: 'Pension (salary sacrifice)', depth: 0, lines: [`${pct}\\% \\times ${M(S)} = ${M(pen)}, \\quad \\text{pay} = ${M(pay)}`] }] : []),
    { title: 'Personal allowance', depth: 0, lines: [pay > d.taperFrom ? `${M(d.personalAllowance)} - \\frac{${M(pay)} - ${M(d.taperFrom)}}{2} = ${M(pa)}` : `${M(pa)} \\ (\\text{full allowance})`, `\\text{taxable} = ${M(pay)} - ${M(pa)} = ${M(taxable)}`] },
    { title: `Income tax (${region === 'scotland' ? 'Scotland' : 'England, Wales, NI'})`, depth: 0, lines: [...brows.map((r, i) => `\\text{${NAMES[i] || ''}}: \\ ${M(r.inSlab)} \\times ${r.rate}\\% = ${M(r.tax)}`), `\\text{total} = ${M(tax)}`] },
    { title: 'National Insurance (Class 1)', depth: 0, lines: [`${ni.mainRate}\\% \\times ${M(Math.max(0, Math.min(pay, ni.upperEarningsLimit) - ni.primaryThreshold))}${niUpper ? ` + ${ni.upperRate}\\% \\times ${M(pay - ni.upperEarningsLimit)}` : ''} = ${M(NI)}`] },
    { title: 'Take-home pay', depth: 0, lines: [`${M(S)} - ${[pen && M(pen), M(tax), M(NI)].filter(Boolean).join(' - ')} = ${M(take)}`, `\\text{per month} \\approx ${M(take / 12)}`] },
  ];
  const notes = [];
  if (pay > d.taperFrom && pay < 125140) notes.push('Between £100,000 and £125,140 the allowance is withdrawn, so each extra pound is taxed at an effective 60% (62% with NI).');
  notes.push('Assumes the standard 1257L tax code, paid through PAYE. Student loan repayments are not included.');
  return {
    answer: `Take-home ${formatMoney(take, 'GBP')} a year (${formatMoney(take / 12, 'GBP')} a month)`, tax, ni: NI, take, pa, rule, rows,
    columns: [{ key: 'band', label: 'Band', bold: true }, { key: 'rate', label: 'Rate' }, { key: 'inBand', label: 'Taxable income in band' }, { key: 'tax', label: 'Tax', highlight: true }],
    steps, notes, verified: Math.abs(S - pen - tax - NI - take) < 1e-6, result: Math.round(take),
  };
}
