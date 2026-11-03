/**
 * Percentages and trade: the maths for /percentage-calculator.
 * Every mode returns a one-line headline, its working lines (LaTeX) and the main number.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney, texPct, formatMoney, formatPct } from '../finance/money';

export const MODES = [
  { id: 'of', label: 'X% of Y', inputs: [['x', 'Percentage X (%)'], ['y', 'Number Y']] },
  { id: 'what-percent', label: 'A is what % of B', inputs: [['a', 'Part A'], ['b', 'Whole B']] },
  { id: 'change', label: '% increase / decrease', inputs: [['from', 'Old value'], ['to', 'New value']] },
  { id: 'profit-loss', label: 'Profit & loss', inputs: [['cp', 'Cost price (CP)'], ['sp', 'Selling price (SP)']], money: true },
  { id: 'discount', label: 'Discount', inputs: [['mp', 'Marked price (MP)'], ['discounts', 'Discount % (for successive discounts: 20, 10)']], money: true },
  { id: 'markup-margin', label: 'Markup vs margin', inputs: [['cost', 'Cost'], ['price', 'Selling price']], money: true },
];

export function solve({ mode, values = {}, currency = 'INR' }) {
  const v = (k, where, opts) => readAmount(values[k], where, opts);
  const M = (x) => texMoney(x, currency);
  const done = (result, headline, lines, extra = {}) => ({ mode, result, headline, lines, ...extra, steps: { headers: [], rows: [] }, notes: [], plot: null });

  switch (mode) {
    case 'of': {
      const x = v('x', 'Percentage X', { allowNegative: true }), y = v('y', 'Number Y', { allowNegative: true });
      const r = (x / 100) * y;
      return done(r, `${formatPct(x)} of ${n(y)} = ${n(r)}`, [`${n(x)}\\% \\text{ of } ${n(y)} = \\frac{${n(x)}}{100} \\times ${n(y)}`, `= ${n(r)}`]);
    }
    case 'what-percent': {
      const a = v('a', 'Part A', { allowNegative: true }), b = v('b', 'Whole B', { allowNegative: true });
      if (b === 0) throw new EngineError('The whole B can\'t be 0 (you can\'t take a percentage of nothing).');
      const r = (a / b) * 100;
      return done(r, `${n(a)} is ${formatPct(r)} of ${n(b)}`, [`\\frac{\\text{part}}{\\text{whole}} \\times 100 = \\frac{${n(a)}}{${n(b)}} \\times 100`, `= ${texPct(r)}`]);
    }
    case 'change': {
      const a = v('from', 'Old value', { allowNegative: true }), b = v('to', 'New value', { allowNegative: true });
      if (a === 0) throw new EngineError('The old value can\'t be 0: a change from 0 has no percentage.');
      const r = ((b - a) / Math.abs(a)) * 100;
      const word = r > 0 ? 'increase' : r < 0 ? 'decrease' : 'no change';
      return done(r, r === 0 ? 'No change (0%)' : `${formatPct(Math.abs(r))} ${word}`, [
        '\\% \\text{ change} = \\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100',
        `= \\frac{${n(b)} - ${n(a)}}{${n(Math.abs(a))}} \\times 100 = \\frac{${n(b - a)}}{${n(Math.abs(a))}} \\times 100`,
        `= ${texPct(r)} \\ (\\text{${word}})`,
      ], { direction: word });
    }
    case 'profit-loss': {
      const cp = v('cp', 'Cost price', { positive: true }), sp = v('sp', 'Selling price');
      const diff = sp - cp;
      const pct = (Math.abs(diff) / cp) * 100;
      const kind = diff > 0 ? 'Profit' : diff < 0 ? 'Loss' : 'No profit, no loss';
      if (!diff) return done(0, 'No profit, no loss (SP = CP)', [`SP = CP = ${M(cp)}`], { kind });
      return done(pct, `${kind} of ${formatMoney(Math.abs(diff), currency)} (${formatPct(pct)})`, [
        diff > 0 ? `\\text{Profit} = SP - CP = ${M(sp)} - ${M(cp)} = ${M(diff)}` : `\\text{Loss} = CP - SP = ${M(cp)} - ${M(sp)} = ${M(-diff)}`,
        `\\text{${kind}}\\ \\% = \\frac{${M(Math.abs(diff))}}{${M(cp)}} \\times 100 = ${texPct(pct)}`,
      ], { kind, amount: Math.abs(diff) });
    }
    case 'discount': {
      const mp = v('mp', 'Marked price', { positive: true });
      const list = String(values.discounts ?? '').split(/[,;\s]+/).filter(Boolean);
      if (!list.length) throw new EngineError('Enter at least one discount %.');
      const ds = list.map((d, i) => readAmount(d, `Discount ${i + 1}`));
      if (ds.some((d) => d > 100)) throw new EngineError('A discount can\'t be more than 100%.');
      let price = mp;
      const lines = [];
      ds.forEach((d, i) => {
        const off = (price * d) / 100;
        lines.push(`\\text{Discount ${ds.length > 1 ? i + 1 : ''}: } ${M(price)} \\times \\frac{${n(d)}}{100} = ${M(off)}, \\quad ${M(price)} - ${M(off)} = ${M(price - off)}`);
        price -= off;
      });
      const total = ((mp - price) / mp) * 100;
      if (ds.length > 1) lines.push(`\\text{Single equivalent discount} = \\frac{${M(mp)} - ${M(price)}}{${M(mp)}} \\times 100 = ${texPct(total)}`);
      return done(price, `You pay ${formatMoney(price, currency)} (you save ${formatMoney(mp - price, currency)}, ${formatPct(total)})`, lines, { saved: mp - price, totalPct: total, successive: ds.length > 1 });
    }
    case 'markup-margin': {
      const cost = v('cost', 'Cost', { positive: true }), price = v('price', 'Selling price', { positive: true });
      const gain = price - cost;
      const markup = (gain / cost) * 100, margin = (gain / price) * 100;
      return done(markup, `Markup ${formatPct(markup)}, margin ${formatPct(margin)}`, [
        `\\text{Gain} = ${M(price)} - ${M(cost)} = ${M(gain)}`,
        `\\text{Markup} = \\frac{\\text{gain}}{\\text{cost}} \\times 100 = \\frac{${M(gain)}}{${M(cost)}} \\times 100 = ${texPct(markup)}`,
        `\\text{Margin} = \\frac{\\text{gain}}{\\text{selling price}} \\times 100 = \\frac{${M(gain)}}{${M(price)}} \\times 100 = ${texPct(margin)}`,
      ], { markup, margin });
    }
    default:
      throw new EngineError('Choose what to work out.');
  }
}
