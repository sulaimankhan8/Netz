// Cases for the code-export checks (tests/engines/code-export.test.mjs, scripts/check-code-export.mjs).
// Each case: the method id, the inputs exactly as the page passes them to its engine, and pick(out),
// the numbers from the page's engine that the exported program must print. `say` lists text the
// program must print (in order); `tol` loosens the match for methods with random or rounded output.

import { METHOD_WIDGETS } from '../../src/app/data/methodWidgets.js';

const nums = (s) => (String(s ?? '').replace(/−/g, '-').replace(/,(?=\d{2,3}\b)/g, '').match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || []).map(Number);
const frac = (s) => {
  const t = String(s ?? '');
  const m = t.match(/^(-)?\\frac\{(\d+)\}\{(\d+)\}$/) || t.match(/^(-)?(\d+)\/(\d+)$/);
  return m ? (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3])) : Number(t);
};
const complexParts = (s) => nums(String(s).replace(/\s+([+-])\s+/g, ' $1'));
const leaves = (v) => (typeof v === 'number' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : []);
const outs = (o) => o.outputs.map((x) => x.value);

export const CASES = [
  /* ---------- Units 1–4: numerical methods ---------- */
  { id: 'sor', raw: { cells: [['4', '1', '1'], ['1', '5', '2'], ['1', '2', '4']], b: '6 8 7', omega: '1.25', tol: '0.0001', maxIter: '100' }, pick: (o) => o.result },
  { id: 'difference-table', raw: { x: '1, 2, 3, 4, 5', y: '1, 8, 27, 64, 125', notation: 'forward' }, pick: (o) => [o.result] },
  { id: 'cubic-spline', raw: { x: '0 1 2 3', y: '1 2 9 28', at: '1.5', type: 'natural' }, pick: (o) => [o.value] },
  { id: 'cubic-spline', raw: { x: '0 1 2 3', y: '0 1 8 27', at: '2.5', type: 'clamped', s0: '0', sn: '27' }, pick: (o) => [o.value] },
  { id: 'romberg', raw: { f: '1/(1+x^2)', a: '0', b: '1', levels: '3' }, pick: (o) => [o.best] },
  { id: 'romberg', raw: { f: 'sin(x)', a: '0', b: 'pi', levels: '4' }, pick: (o) => [o.best] },
  { id: 'power-method', raw: { cells: [['2', '0', '0'], ['0', '3', '4'], ['0', '4', '9']], mode: 'largest', tol: '0.0001', maxIter: '50' }, pick: (o) => [o.eigenvalue] },
  { id: 'power-method', raw: { cells: [['2', '0', '0'], ['0', '3', '4'], ['0', '4', '9']], mode: 'smallest', tol: '0.0001', maxIter: '50' }, pick: (o) => [o.eigenvalue] },
  { id: 'rk2', raw: { f: 'x + y', x0: '0', y0: '1', h: '0.1', xn: '0.3', variant: 'heun' }, pick: (o) => [o.result] },
  { id: 'rk2', raw: { f: 'x*y', x0: '0', y0: '1', h: '0.2', xn: '0.6', variant: 'midpoint' }, pick: (o) => [o.result] },
  { id: 'milne', raw: { f: 'x + y', x0: '0', y0: '1', h: '0.1', xn: '0.6' }, pick: (o) => [o.result] },
  { id: 'adams', raw: { f: 'x + y', x0: '0', y0: '1', h: '0.1', xn: '0.6' }, pick: (o) => [o.result] },
  { id: 'stirling', raw: { x: '20 25 30 35 40', y: '49225 48316 47236 45926 44306', at: '28' }, pick: (o) => [o.result] },
  { id: 'bessel', raw: { x: '20 24 28 32', y: '2854 3162 3544 3992', at: '25' }, pick: (o) => [o.result] },
  { id: 'newton-system', pick: (o) => o.result },
  { id: 'double-integration', pick: (o) => [o.result] },
  { id: 'double-integration', raw: { f: 'x*y', a: '0', b: '1', c: '0', d: '2', m: '4', n: '4', rule: 'simpson' }, pick: (o) => [o.result] },
  { id: 'cholesky', raw: { cells: [['4', '2', '14'], ['2', '17', '-5'], ['14', '-5', '83']], b: '14, -101, 155' }, pick: (o) => o.result.flat() },
  { id: 'qr', raw: { cells: [['1', '1', '0'], ['1', '0', '1'], ['0', '1', '1']], mode: 'decompose' }, pick: (o) => leaves(o.result.R) },
  { id: 'qr', raw: { cells: [['2', '1'], ['1', '3']], mode: 'eigen' }, pick: () => [(5 + Math.sqrt(5)) / 2, (5 - Math.sqrt(5)) / 2] },
  { id: 'jacobi-eigen', raw: { cells: [['6', '-2', '2'], ['-2', '3', '-1'], ['2', '-1', '3']], tol: '1e-6' }, pick: (o) => o.result },
  { id: 'golden-section', pick: (o) => [o.x, o.fx] },
  { id: 'golden-section', raw: { f: 'x*(4 - x)', a: '0', b: '4', tol: '0.0001', goal: 'max' }, pick: (o) => [o.x, o.fx] },
  { id: 'gradient-descent', pick: (o) => [o.fx] },
  { id: 'finite-difference-bvp', pick: (o) => o.rows.map((r) => r.y) },
  { id: 'shooting-method', pick: (o) => [o.slope] },
  { id: 'heat-equation', pick: (o) => Object.values(o.rows.at(-1)).slice(1) },
  { id: 'heat-equation', raw: { method: 'crank', f: '4x - x^2', L: '4', c2: '1', h: '1', k: '0.5', g0: '0', g1: '0', steps: '3' }, pick: (o) => Object.values(o.rows.at(-1)).slice(1) },
  { id: 'laplace-liebmann', pick: (o) => o.grid.slice(1, -1).flatMap((r) => r.slice(1, -1)), tol: 0.002 },
  { id: 'monte-carlo-integration', pick: () => [1 / 3], tol: 0.04 },
  { id: 'monte-carlo-integration', raw: { mode: 'hit', f: 'x^2', a: '0', b: '1', N: '5000', seed: '3' }, pick: () => [1 / 3], tol: 0.04 },
  { id: 'wave-equation', pick: (o) => Object.values(o.result).slice(1) },
  { id: 'conjugate-gradient', pick: (o) => o.result.map(frac) },
  { id: 'chebyshev-nodes', pick: (o) => o.result },
  { id: 'floating-point-representation', pick: (o) => [Number(o.stored)] },
  { id: 'floating-point-representation', raw: { x: '-13.625', format: 'double' }, pick: () => [-13.625] },
  { id: 'muller-method', pick: (o) => [Number(o.root)] },
  { id: 'bairstow-method', pick: (o) => o.result.flatMap(complexParts) },
  { id: 'horner-method', pick: (o) => [Number(o.root)] },
  { id: 'graeffe-root-squaring', pick: (o) => o.result.map(Number), tol: 0.002 },
  { id: 'hermite-interpolation', pick: (o) => [frac(o.result)] },
  { id: 'inverse-interpolation', pick: (o) => [o.x] },
  { id: 'inverse-interpolation', raw: { method: 'iteration', x: '20 25 30 35', y: '0.342 0.423 0.5 0.574', target: '0.390' }, pick: (o) => [o.x] },
  { id: 'everett-interpolation', pick: (o) => [o.y] },

  /* ---------- Unit 5: statistics ---------- */
  { id: 'descriptive-statistics', pick: (o) => [o.mean, o.median, o.variance, o.sd, o.q1, o.q3] },
  { id: 'descriptive-statistics', raw: { mode: 'discrete', x: '1, 2, 3, 4', f: '3, 5, 8, 4', data: '', classes: '' }, pick: (o) => [o.mean, o.median, o.variance] },
  { id: 'descriptive-statistics', raw: { mode: 'grouped', classes: '0-10, 10-20, 20-30, 30-40', f: '5, 8, 12, 5', data: '', x: '' }, pick: (o) => [o.mean, o.median, o.mode, o.variance] },
  { id: 'correlation', pick: (o) => [o.r] },
  { id: 'correlation', raw: { method: 'spearman', x: '10, 20, 30, 40, 50', y: '12, 28, 24, 45, 41' }, pick: (o) => [o.r] },
  { id: 'regression', pick: (o) => [o.byx, o.bxy, o.ayx, o.axy, o.r] },
  { id: 'curve-fitting', pick: (o) => nums(o.equation) },
  { id: 'curve-fitting', raw: { model: 'power', x: '1, 2, 3, 4', y: '3, 12, 27, 48', degree: '2', at: '' }, pick: (o) => nums(o.equation) },
  { id: 'curve-fitting', raw: { model: 'polynomial', x: '0, 1, 2, 3, 4', y: '1, 1.8, 3.3, 4.5, 6.3', degree: '2', at: '' }, pick: (o) => nums(o.equation).filter((v) => v !== 2) },
  { id: 'binomial', pick: (o) => [o.value, o.mean, o.variance] },
  { id: 'binomial', raw: { n: '8', p: '0.5', query: 'ge', k: '6', a: '', b: '' }, pick: (o) => [o.value] },
  { id: 'poisson', raw: { source: 'lambda', lambda: '2', n: '200', p: '0.01', query: 'eq', k: '3', a: '1', b: '3' }, pick: (o) => [o.value] },
  { id: 'poisson', raw: { source: 'binomial', lambda: '', n: '200', p: '0.01', query: 'ge', k: '1', a: '', b: '' }, pick: (o) => [o.value] },
  { id: 'normal', pick: (o) => [o.value] },
  { id: 'normal', raw: { mu: '60', sigma: '10', query: 'inverse', a: '', b: '', p: '0.9' }, pick: (o) => [o.value] },
  { id: 'bayes', pick: (o) => [o.PA, ...o.result] },
  { id: 'random-variables', pick: (o) => [o.mean, o.variance] },
  { id: 'random-variables', raw: { kind: 'continuous', x: '', p: '', f: '2x', a: '0', b: '1', c: '0', d: '0.5' }, pick: (o) => [o.mean, o.variance, o.prob] },
  { id: 'anova', pick: (o) => o.result.flatMap((t) => [t.F, t.crit]) },
  { id: 'anova', raw: { kind: 'two', groups: '20, 18, 22; 24, 26, 25; 19, 21, 20', alpha: '0.05' }, pick: (o) => o.result.flatMap((t) => [t.F, t.crit]) },
  { id: 'exponential-dist', pick: (o) => [o.p] },
  { id: 'uniform-dist', pick: (o) => [frac(o.p), frac(o.mean), frac(o.variance)] },
  { id: 'geometric-dist', pick: (o) => [o.p] },
  { id: 'gamma-dist', pick: (o) => [o.p] },
  { id: 'gamma-dist', raw: { alpha: '2.5', theta: '2', mode: 'between', x: '', a: '2', b: '8' }, pick: (o) => [o.p] },
  { id: 'joint-distribution', pick: (o) => [frac(o.EX), frac(o.EY), frac(o.cov)] },
  { id: 'confidence-interval', pick: (o) => [o.margin, ...nums(o.interval)] },
  { id: 'confidence-interval', raw: { mode: 't', xbar: '50', sd: '10', n: '16', level: '95', x: '' }, pick: (o) => [o.margin, ...nums(o.interval)] },
  { id: 'non-parametric-tests', pick: (o) => [o.p] },
  { id: 'non-parametric-tests', raw: { test: 'mann', x: '12 15 9 18 20', y: '22 25 19 28 30 17', m0: '', alpha: '0.05' }, pick: (o) => [o.statistic, o.p, o.z] },
  { id: 'control-charts', pick: (o) => [...Object.values(o.limits), ...Object.values(o.rLimits)] },
  { id: 'control-charts', raw: { chart: 'p', data: '4 6 5 8 3 7', n: '100' }, pick: (o) => Object.values(o.limits) },
  { id: 'markov-chain', pick: (o) => o.result.map(frac) },

  /* ---------- Unit 8: matrices ---------- */
  { id: 'determinant', raw: { cells: [['2', '-3', '1'], ['2', '0', '-1'], ['1', '4', '5']], method: 'cofactor' }, pick: (o) => [o.result] },
  { id: 'matrix-inverse', raw: { cells: [['1', '2', '3'], ['0', '1', '4'], ['5', '6', '0']], method: 'adjoint' }, pick: (o) => o.result.flat() },
  { id: 'rank', raw: { cells: [['1', '2', '3'], ['2', '4', '6'], ['1', '1', '1']] }, pick: (o) => [o.result] },
  { id: 'matrix-calculator', raw: { op: 'multiply', a: [['1', '2'], ['3', '4']], b: [['5', '6'], ['7', '8']], k: '2', n: '3' }, pick: (o) => o.result.flat() },
  { id: 'matrix-calculator', raw: { op: 'power', a: [['1', '1'], ['1', '0']], b: [['0']], k: '', n: '5' }, pick: (o) => o.result.flat() },
  { id: 'consistency', raw: { cells: [['1', '1', '1', '6'], ['1', '2', '3', '14'], ['2', '3', '4', '20']] }, pick: (o) => [o.rankA, o.rankAug] },
  { id: 'consistency', raw: { cells: [['2', '1', '5'], ['1', '-1', '1']] }, pick: () => [2, 1] },
  { id: 'linear-dependence', raw: { cells: [['1', '2', '1'], ['2', '1', '0'], ['3', '3', '1']] }, pick: (o) => [o.rank] },
  { id: 'eigenvalues', raw: { cells: [['4', '1'], ['2', '3']] }, pick: (o) => o.result },
  { id: 'eigenvalues', raw: { cells: [['2', '0', '0'], ['0', '3', '4'], ['0', '4', '9']] }, pick: (o) => o.result },
  { id: 'cayley-hamilton', raw: { cells: [['2', '-1', '1'], ['-1', '2', '-1'], ['1', '-1', '2']] }, pick: (o) => o.result.flat() },
  { id: 'vectors', pick: (o) => [o.dot, o.degrees] },
  { id: 'vectors', raw: { op: 'cross', a: '2i - j + 3k', b: '(1, 1, 1)', c: '' }, pick: () => [-4, 1, 3] },
  { id: 'diagonalization', raw: { cells: [['2', '0', '0'], ['0', '3', '4'], ['0', '4', '9']], power: '3' }, pick: (o) => o.result },
  { id: 'quadratic-form', pick: (o) => (o.result.match(/-?\d+(?:\.\d+)?(?=y_)/g) || []).map(Number) },
  { id: 'svd-calculator', pick: (o) => o.result.map(Number) },
  { id: 'linear-transformations', pick: (o) => o.result },

  /* ---------- Unit 9: geometry ---------- */
  { id: 'area-perimeter', raw: { shape: 'triangle-sss', values: { a: '13', b: '14', c: '15' } }, pick: outs },
  { id: 'area-perimeter', raw: { shape: 'sector', values: { r: '7', theta: '90' }, pi: '22/7' }, pick: outs },
  { id: 'volume-surface-area', raw: { shape: 'cylinder', values: { r: '7', h: '10' }, pi: '22/7' }, pick: outs },
  { id: 'volume-surface-area', raw: { shape: 'frustum', values: { R: '6', r: '3', h: '4' }, pi: 'exact' }, pick: outs },
  { id: 'pythagoras', raw: { a: '', b: '12', c: '13' }, pick: (o) => [o.result, o.area, o.perimeter] },
  { id: 'triangle-solver', raw: { mode: 'SSS', values: { a: '7', b: '8', c: '9', A: '60', B: '45' } }, pick: (o) => o.triangles.flatMap((t) => [t.a, t.b, t.c, t.A, t.B, t.C]) },
  { id: 'triangle-solver', raw: { mode: 'SSA', values: { a: '6', b: '8', A: '35' } }, pick: (o) => o.triangles.flatMap((t) => [t.c, t.B, t.C]) },
  { id: 'unit-circle', raw: { angle: '150', unit: 'deg' }, pick: (o) => [o.sin, o.cos, o.tan] },
  { id: 'coordinate-geometry', raw: { mode: 'distance', p1: { x: '1', y: '2' }, p2: { x: '4', y: '6' }, p3: { x: '0', y: '0' }, m: '2', n: '1', external: false }, pick: (o) => [o.result] },
  { id: 'coordinate-geometry', raw: { mode: 'section', p1: { x: '1', y: '2' }, p2: { x: '4', y: '6' }, m: '2', n: '1', external: true }, pick: (o) => [o.result.x, o.result.y] },
  { id: 'coordinate-geometry', raw: { mode: 'triangle', p1: { x: '0', y: '0' }, p2: { x: '4', y: '0' }, p3: { x: '0', y: '3' } }, pick: (o) => [o.result] },
  { id: 'circles', pick: (o) => [o.h, o.k, o.r] },
  { id: 'circles', raw: { from: 'three', h: '', k: '', r: '', eq: '', x1: '0', y1: '0', x2: '4', y2: '0', x3: '0', y3: '2', px: '5', py: '5' }, pick: (o) => [o.h, o.k, o.r] },
  { id: 'circles', raw: { from: 'general', eq: '2x^2 + 2y^2 - 8x + 4y - 10 = 0', h: '', k: '', r: '' }, pick: (o) => [o.h, o.k, o.r] },
  { id: 'conics', pick: (o) => [o.e] },
  { id: 'conics', raw: { eq: 'y^2 = 8x' }, pick: () => [2, 0, -2] },
  { id: 'conics', raw: { eq: '9x^2 - 16y^2 = 144' }, pick: (o) => [o.e] },
  { id: 'heights-distances', pick: (o) => [o.result.value] },
  { id: 'heights-distances', raw: { type: 'two-points', d: '100', h: '', theta: '', alpha: '60', beta: '30', eye: '', side: 'same', unit: 'm' }, pick: (o) => [o.result.value] },
  { id: 'inverse-trig', pick: (o) => [o.value] },
  { id: 'inverse-trig', raw: { mode: 'sum', fn: 'tan', value: '', angle: '', a: '1/2', b: '1/3', op: '+' }, pick: () => [Math.PI / 4] },
  { id: 'geometry-3d', pick: (o) => [o.value] },
  { id: 'geometry-3d', raw: { mode: 'point-plane', p: '1, 2, 3', q: '', s: '', d1: '', d2: '', plane: '2x + y - 2z = 5', plane2: '' }, pick: (o) => [o.value] },
  { id: 'polar-coordinates', pick: (o) => [o.plot.r, o.plot.theta] },
  { id: 'polar-coordinates', raw: { mode: 'to-cartesian', x: '', y: '', r: '4', theta: '150', unit: 'deg', h: '', k: '', curve: '' }, pick: (o) => [o.plot.x, o.plot.y] },

  /* ---------- Unit 10: finance ---------- */
  { id: 'percentage', raw: { mode: 'profit-loss', values: { cp: '800', sp: '900' }, currency: 'INR' }, pick: (o) => [o.amount, o.result] },
  { id: 'percentage', raw: { mode: 'discount', values: { mp: '1000', discounts: '20, 10' }, currency: 'INR' }, pick: (o) => [o.result] },
  { id: 'compound-interest', raw: { kind: 'compound', principal: '8000', rate: '10', time: '1.5', timeUnit: 'years', frequency: '2', currency: 'INR' }, pick: (o) => [o.amount, o.interest] },
  { id: 'compound-interest', raw: { kind: 'simple', principal: '5000', rate: '8', time: '18', timeUnit: 'months', frequency: '1', currency: 'INR' }, pick: (o) => [o.amount, o.interest] },
  { id: 'emi', raw: { principal: '500000', rate: '9', tenure: '5', tenureUnit: 'years', method: 'reducing', prepayAmount: '', prepayMonth: '', currency: 'INR' }, pick: (o) => [o.emi, o.totalInterest, o.totalPaid] },
  { id: 'emi', raw: { principal: '500000', rate: '9', tenure: '5', tenureUnit: 'years', method: 'reducing', prepayAmount: '100000', prepayMonth: '12', currency: 'INR' }, pick: (o) => [o.emi, o.prepay.months, o.prepay.interest] },
  { id: 'fd', raw: { principal: '100000', rate: '7', years: '5', months: '', days: '', frequency: '4', payout: 'cumulative' }, pick: (o) => [o.result] },
  { id: 'rd', raw: { instalment: '5000', rate: '6.8', years: '5', months: '' }, pick: (o) => [o.result] },
  { id: 'sip', raw: { monthly: '10000', rate: '12', years: '10', stepUp: '0' }, pick: (o) => [o.result] },
  { id: 'sip', raw: { monthly: '5000', rate: '10', years: '3', stepUp: '10' }, pick: (o) => [o.result] },
  { id: 'lumpsum', raw: { amount: '100000', rate: '12', years: '10', inflation: '6' }, pick: (o) => [o.result] },
  { id: 'tvm', pick: (o) => [o.value] },
  { id: 'tvm', raw: { mode: 'bond', pmt: '', rate: '8', n: '5', freq: '2', due: 'no', fv: '', growth: '', face: '1000', coupon: '10' }, pick: (o) => [o.value] },
  { id: 'npv-irr', pick: (o) => [o.npvValue, parseFloat(o.irr), o.payback] },
  { id: 'cagr', pick: (o) => [parseFloat(o.cagr)] },
  { id: 'depreciation', pick: (o) => o.rows.map((r) => nums(r.close)[0]) },
  { id: 'depreciation', raw: { method: 'syd', cost: '100000', salvage: '10000', life: '4', rate: '' }, pick: (o) => o.rows.map((r) => nums(r.close)[0]) },

  /* ---------- Unit 7: algebra ---------- */
  { id: 'quadratic', raw: { a: '2', b: '-7', c: '3' }, pick: (o) => [...o.result, o.D] },
  { id: 'system-of-equations', raw: { cells: [['1', '1', '1', '6'], ['0', '2', '5', '-4'], ['2', '5', '-1', '27']], method: 'cramer' }, pick: (o) => o.result },
  { id: 'progressions', raw: { mode: 'ap', a: '5', d: '4', r: '2', n: '20', terms: '' }, pick: (o) => [o.nth, o.sum] },
  { id: 'progressions', raw: { mode: 'gp', a: '3', d: '', r: '0.5', n: '6', terms: '' }, pick: (o) => leaves([o.nth, o.sum, o.sInf]).filter((v) => v !== null) },
  { id: 'permutations-combinations', raw: { mode: 'ncr', n: '10', r: '3', word: '', necklace: false }, pick: (o) => [Number(o.text)] },
  { id: 'permutations-combinations', raw: { mode: 'word', n: '', r: '', word: 'MISSISSIPPI', necklace: false }, pick: (o) => [Number(o.text)] },
  { id: 'set-operations', pick: (o) => [o.result[0]] },
  { id: 'set-operations', raw: { mode: 'relation', U: '', A: '1, 2, 3', B: '', C: '', expression: '', relation: '(1,1), (2,2), (3,3), (1,2), (2,1)' }, say: () => ['Reflexive: yes', 'Symmetric: yes', 'Transitive: yes'] },

  /* ---------- Units 13, 6 and 15: algorithms ---------- */
  { id: 'dft-fft', pick: (o) => o.X.flatMap(complexParts) },
  { id: 'dft-fft', raw: { mode: 'idft', x: '10, -2+2i, -2, -2-2i' }, pick: () => [1, 2, 3, 4] },
  { id: 'harmonic-analysis', pick: (o) => [o.a0, Number(o.amplitude)] },
  { id: 'truth-table', say: (o) => [`a ${o.verdict}`] },
  { id: 'truth-table', raw: { f: 'p -> q', g: '~p | q' }, say: () => ['logically equivalent'] },
  { id: 'modular-arithmetic', pick: (o) => [nums(o.answer).at(-1)] },
  { id: 'modular-arithmetic', raw: { mode: 'rsa', a: '', b: '', m: '', p: '61', q: '53', e: '17', msg: '65' }, pick: () => [3233, 3120, 2753, 2790, 65] },
  { id: 'modular-arithmetic', raw: { mode: 'congruence', a: '14', b: '30', m: '100', p: '', q: '', e: '', msg: '' }, pick: () => [45, 50] },
  { id: 'dijkstra', pick: (o) => o.paths.map((q) => Number(q.d)) },
  { id: 'bfs-dfs', say: (o) => o.order.map((nm) => `Visit ${nm}`) },
  { id: 'bfs-dfs', raw: { edges: 'A B; A C; B D; B E; C F; E F; D G', start: 'A', mode: 'dfs', directed: 'no' }, say: (o) => o.order.map((nm) => `Visit ${nm}`) },
  { id: 'mst', pick: (o) => [o.total] },
  { id: 'mst', raw: { edges: 'A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2', mode: 'prim', start: 'A' }, pick: (o) => [o.total] },
  { id: 'simplex', pick: (o) => nums(o.answer) },
  { id: 'simplex', raw: { mode: 'simplex', objective: 'min 2x + 3y', constraints: 'x + y >= 4; x + 3y >= 6' }, pick: () => [3, 1, 9] },
];

/* ---------------- shared by the test and scripts/check-code-export.mjs ---------------- */

export const inputsOf = (c) => c.raw || METHOD_WIDGETS.find((w) => w.id === c.id)?.start;

/** Runs generated JavaScript and returns what it printed. */
export function runJs(code) {
  const lines = [];
  new Function('console', code)({ log: (...a) => lines.push(a.join(' ')) });
  return lines.join('\n');
}

const printed = (text) => (text.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || []).map(Number);

/** Every expected number appears in the output (to the printed precision), and every expected text in order. */
export function matches(text, expected, say, tol) {
  const got = printed(text);
  const missing = expected.filter((e) => Number.isFinite(e) && !got.some((g) => Math.abs(g - e) <= Math.max(tol ?? 0.006, 2e-4 * Math.abs(e))));
  let at = 0;
  const unsaid = (say || []).filter((s) => {
    const i = text.indexOf(s, at);
    if (i < 0) return true;
    at = i + s.length;
    return false;
  });
  return { missing, unsaid };
}
