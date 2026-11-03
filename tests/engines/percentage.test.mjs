// Percentages and trade: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/percentage.js';
import { formatMoney, readAmount } from '../../src/app/utils/finance/money.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const run = (mode, values) => solve({ mode, values });

test('Percentage: of, what percent, change', () => {
  near(run('of', { x: '15', y: '240' }).result, 36);
  near(run('what-percent', { a: '45', b: '180' }).result, 25);
  const up = run('change', { from: '80', to: '100' });
  near(up.result, 25); assert.equal(up.direction, 'increase');
  const down = run('change', { from: '100', to: '80' });
  near(down.result, -20); assert.equal(down.direction, 'decrease');
});

test('Percentage: profit, loss, discounts, markup vs margin', () => {
  const p = run('profit-loss', { cp: '500', sp: '600' });
  assert.equal(p.kind, 'Profit'); near(p.result, 20); near(p.amount, 100);
  const l = run('profit-loss', { cp: '800', sp: '680' });
  assert.equal(l.kind, 'Loss'); near(l.result, 15); near(l.amount, 120);
  const d = run('discount', { mp: '1000', discounts: '20, 10' });
  near(d.result, 720); near(d.totalPct, 28); assert.equal(d.successive, true);
  near(run('discount', { mp: '₹1,500', discounts: '10' }).result, 1350);
  const mm = run('markup-margin', { cost: '80', price: '100' });
  near(mm.markup, 25); near(mm.margin, 20);
});

test('Percentage: money formatting and bad input', () => {
  assert.equal(formatMoney(100000), '₹1,00,000');
  assert.equal(formatMoney(8791.588, 'INR'), '₹8,791.59');
  assert.equal(formatMoney(100000, 'USD'), '$100,000');
  assert.equal(readAmount('₹ 1,00,000', 'x'), 100000);
  const err = (mode, values, re) => assert.throws(() => solve({ mode, values }), (e) => e.name === 'EngineError' && re.test(e.message));
  err('what-percent', { a: '1', b: '0' }, /can't be 0/);
  err('change', { from: '0', to: '5' }, /can't be 0/);
  err('discount', { mp: '100', discounts: '120' }, /more than 100%/);
  err('profit-loss', { cp: '', sp: '5' }, /Cost price is empty/);
});
