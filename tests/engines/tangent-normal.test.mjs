// Tangent and normal lines: ordinary, horizontal and vertical tangents, exact values. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/tangent-normal.js';

test('Tangent and normal: textbook curves', () => {
  const p = solve({ f: 'x^2', a: '1' });
  assert.equal(p.tangent.eq, 'y = 2x - 1');
  assert.equal(p.tangent.pointSlope, 'y - 1 = 2\\left(x - 1\\right)');
  assert.equal(p.normal.eq, 'y = -\\frac{1}{2}x + \\frac{3}{2}');
  assert.equal(p.verified, true);
  assert.equal(solve({ f: 'x^3 - 3x + 2', a: '2' }).tangent.eq, 'y = 9x - 14');
  assert.equal(solve({ f: 'e^x', a: '0' }).tangent.pointSlope, 'y - 1 = x');
  const s = solve({ f: 'sin(x)', a: 'pi/4' }); // exact √2/2 and π/4 in the point-slope form
  assert.equal(s.tangent.pointSlope, 'y - \\frac{\\sqrt{2}}{2} = \\frac{\\sqrt{2}}{2}\\left(x - \\frac{\\pi}{4}\\right)');
});

test('Tangent and normal: horizontal and vertical tangents, and points off the curve', () => {
  const flat = solve({ f: 'x^2 - 4x', a: '2' });
  assert.equal(flat.tangent.eq, 'y = -4');
  assert.equal(flat.normal.eq, 'x = 2');
  const steep = solve({ f: 'cbrt(x)', a: '0' });
  assert.equal(steep.tangent.eq, 'x = 0');
  assert.equal(steep.normal.eq, 'y = 0');
  assert.equal(steep.verified, true);
  assert.throws(() => solve({ f: 'ln(x)', a: '-1' }), /not defined/);
});
