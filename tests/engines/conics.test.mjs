// Conic sections: parabola, ellipse and hyperbola properties (NCERT 11 examples). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/conics.js';

const facts = (eq) => { const r = solve({ eq }); assert.equal(r.verified, true, eq); return Object.fromEntries(r.facts); };

test('Conics: parabolas', () => {
  const p = facts('y^2 = 12x');
  assert.deepEqual([p.Focus, p.Directrix, p['Latus rectum']], ['(3, 0)', 'x = -3', '12']);
  assert.deepEqual(facts('x^2 = -16y').Focus, '(0, -4)');
  const s = solve({ eq: 'y^2 - 4y - 8x + 28 = 0' });
  assert.equal(s.standard, '(y - 2)^2 = 8(x - 3)');
  assert.equal(Object.fromEntries(s.facts).Vertex, '(3, 2)');
});

test('Conics: ellipses and hyperbolas', () => {
  const e = facts('x^2/25 + y^2/9 = 1');
  assert.deepEqual([e.Foci, e['Eccentricity e'], e['Latus rectum']], ['(\\pm 4, 0)', '\\frac{4}{5}', '\\frac{18}{5}']);
  const e2 = facts('4x^2 + 9y^2 = 36');
  assert.deepEqual([e2.Foci, e2['Eccentricity e'], e2.Directrices], ['(\\pm \\sqrt{5}, 0)', '\\frac{\\sqrt{5}}{3}', 'x = \\pm \\frac{9}{\\sqrt{5}}']);
  assert.equal(facts('9x^2 + 4y^2 - 18x + 16y - 11 = 0').Centre, '(1, -2)');
  const h = facts('x^2/16 - y^2/9 = 1');
  assert.deepEqual([h.Foci, h['Eccentricity e'], h.Asymptotes], ['(\\pm 5, 0)', '\\frac{5}{4}', 'y = \\pm \\frac{3}{4}x']);
  assert.equal(solve({ eq: 'y^2/9 - x^2/16 = 1' }).standard, '\\frac{y^2}{9} - \\frac{x^2}{16} = 1');
  assert.equal(facts('x^2 - y^2 = 1').Asymptotes, 'y = \\pm x');
  assert.throws(() => solve({ eq: 'xy = 1' }), /rotated/);
  assert.throws(() => solve({ eq: 'x^2 + y^2 = 4' }), /circle/);
});
