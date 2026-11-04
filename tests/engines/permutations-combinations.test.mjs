// Permutations and combinations: checks against known counts. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/permutations-combinations.js';

test('Counting: factorial, nPr, nCr', () => {
  assert.equal(solve({ mode: 'factorial', n: '5' }).result, 120n);
  assert.equal(solve({ mode: 'factorial', n: '0' }).result, 1n);
  assert.equal(solve({ mode: 'factorial', n: '25' }).result.toString(), '15511210043330985984000000');
  assert.equal(solve({ mode: 'npr', n: '10', r: '3' }).result, 720n);
  const c = solve({ mode: 'ncr', n: '10', r: '3' }); // page example
  assert.equal(c.result, 120n); assert.equal(c.permutations, 720n);
  assert.equal(solve({ mode: 'ncr', n: '52', r: '5' }).text, '2,598,960');
  assert.equal(solve({ mode: 'ncr', n: '100', r: '98' }).result, 4950n);
});

test('Counting: circular, repetition, repeated letters', () => {
  assert.equal(solve({ mode: 'circular', n: '6' }).result, 120n);
  assert.equal(solve({ mode: 'circular', n: '6', necklace: true }).result, 60n);
  const rep = solve({ mode: 'repetition', n: '3', r: '4' });
  assert.equal(rep.result, 81n); assert.equal(rep.selections, 15n);
  assert.equal(solve({ mode: 'word', word: 'MISSISSIPPI' }).result, 34650n);
  assert.equal(solve({ mode: 'word', word: 'maths' }).result, 120n);
});

test('Counting: bad input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ mode: 'ncr', n: '3', r: '5' }, /can't be bigger than n/);
  err({ mode: 'npr', n: '4.5', r: '2' }, /whole number/);
  err({ mode: 'factorial', n: '5000' }, /1000 or less/);
  err({ mode: 'word', word: '123' }, /letters only/);
});
