/**
 * India GST: the maths for /gst-calculator. Rates come from src/app/data/rates/in.js (or the student's own rate).
 *   mode 'add'     price before GST → GST = price × r/100, total = price × (1 + r/100)
 *   mode 'remove'  price including GST → base = total × 100/(100 + r), GST = total × r/(100 + r)
 *   supply 'intra' (same state): CGST = SGST = GST/2; 'inter' (another state or import): IGST = GST
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

/** The GST rule in force on a date (for the slab buttons and the rates badge). */
export const gstRule = (date) => requireRule(IN_RULES, 'in.gst.slabs', date);

export function solve({ amount, rate, mode = 'add', supply = 'intra' }) {
  const a = readAmount(amount, mode === 'add' ? 'Price before GST' : 'Price including GST', { positive: true });
  const r = readAmount(rate, 'GST rate');
  if (r > 100) throw new EngineError('Use a GST rate of 100% or less.');
  const M = (x) => texMoney(x, 'INR');

  let base, gst, total, lines;
  if (mode === 'add') {
    base = a; gst = (a * r) / 100; total = a + gst;
    lines = [
      `\\text{GST} = \\text{price} \\times \\frac{r}{100} = ${M(a)} \\times \\frac{${n(r)}}{100} = ${M(gst)}`,
      `\\text{Total} = ${M(a)} + ${M(gst)} = ${M(total)}`,
    ];
  } else if (mode === 'remove') {
    total = a; base = (a * 100) / (100 + r); gst = a - base;
    lines = [
      `\\text{Price before GST} = \\text{total} \\times \\frac{100}{100 + r} = ${M(a)} \\times \\frac{100}{${n(100 + r)}} = ${M(base)}`,
      `\\text{GST} = \\text{total} \\times \\frac{r}{100 + r} = ${M(a)} \\times \\frac{${n(r)}}{${n(100 + r)}} = ${M(gst)}`,
    ];
  } else {
    throw new EngineError('Choose whether to add or remove GST.');
  }

  const split = supply === 'inter'
    ? { igst: gst }
    : { cgst: gst / 2, sgst: gst / 2 };
  lines.push(supply === 'inter'
    ? `\\text{Between states (or an import): IGST} = ${M(gst)}`
    : `\\text{Within one state: CGST} = \\text{SGST} = \\frac{${M(gst)}}{2} = ${M(gst / 2)} \\ (\\text{each at } ${n(r / 2)}\\%)`);

  return { mode, supply, rate: r, base, gst, total, ...split, lines, result: gst, steps: { headers: [], rows: [] }, notes: [], plot: null };
}
