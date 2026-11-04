// Vectors: reading i/j/k and (x, y, z), magnitude, dot, angle, cross, projection, triple product. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, readVector } from '../../src/app/utils/engines/vectors.js';

test('Vectors: reading the two ways of writing them', () => {
  assert.deepEqual(readVector('2i - j + 3k', 'a').v, [2, -1, 3]);
  assert.deepEqual(readVector('(2, -1, 3)', 'a').v, [2, -1, 3]);
  assert.deepEqual(readVector('-k', 'a').v, [0, 0, -1]);
  assert.deepEqual(readVector('<1,2>', 'a'), { v: [1, 2, 0], dim: 2 });
  assert.throws(() => readVector('2x + 3', 'a'), /not a number/);
});

test('Vectors: operations', () => {
  assert.equal(solve({ op: 'magnitude', a: '2i - j + 3k' }).answer, '|\\vec a| = \\sqrt{14}, \\quad \\hat{a} = \\frac{1}{\\sqrt{14}}\\left(2\\hat{i} - \\hat{j} + 3\\hat{k}\\right)');
  const d = solve({ op: 'dot', a: 'i + j', b: 'j + k' });
  assert.equal(d.answer, '\\vec a \\cdot \\vec b = 1, \\quad \\theta = \\frac{\\pi}{3}');
  assert.ok(solve({ op: 'dot', a: '(1,2,2)', b: '(2,-2,1)' }).steps.some((s) => s.title === 'Perpendicular'));
  const c = solve({ op: 'cross', a: '2i - j + k', b: 'i + 3j - 2k' });
  assert.equal(c.answer, '\\vec a \\times \\vec b = -\\hat{i} + 5\\hat{j} + 7\\hat{k}');
  assert.equal(c.verified, true);
  assert.equal(solve({ op: 'projection', a: '2i + 3j + 2k', b: 'i + 2j + k' }).answer, '\\text{proj}_{\\vec b}\\,\\vec a = \\frac{5}{3}\\hat{i} + \\frac{10}{3}\\hat{j} + \\frac{5}{3}\\hat{k}');
  assert.equal(solve({ op: 'triple', a: 'i + j + k', b: 'i - j + k', c: 'i + 2j - k' }).triple, 4);
  assert.ok(solve({ op: 'triple', a: 'i', b: 'j', c: 'i + j' }).steps.some((s) => s.title === 'Coplanar'));
});
