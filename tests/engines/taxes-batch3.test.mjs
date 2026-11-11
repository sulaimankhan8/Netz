// Group 3J (hidden until the owner checks the rates): India capital gains, HRA exemption, TDS, US and UK income tax.
// Worked by hand from the stored rates (src/app/data/rates/in.js, us.js, uk.js). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as cg } from '../../src/app/utils/engines/capital-gains-india.js';
import { solve as hra } from '../../src/app/utils/engines/hra-exemption.js';
import { solve as tds } from '../../src/app/utils/engines/tds.js';
import { solve as us } from '../../src/app/utils/engines/us-income-tax.js';
import { solve as uk } from '../../src/app/utils/engines/uk-income-tax.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const err = (fn, re) => assert.throws(fn, (e) => e.name === 'EngineError' && re.test(e.message));

test('Capital gains: equity LTCG with the ₹1.25 lakh exemption, STCG, property with indexation', () => {
  // (3,00,000 − 1,25,000) × 12.5% = 21,875, + 4% cess
  const a = cg({ asset: 'equity', buyDate: '2024-01-10', sellDate: '2025-08-20', buy: '500000', sell: '800000' });
  assert.equal(a.long, true); near(a.tax, 22750);
  // 7 months: STCG 20% on 50,000 + cess
  const b = cg({ asset: 'equity', buyDate: '2025-01-10', sellDate: '2025-08-20', buy: '100000', sell: '150000' });
  assert.equal(b.long, false); near(b.tax, 10400);
  // Flat bought 2010 (CII 167), sold 2025 (CII 376): 20% with indexation beats 12.5% without
  const c = cg({ asset: 'property', buyDate: '2010-06-01', sellDate: '2025-09-01', buy: '2000000', sell: '8000000', expenses: '100000' });
  near(c.tax, ((8000000 - (2000000 * 376) / 167 - 100000) * 0.2) * 1.04, 1);
  // Before 23 Jul 2024 the old rates apply (equity LTCG 10% above ₹1 lakh)
  near(cg({ asset: 'equity', buyDate: '2022-01-10', sellDate: '2024-03-01', buy: '500000', sell: '800000' }).tax, 200000 * 0.1 * 1.04);
  err(() => cg({ asset: 'gold', buyDate: '2024-09-01', sellDate: '2025-03-01', buy: '300000', sell: '360000', slab: '' }), /slab rate/);
  assert.equal(cg({ asset: 'equity', buyDate: '2024-01-10', sellDate: '2025-08-20', buy: '800000', sell: '500000' }).tax, 0);
});

test('HRA exemption: the least of three amounts', () => {
  const h = hra({ basic: '50000', da: '', hra: '20000', rent: '18000', metro: 'yes', period: 'month' });
  assert.equal(h.exempt, 156000); assert.equal(h.taxable, 84000);
  // Non-metro: 40% of salary
  const n = hra({ basic: '40000', da: '5000', hra: '16000', rent: '20000', metro: 'no', period: 'month' });
  assert.equal(n.exempt, Math.min(192000, 240000 - 54000, 216000));
  assert.equal(hra({ basic: '50000', hra: '20000', rent: '0', metro: 'yes', period: 'month' }).exempt, 0);
});

test('TDS: section rate, limit, no PAN, own rate', () => {
  near(tds({ amount: '100000', section: '194J-prof', rate: '', pan: 'yes' }).tds, 10000);
  assert.equal(tds({ amount: '25000', section: '194C-ind', rate: '', pan: 'yes' }).tds, 0); // below ₹30,000
  near(tds({ amount: '100000', section: '194J-prof', rate: '', pan: 'no' }).tds, 20000);
  near(tds({ amount: '200000', section: 'custom', rate: '5', pan: 'yes' }).tds, 10000);
  err(() => tds({ amount: '1000', section: 'custom', rate: '' }), /Type the TDS rate/);
});

test('US income tax 2026: brackets, FICA, state, take-home', () => {
  // AGI 80,000 − 16,100 = 63,900 taxable: 1,240 + 4,560 + 2,970 = 8,770
  const r = us({ wages: '85000', status: 'single', year: '2026', pretax: '5000', state: '5' });
  near(r.fed, 8770); near(r.fica, 5270 + 1232.5); near(r.state, 4000); near(r.take, 60727.5);
  assert.equal(r.marginal, 22); assert.equal(r.verified, true);
  // Social Security stops at the wage base; extra 0.9% Medicare above $200,000
  const h = us({ wages: '250000', status: 'single', year: '2026' });
  near(h.fica, 184500 * 0.062 + 250000 * 0.0145 + 50000 * 0.009);
  assert.ok(us({ wages: '85000', status: 'single', year: '2025', pretax: '5000' }).fed > r.fed - 500);
});

test('UK income tax: allowance taper, Scotland, National Insurance', () => {
  const r = uk({ salary: '45000', region: 'ruk', year: '2026', pension: '5' });
  near(r.tax, 6036); near(r.ni, 2414.4); near(r.take, 34299.6);
  // £110,000: allowance cut by £5,000 to £7,570
  const t = uk({ salary: '110000', region: 'ruk', year: '2026' });
  assert.equal(t.pa, 7570); assert.match(t.notes.join(' '), /60%/);
  // Scotland: starter 19%, basic 20%, intermediate 21% on £30,180 taxable (2026/27 bands)
  near(uk({ salary: '45000', region: 'scotland', year: '2026', pension: '5' }).tax, 6128.57, 0.05);
});
