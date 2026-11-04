// Increasing and decreasing intervals: exact critical points, merging, domains and trig. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/monotonicity.js';

test('Increasing/decreasing: polynomials and fractions (exact)', () => {
  const r = solve({ f: '2x^3 - 9x^2 + 12x + 1' }); // NCERT
  assert.equal(r.increasing, '\\left(-\\infty,\\ 1\\right) \\cup \\left(2,\\ \\infty\\right)');
  assert.equal(r.decreasing, '\\left(1,\\ 2\\right)');
  assert.equal(r.table.length, 3);
  assert.equal(solve({ f: 'x^3' }).increasing, '\\mathbb{R}'); // f'(0) = 0 does not break it
  assert.equal(solve({ f: '1/x' }).increasing, null);
  assert.equal(solve({ f: 'x/(x^2+1)' }).increasing, '\\left(-1,\\ 1\\right)');
  assert.equal(solve({ f: 'ln(x)' }).increasing, '\\left(0,\\ \\infty\\right)'); // not defined for x ≤ 0
});

test('Increasing/decreasing: trig on [0, 2π], other functions on an interval', () => {
  const t = solve({ f: 'sin(x) + cos(x)', a: '0', b: '2pi' });
  assert.equal(t.decreasing, '\\left(\\frac{\\pi}{4},\\ \\frac{5\\pi}{4}\\right)');
  const s = solve({ f: 'sin(x)' }); // no interval: [0, 2π] by default, said in a note
  assert.match(s.increasing, /\\frac\{3\\pi\}\{2\}/);
  const e = solve({ f: 'x e^x' });
  assert.match(e.notes[0], /searched/);
  assert.throws(() => solve({ f: '5' }), /constant/);
  assert.throws(() => solve({ f: 'x^2', a: '1' }), /both ends/);
});
