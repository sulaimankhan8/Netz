/**
 * Bills of exchange and discounting: the maths for /bill-discounting (Unit 10).
 *   t = years from the discounting date to the legally due date (nominal due date + 3 days of grace), days/365.
 *   banker's discount  BD = F·r·t (simple interest on the face value)
 *   true discount      TD = F·r·t/(1 + rt)   (interest on the present worth P = F − TD)
 *   banker's gain      BG = BD − TD = TD·r·t;  the bank pays F − BD (the discounted value)
 * Interest rate r per year (as a %). Dates are read as YYYY-MM-DD.
 */
import { EngineError } from '../numeric/steps';
import { formatMoney } from '../finance/money';

const r2 = (v) => Math.round(v * 100) / 100;
const parseDate = (s, label) => { const m = String(s ?? '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (!m) throw new EngineError(`${label}: use the form YYYY-MM-DD.`); const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); if (Number.isNaN(d.getTime())) throw new EngineError(`${label} is not a real date.`); return d; };
const iso = (d) => d.toISOString().slice(0, 10);
const addMonths = (d, n) => { const r = new Date(d); const day = r.getUTCDate(); r.setUTCDate(1); r.setUTCMonth(r.getUTCMonth() + n); const last = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate(); r.setUTCDate(Math.min(day, last)); return r; };

export function solve({ mode = 'days', face, rate, days = '', drawn = '', months = '', discounted = '', grace = 'yes', currency = 'INR' }) {
  const F = Number(face), R = Number(rate);
  if (!(F > 0)) throw new EngineError('The face value must be a positive amount.');
  if (!(R > 0 && R < 100)) throw new EngineError('Give the rate as a percentage per year, e.g. 8.');
  const steps = [];
  let n;
  if (mode === 'dates') {
    const d0 = parseDate(drawn, 'The date drawn'), dd = parseDate(discounted, 'The date of discounting');
    const m = Math.round(Number(months));
    if (!(m >= 1 && m <= 60)) throw new EngineError('The term should be 1 to 60 months.');
    const nominal = addMonths(d0, m);
    const legal = new Date(nominal); if (grace === 'yes') legal.setUTCDate(legal.getUTCDate() + 3);
    n = Math.round((legal - dd) / 86400000);
    if (n <= 0) throw new EngineError('The bill is discounted on or after its due date.');
    steps.push({ title: 'Days to run', formula: '\\text{legally due} = \\text{nominal due} + 3 \\text{ days of grace}', depth: 0, lines: [`\\text{drawn } ${iso(d0)}, \\ \\text{term } ${m} \\text{ months} \\Rightarrow \\text{nominal due } ${iso(nominal)}`, grace === 'yes' ? `\\text{legally due } ${iso(legal)}` : '\\text{(no days of grace)}', `\\text{from } ${iso(dd)} \\text{ to } ${iso(legal)}: \\ ${n} \\text{ days}`] });
  } else {
    n = Math.round(Number(days));
    if (!(n > 0 && n <= 3650)) throw new EngineError('Give the number of days the bill still has to run.');
  }
  const t = n / 365, r = R / 100;
  const BD = F * r * t, TD = (F * r * t) / (1 + r * t), BG = BD - TD;
  const money = (v) => formatMoney(r2(v), currency);
  steps.push({ title: 'Time in years', depth: 0, lines: [`t = \\frac{${n}}{365}${n % 73 === 0 ? ` = \\frac{${n / 73}}{5}` : ''}`] });
  steps.push({ title: "Banker's discount", formula: 'BD = F\\,r\\,t', depth: 0, lines: [`BD = ${F} \\times ${R / 100} \\times \\frac{${n}}{365} = ${r2(BD)}`] });
  steps.push({ title: 'True discount', formula: 'TD = \\frac{F\\,r\\,t}{1 + rt}', depth: 0, lines: [`TD = \\frac{${r2(BD)}}{1 + ${Number((r * t).toPrecision(6))}} = ${r2(TD)}`, `\\text{present worth} = F - TD = ${r2(F - TD)}`] });
  steps.push({ title: "Banker's gain", formula: 'BG = BD - TD = TD\\cdot r\\,t', depth: 0, lines: [`BG = ${r2(BD)} - ${r2(TD)} = ${r2(BG)}`, `\\text{the bank pays } F - BD = ${r2(F - BD)}`] });
  return {
    days: n, bd: money(BD), td: money(TD), bg: money(BG), paid: money(F - BD), pw: money(F - TD), steps,
    notes: ['A 365-day year is used, as in Indian textbooks. Check whether your problem counts the 3 days of grace.'],
    verified: Math.abs(BG - TD * r * t) < 1e-6 * Math.max(1, BG), result: r2(BD),
  };
}
