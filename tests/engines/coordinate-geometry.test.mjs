// Coordinate geometry: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, generalTex, slopeInterceptTex } from '../../src/app/utils/engines/coordinate-geometry.js';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const P = (x, y) => ({ x: String(x), y: String(y) });

test('Coordinate geometry: distance, midpoint, section formula', () => {
  near(solve({ mode: 'distance', p1: P(1, 2), p2: P(4, 6) }).result, 5);
  assert.match(solve({ mode: 'distance', p1: P(0, 0), p2: P(1, 1) }).lines[2], /\\sqrt\{2\}/);
  const m = solve({ mode: 'midpoint', p1: P(2, 3), p2: P(4, 7) }).result;
  near(m.x, 3); near(m.y, 5);
  const inside = solve({ mode: 'section', p1: P(1, 2), p2: P(4, 8), m: '1', n: '2' }).result;
  near(inside.x, 2); near(inside.y, 4);
  const outside = solve({ mode: 'section', p1: P(1, 2), p2: P(4, 8), m: '1', n: '2', external: true }).result;
  near(outside.x, -2); near(outside.y, -4);
});

test('Coordinate geometry: slope and the equation of a line', () => {
  near(solve({ mode: 'slope', p1: P(1, 2), p2: P(3, 8) }).result, 3);
  assert.equal(solve({ mode: 'slope', p1: P(2, 1), p2: P(2, 5) }).vertical, true);
  const l = solve({ mode: 'line', p1: P(1, 2), p2: P(3, 8) });
  assert.deepEqual([l.result.a, l.result.b, l.result.c], [3, -1, -1]);
  assert.match(l.lines[3], /3x - y - 1 = 0/);
  assert.match(l.lines[2], /y = 3x - 1/);
  const v = solve({ mode: 'line', p1: P(2, 1), p2: P(2, 5) });
  assert.deepEqual([v.result.a, v.result.b, v.result.c], [1, 0, -2]);
  assert.equal(generalTex(1, 0, -2), 'x - 2 = 0');
  assert.equal(slopeInterceptTex(-1, 0), 'y = -x');
  assert.equal(slopeInterceptTex(0.5, -3), 'y = \\frac{1}{2}x - 3');
  assert.equal(slopeInterceptTex(0, 4), 'y = 4');
});

test('Coordinate geometry: angle between lines, point to line, triangle area', () => {
  assert.equal(solve({ mode: 'angle', m1: '1', m2: '-1' }).perpendicular, true);
  assert.equal(solve({ mode: 'angle', m1: '2', m2: '2' }).parallel, true);
  near(solve({ mode: 'angle', m1: '2', m2: '3' }).result, 8.130102354, 1e-6);
  near(solve({ mode: 'point-line', p1: P(1, 2), a: '3', b: '4', c: '-5' }).result, 1.2);
  near(solve({ mode: 'triangle', p1: P(0, 0), p2: P(4, 0), p3: P(0, 3) }).result, 6);
  assert.equal(solve({ mode: 'triangle', p1: P(0, 0), p2: P(1, 1), p3: P(2, 2) }).collinear, true);
});

test('Coordinate geometry: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ mode: 'distance', p1: P(1, ''), p2: P(1, 2) }, /A: y is empty/);
  err({ mode: 'slope', p1: P(1, 1), p2: P(1, 1) }, /same point/);
  err({ mode: 'section', p1: P(0, 0), p2: P(1, 1), m: '2', n: '2', external: true }, /m ≠ n/);
  err({ mode: 'point-line', p1: P(0, 0), a: '0', b: '0', c: '1' }, /not a line/);
});
