/**
 * Corporate tax: the maths for /corporate-tax-calculator (Unit 11). Hidden until the owner checks the rates
 * (docs/launch/NETZ_OWNER_TODO.md section K). Every rate lives in the rates files: 'in.corporate', 'uk.corporation', 'us.corporate'.
 *   India  tax = rate × income, surcharge on the tax above the thresholds, then 4% health and education cess on both;
 *          the normal regime also has MAT (15% of book profit) as a floor.
 *   UK     19% up to £50,000, 25% above £250,000; in between 25% less marginal relief
 *          MR = (3/200) × (£250,000 − profits) (limits divided by 1 + associated companies)
 *   US     21% federal; an optional state rate s, deductible federally: combined = s + 21%(1 − s)
 */
import { EngineError } from '../numeric/steps';
import { formatMoney } from '../finance/money';
import { requireRule } from '../rates/getRule';
import { IN_RULES } from '../../data/rates/in';
import { UK_RULES } from '../../data/rates/uk';
import { US_RULES } from '../../data/rates/us';

const pct = (v) => `${Number(v.toFixed(3))}\\%`;

export function solve({ country = 'in', income, regime = '115BAA', turnover = '', bookProfit = '', associates = '0', stateRate = '', date = '' }) {
  const P = Number(income);
  if (!(P >= 0)) throw new EngineError('Give the taxable profit (a number, 0 or more).');
  const steps = [];
  const on = String(date).trim() || undefined;
  if (country === 'in') {
    const rule = requireRule(IN_RULES, 'in.corporate', on);
    const d = rule.data;
    const g = d.regimes[regime];
    if (!g) throw new EngineError('Pick a regime.');
    const T = Number(turnover);
    const rate = regime === 'normal' && T > 0 && T <= g.smallTurnover ? g.smallRate : g.rate;
    const base = (P * rate) / 100;
    // surcharge: the highest band whose threshold the income exceeds
    let sc = 0;
    for (const [lim, s] of g.surcharge) if (P > lim) sc = s;
    const sur = (base * sc) / 100, cess = ((base + sur) * d.cess) / 100;
    let total = base + sur + cess;
    steps.push({ title: g.label, depth: 0, lines: [`\\text{tax} = ${rate}\\% \\times ${P} = ${Number(base.toFixed(2))}${regime === 'normal' && rate === g.smallRate ? ' \\ (\\text{turnover up to Rs 400 crore})' : ''}`, `\\text{surcharge } ${sc}\\% = ${Number(sur.toFixed(2))}`, `\\text{cess } ${d.cess}\\% = ${Number(cess.toFixed(2))}`] });
    let mat = null;
    if (g.mat && String(bookProfit).trim()) {
      const B = Number(bookProfit);
      if (!(B >= 0)) throw new EngineError('Book profit must be a number.');
      const mb = (B * d.matRate) / 100, ms = (mb * sc) / 100, mc = ((mb + ms) * d.cess) / 100;
      mat = mb + ms + mc;
      steps.push({ title: 'Minimum alternate tax', formula: `\\text{MAT} = ${d.matRate}\\% \\text{ of book profit (+ surcharge, cess)}`, depth: 0, lines: [`\\text{MAT} = ${Number(mat.toFixed(2))}`, mat > total ? '\\text{MAT is higher, so it is payable}' : '\\text{normal tax is higher}'] });
      total = Math.max(total, mat);
    }
    steps.push({ title: 'Total', depth: 0, lines: [`\\text{tax payable} = ${Number(total.toFixed(2))}, \\quad \\text{effective rate} = ${pct(P ? (100 * total) / P : 0)}`] });
    return { country, total: formatMoney(total, 'INR'), effective: P ? Number(((100 * total) / P).toFixed(3)) : 0, rule, steps, notes: ['India: rates for domestic companies. Marginal relief at the surcharge thresholds is not applied.'], verified: true, result: total };
  }
  if (country === 'uk') {
    const rule = requireRule(UK_RULES, 'uk.corporation', on);
    const d = rule.data;
    const k = 1 + Math.max(0, Math.round(Number(associates) || 0));
    const lo = d.lower / k, hi = d.upper / k;
    let tax, lines;
    if (P <= lo) { tax = (P * d.smallRate) / 100; lines = [`\\text{profits} \\le ${lo}: \\ ${d.smallRate}\\% \\times ${P}`]; }
    else if (P >= hi) { tax = (P * d.mainRate) / 100; lines = [`\\text{profits} \\ge ${hi}: \\ ${d.mainRate}\\% \\times ${P}`]; }
    else {
      const main = (P * d.mainRate) / 100, mr = (d.fraction[0] / d.fraction[1]) * (hi - P);
      tax = main - mr;
      lines = [`${d.mainRate}\\% \\times ${P} = ${Number(main.toFixed(2))}`, `\\text{marginal relief} = \\frac{${d.fraction[0]}}{${d.fraction[1]}}(${hi} - ${P}) = ${Number(mr.toFixed(2))}`];
    }
    steps.push({ title: 'Corporation tax', formula: k > 1 ? `\\text{limits divided by } ${k}` : '', depth: 0, lines: [...lines, `\\text{tax} = ${Number(tax.toFixed(2))}, \\quad \\text{effective rate} = ${pct(P ? (100 * tax) / P : 0)}`] });
    return { country, total: formatMoney(tax, 'GBP'), effective: P ? Number(((100 * tax) / P).toFixed(3)) : 0, rule, steps, notes: ['UK: profits for a 12-month accounting period; augmented profits are taken equal to taxable profits.'], verified: true, result: tax };
  }
  if (country === 'us') {
    const rule = requireRule(US_RULES, 'us.corporate', on);
    const f = rule.data.federalRate / 100;
    const s = String(stateRate).trim() ? Number(stateRate) / 100 : 0;
    if (!(s >= 0 && s < 0.2)) throw new EngineError('Give the state rate as a percentage below 20.');
    const stateTax = P * s, fed = (P - stateTax) * f, tax = stateTax + fed;
    steps.push({ title: 'Federal and state', formula: 's + 21\\%(1 - s)', depth: 0, lines: [`\\text{state} = ${pct(100 * s)} \\times ${P} = ${Number(stateTax.toFixed(2))}`, `\\text{federal} = ${rule.data.federalRate}\\% \\times (${P} - ${Number(stateTax.toFixed(2))}) = ${Number(fed.toFixed(2))}`, `\\text{combined rate} = ${pct(100 * (s + f * (1 - s)))}`] });
    return { country, total: formatMoney(tax, 'USD'), effective: P ? Number(((100 * tax) / P).toFixed(3)) : 0, rule, steps, notes: ['US: state tax treated as deductible for federal tax; local taxes and credits are not included.'], verified: true, result: tax };
  }
  throw new EngineError('Pick India, the UK or the US.');
}
