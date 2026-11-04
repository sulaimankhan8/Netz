// Implicit differentiation: textbook curves, slopes at points, vertical tangents. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/implicit.js';

test('Implicit: circle, folium of Descartes, xy = 1 and functions of xy', () => {
  const circle = solve({ eq: 'x^2 + y^2 = 25', x0: '3', y0: '4' });
  assert.equal(circle.answer, '-\\frac{x}{y}');
  assert.equal(circle.verified, true);
  assert.equal(circle.point.slope, -0.75);
  assert.equal(circle.point.onCurve, true);
  assert.ok(circle.steps.some((s) => s.lines.some((l) => l.includes('= -2 x')))); // −2x, not −(2x)

  const folium = solve({ eq: 'x^3 + y^3 = 6xy', x0: '3', y0: '3' }); // "6xy" means 6·x·y
  assert.equal(folium.verified, true);
  assert.ok(Math.abs(folium.point.slope + 1) < 1e-12);

  assert.equal(solve({ eq: 'xy = 1' }).verified, true);
  assert.equal(solve({ eq: 'sin(x y) = x' }).verified, true);
  assert.equal(solve({ eq: 'e^y = x + y' }).answer, '\\frac{1}{{e}^{y}-1}');
});

test('Implicit: vertical tangents, points off the curve, and bad input', () => {
  const v = solve({ eq: 'x^2 + y^2 = 25', x0: '5', y0: '0' });
  assert.equal(v.point.vertical, true);
  assert.equal(v.point.slope, null);
  const off = solve({ eq: 'x^2 - xy + y^2 = 3', x0: '1', y0: '1' });
  assert.equal(off.point.onCurve, false);
  assert.match(off.notes[0], /not on the curve/);
  assert.throws(() => solve({ eq: 'x + 2 = 5' }), /no y/);
  assert.throws(() => solve({ eq: 'x^2 + z = 1' }), /only x and y/);
  assert.throws(() => solve({ eq: 'x = y = 1' }), /one = sign/);
});
