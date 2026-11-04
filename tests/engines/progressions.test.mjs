// AP and GP: checks against NCERT-style answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/progressions.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('AP and GP: nth term and sums', () => {
  const ap = solve({ mode: 'ap', a: '5', d: '4', n: '20' }); // page example
  near(ap.nth, 81); near(ap.sum, 860);
  assert.deepEqual(ap.list.slice(0, 4), [5, 9, 13, 17]);
  near(solve({ mode: 'ap', a: '2', d: '3', n: '10' }).sum, 155);
  const gp = solve({ mode: 'gp', a: '3', r: '2', n: '5' });
  near(gp.nth, 48); near(gp.sum, 93); assert.equal(gp.sInf, null);
  const half = solve({ mode: 'gp', a: '1', r: '1/2', n: '4' });
  near(half.sum, 1.875); near(half.sInf, 2);
  near(solve({ mode: 'gp', a: '4', r: '1', n: '6' }).sum, 24);
});

test('AP and GP: special sums and spotting the pattern', () => {
  const s = solve({ mode: 'special', n: '10' });
  assert.equal(s.s1, 55); assert.equal(s.s2, 385); assert.equal(s.s3, 3025);
  const ap = solve({ mode: 'detect', terms: '2, 5, 8, 11' });
  assert.equal(ap.kind, 'AP'); near(ap.d, 3); near(ap.next, 14);
  const gp = solve({ mode: 'detect', terms: '3, 6, 12' });
  assert.equal(gp.kind, 'GP'); near(gp.r, 2); near(gp.next, 24);
  assert.equal(solve({ mode: 'detect', terms: '1, 4, 9' }).kind, 'neither');
});

test('AP and GP: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ mode: 'ap', a: '1', d: '2', n: '2.5' }, /whole number/);
  err({ mode: 'gp', a: '1', r: '0', n: '3' }, /ratio can't be 0/);
  err({ mode: 'detect', terms: '1, 2' }, /at least 3/);
  err({ mode: 'detect', terms: '1, two, 3' }, /"two"/);
});
