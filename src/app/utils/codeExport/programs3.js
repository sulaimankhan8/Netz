/**
 * Code export for the Batch 2–4 numerical pages of Units 1–4: Newton for systems, double integration,
 * Cholesky, QR, Jacobi eigenvalues, golden section, gradient descent, boundary value problems, the heat,
 * Laplace and wave equations, Monte Carlo, conjugate gradients, Chebyshev nodes, IEEE-754, and the
 * root and interpolation methods of group 4G. `raw` is what the page passes to its engine.
 */

import { derivative } from './compile.js';
import {
  D, S, FOR, DOWN, WHILE, IF, P, C, BREAK, num, int, lit, fn, normal, uses, n, opt, cn, whole, pos, list, pair, table, text, choice, ExportError,
  gaussSolve, thomas, printVector, printMatrix,
} from './kit.js';

/* ---------------- helpers ---------------- */

/** Statements in their own block, so names declared inside can be declared again in another block. */
const block = (body) => FOR('blk', 0, 1, body);

/** A row of up to `count` values u[0..count-1] on one print line. */
const rowParts = (name, count, p = 4, w = 9) => {
  const parts = [];
  for (let i = 0; i < count; i++) parts.push(num(`${name}[${i}]`, p, w));
  return parts;
};

/** A matrix written as "a b; c d" or rows of cells. */
const matrixInput = (v, name, opts) => table(Array.isArray(v) ? v : String(v ?? '').replace(/\r/g, ''), name, opts);

/** Polynomial coefficients, highest power first, leading zeros dropped. */
function coeffs(v, min = 2) {
  const a = list(v, 'the coefficients', 1);
  while (a.length && Math.abs(a[0]) < 1e-14) a.shift();
  if (a.length < min) throw new ExportError('Give a polynomial (coefficients from the highest power down).');
  if (a.length > 11) throw new ExportError('Code export takes polynomials up to degree 10.');
  return a;
}

/** pv = value of the polynomial in vector `c` (length len, highest power first) at `at`. */
const polyAt = (target, c, len, at) => [D(target, 'num', '0'), FOR('pw', 0, len, [S(target, `${target} * (${at}) + ${c}[pw]`)])];

const equalX = (x) => {
  const h = x[1] - x[0];
  if (x.some((v, i) => i > 0 && Math.abs(v - x[i - 1] - h) > 1e-9 * Math.max(1, Math.abs(h)))) throw new ExportError('The x values must be equally spaced.');
  return h;
};

/* ---------------- programs ---------------- */

export const EXPORTS = {
  'newton-system': {
    name: "Newton's method for systems",
    clean: (raw) => {
      const eqs = [raw.f1, raw.f2, raw.f3].map((s) => String(s ?? '').trim()).filter(Boolean);
      if (eqs.length < 2) throw new ExportError('Enter at least two equations.');
      const names = ['x', 'y', 'z'].slice(0, eqs.length);
      const F = eqs.map((s, i) => {
        const parts = s.split('=');
        if (parts.length > 2) throw new ExportError(`Equation ${i + 1} has more than one = sign.`);
        return normal(parts.length === 2 ? `(${parts[0]}) - (${parts[1]})` : s, `equation ${i + 1}`);
      });
      const start = [raw.x0, raw.y0, raw.z0].slice(0, eqs.length).map((v, i) => n(v, `the starting ${names[i]}`));
      return { F, names, start, tol: pos(opt(raw.tol, 0.0001), 'the tolerance') };
    },
    program: (p) => {
      const k = p.F.length;
      const V = p.names;
      const funcs = [
        ...p.F.map((e, i) => fn(`F${i + 1}`, e, V, `Equation ${i + 1}, written as F${i + 1}(${V.join(', ')}) = 0`)),
        ...p.F.flatMap((e, i) => V.map((v, j) => fn(`J${i + 1}${j + 1}`, derivative(e, v), V, `dF${i + 1}/d${v}`))),
      ];
      const args = V.map((_, j) => `X[${j}]`).join(', ');
      return {
        title: "Newton's method for a system of nonlinear equations",
        about: ['Each step solves J(X) d = -F(X) and sets X = X + d, until the largest |d| is below the tolerance'],
        funcs,
        body: [
          D('n', 'int', String(k)),
          D('X', 'vec', { vec: p.start }),
          D('tol', 'num', lit(p.tol)),
          D('it', 'int', '0'),
          D('step', 'num', '1e30'),
          WHILE('it < 30 and step >= tol', [
            D('J', 'mat', { zeros2: ['n', 'n'] }),
            D('rhs', 'vec', { zeros: 'n' }),
            ...p.F.map((_, i) => S(`rhs[${i}]`, `-F${i + 1}(${args})`)),
            ...p.F.flatMap((_, i) => V.map((__, j) => S(`J[${i}, ${j}]`, `J${i + 1}${j + 1}(${args})`))),
            ...gaussSolve('J', 'rhs', 'd', 'n'),
            S('step', '0'),
            FOR('i', 0, 'n', [S('X[i]', 'X[i] + d[i]'), S('step', 'max(step, abs(d[i]))')]),
            S('it', 'it + 1'),
            P('Iteration ', int('it', 2), ': ', ...V.flatMap((v, j) => [`${v} = `, num(`X[${j}]`, 8), j < k - 1 ? ', ' : '']).filter((x) => x !== ''), ', largest step = ', num('step', 8)),
          ]),
          IF('step < tol', [P('Converged after ', int('it'), ' iterations:')], [P('Not converged in 30 iterations. Last values:')]),
          ...V.map((v, j) => P(`${v} = `, num(`X[${j}]`, 8))),
        ],
      };
    },
  },

  'double-integration': {
    name: 'Double integration',
    clean: (raw) => {
      const rule = choice(raw.rule, ['simpson', 'trapezoidal']);
      const p = { f: text(raw.f, 'f(x, y)'), a: cn(raw.a, 'x from'), b: cn(raw.b, 'x to'), c: cn(raw.c, 'y from'), d: cn(raw.d, 'y to'), m: whole(opt(raw.m, 4), 'the strips in x', 1, 40), n: whole(opt(raw.n, 4), 'the strips in y', 1, 40), rule };
      if (!(p.b > p.a) || !(p.d > p.c)) throw new ExportError('Each upper limit must be bigger than its lower limit.');
      if (rule === 'simpson' && (p.m % 2 || p.n % 2)) throw new ExportError("Simpson's rule needs an even number of strips each way.");
      return p;
    },
    program: (p) => {
      const simpson = p.rule === 'simpson';
      const weight = (w, i, last) => [
        D(w, 'num', '1'),
        IF(`${i} > 0 and ${i} < ${last}`, simpson ? [IF(`${i} % 2 == 1`, [S(w, '4')], [S(w, '2')])] : [S(w, '2')]),
      ];
      return {
        title: `Double integral by the ${simpson ? "Simpson's 1/3" : 'trapezoidal'} rule in x and y`,
        about: [`I = ${simpson ? 'h k / 9' : 'h k / 4'} * sum of w_i w_j f(x_i, y_j)`],
        funcs: [fn('f', p.f, ['x', 'y'])],
        body: [
          D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('c', 'num', lit(p.c)), D('d', 'num', lit(p.d)),
          D('m', 'int', String(p.m)), D('n', 'int', String(p.n)),
          D('h', 'num', '(b - a) / m'),
          D('k', 'num', '(d - c) / n'),
          D('total', 'num', '0'),
          FOR('j', 0, 'n + 1', [
            ...weight('wy', 'j', 'n'),
            FOR('i', 0, 'm + 1', [
              ...weight('wx', 'i', 'm'),
              S('total', 'total + wx * wy * f(a + i * h, c + j * k)'),
            ]),
          ]),
          D('I', 'num', `${simpson ? 'h * k / 9' : 'h * k / 4'} * total`),
          P('h = ', num('h', 6), ', k = ', num('k', 6)),
          P('Integral = ', num('I', 8)),
        ],
      };
    },
  },

  cholesky: {
    name: 'Cholesky decomposition',
    clean: (raw) => {
      const A = table(raw.cells, 'matrix A', { square: true, minRows: 2 });
      A.forEach((r, i) => r.forEach((v, j) => { if (Math.abs(v - A[j][i]) > 1e-9) throw new ExportError('A must be symmetric for Cholesky.'); }));
      const b = String(raw.b ?? '').trim() ? list(raw.b, 'b', A.length) : null;
      if (b && b.length !== A.length) throw new ExportError(`b needs ${A.length} numbers.`);
      return { A, b };
    },
    program: (p) => ({
      title: 'Cholesky decomposition A = L L^T',
      about: ['l_jj = sqrt(a_jj - sum of l_jk^2), l_ij = (a_ij - sum of l_ik l_jk) / l_jj'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        D('L', 'mat', { zeros2: ['n', 'n'] }),
        D('ok', 'bool', 'true'),
        FOR('j', 0, 'n', [
          D('s', 'num', 'A[j, j]'),
          FOR('k', 0, 'j', [S('s', 's - L[j, k] * L[j, k]')]),
          IF('s <= 1e-12', [S('ok', 'false'), BREAK]),
          S('L[j, j]', 'sqrt(s)'),
          FOR('i', 'j + 1', 'n', [
            D('t', 'num', 'A[i, j]'),
            FOR('k', 0, 'j', [S('t', 't - L[i, k] * L[j, k]')]),
            S('L[i, j]', 't / L[j, j]'),
          ]),
        ]),
        IF('ok', [
          P('L ='),
          ...printMatrix('L', 'n', p.A.length, 'L', 6),
          ...(p.b ? [
            D('b', 'vec', { vec: p.b }),
            C('Forward substitution L y = b, then back substitution L^T x = y'),
            D('y', 'vec', { zeros: 'n' }),
            FOR('i', 0, 'n', [D('s', 'num', 'b[i]'), FOR('k', 0, 'i', [S('s', 's - L[i, k] * y[k]')]), S('y[i]', 's / L[i, i]')]),
            D('x', 'vec', { zeros: 'n' }),
            DOWN('i', 'n - 1', 0, [D('s', 'num', 'y[i]'), FOR('k', 'i + 1', 'n', [S('s', 's - L[k, i] * x[k]')]), S('x[i]', 's / L[i, i]')]),
            ...printVector('x', 'n'),
          ] : []),
        ], [P('A is not positive definite, so it has no Cholesky decomposition.')]),
      ],
    }),
  },

  qr: {
    name: 'QR decomposition',
    clean: (raw) => {
      const A = table(raw.cells, 'matrix A', { minRows: 2 });
      const mode = choice(raw.mode, ['decompose', 'eigen']);
      if (A.length < A[0].length) throw new ExportError('Use a matrix with at least as many rows as columns.');
      if (mode !== 'decompose' && A.length !== A[0].length) throw new ExportError('Eigenvalues need a square matrix.');
      return { A, mode };
    },
    program: (p) => {
      const rows = p.A.length;
      const cols = p.A[0].length;
      const gram = (src, check) => [
        D('Q', 'mat', { zeros2: ['m', 'n'] }),
        D('R', 'mat', { zeros2: ['n', 'n'] }),
        ...(check ? [D('indep', 'bool', 'true')] : []),
        FOR('k', 0, 'n', [
          D('u', 'vec', { zeros: 'm' }),
          FOR('i', 0, 'm', [S('u[i]', `${src}[i, k]`)]),
          FOR('j', 0, 'k', [
            D('dot', 'num', '0'),
            FOR('i', 0, 'm', [S('dot', `dot + Q[i, j] * ${src}[i, k]`)]),
            S('R[j, k]', 'dot'),
            FOR('i', 0, 'm', [S('u[i]', 'u[i] - dot * Q[i, j]')]),
          ]),
          D('norm', 'num', '0'),
          FOR('i', 0, 'm', [S('norm', 'norm + u[i] * u[i]')]),
          S('norm', 'sqrt(norm)'),
          IF('norm < 1e-10', [...(check ? [S('indep', 'false')] : []), S('norm', '1')]),
          S('R[k, k]', 'norm'),
          FOR('i', 0, 'm', [S('Q[i, k]', 'u[i] / norm')]),
        ]),
      ];
      if (p.mode === 'decompose') {
        return {
          title: 'QR decomposition by Gram-Schmidt',
          about: ['Each column of A minus its parts along the earlier q columns, divided by its length, is the next q'],
          body: [
            D('m', 'int', String(rows)), D('n', 'int', String(cols)),
            D('A', 'mat', { mat: p.A }),
            ...gram('A', true),
            IF('indep', [P('Q ='), ...printMatrix('Q', 'm', cols, 'Q', 6), P('R ='), ...printMatrix('R', 'n', cols, 'R', 6)],
              [P('The columns are not independent, so Gram-Schmidt cannot finish.')]),
          ],
        };
      }
      return {
        title: 'Eigenvalues by QR iteration',
        about: ['A(k+1) = R Q where A(k) = Q R; the diagonal tends to the eigenvalues'],
        body: [
          D('m', 'int', String(rows)), D('n', 'int', String(cols)),
          D('Ak', 'mat', { mat: p.A }),
          D('below', 'num', '1'),
          D('k', 'int', '0'),
          WHILE('k < 200 and below >= 1e-10', [
            ...gram('Ak', false),
            FOR('i', 0, 'n', [FOR('j', 0, 'n', [
              D('s', 'num', '0'),
              FOR('t', 0, 'n', [S('s', 's + R[i, t] * Q[t, j]')]),
              S('Ak[i, j]', 's'),
            ])]),
            S('below', '0'),
            FOR('i', 1, 'n', [FOR('j', 0, 'i', [S('below', 'max(below, abs(Ak[i, j]))')])]),
            S('k', 'k + 1'),
          ]),
          P('After ', int('k'), ' QR steps (largest entry below the diagonal: ', num('below', 10), '):'),
          FOR('i', 0, 'n', [P('Eigenvalue ', int('i + 1'), ' = ', num('Ak[i, i]', 8))]),
        ],
      };
    },
  },

  'jacobi-eigen': {
    name: "Jacobi's eigenvalue method",
    clean: (raw) => {
      const A = table(raw.cells, 'matrix A', { square: true, minRows: 2 });
      if (A.length > 6) throw new ExportError('Use a 2×2 to 6×6 matrix.');
      A.forEach((r, i) => r.forEach((v, j) => { if (Math.abs(v - A[j][i]) > 1e-9) throw new ExportError("A must be symmetric for Jacobi's method."); }));
      return { A, tol: pos(opt(raw.tol, 1e-6), 'the tolerance') };
    },
    program: (p) => ({
      title: "Jacobi's method for the eigenvalues of a symmetric matrix",
      about: ['Each rotation zeroes the largest off-diagonal entry a_pq: tan(2 theta) = 2 a_pq / (a_pp - a_qq)', 'A = P^T A P and V = V P; the diagonal tends to the eigenvalues, the columns of V to the eigenvectors'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        D('V', 'mat', { zeros2: ['n', 'n'] }),
        FOR('i', 0, 'n', [S('V[i, i]', '1')]),
        D('B', 'mat', { zeros2: ['n', 'n'] }),
        D('tol', 'num', lit(p.tol)),
        D('rot', 'int', '0'),
        WHILE('rot < 200', [
          D('pp', 'int', '0'), D('qq', 'int', '1'), D('big', 'num', '0'),
          FOR('i', 0, 'n', [FOR('j', 'i + 1', 'n', [IF('abs(A[i, j]) > abs(big)', [S('big', 'A[i, j]'), S('pp', 'i'), S('qq', 'j')])])]),
          IF('abs(big) < tol', [BREAK]),
          D('theta', 'num', '0'),
          IF('abs(A[pp, pp] - A[qq, qq]) < 1e-14', [IF('big > 0', [S('theta', 'pi / 4')], [S('theta', '-pi / 4')])],
            [S('theta', '0.5 * atan(2 * big / (A[pp, pp] - A[qq, qq]))')]),
          D('c', 'num', 'cos(theta)'),
          D('s', 'num', 'sin(theta)'),
          C('B = A P (only columns p and q change), then A = P^T B (only rows p and q change)'),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('B[i, j]', 'A[i, j]')])]),
          FOR('i', 0, 'n', [S('B[i, pp]', 'c * A[i, pp] + s * A[i, qq]'), S('B[i, qq]', '-s * A[i, pp] + c * A[i, qq]')]),
          FOR('j', 0, 'n', [S('A[pp, j]', 'c * B[pp, j] + s * B[qq, j]'), S('A[qq, j]', '-s * B[pp, j] + c * B[qq, j]')]),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [IF('i != pp and i != qq', [S('A[i, j]', 'B[i, j]')])])]),
          S('A[pp, qq]', '0'), S('A[qq, pp]', '0'),
          FOR('i', 0, 'n', [D('vp', 'num', 'V[i, pp]'), S('V[i, pp]', 'c * vp + s * V[i, qq]'), S('V[i, qq]', '-s * vp + c * V[i, qq]')]),
          S('rot', 'rot + 1'),
          P('Rotation ', int('rot', 2), ': zeroed a(', int('pp + 1'), ', ', int('qq + 1'), '), theta = ', num('theta * 180 / pi', 4), ' degrees'),
        ]),
        C('Print the eigenvalues from largest to smallest, each with its eigenvector'),
        D('shown', 'vec', { zeros: 'n' }),
        FOR('t', 0, 'n', [
          D('best', 'int', '0'),
          D('found', 'bool', 'false'),
          FOR('i', 0, 'n', [IF('shown[i] == 0 and (not found or A[i, i] > A[best, best])', [S('best', 'i'), S('found', 'true')])]),
          S('shown[best]', '1'),
          P('Eigenvalue ', int('t + 1'), ' = ', num('A[best, best]', 8)),
          FOR('i', 0, 'n', [P('  v', int('i + 1'), ' = ', num('V[i, best]', 6))]),
        ]),
      ],
    }),
  },

  'golden-section': {
    name: 'Golden section search',
    clean: (raw) => {
      const p = { f: text(raw.f, 'f(x)'), a: cn(raw.a, 'a'), b: cn(raw.b, 'b'), tol: cn(opt(raw.tol, 0.001), 'the tolerance'), goal: choice(raw.goal, ['min', 'max']) };
      if (!(p.b > p.a)) throw new ExportError('b must be bigger than a.');
      if (!(p.tol > 0)) throw new ExportError('The tolerance must be positive.');
      return p;
    },
    program: (p) => ({
      title: `Golden section search for the ${p.goal === 'max' ? 'maximum' : 'minimum'} of f on [a, b]`,
      about: ['x1 = b - 0.618(b - a), x2 = a + 0.618(b - a); keep the part that holds the better point'],
      funcs: [fn('f', p.f)],
      body: [
        D('phi', 'num', '(sqrt(5) - 1) / 2'),
        D('sgn', 'num', p.goal === 'max' ? '-1' : '1'),
        D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('tol', 'num', lit(p.tol)),
        D('x1', 'num', 'b - phi * (b - a)'), D('x2', 'num', 'a + phi * (b - a)'),
        D('f1', 'num', 'f(x1)'), D('f2', 'num', 'f(x2)'),
        D('k', 'int', '0'),
        P(' k          a          b         x1         x2'),
        WHILE('k < 200 and b - a > tol', [
          P(int('k', 2), num('a', 6, 11), num('b', 6, 11), num('x1', 6, 11), num('x2', 6, 11)),
          IF('sgn * f1 < sgn * f2', [S('b', 'x2'), S('x2', 'x1'), S('f2', 'f1'), S('x1', 'b - phi * (b - a)'), S('f1', 'f(x1)')],
            [S('a', 'x1'), S('x1', 'x2'), S('f1', 'f2'), S('x2', 'a + phi * (b - a)'), S('f2', 'f(x2)')]),
          S('k', 'k + 1'),
        ]),
        D('x', 'num', '(a + b) / 2'),
        P(p.goal === 'max' ? 'Maximum' : 'Minimum', ' at x = ', num('x', 6), ', f(x) = ', num('f(x)', 6)),
      ],
    }),
  },

  'gradient-descent': {
    name: 'Gradient descent',
    clean: (raw) => {
      const f = normal(text(raw.f, 'f'), 'f');
      const two = uses(f, 'y');
      const p = { f, two, alpha: pos(cn(opt(raw.alpha, 0.1), 'the learning rate'), 'the learning rate'), N: whole(opt(raw.steps, 20), 'the number of steps', 1, 200), tol: cn(opt(raw.tol, 0.0001), 'the tolerance') };
      p.start = [cn(raw.x0, 'x0'), ...(two ? [cn(raw.y0, 'y0')] : [])];
      return p;
    },
    program: (p) => {
      const V = p.two ? ['x', 'y'] : ['x'];
      const args = V.map((_, i) => `X[${i}]`).join(', ');
      return {
        title: 'Gradient descent',
        about: ['X = X - alpha * grad f(X), until |grad f| is below the tolerance or the steps run out'],
        funcs: [fn('f', p.f, V), ...V.map((v) => fn(`g${v}`, derivative(p.f, v), V, `df/d${v}`))],
        body: [
          D('X', 'vec', { vec: p.start }),
          D('alpha', 'num', lit(p.alpha)),
          D('tol', 'num', lit(p.tol)),
          D('steps', 'int', String(p.N)),
          FOR('k', 0, 'steps + 1', [
            ...V.map((v) => D(`d${v}`, 'num', `g${v}(${args})`)),
            D('fv', 'num', `f(${args})`),
            D('norm', 'num', `sqrt(${V.map((v) => `d${v} * d${v}`).join(' + ')})`),
            P('k = ', int('k', 3), ': ', ...V.flatMap((v, i) => [`${v} = `, num(`X[${i}]`, 6), ', ']), 'f = ', num('fv', 6), ', |grad| = ', num('norm', 6)),
            IF('abs(fv) > 1e12', [P('The values are growing without limit: alpha is too large.'), BREAK]),
            IF('norm < tol', [P('Converged: the gradient is almost zero.'), BREAK]),
            IF('k < steps', V.map((v, i) => S(`X[${i}]`, `X[${i}] - alpha * d${v}`))),
          ]),
        ],
      };
    },
  },

  'finite-difference-bvp': {
    name: 'Finite difference method (BVP)',
    clean: (raw) => {
      const p = {
        p: String(raw.p ?? '').trim() || '0', q: String(raw.q ?? '').trim() || '0', r: String(raw.r ?? '').trim() || '0',
        a: cn(raw.a, 'a'), b: cn(raw.b, 'b'), ya: cn(raw.ya, 'y(a)'), yb: cn(raw.yb, 'y(b)'), N: whole(opt(raw.n, 4), 'n', 2, 40),
        exact: String(raw.exact ?? '').trim() || null,
      };
      if (!(p.b > p.a)) throw new ExportError('b must be bigger than a.');
      return p;
    },
    program: (p) => ({
      title: "Finite differences for y'' + p(x) y' + q(x) y = r(x), y(a), y(b) given",
      about: ["y'' ~ (y(i-1) - 2y(i) + y(i+1)) / h^2 and y' ~ (y(i+1) - y(i-1)) / 2h give a tridiagonal system"],
      funcs: [fn('pf', p.p, ['x'], 'p(x)'), fn('qf', p.q, ['x'], 'q(x)'), fn('rf', p.r, ['x'], 'r(x)'), ...(p.exact ? [fn('ex', p.exact, ['x'], 'the exact solution')] : [])],
      body: [
        D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)),
        D('ya', 'num', lit(p.ya)), D('yb', 'num', lit(p.yb)),
        D('N', 'int', String(p.N)),
        D('h', 'num', '(b - a) / N'),
        D('m', 'int', 'N - 1'),
        D('lo', 'vec', { zeros: 'm' }), D('di', 'vec', { zeros: 'm' }), D('up', 'vec', { zeros: 'm' }), D('rhs', 'vec', { zeros: 'm' }),
        FOR('i', 1, 'm + 1', [
          D('x', 'num', 'a + i * h'),
          D('L', 'num', '1 - h * pf(x) / 2'),
          D('U', 'num', '1 + h * pf(x) / 2'),
          S('di[i - 1]', '-2 + h * h * qf(x)'),
          S('rhs[i - 1]', 'h * h * rf(x)'),
          IF('i == 1', [S('rhs[i - 1]', 'rhs[i - 1] - L * ya')], [S('lo[i - 1]', 'L')]),
          IF('i == m', [S('rhs[i - 1]', 'rhs[i - 1] - U * yb')], [S('up[i - 1]', 'U')]),
        ]),
        ...thomas('lo', 'di', 'up', 'rhs', 'inner', 'm'),
        D('y', 'vec', { zeros: 'N + 1' }),
        S('y[0]', 'ya'), S('y[N]', 'yb'),
        FOR('i', 1, 'N', [S('y[i]', 'inner[i - 1]')]),
        P(p.exact ? ' i        x            y        exact' : ' i        x            y'),
        FOR('i', 0, 'N + 1', [p.exact
          ? P(int('i', 2), num('a + i * h', 4, 9), num('y[i]', 6, 13), num('ex(a + i * h)', 6, 13))
          : P(int('i', 2), num('a + i * h', 4, 9), num('y[i]', 6, 13))]),
      ],
    }),
  },

  'shooting-method': {
    name: 'Shooting method',
    clean: (raw) => {
      const F = normal(String(raw.F ?? '').replace(/y'/g, 'z'), "y'' = F(x, y, y')", ['z']);
      const p = { F, a: cn(raw.a, 'a'), b: cn(raw.b, 'b'), ya: cn(raw.ya, 'y(a)'), yb: cn(raw.yb, 'y(b)'), s0: cn(opt(raw.s0, 0), 'the first guess'), s1: cn(opt(raw.s1, 1), 'the second guess'), N: whole(opt(raw.n, 10), 'n', 2, 200) };
      if (!(p.b > p.a)) throw new ExportError('b must be bigger than a.');
      return p;
    },
    program: (p) => {
      // One RK4 shot from y(a) = ya, y'(a) = slope; leaves y(b) in `out` (and prints when `show`)
      const shot = (slope, out, show = false) => block([
        D('x', 'num', 'a'), D('y', 'num', 'ya'), D('z', 'num', slope),
        ...(show ? [P(' i        x            y'), P(int('0', 2), num('x', 4, 9), num('y', 6, 13))] : []),
        FOR('i', 0, 'N', [
          D('k1y', 'num', 'z'), D('k1z', 'num', 'F(x, y, z)'),
          D('k2y', 'num', 'z + h / 2 * k1z'), D('k2z', 'num', 'F(x + h / 2, y + h / 2 * k1y, z + h / 2 * k1z)'),
          D('k3y', 'num', 'z + h / 2 * k2z'), D('k3z', 'num', 'F(x + h / 2, y + h / 2 * k2y, z + h / 2 * k2z)'),
          D('k4y', 'num', 'z + h * k3z'), D('k4z', 'num', 'F(x + h, y + h * k3y, z + h * k3z)'),
          S('y', 'y + h / 6 * (k1y + 2 * k2y + 2 * k3y + k4y)'),
          S('z', 'z + h / 6 * (k1z + 2 * k2z + 2 * k3z + k4z)'),
          S('x', 'x + h'),
          ...(show ? [P(int('i + 1', 2), num('x', 4, 9), num('y', 6, 13))] : []),
        ]),
        S(out, 'y'),
      ]);
      return {
        title: "Shooting method for y'' = F(x, y, y'), y(a), y(b) given",
        about: ["Guess the slope s = y'(a), solve by RK4, and correct s by the secant rule until y(b) is hit"],
        funcs: [fn('F', p.F, ['x', 'y', 'z'], "y'' = F(x, y, z) with z = y'")],
        body: [
          D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('ya', 'num', lit(p.ya)), D('yb', 'num', lit(p.yb)),
          D('N', 'int', String(p.N)),
          D('h', 'num', '(b - a) / N'),
          D('sPrev', 'num', lit(p.s0)), D('s', 'num', lit(p.s1)),
          D('yPrev', 'num', '0'), D('yCur', 'num', '0'),
          shot('sPrev', 'yPrev'),
          shot('s', 'yCur'),
          P('s = ', num('sPrev', 8), ' gives y(b) = ', num('yPrev', 8)),
          P('s = ', num('s', 8), ' gives y(b) = ', num('yCur', 8)),
          D('k', 'int', '2'),
          WHILE('k < 30 and abs(yCur - yb) > 1e-10 and abs(yCur - yPrev) >= 1e-15', [
            D('sNew', 'num', 's - (yCur - yb) * (s - sPrev) / (yCur - yPrev)'),
            S('sPrev', 's'), S('yPrev', 'yCur'), S('s', 'sNew'),
            shot('s', 'yCur'),
            P('s = ', num('s', 8), ' gives y(b) = ', num('yCur', 8)),
            S('k', 'k + 1'),
          ]),
          P("Slope y'(a) = ", num('s', 8)),
          D('yEnd', 'num', '0'),
          shot('s', 'yEnd', true),
          P('y(b) = ', num('yEnd', 8)),
        ],
      };
    },
  },

  'heat-equation': {
    name: 'Heat equation',
    clean: (raw) => {
      const method = choice(raw.method, ['bender', 'crank']);
      const p = { f: text(raw.f, 'f(x)'), L: cn(raw.L, 'L'), c2: cn(opt(raw.c2, 1), 'c^2'), h: pos(cn(raw.h, 'h'), 'h'), g0: cn(opt(raw.g0, 0), 'u(0, t)'), g1: cn(opt(raw.g1, 0), 'u(L, t)'), T: whole(opt(raw.steps, 4), 'the time steps', 1, 40), method };
      p.n = Math.round(p.L / p.h);
      if (!(p.n >= 2 && p.n <= 40) || Math.abs(p.n * p.h - p.L) > 1e-9) throw new ExportError('L must be a whole number of steps h (2 to 40 steps).');
      if (p.n > 12) throw new ExportError('Code export prints up to 12 steps across; use a bigger h.');
      if (method === 'bender') { p.lam = 0.5; p.k = (0.5 * p.h * p.h) / p.c2; } else { p.k = String(raw.k ?? '').trim() ? cn(raw.k, 'k') : (p.h * p.h) / p.c2; p.lam = (p.c2 * p.k) / (p.h * p.h); }
      return p;
    },
    program: (p) => {
      const crank = p.method === 'crank';
      return {
        title: `Heat equation u_t = c^2 u_xx by ${crank ? 'Crank-Nicolson' : "Bender-Schmidt"}`,
        about: crank
          ? ['-l u(i-1, j+1) + 2(1 + l) u(i, j+1) - l u(i+1, j+1) = l u(i-1, j) + 2(1 - l) u(i, j) + l u(i+1, j), l = c^2 k / h^2']
          : ['l = c^2 k / h^2 = 1/2: u(i, j+1) = (u(i-1, j) + u(i+1, j)) / 2'],
        funcs: [fn('f', p.f, ['x'], 'u(x, 0) = f(x)')],
        body: [
          D('n', 'int', String(p.n)),
          D('h', 'num', lit(p.h)), D('k', 'num', lit(p.k)), D('lam', 'num', lit(p.lam)),
          D('left', 'num', lit(p.g0)), D('right', 'num', lit(p.g1)),
          D('u', 'vec', { zeros: 'n + 1' }),
          D('nxt', 'vec', { zeros: 'n + 1' }),
          FOR('i', 1, 'n', [S('u[i]', 'f(i * h)')]),
          S('u[0]', 'left'), S('u[n]', 'right'),
          P(`k = `, num('k', 6), ', lambda = ', num('lam', 4)),
          P('t = ', num('0', 4, 7), ':', ...rowParts('u', p.n + 1)),
          FOR('j', 0, String(p.T), [
            ...(crank ? [
              D('m', 'int', 'n - 1'),
              D('lo', 'vec', { zeros: 'm' }), D('di', 'vec', { zeros: 'm' }), D('up', 'vec', { zeros: 'm' }), D('rhs', 'vec', { zeros: 'm' }),
              FOR('i', 1, 'n', [
                S('rhs[i - 1]', 'lam * u[i - 1] + 2 * (1 - lam) * u[i] + lam * u[i + 1]'),
                S('di[i - 1]', '2 * (1 + lam)'),
                IF('i == 1', [S('rhs[i - 1]', 'rhs[i - 1] + lam * left')], [S('lo[i - 1]', '-lam')]),
                IF('i == m', [S('rhs[i - 1]', 'rhs[i - 1] + lam * right')], [S('up[i - 1]', '-lam')]),
              ]),
              ...thomas('lo', 'di', 'up', 'rhs', 'inner', 'm'),
              FOR('i', 1, 'n', [S('nxt[i]', 'inner[i - 1]')]),
            ] : [FOR('i', 1, 'n', [S('nxt[i]', '0.5 * (u[i - 1] + u[i + 1])')])]),
            S('nxt[0]', 'left'), S('nxt[n]', 'right'),
            FOR('i', 0, 'n + 1', [S('u[i]', 'nxt[i]')]),
            P('t = ', num('(j + 1) * k', 4, 7), ':', ...rowParts('u', p.n + 1)),
          ]),
        ],
      };
    },
  },

  'laplace-liebmann': {
    name: "Laplace equation (Liebmann's method)",
    clean: (raw) => {
      const N = whole(opt(raw.n, 4), 'the grid size', 2, 10);
      const side = (v, label) => {
        const s = list(v, label, 1);
        if (s.length === 1) return Array(N + 1).fill(s[0]);
        if (s.length !== N + 1) throw new ExportError(`${label}: give one number, or ${N + 1} numbers.`);
        return s;
      };
      return { N, top: side(raw.top, 'Top'), bottom: side(raw.bottom, 'Bottom'), left: side(raw.left, 'Left'), right: side(raw.right, 'Right'), tol: pos(cn(opt(raw.tol, 0.001), 'the tolerance'), 'the tolerance') };
    },
    program: (p) => ({
      title: "Laplace's equation on a square grid by Liebmann's method",
      about: ['Each inside point becomes the mean of its four neighbours; new values are used at once (Gauss-Seidel)'],
      body: [
        D('N', 'int', String(p.N)),
        D('u', 'mat', { zeros2: ['N + 1', 'N + 1'] }),
        D('top', 'vec', { vec: p.top }), D('bottom', 'vec', { vec: p.bottom }), D('left', 'vec', { vec: p.left }), D('right', 'vec', { vec: p.right }),
        FOR('i', 0, 'N + 1', [S('u[0, i]', 'top[i]'), S('u[N, i]', 'bottom[i]')]),
        FOR('j', 0, 'N + 1', [S('u[j, 0]', 'left[j]'), S('u[j, N]', 'right[j]')]),
        C('Start every inside point at the mean of all the boundary values'),
        D('start', 'num', '0'),
        FOR('i', 0, 'N + 1', [S('start', 'start + top[i] + bottom[i] + left[i] + right[i]')]),
        S('start', 'start / (4 * (N + 1))'),
        FOR('j', 1, 'N', [FOR('i', 1, 'N', [S('u[j, i]', 'start')])]),
        D('tol', 'num', lit(p.tol)),
        D('change', 'num', '1e30'),
        D('it', 'int', '0'),
        WHILE('change > tol and it < 300', [
          S('change', '0'),
          FOR('j', 1, 'N', [FOR('i', 1, 'N', [
            D('v', 'num', '(u[j - 1, i] + u[j + 1, i] + u[j, i - 1] + u[j, i + 1]) / 4'),
            S('change', 'max(change, abs(v - u[j, i]))'),
            S('u[j, i]', 'v'),
          ])]),
          S('it', 'it + 1'),
        ]),
        P('After ', int('it'), ' sweeps (last change ', num('change', 6), '):'),
        FOR('j', 0, 'N + 1', [P(...Array.from({ length: p.N + 1 }, (_, i) => num(`u[j, ${i}]`, 4, 10)))]),
      ],
    }),
  },

  'monte-carlo-integration': {
    name: 'Monte Carlo integration',
    clean: (raw) => {
      const p = { mode: choice(raw.mode, ['mean', 'hit']), f: text(raw.f, 'f(x)'), a: cn(opt(raw.a, 0), 'a'), b: cn(opt(raw.b, 1), 'b'), N: whole(opt(raw.N, 1000), 'N', 10, 200000), seed: Math.max(1, Math.round(opt(raw.seed, 1))) };
      if (!(p.b > p.a)) throw new ExportError('Make b bigger than a.');
      return p;
    },
    program: (p) => {
      const hit = p.mode === 'hit';
      const draw = (target) => [S('state', 'state * 16807 - 2147483647 * floor(state * 16807 / 2147483647)'), S(target, 'state / 2147483647')];
      return {
        title: `Monte Carlo integration (${hit ? 'hit or miss' : 'sample mean'})`,
        about: [
          hit ? 'Throw points into the box [a, b] x [0, M]; the integral ~ box area * fraction under the curve' : 'The integral ~ (b - a) * the mean of f at random points',
          'Random numbers: Park-Miller (state = 16807 state mod 2^31 - 1), so the digits differ a little from the NETZ page',
        ],
        funcs: [fn('f', p.f)],
        body: [
          D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)),
          D('N', 'int', String(p.N)),
          D('state', 'num', lit(p.seed)),
          D('u', 'num', '0'),
          ...(hit ? [
            C('M: a little above the largest f on [a, b]'),
            D('M', 'num', '0'),
            FOR('i', 0, 401, [S('M', 'max(M, f(a + (b - a) * i / 400))')]),
            S('M', 'M * 1.05'),
            D('hits', 'num', '0'),
            FOR('i', 0, 'N', [
              ...draw('u'), D('x', 'num', 'a + (b - a) * u'),
              ...draw('u'), D('y', 'num', 'M * u'),
              IF('y <= f(x)', [S('hits', 'hits + 1')]),
            ]),
            D('frac', 'num', 'hits / N'),
            D('est', 'num', '(b - a) * M * frac'),
            D('se', 'num', '(b - a) * M * sqrt(frac * (1 - frac) / N)'),
          ] : [
            D('s', 'num', '0'), D('s2', 'num', '0'),
            FOR('i', 0, 'N', [...draw('u'), D('y', 'num', 'f(a + (b - a) * u)'), S('s', 's + y'), S('s2', 's2 + y * y')]),
            D('mean', 'num', 's / N'),
            D('est', 'num', '(b - a) * mean'),
            D('se', 'num', '(b - a) * sqrt(max(0, s2 / N - mean * mean) / N)'),
          ]),
          P('Estimate = ', num('est', 6), ', standard error = ', num('se', 6)),
        ],
      };
    },
  },

  'wave-equation': {
    name: 'Wave equation (explicit)',
    clean: (raw) => {
      const p = { f: text(raw.f, 'f(x)'), g: String(raw.g ?? '').trim() || '0', L: cn(raw.L, 'L'), c: cn(opt(raw.c, 1), 'c'), h: pos(cn(raw.h, 'h'), 'h'), T: whole(opt(raw.steps, 4), 'the time steps', 1, 40) };
      p.n = Math.round(p.L / p.h);
      if (!(p.n >= 2 && p.n <= 40) || Math.abs(p.n * p.h - p.L) > 1e-9) throw new ExportError('L must be a whole number of steps h (2 to 40 steps).');
      if (p.n > 12) throw new ExportError('Code export prints up to 12 steps across; use a bigger h.');
      p.k = String(raw.k ?? '').trim() ? cn(raw.k, 'k') : p.h / p.c;
      return p;
    },
    program: (p) => ({
      title: 'Wave equation u_tt = c^2 u_xx, explicit scheme',
      about: ['r = c k / h; u(i, j+1) = 2(1 - r^2) u(i, j) + r^2 (u(i-1, j) + u(i+1, j)) - u(i, j-1)', 'The first step uses u_t(x, 0) = g(x); the ends stay at 0'],
      funcs: [fn('f', p.f, ['x'], 'u(x, 0) = f(x)'), fn('g', p.g, ['x'], 'u_t(x, 0) = g(x)')],
      body: [
        D('n', 'int', String(p.n)),
        D('h', 'num', lit(p.h)), D('k', 'num', lit(p.k)), D('c', 'num', lit(p.c)),
        D('r2', 'num', '(c * k / h) * (c * k / h)'),
        D('prev', 'vec', { zeros: 'n + 1' }),
        D('cur', 'vec', { zeros: 'n + 1' }),
        D('nxt', 'vec', { zeros: 'n + 1' }),
        FOR('i', 1, 'n', [S('prev[i]', 'f(i * h)')]),
        FOR('i', 1, 'n', [S('cur[i]', '(1 - r2) * prev[i] + r2 / 2 * (prev[i - 1] + prev[i + 1]) + k * g(i * h)')]),
        P('r = ', num('c * k / h', 4)),
        P('t = ', num('0', 4, 7), ':', ...rowParts('prev', p.n + 1)),
        P('t = ', num('k', 4, 7), ':', ...rowParts('cur', p.n + 1)),
        FOR('j', 1, String(p.T), [
          FOR('i', 1, 'n', [S('nxt[i]', '2 * (1 - r2) * cur[i] + r2 * (cur[i - 1] + cur[i + 1]) - prev[i]')]),
          FOR('i', 0, 'n + 1', [S('prev[i]', 'cur[i]'), S('cur[i]', 'nxt[i]')]),
          P('t = ', num('(j + 1) * k', 4, 7), ':', ...rowParts('cur', p.n + 1)),
        ]),
      ],
    }),
  },

  'conjugate-gradient': {
    name: 'Conjugate gradient method',
    clean: (raw) => {
      const A = matrixInput(raw.A, 'A', { square: true, minRows: 1 });
      A.forEach((r, i) => r.forEach((v, j) => { if (Math.abs(v - A[j][i]) > 1e-12) throw new ExportError('A must be symmetric for conjugate gradients.'); }));
      const b = list(raw.b, 'b', A.length);
      if (b.length !== A.length) throw new ExportError(`b needs ${A.length} numbers.`);
      const x0 = String(raw.x0 ?? '').trim() ? list(raw.x0, 'x0', A.length) : A.map(() => 0);
      if (x0.length !== A.length) throw new ExportError(`x0 needs ${A.length} numbers.`);
      return { A, b, x0, tol: opt(raw.tol, 1e-10) > 0 ? opt(raw.tol, 1e-10) : 1e-10 };
    },
    program: (p) => ({
      title: 'Conjugate gradient method for A x = b (A symmetric positive definite)',
      about: ['alpha = r.r / p.Ap, x = x + alpha p, r = r - alpha Ap, beta = r.r(new) / r.r(old), p = r + beta p'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        D('b', 'vec', { vec: p.b }),
        D('x', 'vec', { vec: p.x0 }),
        D('r', 'vec', { zeros: 'n' }),
        D('pv', 'vec', { zeros: 'n' }),
        D('Ap', 'vec', { zeros: 'n' }),
        FOR('i', 0, 'n', [D('s', 'num', 'b[i]'), FOR('j', 0, 'n', [S('s', 's - A[i, j] * x[j]')]), S('r[i]', 's'), S('pv[i]', 's')]),
        D('rr', 'num', '0'),
        FOR('i', 0, 'n', [S('rr', 'rr + r[i] * r[i]')]),
        D('k', 'int', '0'),
        WHILE(`k < 4 * n and sqrt(rr) > ${lit(p.tol)}`, [
          FOR('i', 0, 'n', [S('Ap[i]', '0'), FOR('j', 0, 'n', [S('Ap[i]', 'Ap[i] + A[i, j] * pv[j]')])]),
          D('pAp', 'num', '0'),
          FOR('i', 0, 'n', [S('pAp', 'pAp + pv[i] * Ap[i]')]),
          D('alpha', 'num', 'rr / pAp'),
          FOR('i', 0, 'n', [S('x[i]', 'x[i] + alpha * pv[i]'), S('r[i]', 'r[i] - alpha * Ap[i]')]),
          D('rr2', 'num', '0'),
          FOR('i', 0, 'n', [S('rr2', 'rr2 + r[i] * r[i]')]),
          D('beta', 'num', 'rr2 / rr'),
          FOR('i', 0, 'n', [S('pv[i]', 'r[i] + beta * pv[i]')]),
          S('rr', 'rr2'),
          S('k', 'k + 1'),
          P('Step ', int('k'), ': |r| = ', num('sqrt(rr)', 10), ', alpha = ', num('alpha', 6), ', beta = ', num('beta', 6)),
        ]),
        ...printVector('x', 'n'),
      ],
    }),
  },

  'chebyshev-nodes': {
    name: "Chebyshev nodes and Runge's phenomenon",
    clean: (raw) => {
      const p = { f: text(raw.f, 'f(x)'), a: cn(opt(raw.a, -1), 'a'), b: cn(opt(raw.b, 1), 'b'), N: whole(opt(raw.n, 11), 'the number of nodes', 2, 30) };
      if (!(p.b > p.a)) throw new ExportError('Make b bigger than a.');
      return p;
    },
    program: (p) => {
      // Largest |p(x) - f(x)| over 2001 points for the interpolant through nodes `xs` (barycentric form)
      const worst = (xs, out) => block([
        D('w', 'vec', { zeros: 'N' }),
        FOR('j', 0, 'N', [S('w[j]', '1'), FOR('t', 0, 'N', [IF('t != j', [S('w[j]', `w[j] / (${xs}[j] - ${xs}[t])`)])])]),
        FOR('s', 0, 2001, [
          D('x', 'num', 'a + (b - a) * s / 2000'),
          D('top', 'num', '0'), D('bot', 'num', '0'), D('exact', 'num', '-1'),
          FOR('j', 0, 'N', [
            D('dx', 'num', `x - ${xs}[j]`),
            IF('abs(dx) < 1e-14', [S('exact', 'float(j)')], [S('top', `top + w[j] / dx * f(${xs}[j])`), S('bot', 'bot + w[j] / dx')]),
          ]),
          D('px', 'num', 'top / bot'),
          IF('exact >= 0', [S('px', `f(${xs}[int(exact)])`)]),
          S(out, `max(${out}, abs(px - f(x)))`),
        ]),
      ]);
      return {
        title: "Equally spaced vs Chebyshev nodes (Runge's phenomenon)",
        about: ['Chebyshev nodes: x_k = (a + b)/2 + (b - a)/2 cos((2k + 1) pi / 2N)', 'Both interpolants are compared with f at 2001 points'],
        funcs: [fn('f', p.f)],
        body: [
          D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)),
          D('N', 'int', String(p.N)),
          D('eq', 'vec', { zeros: 'N' }),
          D('ch', 'vec', { zeros: 'N' }),
          FOR('k', 0, 'N', [
            S('eq[k]', 'a + (b - a) * k / (N - 1)'),
            C('Listed from the smallest node up'),
            S('ch[N - 1 - k]', '(a + b) / 2 + (b - a) / 2 * cos((2 * k + 1) * pi / (2 * N))'),
          ]),
          D('errEq', 'num', '0'),
          D('errCh', 'num', '0'),
          worst('eq', 'errEq'),
          worst('ch', 'errCh'),
          ...printVector('ch', 'N', 'Chebyshev node ', 6),
          P('Largest error, equally spaced nodes: ', num('errEq', 6)),
          P('Largest error, Chebyshev nodes:      ', num('errCh', 6)),
        ],
      };
    },
  },

  'floating-point-representation': {
    name: 'Floating-point representation',
    clean: (raw) => ({ x: n(raw.x, 'the number'), format: choice(raw.format, ['single', 'double']) }),
    program: (p) => {
      const single = p.format === 'single';
      const bits = single ? 23 : 52;
      const bias = single ? 127 : 1023;
      return {
        title: `IEEE 754 ${single ? 'single (32-bit)' : 'double (64-bit)'} representation`,
        about: [`value = (-1)^sign * 1.fraction * 2^(exponent - ${bias}); the fraction has ${bits} bits`, single ? 'The fraction is rounded to the nearest, ties to even' : 'Doubles hold the number exactly as typed into this program'],
        body: [
          D('x', 'num', lit(p.x)),
          D('sgn', 'num', '0'),
          IF('x < 0', [S('sgn', '1')]),
          D('ax', 'num', 'abs(x)'),
          D('expo', 'num', '0'),
          D('field', 'num', '0'),
          D('stored', 'num', '0'),
          IF('ax > 0', [
            D('e2', 'num', 'floor(log2(ax))'),
            WHILE('pow(2, e2) > ax', [S('e2', 'e2 - 1')]),
            WHILE('pow(2, e2 + 1) <= ax', [S('e2', 'e2 + 1')]),
            IF(`e2 < ${1 - bias}`, [
              C('Subnormal: the exponent field is 0'),
              S('e2', String(1 - bias)),
              S('field', `ax / pow(2, ${1 - bias - bits})`),
            ], [
              S('expo', `e2 + ${bias}`),
              S('field', `(ax / pow(2, e2) - 1) * pow(2, ${bits})`),
            ]),
            ...(single ? [
              C('Round the fraction to a whole number, ties to even'),
              D('whole', 'num', 'floor(field)'),
              D('rest', 'num', 'field - whole'),
              IF('rest > 0.5 or (rest == 0.5 and int(whole) % 2 == 1)', [S('whole', 'whole + 1')]),
              S('field', 'whole'),
              IF(`field >= pow(2, ${bits})`, [S('field', '0'), S('e2', 'e2 + 1'), S('expo', `e2 + ${bias}`)]),
            ] : []),
            IF('expo == 0', [S('stored', `field * pow(2, ${1 - bias - bits})`)], [S('stored', `(1 + field / pow(2, ${bits})) * pow(2, e2)`)]),
            IF('sgn == 1', [S('stored', '-stored')]),
          ]),
          P('Sign bit: ', num('sgn', 0)),
          P(`Exponent field: `, num('expo', 0), ` (unbiased `, num('expo - ' + bias, 0), ')'),
          P(`Fraction field (${bits} bits, as a whole number): `, num('field', 0)),
          P('Stored value: ', num('stored', 20)),
          P('Rounding error: ', num('stored - x', 20)),
        ],
      };
    },
  },

  'muller-method': {
    name: "Muller's method",
    clean: (raw) => ({ f: text(raw.f, 'f(x)'), x0: cn(opt(raw.x0, 0), 'x0'), x1: cn(opt(raw.x1, 1), 'x1'), x2: cn(opt(raw.x2, 2), 'x2'), tol: opt(raw.tol, 1e-6) > 0 ? opt(raw.tol, 1e-6) : 1e-6, max: Math.min(60, Math.max(1, Math.round(opt(raw.max, 20)))) }),
    program: (p) => ({
      title: "Muller's method for f(x) = 0",
      about: ['Fit a parabola through the last three points; its root nearest x2 is the next point', 'This program works with real numbers: it stops if the next point would be complex (the NETZ page follows complex roots)'],
      funcs: [fn('f', p.f)],
      body: [
        D('a0', 'num', lit(p.x0)), D('a1', 'num', lit(p.x1)), D('a2', 'num', lit(p.x2)),
        D('x3', 'num', 'a2'),
        D('k', 'int', '0'),
        D('done', 'bool', 'false'),
        WHILE(`k < ${p.max} and not done`, [
          D('h1', 'num', 'a1 - a0'), D('h2', 'num', 'a2 - a1'),
          D('d1', 'num', '(f(a1) - f(a0)) / h1'), D('d2', 'num', '(f(a2) - f(a1)) / h2'),
          D('qa', 'num', '(d2 - d1) / (h2 + h1)'),
          D('qb', 'num', 'qa * h2 + d2'),
          D('qc', 'num', 'f(a2)'),
          D('disc', 'num', 'qb * qb - 4 * qa * qc'),
          IF('disc < 0', [P('The next point is complex; this real-number program stops here.'), BREAK]),
          D('dp', 'num', 'qb + sqrt(disc)'), D('dm', 'num', 'qb - sqrt(disc)'),
          D('den', 'num', 'dp'),
          IF('abs(dm) > abs(dp)', [S('den', 'dm')]),
          S('x3', 'a2 - 2 * qc / den'),
          S('k', 'k + 1'),
          P('k = ', int('k', 2), ': x3 = ', num('x3', 8), ', f(x3) = ', num('f(x3)', 10)),
          IF(`abs(x3 - a2) < ${lit(p.tol)} * max(1, abs(x3)) or abs(f(x3)) < 1e-14`, [S('done', 'true')]),
          S('a0', 'a1'), S('a1', 'a2'), S('a2', 'x3'),
        ]),
        P('Root ~ ', num('x3', 8)),
      ],
    }),
  },

  'bairstow-method': {
    name: "Bairstow's method",
    clean: (raw) => {
      const a = coeffs(raw.coeffs, 3);
      return { a, r: opt(raw.r0, 0), s: opt(raw.s0, 0), tol: opt(raw.tol, 1e-8) > 0 ? opt(raw.tol, 1e-8) : 1e-8 };
    },
    program: (p) => {
      // Prints the two roots of x^2 - r x - s
      const quad = (r, s) => [
        D('dq', 'num', `${r} * ${r} + 4 * ${s}`),
        IF('dq >= 0', [P('  root: ', num(`(${r} + sqrt(dq)) / 2`, 6)), P('  root: ', num(`(${r} - sqrt(dq)) / 2`, 6))],
          [P('  root: ', num(`${r} / 2`, 6), ' + ', num('sqrt(-dq) / 2', 6), 'i'), P('  root: ', num(`${r} / 2`, 6), ' - ', num('sqrt(-dq) / 2', 6), 'i')]),
      ];
      return {
        title: "Bairstow's method: quadratic factors x^2 - r x - s of a polynomial",
        about: ['Synthetic division by x^2 - r x - s twice gives b and c; Newton steps on (r, s) make b1 = b0 = 0', 'Each factor found is divided out; coefficients are listed from the highest power down'],
        body: [
          D('deg', 'int', String(p.a.length - 1)),
          D('a', 'vec', { vec: p.a }),
          D('r', 'num', lit(p.r)), D('s', 'num', lit(p.s)),
          D('tol', 'num', lit(p.tol)),
          D('bb', 'vec', { zeros: 'deg + 1' }),
          D('cc', 'vec', { zeros: 'deg + 1' }),
          D('ok', 'bool', 'true'),
          C('A[i] is the coefficient of x^i: A[i] = a[deg - i]'),
          WHILE('deg > 2 and ok', [
            S('ok', 'false'),
            FOR('it', 0, 200, [
              S('bb[deg]', 'a[0]'),
              S('bb[deg - 1]', 'a[1] + r * bb[deg]'),
              DOWN('i', 'deg - 2', 0, [S('bb[i]', 'a[deg - i] + r * bb[i + 1] + s * bb[i + 2]')]),
              S('cc[deg]', 'bb[deg]'),
              S('cc[deg - 1]', 'bb[deg - 1] + r * cc[deg]'),
              DOWN('i', 'deg - 2', 1, [S('cc[i]', 'bb[i] + r * cc[i + 1] + s * cc[i + 2]')]),
              D('det', 'num', 'cc[2] * cc[2] - cc[3] * cc[1]'),
              IF('abs(det) < 1e-300', [S('r', 'r + 0.1'), S('s', 's - 0.1')], [
                D('dr', 'num', '(-bb[1] * cc[2] + bb[0] * cc[3]) / det'),
                D('ds', 'num', '(-bb[0] * cc[2] + bb[1] * cc[1]) / det'),
                S('r', 'r + dr'), S('s', 's + ds'),
                IF('abs(dr) < tol * max(1, abs(r)) and abs(ds) < tol * max(1, abs(s))', [S('ok', 'true'), BREAK]),
              ]),
            ]),
            IF('ok', [
              P('Factor x^2 - (', num('r', 6), ') x - (', num('s', 6), ')'),
              ...quad('r', 's'),
              C('Divide it out: the quotient has degree deg - 2'),
              S('bb[deg]', 'a[0]'),
              S('bb[deg - 1]', 'a[1] + r * bb[deg]'),
              DOWN('i', 'deg - 2', 2, [S('bb[i]', 'a[deg - i] + r * bb[i + 1] + s * bb[i + 2]')]),
              FOR('i', 0, 'deg - 1', [S('a[i]', 'bb[deg - i]')]),
              S('deg', 'deg - 2'),
            ], [P('Bairstow did not converge from these r, s.')]),
          ]),
          IF('ok and deg == 2', [D('rr', 'num', '-a[1] / a[0]'), D('ss', 'num', '-a[2] / a[0]'), P('Last factor:'), ...quad('rr', 'ss')]),
          IF('ok and deg == 1', [P('Last root: ', num('-a[1] / a[0]', 6))]),
        ],
      };
    },
  },

  'horner-method': {
    name: "Horner's method",
    clean: (raw) => ({ a: coeffs(raw.coeffs, 2), D: Math.max(1, Math.min(6, Math.round(opt(raw.places, 3)))) }),
    program: (p) => {
      // val = p(x) for the vector c (highest power first)
      const shift = (h) => FOR('k', 0, 'deg', [FOR('i', 1, 'deg - k + 1', [S('c[i]', `c[i] + (${h}) * c[i - 1]`)])]);
      return {
        title: "Horner's method: one decimal place of a real root at a time",
        about: ['Diminish the roots by the whole part, then repeatedly multiply them by 10 and diminish by the next digit'],
        body: [
          D('deg', 'int', String(p.a.length - 1)),
          D('c', 'vec', { vec: p.a }),
          D('orig', 'vec', { copy: 'c' }),
          C('Find a whole number a with a sign change of p between a and a + 1'),
          D('start', 'num', '0'),
          D('found', 'bool', 'false'),
          FOR('t', 0, 99, [
            D('xa', 'num', '0'),
            IF('t < 50', [S('xa', 'float(t)')], [S('xa', '49 - float(t)')]),
            ...polyAt('va', 'c', 'deg + 1', 'xa'),
            ...polyAt('vb', 'c', 'deg + 1', 'xa + 1'),
            IF('not found and (va == 0 or va * vb < 0)', [S('start', 'xa'), S('found', 'true')]),
          ]),
          IF('found', [
            shift('start'),
            P('Whole part: ', num('start', 0)),
            D('root', 'num', 'start'),
            D('scale', 'num', '0.1'),
            FOR('step', 0, String(p.D), [
              FOR('i', 0, 'deg + 1', [S('c[i]', 'c[i] * pow(10, i)')]),
              D('dg', 'num', '0'),
              ...polyAt('v0', 'c', 'deg + 1', 'dg'),
              ...polyAt('v1', 'c', 'deg + 1', 'dg + 1'),
              WHILE('dg < 9 and v0 * v1 > 0', [
                S('dg', 'dg + 1'),
                S('v0', 'v1'),
                S('v1', '0'),
                FOR('pw', 0, 'deg + 1', [S('v1', 'v1 * (dg + 1) + c[pw]')]),
              ]),
              S('root', 'root + dg * scale'),
              S('scale', 'scale / 10'),
              P('Next digit: ', num('dg', 0)),
              IF('v0 == 0', [BREAK]),
              shift('dg'),
            ]),
            P('Root ~ ', num('root', p.D)),
            ...polyAt('check', 'orig', 'deg + 1', 'root'),
            P('p(root) = ', num('check', 8)),
          ], [P('No real root was found between -49 and 50.')]),
        ],
      };
    },
  },

  'graeffe-root-squaring': {
    name: "Graeffe's root squaring",
    clean: (raw) => {
      const a = coeffs(raw.coeffs, 2);
      if (Math.abs(a.at(-1)) < 1e-14) throw new ExportError('0 is a root: divide by x first.');
      return { a, M: Math.max(1, Math.min(6, Math.round(opt(raw.m, 3)))) };
    },
    program: (p) => ({
      title: "Graeffe's root squaring method",
      about: ['Each squaring makes a polynomial whose roots are the squares of the last ones', 'After m squarings |root k| ~ |c_k / c_(k-1)|^(1 / 2^m); the sign is the one that makes p smaller'],
      body: [
        D('deg', 'int', String(p.a.length - 1)),
        D('a', 'vec', { vec: p.a }),
        D('c', 'vec', { copy: 'a' }),
        D('nb', 'vec', { zeros: 'deg + 1' }),
        D('M', 'int', String(p.M)),
        FOR('sq', 0, 'M', [
          FOR('k', 0, 'deg + 1', [
            S('nb[k]', 'c[k] * c[k]'),
            D('sgn', 'num', '-1'),
            FOR('j', 1, 'deg + 1', [
              IF('k >= j and k + j <= deg', [S('nb[k]', 'nb[k] + 2 * sgn * c[k - j] * c[k + j]')]),
              S('sgn', '-sgn'),
            ]),
          ]),
          D('lead', 'num', '1'),
          IF('nb[0] < 0', [S('lead', '-1')]),
          FOR('k', 0, 'deg + 1', [S('c[k]', 'nb[k] * lead')]),
          P('After squaring ', int('sq + 1'), ': first coefficients ', num('c[0]', 4), ', ', num('c[1]', 4)),
        ]),
        FOR('k', 1, 'deg + 1', [
          D('mag', 'num', 'pow(abs(c[k] / c[k - 1]), 1 / pow(2, M))'),
          ...polyAt('pp', 'a', 'deg + 1', 'mag'),
          ...polyAt('pm', 'a', 'deg + 1', '-mag'),
          D('root', 'num', 'mag'),
          IF('abs(pm) < abs(pp)', [S('root', '-mag')]),
          P('Root ', int('k'), ' ~ ', num('root', 6)),
        ]),
      ],
    }),
  },

  'hermite-interpolation': {
    name: 'Hermite interpolation',
    clean: (raw) => {
      const x = list(raw.x, 'x', 1);
      const y = list(raw.y, 'f(x)', 1);
      const dy = list(raw.dy, "f'(x)", 1);
      if (y.length !== x.length || dy.length !== x.length) throw new ExportError("Give the same number of x, f(x) and f'(x) values.");
      if (x.length > 6) throw new ExportError('Use 1 to 6 points.');
      if (new Set(x).size !== x.length) throw new ExportError('The x values must be different.');
      return { x, y, dy, at: String(raw.at ?? '').trim() ? n(raw.at, 'the point x') : null };
    },
    program: (p) => ({
      title: 'Hermite interpolation (divided differences with repeated points)',
      about: ['Each x is listed twice; where two equal z meet, the first divided difference is f\'(x)'],
      body: [
        D('np', 'int', String(p.x.length)),
        D('xs', 'vec', { vec: p.x }), D('ys', 'vec', { vec: p.y }), D('ds', 'vec', { vec: p.dy }),
        D('N', 'int', '2 * np'),
        D('z', 'vec', { zeros: 'N' }),
        D('Q', 'mat', { zeros2: ['N', 'N'] }),
        FOR('i', 0, 'N', [S('z[i]', 'xs[int(i / 2)]'), S('Q[i, 0]', 'ys[int(i / 2)]')]),
        FOR('j', 1, 'N', [FOR('i', 'j', 'N', [
          IF('j == 1 and i % 2 == 1', [S('Q[i, j]', 'ds[int(i / 2)]')], [S('Q[i, j]', '(Q[i, j - 1] - Q[i - 1, j - 1]) / (z[i] - z[i - j])')]),
        ])]),
        C('Expand H(x) = sum of Q[j][j] (x - z0)(x - z1)...(x - z(j-1)); poly[k] is the coefficient of x^k'),
        D('poly', 'vec', { zeros: 'N' }),
        D('basis', 'vec', { zeros: 'N + 1' }),
        D('nbasis', 'vec', { zeros: 'N + 1' }),
        S('basis[0]', '1'),
        FOR('j', 0, 'N', [
          FOR('k', 0, 'N', [S('poly[k]', 'poly[k] + Q[j, j] * basis[k]')]),
          FOR('k', 0, 'N + 1', [S('nbasis[k]', '-z[j] * basis[k]')]),
          FOR('k', 0, 'N', [S('nbasis[k + 1]', 'nbasis[k + 1] + basis[k]')]),
          FOR('k', 0, 'N + 1', [S('basis[k]', 'nbasis[k]')]),
        ]),
        FOR('k', 0, 'N', [P('Coefficient of x^', int('k'), ': ', num('poly[k]', 8))]),
        ...(p.at === null ? [] : [
          D('X', 'num', lit(p.at)),
          D('H', 'num', '0'),
          DOWN('k', 'N - 1', 0, [S('H', 'H * X + poly[k]')]),
          P('H(', num('X', 6), ') = ', num('H', 8)),
        ]),
      ],
    }),
  },

  'inverse-interpolation': {
    name: 'Inverse interpolation',
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 2);
      if (x.length > 10) throw new ExportError('Use 2 to 10 points.');
      const method = choice(raw.method, ['lagrange', 'iteration']);
      if (method === 'lagrange' && new Set(y).size !== y.length) throw new ExportError('Inverse Lagrange needs different y values.');
      const h = method === 'iteration' ? equalX(x) : null;
      return { x, y, h, method, target: n(raw.target, 'the y value to look for') };
    },
    program: (p) => {
      if (p.method === 'lagrange') {
        return {
          title: "Inverse interpolation by Lagrange's formula (x as a function of y)",
          about: ['x = sum of x_i * product over j != i of (y - y_j) / (y_i - y_j)'],
          body: [
            D('n', 'int', String(p.x.length)),
            D('xs', 'vec', { vec: p.x }), D('ys', 'vec', { vec: p.y }),
            D('t', 'num', lit(p.target)),
            D('x', 'num', '0'),
            FOR('i', 0, 'n', [
              D('L', 'num', '1'),
              FOR('j', 0, 'n', [IF('j != i', [S('L', 'L * (t - ys[j]) / (ys[i] - ys[j])')])]),
              S('x', 'x + xs[i] * L'),
            ]),
            P('x = ', num('x', 8), ' when y = ', num('t', 6)),
          ],
        };
      }
      return {
        title: 'Inverse interpolation by successive approximation (Newton forward)',
        about: ['p = (y - y0 - (terms of order 2 and up)) / Dy0, repeated until p settles; x = x0 + p h'],
        body: [
          D('n', 'int', String(p.x.length)),
          D('xs', 'vec', { vec: p.x }), D('y', 'vec', { vec: p.y }),
          D('t', 'num', lit(p.target)),
          D('h', 'num', lit(p.h)),
          D('T', 'mat', { zeros2: ['n', 'n'] }),
          FOR('i', 0, 'n', [S('T[0, i]', 'y[i]')]),
          FOR('k', 1, 'n', [FOR('i', 0, 'n - k', [S('T[k, i]', 'T[k - 1, i + 1] - T[k - 1, i]')])]),
          D('p', 'num', '(t - T[0, 0]) / T[1, 0]'),
          P('p0 = ', num('p', 8)),
          FOR('it', 1, 31, [
            D('extra', 'num', '0'),
            FOR('k', 2, 'n', [
              D('cf', 'num', '1'),
              FOR('j', 0, 'k', [S('cf', 'cf * (p - j) / (j + 1)')]),
              S('extra', 'extra + cf * T[k, 0]'),
            ]),
            D('np', 'num', '(t - T[0, 0] - extra) / T[1, 0]'),
            P('p', int('it'), ' = ', num('np', 8)),
            D('settled', 'bool', 'abs(np - p) < 1e-10'),
            S('p', 'np'),
            IF('settled', [BREAK]),
          ]),
          P('x = x0 + p h = ', num('xs[0] + p * h', 8)),
        ],
      };
    },
  },

  'everett-interpolation': {
    name: "Everett's formula",
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 4);
      if (x.length > 12) throw new ExportError('Use 4 to 12 points.');
      equalX(x);
      const at = n(raw.at, 'the point x');
      if (at < x[0] || at > x.at(-1)) throw new ExportError('x must lie inside the table.');
      return { x, y, at };
    },
    program: (p) => ({
      title: "Everett's central difference formula",
      about: ['y = sum over m of E_m(q) D^(2m) y_(-m) + E_m(p) D^(2m) y_(1-m), q = 1 - p', 'E_m(u) = u (u^2 - 1)(u^2 - 4)...(u^2 - m^2) / (2m + 1)!'],
      body: [
        D('n', 'int', String(p.x.length)),
        D('x', 'vec', { vec: p.x }), D('y', 'vec', { vec: p.y }),
        D('X', 'num', lit(p.at)),
        D('h', 'num', 'x[1] - x[0]'),
        D('T', 'mat', { zeros2: ['n', 'n'] }),
        FOR('i', 0, 'n', [S('T[0, i]', 'y[i]')]),
        FOR('k', 1, 'n', [FOR('i', 0, 'n - k', [S('T[k, i]', 'T[k - 1, i + 1] - T[k - 1, i]')])]),
        D('i0', 'int', 'int(min(float(n - 2), max(0, floor((X - x[0]) / h))))'),
        D('p', 'num', '(X - x[i0]) / h'),
        D('q', 'num', '1 - p'),
        D('total', 'num', '0'),
        FOR('m', 0, 'n', [
          C('Needs D^(2m) y at i0 - m and i0 + 1 - m'),
          IF('2 * m >= n or i0 < m or i0 + 1 - m >= n - 2 * m', [BREAK]),
          D('eq', 'num', 'q'), D('ep', 'num', 'p'),
          FOR('k', 1, 'm + 1', [
            S('eq', 'eq * (q * q - k * k) / ((2 * k) * (2 * k + 1))'),
            S('ep', 'ep * (p * p - k * k) / ((2 * k) * (2 * k + 1))'),
          ]),
          S('total', 'total + eq * T[2 * m, i0 - m] + ep * T[2 * m, i0 + 1 - m]'),
        ]),
        P('p = ', num('p', 6)),
        P('y(', num('X', 6), ') = ', num('total', 8)),
      ],
    }),
  },
};
