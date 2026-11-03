// Volume and surface area: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, SHAPES_3D } from '../../src/app/utils/engines/volume-surface-area.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const get = (r, key) => r.outputs.find((o) => o.key === key).value;

test('Volume & surface area: NCERT-style answers with π = 22/7', () => {
  const cyl = solve({ shape: 'cylinder', values: { r: '7', h: '10' }, pi: '22/7' });
  near(get(cyl, 'volume'), 1540); near(get(cyl, 'csa'), 440); near(get(cyl, 'tsa'), 748);
  const sph = solve({ shape: 'sphere', values: { r: '21' }, pi: '22/7' });
  near(get(sph, 'volume'), 38808); near(get(sph, 'tsa'), 5544);
  const hemi = solve({ shape: 'hemisphere', values: { r: '7' }, pi: '22/7' });
  near(get(hemi, 'csa'), 308); near(get(hemi, 'tsa'), 462); near(get(hemi, 'volume'), 2156 / 3);
});

test('Volume & surface area: exact π and the solids without π', () => {
  const cone = solve({ shape: 'cone', values: { r: '3', h: '4' } });
  near(get(cone, 'slant'), 5); near(get(cone, 'volume'), 12 * Math.PI); near(get(cone, 'csa'), 15 * Math.PI); near(get(cone, 'tsa'), 24 * Math.PI);
  assert.ok(cone.outputs.find((o) => o.key === 'volume').lines.includes('V = 12\\pi'));
  const fr = solve({ shape: 'frustum', values: { R: '4', r: '1', h: '4' } });
  near(get(fr, 'slant'), 5); near(get(fr, 'volume'), 28 * Math.PI); near(get(fr, 'csa'), 25 * Math.PI); near(get(fr, 'tsa'), 42 * Math.PI);
  const pyr = solve({ shape: 'pyramid', values: { a: '6', h: '4' } });
  near(get(pyr, 'slant'), 5); near(get(pyr, 'volume'), 48); near(get(pyr, 'lsa'), 60); near(get(pyr, 'tsa'), 96);
  const box = solve({ shape: 'cuboid', values: { l: '2', b: '3', h: '4' } });
  near(get(box, 'volume'), 24); near(get(box, 'lsa'), 40); near(get(box, 'tsa'), 52); near(get(box, 'diagonal'), Math.sqrt(29));
  const cube = solve({ shape: 'cube', values: { a: '5' } });
  near(get(cube, 'volume'), 125); near(get(cube, 'tsa'), 150);
  const prism = solve({ shape: 'prism', values: { B: '6', P: '12', h: '10' } });
  near(get(prism, 'volume'), 60); near(get(prism, 'tsa'), 132);
  assert.equal(SHAPES_3D.length, 9);
});

test('Volume & surface area: bad input gives a clear EngineError', () => {
  assert.throws(() => solve({ shape: 'cone', values: { r: '3', h: 'tall' } }), (e) => e.name === 'EngineError' && /"tall" is not a number/.test(e.message));
  assert.throws(() => solve({ shape: 'cube', values: { a: '0' } }), (e) => e.name === 'EngineError' && /more than 0/.test(e.message));
});
