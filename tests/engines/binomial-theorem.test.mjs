// Binomial theorem: expansions, chosen terms, coefficients, constant and middle terms. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/binomial-theorem.js';

test('Binomial theorem: full expansions', () => {
  assert.equal(solve({ a: 'x', b: '2', n: '4' }).answer, 'x^{4} + 8x^{3} + 24x^{2} + 32x + 16');
  const r = solve({ a: '2x', b: '-3', n: '5' });
  assert.equal(r.answer, '32x^{5} - 240x^{4} + 720x^{3} - 1080x^{2} + 810x - 243');
  assert.equal(r.verified, true);
  assert.equal(solve({ a: 'x', b: 'y', n: '3' }).answer, 'x^{3} + 3x^{2}y + 3xy^{2} + y^{3}');
  assert.equal(solve({ a: '2a', b: '-b', n: '4' }).answer, '16a^{4} - 32a^{3}b + 24a^{2}b^{2} - 8ab^{3} + b^{4}');
});

test('Binomial theorem: particular terms (NCERT-style questions)', () => {
  assert.equal(solve({ a: 'x^2', b: '-1/x', n: '9', mode: 'constant' }).answer, 'T_{7} = 84');
  assert.equal(solve({ a: 'x', b: '1/x', n: '6', mode: 'constant' }).answer, 'T_{4} = 20');
  assert.match(solve({ a: 'x', b: '1/x', n: '5', mode: 'constant' }).answer, /no term independent/);
  assert.equal(solve({ a: '2x', b: '3', n: '7', mode: 'coef', k: '4' }).answer, '\\text{Coefficient of } x^{4} = 15120');
  assert.equal(solve({ a: 'x', b: '2', n: '8', mode: 'middle' }).answer, 'T_{5} = 1120x^{4}');
  assert.equal(solve({ a: 'x', b: 'y', n: '5', mode: 'middle' }).picked.length, 2);
  assert.equal(solve({ a: '1', b: 'x', n: '10', mode: 'term', r: '4' }).answer, '120x^{3}');
  assert.throws(() => solve({ a: 'x+1', b: '2', n: '3' }), /single term/);
});
