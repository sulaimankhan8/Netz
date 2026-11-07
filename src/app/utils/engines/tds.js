/**
 * TDS (tax deducted at source): the maths for /tds-calculator. People type their own rate; common sections
 * from 'in.tds.sections' (in.js) can fill it in, with their usual limits.
 *   TDS = payment × rate;  no PAN: the higher of the rate and 20% (section 206AA)
 *   net payment = payment − TDS
 * Below the section's limit no TDS is due (the limit is per payment, per month or per year as stated).
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

const M = (x) => texMoney(x, 'INR');

export function solve({ amount, section = 'custom', rate = '', pan = 'yes', yearTotal = '' }) {
  const rule = requireRule(IN_RULES, 'in.tds.sections');
  const P = readAmount(amount, 'Payment', { positive: true });
  const sec = rule.data.sections.find((s) => s.key === section) || null;
  let r;
  if (String(rate).trim()) r = readAmount(rate, 'TDS rate');
  else if (sec) r = sec.rate;
  else throw new EngineError('Type the TDS rate, or pick a section.');
  if (r < 0 || r > 100) throw new EngineError('The rate must be between 0% and 100%.');
  const steps = [];
  const notes = [];
  if (sec) {
    const total = String(yearTotal).trim() ? readAmount(yearTotal, 'Total for the period') : P;
    const below = total <= sec.threshold;
    steps.push({ title: 'Limit', depth: 0, lines: [`\\text{${sec.label}: TDS when payments exceed } ${M(sec.threshold)} \\text{ per ${sec.per}}`, below ? `${M(total)} \\le ${M(sec.threshold)} \\Rightarrow \\text{no TDS}` : `${M(total)} > ${M(sec.threshold)} \\Rightarrow \\text{TDS applies}`] });
    if (below) return { answer: 'No TDS (below the limit)', tds: 0, net: P, rule, steps, notes: ['Check the limit for your exact case: some sections count the whole year.'], verified: true, result: 0 };
  }
  const noPan = pan === 'no';
  const used = noPan ? Math.max(r, rule.data.noPanRate) : r;
  if (noPan) steps.push({ title: 'No PAN (section 206AA)', depth: 0, lines: [`\\text{rate} = \\max(${r}\\%, ${rule.data.noPanRate}\\%) = ${used}\\%`] });
  const T = (P * used) / 100;
  steps.push({ title: 'TDS', formula: '\\text{TDS} = \\text{payment} \\times \\text{rate}', depth: 0, lines: [`${M(P)} \\times ${used}\\% = ${M(T)}`, `\\text{net payment} = ${M(P)} - ${M(T)} = ${M(P - T)}`] });
  notes.push('TDS is not an extra tax: it is credited against the receiver\'s income tax (see Form 26AS).');
  return { answer: `TDS ${formatMoney(T)}; net payment ${formatMoney(P - T)}`, tds: T, net: P - T, rule, steps, notes, verified: true, result: Math.round(T * 100) / 100 };
}
