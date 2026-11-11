/**
 * Code export for the Unit 10 finance pages (percentages, interest, EMI, FD, RD, SIP, lump sum, time value
 * of money, NPV and IRR, CAGR, depreciation) and the Unit 7 algebra pages (quadratic equation, systems,
 * AP and GP, permutations and combinations, sets and relations). `raw` is what the page passes to its
 * engine; each page's engine checks the inputs first, so the export accepts what the page accepts.
 */

import { parseNumber } from '../numeric/fraction.js';
import { solve as percentSolve } from '../engines/percentage.js';
import { solve as interestSolve } from '../engines/compound-interest.js';
import { solve as emiSolve } from '../engines/emi.js';
import { solve as fdSolve } from '../engines/fd.js';
import { solve as rdSolve } from '../engines/rd.js';
import { solve as sipSolve } from '../engines/sip.js';
import { solve as lumpSolve } from '../engines/lumpsum.js';
import { solve as tvmSolve } from '../engines/tvm.js';
import { solve as npvSolve } from '../engines/npv-irr.js';
import { solve as cagrSolve } from '../engines/cagr.js';
import { solve as depSolve } from '../engines/depreciation.js';
import { solve as quadSolve } from '../engines/quadratic.js';
import { solve as systemSolve } from '../engines/system-of-equations.js';
import { solve as progSolve } from '../engines/progressions.js';
import { solve as permSolve } from '../engines/permutations-combinations.js';
import { solve as setSolve } from '../engines/set-operations.js';
import { D, S, FOR, WHILE, IF, P, C, BREAK, num, int, lit, choice, ExportError, determinant } from './kit.js';

/* ---------------- helpers ---------------- */

function check(solve, raw) {
  try {
    return solve(raw);
  } catch (e) {
    throw new ExportError(e?.message || 'Please check the inputs.');
  }
}

/** A money or plain amount as typed (commas, ₹ and $ allowed). */
const amt = (v, fallback = null) => {
  const s = String(v ?? '').replace(/[₹$,\s]/g, '').replace('%', '');
  if (!s) return fallback;
  const x = parseNumber(s);
  return Number.isFinite(x) ? x : fallback;
};

const money = (e) => num(e, 2);

/* ---------------- finance ---------------- */

export const EXPORTS = {
  percentage: {
    name: 'Percentage calculator',
    clean: (raw) => {
      check(percentSolve, raw);
      const v = raw.values || {};
      const mode = raw.mode;
      if (mode === 'discount') return { mode, mp: amt(v.mp), ds: String(v.discounts ?? '').split(/[,;\s]+/).filter(Boolean).map((d) => amt(d)) };
      const keys = { of: ['x', 'y'], 'what-percent': ['a', 'b'], change: ['from', 'to'], 'profit-loss': ['cp', 'sp'], 'markup-margin': ['cost', 'price'] }[mode];
      return { mode, v: Object.fromEntries(keys.map((k) => [k, amt(v[k])])) };
    },
    program: (p) => {
      if (p.mode === 'discount') {
        return {
          title: 'Successive discounts',
          about: ['Each discount is taken off the price left after the one before'],
          body: [
            D('mp', 'num', lit(p.mp)),
            D('ds', 'vec', { vec: p.ds }),
            D('price', 'num', 'mp'),
            FOR('i', 0, String(p.ds.length), [
              D('off', 'num', 'price * ds[i] / 100'),
              S('price', 'price - off'),
              P('Discount ', int('i + 1'), ' (', num('ds[i]', 2), '%): ', money('off'), ' off, price now ', money('price')),
            ]),
            P('Selling price = ', money('price')),
            P('Single equivalent discount = ', num('(mp - price) / mp * 100', 4), '%'),
          ],
        };
      }
      const v = p.v;
      const decl = Object.entries(v).map(([k, x]) => D(k === 'from' ? 'old' : k === 'to' ? 'nw' : k, 'num', lit(x)));
      const body = {
        of: [P(`${lit(v.x)}% of ${lit(v.y)} = `, num('x / 100 * y', 4))],
        'what-percent': [P(`${lit(v.a)} is `, num('a / b * 100', 4), `% of ${lit(v.b)}`)],
        change: [D('pct', 'num', '(nw - old) / abs(old) * 100'), IF('pct >= 0', [P('Increase of ', num('pct', 4), '%')], [P('Decrease of ', num('-pct', 4), '%')])],
        'profit-loss': [D('diff', 'num', 'sp - cp'),
          IF('diff > 0', [P('Profit = ', money('diff'), ' (', num('diff / cp * 100', 4), '%)')],
            [IF('diff < 0', [P('Loss = ', money('-diff'), ' (', num('-diff / cp * 100', 4), '%)')], [P('No profit, no loss')])])],
        'markup-margin': [D('gain', 'num', 'price - cost'), P('Markup = gain / cost = ', num('gain / cost * 100', 4), '%'), P('Margin = gain / price = ', num('gain / price * 100', 4), '%')],
      }[p.mode];
      return { title: `Percentage: ${p.mode.replace('-', ' ')}`, body: [...decl, ...body] };
    },
  },

  'compound-interest': {
    name: 'Simple and compound interest',
    clean: (raw) => {
      check(interestSolve, raw);
      const T = raw.timeUnit === 'months' ? amt(raw.time) / 12 : amt(raw.time);
      return { kind: raw.kind === 'simple' ? 'simple' : 'compound', P: amt(raw.principal), R: amt(raw.rate), T, freq: String(raw.frequency ?? '1') };
    },
    program: (p) => {
      if (p.kind === 'simple') {
        return {
          title: 'Simple interest',
          about: ['SI = P R T / 100, A = P + SI'],
          body: [D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('T', 'num', lit(p.T)),
            D('si', 'num', 'P * R * T / 100'), P('Simple interest = ', money('si')), P('Amount = ', money('P + si'))],
        };
      }
      if (p.freq === 'continuous') {
        return {
          title: 'Continuous compounding',
          about: ['A = P e^(R T / 100)'],
          body: [D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('T', 'num', lit(p.T)),
            D('A', 'num', 'P * exp(R / 100 * T)'), P('Amount = ', money('A')), P('Compound interest = ', money('A - P')),
            P('Effective annual rate = ', num('(exp(R / 100) - 1) * 100', 4), '%')],
        };
      }
      return {
        title: 'Compound interest',
        about: ['A = P (1 + i)^whole periods * (1 + i * part period), i = R / (100 k) (NCERT: a part period earns simple interest)'],
        body: [
          D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('T', 'num', lit(p.T)), D('k', 'num', lit(Number(p.freq))),
          D('i', 'num', 'R / (100 * k)'),
          D('periods', 'num', 'k * T'),
          D('whole', 'num', 'floor(periods + 1e-9)'),
          D('part', 'num', 'max(0, periods - whole)'),
          D('A', 'num', 'P * pow(1 + i, whole) * (1 + i * part)'),
          P('Amount = ', money('A')),
          P('Compound interest = ', money('A - P')),
          P('Effective annual rate = ', num('(pow(1 + i, k) - 1) * 100', 4), '%'),
        ],
      };
    },
  },

  emi: {
    name: 'EMI calculator',
    clean: (raw) => {
      check(emiSolve, raw);
      const t = amt(raw.tenure);
      const N = Math.round(raw.tenureUnit === 'months' ? t : t * 12);
      const pa = raw.method === 'reducing' ? amt(raw.prepayAmount) : null;
      return { flat: raw.method === 'flat', P: amt(raw.principal), R: amt(raw.rate), N, prepay: pa ? { amount: pa, month: Math.round(amt(raw.prepayMonth, 0)) } : null };
    },
    program: (p) => {
      if (p.flat) {
        return {
          title: 'Flat-rate EMI',
          about: ['Interest = P R (N / 12) / 100 on the full loan; EMI = (P + interest) / N'],
          body: [D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('N', 'num', String(p.N)),
            D('interest', 'num', 'P * R * N / 12 / 100'), P('EMI = ', money('(P + interest) / N')), P('Total interest = ', money('interest')), P('Total paid = ', money('P + interest'))],
        };
      }
      return {
        title: 'EMI on a reducing balance',
        about: ['EMI = P i (1 + i)^N / ((1 + i)^N - 1), i = R / 1200', ...(p.prepay ? ['A part prepayment shortens the loan; the EMI stays the same'] : [])],
        body: [
          D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('N', 'int', String(p.N)),
          D('i', 'num', 'R / 1200'),
          D('emi', 'num', 'P / N'),
          IF('i > 0', [S('emi', 'P * i * pow(1 + i, N) / (pow(1 + i, N) - 1)')]),
          P('EMI = ', money('emi')),
          D('bal', 'num', 'P'), D('paid', 'num', '0'), D('totalInterest', 'num', '0'),
          D('m', 'int', '0'),
          WHILE(`bal > 0.005 and m < 600${p.prepay ? '' : ' and m < N'}`, [
            S('m', 'm + 1'),
            D('interest', 'num', 'bal * i'),
            D('pay', 'num', 'emi'),
            IF('bal + interest <= emi + 0.005', [S('pay', 'bal + interest')]),
            S('bal', 'bal - (pay - interest)'),
            S('paid', 'paid + pay'),
            S('totalInterest', 'totalInterest + interest'),
            ...(p.prepay ? [IF(`m == ${p.prepay.month} and bal > 0`, [D('extra', 'num', `min(${lit(p.prepay.amount)}, bal)`), S('bal', 'bal - extra'), S('paid', 'paid + extra')])] : []),
          ]),
          P('Months to repay = ', int('m')),
          P('Total interest = ', money('totalInterest')),
          P('Total paid = ', money('paid')),
        ],
      };
    },
  },

  fd: {
    name: 'FD calculator',
    clean: (raw) => {
      check(fdSolve, raw);
      const T = amt(raw.years, 0) + amt(raw.months, 0) / 12 + amt(raw.days, 0) / 365;
      return { P: amt(raw.principal), R: amt(raw.rate), T, k: Number(raw.frequency || 4), payout: choice(raw.payout, ['cumulative', 'monthly', 'quarterly']) };
    },
    program: (p) => (p.payout === 'cumulative' ? {
      title: 'Fixed deposit (cumulative)',
      about: ['A = P (1 + i)^whole periods * (1 + i * part period), i = R / (100 k)'],
      body: [D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('T', 'num', lit(p.T)), D('k', 'num', lit(p.k)),
        D('i', 'num', 'R / (100 * k)'), D('periods', 'num', 'k * T'), D('whole', 'num', 'floor(periods + 1e-9)'),
        D('A', 'num', 'P * pow(1 + i, whole) * (1 + i * max(0, periods - whole))'),
        P('Maturity amount = ', money('A')), P('Interest earned = ', money('A - P'))],
    } : {
      title: `Fixed deposit (interest paid out ${p.payout})`,
      about: ['The interest is paid out, so it does not compound: each payout = P R / (100 k)'],
      body: [D('P', 'num', lit(p.P)), D('R', 'num', lit(p.R)), D('T', 'num', lit(p.T)), D('k', 'num', p.payout === 'monthly' ? '12' : '4'),
        P(`Interest every ${p.payout === 'monthly' ? 'month' : 'quarter'} = `, money('P * R / (100 * k)')), P('Total interest = ', money('P * R * T / 100')), P('Amount at the end = ', money('P + P * R * T / 100'))],
    }),
  },

  rd: {
    name: 'RD calculator',
    clean: (raw) => {
      check(rdSolve, raw);
      return { R: amt(raw.instalment), r: amt(raw.rate), N: Math.round(amt(raw.years, 0) * 12 + amt(raw.months, 0)) };
    },
    program: (p) => ({
      title: 'Recurring deposit',
      about: ['Each monthly instalment grows with quarterly compounding: R (1 + r/400)^(months left / 3)'],
      body: [
        D('R', 'num', lit(p.R)), D('i', 'num', `${lit(p.r)} / 400`), D('N', 'int', String(p.N)),
        D('value', 'num', '0'),
        FOR('k', 1, 'N + 1', [S('value', 'value + R * pow(1 + i, (N - k + 1) / 3)')]),
        P('Maturity amount = ', money('value')),
        P('Total paid in = ', money('R * N')),
        P('Interest earned = ', money('value - R * N')),
      ],
    }),
  },

  sip: {
    name: 'SIP calculator',
    clean: (raw) => {
      check(sipSolve, raw);
      return { P: amt(raw.monthly), R: amt(raw.rate), N: Math.round(amt(raw.years) * 12), s: amt(raw.stepUp, 0) };
    },
    program: (p) => ({
      title: `SIP (monthly investment${p.s ? ' with a yearly step-up' : ''})`,
      about: ['Each month: value = (value + instalment) (1 + R / 1200)', ...(p.s ? ['The instalment grows by the step-up % every 12 months'] : [])],
      body: [
        D('amount', 'num', lit(p.P)), D('i', 'num', `${lit(p.R)} / 1200`), D('N', 'int', String(p.N)), D('s', 'num', lit(p.s)),
        D('bal', 'num', '0'), D('invested', 'num', '0'),
        FOR('m', 1, 'N + 1', [
          IF('m > 1 and (m - 1) % 12 == 0', [S('amount', 'amount * (1 + s / 100)')]),
          S('bal', '(bal + amount) * (1 + i)'),
          S('invested', 'invested + amount'),
          IF('m % 12 == 0', [P('Year ', int('int(m / 12)', 2), ': invested ', money('invested'), ', value ', money('bal'))]),
        ]),
        P('Expected value = ', money('bal')),
        P('Total invested = ', money('invested')),
        P('Gains = ', money('bal - invested')),
      ],
    }),
  },

  lumpsum: {
    name: 'Lump sum calculator',
    clean: (raw) => {
      check(lumpSolve, raw);
      return { P: amt(raw.amount), R: amt(raw.rate), T: amt(raw.years), f: amt(raw.inflation) };
    },
    program: (p) => ({
      title: 'Lump sum investment',
      about: ['F = P (1 + R/100)^T (yearly compounding)', ...(p.f === null ? [] : ["In today's money: F / (1 + inflation/100)^T"])],
      body: [
        D('P', 'num', lit(p.P)), D('g', 'num', `1 + ${lit(p.R)} / 100`), D('T', 'num', lit(p.T)),
        D('F', 'num', 'P * pow(g, T)'),
        P('Expected value = ', money('F')),
        P('Gains = ', money('F - P')),
        ...(p.f === null ? [] : [
          D('inf', 'num', `1 + ${lit(p.f)} / 100`),
          P("Value in today's money = ", money('F / pow(inf, T)')),
          P('Real return = ', num('(g / inf - 1) * 100', 4), '% a year'),
        ]),
      ],
    }),
  },

  tvm: {
    name: 'Time value of money',
    clean: (raw) => {
      check(tvmSolve, raw);
      const mode = choice(raw.mode, ['pva', 'fva', 'perpetuity', 'sinking', 'bond']);
      const m = Number(raw.freq || 1);
      const out = { mode, m, R: amt(raw.rate), due: raw.due === 'yes' };
      if (mode !== 'perpetuity') out.N = Math.round(amt(raw.n) * m);
      if (['pva', 'fva', 'perpetuity'].includes(mode)) out.pmt = amt(raw.pmt);
      if (mode === 'perpetuity') out.g = amt(raw.growth, 0);
      if (mode === 'sinking') out.fv = amt(raw.fv);
      if (mode === 'bond') { out.face = amt(raw.face); out.coupon = amt(raw.coupon); }
      return out;
    },
    program: (p) => {
      const base = [D('i', 'num', `${lit(p.R)} / 100 / ${p.m}`), ...(p.N ? [D('N', 'num', String(p.N))] : [])];
      const body = {
        pva: [D('P', 'num', lit(p.pmt)), D('v', 'num', 'P * N'), IF('i > 0', [S('v', 'P * (1 - pow(1 + i, -N)) / i')]), ...(p.due ? [S('v', 'v * (1 + i)')] : []), P('Present value = ', money('v'))],
        fva: [D('P', 'num', lit(p.pmt)), D('v', 'num', 'P * N'), IF('i > 0', [S('v', 'P * (pow(1 + i, N) - 1) / i')]), ...(p.due ? [S('v', 'v * (1 + i)')] : []), P('Future value = ', money('v'))],
        perpetuity: [D('P', 'num', lit(p.pmt)), D('g', 'num', `${lit(p.g ?? 0)} / 100 / ${p.m}`), P('Present value = P / (i - g) = ', money('P / (i - g)'))],
        sinking: [D('F', 'num', lit(p.fv)), D('pmt', 'num', 'F / N'), IF('i > 0', [S('pmt', 'F * i / (pow(1 + i, N) - 1)')]), P('Deposit each period = ', money('pmt'))],
        bond: [D('Fc', 'num', lit(p.face)), D('Cp', 'num', `Fc * ${lit(p.coupon)} / 100 / ${p.m}`), D('price', 'num', 'Cp * N'), IF('i > 0', [S('price', 'Cp * (1 - pow(1 + i, -N)) / i')]),
          S('price', 'price + Fc * pow(1 + i, -N)'), P('Bond price = ', money('price'))],
      }[p.mode];
      return { title: `Time value of money: ${{ pva: 'present value of an annuity', fva: 'future value of an annuity', perpetuity: 'perpetuity', sinking: 'sinking fund', bond: 'bond price' }[p.mode]}`, about: [`i = rate / ${p.m} per period${p.due ? '; payments at the start of each period (annuity due)' : ''}`], body: [...base, ...body] };
    },
  },

  'npv-irr': {
    name: 'NPV and IRR',
    clean: (raw) => {
      check(npvSolve, raw);
      return { cf: String(raw.flows ?? '').split(/[,;\s]+/).filter(Boolean).map((s) => Number(s.replace(/[₹$,]/g, ''))), r: Number(String(raw.rate).replace('%', '')) / 100 };
    },
    program: (p) => ({
      title: 'Net present value and internal rate of return',
      about: ['NPV = sum of CF_t / (1 + r)^t; IRR is the r with NPV = 0, found by Newton\'s method from 10%'],
      body: [
        D('n', 'int', String(p.cf.length)),
        D('cf', 'vec', { vec: p.cf }),
        D('r', 'num', lit(p.r)),
        D('npv', 'num', '0'), D('cum', 'num', '0'), D('payback', 'num', '-1'),
        FOR('t', 0, 'n', [
          S('npv', 'npv + cf[t] / pow(1 + r, t)'),
          D('prev', 'num', 'cum'),
          S('cum', 'cum + cf[t]'),
          IF('payback < 0 and t > 0 and prev < 0 and cum >= 0', [S('payback', 't - 1 - prev / cf[t]')]),
        ]),
        P('NPV at ', num('r * 100', 2), '% = ', money('npv')),
        IF('npv >= 0', [P('NPV >= 0: accept the project.')], [P('NPV < 0: reject the project.')]),
        IF('payback >= 0', [P('Payback period = ', num('payback', 4), ' years')]),
        D('x', 'num', '0.1'), D('found', 'bool', 'false'),
        FOR('k', 0, 50, [
          D('f', 'num', '0'), D('df', 'num', '0'),
          FOR('t', 0, 'n', [S('f', 'f + cf[t] / pow(1 + x, t)'), S('df', 'df - t * cf[t] / pow(1 + x, t + 1)')]),
          IF('abs(f) < 1e-7', [S('found', 'true'), BREAK]),
          IF('df == 0', [BREAK]),
          D('nx', 'num', 'x - f / df'),
          IF('nx <= -0.99', [BREAK]),
          S('x', 'nx'),
        ]),
        IF('found', [P('IRR = ', num('x * 100', 4), '%')], [P('No IRR found from a 10% start.')]),
      ],
    }),
  },

  cagr: {
    name: 'CAGR calculator',
    clean: (raw) => {
      check(cagrSolve, raw);
      return { S0: amt(raw.start), E: amt(raw.end), n: amt(raw.years), f: amt(raw.inflation) };
    },
    program: (p) => ({
      title: 'Compound annual growth rate',
      about: ['CAGR = (final / start)^(1 / years) - 1'],
      body: [
        D('S0', 'num', lit(p.S0)), D('E', 'num', lit(p.E)), D('n', 'num', lit(p.n)),
        D('g', 'num', 'pow(E / S0, 1 / n) - 1'),
        P('CAGR = ', num('g * 100', 4), '%'),
        P('Absolute return = ', num('(E / S0 - 1) * 100', 4), '%'),
        ...(p.f === null ? [] : [P('Real CAGR (after inflation) = ', num(`((1 + g) / (1 + ${lit(p.f)} / 100) - 1) * 100`, 4), '%')]),
      ],
    }),
  },

  depreciation: {
    name: 'Depreciation',
    clean: (raw) => {
      check(depSolve, raw);
      return { method: choice(raw.method, ['sl', 'wdv', 'syd']), C: amt(raw.cost), S0: amt(raw.salvage, 0), n: Math.round(amt(raw.life)), rate: amt(raw.rate) };
    },
    program: (p) => ({
      title: `Depreciation: ${{ sl: 'straight line', wdv: 'written-down value', syd: "sum of the years' digits" }[p.method]}`,
      about: [{ sl: 'Each year: (cost - salvage) / life', wdv: 'Each year: rate x the value at the start of the year', syd: 'Year t: (cost - salvage) (n - t + 1) / (n (n + 1) / 2)' }[p.method]],
      body: [
        D('C', 'num', lit(p.C)), D('S0', 'num', lit(p.S0)), D('n', 'int', String(p.n)),
        D('book', 'num', 'C'),
        ...(p.method === 'wdv' ? [D('r', 'num', p.rate === null ? '1 - pow(S0 / C, 1 / n)' : `${lit(p.rate)} / 100`), P('Rate = ', num('r * 100', 4), '%')] : []),
        FOR('t', 1, 'n + 1', [
          D('d', 'num', { sl: '(C - S0) / n', wdv: 'book * r', syd: '(C - S0) * (n - t + 1) / (n * (n + 1) / 2)' }[p.method]),
          S('book', 'book - d'),
          P('Year ', int('t', 2), ': depreciation ', money('d'), ', value at the end ', money('book')),
        ]),
      ],
    }),
  },

  /* ---------------- algebra ---------------- */

  quadratic: {
    name: 'Quadratic equation',
    clean: (raw) => {
      check(quadSolve, raw);
      return { a: amt(raw.a), b: amt(raw.b), c: amt(raw.c) };
    },
    program: (p) => ({
      title: 'Quadratic equation a x^2 + b x + c = 0',
      about: ['x = (-b +/- sqrt(D)) / 2a with the discriminant D = b^2 - 4ac'],
      body: [
        D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('c', 'num', lit(p.c)),
        D('Dc', 'num', 'b * b - 4 * a * c'),
        P('D = ', num('Dc', 6)),
        IF('Dc > 1e-12', [
          P('Two different real roots:'),
          P('x1 = ', num('(-b - sqrt(Dc)) / (2 * a)', 6)), P('x2 = ', num('(-b + sqrt(Dc)) / (2 * a)', 6)),
        ], [IF('Dc > -1e-12', [P('Two equal roots: x = ', num('-b / (2 * a)', 6))], [
          P('Complex roots: x = ', num('-b / (2 * a)', 6), ' +/- ', num('sqrt(-Dc) / (2 * abs(a))', 6), ' i'),
        ])]),
        P('Vertex = (', num('-b / (2 * a)', 4), ', ', num('c - b * b / (4 * a)', 4), ')'),
        P('Sum of roots = ', num('-b / a', 6), ', product = ', num('c / a', 6)),
      ],
    }),
  },

  'system-of-equations': {
    name: 'System of equations',
    clean: (raw) => {
      const out = check(systemSolve, raw);
      if (out.kind !== 'unique') throw new ExportError(out.kind === 'none' ? 'This system has no solution.' : 'This system has infinitely many solutions.');
      return { aug: raw.cells.map((r) => r.map((c) => amt(c))) };
    },
    program: (p) => {
      const size = p.aug.length;
      const A = p.aug.map((r) => r.slice(0, size));
      const names = ['x', 'y', 'z'];
      return {
        title: `${size} linear equations by Cramer's rule`,
        about: ['x_j = D_j / D, where D_j is D with column j replaced by the constants'],
        body: [
          D('n', 'int', String(size)),
          D('b', 'vec', { vec: p.aug.map((r) => r[size]) }),
          D('W', 'mat', { mat: A }),
          ...determinant('W', 'det', 'n'),
          P('D = ', num('det', 6)),
          ...names.slice(0, size).map((v, j) => FOR('once', 0, 1, [
            D('Wj', 'mat', { mat: A }),
            FOR('i', 0, 'n', [S(`Wj[i, ${j}]`, 'b[i]')]),
            ...determinant('Wj', 'dj', 'n'),
            P(`D${v} = `, num('dj', 6), `, ${v} = `, num('dj / det', 6)),
          ])),
        ],
      };
    },
  },

  progressions: {
    name: 'AP and GP',
    clean: (raw) => {
      check(progSolve, raw);
      const mode = raw.mode;
      if (mode === 'detect') return { mode, t: String(raw.terms ?? '').split(/[,;\s]+/).filter(Boolean).map((s) => amt(s)) };
      return { mode, a: amt(raw.a), d: amt(raw.d), r: amt(raw.r), n: Math.round(amt(raw.n)) };
    },
    program: (p) => {
      if (p.mode === 'special') {
        return {
          title: 'Sums of the first n natural numbers, squares and cubes',
          body: [D('n', 'num', String(p.n)), P('Sum of 1..n = ', num('n * (n + 1) / 2', 0)), P('Sum of squares = ', num('n * (n + 1) * (2 * n + 1) / 6', 0)), P('Sum of cubes = ', num('(n * (n + 1) / 2) * (n * (n + 1) / 2)', 0))],
        };
      }
      if (p.mode === 'detect') {
        return {
          title: 'AP or GP? Check the differences and the ratios',
          body: [
            D('k', 'int', String(p.t.length)),
            D('t', 'vec', { vec: p.t }),
            D('isAP', 'bool', 'true'), D('isGP', 'bool', 'true'),
            FOR('i', 1, 'k', [
              IF('abs((t[i] - t[i - 1]) - (t[1] - t[0])) > 1e-9', [S('isAP', 'false')]),
              IF('t[i - 1] == 0', [S('isGP', 'false')], [IF('abs(t[i] / t[i - 1] - t[1] / t[0]) > 1e-9', [S('isGP', 'false')])]),
            ]),
            IF('t[0] == 0', [S('isGP', 'false')]),
            IF('isAP', [P('AP: a = ', num('t[0]', 4), ', d = ', num('t[1] - t[0]', 4))]),
            IF('isGP', [P('GP: a = ', num('t[0]', 4), ', r = ', num('t[1] / t[0]', 4))]),
            IF('not isAP and not isGP', [P('Neither an AP nor a GP.')]),
          ],
        };
      }
      if (p.mode === 'gp') {
        return {
          title: 'Geometric progression',
          about: ['a_n = a r^(n-1); S_n = a (r^n - 1) / (r - 1); S_infinity = a / (1 - r) when |r| < 1'],
          body: [
            D('a', 'num', lit(p.a)), D('r', 'num', lit(p.r)), D('n', 'num', String(p.n)),
            P('n-th term = ', num('a * pow(r, n - 1)', 6)),
            IF('abs(r - 1) < 1e-12', [P('Sum of n terms = ', num('a * n', 6))], [P('Sum of n terms = ', num('a * (pow(r, n) - 1) / (r - 1)', 6))]),
            IF('abs(r) < 1', [P('Sum to infinity = ', num('a / (1 - r)', 6))], [P('No sum to infinity (|r| >= 1).')]),
          ],
        };
      }
      return {
        title: 'Arithmetic progression',
        about: ['a_n = a + (n - 1) d; S_n = n/2 (2a + (n - 1) d)'],
        body: [D('a', 'num', lit(p.a)), D('d', 'num', lit(p.d)), D('n', 'num', String(p.n)),
          P('n-th term = ', num('a + (n - 1) * d', 6)), P('Sum of n terms = ', num('n / 2 * (2 * a + (n - 1) * d)', 6))],
      };
    },
  },

  'permutations-combinations': {
    name: 'Permutations and combinations',
    clean: (raw) => {
      check(permSolve, raw);
      const mode = raw.mode;
      const out = { mode, n: Math.round(amt(raw.n, 0)), r: Math.round(amt(raw.r, 0)), necklace: !!raw.necklace };
      if (mode === 'word') {
        const letters = String(raw.word ?? '').toUpperCase().replace(/[^A-Z]/g, '');
        const counts = {};
        for (const ch of letters) counts[ch] = (counts[ch] || 0) + 1;
        out.len = letters.length;
        out.counts = Object.values(counts);
        out.word = letters;
      }
      if (out.n > 170 || (mode === 'word' && out.len > 170)) throw new ExportError('Code export uses ordinary numbers, so it works up to n = 170 (the page handles bigger n exactly).');
      return out;
    },
    program: (p) => {
      const fact = (target, m) => [D(target, 'num', '1'), FOR('fi', 2, `${m} + 1`, [S(target, `${target} * fi`)])];
      const about = ['Plain floating-point numbers: exact up to about 2^53 (n up to 18 or so), close beyond that'];
      switch (p.mode) {
        case 'factorial':
          return { title: `${p.n}!`, about, body: [D('n', 'int', String(p.n)), ...fact('f', 'n'), P('n! = ', num('f', 0))] };
        case 'npr':
          return { title: 'Permutations nPr = n! / (n - r)!', about, body: [D('n', 'int', String(p.n)), D('r', 'int', String(p.r)), D('v', 'num', '1'), FOR('k', 0, 'r', [S('v', 'v * (n - k)')]), P('nPr = ', num('v', 0))] };
        case 'ncr':
          return { title: 'Combinations nCr = n! / (r! (n - r)!)', about, body: [D('n', 'int', String(p.n)), D('r', 'int', String(p.r)), D('k', 'int', String(Math.min(p.r, p.n - p.r))), D('v', 'num', '1'),
            FOR('j', 0, 'k', [S('v', 'v * (n - j) / (j + 1)')]), P('n = ', int('n'), ', r = ', int('r'), ': nCr = ', num('v', 0))] };
        case 'circular':
          return { title: `Circular arrangements of ${p.n}${p.necklace && p.n > 2 ? ' (necklace: turning over counts as the same)' : ''}`, about, body: [D('n', 'int', String(p.n)), ...fact('f', 'n - 1'),
            P('Ways = (n - 1)!', p.necklace && p.n > 2 ? ' / 2' : '', ' = ', num(p.necklace && p.n > 2 ? 'f / 2' : 'f', 0))] };
        case 'repetition':
          return { title: 'With repetition', about, body: [D('n', 'num', String(p.n)), D('r', 'int', String(p.r)), P('Arrangements n^r = ', num('pow(n, r)', 0)),
            D('v', 'num', '1'), FOR('j', 0, 'r', [S('v', 'v * (n + r - 1 - j) / (j + 1)')]), P('Selections (n + r - 1)Cr = ', num('v', 0))] };
        default:
          return {
            title: `Arrangements of the letters of ${p.word}`,
            about: ['n! / (product of k! for each letter repeated k times)', ...about],
            body: [D('len', 'int', String(p.len)), D('counts', 'vec', { vec: p.counts }), ...fact('top', 'len'),
              D('v', 'num', 'top'),
              FOR('i', 0, String(p.counts.length), [FOR('j', 2, 'int(counts[i]) + 1', [S('v', 'v / j')])]),
              P('Arrangements = ', num('v', 0))],
          };
      }
    },
  },

  'set-operations': {
    name: 'Sets and relations',
    clean: (raw) => {
      check(setSolve, raw);
      const mode = choice(raw.mode, ['sets', 'expression', 'relation']);
      if (mode === 'expression') throw new ExportError('Code export covers the "sets" and "relation" modes of this page.');
      const read = (s) => [...new Set(String(s ?? '').replace(/[{}]/g, '').split(/[,;]/).map((x) => x.trim()).filter(Boolean))];
      const nums = (xs, label) => xs.map((x) => {
        const v = Number(x);
        if (!Number.isFinite(v)) throw new ExportError(`Code export works with sets of numbers (${label} has "${x}").`);
        return v;
      });
      if (mode === 'relation') {
        const A = nums(read(raw.A), 'A');
        const pairs = [...String(raw.relation ?? '').matchAll(/\(\s*([^,()]+)\s*,\s*([^,()]+)\s*\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
        if (pairs.some((q) => q.some((v) => !Number.isFinite(v)))) throw new ExportError('Code export works with relations on numbers.');
        return { mode, A, pairs };
      }
      const U = String(raw.U ?? '').trim() ? nums(read(raw.U), 'U') : null;
      const A = nums(read(raw.A), 'A');
      const B = nums(read(raw.B), 'B');
      const Cs = String(raw.C ?? '').trim() ? nums(read(raw.C), 'C') : null;
      const pool = [...new Set([...(U || []), ...A, ...B, ...(Cs || [])])].sort((x, y) => x - y);
      return { mode, pool, inA: pool.map((x) => (A.includes(x) ? 1 : 0)), inB: pool.map((x) => (B.includes(x) ? 1 : 0)), inC: Cs ? pool.map((x) => (Cs.includes(x) ? 1 : 0)) : null, inU: U ? pool.map((x) => (U.includes(x) ? 1 : 0)) : null };
    },
    program: (p) => {
      if (p.mode === 'relation') {
        const k = p.A.length;
        const idx = (v) => p.A.indexOf(v);
        const R = p.A.map(() => p.A.map(() => 0));
        p.pairs.forEach(([x, y]) => { R[idx(x)][idx(y)] = 1; });
        return {
          title: 'Properties of a relation on A',
          about: ['R[i][j] = 1 when (a_i, a_j) is in the relation'],
          body: [
            D('k', 'int', String(k)), D('R', 'mat', { mat: R }),
            D('refl', 'bool', 'true'), D('sym', 'bool', 'true'), D('anti', 'bool', 'true'), D('trans', 'bool', 'true'),
            FOR('i', 0, 'k', [
              IF('R[i, i] == 0', [S('refl', 'false')]),
              FOR('j', 0, 'k', [
                IF('R[i, j] == 1 and R[j, i] == 0', [S('sym', 'false')]),
                IF('i != j and R[i, j] == 1 and R[j, i] == 1', [S('anti', 'false')]),
                FOR('t', 0, 'k', [IF('R[i, j] == 1 and R[j, t] == 1 and R[i, t] == 0', [S('trans', 'false')])]),
              ]),
            ]),
            IF('refl', [P('Reflexive: yes')], [P('Reflexive: no')]),
            IF('sym', [P('Symmetric: yes')], [P('Symmetric: no')]),
            IF('anti', [P('Antisymmetric: yes')], [P('Antisymmetric: no')]),
            IF('trans', [P('Transitive: yes')], [P('Transitive: no')]),
            IF('refl and sym and trans', [P('It is an equivalence relation.')]),
            IF('refl and anti and trans', [P('It is a partial order.')]),
          ],
        };
      }
      const list = (label, cond) => [P(`${label}:`), FOR('i', 0, 'k', [IF(cond, [P('  ', num('x[i]', 0))])])];
      const count = (cond, label) => [D('cnt', 'num', '0'), FOR('i', 0, 'k', [IF(cond, [S('cnt', 'cnt + 1')])]), P(`n(${label}) = `, num('cnt', 0))];
      return {
        title: 'Set operations',
        about: ['Each element is marked 1 or 0 for being in A, B, C and U; the operations combine the marks'],
        body: [
          D('k', 'int', String(p.pool.length)),
          D('x', 'vec', { vec: p.pool }),
          D('inA', 'vec', { vec: p.inA }), D('inB', 'vec', { vec: p.inB }),
          ...(p.inC ? [D('inC', 'vec', { vec: p.inC })] : []),
          ...(p.inU ? [D('inU', 'vec', { vec: p.inU })] : []),
          ...list('A union B', 'inA[i] == 1 or inB[i] == 1'),
          ...list('A intersect B', 'inA[i] == 1 and inB[i] == 1'),
          ...list('A - B', 'inA[i] == 1 and inB[i] == 0'),
          ...list('B - A', 'inB[i] == 1 and inA[i] == 0'),
          ...(p.inU ? [...list("A' (complement)", 'inU[i] == 1 and inA[i] == 0'), ...list("B' (complement)", 'inU[i] == 1 and inB[i] == 0')] : []),
          FOR('once', 0, 1, count('inA[i] == 1 or inB[i] == 1', 'A union B')),
          ...(p.inC ? [FOR('once', 0, 1, count('inA[i] == 1 or inB[i] == 1 or inC[i] == 1', 'A union B union C'))] : []),
          C('n(A union B) = n(A) + n(B) - n(A intersect B)'),
        ],
      };
    },
  },
};
