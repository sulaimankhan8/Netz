// Logarithms: exact values, change of base, exponential and log equations, the log laws. Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, prepare } from '../../src/app/utils/engines/logarithms.js';

test('Logarithms: evaluate', () => {
  assert.equal(solve({ mode: 'evaluate', b: '2', x: '8' }).answer, '3');
  assert.equal(solve({ mode: 'evaluate', b: '9', x: '3' }).answer, '\\frac{1}{2}');
  assert.equal(solve({ mode: 'evaluate', b: '10', x: '0.001' }).answer, '-3');
  const r = solve({ mode: 'evaluate', b: '3', x: '20' });
  assert.equal(r.exact, false);
  assert.ok(Math.abs(r.value - Math.log(20) / Math.log(3)) < 1e-12);
  assert.throws(() => solve({ mode: 'evaluate', b: '1', x: '5' }), /not 1/);
  assert.throws(() => solve({ mode: 'evaluate', b: '2', x: '-4' }), /positive/);
});

test('Logarithms: solve exponential and log equations', () => {
  const S = (eq) => { const r = solve({ mode: 'solve', eq }); assert.equal(r.verified, true, eq); return r.answer; };
  assert.equal(S('2^(x+1) = 8'), 'x = 2');
  assert.equal(S('3*2^(x-1) + 5 = 29'), 'x = 4');
  assert.equal(S('4^(2x-1) = 64'), 'x = 2');
  assert.match(S('5^x = 20'), /^x = \\log_\{5\} 20 \\approx 1\.86135/);
  assert.match(S('e^(2x) = 7'), /^x = \\frac\{\\ln 7\}\{2\}/);
  assert.match(S('2 ln(x + 1) = 6'), /^x = e\^\{3\} - 1/);
  assert.equal(S('log_2(x - 3) = 5'), 'x = 35');
  assert.equal(S('log(2x) = 2'), 'x = 50'); // log is base 10
  assert.throws(() => solve({ mode: 'solve', eq: '2^x = -4' }), /no solution/);
  assert.equal(prepare('log_2(x - (1))'), 'log(x - (1), 2)');
});

test('Logarithms: expand with the laws', () => {
  assert.equal(solve({ mode: 'expand', expr: 'x^2 y / z^3', b: '10' }).answer, '2 \\log x + \\log y - 3 \\log z');
  assert.equal(solve({ mode: 'expand', expr: '8x / sqrt(y)', b: '2' }).answer, '\\log_{2} x - \\frac{1}{2} \\log_{2} y + 3');
});
