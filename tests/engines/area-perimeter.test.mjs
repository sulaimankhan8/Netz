// Area and perimeter: checks against worked answers. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, SHAPES_2D } from '../../src/app/utils/engines/area-perimeter.js';

const near = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const get = (r, key) => r.outputs.find((o) => o.key === key).value;
const err = (args, re) => assert.throws(() => solve(args), (e) => e.name === 'EngineError' && re.test(e.message));

test('Area & perimeter: NCERT-style answers with π = 22/7', () => {
  const c = solve({ shape: 'circle', values: { r: '7' }, pi: '22/7' });
  near(get(c, 'area'), 154);
  near(get(c, 'circumference'), 44);
  const s = solve({ shape: 'sector', values: { r: '7', theta: '90' }, pi: '22/7' });
  near(get(s, 'area'), 38.5);
  near(get(s, 'arc'), 11);
  near(get(s, 'perimeter'), 25);
  const exact = solve({ shape: 'circle', values: { r: '7' } });
  near(get(exact, 'area'), 49 * Math.PI);
  assert.ok(exact.outputs[0].lines.includes('A = 49\\pi'));
});

test('Area & perimeter: triangles, quadrilaterals, polygon, ellipse', () => {
  const h = solve({ shape: 'triangle-sss', values: { a: '3', b: '4', c: '5' } });
  near(get(h, 'area'), 6);
  near(get(h, 'perimeter'), 12);
  near(get(solve({ shape: 'triangle-bh', values: { b: '10', h: '7' } }), 'area'), 35);
  const r = solve({ shape: 'rhombus', values: { d1: '16', d2: '12' } });
  near(get(r, 'area'), 96); near(get(r, 'side'), 10); near(get(r, 'perimeter'), 40);
  const t = solve({ shape: 'trapezium', values: { a: '10', b: '6', h: '4' } });
  near(get(t, 'area'), 32);
  assert.equal(t.outputs.some((o) => o.key === 'perimeter'), false);
  assert.ok(t.note);
  near(get(solve({ shape: 'trapezium', values: { a: '10', b: '6', h: '4', c: '5', d: '5' } }), 'perimeter'), 26);
  const hex = solve({ shape: 'polygon', values: { sides: '6', s: '2' } });
  near(get(hex, 'area'), 6 * Math.sqrt(3));
  near(get(hex, 'angle'), 120);
  near(get(solve({ shape: 'ellipse', values: { a: '3', b: '3' } }), 'perimeter'), 6 * Math.PI); // a circle
  near(get(solve({ shape: 'rectangle', values: { l: '1/2', b: '4' } }), 'area'), 2);
  near(get(solve({ shape: 'square', values: { a: '3' } }), 'diagonal'), 3 * Math.SQRT2);
  near(get(solve({ shape: 'parallelogram', values: { b: '8', h: '5', s: '6' } }), 'perimeter'), 28);
});

test('Area & perimeter: bad input gives a clear EngineError', () => {
  err({ shape: 'triangle-sss', values: { a: '1', b: '2', c: '3' } }, /can't make a triangle/);
  err({ shape: 'circle', values: { r: '' } }, /Radius r is empty/);
  err({ shape: 'circle', values: { r: '-2' } }, /more than 0/);
  err({ shape: 'polygon', values: { sides: '2.5', s: '1' } }, /whole number/);
  err({ shape: 'polygon', values: { sides: '2', s: '1' } }, /at least 3/);
  err({ shape: 'sector', values: { r: '1', theta: '400' } }, /at most 360/);
  err({ shape: 'blob', values: {} }, /Choose a shape/);
  assert.equal(SHAPES_2D.length, 11);
});
