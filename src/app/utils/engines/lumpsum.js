/**
 * Lump sum investment: the maths for /lumpsum-calculator.
 *   F = P(1 + r/100)^T  (yearly compounding at the expected return r)
 *   With inflation f, today's value of F is F / (1 + f/100)^T, and the real return is (1 + r)/(1 + f) − 1.
 * Same result shape as fd.js.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney, texPct } from '../finance/money';

export function solve({ amount, rate, years, inflation = '', currency = 'INR' }) {
  const P = readAmount(amount, 'Amount invested', { positive: true });
  const R = readAmount(rate, 'Expected return', { allowNegative: true });
  if (R <= -100 || R > 100) throw new EngineError('Use an expected return between −100% and 100% a year.');
  const T = readAmount(years, 'Years', { positive: true });
  if (T > 100) throw new EngineError('Use 100 years or less.');
  const hasInf = String(inflation ?? '').trim() !== '';
  const f = hasInf ? readAmount(inflation, 'Inflation', { allowNegative: true }) : 0;
  if (f <= -100 || f > 100) throw new EngineError('Use an inflation rate between −100% and 100% a year.');
  const M = (x) => texMoney(x, currency);
  const g = 1 + R / 100;
  const F = P * g ** T;
  const lines = [
    'F = P\\left(1 + \\frac{r}{100}\\right)^{T}',
    `F = ${M(P)} \\times (${n(g, 8)})^{${n(T)}} = ${M(P)} \\times ${n(g ** T, 8)} = ${M(F)}`,
    `\\text{Gains} = F - P = ${M(F)} - ${M(P)} = ${M(F - P)}`,
  ];
  const notes = ['Returns are added once a year (yearly compounding), as most lump sum calculators assume.'];
  const stats = [
    { label: 'Expected value', value: F, strong: true },
    { label: 'Gains', value: F - P, strong: true },
    { label: 'Money grows', value: `${n(g ** T, 4)} times`, kind: 'text' },
  ];
  let real = null;
  if (hasInf) {
    const today = F / (1 + f / 100) ** T;
    real = ((g / (1 + f / 100)) - 1) * 100;
    lines.push(
      `\\text{In today's money: } \\frac{F}{(1 + ${n(f / 100, 6)})^{${n(T)}}} = \\frac{${M(F)}}{${n((1 + f / 100) ** T, 8)}} = ${M(today)}`,
      `\\text{Real return} = \\frac{1 + ${n(R / 100, 6)}}{1 + ${n(f / 100, 6)}} - 1 = ${texPct(real, 4)} \\text{ a year}`,
    );
    stats[2] = { label: 'Worth in today\'s money', value: today };
    notes.push(`With ${n(f)}% inflation, prices rise too: the real return is about r − f, a little less.`);
  }
  if (R > 0 && g ** T >= 2) {
    notes.push(`Rule of 72: at ${n(R)}% the money doubles about every ${n(72 / R, 3)} years (exactly ${n(Math.log(2) / Math.log(g), 4)}).`);
  }
  if (!Number.isInteger(T)) notes.push('For part of a year the same formula is used with a fractional power.');
  notes.push('Investment returns go up and down; this shows what a steady return would give, not a promise.');
  const nYears = Math.ceil(T - 1e-9);
  const rows = Array.from({ length: nYears }, (_, j) => {
    const t = Math.min(j + 1, T);
    const open = P * g ** Math.min(j, T);
    const close = P * g ** t;
    const row = { year: t, opening: open, interest: close - open, closing: close };
    if (hasInf) row.today = close / (1 + f / 100) ** t;
    return row;
  });
  return {
    result: F,
    real,
    stats,
    lines,
    notes,
    columns: [
      { key: 'year', label: 'Year', bold: true, kind: 'year' },
      { key: 'opening', label: 'Start of year' },
      { key: 'interest', label: 'Growth this year' },
      { key: 'closing', label: 'End of year', highlight: true },
      ...(hasInf ? [{ key: 'today', label: 'In today\'s money' }] : []),
    ],
    rows,
    bars: { series: ['Invested', 'Gains'], rows: rows.map((x) => ({ label: String(Number(x.year.toFixed(2))), parts: [P, Math.max(0, x.closing - P)] })) },
  };
}
