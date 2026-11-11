/**
 * Code export for the Unit 8 matrix pages: determinant, inverse, rank, the matrix calculator,
 * consistency, linear dependence, eigenvalues, Cayley-Hamilton, vectors, diagonalization, quadratic forms,
 * SVD and linear transformations. `raw` is what the page passes to its engine.
 */

import { evaluate } from 'mathjs';
import {
  D, S, FOR, DOWN, WHILE, IF, P, C, BREAK, SWAP, num, int, lit, normal, n, opt, cn, whole, list, table, text, choice, ExportError,
  invert, determinant, printVector, printMatrix, copyMatrix,
} from './kit.js';

/* ---------------- helpers ---------------- */

const square = (cells, name = 'matrix A', max = 8) => {
  const A = table(cells, name, { square: true, minRows: 1 });
  if (A.length > max) throw new ExportError(`Code export takes up to ${max}×${max} for this page.`);
  return A;
};

/** Reduced row echelon form of M (r × c) in place; leaves `rank` and the pivot columns in `piv`. */
const rref = (M, r, c) => [
  C(`Reduce ${M} to reduced row echelon form (entries below 1e-9 count as 0)`),
  D('rank', 'int', '0'),
  D('piv', 'vec', { zeros: c }),
  FOR('col', 0, c, [
    IF(`rank < ${r}`, [
      D('best', 'int', 'rank'),
      FOR('i', 'rank + 1', r, [IF(`abs(${M}[i, col]) > abs(${M}[best, col])`, [S('best', 'i')])]),
      IF(`abs(${M}[best, col]) > 1e-9`, [
        SWAP(M, 'rank', 'best'),
        D('pv', 'num', `${M}[rank, col]`),
        FOR('j', 0, c, [S(`${M}[rank, j]`, `${M}[rank, j] / pv`)]),
        FOR('i', 0, r, [IF('i != rank', [
          D('fct', 'num', `${M}[i, col]`),
          FOR('j', 0, c, [S(`${M}[i, j]`, `${M}[i, j] - fct * ${M}[rank, j]`)]),
        ])]),
        S('piv[rank]', 'float(col)'),
        S('rank', 'rank + 1'),
      ]),
    ]),
  ]),
  FOR('i', 0, r, [FOR('j', 0, c, [IF(`abs(${M}[i, j]) < 1e-9`, [S(`${M}[i, j]`, '0')])])]),
];

/**
 * Characteristic polynomial by Faddeev-LeVerrier: det(xI - A) = sum of cp[k] x^k, cp[n] = 1.
 * Leaves Mk = M_n, so A^-1 = -Mk / cp[0] when cp[0] != 0.
 */
const charPoly = (A, size) => [
  C('Characteristic polynomial by Faddeev-LeVerrier: M_k = A M_(k-1) + c_(n-k+1) I, c_(n-k) = -trace(A M_k) / k'),
  D('cp', 'vec', { zeros: `${size} + 1` }),
  S(`cp[${size}]`, '1'),
  D('Mk', 'mat', { zeros2: [size, size] }),
  D('AM', 'mat', { zeros2: [size, size] }),
  FOR('k', 1, `${size} + 1`, [
    FOR('i', 0, size, [FOR('j', 0, size, [
      D('s', 'num', '0'),
      FOR('t', 0, size, [S('s', `s + ${A}[i, t] * Mk[t, j]`)]),
      S('AM[i, j]', 's'),
    ])]),
    FOR('i', 0, size, [FOR('j', 0, size, [S('Mk[i, j]', 'AM[i, j]')]), S('Mk[i, i]', `Mk[i, i] + cp[${size} - k + 1]`)]),
    D('tr', 'num', '0'),
    FOR('i', 0, size, [FOR('t', 0, size, [S('tr', `tr + ${A}[i, t] * Mk[t, i]`)])]),
    S(`cp[${size} - k]`, '-tr / k'),
  ]),
];

/** Roots of the monic polynomial cp (degree size) by Durand-Kerner: real parts in er, imaginary in ei. */
const polyRoots = (size) => [
  C('All roots of the polynomial (complex ones too) by the Durand-Kerner iteration'),
  D('er', 'vec', { zeros: size }),
  D('ei', 'vec', { zeros: size }),
  FOR('i', 0, size, [S('er[i]', 'cos(0.4 + 2 * pi * i / ' + size + ') * 1.3'), S('ei[i]', 'sin(0.4 + 2 * pi * i / ' + size + ') * 1.3')]),
  FOR('it', 0, 2000, [FOR('i', 0, size, [
    C('Numerator: p(z) by Horner in complex numbers'),
    D('pr', 'num', '1'), D('pim', 'num', '0'),
    DOWN('k', `${size} - 1`, 0, [
      D('tr', 'num', 'pr * er[i] - pim * ei[i] + cp[k]'),
      S('pim', 'pr * ei[i] + pim * er[i]'),
      S('pr', 'tr'),
    ]),
    C('Denominator: product of (z_i - z_j) over j != i'),
    D('qr', 'num', '1'), D('qi', 'num', '0'),
    FOR('j', 0, size, [IF('j != i', [
      D('dr', 'num', 'er[i] - er[j]'), D('di', 'num', 'ei[i] - ei[j]'),
      D('tq', 'num', 'qr * dr - qi * di'),
      S('qi', 'qr * di + qi * dr'),
      S('qr', 'tq'),
    ])]),
    D('den', 'num', 'qr * qr + qi * qi'),
    IF('den > 1e-300', [
      S('er[i]', 'er[i] - (pr * qr + pim * qi) / den'),
      S('ei[i]', 'ei[i] - (pim * qr - pr * qi) / den'),
    ]),
  ])]),
];

/** Prints the real and complex eigenvalues in er/ei. */
const printRoots = (size) => FOR('i', 0, size, [
  IF('abs(ei[i]) < 1e-7', [P('lambda', int('i + 1'), ' = ', num('er[i]', 6))],
    [P('lambda', int('i + 1'), ' = ', num('er[i]', 6), ' + ', num('ei[i]', 6), ' i  (complex)')]),
]);

/** A vector typed as (2, -1, 3), "2 -1 3" or 2i - j + 3k → three numbers. */
function vector3(v, label) {
  const s = String(v ?? '').trim();
  if (!s) throw new ExportError(`Enter ${label} first.`);
  if (/[ijk]/.test(s.replace(/sqrt|pi/g, ''))) {
    const out = [0, 0, 0];
    const re = /([+-]?)\s*([^ijk+-]*?)\s*\*?\s*([ijk])/g;
    let m;
    while ((m = re.exec(s.replace(/\s+/g, '')))) {
      const coef = m[2] === '' ? 1 : cn(m[2], label);
      out['ijk'.indexOf(m[3])] += (m[1] === '-' ? -1 : 1) * coef;
    }
    return out;
  }
  const parts = s.replace(/^[([⟨<]|[)\]⟩>]$/g, '').split(/[,;\s]+/).filter(Boolean).map((p) => cn(p, label));
  if (parts.length < 2 || parts.length > 3) throw new ExportError(`${label}: use 2 or 3 components.`);
  return parts.length === 2 ? [...parts, 0] : parts;
}

/** Jacobi rotations on the symmetric matrix A (size n): eigenvalues on the diagonal, eigenvectors in the columns of V. */
const jacobi = (size) => [
  D('V', 'mat', { zeros2: [size, size] }),
  FOR('i', 0, size, [S('V[i, i]', '1')]),
  FOR('rot', 0, 500, [
    D('pp', 'int', '0'), D('qq', 'int', '1'), D('big', 'num', '0'),
    FOR('i', 0, size, [FOR('j', 'i + 1', size, [IF('abs(A[i, j]) > abs(big)', [S('big', 'A[i, j]'), S('pp', 'i'), S('qq', 'j')])])]),
    IF('abs(big) < 1e-12', [BREAK]),
    D('theta', 'num', '0'),
    IF('abs(A[pp, pp] - A[qq, qq]) < 1e-14', [IF('big > 0', [S('theta', 'pi / 4')], [S('theta', '-pi / 4')])],
      [S('theta', '0.5 * atan(2 * big / (A[pp, pp] - A[qq, qq]))')]),
    D('c', 'num', 'cos(theta)'), D('s', 'num', 'sin(theta)'),
    FOR('i', 0, size, [D('ap', 'num', 'A[i, pp]'), S('A[i, pp]', 'c * ap + s * A[i, qq]'), S('A[i, qq]', '-s * ap + c * A[i, qq]')]),
    FOR('j', 0, size, [D('aq', 'num', 'A[pp, j]'), S('A[pp, j]', 'c * aq + s * A[qq, j]'), S('A[qq, j]', '-s * aq + c * A[qq, j]')]),
    S('A[pp, qq]', '0'), S('A[qq, pp]', '0'),
    FOR('i', 0, size, [D('vp', 'num', 'V[i, pp]'), S('V[i, pp]', 'c * vp + s * V[i, qq]'), S('V[i, qq]', '-s * vp + c * V[i, qq]')]),
  ]),
];

/* ---------------- programs ---------------- */

export const EXPORTS = {
  determinant: {
    name: 'Determinant',
    clean: (raw) => ({ A: square(raw.cells, 'matrix A', 10) }),
    program: (p) => ({
      title: 'Determinant by row reduction',
      about: ['Reduce to upper triangular form; each row swap changes the sign; the determinant is the product of the diagonal'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        ...determinant('A', 'det', 'n'),
        P('det(A) = ', num('det', 6)),
      ],
    }),
  },

  'matrix-inverse': {
    name: 'Inverse of a matrix',
    clean: (raw) => ({ A: square(raw.cells, 'matrix A', 10) }),
    program: (p) => ({
      title: 'Inverse of a matrix by Gauss-Jordan elimination',
      about: ['Row-reduce [A | I] to [I | A^-1]'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        ...copyMatrix('A', 'W', 'n', 'n'),
        ...determinant('W', 'det', 'n'),
        IF('abs(det) < 1e-12', [P('det(A) = 0, so A has no inverse.')], [
          ...invert('A', 'Ainv', 'n'),
          P('det(A) = ', num('det', 6)),
          P('A^-1 ='),
          ...printMatrix('Ainv', 'n', p.A.length, 'Ainv', 6),
        ]),
      ],
    }),
  },

  rank: {
    name: 'Rank and echelon form',
    clean: (raw) => ({ A: table(raw.cells, 'matrix A') }),
    program: (p) => ({
      title: 'Rank of a matrix',
      about: ['Rank = number of non-zero rows (pivots) in the reduced row echelon form'],
      body: [
        D('r', 'int', String(p.A.length)), D('c', 'int', String(p.A[0].length)),
        D('A', 'mat', { mat: p.A }),
        ...rref('A', 'r', 'c'),
        P('Reduced row echelon form:'),
        ...printMatrix('A', 'r', p.A[0].length, 'R', 4),
        P('Rank = ', int('rank')),
      ],
    }),
  },

  'matrix-calculator': {
    name: 'Matrix calculator',
    clean: (raw) => {
      const op = choice(raw.op, ['add', 'subtract', 'multiply', 'scale', 'transpose', 'power']);
      const A = table(raw.a, 'matrix A');
      const out = { op, A };
      if (['add', 'subtract', 'multiply'].includes(op)) {
        out.B = table(raw.b, 'matrix B');
        if (op !== 'multiply' && (out.B.length !== A.length || out.B[0].length !== A[0].length)) throw new ExportError('A and B must be the same size.');
        if (op === 'multiply' && A[0].length !== out.B.length) throw new ExportError('The columns of A must match the rows of B.');
      }
      if (op === 'scale') out.k = n(raw.k, 'k');
      if (op === 'power') {
        out.pw = whole(raw.n, 'the power n', 0, 50);
        if (A.length !== A[0].length) throw new ExportError('Only square matrices have powers.');
      }
      return out;
    },
    program: (p) => {
      const r = p.A.length;
      const c = p.A[0].length;
      const base = [D('A', 'mat', { mat: p.A })];
      const show = (M, rows, cols) => [P('Result:'), ...printMatrix(M, String(rows), cols, 'R', 4)];
      switch (p.op) {
        case 'add':
        case 'subtract':
          return {
            title: p.op === 'add' ? 'Matrix addition A + B' : 'Matrix subtraction A - B',
            body: [...base, D('B', 'mat', { mat: p.B }), D('R', 'mat', { zeros2: [r, c] }),
              FOR('i', 0, r, [FOR('j', 0, c, [S('R[i, j]', p.op === 'add' ? 'A[i, j] + B[i, j]' : 'A[i, j] - B[i, j]')])]), ...show('R', r, c)],
          };
        case 'multiply': {
          const c2 = p.B[0].length;
          return {
            title: 'Matrix multiplication A B',
            about: ['Entry (i, j) = row i of A dot column j of B'],
            body: [...base, D('B', 'mat', { mat: p.B }), D('R', 'mat', { zeros2: [r, c2] }),
              FOR('i', 0, r, [FOR('j', 0, c2, [FOR('t', 0, c, [S('R[i, j]', 'R[i, j] + A[i, t] * B[t, j]')])])]), ...show('R', r, c2)],
          };
        }
        case 'scale':
          return {
            title: 'Scalar multiple k A',
            body: [...base, D('k', 'num', lit(p.k)), D('R', 'mat', { zeros2: [r, c] }),
              FOR('i', 0, r, [FOR('j', 0, c, [S('R[i, j]', 'k * A[i, j]')])]), ...show('R', r, c)],
          };
        case 'transpose':
          return {
            title: 'Transpose of A',
            body: [...base, D('R', 'mat', { zeros2: [c, r] }),
              FOR('i', 0, r, [FOR('j', 0, c, [S('R[j, i]', 'A[i, j]')])]), ...show('R', c, r)],
          };
        default:
          return {
            title: `Matrix power A^${p.pw}`,
            about: ['A^0 = I; each step multiplies by A once more'],
            body: [...base,
              D('R', 'mat', { zeros2: [r, r] }), D('T', 'mat', { zeros2: [r, r] }),
              FOR('i', 0, r, [S('R[i, i]', '1')]),
              FOR('step', 0, String(p.pw), [
                FOR('i', 0, r, [FOR('j', 0, r, [S('T[i, j]', '0'), FOR('t', 0, r, [S('T[i, j]', 'T[i, j] + R[i, t] * A[t, j]')])])]),
                FOR('i', 0, r, [FOR('j', 0, r, [S('R[i, j]', 'T[i, j]')])]),
              ]),
              ...show('R', r, r)],
          };
      }
    },
  },

  consistency: {
    name: 'Consistency of linear equations',
    clean: (raw) => {
      const Aug = table(raw.cells, 'the augmented matrix');
      if (Aug[0].length < 2) throw new ExportError('The augmented matrix needs the coefficients and the constants.');
      return { Aug };
    },
    program: (p) => {
      const m = p.Aug.length;
      const unknowns = p.Aug[0].length - 1;
      return {
        title: 'Consistency of A x = b (rank test)',
        about: ['rank A < rank [A | b]: no solution; rank A = rank [A | b] = number of unknowns: one solution; otherwise infinitely many'],
        body: [
          D('m', 'int', String(m)), D('nv', 'int', String(unknowns)),
          D('A', 'mat', { mat: p.Aug }),
          ...rref('A', 'm', 'nv + 1'),
          P('Reduced augmented matrix:'),
          ...printMatrix('A', 'm', unknowns + 1, 'R', 4),
          C('rank of the coefficient part = pivots that are not in the last column'),
          D('rankA', 'int', '0'),
          FOR('i', 0, 'rank', [IF('piv[i] < nv', [S('rankA', 'rankA + 1')])]),
          P('rank A = ', int('rankA'), ', rank [A | b] = ', int('rank')),
          IF('rankA < rank', [P('Inconsistent: no solution.')], [
            IF('rankA == nv', [
              P('Consistent with a unique solution:'),
              FOR('i', 0, 'rankA', [P('x', int('int(piv[i]) + 1'), ' = ', num('A[i, nv]', 6))]),
            ], [
              P('Consistent with infinitely many solutions (free unknowns can take any value):'),
              FOR('i', 0, 'rankA', [
                P('x', int('int(piv[i]) + 1'), ' = ', num('A[i, nv]', 6)),
                FOR('j', 0, 'nv', [IF('abs(A[i, j]) > 1e-9 and j != int(piv[i])', [P('      - (', num('A[i, j]', 6), ') x', int('j + 1'))])]),
              ]),
            ]),
          ]),
        ],
      };
    },
  },

  'linear-dependence': {
    name: 'Linear dependence',
    clean: (raw) => ({ V: table(raw.cells, 'the vectors') }),
    program: (p) => {
      const k = p.V.length;
      const dim = p.V[0].length;
      return {
        title: 'Linear dependence of vectors',
        about: ['Put the vectors in the columns of a matrix; they are independent when its rank equals their number'],
        body: [
          D('k', 'int', String(k)), D('dim', 'int', String(dim)),
          D('V', 'mat', { mat: p.V }),
          D('A', 'mat', { zeros2: ['dim', 'k'] }),
          FOR('i', 0, 'k', [FOR('j', 0, 'dim', [S('A[j, i]', 'V[i, j]')])]),
          ...rref('A', 'dim', 'k'),
          P('Rank = ', int('rank'), ' for ', int('k'), ' vectors'),
          IF('rank == k', [P('The vectors are linearly independent.')], [
            P('The vectors are linearly dependent. One relation (sum of c_i v_i = 0):'),
            C('Take the first column without a pivot as free, with coefficient 1'),
            D('free', 'int', '0'),
            D('isPivot', 'bool', 'true'),
            WHILE('isPivot and free < k', [
              S('isPivot', 'false'),
              FOR('i', 0, 'rank', [IF('int(piv[i]) == free', [S('isPivot', 'true')])]),
              IF('isPivot', [S('free', 'free + 1')]),
            ]),
            D('coef', 'vec', { zeros: 'k' }),
            S('coef[free]', '1'),
            FOR('i', 0, 'rank', [S('coef[int(piv[i])]', '-A[i, free]')]),
            ...printVector('coef', 'k', 'c', 6),
          ]),
        ],
      };
    },
  },

  eigenvalues: {
    name: 'Eigenvalues and eigenvectors',
    clean: (raw) => {
      const A = square(raw.cells, 'matrix A', 4);
      if (A.length < 2) throw new ExportError('Use a 2×2, 3×3 or 4×4 matrix.');
      return { A };
    },
    program: (p) => ({
      title: 'Eigenvalues and eigenvectors',
      about: ['Eigenvalues: roots of det(lambda I - A) = 0', 'Eigenvector for a real lambda: a solution of (A - lambda I) x = 0, with a free unknown set to 1'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        ...charPoly('A', 'n'),
        DOWN('k', 'n', 0, [P('Coefficient of lambda^', int('k'), ': ', num('cp[k]', 6))]),
        ...polyRoots('n'),
        printRoots('n'),
        FOR('e', 0, 'n', [IF('abs(ei[e]) < 1e-7', [
          D('N', 'mat', { zeros2: ['n', 'n'] }),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('N[i, j]', 'A[i, j]')]), S('N[i, i]', 'A[i, i] - er[e]')]),
          ...rrefLoose('N', 'n'),
          D('x', 'vec', { zeros: 'n' }),
          D('free', 'int', 'n - 1'),
          FOR('j', 0, 'n', [D('isPivot', 'bool', 'false'), FOR('i', 0, 'rank', [IF('int(piv[i]) == j', [S('isPivot', 'true')])]), IF('not isPivot', [S('free', 'j')])]),
          S('x[free]', '1'),
          FOR('i', 0, 'rank', [S('x[int(piv[i])]', '-N[i, free]')]),
          P('Eigenvector for lambda = ', num('er[e]', 6), ':'),
          ...printVector('x', 'n', '  x', 6),
        ])]),
      ],
    }),
  },

  'cayley-hamilton': {
    name: 'Cayley-Hamilton theorem',
    clean: (raw) => {
      const A = square(raw.cells, 'matrix A', 4);
      if (A.length < 2) throw new ExportError('Use a 2×2, 3×3 or 4×4 matrix.');
      return { A };
    },
    program: (p) => ({
      title: 'Cayley-Hamilton theorem: A satisfies its own characteristic equation',
      about: ['p(A) = A^n + c_(n-1) A^(n-1) + ... + c_0 I = 0', 'So A^-1 = -(A^(n-1) + c_(n-1) A^(n-2) + ... + c_1 I) / c_0 when c_0 != 0'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        ...charPoly('A', 'n'),
        DOWN('k', 'n', 0, [P('Coefficient of lambda^', int('k'), ': ', num('cp[k]', 6))]),
        C('p(A) by Horner: start with I, then multiply by A and add the next coefficient times I'),
        D('PA', 'mat', { zeros2: ['n', 'n'] }),
        D('T', 'mat', { zeros2: ['n', 'n'] }),
        FOR('i', 0, 'n', [S('PA[i, i]', '1')]),
        DOWN('k', 'n - 1', 0, [
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('T[i, j]', '0'), FOR('t', 0, 'n', [S('T[i, j]', 'T[i, j] + PA[i, t] * A[t, j]')])])]),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('PA[i, j]', 'T[i, j]')]), S('PA[i, i]', 'PA[i, i] + cp[k]')]),
        ]),
        D('worst', 'num', '0'),
        FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('worst', 'max(worst, abs(PA[i, j]))')])]),
        P('Largest entry of p(A): ', num('worst', 10), ' (0 up to rounding)'),
        IF('abs(cp[0]) > 1e-12', [
          P('A^-1 = -M_n / c_0:'),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('T[i, j]', '-Mk[i, j] / cp[0]')])]),
          ...printMatrix('T', 'n', p.A.length, 'Ainv', 6),
        ], [P('c_0 = 0, so A has no inverse.')]),
      ],
    }),
  },

  vectors: {
    name: 'Vector calculator',
    clean: (raw) => {
      const op = choice(raw.op, ['dot', 'magnitude', 'cross', 'projection', 'triple']);
      return { op, a: vector3(raw.a, 'vector a'), b: op === 'magnitude' ? null : vector3(raw.b, 'vector b'), c: op === 'triple' ? vector3(raw.c, 'vector c') : null };
    },
    program: (p) => {
      const vecs = [D('a', 'vec', { vec: p.a }), ...(p.b ? [D('b', 'vec', { vec: p.b })] : []), ...(p.c ? [D('c', 'vec', { vec: p.c })] : [])];
      const dot = (u, v) => `${u}[0] * ${v}[0] + ${u}[1] * ${v}[1] + ${u}[2] * ${v}[2]`;
      const cross = (u, v, into) => [
        D(into, 'vec', { zeros: 3 }),
        S(`${into}[0]`, `${u}[1] * ${v}[2] - ${u}[2] * ${v}[1]`),
        S(`${into}[1]`, `${u}[2] * ${v}[0] - ${u}[0] * ${v}[2]`),
        S(`${into}[2]`, `${u}[0] * ${v}[1] - ${u}[1] * ${v}[0]`),
      ];
      const show = (v, label) => P(`${label} = (`, num(`${v}[0]`, 4), ', ', num(`${v}[1]`, 4), ', ', num(`${v}[2]`, 4), ')');
      const body = {
        magnitude: [D('mag', 'num', `sqrt(${dot('a', 'a')})`), P('|a| = ', num('mag', 6)),
          P('Unit vector = (', num('a[0] / mag', 4), ', ', num('a[1] / mag', 4), ', ', num('a[2] / mag', 4), ')')],
        dot: [D('d', 'num', dot('a', 'b')), D('cosv', 'num', `d / sqrt((${dot('a', 'a')}) * (${dot('b', 'b')}))`),
          P('a . b = ', num('d', 6)), P('Angle = ', num('acos(max(-1, min(1, cosv))) * 180 / pi', 4), ' degrees')],
        cross: [...cross('a', 'b', 'x'), show('x', 'a x b'), P('|a x b| = ', num(`sqrt(${dot('x', 'x')})`, 6), ' (area of the parallelogram)')],
        projection: [D('d', 'num', dot('a', 'b')), D('bb', 'num', dot('b', 'b')),
          P('Scalar projection of a on b = ', num('d / sqrt(bb)', 6)),
          P('Vector projection = (', num('d / bb * b[0]', 4), ', ', num('d / bb * b[1]', 4), ', ', num('d / bb * b[2]', 4), ')')],
        triple: [...cross('b', 'c', 'x'), P('[a b c] = a . (b x c) = ', num(dot('a', 'x'), 6), ' (volume of the parallelepiped, up to sign)')],
      }[p.op];
      return {
        title: { magnitude: 'Magnitude and unit vector', dot: 'Dot product and angle', cross: 'Cross product', projection: 'Projection of a on b', triple: 'Scalar triple product' }[p.op],
        body: [...vecs, ...body],
      };
    },
  },

  diagonalization: {
    name: 'Diagonalization',
    clean: (raw) => {
      const A = square(raw.cells, 'matrix A', 4);
      if (A.length < 2) throw new ExportError('Use a 2×2, 3×3 or 4×4 matrix.');
      return { A, power: String(raw.power ?? '').trim() ? whole(raw.power, 'the power', 0, 50) : null };
    },
    program: (p) => ({
      title: 'Diagonalization: A = P D P^-1',
      about: ['D holds the eigenvalues; the columns of P are matching eigenvectors', 'A can be diagonalized when it has n independent eigenvectors'],
      body: [
        D('n', 'int', String(p.A.length)),
        D('A', 'mat', { mat: p.A }),
        ...charPoly('A', 'n'),
        ...polyRoots('n'),
        printRoots('n'),
        D('Pm', 'mat', { zeros2: ['n', 'n'] }),
        D('lam', 'vec', { zeros: 'n' }),
        D('found', 'int', '0'),
        D('complexRoot', 'bool', 'false'),
        FOR('e', 0, 'n', [
          IF('abs(ei[e]) >= 1e-7', [S('complexRoot', 'true')]),
          C('Use each eigenvalue once: skip it if an earlier one is the same'),
          D('seen', 'bool', 'false'),
          FOR('f', 0, 'e', [IF('abs(er[f] - er[e]) < 1e-5 and abs(ei[f]) < 1e-7', [S('seen', 'true')])]),
          IF('abs(ei[e]) < 1e-7 and not seen', [
            D('N', 'mat', { zeros2: ['n', 'n'] }),
            FOR('i', 0, 'n', [FOR('j', 0, 'n', [S('N[i, j]', 'A[i, j]')]), S('N[i, i]', 'A[i, i] - er[e]')]),
            ...rrefLoose('N', 'n'),
            C('One eigenvector per free unknown'),
            FOR('j', 0, 'n', [
              D('isPivot', 'bool', 'false'),
              FOR('i', 0, 'rank', [IF('int(piv[i]) == j', [S('isPivot', 'true')])]),
              IF('not isPivot and found < n', [
                S('Pm[j, found]', '1'),
                FOR('i', 0, 'rank', [S('Pm[int(piv[i]), found]', '-N[i, j]')]),
                S('lam[found]', 'er[e]'),
                S('found', 'found + 1'),
              ]),
            ]),
          ]),
        ]),
        IF('complexRoot', [P('Some eigenvalues are complex: A cannot be diagonalized over the real numbers.')], [
          IF('found < n', [P('Only ', int('found'), ' independent eigenvectors: A cannot be diagonalized.')], [
            P('D = diagonal matrix of:'),
            ...printVector('lam', 'n', '  lambda', 6),
            P('P ='),
            ...printMatrix('Pm', 'n', p.A.length, 'P', 4),
            ...(p.power === null ? [] : [
              C(`A^${p.power} = P D^${p.power} P^-1`),
              ...copyMatrix('Pm', 'W', 'n', 'n'),
              ...invert('W', 'Pinv', 'n'),
              D('Ak', 'mat', { zeros2: ['n', 'n'] }),
              FOR('i', 0, 'n', [FOR('j', 0, 'n', [FOR('t', 0, 'n', [S('Ak[i, j]', `Ak[i, j] + Pm[i, t] * pow(lam[t], ${p.power}) * Pinv[t, j]`)])])]),
              P(`A^${p.power} =`),
              ...printMatrix('Ak', 'n', p.A.length, 'A', 4),
            ]),
          ]),
        ]),
      ],
    }),
  },

  'quadratic-form': {
    name: 'Quadratic forms',
    clean: (raw) => {
      const form = normal(text(raw.form, 'the quadratic form'), 'the quadratic form');
      const vars = [...new Set((form.match(/\b[a-z]\b/g) || []).filter((v) => !['e'].includes(v)))].sort();
      if (vars.length < 2 || vars.length > 4) throw new ExportError('Use 2 to 4 variables, e.g. 2x^2 + 2y^2 + 3z^2 + 2xy - 4yz.');
      const at = (v) => Number(evaluate(form, Object.fromEntries(vars.map((x, i) => [x, v[i]]))));
      const unit = (i) => vars.map((_, k) => (k === i ? 1 : 0));
      const snap = (v) => { const r = Math.round(v * 1e9) / 1e9; return Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : r; };
      const A = vars.map((_, i) => vars.map((__, j) => (i === j ? snap(at(unit(i))) : snap((at(unit(i).map((v, k) => v + unit(j)[k])) - at(unit(i)) - at(unit(j))) / 2))));
      if (A.flat().some((v) => !Number.isFinite(v))) throw new ExportError('Use numbers as coefficients.');
      return { A, vars };
    },
    program: (p) => ({
      title: 'Quadratic form: matrix, canonical form and nature',
      about: [`Variables ${p.vars.join(', ')}; Q = X^T A X with A symmetric`, 'The eigenvalues of A (found by Jacobi rotations) are the coefficients of the canonical form'],
      body: [
        D('n', 'int', String(p.vars.length)),
        D('A', 'mat', { mat: p.A }),
        P('Matrix of the form:'),
        ...printMatrix('A', 'n', p.vars.length, 'A', 4),
        ...jacobi('n'),
        D('posCount', 'int', '0'), D('negCount', 'int', '0'),
        FOR('i', 0, 'n', [
          P('Canonical coefficient of y', int('i + 1'), '^2: ', num('A[i, i]', 6)),
          IF('A[i, i] > 1e-9', [S('posCount', 'posCount + 1')]),
          IF('A[i, i] < -1e-9', [S('negCount', 'negCount + 1')]),
        ]),
        P('Rank = ', int('posCount + negCount'), ', index = ', int('posCount'), ', signature = ', num('float(posCount) - float(negCount)', 0)),
        IF('negCount == 0 and posCount == n', [P('Nature: positive definite')], [
          IF('posCount == 0 and negCount == n', [P('Nature: negative definite')], [
            IF('negCount == 0', [P('Nature: positive semi-definite')], [IF('posCount == 0', [P('Nature: negative semi-definite')], [P('Nature: indefinite')])]),
          ]),
        ]),
      ],
    }),
  },

  'svd-calculator': {
    name: 'Singular value decomposition',
    clean: (raw) => {
      const A = table(String(raw.A ?? ''), 'A');
      if (A.length > 6 || A[0].length > 6) throw new ExportError('Use up to 6 rows and columns.');
      return { A };
    },
    program: (p) => {
      const m = p.A.length;
      const cols = p.A[0].length;
      return {
        title: 'Singular value decomposition A = U S V^T',
        about: ['The singular values are the square roots of the eigenvalues of A^T A (Jacobi rotations)', 'v_i are eigenvectors of A^T A; u_i = A v_i / sigma_i'],
        body: [
          D('m', 'int', String(m)), D('n', 'int', String(cols)),
          D('M', 'mat', { mat: p.A }),
          D('A', 'mat', { zeros2: ['n', 'n'] }),
          FOR('i', 0, 'n', [FOR('j', 0, 'n', [FOR('t', 0, 'm', [S('A[i, j]', 'A[i, j] + M[t, i] * M[t, j]')])])]),
          ...jacobi('n'),
          C('List from the largest eigenvalue down'),
          D('used', 'vec', { zeros: 'n' }),
          FOR('t', 0, 'n', [
            D('best', 'int', '0'), D('got', 'bool', 'false'),
            FOR('i', 0, 'n', [IF('used[i] == 0 and (not got or A[i, i] > A[best, best])', [S('best', 'i'), S('got', 'true')])]),
            S('used[best]', '1'),
            D('sigma', 'num', 'sqrt(max(0, A[best, best]))'),
            C('Sign: make the largest entry of v positive'),
            D('big', 'num', '0'),
            FOR('i', 0, 'n', [IF('abs(V[i, best]) > abs(big)', [S('big', 'V[i, best]')])]),
            D('sg', 'num', '1'),
            IF('big < 0', [S('sg', '-1')]),
            P('sigma', int('t + 1'), ' = ', num('sigma', 6)),
            FOR('i', 0, 'n', [P('  v', int('i + 1'), ' = ', num('sg * V[i, best]', 6))]),
            IF('sigma > 1e-9', [FOR('i', 0, 'm', [
              D('s', 'num', '0'),
              FOR('j', 0, 'n', [S('s', 's + M[i, j] * sg * V[j, best]')]),
              P('  u', int('i + 1'), ' = ', num('s / sigma', 6)),
            ])]),
          ]),
        ],
      };
    },
  },

  'linear-transformations': {
    name: 'Linear transformations',
    clean: (raw) => {
      if (raw.mode === 'formula') {
        const m = String(raw.formula ?? '').replace(/\s+/g, ' ').match(/T\s*\(([^)]*)\)\s*=\s*\((.*)\)\s*$/);
        if (!m) throw new ExportError('Write it like T(x, y, z) = (x + y, y - z).');
        const vars = m[1].split(',').map((s) => s.trim()).filter(Boolean);
        const comps = m[2].split(',').map((s) => normal(s.trim(), 'T'));
        const at = (pt) => comps.map((c) => Number(evaluate(c, Object.fromEntries(vars.map((v, i) => [v, pt[i]])))));
        if (at(vars.map(() => 0)).some((v) => Math.abs(v) > 1e-12)) throw new ExportError('T(0) is not 0, so T is not linear.');
        const colsT = vars.map((_, j) => at(vars.map((__, i) => (i === j ? 1 : 0))));
        return { A: comps.map((_, i) => colsT.map((c) => c[i])) };
      }
      return { A: table(String(raw.A ?? ''), 'A') };
    },
    program: (p) => {
      const m = p.A.length;
      const cols = p.A[0].length;
      return {
        title: 'Linear transformation T(x) = A x: kernel, image, rank and nullity',
        about: ['Rank = number of pivots; nullity = columns - rank (rank-nullity theorem)', 'One-to-one when the kernel is only 0; onto when the rank equals the number of rows'],
        body: [
          D('m', 'int', String(m)), D('n', 'int', String(cols)),
          D('A', 'mat', { mat: p.A }),
          P('Matrix of T:'),
          ...printMatrix('A', 'm', cols, 'A', 4),
          ...copyMatrix('A', 'R', 'm', 'n'),
          ...rref('R', 'm', 'n'),
          P('Rank = ', int('rank'), ', nullity = ', int('n - rank')),
          FOR('i', 0, 'rank', [P('Image basis vector: column ', int('int(piv[i]) + 1'), ' of A')]),
          FOR('j', 0, 'n', [
            D('isPivot', 'bool', 'false'),
            FOR('i', 0, 'rank', [IF('int(piv[i]) == j', [S('isPivot', 'true')])]),
            IF('not isPivot', [
              P('Kernel basis vector (x', int('j + 1'), ' = 1):'),
              FOR('t', 0, 'n', [
                D('val', 'num', '0'),
                IF('t == j', [S('val', '1')]),
                FOR('i', 0, 'rank', [IF('int(piv[i]) == t', [S('val', '-R[i, j]')])]),
                P('  ', num('val', 4)),
              ]),
            ]),
          ]),
          IF('rank == n', [P('T is one-to-one.')], [P('T is not one-to-one.')]),
          IF('rank == m', [P('T is onto.')], [P('T is not onto.')]),
        ],
      };
    },
  },
};

/** RREF for (A - lambda I), where lambda is only approximate: a looser zero test (1e-6). */
function rrefLoose(M, size) {
  return rref(M, size, size).map((st) => JSON.parse(JSON.stringify(st).replace(/1e-9/g, '1e-6')));
}
