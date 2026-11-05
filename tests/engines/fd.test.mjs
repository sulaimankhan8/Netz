// FD, RD, PPF, SIP and lump sum: checks against hand-worked answers and the formulas banks publish.
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as fd } from '../../src/app/utils/engines/fd.js';
import { solve as rd } from '../../src/app/utils/engines/rd.js';
import { solve as ppf } from '../../src/app/utils/engines/ppf.js';
import { solve as sip } from '../../src/app/utils/engines/sip.js';
import { solve as lumpsum } from '../../src/app/utils/engines/lumpsum.js';

const near = (a, b, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));

test('FD: ₹1,00,000 at 7% for 5 years, quarterly, grows to ₹1,41,478', () => {
  const a = fd({ principal: '100000', rate: '7', years: '5', frequency: '4' });
  near(a.result, 100000 * 1.0175 ** 20, 0.01);
  near(a.result, 141477.8, 0.5);
  assert.equal(a.rows.length, 5);
  near(a.rows[4].closing, a.result, 0.01);
  near(a.stats[2].value, (1.0175 ** 4 - 1) * 100, 1e-9);
});

test('FD: odd period, short deposit and payouts', () => {
  // 2 years 6 months yearly: P(1.08)^2 × (1 + 0.08 × 0.5)
  near(fd({ principal: '10000', rate: '8', years: '2', months: '6', frequency: '1' }).result, 10000 * 1.08 ** 2 * 1.04, 0.01);
  // Under 6 months: simple interest
  near(fd({ principal: '50000', rate: '6', months: '3' }).result, 50750, 0.01);
  const q = fd({ principal: '100000', rate: '7', years: '3', payout: 'quarterly' });
  near(q.stats[0].value, 1750, 1e-9);
  near(q.stats[1].value, 21000, 1e-9);
  near(fd({ principal: '120000', rate: '6', years: '1', payout: 'monthly' }).stats[0].value, 600, 1e-9);
  err(() => fd({ principal: '1000', rate: '7' }), /tenure/);
  err(() => fd({ principal: '0', rate: '7', years: '1' }), /more than 0/);
});

test('RD: matches the bank formula M = R[(1+i)^n − 1]/[1 − (1+i)^(−1/3)]', () => {
  const a = rd({ instalment: '1000', rate: '7', years: '1' });
  const i = 0.07 / 4;
  near(a.result, (1000 * ((1 + i) ** 4 - 1)) / (1 - (1 + i) ** (-1 / 3)), 1e-6);
  near(a.result, 12462.13, 0.01);
  const b = rd({ instalment: '5000', rate: '6.5', years: '5' });
  const j = 0.065 / 4;
  near(b.result, (5000 * ((1 + j) ** 20 - 1)) / (1 - (1 + j) ** (-1 / 3)), 1e-6);
  assert.equal(b.rows.length, 5);
  near(rd({ instalment: '100', rate: '0', months: '10' }).result, 1000, 1e-9);
  err(() => rd({ instalment: '100', rate: '7', years: '1.05' }), /whole months/);
});

test('PPF: ₹1.5 lakh a year at 7.1% for 15 years matures at ₹40,68,209', () => {
  const a = ppf({ deposit: '150000', rate: '7.1', years: '15' });
  near(a.result, 4068209, 2);
  assert.equal(a.rows.length, 15);
  near(a.rows[0].interest, 150000 * 0.071, 1e-9);
  // Deposit at the end of the year: one year's less growth on each deposit
  near(ppf({ deposit: '150000', rate: '7.1', years: '15', timing: 'end' }).result, a.result / 1.071, 0.01);
  near(ppf({ deposit: '10000', rate: '7.1', years: '20' }).result, 10000 * ((1.071 ** 20 - 1) / 0.071) * 1.071, 0.01);
  err(() => ppf({ deposit: '200000', rate: '7.1', years: '15' }), /most/);
  err(() => ppf({ deposit: '100', rate: '7.1', years: '15' }), /smallest/);
  err(() => ppf({ deposit: '5000', rate: '7.1', years: '17' }), /blocks of 5/);
});

test('SIP: ₹10,000 a month at 12% for 10 years grows to ₹23,23,391', () => {
  const a = sip({ monthly: '10000', rate: '12', years: '10' });
  near(a.result, 2323391, 1);
  near(a.stats[2].value, 1200000, 1e-6);
  assert.equal(a.rows.length, 10);
});

test('SIP with a 10% yearly step-up matches the year-by-year sum', () => {
  const a = sip({ monthly: '5000', rate: '12', years: '5', stepUp: '10' });
  const i = 0.01;
  const f12 = (((1 + i) ** 12 - 1) / i) * (1 + i);
  let F = 0;
  for (let y = 1; y <= 5; y++) F += 5000 * 1.1 ** (y - 1) * f12 * (1 + i) ** (12 * (5 - y));
  near(a.result, F, 1e-6);
  near(a.stats[2].value, 5000 * 12 * (1 + 1.1 + 1.21 + 1.331 + 1.4641), 1e-6);
  near(a.rows[4].monthly, 5000 * 1.4641, 1e-9);
});

test('Lump sum: ₹1,00,000 at 12% for 10 years, and the real return after inflation', () => {
  const a = lumpsum({ amount: '100000', rate: '12', years: '10' });
  near(a.result, 310584.82, 0.01);
  const b = lumpsum({ amount: '100000', rate: '12', years: '10', inflation: '6' });
  near(b.real, (1.12 / 1.06 - 1) * 100, 1e-9);
  near(b.stats[2].value, 310584.82 / 1.06 ** 10, 0.01);
  err(() => lumpsum({ amount: '1000', rate: '12', years: '0' }), /more than 0/);
});
