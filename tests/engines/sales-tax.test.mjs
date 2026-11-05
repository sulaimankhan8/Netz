// US sales tax, Canada GST/HST/PST and India income tax: fixed cases, so a rate edit that breaks a page fails here.
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { US_RULES } from '../../src/app/data/rates/us.js';
import { CA_RULES } from '../../src/app/data/rates/ca.js';
import { IN_RULES } from '../../src/app/data/rates/in.js';
import { getRule, versions } from '../../src/app/utils/rates/getRule.js';
import { solve as salesTax } from '../../src/app/utils/engines/sales-tax.js';
import { solve as canada } from '../../src/app/utils/engines/canada-sales-tax.js';
import { solve as incomeTax, slabTax } from '../../src/app/utils/engines/income-tax.js';

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));
const STATUSES = ['official', 'secondary', 'unverified'];

test('New rates files: every rule has a source, a check date and a status', () => {
  for (const r of [...US_RULES, ...CA_RULES, ...IN_RULES]) {
    assert.ok(r.source?.title && r.source?.url && r.source?.verifiedOn, `${r.id} ${r.validFrom} is missing its source`);
    assert.ok(STATUSES.includes(r.source.status), `${r.id} has a bad status`);
  }
  assert.equal(getRule(US_RULES, 'us.salestax.states', '2026-11-04').data.states.length, 51);
  assert.equal(getRule(CA_RULES, 'ca.salestax.provinces', '2026-11-04').data.provinces.length, 13);
  assert.equal(versions(IN_RULES, 'in.incometax').length, 3);
  assert.equal(getRule(IN_RULES, 'in.ppf.rate', '2026-11-04').data.rate, 7.1);
});

test('US sales tax: California 7.25% + 1% local on $100', () => {
  const a = salesTax({ amount: '100', state: 'CA', local: '1' });
  near(a.tax, 8.25); near(a.total, 108.25);
  assert.equal(a.parts.length, 2);
  near(a.parts[0].amount, 7.25);
  const b = salesTax({ amount: '108.25', state: 'CA', local: '1', mode: 'remove' });
  near(b.base, 100); near(b.tax, 8.25);
  near(salesTax({ amount: '50', state: 'OR' }).tax, 0);
  near(salesTax({ amount: '200', state: 'custom', stateRate: '5', local: '2.5' }).total, 215);
  err(() => salesTax({ amount: '100', state: 'CA', local: '40' }), /over 30%/);
});

test('Canada: HST, GST + PST and GST only', () => {
  near(canada({ amount: '100', province: 'ON' }).total, 113);
  const qc = canada({ amount: '100', province: 'QC' });
  near(qc.total, 114.975);
  assert.deepEqual(qc.parts.map((p) => p.label), ['GST', 'QST']);
  near(canada({ amount: '112', province: 'BC', mode: 'remove' }).base, 100);
  near(canada({ amount: '100', province: 'AB' }).tax, 5);
  near(canada({ amount: '100', province: 'NS' }).tax, 14);
  const old = getRule(CA_RULES, 'ca.salestax.provinces', '2024-06-01');
  near(canada({ amount: '100', province: 'NS', rule: old }).tax, 15);
});

test('Income tax slabs: tax on ₹12,25,000 in the new regime is ₹63,750 before relief', () => {
  const rule = getRule(IN_RULES, 'in.incometax', '2026-11-04');
  near(slabTax(1225000, rule.data.new.slabs).tax, 63750);
});

test('Income tax, new regime: rebate up to ₹12 lakh and marginal relief just above', () => {
  const rule = getRule(IN_RULES, 'in.incometax', '2026-11-04');
  const a = incomeTax({ salary: '1275000', rule });
  assert.equal(a.new.taxable, 1200000);
  assert.equal(a.new.total, 0);
  const b = incomeTax({ salary: '1300000', rule });
  assert.equal(b.new.taxable, 1225000);
  near(b.new.taxAfter, 25000);
  assert.equal(b.new.total, 26000);
});

test('Income tax, old regime: ₹10 lakh salary with ₹1.5 lakh 80C pays ₹75,400', () => {
  const rule = getRule(IN_RULES, 'in.incometax', '2026-11-04');
  const a = incomeTax({ salary: '1000000', sec80C: '200000', rule });
  assert.equal(a.old.deductions, 150000);
  assert.equal(a.old.taxable, 800000);
  assert.equal(a.old.total, 75400);
  // ₹5 lakh taxable: rebate takes the whole ₹12,500
  assert.equal(incomeTax({ salary: '550000', rule }).old.total, 0);
  // Senior citizen: ₹3 lakh exempt
  near(slabTax(600000, rule.data.old.slabs.senior).tax, 10000 + 20000);
});

test('Income tax: surcharge with marginal relief just above ₹50 lakh', () => {
  const rule = getRule(IN_RULES, 'in.incometax', '2026-11-04');
  const a = incomeTax({ other: '5050000', salaried: 'no', rule });
  near(a.new.taxAfter, 1095000);
  near(a.new.surcharge, 35000);
  assert.equal(a.new.total, 1175200);
  // Far above the threshold: the full 10%
  const b = incomeTax({ other: '6000000', salaried: 'no', rule });
  near(b.new.surcharge, 138000);
});

test('Income tax FY 2024-25: rebate up to ₹7 lakh in the new regime', () => {
  const rule = getRule(IN_RULES, 'in.incometax', '2024-10-01');
  assert.equal(incomeTax({ salary: '775000', rule }).new.total, 0);
  err(() => incomeTax({ salary: '', other: '', rule }), /Enter your yearly/);
});
