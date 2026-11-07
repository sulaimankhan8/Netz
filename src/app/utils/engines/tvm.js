/**
 * Time value of money: the maths for /time-value-of-money (catalog 10E).
 *   PV of an annuity   PV = PMT [1 − (1 + i)^{−n}]/i          (due: × (1 + i))
 *   FV of an annuity   FV = PMT [(1 + i)^n − 1]/i             (due: × (1 + i))
 *   perpetuity         PV = PMT/i;  growing: PMT/(i − g)
 *   sinking fund       PMT = FV · i/[(1 + i)^n − 1]
 *   bond price         P = C [1 − (1 + y)^{−n}]/y + F(1 + y)^{−n}   (per period coupon C, yield y)
 * i is the rate per period (yearly rate ÷ payments per year).
 */
import { EngineError } from '../numeric/steps';
import { readAmount, formatMoney, texMoney } from '../finance/money';

const r4 = (v) => Number(v.toFixed(4));

export function solve({ mode = 'pva', pmt = '', rate, n = '', freq = '1', due = 'no', fv = '', growth = '', face = '', coupon = '' }) {
  const m = Number(freq);
  if (![1, 2, 4, 12].includes(m)) throw new EngineError('Payments per year: 1, 2, 4 or 12.');
  const R = readAmount(rate, 'The interest rate', { allowNegative: false });
  const i = R / 100 / m;
  const M = (x) => texMoney(x, 'INR');
  const isDue = due === 'yes';
  const steps = [];
  const rows = [];
  const notes = [];
  let answer, value;
  const periods = () => { const y = readAmount(n, 'The number of years', { positive: true }); const N = Math.round(y * m); if (N < 1 || N > 1200) throw new EngineError('Use between 1 and 1200 payment periods.'); return N; };
  steps.push({ title: 'Rate per period', depth: 0, lines: [`i = \\frac{${R}\\%}{${m}} = ${r4(i)}`] });
  if (mode === 'pva' || mode === 'fva') {
    const P = readAmount(pmt, 'The payment', { positive: true });
    const N = periods();
    if (i === 0) value = P * N;
    else value = mode === 'pva' ? (P * (1 - (1 + i) ** -N)) / i : (P * ((1 + i) ** N - 1)) / i;
    if (isDue) value *= 1 + i;
    const f = mode === 'pva' ? 'PV = PMT \\cdot \\frac{1 - (1 + i)^{-n}}{i}' : 'FV = PMT \\cdot \\frac{(1 + i)^{n} - 1}{i}';
    steps.push({ title: `${mode === 'pva' ? 'Present' : 'Future'} value of an annuity${isDue ? ' due' : ''}`, formula: `${f}${isDue ? ' \\times (1 + i)' : ''}`, depth: 0, lines: [`${mode === 'pva' ? 'PV' : 'FV'} = ${M(P)} \\cdot \\frac{${mode === 'pva' ? `1 - (${r4(1 + i)})^{-${N}}` : `(${r4(1 + i)})^{${N}} - 1`}}{${r4(i)}}${isDue ? ` \\times ${r4(1 + i)}` : ''} = ${M(value)}`] });
    for (let t = 1; t <= Math.min(N, 40); t++) {
      const when = isDue ? t - 1 : t;
      const factor = mode === 'pva' ? (1 + i) ** -when : (1 + i) ** (N - when);
      rows.push({ t, pay: formatMoney(P), factor: r4(factor), worth: formatMoney(P * factor) });
    }
    answer = `${mode === 'pva' ? 'PV' : 'FV'} = ${formatMoney(value)}`;
    notes.push(isDue ? 'Annuity due: payments at the start of each period, so each earns one more period of interest.' : 'Ordinary annuity: payments at the end of each period.');
  } else if (mode === 'perpetuity') {
    const P = readAmount(pmt, 'The payment', { positive: true });
    const g = String(growth).trim() ? readAmount(growth, 'The growth rate', { allowNegative: true }) / 100 / m : 0;
    if (!(i > g)) throw new EngineError('The interest rate must be bigger than the growth rate, or the value is infinite.');
    value = P / (i - g);
    steps.push({ title: g ? 'Growing perpetuity' : 'Perpetuity', formula: g ? 'PV = \\frac{PMT}{i - g}' : 'PV = \\frac{PMT}{i}', depth: 0, lines: [`PV = \\frac{${M(P)}}{${r4(i)}${g ? ` - ${r4(g)}` : ''}} = ${M(value)}`] });
    answer = `PV = ${formatMoney(value)}`;
  } else if (mode === 'sinking') {
    const F = readAmount(fv, 'The target amount', { positive: true });
    const N = periods();
    value = i === 0 ? F / N : (F * i) / ((1 + i) ** N - 1);
    steps.push({ title: 'Sinking fund payment', formula: 'PMT = FV \\cdot \\frac{i}{(1 + i)^{n} - 1}', depth: 0, lines: [`PMT = ${M(F)} \\cdot \\frac{${r4(i)}}{(${r4(1 + i)})^{${N}} - 1} = ${M(value)}`] });
    let bal = 0;
    for (let t = 1; t <= Math.min(N, 40); t++) { const int = bal * i; bal += int + value; rows.push({ t, pay: formatMoney(value), factor: formatMoney(int), worth: formatMoney(bal) }); }
    answer = `PMT = ${formatMoney(value)} per period`;
  } else if (mode === 'bond') {
    const F = readAmount(face, 'The face value', { positive: true });
    const cr = readAmount(coupon, 'The coupon rate') / 100 / m;
    const N = periods();
    const C = F * cr;
    value = (i === 0 ? C * N : (C * (1 - (1 + i) ** -N)) / i) + F * (1 + i) ** -N;
    steps.push({ title: 'Bond price', formula: 'P = C \\cdot \\frac{1 - (1 + y)^{-n}}{y} + \\frac{F}{(1 + y)^{n}}', depth: 0, lines: [`C = ${M(F)} \\times ${r4(cr)} = ${M(C)}, \\quad n = ${N}`, `P = ${M(C)} \\cdot \\frac{1 - (${r4(1 + i)})^{-${N}}}{${r4(i)}} + \\frac{${M(F)}}{(${r4(1 + i)})^{${N}}} = ${M(value)}`] });
    answer = `Price = ${formatMoney(value)}`;
    notes.push(value > F + 1e-9 ? 'Coupon rate above the yield: the bond sells at a premium.' : value < F - 1e-9 ? 'Coupon rate below the yield: the bond sells at a discount.' : 'Coupon rate equals the yield: the bond sells at face value (par).');
  } else throw new EngineError('Choose what to work out.');
  return {
    // Plain text (KaTeX can't show ₹), shown as a sentence on the page
    mode, answer, value, steps, notes, verified: true, rows,
    columns: mode === 'sinking' ? [{ key: 't', label: 'Period', bold: true }, { key: 'pay', label: 'Deposit' }, { key: 'factor', label: 'Interest' }, { key: 'worth', label: 'Fund', highlight: true }]
      : [{ key: 't', label: 'Period', bold: true }, { key: 'pay', label: 'Payment' }, { key: 'factor', label: mode === 'pva' ? 'Discount factor' : 'Growth factor' }, { key: 'worth', label: mode === 'pva' ? 'Present value' : 'Value at the end', highlight: true }],
  };
}
