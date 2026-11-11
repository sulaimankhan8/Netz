// Groups 4A and 4B: complex variables (Unit 14) and Fourier / Z transforms (Unit 13). Textbook answers
// (Grewal ch. 20, 22–23; Churchill). Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve as residues } from '../../src/app/utils/engines/residues.js';
import { solve as cauchy } from '../../src/app/utils/engines/cauchy-integral.js';
import { solve as contour } from '../../src/app/utils/engines/contour-integration.js';
import { solve as cr } from '../../src/app/utils/engines/cauchy-riemann.js';
import { solve as ft } from '../../src/app/utils/engines/fourier-transform.js';
import { solve as zt } from '../../src/app/utils/engines/z-transform.js';
import { solve as iz } from '../../src/app/utils/engines/inverse-z.js';
import { solve as dez } from '../../src/app/utils/engines/difference-equation-z.js';
import { solve as cfs } from '../../src/app/utils/engines/complex-fourier-series.js';

test('Residue theorem and Cauchy integral formula', () => {
  const r = residues({ f: '(z - 3)/(z^2 + 2z + 5)', center: '0', radius: '3' });
  assert.equal(r.integral, '2\\pi\\,i');
  assert.ok(r.verified);
  const c = cauchy({ f: 'e^z/(z - 1)', center: '0', radius: '2' });
  assert.ok(c.verified);
  assert.match(c.value, /2.*\\pi.*e.*i|2 ?e\\pi i|2\\pi e/);
});

test('Real integrals by contours', () => {
  assert.equal(contour({ mode: 'trig', f: '1/(5 + 4cos(θ))' }).value, '\\frac{2\\pi}{3}');
  assert.ok(contour({ mode: 'rational', f: '1/(x^2 + 1)^2' }).verified);
});

test('Cauchy–Riemann: z² + 2z is analytic, conj z is not', () => {
  assert.ok(cr({ mode: 'f', f: 'z^2 + 2z' }).analytic);
  assert.ok(!cr({ mode: 'f', f: 'conj(z)' }).analytic);
});

test('Fourier transforms', () => {
  assert.equal(ft({ mode: 'complex', f: '1 for |x| < 1' }).Ftex, '\\frac{2 \\sin\\left(\\omega\\right)}{\\omega}');
  assert.equal(ft({ mode: 'complex', f: 'e^(-|x|)' }).Ftex, '\\frac{2}{{\\omega}^{2}+1}');
  assert.equal(ft({ mode: 'complex', f: 'e^(-x^2)' }).Ftex, '\\sqrt{\\pi}\\,e^{-\\frac{\\omega^{2}}{4}}');
  assert.equal(ft({ mode: 'sine', f: 'e^(-x)' }).Ftex, '\\frac{\\omega}{{\\omega}^{2}+1}');
  for (const i of [{ mode: 'cosine', f: '1 for 0 < x < 2' }, { mode: 'sine', f: 'x e^(-x)' }]) assert.ok(ft(i).verified);
});

test('Z-transforms and inverses', () => {
  assert.equal(zt({ x: 'n 2^n' }).Ftex, '\\frac{2z}{\\left(z - 2\\right)^{2}}');
  assert.equal(zt({ x: 'cos(n pi/2)' }).Ftex, '\\frac{z^{2}}{z^{2} + 1}');
  assert.equal(iz({ F: 'z/((z - 1)(z - 2))' }).xTex, '2^{n} - 1');
  assert.equal(iz({ F: 'z/(z^2 + 1)' }).xTex, '\\sin\\left(\\frac{\\pi}{2}\\,n\\right)');
  assert.ok(iz({ F: 'z^3/((z - 1)(z - 1/2)^2)' }).verified);
});

test('Difference equations by the Z-transform', () => {
  assert.equal(dez({ eq: 'y(n+2) - 3y(n+1) + 2y(n) = 0', ics: 'y(0) = 0, y(1) = 1' }).yTex, '2^{n} - 1');
  const fib = dez({ eq: 'y(n) - y(n-1) - y(n-2) = 0', ics: 'y(0) = 0, y(1) = 1' });
  assert.ok(fib.verified);
  assert.match(fib.yTex, /\\sqrt\{5\}/);
  assert.ok(dez({ eq: 'y_{n+2} - 2y_{n+1} + y_n = 3n + 5', ics: 'y_0 = 0, y_1 = 0' }).verified);
});

test('Complex Fourier series and Parseval', () => {
  const r = cfs({ f: 'x', from: '-pi', to: 'pi' });
  assert.equal(r.parseval, '\\frac{\\pi^2}{3}');
  assert.ok(r.verified);
});
