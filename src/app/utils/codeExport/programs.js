/**
 * One program per solver, written once and turned into six languages by compile.js. Each builder takes
 * the student's inputs (already cleaned by inputs.js) and returns { title, about, funcs, body }.
 * The maths follows the NETZ solver pages, so the exported code prints the same answer as the page.
 */

import { checkUserExpression, derivative, totalDerivative } from './compile.js';
import { tCritical, chiSquareCritical, fCritical } from '../criticalValues.js';

const D = (name, type, init) => ({ k: 'decl', name, type, init });
const S = (target, value) => ({ k: 'set', target, value });
const FOR = (v, from, to, body) => ({ k: 'for', v, from, to, body });
const DOWN = (v, from, to, body) => ({ k: 'down', v, from, to, body });
const IF = (cond, then, els) => ({ k: 'if', cond, then, else: els });
const P = (...parts) => ({ k: 'print', parts });
const C = (text) => ({ k: 'comment', text });
const BREAK = { k: 'break' };
const num = (e, p = 6, w = 0) => ({ e, p, w });
const int = (e, w = 0) => ({ e, int: true, w });

const fx = (expr, doc = 'f(x) as you typed it') => {
  checkUserExpression(expr, ['x']);
  return { name: 'f', params: ['x'], expr, doc };
};
const fxy = (expr) => {
  checkUserExpression(expr, ['x', 'y']);
  return { name: 'f', params: ['x', 'y'], expr, doc: "dy/dx = f(x, y) as you typed it" };
};
const fmt = (v) => String(+Number(v).toPrecision(12));

/* ---------------- Unit 1: roots ---------------- */

// Looks for a sign change of f at x = 0, 1, 2 … 100, as the NETZ page does when no interval is given
function findBracket(given) {
  if (given) return { found: [], ready: [D('a', 'num', fmt(given[0])), D('b', 'num', fmt(given[1]))] };
  return {
    found: [
      C('Find an interval [a, b] where f changes sign: try x = 0, 1, 2 … 100'),
      D('a', 'num', '0'),
      D('b', 'num', '0'),
      D('found', 'bool', 'false'),
      FOR('k', 1, 101, [
        IF('f(a) * f(float(k)) < 0', [S('b', 'float(k)'), S('found', 'true'), BREAK], [S('a', 'float(k)')]),
      ]),
    ],
    ready: [],
  };
}

function bracketed(p, kind) {
  const bracket = findBracket(p.a !== undefined && p.b !== undefined ? [p.a, p.b] : null);
  const tol = fmt(p.tol);
  const loop = kind === 'bisection'
    ? [
        C('Halve [a, b] until it is shorter than twice the tolerance'),
        D('c', 'num', 'a'),
        P('Iter |          a |          b |          c |       f(c)'),
        FOR('i', 0, 100, [
          S('c', '(a + b) / 2'),
          P(int('i + 1', 4), ' | ', num('a', 6, 10), ' | ', num('b', 6, 10), ' | ', num('c', 6, 10), ' | ', num('f(c)', 6, 10)),
          IF('f(c) == 0 or (b - a) / 2 < tol', [BREAK]),
          IF('f(a) * f(c) < 0', [S('b', 'c')], [S('a', 'c')]),
        ]),
        P('Root x = ', num('c')),
      ]
    : [
        C('Cut [a, b] where the chord from (a, f(a)) to (b, f(b)) crosses zero'),
        D('c', 'num', 'a'),
        D('previous', 'num', 'a'),
        P('Iter |          a |          b |          c |       f(c)'),
        FOR('i', 0, 100, [
          S('c', '(a * f(b) - b * f(a)) / (f(b) - f(a))'),
          P(int('i + 1', 4), ' | ', num('a', 6, 10), ' | ', num('b', 6, 10), ' | ', num('c', 6, 10), ' | ', num('f(c)', 6, 10)),
          IF('abs(f(c)) < tol or (i > 0 and abs(c - previous) < tol)', [BREAK]),
          S('previous', 'c'),
          IF('f(a) * f(c) < 0', [S('b', 'c')], [S('a', 'c')]),
        ]),
        P('Root x = ', num('c')),
      ];
  const body = [D('tol', 'num', tol), ...bracket.ready, ...bracket.found];
  if (bracket.found.length) {
    body.push(IF('found', [P('Sign change between x = ', num('a', 0), ' and x = ', num('b', 0)), ...loop], [P('No sign change found between x = 0 and x = 100. Try another function.')]));
  } else body.push(...loop);
  return body;
}

const PROGRAMS = {
  bisection: (p) => ({
    title: 'Bisection method',
    about: [`f(x) = ${p.f}, tolerance ${fmt(p.tol)}`],
    funcs: [fx(p.f)],
    body: bracketed(p, 'bisection'),
  }),

  'false-position': (p) => ({
    title: 'False position (regula falsi) method',
    about: [`f(x) = ${p.f}, tolerance ${fmt(p.tol)}`],
    funcs: [fx(p.f)],
    body: bracketed(p, 'false-position'),
  }),

  'newton-raphson': (p) => ({
    title: 'Newton-Raphson method',
    about: [`f(x) = ${p.f}, x0 = ${fmt(p.x0)}, tolerance ${fmt(p.tol)}`],
    funcs: [fx(p.f), { name: 'df', params: ['x'], expr: derivative(p.f), doc: "f'(x), worked out from f" }],
    body: [
      D('x', 'num', fmt(p.x0)),
      D('tol', 'num', fmt(p.tol)),
      D('next', 'num', 'x'),
      P('Iter |        x_n |     f(x_n) |    f\'(x_n) |    x_(n+1)'),
      FOR('i', 0, 100, [
        IF('abs(df(x)) < 1e-12', [P("f'(x) is zero: pick another starting guess."), BREAK]),
        S('next', 'x - f(x) / df(x)'),
        P(int('i + 1', 4), ' | ', num('x', 6, 10), ' | ', num('f(x)', 6, 10), ' | ', num('df(x)', 6, 10), ' | ', num('next', 6, 10)),
        IF('abs(next - x) < tol', [S('x', 'next'), BREAK]),
        S('x', 'next'),
      ]),
      P('Root x = ', num('x')),
    ],
  }),

  secant: (p) => ({
    title: 'Secant method',
    about: [`f(x) = ${p.f}, x0 = ${fmt(p.x0)}, x1 = ${fmt(p.x1)}, tolerance ${fmt(p.tol)}`],
    funcs: [fx(p.f)],
    body: [
      D('x0', 'num', fmt(p.x0)),
      D('x1', 'num', fmt(p.x1)),
      D('tol', 'num', fmt(p.tol)),
      D('x2', 'num', 'x1'),
      P('Iter |    x_(n-1) |        x_n |    x_(n+1) |   f(x_(n+1))'),
      FOR('i', 0, Math.max(1, Math.round(p.maxIter)), [
        IF('abs(f(x1) - f(x0)) < 1e-12', [BREAK]),
        S('x2', 'x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))'),
        P(int('i + 1', 4), ' | ', num('x0', 6, 10), ' | ', num('x1', 6, 10), ' | ', num('x2', 6, 10), ' | ', num('f(x2)', 6, 12)),
        S('x0', 'x1'),
        S('x1', 'x2'),
        IF('abs(x1 - x0) < tol', [BREAK]),
      ]),
      P('Root x = ', num('x1')),
    ],
  }),

  'fixed-point': (p) => ({
    title: 'Fixed-point iteration, x = g(x)',
    about: [`g(x) = ${p.g}, x0 = ${fmt(p.x0)}, tolerance ${fmt(p.tol)}`],
    funcs: [{ ...fx(p.g, 'g(x) as you typed it: the method repeats x = g(x)'), name: 'g' }],
    body: [
      D('x', 'num', fmt(p.x0)),
      D('tol', 'num', fmt(p.tol)),
      D('next', 'num', 'x'),
      P('Iter |        x_n |     g(x_n) |  |difference|'),
      FOR('i', 0, Math.max(1, Math.round(p.maxIter)), [
        S('next', 'g(x)'),
        P(int('i + 1', 4), ' | ', num('x', 6, 10), ' | ', num('next', 6, 10), ' | ', num('abs(next - x)', 6, 12)),
        IF('abs(next - x) < tol', [S('x', 'next'), BREAK]),
        S('x', 'next'),
      ]),
      P('Fixed point x = ', num('x')),
    ],
  }),

  'gauss-seidel': (p) => iterativeSystem(p, true),
  jacobi: (p) => iterativeSystem(p, false),

  /* ---------------- Unit 2: interpolation ---------------- */

  'newton-forward': (p) => interpolation(p, 'forward'),
  'newton-backward': (p) => interpolation(p, 'backward'),
  'gauss-forward': (p) => interpolation(p, 'gauss-forward'),
  'gauss-backward': (p) => interpolation(p, 'gauss-backward'),

  lagrange: (p) => ({
    title: 'Lagrange interpolation',
    about: [`${p.x.length} points, value at x = ${fmt(p.at)}`],
    funcs: [],
    body: [
      D('xs', 'vec', { vec: p.x }),
      D('ys', 'vec', { vec: p.y }),
      D('at', 'num', fmt(p.at)),
      D('n', 'int', 'len(xs)'),
      D('total', 'num', '0'),
      FOR('i', 0, 'n', [
        D('term', 'num', 'ys[i]'),
        FOR('j', 0, 'n', [IF('j != i', [S('term', 'term * (at - xs[j]) / (xs[i] - xs[j])')])]),
        P('L', int('i'), '(x) * y', int('i'), ' = ', num('term')),
        S('total', 'total + term'),
      ]),
      P('y(', num('at', 4), ') = ', num('total')),
    ],
  }),

  'newton-divided': (p) => ({
    title: "Newton's divided difference interpolation",
    about: [`${p.x.length} points, value at x = ${fmt(p.at)}`],
    funcs: [],
    body: [
      D('xs', 'vec', { vec: p.x }),
      D('ys', 'vec', { vec: p.y }),
      D('at', 'num', fmt(p.at)),
      D('n', 'int', 'len(xs)'),
      C('table[i, j] is the j-th divided difference starting at point i'),
      D('table', 'mat', { zeros2: ['n', 'n'] }),
      FOR('i', 0, 'n', [S('table[i, 0]', 'ys[i]')]),
      FOR('j', 1, 'n', [
        FOR('i', 0, 'n - j', [S('table[i, j]', '(table[i + 1, j - 1] - table[i, j - 1]) / (xs[i + j] - xs[i])')]),
      ]),
      D('total', 'num', 'table[0, 0]'),
      D('product', 'num', '1'),
      FOR('j', 1, 'n', [
        S('product', 'product * (at - xs[j - 1])'),
        S('total', 'total + product * table[0, j]'),
        P('Order ', int('j'), ' difference = ', num('table[0, j]')),
      ]),
      P('y(', num('at', 4), ') = ', num('total')),
    ],
  }),

  /* ---------------- Unit 3: calculus ---------------- */

  trapezoidal: (p) => newtonCotes(p, 'trapezoidal'),
  'simpson-13': (p) => newtonCotes(p, 'simpson-13'),
  'simpson-38': (p) => newtonCotes(p, 'simpson-38'),
  boole: (p) => newtonCotes(p, 'boole'),
  weddle: (p) => newtonCotes(p, 'weddle'),

  'gauss-quadrature': (p) => {
    const table = GAUSS_LEGENDRE[p.points] || GAUSS_LEGENDRE[2];
    return {
      title: `Gauss-Legendre quadrature, ${p.points} points`,
      about: [`Integral of f(x) = ${p.f} from ${fmt(p.a)} to ${fmt(p.b)}`],
      funcs: [fx(p.f)],
      body: [
        D('a', 'num', fmt(p.a)),
        D('b', 'num', fmt(p.b)),
        C('Nodes and weights on [-1, 1]'),
        D('t', 'vec', { vec: table.nodes }),
        D('w', 'vec', { vec: table.weights }),
        D('total', 'num', '0'),
        FOR('i', 0, 'len(t)', [
          D('xi', 'num', '(b - a) / 2 * t[i] + (a + b) / 2'),
          P('t = ', num('t[i]', 6, 10), '   x = ', num('xi', 6, 10), '   w * f(x) = ', num('w[i] * f(xi)', 6, 10)),
          S('total', 'total + w[i] * f(xi)'),
        ]),
        P('Integral = ', num('(b - a) / 2 * total')),
      ],
    };
  },

  'numerical-differentiation': (p) => ({
    title: 'Numerical differentiation (central differences)',
    about: [`f(x) = ${p.f} at x = ${fmt(p.x0)}, h = ${fmt(p.h)}`],
    funcs: [fx(p.f)],
    body: [
      D('x0', 'num', fmt(p.x0)),
      D('h', 'num', fmt(p.h)),
      P('f(x - h) = ', num('f(x0 - h)')),
      P('f(x)     = ', num('f(x0)')),
      P('f(x + h) = ', num('f(x0 + h)')),
      P("f'(x)  = ", num('(f(x0 + h) - f(x0 - h)) / (2 * h)')),
      P("f''(x) = ", num('(f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h)')),
    ],
  }),

  /* ---------------- Unit 4: linear systems and ODEs ---------------- */

  'gauss-elimination': (p) => ({
    title: 'Gauss elimination with back substitution',
    about: [`${p.A.length} equations; each row is the coefficients followed by the right-hand side`],
    funcs: [],
    body: [
      D('A', 'mat', { mat: p.A }),
      D('n', 'int', 'rows(A)'),
      FOR('k', 0, 'n', [
        ...swapZeroPivot(),
        FOR('i', 'k + 1', 'n', [
          D('m', 'num', 'A[i, k] / A[k, k]'),
          FOR('j', 'k', 'n + 1', [S('A[i, j]', 'A[i, j] - m * A[k, j]')]),
        ]),
      ]),
      D('x', 'vec', { zeros: 'n' }),
      DOWN('i', 'n - 1', 0, [
        D('sum', 'num', 'A[i, n]'),
        FOR('j', 'i + 1', 'n', [S('sum', 'sum - A[i, j] * x[j]')]),
        S('x[i]', 'sum / A[i, i]'),
      ]),
      FOR('i', 0, 'n', [P('x', int('i + 1'), ' = ', num('x[i]'))]),
    ],
  }),

  'gauss-jordan': (p) => ({
    title: 'Gauss-Jordan elimination',
    about: [`${p.A.length} equations; each row is the coefficients followed by the right-hand side`],
    funcs: [],
    body: [
      D('A', 'mat', { mat: p.A }),
      D('n', 'int', 'rows(A)'),
      FOR('k', 0, 'n', [
        ...swapZeroPivot(),
        D('pivot', 'num', 'A[k, k]'),
        FOR('j', 0, 'n + 1', [S('A[k, j]', 'A[k, j] / pivot')]),
        FOR('i', 0, 'n', [
          IF('i != k', [
            D('m', 'num', 'A[i, k]'),
            FOR('j', 0, 'n + 1', [S('A[i, j]', 'A[i, j] - m * A[k, j]')]),
          ]),
        ]),
      ]),
      FOR('i', 0, 'n', [P('x', int('i + 1'), ' = ', num('A[i, n]'))]),
    ],
  }),

  lu: (p) => ({
    title: 'LU decomposition (Doolittle), then forward and back substitution',
    about: [`${p.A.length} equations; each row is the coefficients followed by the right-hand side`],
    funcs: [],
    body: [
      D('A', 'mat', { mat: p.A }),
      D('n', 'int', 'rows(A)'),
      D('L', 'mat', { zeros2: ['n', 'n'] }),
      D('U', 'mat', { zeros2: ['n', 'n'] }),
      FOR('i', 0, 'n', [
        FOR('k', 'i', 'n', [
          D('sum', 'num', '0'),
          FOR('j', 0, 'i', [S('sum', 'sum + L[i, j] * U[j, k]')]),
          S('U[i, k]', 'A[i, k] - sum'),
        ]),
        S('L[i, i]', '1'),
        FOR('k', 'i + 1', 'n', [
          D('sum', 'num', '0'),
          FOR('j', 0, 'i', [S('sum', 'sum + L[k, j] * U[j, i]')]),
          S('L[k, i]', '(A[k, i] - sum) / U[i, i]'),
        ]),
      ]),
      C('L y = b'),
      D('y', 'vec', { zeros: 'n' }),
      FOR('i', 0, 'n', [
        D('sum', 'num', 'A[i, n]'),
        FOR('j', 0, 'i', [S('sum', 'sum - L[i, j] * y[j]')]),
        S('y[i]', 'sum'),
      ]),
      C('U x = y'),
      D('x', 'vec', { zeros: 'n' }),
      DOWN('i', 'n - 1', 0, [
        D('sum', 'num', 'y[i]'),
        FOR('j', 'i + 1', 'n', [S('sum', 'sum - U[i, j] * x[j]')]),
        S('x[i]', 'sum / U[i, i]'),
      ]),
      FOR('i', 0, 'n', [P('x', int('i + 1'), ' = ', num('x[i]'))]),
    ],
  }),

  euler: (p) => ode(p, 'euler'),
  'modified-euler': (p) => ode(p, 'modified-euler'),
  'runge-kutta': (p) => ode(p, 'runge-kutta'),

  taylor: (p) => {
    const f = p.f;
    checkUserExpression(f, ['x', 'y']);
    const y2 = totalDerivative(f, f);
    const y3 = totalDerivative(y2, f);
    return {
      title: "Taylor series method (terms up to h^3)",
      about: [`dy/dx = ${f}, y(${fmt(p.x0)}) = ${fmt(p.y0)}, value at x = ${fmt(p.xn)}`],
      funcs: [
        fxy(f),
        { name: 'd2', params: ['x', 'y'], expr: y2, doc: "y'' = f_x + f_y * f, worked out from f" },
        { name: 'd3', params: ['x', 'y'], expr: y3, doc: "y''' worked out the same way from y''" },
      ],
      body: [
        D('x0', 'num', fmt(p.x0)),
        D('y0', 'num', fmt(p.y0)),
        D('h', 'num', `${fmt(p.xn)} - x0`),
        P("y'   = ", num('f(x0, y0)')),
        P("y''  = ", num('d2(x0, y0)')),
        P("y''' = ", num('d3(x0, y0)')),
        D('y', 'num', 'y0 + h * f(x0, y0) + h * h / 2 * d2(x0, y0) + h * h * h / 6 * d3(x0, y0)'),
        P('y(', num('x0 + h', 4), ') = ', num('y')),
      ],
    };
  },

  /* ---------------- Unit 5: curve fitting and tests ---------------- */

  'straight-line': (p) => ({
    title: 'Fitting a straight line y = a + b x (least squares)',
    about: [`${p.x.length} points`],
    funcs: [],
    body: [
      D('xs', 'vec', { vec: p.x }),
      D('ys', 'vec', { vec: p.y }),
      D('n', 'int', 'len(xs)'),
      ...sums(['sx', 'xs[i]'], ['sy', 'ys[i]'], ['sxx', 'xs[i] * xs[i]'], ['sxy', 'xs[i] * ys[i]']),
      D('b', 'num', '(float(n) * sxy - sx * sy) / (float(n) * sxx - sx * sx)'),
      D('a', 'num', '(sy - b * sx) / float(n)'),
      P('Sum x = ', num('sx', 4), ', Sum y = ', num('sy', 4), ', Sum x^2 = ', num('sxx', 4), ', Sum xy = ', num('sxy', 4)),
      P('y = ', num('a'), ' + ', num('b'), ' x'),
    ],
  }),

  parabola: (p) => ({
    title: 'Fitting a parabola y = a + b x + c x^2 (least squares)',
    about: [`${p.x.length} points`],
    funcs: [],
    body: [
      D('xs', 'vec', { vec: p.x }),
      D('ys', 'vec', { vec: p.y }),
      D('n', 'int', 'len(xs)'),
      ...sums(['sx', 'xs[i]'], ['sx2', 'xs[i] ^ 2'], ['sx3', 'xs[i] ^ 3'], ['sx4', 'xs[i] ^ 4'], ['sy', 'ys[i]'], ['sxy', 'xs[i] * ys[i]'], ['sx2y', 'xs[i] ^ 2 * ys[i]']),
      C('Normal equations, solved by Gauss elimination'),
      D('M', 'mat', { zeros2: [3, 4] }),
      S('M[0, 0]', 'float(n)'), S('M[0, 1]', 'sx'), S('M[0, 2]', 'sx2'), S('M[0, 3]', 'sy'),
      S('M[1, 0]', 'sx'), S('M[1, 1]', 'sx2'), S('M[1, 2]', 'sx3'), S('M[1, 3]', 'sxy'),
      S('M[2, 0]', 'sx2'), S('M[2, 1]', 'sx3'), S('M[2, 2]', 'sx4'), S('M[2, 3]', 'sx2y'),
      FOR('k', 0, 3, [
        FOR('i', 'k + 1', 3, [
          D('m', 'num', 'M[i, k] / M[k, k]'),
          FOR('j', 'k', 4, [S('M[i, j]', 'M[i, j] - m * M[k, j]')]),
        ]),
      ]),
      D('c', 'num', 'M[2, 3] / M[2, 2]'),
      D('b', 'num', '(M[1, 3] - M[1, 2] * c) / M[1, 1]'),
      D('a', 'num', '(M[0, 3] - M[0, 1] * b - M[0, 2] * c) / M[0, 0]'),
      P('y = ', num('a'), ' + ', num('b'), ' x + ', num('c'), ' x^2'),
    ],
  }),

  'least-squares': (p) => {
    const power = p.model === 'power';
    return {
      title: power ? 'Least squares fit of y = a x^b (straight line through ln x, ln y)' : 'Least squares fit of y = a e^(b x) (straight line through x, ln y)',
      about: [`${p.x.length} points`],
      funcs: [],
      body: [
        D('xs', 'vec', { vec: p.x }),
        D('ys', 'vec', { vec: p.y }),
        D('n', 'int', 'len(xs)'),
        C(power ? 'Take X = ln x and Y = ln y, then fit Y = A + b X' : 'Take Y = ln y, then fit Y = A + b x'),
        ...sums(
          ['sX', power ? 'log(xs[i])' : 'xs[i]'],
          ['sY', 'log(ys[i])'],
          ['sXX', power ? 'log(xs[i]) ^ 2' : 'xs[i] ^ 2'],
          ['sXY', power ? 'log(xs[i]) * log(ys[i])' : 'xs[i] * log(ys[i])'],
        ),
        D('b', 'num', '(float(n) * sXY - sX * sY) / (float(n) * sXX - sX * sX)'),
        D('A', 'num', '(sY - b * sX) / float(n)'),
        D('a', 'num', 'exp(A)'),
        P(power ? 'y = ' : 'y = ', num('a'), power ? ' x^' : ' e^(', num('b'), power ? '' : ' x)'),
      ],
    };
  },

  'z-test': (p) => ({
    title: 'Test of significance for a mean (Z test, large sample)',
    about: [`sample mean ${fmt(p.mean)}, population mean ${fmt(p.mu)}, standard deviation ${fmt(p.sigma)}, n = ${fmt(p.n)}`],
    funcs: [],
    body: [
      D('mean', 'num', fmt(p.mean)),
      D('mu', 'num', fmt(p.mu)),
      D('sigma', 'num', fmt(p.sigma)),
      D('n', 'num', fmt(p.n)),
      D('z', 'num', '(mean - mu) / (sigma / sqrt(n))'),
      P('Standard error = ', num('sigma / sqrt(n)')),
      P('Z = ', num('z')),
      IF('abs(z) > 1.96', [P('|Z| > 1.96: reject H0 at the 5% level')], [P('|Z| <= 1.96: accept H0 at the 5% level')]),
    ],
  }),

  't-test': (p) => {
    const crit = tCritical(p.data.length - 1);
    return {
      title: "Student's t test for one mean",
      about: [`${p.data.length} values, hypothesised mean ${fmt(p.mu)}; table value t(0.05, ${p.data.length - 1}) = ${crit}`],
      funcs: [],
      body: [
        D('data', 'vec', { vec: p.data }),
        D('mu', 'num', fmt(p.mu)),
        D('n', 'int', 'len(data)'),
        ...sums(['total', 'data[i]']),
        D('mean', 'num', 'total / float(n)'),
        D('ss', 'num', '0'),
        FOR('i', 0, 'n', [S('ss', 'ss + (data[i] - mean) ^ 2')]),
        D('s', 'num', 'sqrt(ss / float(n - 1))'),
        D('t', 'num', '(mean - mu) / (s / sqrt(float(n)))'),
        D('critical', 'num', fmt(crit)),
        P('Mean = ', num('mean'), ', s = ', num('s')),
        P('t = ', num('t'), ' with ', int('n - 1'), ' degrees of freedom; table value ', num('critical', 3)),
        IF('abs(t) > critical', [P('|t| is larger: reject H0 at the 5% level')], [P('|t| is not larger: accept H0 at the 5% level')]),
      ],
    };
  },

  'chi-square': (p) => {
    const crit = chiSquareCritical(p.observed.length - 1);
    return {
      title: 'Chi-square goodness of fit test',
      about: [`${p.observed.length} classes; table value chi2(0.05, ${p.observed.length - 1}) = ${crit}`],
      funcs: [],
      body: [
        D('observed', 'vec', { vec: p.observed }),
        D('expected', 'vec', { vec: p.expected }),
        D('chi', 'num', '0'),
        FOR('i', 0, 'len(observed)', [
          D('part', 'num', '(observed[i] - expected[i]) ^ 2 / expected[i]'),
          P('O = ', num('observed[i]', 2), ', E = ', num('expected[i]', 2), ', (O - E)^2 / E = ', num('part', 4)),
          S('chi', 'chi + part'),
        ]),
        D('critical', 'num', fmt(crit)),
        P('Chi-square = ', num('chi', 4), ' with ', int('len(observed) - 1'), ' degrees of freedom; table value ', num('critical', 3)),
        IF('chi > critical', [P('Larger than the table value: reject H0 at the 5% level')], [P('Not larger than the table value: accept H0 at the 5% level')]),
      ],
    };
  },

  'f-test': (p) => {
    const v = (arr) => {
      const m = arr.reduce((s, x) => s + x, 0) / arr.length;
      return arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1);
    };
    const firstLarger = v(p.s1) >= v(p.s2);
    const df1 = (firstLarger ? p.s1 : p.s2).length - 1;
    const df2 = (firstLarger ? p.s2 : p.s1).length - 1;
    const crit = fCritical(df1, df2);
    return {
      title: 'F test for two variances',
      about: [`Samples of ${p.s1.length} and ${p.s2.length}; table value F(0.05; ${df1}, ${df2}) = ${crit}`],
      funcs: [],
      body: [
        D('s1', 'vec', { vec: p.s1 }),
        D('s2', 'vec', { vec: p.s2 }),
        ...variance('s1', 'v1'),
        ...variance('s2', 'v2'),
        D('F', 'num', 'v1 / v2'),
        IF('v2 > v1', [S('F', 'v2 / v1')]),
        D('critical', 'num', fmt(crit)),
        P('Variance 1 = ', num('v1', 4), ', variance 2 = ', num('v2', 4)),
        P('F = larger / smaller = ', num('F', 4), '; table value ', num('critical', 3)),
        IF('F > critical', [P('Larger than the table value: the variances differ (reject H0 at 5%)')], [P('Not larger than the table value: accept H0 at 5%')]),
      ],
    };
  },
};

/* ---------------- shared pieces ---------------- */

function swapZeroPivot() {
  return [
    IF('abs(A[k, k]) < 1e-12', [
      FOR('r', 'k + 1', 'n', [IF('abs(A[r, k]) > 1e-12', [{ k: 'swap', m: 'A', i: 'k', j: 'r' }, BREAK])]),
    ]),
  ];
}

function sums(...pairs) {
  return [
    ...pairs.map(([name]) => D(name, 'num', '0')),
    FOR('i', 0, 'n', pairs.map(([name, term]) => S(name, `${name} + ${term}`))),
  ];
}

function variance(vec, out) {
  return [
    D(`${out}mean`, 'num', '0'),
    FOR('i', 0, `len(${vec})`, [S(`${out}mean`, `${out}mean + ${vec}[i]`)]),
    S(`${out}mean`, `${out}mean / float(len(${vec}))`),
    D(out, 'num', '0'),
    FOR('i', 0, `len(${vec})`, [S(out, `${out} + (${vec}[i] - ${out}mean) ^ 2`)]),
    S(out, `${out} / float(len(${vec}) - 1)`),
  ];
}

function iterativeSystem(p, seidel) {
  return {
    title: seidel ? 'Gauss-Seidel iteration' : 'Jacobi iteration',
    about: [`${p.A.length} equations; each row is the coefficients followed by the right-hand side`, `tolerance ${fmt(p.tol)}, at most ${p.maxIter} rounds`],
    funcs: [],
    body: [
      D('A', 'mat', { mat: p.A }),
      D('n', 'int', 'rows(A)'),
      D('tol', 'num', fmt(p.tol)),
      D('x', 'vec', { zeros: 'n' }),
      FOR('round', 1, Math.max(2, Math.round(p.maxIter) + 1), [
        D('old', 'vec', { copy: 'x' }),
        FOR('i', 0, 'n', [
          D('sum', 'num', 'A[i, n]'),
          FOR('j', 0, 'n', [IF('j != i', [S('sum', seidel ? 'sum - A[i, j] * x[j]' : 'sum - A[i, j] * old[j]')])]),
          S('x[i]', 'sum / A[i, i]'),
        ]),
        D('change', 'num', '0'),
        FOR('i', 0, 'n', [IF('abs(x[i] - old[i]) > change', [S('change', 'abs(x[i] - old[i])')])]),
        P('Round ', int('round', 3), ':  x1 = ', num('x[0]', 6, 10), '  largest change ', num('change', 6, 10)),
        IF('change < tol', [BREAK]),
      ]),
      FOR('i', 0, 'n', [P('x', int('i + 1'), ' = ', num('x[i]'))]),
    ],
  };
}

function interpolation(p, kind) {
  const names = {
    forward: "Newton's forward difference interpolation",
    backward: "Newton's backward difference interpolation",
    'gauss-forward': "Gauss's forward central difference interpolation",
    'gauss-backward': "Gauss's backward central difference interpolation",
  };
  const body = [
    D('xs', 'vec', { vec: p.x }),
    D('ys', 'vec', { vec: p.y }),
    D('at', 'num', fmt(p.at)),
    D('n', 'int', 'len(xs)'),
    D('h', 'num', 'xs[1] - xs[0]'),
    C('diff[i, j] is the j-th forward difference starting at point i'),
    D('diff', 'mat', { zeros2: ['n', 'n'] }),
    FOR('i', 0, 'n', [S('diff[i, 0]', 'ys[i]')]),
    FOR('j', 1, 'n', [FOR('i', 0, 'n - j', [S('diff[i, j]', 'diff[i + 1, j - 1] - diff[i, j - 1]')])]),
  ];
  if (kind === 'forward') {
    body.push(
      D('u', 'num', '(at - xs[0]) / h'),
      D('total', 'num', 'diff[0, 0]'),
      D('factor', 'num', '1'),
      FOR('j', 1, 'n', [
        S('factor', 'factor * (u - float(j - 1)) / float(j)'),
        S('total', 'total + factor * diff[0, j]'),
      ]),
      P('u = ', num('u')),
    );
  } else if (kind === 'backward') {
    body.push(
      D('u', 'num', '(at - xs[n - 1]) / h'),
      D('total', 'num', 'diff[n - 1, 0]'),
      D('factor', 'num', '1'),
      FOR('j', 1, 'n', [
        S('factor', 'factor * (u + float(j - 1)) / float(j)'),
        S('total', 'total + factor * diff[n - 1 - j, j]'),
      ]),
      P('u = ', num('u')),
    );
  } else {
    // Gauss: the origin is the table point next to the value (below it for forward, above it for
    // backward), picked as the NETZ page does; central differences then zig-zag around it
    const back = kind === 'gauss-backward';
    let origin = back ? p.x.length - 1 : 0;
    p.x.forEach((xv, i) => {
      if (back ? xv >= p.at && xv < p.x[origin] : xv <= p.at && xv > p.x[origin]) origin = i;
    });
    body.push(
      D('origin', 'int', String(origin)),
      D('u', 'num', '(at - xs[origin]) / h'),
      D('total', 'num', 'diff[origin, 0]'),
      D('factor', 'num', '1'),
      FOR('j', 1, 'n', [
        C(back ? 'Factors u, (u+1), (u-1), (u+2) …, each step divided by j for the j! below' : 'Factors u, (u-1), (u+1), (u-2) …, each step divided by j for the j! below'),
        IF('j == 1', [S('factor', 'u')], [
          IF('j mod 2 == 0',
            [S('factor', back ? 'factor * (u + float(j) / 2) / float(j)' : 'factor * (u - float(j) / 2) / float(j)')],
            [S('factor', back ? 'factor * (u - float(j - 1) / 2) / float(j)' : 'factor * (u + float(j - 1) / 2) / float(j)')]),
        ]),
        D('shift', 'int', back ? 'int(float(j + 1) / 2)' : 'int(float(j) / 2)'),
        IF('shift > origin or origin - shift > n - 1 - j', [BREAK]),
        S('total', 'total + factor * diff[origin - shift, j]'),
      ]),
      P('Origin x0 = ', num('xs[origin]', 4), ', u = ', num('u')),
    );
  }
  body.push(P('y(', num('at', 4), ') = ', num('total')));
  return { title: names[kind], about: [`${p.x.length} equally spaced points, value at x = ${fmt(p.at)}`], funcs: [], body };
}

const RULES = {
  trapezoidal: { name: 'Trapezoidal rule', panel: 1, weights: [1, 1], c: '1 / 2' },
  'simpson-13': { name: "Simpson's 1/3 rule", panel: 2, weights: [1, 4, 1], c: '1 / 3' },
  'simpson-38': { name: "Simpson's 3/8 rule", panel: 3, weights: [1, 3, 3, 1], c: '3 / 8' },
  boole: { name: "Boole's rule", panel: 4, weights: [7, 32, 12, 32, 7], c: '2 / 45' },
  weddle: { name: "Weddle's rule", panel: 6, weights: [1, 5, 1, 6, 1, 5, 1], c: '3 / 10' },
};

function newtonCotes(p, rule) {
  const r = RULES[rule];
  return {
    title: r.name,
    about: [`Integral of f(x) = ${p.f} from ${fmt(p.a)} to ${fmt(p.b)} with ${p.n} strips (a multiple of ${r.panel})`],
    funcs: [fx(p.f)],
    body: [
      D('a', 'num', fmt(p.a)),
      D('b', 'num', fmt(p.b)),
      D('n', 'int', String(p.n)),
      D('h', 'num', '(b - a) / float(n)'),
      C(`Weights over each group of ${r.panel} strip${r.panel > 1 ? 's' : ''}: ${r.weights.join(', ')}`),
      D('w', 'vec', { vec: r.weights }),
      D('total', 'num', '0'),
      P('   i |          x |       f(x)'),
      FOR('i', 0, 'n + 1', [P(int('i', 4), ' | ', num('a + float(i) * h', 6, 10), ' | ', num('f(a + float(i) * h)', 6, 10))]),
      panelLoop(r),
      P('Integral = ', num(`${r.c} * h * total`)),
    ],
  };
}

// Steps over the strips one group at a time (group size = the rule's panel)
function panelLoop(r) {
  return {
    k: 'for',
    v: 'g',
    from: 0,
    to: r.panel === 1 ? 'n' : `int(float(n) / ${r.panel})`,
    body: [FOR('j', 0, r.panel + 1, [S('total', `total + w[j] * f(a + float(g * ${r.panel} + j) * h)`)])],
  };
}

function ode(p, kind) {
  const steps = Math.max(1, Math.min(1000, Math.round((p.xn - p.x0) / p.h)));
  const titles = { euler: "Euler's method", 'modified-euler': "Modified Euler's method (predictor-corrector)", 'runge-kutta': 'Runge-Kutta method (4th order)' };
  const step = {
    euler: [S('y', 'y + h * f(x, y)')],
    'modified-euler': [
      D('slope1', 'num', 'f(x, y)'),
      D('predictor', 'num', 'y + h * slope1'),
      S('y', 'y + h / 2 * (slope1 + f(x + h, predictor))'),
    ],
    'runge-kutta': [
      D('k1', 'num', 'h * f(x, y)'),
      D('k2', 'num', 'h * f(x + h / 2, y + k1 / 2)'),
      D('k3', 'num', 'h * f(x + h / 2, y + k2 / 2)'),
      D('k4', 'num', 'h * f(x + h, y + k3)'),
      S('y', 'y + (k1 + 2 * k2 + 2 * k3 + k4) / 6'),
    ],
  }[kind];
  return {
    title: titles[kind],
    about: [`dy/dx = ${p.f}, y(${fmt(p.x0)}) = ${fmt(p.y0)}, h = ${fmt(p.h)}, value at x = ${fmt(p.xn)}`],
    funcs: [fxy(p.f)],
    body: [
      D('x', 'num', fmt(p.x0)),
      D('y', 'num', fmt(p.y0)),
      D('h', 'num', fmt(p.h)),
      D('steps', 'int', String(steps)),
      P('Step |          x |          y'),
      FOR('i', 1, 'steps + 1', [
        ...step,
        S('x', 'x + h'),
        P(int('i', 4), ' | ', num('x', 6, 10), ' | ', num('y', 6, 10)),
      ]),
      P('y(', num('x', 4), ') = ', num('y')),
    ],
  };
}

const GAUSS_LEGENDRE = {
  1: { nodes: [0], weights: [2] },
  2: { nodes: [-0.5773502692, 0.5773502692], weights: [1, 1] },
  3: { nodes: [-0.7745966692, 0, 0.7745966692], weights: [0.5555555556, 0.8888888889, 0.5555555556] },
  4: { nodes: [-0.8611363116, -0.3399810436, 0.3399810436, 0.8611363116], weights: [0.3478548451, 0.6521451549, 0.6521451549, 0.3478548451] },
  5: { nodes: [-0.9061798459, -0.5384693101, 0, 0.5384693101, 0.9061798459], weights: [0.2369268851, 0.4786286705, 0.5688888889, 0.4786286705, 0.2369268851] },
};

export default PROGRAMS;
