// QR decomposition by Gram–Schmidt, and eigenvalues by the QR algorithm. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/qr.js';

const S = (m) => m.map((r) => r.map(String));
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`);

test('QR decomposition', () => {
  const r = solve({ cells: S([[12, -51, 4], [6, 167, -68], [-4, 24, -41]]) }); // the standard example
  [[14, 21, -14], [0, 175, -70], [0, 0, 35]].forEach((row, i) => row.forEach((v, j) => near(r.R[i][j], v)));
  assert.equal(r.verified, true);
  assert.equal(solve({ cells: S([[3, -6], [4, -8], [0, 1]]) }).verified, true); // tall matrix
  assert.throws(() => solve({ cells: S([[1, 2], [2, 4]]) }), /not independent/);
});

test('QR algorithm for eigenvalues', () => {
  const e = solve({ cells: S([[4, 1, 0], [1, 3, 1], [0, 1, 2]]), mode: 'eigen' });
  [3 + Math.sqrt(3), 3, 3 - Math.sqrt(3)].forEach((v, i) => near(e.eigenvalues[i], v));
  assert.equal(e.verified, true);
});
