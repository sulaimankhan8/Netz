/**
 * US federal income tax and take-home pay for an employee: the maths for /us-income-tax-calculator.
 * Rates: 'us.incometax' in us.js, one rule per tax year.
 *   1. AGI ≈ wages − pre-tax deductions (401(k), HSA …)
 *   2. Taxable income = AGI − the larger of the standard deduction and itemised deductions
 *   3. Federal tax, bracket by bracket (marginal rates)
 *   4. FICA: Social Security 6.2% up to the wage base, Medicare 1.45% + 0.9% above the threshold (on wages)
 *   5. State tax: the person's own flat rate on AGI (optional; states differ too much to store here)
 *   take-home = wages − pre-tax deductions − federal − FICA − state
 * Not covered: credits (child tax credit …), self-employment tax, capital gains rates, AMT.
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';
import { US_RULES } from '../../data/rates/us';
import { requireRule } from '../rates/getRule';
import { slabTax } from './income-tax';

const M = (x) => texMoney(x, 'USD');
const opt = (v, where) => (String(v ?? '').trim() ? readAmount(v, where) : 0);
const STATUS = { single: 'Single', mfj: 'Married filing jointly', hoh: 'Head of household' };

export function solve({ wages, status = 'single', year = '2026', pretax = '', itemized = '', state = '' }) {
  const rule = requireRule(US_RULES, 'us.incometax', `${year}-06-01`);
  if (!STATUS[status]) throw new EngineError('Choose a filing status.');
  const W = readAmount(wages, 'Wages', { positive: true });
  const pre = opt(pretax, 'Pre-tax deductions');
  if (pre > W) throw new EngineError('Pre-tax deductions cannot be more than the wages.');
  const agi = W - pre;
  const std = rule.data.standardDeduction[status], item = opt(itemized, 'Itemised deductions');
  const ded = Math.max(std, item);
  const taxable = Math.max(0, agi - ded);
  const { tax: fed, rows: brows } = slabTax(taxable, rule.data.brackets[status]);
  const f = rule.data.fica;
  const ss = (Math.min(W, f.ssWageBase) * f.ssRate) / 100;
  const med = (W * f.medicareRate) / 100 + (Math.max(0, W - f.addlMedicareThreshold[status]) * f.addlMedicareRate) / 100;
  const stRate = opt(state, 'State tax rate');
  const st = (agi * stRate) / 100;
  const take = W - pre - fed - ss - med - st;
  const marginal = brows.length ? brows.at(-1).rate : 0;
  const rows = brows.map((r) => ({ band: `${formatMoney(r.from, 'USD')} – ${r.to === null ? 'up' : formatMoney(r.to, 'USD')}`, rate: `${r.rate}%`, inBand: formatMoney(r.inSlab, 'USD'), tax: formatMoney(r.tax, 'USD') }));
  const steps = [
    { title: 'Adjusted gross income', depth: 0, lines: [`${M(W)}${pre ? ` - ${M(pre)}` : ''} = ${M(agi)}`] },
    { title: 'Taxable income', depth: 0, lines: [`\\text{${item > std ? 'itemised' : 'standard'} deduction} = ${M(ded)}`, `${M(agi)} - ${M(ded)} = ${M(taxable)}`] },
    { title: 'Federal income tax', formula: '\\text{each bracket taxes only the income inside it}', depth: 0, lines: [...brows.map((r) => `${M(r.inSlab)} \\times ${r.rate}\\% = ${M(r.tax)}`), `\\text{total} = ${M(fed)}`] },
    { title: 'FICA', depth: 0, lines: [`\\text{Social Security: } ${f.ssRate}\\% \\times ${M(Math.min(W, f.ssWageBase))} = ${M(ss)}${W > f.ssWageBase ? ` \\ (\\text{wage base } ${M(f.ssWageBase)})` : ''}`, `\\text{Medicare: } ${f.medicareRate}\\% \\times ${M(W)}${W > f.addlMedicareThreshold[status] ? ` + ${f.addlMedicareRate}\\% \\times ${M(W - f.addlMedicareThreshold[status])}` : ''} = ${M(med)}`] },
    ...(stRate ? [{ title: 'State tax (your rate)', depth: 0, lines: [`${stRate}\\% \\times ${M(agi)} = ${M(st)}`] }] : []),
    { title: 'Take-home pay', depth: 0, lines: [`${M(W)} - ${[pre && M(pre), M(fed), M(ss + med), stRate && M(st)].filter(Boolean).join(' - ')} = ${M(take)}`, `\\text{per month} \\approx ${M(take / 12)}`] },
  ];
  return {
    answer: `Take-home ${formatMoney(take, 'USD')} a year (${formatMoney(take / 12, 'USD')} a month)`, fed, fica: ss + med, state: st, take, rule,
    effective: W ? (fed / W) * 100 : 0, marginal, rows,
    columns: [{ key: 'band', label: 'Taxable income band', bold: true }, { key: 'rate', label: 'Rate' }, { key: 'inBand', label: 'Income in band' }, { key: 'tax', label: 'Tax', highlight: true }],
    steps, notes: [`${STATUS[status]}, tax year ${year}. Marginal federal rate ${marginal}%; federal tax is ${(W ? (fed / W) * 100 : 0).toFixed(1)}% of wages.`, '401(k) contributions lower income tax but not FICA. Credits such as the child tax credit are not included.'],
    verified: Math.abs(W - pre - fed - ss - med - st - take) < 1e-6, result: Math.round(take),
  };
}
