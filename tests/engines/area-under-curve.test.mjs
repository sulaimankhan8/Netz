// Area under a curve and between two curves: splitting at crossings, exact values. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/area-under-curve.js';

test('Area under a curve, split where it crosses the x-axis', () => {
  assert.equal(solve({ f: 'x^2', a: '0', b: '3' }).areaTex, '9');
  const s = solve({ f: 'sin(x)', a: '0', b: '2pi' }); // 2 + |−2|, not 0
  assert.equal(s.areaTex, '4');
  assert.deepEqual(s.pieces.map((p) => p.valueTex), ['2', '-2']);
  assert.equal(solve({ f: 'x^3', a: '-1', b: '2' }).areaTex, '\\frac{17}{4}');
  assert.equal(solve({ f: 'x^2 - 4', a: '0', b: '3' }).areaTex, '\\frac{23}{3}');
  const g = solve({ f: 'e^(-x^2)', a: '0', b: '1' }); // no antiderivative: numerical, and said so
  assert.equal(g.exact, false);
  assert.ok(Math.abs(g.area - 0.746824132812427) < 1e-9);
});

test('Area between two curves, using where they meet', () => {
  assert.equal(solve({ mode: 'between', f: 'x', g: 'x^2' }).areaTex, '\\frac{1}{6}');
  assert.equal(solve({ mode: 'between', f: '4 - x^2', g: 'x + 2' }).areaTex, '\\frac{9}{2}');
  assert.equal(solve({ mode: 'between', f: 'x^3', g: 'x' }).areaTex, '\\frac{1}{2}');
  assert.equal(solve({ mode: 'between', f: 'sin(x)', g: 'cos(x)', a: 'pi/4', b: '5pi/4' }).areaTex, '2\\sqrt{2}');
  assert.throws(() => solve({ mode: 'between', f: 'x^2 + 1', g: 'x' }), /do not enclose/);
  assert.throws(() => solve({ f: '1/x', a: '-1', b: '1' }), /not defined/);
});
