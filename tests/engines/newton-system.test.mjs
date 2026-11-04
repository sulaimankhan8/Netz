// Newton's method for systems of nonlinear equations (2 and 3 unknowns). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/newton-system.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} ≈ ${b}`);

test("Newton's method for systems", () => {
  const r = solve({ f1: 'x^2 + y - 11', f2: 'x + y^2 - 7', x0: '3.5', y0: '-1.8' });
  assert.equal(r.converged, true);
  near(r.solution[0], 3.584428); near(r.solution[1], -1.848127);
  const c = solve({ f1: 'x^2 + y^2 = 4', f2: 'x*y = 1', x0: '2', y0: '0.5' }); // "=" form
  near(c.solution[0], 1.931852); near(c.solution[1], 0.517638);
  const three = solve({ f1: 'x^2 + y^2 + z^2 - 1', f2: '2x^2 + y^2 - 4z', f3: '3x^2 - 4y + z^2', x0: '0.5', y0: '0.5', z0: '0.5' });
  near(three.solution[0], 0.785197); near(three.solution[1], 0.496611); near(three.solution[2], 0.369923);
  assert.equal(three.verified, true);
  assert.throws(() => solve({ f1: 'x - y', f2: '2x - 2y - 1', x0: '0', y0: '0' }), /singular/);
  assert.throws(() => solve({ f1: 'x + z', f2: 'y', x0: '1', y0: '1' }), /only x, y/);
});
