// Loan EMI: checks against published EMI values. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/emi.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('EMI: reducing balance matches published values', () => {
  const a = solve({ principal: '100000', rate: '10', tenure: '12', tenureUnit: 'months' });
  near(a.emi, 8791.59);
  near(a.totalInterest, 5499.06, 0.05);
  assert.equal(a.rows.length, 12);
  near(a.rows[11].closing, 0);
  near(a.rows[0].interest, 833.33);
  const home = solve({ principal: '10,00,000', rate: '8.5', tenure: '20' });
  near(home.emi, 8678.23);
  assert.equal(home.rows.length, 240);
  assert.equal(home.years.length, 20);
  near(solve({ principal: '12000', rate: '0', tenure: '12', tenureUnit: 'months' }).emi, 1000);
});

test('EMI: flat rate and its reducing-rate equivalent', () => {
  const f = solve({ principal: '100000', rate: '10', tenure: '1', method: 'flat' });
  near(f.emi, 9166.67);
  near(f.totalInterest, 10000);
  assert.ok(f.equivalentRate > 17.5 && f.equivalentRate < 18.5, `equivalent rate ${f.equivalentRate}`);
  // The equivalent reducing loan really gives the same EMI
  const check = solve({ principal: '100000', rate: String(f.equivalentRate), tenure: '1' });
  near(check.emi, f.emi);
});

test('EMI: a prepayment keeps the EMI and shortens the loan', () => {
  const r = solve({ principal: '1000000', rate: '8.5', tenure: '20', prepayAmount: '100000', prepayMonth: '12' });
  assert.ok(r.prepay.monthsSaved > 0, 'should finish early');
  assert.ok(r.prepay.interestSaved > 0, 'should save interest');
  near(r.prepay.rows.at(-1).closing, 0);
  near(r.prepay.rows[11].prepay, 100000);
  near(r.prepay.rows[12].emi, r.emi); // same EMI after the prepayment
  assert.match(r.notes[0], /₹1,00,000 extra after month 12/);
});

test('EMI: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ principal: '', rate: '8', tenure: '5' }, /Loan amount is empty/);
  err({ principal: '1000', rate: '8', tenure: '60' }, /600 months/);
  err({ principal: '1000', rate: '8', tenure: '10.5', tenureUnit: 'months' }, /whole number of months/);
  err({ principal: '1000', rate: '8', tenure: '1', prepayAmount: '100', prepayMonth: '12' }, /before the last month/);
});
