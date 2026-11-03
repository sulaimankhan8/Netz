/**
 * Loan EMI: the maths for /emi-calculator.
 *   method 'reducing'  EMI = P·i·(1+i)^N / ((1+i)^N − 1), i = R/12/100, interest charged on what you still owe
 *   method 'flat'      interest = P·R·years/100 on the full loan for the whole term; EMI = (P + interest)/N
 * A one-time prepayment (reducing only) keeps the EMI and shortens the loan; the result says what it saves.
 */
import { EngineError } from '../numeric/steps';
import { n } from '../numeric/geometry';
import { readAmount, texMoney, texPct, formatMoney } from '../finance/money';

export const MAX_MONTHS = 600;

/** The reducing-balance EMI for a monthly rate i over N months. */
export function emiFor(P, i, N) {
  if (i === 0) return P / N;
  const f = (1 + i) ** N;
  return (P * i * f) / (f - 1);
}

/** Month-by-month schedule for a reducing-balance loan. prepay: { amount, month } or null. */
function schedule(P, i, N, emi, prepay) {
  const rows = [];
  let bal = P;
  for (let m = 1; bal > 0.005 && m <= MAX_MONTHS; m++) {
    const interest = bal * i;
    let pay = emi;
    if (bal + interest <= emi + 0.005) pay = bal + interest; // the last, smaller payment
    const principal = pay - interest;
    let closing = bal - principal;
    let extra = 0;
    if (prepay && m === prepay.month && closing > 0) {
      extra = Math.min(prepay.amount, closing);
      closing -= extra;
    }
    rows.push({ month: m, opening: bal, emi: pay, interest, principal, prepay: extra, closing: Math.max(0, closing) });
    bal = closing;
    if (m >= N && !prepay) break;
  }
  return rows;
}

/** Group a monthly schedule by year (months 1–12 = year 1, …). */
function byYear(rows) {
  const out = [];
  rows.forEach((r) => {
    const y = Math.ceil(r.month / 12);
    if (!out[y - 1]) out[y - 1] = { year: y, principal: 0, interest: 0, prepay: 0, closing: 0 };
    const o = out[y - 1];
    o.principal += r.principal;
    o.interest += r.interest;
    o.prepay += r.prepay;
    o.closing = r.closing;
  });
  return out;
}

const totals = (rows) => rows.reduce((t, r) => ({ paid: t.paid + r.emi + r.prepay, interest: t.interest + r.interest }), { paid: 0, interest: 0 });

/** The reducing annual rate (%) that gives the same EMI as a flat-rate loan (bisection on the monthly rate). */
export function equivalentReducingRate(P, N, emi) {
  if (emi * N <= P + 1e-9) return 0;
  let lo = 0, hi = 1; // monthly rate between 0% and 100%
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (emiFor(P, mid, N) < emi) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

export function solve({ principal, rate, tenure, tenureUnit = 'years', method = 'reducing', prepayAmount = '', prepayMonth = '', currency = 'INR' }) {
  const P = readAmount(principal, 'Loan amount', { positive: true });
  const R = readAmount(rate, 'Interest rate');
  if (R > 100) throw new EngineError('Use an interest rate of 100% a year or less.');
  const t = readAmount(tenure, 'Loan tenure', { positive: true });
  const N = Math.round(tenureUnit === 'months' ? t : t * 12);
  if (N < 1) throw new EngineError('The loan must last at least 1 month.');
  if (N > MAX_MONTHS) throw new EngineError(`Use a tenure of ${MAX_MONTHS} months (50 years) or less.`);
  if (Math.abs((tenureUnit === 'months' ? t : t * 12) - N) > 1e-9) throw new EngineError('The tenure must be a whole number of months.');
  const M = (x) => texMoney(x, currency);

  if (method === 'flat') {
    const years = N / 12;
    const interest = (P * R * years) / 100;
    const emi = (P + interest) / N;
    const rows = Array.from({ length: N }, (_, k) => ({
      month: k + 1, opening: P - (P / N) * k, emi, interest: interest / N, principal: P / N, prepay: 0, closing: P - (P / N) * (k + 1),
    }));
    const eq = equivalentReducingRate(P, N, emi);
    return {
      method, P, R, N, emi, totalInterest: interest, totalPaid: P + interest, rows, years: byYear(rows), equivalentRate: eq,
      lines: [
        `\\text{Interest} = \\frac{P \\times R \\times T}{100} = \\frac{${M(P)} \\times ${n(R)} \\times ${n(years)}}{100} = ${M(interest)}`,
        `EMI = \\frac{P + \\text{Interest}}{N} = \\frac{${M(P)} + ${M(interest)}}{${N}} = ${M(emi)}`,
        `\\text{Same EMI on a reducing balance} \\approx ${texPct(eq, 2)} \\text{ a year}`,
      ],
      notes: [`A flat rate charges interest on the full loan for the whole term, even after you have repaid part of it. This EMI equals a reducing-balance loan at about ${Number(eq.toFixed(2))}% a year.`],
      result: emi, steps: { headers: [], rows: [] }, plot: null,
    };
  }

  const i = R / 1200;
  const emi = emiFor(P, i, N);
  const plain = schedule(P, i, N, emi, null);
  const plainTotals = totals(plain);
  const lines = i === 0
    ? [`\\text{At 0\\% interest, } EMI = \\frac{P}{N} = \\frac{${M(P)}}{${N}} = ${M(emi)}`]
    : [
      'EMI = \\frac{P \\, i \\, (1 + i)^N}{(1 + i)^N - 1}, \\quad i = \\frac{R}{12 \\times 100}',
      `i = \\frac{${n(R)}}{1200} = ${n(i)}, \\quad N = ${N} \\text{ months}, \\quad (1 + i)^N = ${n((1 + i) ** N)}`,
      `EMI = \\frac{${M(P)} \\times ${n(i)} \\times ${n((1 + i) ** N)}}{${n((1 + i) ** N)} - 1} = ${M(emi)}`,
    ];
  lines.push(`\\text{Total paid} = ${M(emi)} \\times ${N} = ${M(plainTotals.paid)}, \\quad \\text{total interest} = ${M(plainTotals.interest)}`);

  const out = {
    method, P, R, N, emi, totalInterest: plainTotals.interest, totalPaid: plainTotals.paid,
    rows: plain, years: byYear(plain), lines, notes: [], result: emi, steps: { headers: [], rows: [] }, plot: null,
  };

  // Optional one-time prepayment
  if (String(prepayAmount ?? '').trim()) {
    const amount = readAmount(prepayAmount, 'Prepayment', { positive: true });
    const month = Math.round(readAmount(prepayMonth, 'Prepayment month', { positive: true }));
    if (month >= N) throw new EngineError(`Make the prepayment before the last month (month 1 to ${N - 1}).`);
    const rows = schedule(P, i, N, emi, { amount, month });
    const t2 = totals(rows);
    out.prepay = {
      amount: rows[month - 1].prepay, month, rows, years: byYear(rows),
      months: rows.length, monthsSaved: plain.length - rows.length,
      interest: t2.interest, interestSaved: plainTotals.interest - t2.interest,
    };
    out.notes.push(`Paying ${formatMoney(out.prepay.amount, currency)} extra after month ${month} keeps the EMI the same, finishes ${out.prepay.monthsSaved} month${out.prepay.monthsSaved === 1 ? '' : 's'} sooner and saves ${formatMoney(out.prepay.interestSaved, currency)} in interest.`);
  }
  return out;
}
