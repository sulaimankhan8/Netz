// Maxima and minima: second and first derivative tests, corners, absolute extremes. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/maxima-minima.js';

const summary = (r) => r.points.map((p) => `${p.type}@${p.xTex}=${p.yTex}`).join('; ');

test('Maxima/minima: local extremes', () => {
  assert.equal(summary(solve({ f: '2x^3 - 9x^2 + 12x + 1' })), 'max@1=6; min@2=5');
  assert.equal(summary(solve({ f: 'x^4 - 2x^2' })), 'min@-1=-1; max@0=0; min@1=-1');
  const flat = solve({ f: 'x^3' }); // f''(0) = 0: no decision, and no sign change
  assert.equal(flat.points[0].secondTest, 'none');
  assert.equal(flat.points[0].type, 'neither');
  assert.equal(summary(solve({ f: 'x e^x' })), 'min@-1=-\\frac{1}{e}');
  assert.equal(summary(solve({ f: 'abs(x)' })), 'min@0=0'); // corner: f' undefined, first derivative test
});

test('Maxima/minima: absolute values on a closed interval', () => {
  const r = solve({ f: 'x^3 - 3x', a: '-2', b: '3' });
  assert.equal(r.absolute.max.yTex, '18');
  assert.deepEqual(r.absolute.max.at, ['3']);
  assert.equal(r.absolute.min.yTex, '-2');
  assert.deepEqual(r.absolute.min.at, ['-2', '1']); // reached twice
  const t = solve({ f: 'sin(x) + cos(x)', a: '0', b: '2pi' });
  assert.equal(t.absolute.max.yTex, '\\sqrt{2}');
  assert.equal(solve({ f: 'x^2' }).absolute, null);
});
