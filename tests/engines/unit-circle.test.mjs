// Unit circle: checks against exact values. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, at, SPECIAL_ANGLES } from '../../src/app/utils/engines/unit-circle.js';
import { parseAngle } from '../../src/app/utils/numeric/geometry.js';

test('Unit circle: exact values, quadrants and reference angles', () => {
  const r = at(150);
  assert.equal(r.quadrant, 2); assert.equal(r.ref, 30); assert.equal(r.positive, 'Sin');
  assert.deepEqual(r.exact, { sin: '\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '-\\frac{\\sqrt{3}}{3}' });
  assert.equal(at(225).exact.sin, '-\\frac{\\sqrt{2}}{2}');
  assert.equal(at(225).exact.tan, '1');
  const up = at(90);
  assert.equal(up.tanUndefined, true); assert.equal(up.quadrant, 0); assert.equal(up.axis, 'positive y-axis');
  assert.equal(at(37).exact, null);
  assert.equal(at(180).sin, 0);
  assert.equal(SPECIAL_ANGLES.length, 17);
});

test('Unit circle: radians in and out, negative and big angles', () => {
  const r = solve({ angle: 'pi/3' });
  assert.equal(r.deg, 60); assert.equal(r.radTex, '\\frac{\\pi}{3}');
  assert.equal(solve({ angle: '2π/3' }).deg, 120);
  const neg = solve({ angle: '-30' });
  assert.equal(neg.t, 330); assert.equal(neg.coterminal, true);
  assert.equal(solve({ angle: '750' }).t, 30);
  assert.ok(Math.abs(solve({ angle: '1', unit: 'rad' }).deg - 57.29578) < 1e-4);
  assert.equal(parseAngle('-pi/2'), -90);
  assert.equal(parseAngle('0.5pi'), 90);
});

test('Unit circle: bad input gives a clear EngineError', () => {
  assert.throws(() => solve({ angle: '' }), (e) => e.name === 'EngineError' && /empty/.test(e.message));
  assert.throws(() => solve({ angle: 'abc' }), (e) => e.name === 'EngineError' && /not an angle/.test(e.message));
});
