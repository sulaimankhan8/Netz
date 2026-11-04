// Taylor and Maclaurin series: the standard series with exact coefficients. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/taylor-series.js';

test('Maclaurin series of the standard functions', () => {
  const e = solve({ f: 'e^x', n: '4', at: '0.5' });
  assert.equal(e.poly, '1 + x + \\frac{1}{2}x^{2} + \\frac{1}{6}x^{3} + \\frac{1}{24}x^{4}');
  assert.equal(e.name, 'Maclaurin');
  assert.ok(e.approx.error < 3e-4);
  assert.equal(solve({ f: 'sin(x)', n: '7' }).poly, 'x - \\frac{1}{6}x^{3} + \\frac{1}{120}x^{5} - \\frac{1}{5040}x^{7}');
  assert.equal(solve({ f: 'cos(x)', n: '4' }).poly, '1 - \\frac{1}{2}x^{2} + \\frac{1}{24}x^{4}');
  assert.equal(solve({ f: 'ln(1+x)', n: '4' }).poly, 'x - \\frac{1}{2}x^{2} + \\frac{1}{3}x^{3} - \\frac{1}{4}x^{4}');
  assert.equal(solve({ f: 'tan(x)', n: '5' }).poly, 'x + \\frac{1}{3}x^{3} + \\frac{2}{15}x^{5}');
});

test('Taylor series about other points, and bad centres', () => {
  const s = solve({ f: 'sqrt(x)', a: '4', n: '2' });
  assert.equal(s.poly, '2 + \\frac{1}{4}\\left(x - 4\\right) - \\frac{1}{64}\\left(x - 4\\right)^{2}');
  assert.equal(s.name, 'Taylor');
  const t = solve({ f: 'sin(x)', a: 'pi/4', n: '2' });
  assert.match(t.poly, /^\\frac\{\\sqrt\{2\}\}\{2\} \+ \\frac\{\\sqrt\{2\}\}\{2\}\\left\(x - \\frac\{\\pi\}\{4\}\\right\)/);
  assert.equal(solve({ f: 'x^3 + 2x', a: '1', n: '4' }).poly, '3 + 5\\left(x - 1\\right) + 3\\left(x - 1\\right)^{2} + \\left(x - 1\\right)^{3}');
  assert.throws(() => solve({ f: 'ln(x)', n: '3' }), /not defined/);
  assert.throws(() => solve({ f: 'e^x', n: '20' }), /order n/);
});
