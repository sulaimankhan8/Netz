/**
 * CAGR and real return: the maths for /cagr-calculator (catalog 10F).
 *   CAGR = (end/start)^{1/n} − 1;  real return = (1 + nominal)/(1 + inflation) − 1;  doubling time = ln 2/ln(1 + CAGR).
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney } from '../finance/money';

const pct = (v) => `${Number((v * 100).toFixed(4))}\\%`;
const r4 = (v) => Number(v.toFixed(4));

export function solve({ start, end, years, inflation = '' }) {
  const S = readAmount(start, 'The starting value', { positive: true }), E = readAmount(end, 'The final value', { positive: true });
  const n = readAmount(years, 'The number of years', { positive: true });
  const g = (E / S) ** (1 / n) - 1;
  const steps = [
    { title: 'CAGR', formula: '\\text{CAGR} = \\left(\\frac{\\text{end}}{\\text{start}}\\right)^{1/n} - 1', depth: 0, lines: [`\\left(\\frac{${E}}{${S}}\\right)^{1/${n}} - 1 = (${r4(E / S)})^{${r4(1 / n)}} - 1 = ${pct(g)}`] },
  ];
  const notes = [];
  if (g > 0) notes.push(`At this rate the money doubles every ${Number((Math.log(2) / Math.log(1 + g)).toFixed(2))} years.`);
  const absolute = E / S - 1;
  steps.push({ title: 'Compare: total (absolute) return', depth: 0, lines: [`\\frac{${E} - ${S}}{${S}} = ${pct(absolute)} \\text{ over } ${n} \\text{ years}`] });
  let real = null;
  if (String(inflation).trim()) {
    const f = readAmount(inflation, 'Inflation', { allowNegative: true }) / 100;
    if (f <= -1) throw new EngineError('Inflation must be above −100%.');
    real = (1 + g) / (1 + f) - 1;
    steps.push({ title: 'Real (inflation-adjusted) return', formula: '\\frac{1 + \\text{nominal}}{1 + \\text{inflation}} - 1', depth: 0, lines: [`\\frac{1 + ${r4(g)}}{1 + ${r4(f)}} - 1 = ${pct(real)}`] });
  }
  return { cagr: pct(g), real: real === null ? null : pct(real), absolute: pct(absolute), growth: `${formatMoney(S)} → ${formatMoney(E)}`, steps, notes, verified: true };
}
