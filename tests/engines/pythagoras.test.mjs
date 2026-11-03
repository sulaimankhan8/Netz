// Pythagoras theorem: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/pythagoras.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Pythagoras: hypotenuse, a leg, exact surds and angles', () => {
  const r = solve({ a: '3', b: '4', c: '' });
  assert.equal(r.unknown, 'c');
  near(r.c, 5);
  near(r.angles.A, 36.8698976);
  near(r.angles.B, 53.1301024);
  near(r.area, 6);
  near(r.perimeter, 12);
  near(solve({ a: '', b: '12', c: '13' }).a, 5);
  const s = solve({ a: '5', b: '5', c: '' });
  near(s.c, Math.sqrt(50));
  assert.match(s.lines[2], /5\\sqrt\{2\}/);
});

test('Pythagoras: checking three sides', () => {
  assert.equal(solve({ a: '3', b: '4', c: '5' }).right, true);
  const no = solve({ a: '2', b: '3', c: '4' });
  assert.equal(no.right, false);
  assert.match(no.verdict, /obtuse/);
});

test('Pythagoras: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ a: '3', b: '', c: '' }, /any two sides/);
  err({ a: '', b: '12', c: '5' }, /longest side/);
  err({ a: '3', b: '-4', c: '' }, /more than 0/);
});
