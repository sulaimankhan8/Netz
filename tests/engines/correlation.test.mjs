// Correlation: Karl Pearson's r and Spearman's rank correlation (with ties). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/correlation.js';

test('Correlation: Pearson and Spearman', () => {
  const p = solve({ method: 'pearson', x: '1, 2, 3, 4, 5', y: '2, 4, 5, 4, 5' });
  assert.equal(p.rTex, '0.7746');
  assert.equal(p.verified, true);
  assert.equal(solve({ method: 'pearson', x: '1, 2, 3', y: '6, 4, 2' }).r, -1);
  // Textbook example with tied ranks: ρ = 0.545
  const s = solve({ method: 'spearman', x: '68, 64, 75, 50, 64, 80, 75, 40, 55, 64', y: '62, 58, 68, 45, 81, 60, 68, 48, 50, 70' });
  assert.equal(s.rTex, '0.5455');
  assert.equal(solve({ method: 'spearman', x: '1, 2, 3, 4', y: '10, 20, 30, 40' }).r, 1);
  assert.throws(() => solve({ method: 'pearson', x: '1, 2, 3', y: '1, 2' }), /pair up/);
});
