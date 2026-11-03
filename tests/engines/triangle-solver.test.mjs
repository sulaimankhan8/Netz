// Triangle solver: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../../src/app/utils/engines/triangle-solver.js';

const near = (a, b, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('Triangle solver: SSS, SAS, ASA, AAS', () => {
  const sss = solve({ mode: 'SSS', values: { a: '3', b: '4', c: '5' } }).triangles[0];
  near(sss.C, 90); near(sss.A, 36.8699); near(sss.area, 6);
  assert.equal(sss.kind, 'scalene, right');
  assert.equal(solve({ mode: 'SSS', values: { a: '2', b: '2', c: '2' } }).triangles[0].kind, 'equilateral, acute');
  const sas = solve({ mode: 'SAS', values: { b: '5', c: '7', A: '60' } }).triangles[0];
  near(sas.a, Math.sqrt(39)); near(sas.A + sas.B + sas.C, 180);
  const asa = solve({ mode: 'ASA', values: { A: '30', B: '60', c: '10' } }).triangles[0];
  near(asa.C, 90); near(asa.a, 5); near(asa.b, 8.66025);
  const aas = solve({ mode: 'AAS', values: { A: '30', B: '45', a: '10' } }).triangles[0];
  near(aas.C, 105); near(aas.b, 14.14214); near(aas.c, 19.31852);
});

test('Triangle solver: SSA ambiguous case gives 0, 1 or 2 triangles', () => {
  const two = solve({ mode: 'SSA', values: { a: '6', b: '10', A: '30' } });
  assert.equal(two.triangles.length, 2);
  near(two.triangles[0].B, 56.4427); near(two.triangles[1].B, 123.5573);
  two.triangles.forEach((t) => near(t.A + t.B + t.C, 180));
  assert.equal(solve({ mode: 'SSA', values: { a: '4', b: '10', A: '30' } }).triangles.length, 0);
  assert.equal(solve({ mode: 'SSA', values: { a: '12', b: '10', A: '30' } }).triangles.length, 1);
  assert.equal(solve({ mode: 'SSA', values: { a: '5', b: '10', A: '30' } }).triangles.length, 1); // right angle, sin B = 1
});

test('Triangle solver: impossible input gives a clear EngineError', () => {
  const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));
  err({ mode: 'SSS', values: { a: '1', b: '2', c: '5' } }, /can't make a triangle/);
  err({ mode: 'ASA', values: { A: '100', B: '90', c: '3' } }, /180° or more/);
  err({ mode: 'SAS', values: { b: '1', c: '1', A: '200' } }, /less than 180/);
  err({ mode: 'XYZ', values: {} }, /Choose what you know/);
});
