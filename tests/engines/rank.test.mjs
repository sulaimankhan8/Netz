// Rank and RREF: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/rank.js';

test('Rank: page example takes the same steps as the worked example', () => {
  const r = solve({ cells: [['1', '2', '3'], ['2', '4', '6'], ['1', '1', '1']] });
  assert.equal(r.result, 2);
  assert.deepEqual(r.rref, [[1, 0, -1], [0, 1, 2], [0, 0, 0]]);
  assert.deepEqual(r.pivots, [0, 1]);
  assert.deepEqual(r.ops.map((o) => o.text), [
    'R₂ → R₂ − (2)R₁',
    'R₃ → R₃ − (1)R₁',
    'R₂ ↔ R₃',
    'R₂ → R₂ ÷ (-1)',
    'R₁ → R₁ − (2)R₂',
  ]);
});

test('Rank: rectangular, zero and full-rank matrices', () => {
  assert.equal(solve({ cells: [['1', '2', '3', '4'], ['2', '4', '6', '8']] }).result, 1);
  assert.equal(solve({ cells: [['0', '0'], ['0', '0']] }).result, 0);
  const full = solve({ cells: [['1', '0'], ['0', '1'], ['1', '1']] });
  assert.equal(full.result, 2);
  assert.ok(full.notes.some((n) => /full rank/.test(n)));
});

test('Rank: bad input gives a clear EngineError', () => {
  assert.throws(() => solve({ cells: [['1', 'two']] }), (e) => e.name === 'EngineError' && /"two" is not a number/.test(e.message));
});
