// Bayes' theorem: total probability and posteriors, as exact fractions. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/bayes.js';

test("Bayes' theorem", () => {
  // Machines A, B, C make 25%, 35%, 40% of bolts; 5%, 4%, 2% are defective
  const r = solve({ priors: '0.25, 0.35, 0.40', likelihoods: '0.05, 0.04, 0.02', names: 'A, B, C' });
  assert.equal(r.PATex, '\\frac{69}{2000}');
  assert.deepEqual(r.posteriorTex, ['\\frac{25}{69}', '\\frac{28}{69}', '\\frac{16}{69}']);
  assert.equal(r.mostLikely, 1);
  assert.deepEqual(solve({ priors: '1/3, 1/3, 1/3', likelihoods: '1/2, 2/3, 1/4' }).posteriorTex, ['\\frac{6}{17}', '\\frac{8}{17}', '\\frac{3}{17}']);
  assert.throws(() => solve({ priors: '0.5, 0.4', likelihoods: '0.1, 0.2' }), /add up to 1/);
});
