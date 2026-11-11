/**
 * Code export for the Batch 1 numerical pages of Units 1–4 (SOR, difference table, cubic spline, Romberg,
 * power method, RK2, Milne, Adams, Stirling, Bessel). `raw` is exactly what the page passes to its engine,
 * so the program prints the same answer as the page. See kit.js for the shorthands.
 */

import {
  D, S, FOR, DOWN, WHILE, IF, P, C, BREAK, num, int, lit, fn, n, opt, cn, whole, pos, list, pair, table, text, choice, ExportError,
  invert, thomas, printVector, copyMatrix,
} from './kit.js';

/* ---------------- shared readers ---------------- */

function square(cells, name = 'matrix A') {
  const A = table(cells, name, { square: true, minRows: 2 });
  return A;
}

/** Equally spaced x and their y (the central-difference pages). */
function equal(raw, min = 2) {
  const [x, y] = pair(raw.x, raw.y, 'x', 'y', min);
  if (x.length > 30) throw new ExportError('Code export takes up to 30 points.');
  const h = x[1] - x[0];
  if (!(Math.abs(h) > 1e-12) || x.some((v, i) => i > 0 && Math.abs(v - x[i - 1] - h) > 1e-9 * Math.max(1, Math.abs(h)))) {
    throw new ExportError('The x values must be equally spaced.');
  }
  return { x, y, h };
}

/** dy/dx = f(x, y) inputs shared by RK2, Milne and Adams. */
function ode(raw, minSteps = 1) {
  const p = { f: text(raw.f, 'f(x, y)'), x0: n(raw.x0, 'x0'), y0: n(raw.y0, 'y0'), h: pos(raw.h, 'the step h'), xn: n(raw.xn, 'the target x') };
  if (!(p.xn > p.x0)) throw new ExportError('The target x must be after x0.');
  p.steps = Math.round((p.xn - p.x0) / p.h);
  if (Math.abs(p.x0 + p.steps * p.h - p.xn) > 1e-9 * Math.max(1, Math.abs(p.xn))) throw new ExportError('Target x − x0 must be a whole number of steps h.');
  if (p.steps < minSteps) throw new ExportError(`This method needs at least ${minSteps} steps.`);
  if (p.steps > 2000) throw new ExportError('Use 2000 steps or fewer.');
  return p;
}

/** The difference table T[k][i] = k-th difference of y at i (n×n, unused cells 0). */
const differenceTable = (count) => [
  C('Difference table: T[k][i] is the k-th forward difference starting at point i'),
  D('T', 'mat', { zeros2: [count, count] }),
  FOR('i', 0, count, [S('T[0, i]', 'y[i]')]),
  FOR('k', 1, count, [FOR('i', 0, `${count} - k`, [S('T[k, i]', 'T[k - 1, i + 1] - T[k - 1, i]')])]),
];

/** fac = m! */
const factorial = (target, m) => [D(target, 'num', '1'), FOR('fi', 2, `${m} + 1`, [S(target, `${target} * float(fi)`)])];

/* ---------------- programs ---------------- */

export const EXPORTS = {
  sor: {
    name: 'SOR method',
    clean: (raw) => {
      const A = square(raw.cells);
      const b = list(raw.b, 'b', A.length);
      if (b.length !== A.length) throw new ExportError(`b needs exactly ${A.length} numbers.`);
      const omega = n(opt(raw.omega, 1.25), 'omega');
      if (!(omega > 0 && omega < 2)) throw new ExportError('ω must be between 0 and 2.');
      return { A, b, omega, tol: opt(raw.tol, 0.0001), maxIter: Math.min(1000, Math.max(1, Math.round(opt(raw.maxIter, 100)))) };
    },
    program: (p) => ({
      title: 'SOR (successive over-relaxation) for A x = b',
      about: ['x_i(new) = (1 - w) x_i + (w / a_ii) (b_i - sum of a_ij x_j), newest x_j used as soon as known'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        D('b', 'vec', { vec: p.b }),
        D('omega', 'num', lit(p.omega)),
        D('tol', 'num', lit(p.tol)),
        D('maxIter', 'int', String(p.maxIter)),
        D('x', 'vec', { zeros: 'n' }),
        D('change', 'num', '1e30'),
        D('k', 'int', '0'),
        WHILE('k < maxIter and change >= tol', [
          S('change', '0'),
          FOR('i', 0, 'n', [
            D('old', 'num', 'x[i]'),
            D('s', 'num', 'b[i]'),
            FOR('j', 0, 'n', [IF('j != i', [S('s', 's - A[i, j] * x[j]')])]),
            S('x[i]', '(1 - omega) * old + omega / A[i, i] * s'),
            S('change', 'max(change, abs(x[i] - old))'),
          ]),
          S('k', 'k + 1'),
          P('Iteration ', int('k', 3), ': largest change = ', num('change', 8)),
        ]),
        IF('change < tol', [P('Converged after ', int('k'), ' iterations:')], [P('Not converged after ', int('k'), ' iterations. Last values:')]),
        ...printVector('x', 'n'),
      ],
    }),
  },

  'difference-table': {
    name: 'Finite difference table',
    clean: (raw) => ({ ...equal(raw), notation: choice(raw.notation, ['forward', 'backward', 'central']) }),
    program: (p) => ({
      title: 'Finite difference table',
      about: [`${p.notation === 'backward' ? 'Backward' : p.notation === 'central' ? 'Central' : 'Forward'} differences: the same numbers, labelled ${p.notation === 'backward' ? 'from the bottom' : p.notation === 'central' ? 'at the midpoints' : 'from the top'}`],
      body: [
        D('n', 'int', String(p.x.length)),
        D('x', 'vec', { vec: p.x }),
        D('y', 'vec', { vec: p.y }),
        ...differenceTable('n'),
        FOR('k', 0, 'n', [
          P('Order ', int('k'), ':'),
          FOR('i', 0, 'n - k', [P('  starting at x = ', num('x[i]', 4), ':  ', num('T[k, i]', 6))]),
        ]),
        C('The useful order: the highest order whose differences are not all zero'),
        D('order', 'int', 'n - 1'),
        D('allZero', 'bool', 'true'),
        WHILE('order > 1 and allZero', [
          FOR('i', 0, 'n - order', [IF('abs(T[order, i]) >= 1e-9', [S('allZero', 'false')])]),
          IF('allZero', [S('order', 'order - 1')]),
        ]),
        IF('order < n - 1', [P('Differences of order ', int('order'), ' are constant: the data fits a polynomial of degree ', int('order'), '.')],
          [P('No order of differences becomes constant with this many points.')]),
      ],
    }),
  },

  'cubic-spline': {
    name: 'Cubic spline',
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 2);
      if (x.length > 40) throw new ExportError('Code export takes up to 40 points.');
      if (x.some((v, i) => i > 0 && !(v > x[i - 1]))) throw new ExportError('The x values must be increasing.');
      const type = choice(raw.type, ['natural', 'clamped']);
      const out = { x, y, type, at: String(raw.at ?? '').trim() ? n(raw.at, 'the x to interpolate at') : null };
      if (type === 'clamped') {
        out.s0 = n(raw.s0, 'the slope at the start');
        out.sn = n(raw.sn, 'the slope at the end');
      }
      if (out.at !== null && (out.at < x[0] || out.at > x.at(-1))) throw new ExportError('The x to interpolate at must be inside the data.');
      return out;
    },
    program: (p) => {
      const N = p.x.length - 1;
      const clamped = p.type === 'clamped';
      const build = [];
      if (clamped) {
        build.push(
          C('Clamped spline: N + 1 equations for M_0 … M_N, using the given end slopes'),
          D('m', 'int', 'N + 1'),
          D('sa', 'vec', { zeros: 'm' }), D('sb', 'vec', { zeros: 'm' }), D('sc', 'vec', { zeros: 'm' }), D('sd', 'vec', { zeros: 'm' }),
          S('sb[0]', '2 * h[0]'), S('sc[0]', 'h[0]'), S('sd[0]', `6 * (slope[0] - (${lit(p.s0)}))`),
          FOR('i', 1, 'N', [S('sa[i]', 'h[i - 1]'), S('sb[i]', '2 * (h[i - 1] + h[i])'), S('sc[i]', 'h[i]'), S('sd[i]', '6 * (slope[i] - slope[i - 1])')]),
          S('sa[N]', 'h[N - 1]'), S('sb[N]', '2 * h[N - 1]'), S('sd[N]', `6 * ((${lit(p.sn)}) - slope[N - 1])`),
          ...thomas('sa', 'sb', 'sc', 'sd', 'M', 'm'),
        );
      } else if (N === 1) {
        build.push(C('Two points: the natural spline is the straight line, so M_0 = M_1 = 0'), D('M', 'vec', { zeros: 2 }));
      } else {
        build.push(
          C('Natural spline: M_0 = M_N = 0 and N - 1 equations for M_1 … M_(N-1)'),
          D('m', 'int', 'N - 1'),
          D('sa', 'vec', { zeros: 'm' }), D('sb', 'vec', { zeros: 'm' }), D('sc', 'vec', { zeros: 'm' }), D('sd', 'vec', { zeros: 'm' }),
          FOR('r', 0, 'm', [S('sa[r]', 'h[r]'), S('sb[r]', '2 * (h[r] + h[r + 1])'), S('sc[r]', 'h[r + 1]'), S('sd[r]', '6 * (slope[r + 1] - slope[r])')]),
          ...thomas('sa', 'sb', 'sc', 'sd', 'Mi', 'm'),
          D('M', 'vec', { zeros: 'N + 1' }),
          FOR('r', 0, 'm', [S('M[r + 1]', 'Mi[r]')]),
        );
      }
      return {
        title: `${clamped ? 'Clamped' : 'Natural'} cubic spline`,
        about: ['On [x_i, x_(i+1)]: S(x) = a + b t + c t^2 + d t^3 with t = x - x_i', 'M_i are the second derivatives S\'\'(x_i)'],
        body: [
          D('N', 'int', String(N)),
          D('x', 'vec', { vec: p.x }),
          D('y', 'vec', { vec: p.y }),
          D('h', 'vec', { zeros: 'N' }),
          D('slope', 'vec', { zeros: 'N' }),
          FOR('i', 0, 'N', [S('h[i]', 'x[i + 1] - x[i]'), S('slope[i]', '(y[i + 1] - y[i]) / h[i]')]),
          ...build,
          FOR('i', 0, 'N + 1', [P('M', int('i'), ' = ', num('M[i]', 6))]),
          P('Pieces S_i(x) = a + b t + c t^2 + d t^3, t = x - x_i:'),
          FOR('i', 0, 'N', [
            P('  [', num('x[i]', 4), ', ', num('x[i + 1]', 4), ']: a = ', num('y[i]', 6),
              ', b = ', num('slope[i] - h[i] * (2 * M[i] + M[i + 1]) / 6', 6), ', c = ', num('M[i] / 2', 6), ', d = ', num('(M[i + 1] - M[i]) / (6 * h[i])', 6)),
          ]),
          ...(p.at === null ? [] : [
            D('X', 'num', lit(p.at)),
            D('piece', 'int', 'N - 1'),
            DOWN('i', 'N - 1', 0, [IF('X <= x[i + 1]', [S('piece', 'i')])]),
            D('t', 'num', 'X - x[piece]'),
            D('value', 'num', 'y[piece] + t * ((slope[piece] - h[piece] * (2 * M[piece] + M[piece + 1]) / 6) + t * (M[piece] / 2 + t * (M[piece + 1] - M[piece]) / (6 * h[piece])))'),
            P('S(', num('X', 4), ') = ', num('value', 6)),
          ]),
        ],
      };
    },
  },

  romberg: {
    name: 'Romberg integration',
    clean: (raw) => {
      const a = cn(raw.a, 'the lower limit');
      const b = cn(raw.b, 'the upper limit');
      if (a === b) throw new ExportError('The limits are equal, so the integral is 0.');
      return { f: text(raw.f, 'f(x)'), a, b, k: whole(opt(raw.levels, 4), 'the number of levels', 1, 10) };
    },
    program: (p) => ({
      title: 'Romberg integration',
      about: ['R(i, 0): trapezoidal rule with 2^i strips', 'R(i, j) = R(i, j-1) + (R(i, j-1) - R(i-1, j-1)) / (4^j - 1)'],
      funcs: [fn('f', p.f)],
      body: [
        D('a', 'num', lit(p.a)),
        D('b', 'num', lit(p.b)),
        D('k', 'int', String(p.k)),
        D('R', 'mat', { zeros2: ['k + 1', 'k + 1'] }),
        FOR('i', 0, 'k + 1', [
          D('strips', 'num', 'pow(2, i)'),
          D('h', 'num', '(b - a) / strips'),
          IF('i == 0', [S('R[0, 0]', 'h / 2 * (f(a) + f(b))')], [
            D('mid', 'num', '0'),
            FOR('s', 0, 'int(strips / 2)', [S('mid', 'mid + f(a + (2 * s + 1) * h)')]),
            S('R[i, 0]', 'R[i - 1, 0] / 2 + h * mid'),
          ]),
          FOR('j', 1, 'i + 1', [S('R[i, j]', 'R[i, j - 1] + (R[i, j - 1] - R[i - 1, j - 1]) / (pow(4, j) - 1)')]),
          FOR('j', 0, 'i + 1', [P('R(', int('i'), ', ', int('j'), ') = ', num('R[i, j]', 10))]),
        ]),
        P('Integral = R(', int('k'), ', ', int('k'), ') = ', num('R[k, k]', 10)),
      ],
    }),
  },

  'power-method': {
    name: 'Power method',
    clean: (raw) => {
      const A = square(raw.cells);
      const x0 = String(raw.x0 ?? '').trim() ? list(raw.x0, 'the starting vector', A.length) : A.map(() => 1);
      if (x0.length !== A.length) throw new ExportError(`The starting vector needs exactly ${A.length} numbers.`);
      if (x0.every((v) => v === 0)) throw new ExportError("The starting vector can't be all zeros.");
      return { A, x0, mode: choice(raw.mode, ['largest', 'smallest']), tol: opt(raw.tol, 0.0001), maxIter: Math.min(1000, Math.max(1, Math.round(opt(raw.maxIter, 50)))) };
    },
    program: (p) => {
      const smallest = p.mode === 'smallest';
      return {
        title: smallest ? 'Inverse power method: smallest eigenvalue' : 'Power method: largest eigenvalue',
        about: ['y = B x; the eigenvalue estimate is the entry of y largest in size; x = y / that entry', ...(smallest ? ['B = A^-1, so the smallest eigenvalue of A is 1 / (largest of B)'] : [])],
        body: [
          D('n', 'int', String(p.A.length)),
          D('A', 'mat', { mat: p.A }),
          ...(smallest ? invert('A', 'B', 'n') : copyMatrix('A', 'B', 'n', 'n')),
          D('x', 'vec', { vec: p.x0 }),
          D('y', 'vec', { zeros: 'n' }),
          D('tol', 'num', lit(p.tol)),
          D('lam', 'num', '0'),
          D('started', 'bool', 'false'),
          D('done', 'bool', 'false'),
          D('k', 'int', '0'),
          WHILE(`k < ${p.maxIter} and not done`, [
            S('k', 'k + 1'),
            FOR('i', 0, 'n', [S('y[i]', '0'), FOR('j', 0, 'n', [S('y[i]', 'y[i] + B[i, j] * x[j]')])]),
            D('big', 'int', '0'),
            FOR('i', 1, 'n', [IF('abs(y[i]) > abs(y[big]) + 1e-12', [S('big', 'i')])]),
            D('next', 'num', 'y[big]'),
            D('settled', 'bool', 'started and abs(next - lam) < tol'),
            FOR('i', 0, 'n', [
              IF('abs(y[i] / next - x[i]) >= tol * 10', [S('settled', 'false')]),
              S('x[i]', 'y[i] / next'),
            ]),
            S('lam', 'next'),
            S('started', 'true'),
            S('done', 'settled'),
            P('Iteration ', int('k', 3), ': estimate = ', num('lam', 6)),
          ]),
          ...(smallest ? [P('Largest eigenvalue of A^-1 = ', num('lam', 6)), P('Smallest eigenvalue of A = ', num('1 / lam', 6))] : [P('Largest eigenvalue = ', num('lam', 6))]),
          P('Eigenvector (scaled so its largest entry is 1):'),
          ...printVector('x', 'n'),
        ],
      };
    },
  },

  rk2: {
    name: 'RK2 (Heun and midpoint)',
    clean: (raw) => ({ ...ode(raw), variant: choice(raw.variant, ['heun', 'midpoint']) }),
    program: (p) => ({
      title: `RK2 method (${p.variant === 'midpoint' ? 'midpoint' : "Heun's"}) for dy/dx = f(x, y)`,
      about: p.variant === 'midpoint'
        ? ['k1 = f(x, y), k2 = f(x + h/2, y + h/2 k1), y(next) = y + h k2']
        : ['k1 = f(x, y), k2 = f(x + h, y + h k1), y(next) = y + h/2 (k1 + k2)'],
      funcs: [fn('f', p.f, ['x', 'y'], 'dy/dx = f(x, y) as you typed it')],
      body: [
        D('x0', 'num', lit(p.x0)),
        D('h', 'num', lit(p.h)),
        D('x', 'num', 'x0'),
        D('y', 'num', lit(p.y0)),
        P('    x            y'),
        P(num('x', 4, 6), '  ', num('y', 6, 12)),
        FOR('i', 0, String(p.steps), [
          D('k1', 'num', 'f(x, y)'),
          ...(p.variant === 'midpoint'
            ? [D('k2', 'num', 'f(x + h / 2, y + h / 2 * k1)'), S('y', 'y + h * k2')]
            : [D('k2', 'num', 'f(x + h, y + h * k1)'), S('y', 'y + h / 2 * (k1 + k2)')]),
          S('x', 'x0 + (i + 1) * h'),
          P(num('x', 4, 6), '  ', num('y', 6, 12)),
        ]),
        P('y(', num('x', 4), ') = ', num('y', 6)),
      ],
    }),
  },

  stirling: {
    name: "Stirling's interpolation",
    clean: (raw) => {
      const d = equal(raw);
      const X = n(raw.at, 'the x to interpolate at');
      if (X < d.x[0] || X > d.x.at(-1)) throw new ExportError('The x to interpolate at must be inside the table.');
      return { ...d, X };
    },
    program: (p) => ({
      title: "Stirling's central difference interpolation",
      about: ['p = (x - x0) / h with x0 the nearest table point', 'y = y0 + p mean(Dy_-1, Dy_0) + p^2/2! D2y_-1 + p(p^2 - 1)/3! mean(D3y_-2, D3y_-1) + ...'],
      body: [
        D('n', 'int', String(p.x.length)),
        D('x', 'vec', { vec: p.x }),
        D('y', 'vec', { vec: p.y }),
        D('h', 'num', 'x[1] - x[0]'),
        D('X', 'num', lit(p.X)),
        ...differenceTable('n'),
        D('o', 'int', 'int(round((X - x[0]) / h))'),
        D('p', 'num', '(X - x[o]) / h'),
        P('x0 = ', num('x[o]', 6), ', p = ', num('p', 6)),
        D('total', 'num', 'y[o]'),
        FOR('m', 1, 'n', [
          IF('2 * m - 1 >= n', [BREAK]),
          C('Odd term of order 2m - 1: needs D^(2m-1) y at -m and -m + 1'),
          IF('o < m or o - m + 1 >= n - (2 * m - 1)', [BREAK]),
          D('odd', 'num', 'p'),
          FOR('j', 1, 'm', [S('odd', 'odd * (p * p - float(j * j))')]),
          ...factorial('fo', '2 * m - 1'),
          S('total', 'total + odd / fo * (T[2 * m - 1, o - m] + T[2 * m - 1, o - m + 1]) / 2'),
          IF('2 * m >= n', [BREAK]),
          C('Even term of order 2m: needs D^(2m) y at -m'),
          IF('o - m >= n - 2 * m', [BREAK]),
          D('even', 'num', 'p * p'),
          FOR('j', 1, 'm', [S('even', 'even * (p * p - float(j * j))')]),
          ...factorial('fe', '2 * m'),
          S('total', 'total + even / fe * T[2 * m, o - m]'),
        ]),
        P('y(', num('X', 6), ') = ', num('total', 6)),
      ],
    }),
  },

  bessel: {
    name: "Bessel's interpolation",
    clean: (raw) => {
      const d = equal(raw);
      const X = n(raw.at, 'the x to interpolate at');
      if (X < d.x[0] || X > d.x.at(-1)) throw new ExportError('The x to interpolate at must be inside the table.');
      return { ...d, X };
    },
    program: (p) => ({
      title: "Bessel's central difference interpolation",
      about: ['x0 is the table point just below x, p = (x - x0) / h', 'y = mean(y0, y1) + (p - 1/2) Dy0 + p(p - 1)/2! mean(D2y_-1, D2y_0) + (p - 1/2) p (p - 1)/3! D3y_-1 + ...'],
      body: [
        D('n', 'int', String(p.x.length)),
        D('x', 'vec', { vec: p.x }),
        D('y', 'vec', { vec: p.y }),
        D('h', 'num', 'x[1] - x[0]'),
        D('X', 'num', lit(p.X)),
        ...differenceTable('n'),
        D('o', 'int', 'int(min(float(n - 2), (X - x[0]) / h + 1e-9))'),
        D('p', 'num', '(X - x[o]) / h'),
        P('x0 = ', num('x[o]', 6), ', p = ', num('p', 6)),
        D('total', 'num', '(y[o] + y[o + 1]) / 2'),
        FOR('m', 0, 'n', [
          IF('2 * m + 1 >= n', [BREAK]),
          C('prod = (p + m - 1)(p + m - 2) ... (p - m), 2m factors'),
          D('prod', 'num', '1'),
          FOR('t', 0, '2 * m', [S('prod', 'prod * (p - (float(t) - float(m) + 1))')]),
          IF('m > 0', [
            IF('o < m or o - m + 1 >= n - 2 * m', [BREAK]),
            ...factorial('fe', '2 * m'),
            S('total', 'total + prod / fe * (T[2 * m, o - m] + T[2 * m, o - m + 1]) / 2'),
          ]),
          IF('o < m or o - m >= n - (2 * m + 1)', [BREAK]),
          ...factorial('fo', '2 * m + 1'),
          S('total', 'total + (p - 0.5) * prod / fo * T[2 * m + 1, o - m]'),
        ]),
        P('y(', num('X', 6), ') = ', num('total', 6)),
      ],
    }),
  },
};

/* ---------------- Milne and Adams: predictor-corrector after three RK4 steps ---------------- */

function multiStep(kind) {
  const milne = kind === 'milne';
  return {
    name: milne ? "Milne's predictor-corrector" : 'Adams-Bashforth-Moulton method',
    clean: (raw) => ode(raw, 4),
    program: (p) => ({
      title: `${milne ? "Milne's" : 'Adams-Bashforth-Moulton'} predictor-corrector for dy/dx = f(x, y)`,
      about: [
        'The first three steps are taken with RK4; then each step predicts and corrects',
        milne ? 'P: y(n+1) = y(n-3) + 4h/3 (2f(n-2) - f(n-1) + 2f(n))' : 'P: y(n+1) = y(n) + h/24 (55f(n) - 59f(n-1) + 37f(n-2) - 9f(n-3))',
        milne ? 'C: y(n+1) = y(n-1) + h/3 (f(n-1) + 4f(n) + f(n+1))' : 'C: y(n+1) = y(n) + h/24 (9f(n+1) + 19f(n) - 5f(n-1) + f(n-2))',
        'The corrector is repeated until it changes by less than 1e-6 (at most 5 times)',
      ],
      funcs: [fn('f', p.f, ['x', 'y'], 'dy/dx = f(x, y) as you typed it')],
      body: [
        D('steps', 'int', String(p.steps)),
        D('x0', 'num', lit(p.x0)),
        D('h', 'num', lit(p.h)),
        D('ys', 'vec', { zeros: 'steps + 1' }),
        D('fs', 'vec', { zeros: 'steps + 1' }),
        S('ys[0]', lit(p.y0)),
        S('fs[0]', 'f(x0, ys[0])'),
        P(' n      x            y'),
        P(int('0', 2), '  ', num('x0', 4, 6), '  ', num('ys[0]', 6, 12), '  (given)'),
        C('Starting values by RK4'),
        FOR('i', 0, 3, [
          D('xi', 'num', 'x0 + i * h'),
          D('k1', 'num', 'h * f(xi, ys[i])'),
          D('k2', 'num', 'h * f(xi + h / 2, ys[i] + k1 / 2)'),
          D('k3', 'num', 'h * f(xi + h / 2, ys[i] + k2 / 2)'),
          D('k4', 'num', 'h * f(xi + h, ys[i] + k3)'),
          S('ys[i + 1]', 'ys[i] + (k1 + 2 * k2 + 2 * k3 + k4) / 6'),
          S('fs[i + 1]', 'f(xi + h, ys[i + 1])'),
          P(int('i + 1', 2), '  ', num('xi + h', 4, 6), '  ', num('ys[i + 1]', 6, 12), '  (RK4)'),
        ]),
        FOR('m', 3, 'steps', [
          D('xm', 'num', 'x0 + (m + 1) * h'),
          D('yp', 'num', milne
            ? 'ys[m - 3] + 4 * h / 3 * (2 * fs[m - 2] - fs[m - 1] + 2 * fs[m])'
            : 'ys[m] + h / 24 * (55 * fs[m] - 59 * fs[m - 1] + 37 * fs[m - 2] - 9 * fs[m - 3])'),
          D('yc', 'num', 'yp'),
          D('fc', 'num', 'f(xm, yp)'),
          D('passes', 'int', '0'),
          D('change', 'num', '1e30'),
          WHILE('passes < 5 and change >= 1e-6', [
            D('next', 'num', milne ? 'ys[m - 1] + h / 3 * (fs[m - 1] + 4 * fs[m] + fc)' : 'ys[m] + h / 24 * (9 * fc + 19 * fs[m] - 5 * fs[m - 1] + fs[m - 2])'),
            S('change', 'abs(next - yc)'),
            S('yc', 'next'),
            S('fc', 'f(xm, yc)'),
            S('passes', 'passes + 1'),
          ]),
          S('ys[m + 1]', 'yc'),
          S('fs[m + 1]', 'fc'),
          P(int('m + 1', 2), '  ', num('xm', 4, 6), '  ', num('yc', 6, 12), '  (predicted ', num('yp', 6), ')'),
        ]),
        P('y(', num('x0 + steps * h', 4), ') = ', num('ys[steps]', 6)),
      ],
    }),
  };
}

EXPORTS.milne = multiStep('milne');
EXPORTS.adams = multiStep('adams');
