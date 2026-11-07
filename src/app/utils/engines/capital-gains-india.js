/**
 * India capital gains tax for a resident individual: the maths for /capital-gains-tax-india (catalog 11).
 * Rates from src/app/data/rates/in.js ('in.capitalgains', picked by the SALE date; 'in.cii' for indexation).
 *   1. Holding period: long-term when held MORE than the asset's limit (12 or 24 months; 36 for some before 2024)
 *   2. Gain = sale price − purchase cost − transfer expenses
 *   3. Long-term with indexation: indexed cost = cost × CII(year of sale)/CII(year of purchase).
 *      Land or building bought before 23 Jul 2024: the lower of 12.5% without and 20% with indexation.
 *   4. Equity: the yearly LTCG exemption comes off first (₹1.25 lakh from 23 Jul 2024)
 *   5. Tax at the special rate, or at the person's own slab rate (typed in), then 4% cess
 * Not covered: surcharge, set-off of losses, reinvestment exemptions (54, 54EC, 54F), grandfathering before 2018.
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

const M = (x) => texMoney(x, 'INR');
const iso = (s, label) => { const v = String(s ?? '').trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new EngineError(`${label}: pick a date.`); return v; };
const fy = (d) => { const [y, m] = d.split('-').map(Number); return m >= 4 ? y : y - 1; };
const addMonths = (d, n) => { const [y, m, day] = d.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1 + n, day)); return t.toISOString().slice(0, 10); };
const monthsBetween = (a, b) => { const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number); return (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0); };

export function solve({ asset = 'equity', buyDate, sellDate, buy, sell, expenses = '', slab = '', exemptionUsed = '' }) {
  const b = iso(buyDate, 'Purchase date'), s = iso(sellDate, 'Sale date');
  if (s <= b) throw new EngineError('The sale date must be after the purchase date.');
  const rule = requireRule(IN_RULES, 'in.capitalgains', s);
  const A = rule.data.assets.find((x) => x.key === asset);
  if (!A) throw new EngineError('Choose the kind of asset.');
  const cost = readAmount(buy, 'Purchase cost', { positive: true }), price = readAmount(sell, 'Sale price', { positive: true });
  const exp = String(expenses).trim() ? readAmount(expenses, 'Transfer expenses') : 0;
  const steps = [];
  const months = monthsBetween(b, s);
  const long = A.longAfter !== null && s > addMonths(b, A.longAfter);
  steps.push({ title: 'Holding period', depth: 0, lines: [`\\text{Held about ${months} months; long-term if more than ${A.longAfter === null ? '— (always taxed as short-term)' : `${A.longAfter} months`}}`, `\\Rightarrow \\text{${long ? 'long-term (LTCG)' : 'short-term (STCG)'}}`] });
  const gain = price - cost - exp;
  steps.push({ title: 'Capital gain', formula: '\\text{gain} = \\text{sale} - \\text{cost} - \\text{expenses}', depth: 0, lines: [`${M(price)} - ${M(cost)}${exp ? ` - ${M(exp)}` : ''} = ${M(gain)}`] });
  if (gain <= 0) {
    return { answer: `Capital loss of ${formatMoney(-gain)}: no tax`, tax: 0, gain, long, rule, steps, notes: ['A loss can be set off against other capital gains and carried forward up to 8 years (not worked out here).'], verified: true, result: 0 };
  }
  const slabRate = () => { if (!String(slab).trim()) throw new EngineError('This gain is taxed at your slab rate: type your slab rate (e.g. 20 or 30).'); return readAmount(slab, 'Slab rate'); };
  const rate = long ? A.ltcg : A.stcg;
  const options = [];
  if (long && (A.indexation === true || (A.indexation === 'option' && b < A.indexationBefore))) {
    const cii = requireRule(IN_RULES, 'in.cii', s).data.index;
    const fb = fy(b), fs = fy(s);
    if (fb < 2001) throw new EngineError('Bought before 1 Apr 2001: use the fair market value on 1 Apr 2001 as the cost and 1 Apr 2001 as the date.');
    const latest = Math.max(...Object.keys(cii).map(Number));
    const cs = cii[fs] ?? cii[latest], cb = cii[fb];
    const indexed = (cost * cs) / cb;
    const gIdx = Math.max(0, price - indexed - exp);
    steps.push({ title: 'Indexed cost', formula: '\\text{cost} \\times \\frac{CII_{\\text{sale}}}{CII_{\\text{purchase}}}', depth: 0, lines: [`${M(cost)} \\times \\frac{${cs}}{${cb}} = ${M(indexed)} \\quad (\\text{FY } ${fb}\\text{–}${String(fb + 1).slice(2)} \\to ${fs}\\text{–}${String(fs + 1).slice(2)})`, `\\text{indexed gain} = ${M(price)} - ${M(indexed)}${exp ? ` - ${M(exp)}` : ''} = ${M(gIdx)}`] });
    if (!cii[fs]) steps.push({ title: 'Note', depth: 1, lines: [`\\text{CII for FY ${fs}–${String(fs + 1).slice(2)} is not stored yet; the latest (${cii[latest]}) is used.}`] });
    const idxRate = A.indexation === 'option' ? A.indexationRate : A.ltcg;
    options.push({ how: `${idxRate}% with indexation`, taxable: gIdx, r: idxRate });
    if (A.indexation === 'option') options.push({ how: `${A.ltcg}% without indexation`, taxable: gain, r: A.ltcg });
  } else {
    options.push({ how: rate === 'slab' ? 'your slab rate' : `${rate}%`, taxable: gain, r: rate === 'slab' ? slabRate() : rate });
  }
  // equity LTCG exemption
  if (long && A.exemption) {
    const used = String(exemptionUsed).trim() ? readAmount(exemptionUsed, 'Exemption already used') : 0;
    const left = Math.max(0, A.exemption - used);
    const t2 = Math.max(0, options[0].taxable - left);
    steps.push({ title: 'Yearly LTCG exemption', depth: 0, lines: [`${M(options[0].taxable)} - ${M(left)} = ${M(t2)} \\quad (\\text{exemption } ${M(A.exemption)}${used ? ` - ${M(used)} \\text{ used}` : ''})`] });
    options[0].taxable = t2;
  }
  options.forEach((o) => { o.tax = (o.taxable * o.r) / 100; });
  const best = options.reduce((p, q) => (q.tax < p.tax ? q : p));
  if (options.length > 1) steps.push({ title: 'Choose the lower tax', depth: 0, lines: options.map((o) => `\\text{${o.how.replace('%', '\\%')}}: \\quad ${M(o.taxable)} \\times ${o.r}\\% = ${M(o.tax)}`) });
  const base = best.tax, cess = (base * rule.data.cess) / 100, total = base + cess;
  steps.push({ title: 'Tax', depth: 0, lines: [`${M(best.taxable)} \\times ${best.r}\\% = ${M(base)}`, `\\text{cess } ${rule.data.cess}\\% = ${M(cess)}`, `\\text{total} = ${M(total)}`] });
  const notes = [`${long ? 'Long-term' : 'Short-term'} gain taxed at ${best.how}.`, 'Surcharge for high incomes is not included (it is capped at 15% on equity gains).'];
  return { answer: `${long ? 'LTCG' : 'STCG'} tax: ${formatMoney(total)}`, tax: total, gain, taxable: best.taxable, long, rule, steps, notes, verified: true, result: Math.round(total) };
}
