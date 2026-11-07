/**
 * Depreciation schedules: the maths for /depreciation-calculator (catalog 10G).
 *   straight line            D = (C − S)/n each year
 *   written-down value (WDV) Dₜ = r × book value;  r given, or r = 1 − (S/C)^{1/n} to end exactly at S
 *   sum of years' digits     Dₜ = (C − S) × (n − t + 1)/(n(n + 1)/2)
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';

const r4 = (v) => Number(v.toFixed(4));

export function solve({ method = 'sl', cost, salvage = '0', life, rate = '' }) {
  const C = readAmount(cost, 'The cost', { positive: true }), S = readAmount(salvage, 'The salvage value');
  const n = Math.round(readAmount(life, 'The useful life', { positive: true }));
  if (S >= C) throw new EngineError('The salvage value must be less than the cost.');
  if (n < 1 || n > 50) throw new EngineError('Use a life of 1 to 50 years.');
  const M = (x) => texMoney(x, 'INR');
  const rows = [];
  let book = C, acc = 0;
  const steps = [];
  let r = null;
  if (method === 'sl') {
    const d = (C - S) / n;
    steps.push({ title: 'Straight-line depreciation', formula: 'D = \\frac{C - S}{n}', depth: 0, lines: [`D = \\frac{${M(C)} - ${M(S)}}{${n}} = ${M(d)} \\text{ every year} \\ (${r4((d / C) * 100)}\\% \\text{ of cost})`] });
    for (let t = 1; t <= n; t++) { const open = book; book -= d; acc += d; rows.push({ t, open: formatMoney(open), dep: formatMoney(d), close: formatMoney(book), acc: formatMoney(acc) }); }
  } else if (method === 'wdv') {
    r = String(rate).trim() ? readAmount(rate, 'The rate') / 100 : 1 - (S / C) ** (1 / n);
    if (!(r > 0 && r < 1)) throw new EngineError('The WDV rate must be between 0% and 100%.');
    steps.push({ title: 'Written-down value', formula: String(rate).trim() ? 'D_t = r \\times \\text{book value}' : 'r = 1 - \\left(\\frac{S}{C}\\right)^{1/n}', depth: 0, lines: [String(rate).trim() ? `r = ${r4(r * 100)}\\%` : `r = 1 - \\left(\\frac{${M(S)}}{${M(C)}}\\right)^{1/${n}} = ${r4(r * 100)}\\%`] });
    for (let t = 1; t <= n; t++) { const open = book; const d = book * r; book -= d; acc += d; rows.push({ t, open: formatMoney(open), dep: formatMoney(d), close: formatMoney(book), acc: formatMoney(acc) }); }
  } else if (method === 'syd') {
    const sum = (n * (n + 1)) / 2;
    steps.push({ title: "Sum of years' digits", formula: 'D_t = (C - S) \\times \\frac{n - t + 1}{n(n + 1)/2}', depth: 0, lines: [`1 + 2 + \\cdots + ${n} = ${sum}, \\quad C - S = ${M(C - S)}`] });
    for (let t = 1; t <= n; t++) { const open = book; const d = ((C - S) * (n - t + 1)) / sum; book -= d; acc += d; rows.push({ t, open: formatMoney(open), dep: `${formatMoney(d)} (${n - t + 1}/${sum})`, close: formatMoney(book), acc: formatMoney(acc) }); }
  } else throw new EngineError('Choose a method.');
  steps.push({ title: 'End of life', depth: 0, lines: [`\\text{Book value after ${n} years} = ${M(book)}`] });
  return {
    method, rate: r === null ? null : `${r4(r * 100)}%`, final: formatMoney(book), rows,
    columns: [{ key: 't', label: 'Year', bold: true }, { key: 'open', label: 'Opening value' }, { key: 'dep', label: 'Depreciation', highlight: true }, { key: 'close', label: 'Closing value' }, { key: 'acc', label: 'Total so far' }],
    steps, notes: [method === 'sl' ? 'The same amount every year.' : method === 'wdv' ? 'A fixed percentage of a shrinking value: large at first, then smaller (never quite zero).' : 'Larger charges in the early years, falling by the same step each year.'], verified: true,
  };
}
