// Matrix calculator: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/matrix-calculator.js';

const A = [['1', '2'], ['3', '4']];
const B = [['5', '6'], ['7', '8']];

test('Matrix calculator: page example and the other operations', () => {
  const ab = solve({ op: 'multiply', a: A, b: B });
  assert.deepEqual(ab.result, [[19, 22], [43, 50]]);
  assert.equal(ab.working[0].text, '(1)(5) + (2)(7) = 19');
  assert.deepEqual(solve({ op: 'multiply', a: B, b: A }).result, [[23, 34], [31, 46]]); // BA ≠ AB (FAQ)
  assert.deepEqual(solve({ op: 'add', a: A, b: B }).result, [[6, 8], [10, 12]]);
  assert.deepEqual(solve({ op: 'subtract', a: A, b: B }).result, [[-4, -4], [-4, -4]]);
  assert.deepEqual(solve({ op: 'scale', a: A, k: '1/2' }).result, [[0.5, 1], [1.5, 2]]);
  assert.deepEqual(solve({ op: 'transpose', a: [['1', '2', '3'], ['4', '5', '6']] }).result, [[1, 4], [2, 5], [3, 6]]);
  assert.deepEqual(solve({ op: 'power', a: [['1', '1'], ['1', '0']], n: '5' }).result, [[8, 5], [5, 3]]);
  assert.deepEqual(solve({ op: 'multiply', a: [['1', '2', '3']], b: [['1'], ['2'], ['3']] }).result, [[14]]);
});

test('Matrix calculator: size mismatches and bad numbers', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ op: 'add', a: A, b: [['1', '2', '3']] }, /same size/);
  err({ op: 'multiply', a: [['1', '2', '3']], b: A }, /columns of A must equal the rows of B/);
  err({ op: 'power', a: [['1', '2', '3']], n: '2' }, /square/);
  err({ op: 'power', a: A, n: '2.5' }, /whole number/);
  err({ op: 'scale', a: A, k: '' }, /k is empty/);
  err({ op: 'multiply', a: A, b: [['1', '?'], ['2', '3']] }, /Matrix B, row 1, column 2/);
});
