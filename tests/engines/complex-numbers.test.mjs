// Complex numbers: arithmetic, modulus, polar form (quadrants), De Moivre and square roots. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/complex-numbers.js';

const C = (c) => { const r = solve(c); assert.equal(r.verified, true, JSON.stringify(c)); return r.answer; };

test('Complex numbers: arithmetic', () => {
  assert.equal(C({ op: 'add', z1: '3 + 4i', z2: '1 - 2i' }), '4 + 2i');
  assert.equal(C({ op: 'subtract', z1: '3 + 4i', z2: '1 - 2i' }), '2 + 6i');
  assert.equal(C({ op: 'multiply', z1: '3 + 4i', z2: '1 - 2i' }), '11 - 2i');
  assert.equal(C({ op: 'divide', z1: '3 + 4i', z2: '1 - 2i' }), '-1 + 2i');
  assert.equal(C({ op: 'conjugate', z1: '2 - 5i' }), '2 + 5i');
  assert.throws(() => solve({ op: 'divide', z1: '1', z2: '0' }), /divide by 0/);
});

test('Complex numbers: modulus, polar form, powers and roots', () => {
  assert.equal(C({ op: 'modulus', z1: '3 + 4i' }), '5');
  assert.equal(C({ op: 'modulus', z1: '1 + 2i' }), '\\sqrt{5}');
  assert.equal(C({ op: 'polar', z1: '1 + i' }), '\\sqrt{2}\\left(\\cos \\frac{\\pi}{4} + i \\sin \\frac{\\pi}{4}\\right)');
  assert.equal(C({ op: 'polar', z1: '-1 + sqrt(3)i' }), '2\\left(\\cos \\frac{2\\pi}{3} + i \\sin \\frac{2\\pi}{3}\\right)'); // second quadrant
  assert.match(C({ op: 'polar', z1: '-2 - 2i' }), /\\cos \\left\(-\\frac\{3\\pi\}\{4\}\\right\)/); // third quadrant
  assert.equal(C({ op: 'power', z1: '1 + i', n: '8' }), '16');
  assert.equal(C({ op: 'power', z1: '1 + 2i', n: '3' }), '-11 - 2i');
  assert.equal(C({ op: 'sqrt', z1: '3 + 4i' }), '\\pm\\left(2 + i\\right)');
  assert.throws(() => solve({ op: 'add', z1: '3 + x', z2: '1' }), /numbers and i only/);
});
