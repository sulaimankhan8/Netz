/**
 * India income tax for a resident individual, new vs old regime: the maths for /income-tax-calculator.
 * Rates come from src/app/data/rates/in.js ('in.incometax'), one rule per year.
 * For each regime:
 *   1. Gross income = salary + other income
 *   2. Taxable income = gross − standard deduction (salaried only) − deductions (old regime only), rounded to ₹10
 *   3. Slab tax, slab by slab
 *   4. Rebate (section 87A): no tax up to the limit; in the new regime, marginal relief just above it
 *      (the tax can't be more than the income above the limit)
 *   5. Surcharge on high incomes (new regime capped at 25%), with marginal relief at each threshold
 *   6. Health and education cess 4% on tax + surcharge
 * Not covered: special-rate income (capital gains, lottery), agricultural income, non-residents.
 */
import { EngineError } from '../numeric/steps';
import { readAmount, texMoney } from '../finance/money';
import { IN_RULES } from '../../data/rates/in';
import { requireRule } from '../rates/getRule';

export const incomeTaxRule = (date) => requireRule(IN_RULES, 'in.incometax', date);

const M = (x) => texMoney(x, 'INR');
const opt = (v, where) => (String(v ?? '').trim() ? readAmount(v, where) : 0);
const roundTo10 = (x) => Math.round(x / 10) * 10;

/** Tax on `income` from slabs [[from, to, rate]], with one row per slab that is used. */
export function slabTax(income, slabs) {
  let tax = 0;
  const rows = [];
  for (const [from, to, rate] of slabs) {
    if (income <= from) break;
    const inSlab = Math.min(income, to ?? Infinity) - from;
    const t = (inSlab * rate) / 100;
    tax += t;
    rows.push({ from, to, rate, inSlab, tax: t });
  }
  return { tax, rows };
}

/** Surcharge rate for a taxable income: the highest threshold below it. */
function surchargeBand(income, table, cap) {
  let band = null;
  for (const [threshold, rate] of table) if (income > threshold) band = { threshold, rate: Math.min(rate, cap ?? rate) };
  return band;
}

/** Tax (after rebate) plus surcharge, with marginal relief at the surcharge threshold. */
function withSurcharge(taxable, taxOf, table, cap) {
  const tax = taxOf(taxable);
  const band = surchargeBand(taxable, table, cap);
  if (!band || band.rate === 0) return { tax, surcharge: 0, band: null, relief: 0 };
  const sc = (tax * band.rate) / 100;
  // At the threshold itself the lower band applies
  const atT = taxOf(band.threshold);
  const lower = surchargeBand(band.threshold, table, cap);
  const limit = atT * (1 + (lower ? lower.rate : 0) / 100) + (taxable - band.threshold);
  const relief = Math.max(0, tax + sc - limit);
  return { tax, surcharge: sc - relief, band, relief, grossSurcharge: sc };
}

function regime(kind, rule, { salary, other, salaried, age, d }) {
  const R = rule.data[kind];
  const gross = salary + other;
  const std = salaried ? Math.min(salary, R.standardDeduction) : 0;
  let deductions = 0;
  const dedLines = [];
  if (kind === 'old') {
    const c = R.caps;
    const parts = [
      ['80C', d.sec80C, c.sec80C],
      ['80D', d.sec80D, null],
      ['home loan interest', d.homeLoan, c.homeLoanInterest],
      ['NPS 80CCD(1B)', d.nps, c.nps80CCD1B],
      ['HRA and others', d.others, null],
    ].filter((p) => p[1] > 0).map(([label, v, cap]) => ({ label, v: cap == null ? v : Math.min(v, cap), capped: cap != null && v > cap }));
    deductions = parts.reduce((s, p) => s + p.v, 0);
    if (parts.length) {
      const items = parts.map((p) => `${M(p.v)} & \\text{${p.label}${p.capped ? ' (the limit)' : ''}}`).join(' \\\\ ');
      dedLines.push(`\\text{Deductions:} \\quad \\begin{array}{rl} ${items} \\\\ \\hline ${M(deductions)} & \\text{total} \\end{array}`);
    }
  }
  const before = Math.max(0, gross - std - deductions);
  const taxable = roundTo10(before);
  const slabs = kind === 'new' ? R.slabs : R.slabs[age] ?? R.slabs.below60;
  const { tax: slab, rows } = slabTax(taxable, slabs);

  // Tax after the 87A rebate (with marginal relief in the new regime), as a function of income for surcharge relief
  const reb = R.rebate;
  const afterRebate = (inc) => {
    const t = slabTax(inc, slabs).tax;
    if (inc <= reb.limit) return Math.max(0, t - Math.min(t, reb.max));
    if (reb.marginalRelief && t > inc - reb.limit) return inc - reb.limit;
    return t;
  };
  const taxAfter = afterRebate(taxable);
  const rebate = taxable <= reb.limit ? Math.min(slab, reb.max) : 0;
  const marginal = taxable > reb.limit && reb.marginalRelief && slab > taxable - reb.limit ? slab - (taxable - reb.limit) : 0;
  const s = withSurcharge(taxable, afterRebate, rule.data.surcharge, kind === 'new' ? R.surchargeCap : null);
  const cess = ((taxAfter + s.surcharge) * rule.data.cess) / 100;
  const total = Math.round(taxAfter + s.surcharge + cess);

  const lines = [
    `\\text{Gross income} = ${M(salary)} + ${M(other)} = ${M(gross)}`,
    salaried ? `\\text{Standard deduction} = ${M(std)}` : '\\text{No standard deduction (no salary or pension)}',
    ...dedLines,
    `\\text{Taxable income} = ${M(gross)} - ${M(std)}${deductions ? ` - ${M(deductions)}` : ''} = ${M(before)}${taxable !== before ? ` \\approx ${M(taxable)}` : ''}`,
    `\\text{Tax on slabs} = ${rows.filter((r) => r.tax > 0).map((r) => M(r.tax)).join(' + ') || '0'} = ${M(slab)}`,
  ];
  if (rebate > 0) lines.push(`\\text{Rebate (87A): income} \\le ${M(reb.limit)}, \\text{ so } ${M(rebate)} \\text{ is taken off} \\Rightarrow ${M(taxAfter)}`);
  if (marginal > 0) lines.push(`\\text{Marginal relief: tax can't exceed income above } ${M(reb.limit)}: \\ ${M(taxable)} - ${M(reb.limit)} = ${M(taxAfter)}`);
  if (s.band) {
    lines.push(`\\text{Surcharge } ${s.band.rate}\\% \\text{ (income over } ${M(s.band.threshold)}) = ${M(taxAfter)} \\times ${s.band.rate}\\% = ${M(s.grossSurcharge)}`);
    if (s.relief > 0) lines.push(`\\text{Marginal relief on surcharge} = ${M(s.relief)} \\Rightarrow \\text{surcharge } ${M(s.surcharge)}`);
  }
  lines.push(
    `\\text{Cess} = ${s.surcharge ? `(${M(taxAfter)} + ${M(s.surcharge)})` : M(taxAfter)} \\times ${rule.data.cess}\\% = ${M(cess)}`,
    `\\text{Total tax} = ${M(taxAfter)}${s.surcharge ? ` + ${M(s.surcharge)}` : ''} + ${M(cess)} = ${M(total)}`,
  );
  return {
    kind, gross, std, deductions, taxable, slab, rebate, marginal, taxAfter, surcharge: s.surcharge,
    surchargeRate: s.band?.rate ?? 0, cess, total, rows, lines,
    effective: gross > 0 ? (total / gross) * 100 : 0,
    monthly: total / 12,
  };
}

export function solve({ salary, other, salaried = 'yes', age = 'below60', sec80C, sec80D, homeLoan, nps, others, rule = incomeTaxRule() }) {
  const s = opt(salary, 'Salary or pension');
  const o = opt(other, 'Other income');
  if (s + o <= 0) throw new EngineError('Enter your yearly salary or other income.');
  if (s + o > 1e10) throw new EngineError('Use an income under ₹1,000 crore.');
  if (!['below60', 'senior', 'superSenior'].includes(age)) throw new EngineError('Choose an age group.');
  const d = {
    sec80C: opt(sec80C, '80C'), sec80D: opt(sec80D, '80D'), homeLoan: opt(homeLoan, 'Home loan interest'),
    nps: opt(nps, 'NPS'), others: opt(others, 'Other deductions'),
  };
  const input = { salary: s, other: o, salaried: salaried === 'yes' && s > 0, age, d };
  const nw = regime('new', rule, input);
  const old = regime('old', rule, input);
  const better = nw.total < old.total ? 'new' : old.total < nw.total ? 'old' : 'same';
  const notes = [
    'Taxable income is rounded to the nearest ₹10 (section 288A).',
    'The new regime is the default; salaried people can choose the old regime each year when filing.',
  ];
  if (Object.values(d).some((v) => v > 0)) notes.push('Deductions such as 80C, 80D, home loan interest and HRA count only in the old regime.');
  if (age !== 'below60') notes.push('In the new regime the slabs are the same at every age; age only changes the old-regime slabs.');
  return { result: Math.min(nw.total, old.total), new: nw, old, better, saving: Math.abs(nw.total - old.total), notes };
}
