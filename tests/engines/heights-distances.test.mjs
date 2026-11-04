// Heights and distances: NCERT 10 problems with exact √3 answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/heights-distances.js';

const T = (c) => solve(c).valueTex;

test('Heights and distances: one triangle', () => {
  assert.equal(T({ type: 'height', d: '30', theta: '60' }), '30\\sqrt{3}\\text{ m} \\approx 51.9615\\text{ m}');
  assert.equal(T({ type: 'distance', h: '15', theta: '60' }), '5\\sqrt{3}\\text{ m} \\approx 8.66025\\text{ m}');
  assert.equal(T({ type: 'angle', h: '10', d: '10' }), '45^\\circ');
  assert.equal(T({ type: 'height', d: '50', theta: '37' }), '37.6777\\text{ m}'); // not a special angle: decimal
  assert.match(T({ type: 'height', d: '30', theta: '30', eye: '1.5' }), /^\\left\(\\frac\{3\}\{2\} \+ 10\\sqrt\{3\}\\right\)/);
});

test('Heights and distances: two observations', () => {
  const r = solve({ type: 'two-points', d: '20', alpha: '60', beta: '30' });
  assert.equal(r.valueTex, '10\\sqrt{3}\\text{ m} \\approx 17.3205\\text{ m}');
  assert.ok(Math.abs(r.result.x - 10) < 1e-9);
  assert.equal(T({ type: 'two-points', d: '40', alpha: '45', beta: '30' }), '\\left(20 + 20\\sqrt{3}\\right)\\text{ m} \\approx 54.641\\text{ m}');
  assert.equal(T({ type: 'two-points', d: '100', alpha: '60', beta: '30', side: 'opposite' }), '25\\sqrt{3}\\text{ m} \\approx 43.3013\\text{ m}');
  assert.equal(T({ type: 'depression', h: '75', alpha: '60', beta: '30' }), '50\\sqrt{3}\\text{ m} \\approx 86.6025\\text{ m}');
  assert.throws(() => solve({ type: 'two-points', d: '20', alpha: '30', beta: '60' }), /bigger than β/);
});
