/**
 * Canada GST / HST / PST: the maths for /canada-sales-tax-calculator. Rates come from src/app/data/rates/ca.js.
 *   GST only (AB, territories)      tax = price × 5%
 *   HST (ON, NB, NL, NS, PE)        tax = price × HST%; the federal part is 5%, the rest is the provincial part
 *   GST + PST/RST/QST (BC, MB, SK, QC)  both on the price before tax: tax = price × (5% + PST%)
 *   Remove: price = total × 100/(100 + total rate).
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';
import { CA_RULES } from '../../data/rates/ca';
import { requireRule } from '../rates/getRule';

export const canadaRule = (date) => requireRule(CA_RULES, 'ca.salestax.provinces', date);

/** The tax parts for a province: [{ label, rate }]. */
export function provinceParts(rule, code) {
  const p = rule.data.provinces.find((x) => x.code === code);
  if (!p) throw new EngineError('Choose a province or territory.');
  const g = rule.data.gst;
  if (p.kind === 'hst') return { province: p, parts: [{ label: 'HST', rate: p.hst, federal: g, provincial: p.hst - g }] };
  if (p.kind === 'pst') return { province: p, parts: [{ label: 'GST', rate: g }, { label: p.pstName, rate: p.pst }] };
  return { province: p, parts: [{ label: 'GST', rate: g }] };
}

export function solve({ amount, province, mode = 'add', rule = canadaRule() }) {
  const { province: p, parts } = provinceParts(rule, province);
  const c = parts.reduce((s, x) => s + x.rate, 0);
  const a = readAmount(amount, mode === 'add' ? 'Price before tax' : 'Price including tax', { positive: true });
  const M = (x) => texMoney(x, 'USD');
  const lines = [];
  if (parts.length > 1) lines.push(`\\text{Total rate} = ${parts.map((x) => `${n(x.rate)}\\%`).join(' + ')} = ${n(c)}\\%`);

  let base, total;
  if (mode === 'add') {
    base = a; total = a * (1 + c / 100);
  } else if (mode === 'remove') {
    total = a; base = (a * 100) / (100 + c);
    lines.push(`\\text{Price before tax} = \\text{total} \\times \\frac{100}{100 + ${n(c)}} = ${M(a)} \\times \\frac{100}{${n(100 + c)}} = ${M(base)}`);
  } else {
    throw new EngineError('Choose whether to add or remove sales tax.');
  }
  const amounts = parts.map((x) => ({ ...x, amount: (base * x.rate) / 100 }));
  for (const x of amounts) {
    lines.push(`\\text{${x.label}} = ${M(base)} \\times \\frac{${n(x.rate)}}{100} = ${M(x.amount)}`);
    if (x.federal) {
      lines.push(`\\quad \\text{federal part } ${M(base)} \\times ${n(x.federal)}\\% = ${M((base * x.federal) / 100)}, \\quad \\text{provincial part } ${M(base)} \\times ${n(x.provincial)}\\% = ${M((base * x.provincial) / 100)}`);
    }
  }
  const tax = total - base;
  lines.push(mode === 'add'
    ? `\\text{Total} = ${M(base)} + ${amounts.map((x) => M(x.amount)).join(' + ')} = ${M(total)}`
    : `\\text{Check: } ${M(base)} + ${amounts.map((x) => M(x.amount)).join(' + ')} = ${M(total)}`);
  const notes = [];
  if (p.kind === 'pst') notes.push(`${p.name} charges ${p.pstName} on the price before GST, not on top of the GST.`);
  if (p.kind === 'hst') notes.push(`HST replaces GST and the provincial tax with one tax; businesses send all of it to the CRA.`);
  if (p.kind === 'gst') notes.push(`${p.name} has no provincial sales tax: only the 5% GST.`);
  if (p.note) notes.push(`${p.name}: ${p.note}.`);
  return { result: total, base, tax, total, rate: c, province: p, parts: amounts, lines, notes };
}
