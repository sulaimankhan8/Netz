/**
 * US sales tax: the maths for /sales-tax-calculator. State base rates come from src/app/data/rates/us.js;
 * the local (county + city) rate is typed in, because it changes by address.
 *   combined rate c = state rate + local rate
 *   mode 'add'     tax = price × c/100, total = price + tax
 *   mode 'remove'  price = total × 100/(100 + c), tax = total − price
 * Each part (state, local) is its own share of the price: state tax = price × state/100.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';
import { US_RULES } from '../../data/rates/us';
import { requireRule } from '../rates/getRule';

export const salesTaxRule = (date) => requireRule(US_RULES, 'us.salestax.states', date);

/** Splits a tax between named parts by their rates (state, local, …), rounding each to cents. */
export function splitParts(base, parts) {
  return parts.filter((p) => p.rate > 0).map((p) => ({ ...p, amount: (base * p.rate) / 100 }));
}

export function solve({ amount, state, stateRate, local = '', mode = 'add', rule = salesTaxRule() }) {
  let sRate;
  let label;
  if (state === 'custom') {
    sRate = readAmount(stateRate, 'State rate');
    label = 'State';
  } else {
    const st = rule.data.states.find((x) => x.code === state);
    if (!st) throw new EngineError('Choose a state.');
    sRate = st.rate;
    label = st.name;
  }
  const lRate = String(local ?? '').trim() ? readAmount(local, 'Local rate') : 0;
  const c = sRate + lRate;
  if (c > 30) throw new EngineError('The combined rate is over 30%. Check the local rate: it is usually under 6%.');
  const a = readAmount(amount, mode === 'add' ? 'Price before tax' : 'Price including tax', { positive: true });
  const M = (x) => texMoney(x, 'USD');

  let base, tax, total;
  const lines = [`c = \\text{state} + \\text{local} = ${n(sRate)}\\% + ${n(lRate)}\\% = ${n(c)}\\%`];
  if (mode === 'add') {
    base = a; tax = (a * c) / 100; total = a + tax;
    lines.push(
      `\\text{Tax} = \\text{price} \\times \\frac{c}{100} = ${M(a)} \\times \\frac{${n(c)}}{100} = ${M(tax)}`,
      `\\text{Total} = ${M(a)} + ${M(tax)} = ${M(total)}`,
    );
  } else if (mode === 'remove') {
    total = a; base = (a * 100) / (100 + c); tax = a - base;
    lines.push(
      `\\text{Price before tax} = \\text{total} \\times \\frac{100}{100 + c} = ${M(a)} \\times \\frac{100}{${n(100 + c)}} = ${M(base)}`,
      `\\text{Tax} = ${M(a)} - ${M(base)} = ${M(tax)}`,
    );
  } else {
    throw new EngineError('Choose whether to add or remove sales tax.');
  }
  const parts = splitParts(base, [{ label: `${label} tax`, rate: sRate }, { label: 'Local tax', rate: lRate }]);
  if (parts.length > 1) lines.push(parts.map((p) => `\\text{${p.label}} = ${M(base)} \\times ${n(p.rate)}\\% = ${M(p.amount)}`).join(', \\quad '));
  const notes = [];
  if (c === 0) notes.push(`${label} has no state sales tax${lRate ? '' : ', and no local rate was entered'}.`);
  notes.push('Most states tax the price before tax, so the parts add up. Some items (groceries, medicine, clothing in some states) are taxed at a lower rate or not at all.');
  return { result: total, base, tax, total, rate: c, stateRate: sRate, localRate: lRate, parts, lines, notes };
}
