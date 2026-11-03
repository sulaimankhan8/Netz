// Simple and compound interest: checks against textbook answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/compound-interest.js';

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Interest: simple interest', () => {
  const s = solve({ kind: 'simple', principal: '10000', rate: '8', time: '3' });
  near(s.interest, 2400); near(s.amount, 12400);
  assert.equal(s.rows.length, 3);
  near(solve({ kind: 'simple', principal: '10000', rate: '12', time: '6', timeUnit: 'months' }).interest, 600);
});

test('Interest: compound interest, NCERT style', () => {
  const y = solve({ principal: '10000', rate: '10', time: '2', frequency: '1' });
  near(y.amount, 12100); near(y.interest, 2100);
  near(y.rows[1].interest, 1100);
  near(solve({ principal: '8000', rate: '10', time: '1.5', frequency: '2' }).amount, 9261);
  near(solve({ principal: '10000', rate: '10', time: '1', frequency: '2' }).amount, 11025);
  // 2½ years yearly: whole years compound, the half year earns simple interest
  const part = solve({ principal: '10000', rate: '10', time: '2.5', frequency: '1' });
  near(part.amount, 12705);
  assert.ok(part.notes.some((x) => /NCERT/.test(x)));
  assert.equal(part.rows.length, 3);
  near(part.rows[2].year, 2.5, 1e-9);
});

test('Interest: continuous, effective rate, rule of 72', () => {
  near(solve({ principal: '1000', rate: '5', time: '1', frequency: 'continuous' }).amount, 1051.27);
  near(solve({ principal: '100', rate: '12', time: '1', frequency: '12' }).ear, 12.6825, 1e-4);
  const d = solve({ principal: '100', rate: '8', time: '1', frequency: '1' });
  near(d.ruleOf72, 9, 1e-9); near(d.doubling, 9.0065, 1e-4);
  assert.equal(solve({ principal: '100', rate: '0', time: '5' }).doubling, null);
});

test('Interest: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ principal: '0', rate: '5', time: '1' }, /Principal must be more than 0/);
  err({ principal: '100', rate: '-5', time: '1' }, /can't be negative/);
  err({ principal: '100', rate: '5', time: '200' }, /100 years or less/);
  err({ principal: '100', rate: '5', time: '1', frequency: '7' }, /how often/);
});
