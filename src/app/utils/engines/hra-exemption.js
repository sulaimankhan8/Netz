/**
 * HRA exemption (section 10(13A), rule 2A): the maths for /hra-exemption-calculator. Rates: 'in.hra' in in.js.
 * Exempt HRA = the least of
 *   (a) HRA actually received
 *   (b) rent paid − 10% of salary
 *   (c) 50% of salary in Delhi, Mumbai, Kolkata or Chennai, 40% elsewhere
 * where salary = basic + DA (the part that counts for retirement benefits). The rest of the HRA is taxable.
 * Only in the old regime: the new regime gives no HRA exemption.
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

const M = (x) => texMoney(x, 'INR');

export function solve({ basic, da = '', hra, rent, metro = 'yes', period = 'year' }) {
  const rule = requireRule(IN_RULES, 'in.hra');
  const k = period === 'month' ? 12 : 1;
  const B = readAmount(basic, 'Basic salary', { positive: true }) * k;
  const D = (String(da).trim() ? readAmount(da, 'DA') : 0) * k;
  const H = readAmount(hra, 'HRA received') * k;
  const Rn = readAmount(rent, 'Rent paid') * k;
  if (H < 0 || Rn < 0) throw new EngineError('Amounts cannot be negative.');
  const sal = B + D;
  const { metroPct, otherPct, rentLessPct, metros } = rule.data;
  const pct = metro === 'yes' ? metroPct : otherPct;
  const a = H, b = Math.max(0, Rn - (rentLessPct / 100) * sal), c = (pct / 100) * sal;
  const exempt = Math.min(a, b, c);
  const which = exempt === a ? 'a' : exempt === b ? 'b' : 'c';
  const rows = [
    { rule: '(a) HRA received', amount: formatMoney(a), least: which === 'a' ? '✓' : '' },
    { rule: `(b) Rent − ${rentLessPct}% of salary`, amount: formatMoney(b), least: which === 'b' ? '✓' : '' },
    { rule: `(c) ${pct}% of salary (${metro === 'yes' ? 'metro' : 'non-metro'})`, amount: formatMoney(c), least: which === 'c' ? '✓' : '' },
  ];
  const steps = [
    { title: 'Salary for HRA', formula: '\\text{salary} = \\text{basic} + \\text{DA}', depth: 0, lines: [`${M(B)}${D ? ` + ${M(D)}` : ''} = ${M(sal)} \\ \\text{a year}`] },
    { title: 'The three amounts', depth: 0, lines: [`(a) \\ ${M(a)}`, `(b) \\ ${M(Rn)} - ${rentLessPct}\\% \\times ${M(sal)} = ${M(b)}`, `(c) \\ ${pct}\\% \\times ${M(sal)} = ${M(c)}`] },
    { title: 'Exempt HRA = the least', depth: 0, lines: [`\\min = ${M(exempt)} \\quad \\text{(${which})}`, `\\text{taxable HRA} = ${M(H)} - ${M(exempt)} = ${M(H - exempt)}`] },
  ];
  const notes = [`Metro cities for the 50% rule: ${metros.join(', ')}.`, 'Only under the old tax regime. In the new regime all HRA is taxable.'];
  if (Rn === 0) notes.unshift('No rent paid, so no HRA exemption.');
  return {
    answer: `Exempt HRA ${formatMoney(exempt)} a year; taxable ${formatMoney(H - exempt)}`, exempt, taxable: H - exempt, rule, rows,
    columns: [{ key: 'rule', label: 'Rule', bold: true }, { key: 'amount', label: 'Amount (a year)' }, { key: 'least', label: 'Least', highlight: true }],
    steps, notes, verified: true, result: Math.round(exempt),
  };
}
