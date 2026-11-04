// Parametric differentiation: dy/dx, d²y/dx², tangents, vertical tangents and cusps. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/parametric.js';

test('Parametric: parabola, circle and cycloid', () => {
  const p = solve({ x: 't^2', y: '2t', second: true, at: '1' });
  assert.equal(p.answer, '\\frac{1}{t}'); // t, not \mathrm{t}
  assert.equal(p.second, '-\\frac{1}{2 {t}^{3}}');
  assert.equal(p.verified, true);
  assert.deepEqual([p.point.x, p.point.y, p.point.slope], [1, 2, 1]);

  const circle = solve({ x: 'cos(t)', y: 'sin(t)', second: true });
  assert.equal(circle.answer, '-\\frac{\\cos\\left(t\\right)}{\\sin\\left(t\\right)}');
  assert.equal(circle.second, '-\\frac{1}{{\\sin\\left(t\\right)}^{3}}'); // sin² + cos² = 1 used
  assert.equal(solve({ x: '3cos(theta)', y: '3sin(theta)', second: true }).second, '-\\frac{1}{3 {\\sin\\left(\\theta\\right)}^{3}}');

  const cycloid = solve({ x: 't - sin(t)', y: '1 - cos(t)', second: true, at: 'pi/2' });
  assert.equal(cycloid.verified, true);
  assert.ok(Math.abs(cycloid.point.slope - 1) < 1e-12);
});

test('Parametric: vertical tangents, cusps and bad input', () => {
  const v = solve({ x: '3cos(theta)', y: '3sin(theta)', at: '0' });
  assert.equal(v.point.vertical, true);
  const cusp = solve({ x: 't^3', y: 't^2', at: '0' });
  assert.equal(cusp.point.stationary, true);
  assert.throws(() => solve({ x: '5', y: 't' }), /dx\/dt = 0/);
  assert.throws(() => solve({ x: 'a cos(t)', y: 'b sin(t)' }), /one parameter/);
  assert.throws(() => solve({ x: 'x', y: 'x^2' }), /not x or y/);
});
