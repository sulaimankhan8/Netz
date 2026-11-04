/**
 * VAT (and GST or consumption tax outside India): the maths for /vat-calculator.
 * Rates come from src/app/data/rates/vat.js (or the student's own rate).
 *   mode 'add'     net → VAT = net × r/100, gross = net × (1 + r/100)
 *   mode 'remove'  gross → net = gross ÷ (1 + r/100). The common mistake (gross − r% of gross) is worked out
 *                  too, so the page can show why it is wrong.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';
import { VAT_COUNTRIES } from '../../data/rates/vat';
import { requireRule } from '../rates/getRule';

export const country = (code) => VAT_COUNTRIES.find((c) => c.code === code) || null;

/** The VAT rule in force for a country on a date. */
export function vatRule(code, date) {
  const c = country(code);
  if (!c) throw new EngineError('Choose a country.');
  return requireRule(c.rules, `vat.${code}`, date);
}

export function solve({ amount, rate, mode = 'add', taxName = 'VAT' }) {
  const a = readAmount(amount, mode === 'add' ? `Price before ${taxName}` : `Price including ${taxName}`, { positive: true });
  const r = readAmount(rate, `${taxName} rate`);
  if (r > 100) throw new EngineError(`Use a ${taxName} rate of 100% or less.`);
  const M = (x) => texMoney(x, 'NONE');
  const T = `\\text{${taxName}}`;
  const k = 1 + r / 100;

  if (mode === 'add') {
    const tax = (a * r) / 100;
    return {
      mode, rate: r, net: a, tax, gross: a + tax, result: tax,
      lines: [`${T} = ${M(a)} \\times \\frac{${n(r)}}{100} = ${M(tax)}`, `\\text{Price with ${taxName}} = ${M(a)} + ${M(tax)} = ${M(a + tax)}`],
      steps: { headers: [], rows: [] }, notes: [], plot: null,
    };
  }
  if (mode !== 'remove') throw new EngineError(`Choose whether to add or remove ${taxName}.`);
  const net = a / k;
  const tax = a - net;
  const wrong = a - (a * r) / 100;
  return {
    mode, rate: r, net, tax, gross: a, result: tax, wrong,
    lines: [
      `\\text{Price before ${taxName}} = \\frac{${M(a)}}{1 + \\frac{${n(r)}}{100}} = \\frac{${M(a)}}{${n(k)}} = ${M(net)}`,
      `${T} = ${M(a)} - ${M(net)} = ${M(tax)}`,
    ],
    trap: r > 0 ? [
      `\\text{Not: } ${M(a)} - ${n(r)}\\% \\text{ of } ${M(a)} = ${M(wrong)}`,
      `\\text{Check: } ${M(wrong)} + ${n(r)}\\% = ${M(wrong * k)} \\neq ${M(a)}`,
    ] : null,
    steps: { headers: [], rows: [] }, notes: [], plot: null,
  };
}
