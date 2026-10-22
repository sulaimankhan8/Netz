/**
 * Code export (a Pro feature): the student's solver inputs → a ready-to-run program in Python, MATLAB,
 * C++, JavaScript, Rust or Go. Solver pages report their inputs with useCodeExportInputs (inputs.js);
 * Notes solver widgets pass their registry params through fromRegistry.
 */

import { compile, ExportError, LANGS } from './compile.js';
import PROGRAMS from './programs.js';

export { LANGS, ExportError };
export const LANG_ORDER = ['python', 'matlab', 'cpp', 'javascript', 'rust', 'go'];

const n = (v, name) => {
  const x = typeof v === 'number' ? v : parseFloat(String(v ?? '').trim());
  if (!Number.isFinite(x)) throw new ExportError(`Enter a number for ${name} first.`);
  return x;
};
const optional = (v, fallback) => {
  const x = typeof v === 'number' ? v : parseFloat(String(v ?? '').trim());
  return Number.isFinite(x) ? x : fallback;
};
const list = (v, name, min = 1) => {
  const arr = Array.isArray(v) ? v.map((x) => parseFloat(x)) : String(v ?? '').split(/[,\s]+/).filter(Boolean).map((x) => parseFloat(x));
  if (arr.some((x) => !Number.isFinite(x)) || arr.length < min) throw new ExportError(`Enter at least ${min} numbers for ${name}.`);
  return arr;
};
const text = (v, name) => {
  const s = String(v ?? '').trim();
  if (!s) throw new ExportError(`Enter ${name} first.`);
  return s;
};
const matrix = (A) => {
  if (!Array.isArray(A) || A.length < 2) throw new ExportError('Enter the system of equations first.');
  const rows = A.map((r) => r.map((c) => parseFloat(c)));
  const size = rows.length;
  if (rows.some((r) => r.length !== size + 1 || r.some((c) => !Number.isFinite(c)))) throw new ExportError('Fill in every coefficient and right-hand side with a number.');
  return rows;
};
const points = (raw) => {
  const x = list(raw.x, 'x', 2);
  const y = list(raw.y, 'y', 2);
  if (x.length !== y.length) throw new ExportError('x and y need the same number of values.');
  return { x, y };
};

const INTERP = (raw) => ({ ...points(raw), at: n(raw.at, 'the x to interpolate at') });
const CODES = (raw, panel) => {
  const out = { f: text(raw.f, 'f(x)'), a: n(raw.a, 'the lower limit'), b: n(raw.b, 'the upper limit'), n: Math.round(n(raw.n, 'the number of strips')) };
  if (out.n < panel || out.n % panel) throw new ExportError(`The number of strips must be a multiple of ${panel}.`);
  return out;
};
const ODE = (raw) => {
  const out = { f: text(raw.f, 'f(x, y)'), x0: n(raw.x0, 'x0'), y0: n(raw.y0, 'y0'), h: n(raw.h, 'the step h'), xn: n(raw.xn, 'the target x') };
  if (!(out.h > 0) || !(out.xn > out.x0)) throw new ExportError('Use a positive step and a target x after x0.');
  return out;
};
const LINEAR_ITER = (raw) => ({ A: matrix(raw.A), tol: optional(raw.tol, 0.0001), maxIter: Math.min(500, Math.round(optional(raw.maxIter, 50))) });

const CLEAN = {
  bisection: (raw) => ({ f: text(raw.f, 'f(x)'), tol: optional(raw.tol, 0.05), ...bracket(raw) }),
  'false-position': (raw) => ({ f: text(raw.f, 'f(x)'), tol: optional(raw.tol, 0.0001), ...bracket(raw) }),
  'newton-raphson': (raw) => ({ f: text(raw.f, 'f(x)'), x0: n(raw.x0, 'x0'), tol: optional(raw.tol, 0.0001) }),
  secant: (raw) => ({ f: text(raw.f, 'f(x)'), x0: n(raw.x0, 'x0'), x1: n(raw.x1, 'x1'), tol: optional(raw.tol, 0.0001), maxIter: Math.min(500, optional(raw.maxIter, 50)) }),
  'fixed-point': (raw) => ({ g: text(raw.g, 'g(x)'), x0: n(raw.x0, 'x0'), tol: optional(raw.tol, 0.0001), maxIter: Math.min(500, optional(raw.maxIter, 50)) }),
  'gauss-seidel': LINEAR_ITER,
  jacobi: LINEAR_ITER,
  'newton-forward': INTERP,
  'newton-backward': INTERP,
  'gauss-forward': INTERP,
  'gauss-backward': INTERP,
  lagrange: INTERP,
  'newton-divided': INTERP,
  trapezoidal: (raw) => CODES(raw, 1),
  'simpson-13': (raw) => CODES(raw, 2),
  'simpson-38': (raw) => CODES(raw, 3),
  boole: (raw) => CODES(raw, 4),
  weddle: (raw) => CODES(raw, 6),
  'gauss-quadrature': (raw) => ({ f: text(raw.f, 'f(x)'), a: n(raw.a, 'a'), b: n(raw.b, 'b'), points: Math.min(5, Math.max(1, Math.round(optional(raw.points, 2)))) }),
  'numerical-differentiation': (raw) => {
    const out = { f: text(raw.f, 'f(x)'), x0: n(raw.x0, 'x'), h: n(raw.h, 'h') };
    if (!(out.h > 0)) throw new ExportError('Use a positive step h.');
    return out;
  },
  'gauss-elimination': (raw) => ({ A: matrix(raw.A) }),
  'gauss-jordan': (raw) => ({ A: matrix(raw.A) }),
  lu: (raw) => ({ A: matrix(raw.A) }),
  euler: ODE,
  'modified-euler': ODE,
  'runge-kutta': ODE,
  taylor: (raw) => ({ f: text(raw.f, 'f(x, y)'), x0: n(raw.x0, 'x0'), y0: n(raw.y0, 'y0'), xn: n(raw.xn, 'the target x') }),
  'straight-line': points,
  parabola: points,
  'least-squares': (raw) => ({ ...points(raw), model: raw.model === 'power' ? 'power' : 'exponential' }),
  'z-test': (raw) => ({ mean: n(raw.mean, 'the sample mean'), mu: n(raw.mu, 'the population mean'), sigma: n(raw.sigma, 'the standard deviation'), n: n(raw.n, 'the sample size') }),
  't-test': (raw) => ({ data: list(raw.data, 'the sample', 2), mu: n(raw.mu, 'the hypothesised mean') }),
  'chi-square': (raw) => {
    const observed = list(raw.observed, 'the observed values', 2);
    const expected = list(raw.expected, 'the expected values', 2);
    if (observed.length !== expected.length) throw new ExportError('Observed and expected need the same number of values.');
    return { observed, expected };
  },
  'f-test': (raw) => ({ s1: list(raw.s1, 'sample 1', 2), s2: list(raw.s2, 'sample 2', 2) }),
};

function bracket(raw) {
  const a = optional(raw.a, NaN);
  const b = optional(raw.b, NaN);
  return Number.isFinite(a) && Number.isFinite(b) ? { a, b } : {};
}

/** Methods that can be exported (the same ids the solver pages report with useRecordSolve). */
export const EXPORTABLE = new Set(Object.keys(CLEAN));

/** A file name for a method, e.g. "netz_newton_raphson" ("netz_ttest": Go treats *_test.go as tests). */
export const fileBase = (method) => `netz_${method.replace(/-test$/, 'test').replace(/-/g, '_')}`;

/**
 * @returns {{ code: string, filename: string }}  throws ExportError with a message for the student
 */
export function generateCode(method, raw, lang) {
  if (!CLEAN[method] || !PROGRAMS[method]) throw new ExportError('Code export is not ready for this method yet.');
  const program = PROGRAMS[method](CLEAN[method](raw || {}));
  program.file = fileBase(method);
  return { code: compile(program, lang), filename: `${program.file}.${LANGS[lang].ext}` };
}

// Notes solver widget ids (Notes/utils/algorithmRegistry.js) → export method ids and inputs
const REGISTRY = {
  bisection: ['bisection', (p) => ({ f: p.expression, a: p.a, b: p.b, tol: p.tolerance })],
  'false-position': ['false-position', (p) => ({ f: p.expression, a: p.a, b: p.b, tol: p.tolerance })],
  'secant-method': ['secant', (p) => ({ f: p.expression, x0: p.x0, x1: p.x1, tol: p.tolerance, maxIter: 100 })],
  'newton-raphson': ['newton-raphson', (p) => ({ f: p.expression, x0: p.x0, tol: p.tolerance })],
  'fixed-point': ['fixed-point', (p) => ({ g: p.expression, x0: p.x0, tol: p.tolerance, maxIter: p.maxIter })],
  'newton-forward': ['newton-forward', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  'newton-backward': ['newton-backward', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  'gauss-forward': ['gauss-forward', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  'gauss-backward': ['gauss-backward', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  'lagrange-interpolation': ['lagrange', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  'newton-divided': ['newton-divided', (p) => ({ x: p.xValues, y: p.yValues, at: p.targetX })],
  trapezoidal: ['trapezoidal', (p) => ({ f: p.expression, a: p.a, b: p.b, n: p.n })],
  'simpson-1-3': ['simpson-13', (p) => ({ f: p.expression, a: p.a, b: p.b, n: p.n })],
  'simpson-3-8': ['simpson-38', (p) => ({ f: p.expression, a: p.a, b: p.b, n: p.n })],
  'boole-rule': ['boole', (p) => ({ f: p.expression, a: p.a, b: p.b, n: p.n })],
  'weddle-rule': ['weddle', (p) => ({ f: p.expression, a: p.a, b: p.b, n: p.n })],
  'gauss-quadrature': ['gauss-quadrature', (p) => ({ f: p.expression, a: p.a, b: p.b, points: p.points })],
  'gauss-seidel': ['gauss-seidel', (p) => ({ A: rows3(p), tol: p.tolerance, maxIter: p.maxIter })],
  'jacobi-method': ['jacobi', (p) => ({ A: rows3(p), tol: p.tolerance, maxIter: p.maxIter })],
  'gauss-elimination': ['gauss-elimination', (p) => ({ A: rows3(p) })],
  'gauss-jordan': ['gauss-jordan', (p) => ({ A: rows3(p) })],
  'lu-decomposition': ['lu', (p) => ({ A: rows3(p) })],
  'taylor-series': ['taylor', (p) => ({ f: p.expression, x0: p.x0, y0: p.y0, xn: p.targetX })],
  euler: ['euler', (p) => ({ f: p.expression, x0: p.x0, y0: p.y0, h: p.h, xn: p.targetX })],
  'modified-euler': ['modified-euler', (p) => ({ f: p.expression, x0: p.x0, y0: p.y0, h: p.h, xn: p.targetX })],
  rk4: ['runge-kutta', (p) => ({ f: p.expression, x0: p.x0, y0: p.y0, h: p.h, xn: p.targetX })],
  'fitting-straight-lines': ['straight-line', (p) => ({ x: p.xValues, y: p.yValues })],
  'fitting-parabola': ['parabola', (p) => ({ x: p.xValues, y: p.yValues })],
  'least-squares': ['straight-line', (p) => ({ x: p.xValues, y: p.yValues })],
  'z-test': ['z-test', (p) => ({ mean: p.sampleMean, mu: p.popMean, sigma: p.popStd, n: p.sampleSize })],
  'chi-square': ['chi-square', (p) => ({ observed: p.observed, expected: p.expected })],
  'f-test': ['f-test', (p) => ({ s1: p.sample1, s2: p.sample2 })],
};

function rows3(p) {
  return [p.row1, p.row2, p.row3].map((r) => String(r || '').split(',').map((c) => c.trim()));
}

/** A Notes solver widget (registry id + params) as { method, raw }, or null when it has no export. */
export function fromRegistry(id, params) {
  const entry = REGISTRY[id];
  if (!entry) return null;
  return { method: entry[0], raw: entry[1](params || {}) };
}
