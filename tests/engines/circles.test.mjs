// Circles: equation from centre, diameter, three points, general form; tangents and point position. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, readQuadratic } from '../../src/app/utils/engines/circles.js';

test('Circles: building the equation', () => {
  assert.equal(solve({ from: 'centre', h: '2', k: '-3', r: '5' }).general, 'x^2 + y^2 - 4x + 6y - 12 = 0');
  const d = solve({ from: 'diameter', x1: '-2', y1: '3', x2: '4', y2: '-5' });
  assert.deepEqual([d.centreTex, d.radiusTex], ['(1, -1)', '5']);
  const t = solve({ from: 'three', x1: '0', y1: '0', x2: '4', y2: '0', x3: '0', y3: '6' });
  assert.deepEqual([t.centreTex, t.radiusTex], ['(2, 3)', '\\sqrt{13}']);
  assert.throws(() => solve({ from: 'three', x1: '0', y1: '0', x2: '1', y2: '1', x3: '2', y3: '2' }), /straight line/);
});

test('Circles: reading a general equation, points and tangents', () => {
  const g = solve({ from: 'general', eq: 'x^2 + y^2 - 4x + 6y - 12 = 0', px: '5', py: '1' });
  assert.deepEqual([g.centreTex, g.radiusTex, g.point.where], ['(2, -3)', '5', 'on']);
  assert.equal(g.point.tangent, '3x + 4y - 19 = 0');
  const o = solve({ from: 'general', eq: '2x^2 + 2y^2 + 8x - 10 = 0', px: '3', py: '4' });
  assert.equal(o.point.where, 'outside');
  assert.ok(Math.abs(o.point.tangentLength - Math.sqrt(32)) < 1e-12);
  assert.throws(() => solve({ from: 'general', eq: 'x^2 + 2y^2 = 4' }), /Conic Sections/);
  assert.throws(() => solve({ from: 'general', eq: 'x^2 + y^2 + 4 = 0' }), /no real points/);
  assert.deepEqual(readQuadratic('x^2/25 + y^2/9 = 1'), { A: 1 / 25, B: 0, C: 1 / 9, D: 0, E: 0, F: -1 });
  assert.throws(() => readQuadratic('x^3 + y = 1'), /second-degree/);
});
