/**
 * Matrix arithmetic with the working recorded, for Unit 8 (matrix calculator, determinant, inverse, rank)
 * and later the power method, Cayley-Hamilton and eigenvalue pages.
 *
 * A matrix is an array of rows: [[1, 2], [3, 4]]. Every function returns new arrays and never changes its input.
 * Row operations are recorded as { kind, text, matrix } where `text` is exam notation ("R₂ → R₂ − 3R₁")
 * and `matrix` is a copy of the matrix after the operation.
 */
import { EngineError, EPS, isZero, clean } from './steps';
import { requireNumber, formatNumber as fmt } from './fraction';

/** Matrix of typed text ("3", "-1/2") → numbers. Throws an EngineError naming the first bad cell. */
export function fromStrings(cells, name = 'Matrix A') {
  if (!Array.isArray(cells) || !cells.length) throw new EngineError(`${name} is empty.`);
  return cells.map((row, i) => row.map((t, j) => requireNumber(t, `${name}, row ${i + 1}, column ${j + 1}`)));
}

/**
 * Pasted text → matrix of strings. Rows on separate lines (or split by ";"), numbers split by spaces, commas or tabs.
 * Accepts brackets as copied from other tools: [[1, 2], [3, 4]].
 */
export function parseMatrixText(text, maxSize = 6) {
  const cleaned = String(text ?? '').replace(/\]\s*,\s*\[/g, '\n').replace(/[[\]{}()]/g, ' ');
  const lines = cleaned.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new EngineError('Paste some numbers first, one row per line.');
  const rowsOut = lines.map((l) => l.split(/[\s,\t]+/).filter(Boolean));
  const width = rowsOut[0].length;
  const bad = rowsOut.findIndex((r) => r.length !== width);
  if (bad >= 0) throw new EngineError(`Row ${bad + 1} has ${rowsOut[bad].length} numbers but row 1 has ${width}. Every row needs the same count.`);
  if (rowsOut.length > maxSize || width > maxSize) throw new EngineError(`Matrices up to ${maxSize}×${maxSize} fit here; that one is ${rowsOut.length}×${width}.`);
  return rowsOut;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n) => String(n).split('').map((d) => SUB[+d]).join('');
const R = (i) => `R${sub(i + 1)}`;

// ---------- shape ----------

export const rows = (A) => A.length;
export const cols = (A) => (A[0] ? A[0].length : 0);
export const copy = (A) => A.map((r) => r.slice());
export const isSquare = (A) => rows(A) > 0 && A.every((r) => r.length === rows(A));

export function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

export function zeros(r, c) {
  return Array.from({ length: r }, () => new Array(c).fill(0));
}

/** Throws EngineError unless A is a non-empty rectangle of finite numbers. */
export function check(A, name = 'The matrix') {
  if (!Array.isArray(A) || !A.length || !Array.isArray(A[0]) || !A[0].length) throw new EngineError(`${name} is empty.`);
  const c = A[0].length;
  for (const r of A) {
    if (!Array.isArray(r) || r.length !== c) throw new EngineError(`Every row of ${name.toLowerCase()} needs ${c} numbers.`);
    for (const v of r) if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${name} has a blank or non-number entry.`);
  }
  return A;
}

function needSquare(A, what) {
  check(A);
  if (!isSquare(A)) throw new EngineError(`${what} needs a square matrix (same number of rows and columns).`);
}

// ---------- arithmetic ----------

export function add(A, B) {
  check(A, 'Matrix A'); check(B, 'Matrix B');
  if (rows(A) !== rows(B) || cols(A) !== cols(B)) throw new EngineError('To add, both matrices need the same size.');
  return A.map((r, i) => r.map((v, j) => clean(v + B[i][j])));
}

export function subtract(A, B) {
  check(A, 'Matrix A'); check(B, 'Matrix B');
  if (rows(A) !== rows(B) || cols(A) !== cols(B)) throw new EngineError('To subtract, both matrices need the same size.');
  return A.map((r, i) => r.map((v, j) => clean(v - B[i][j])));
}

export function scale(A, k) {
  check(A);
  return A.map((r) => r.map((v) => clean(v * k)));
}

export function transpose(A) {
  check(A);
  return A[0].map((_, j) => A.map((r) => r[j]));
}

/**
 * A × B. Also returns how each entry was made, e.g. "(1)(5) + (2)(7) = 19", for the step table.
 */
export function multiply(A, B) {
  check(A, 'Matrix A'); check(B, 'Matrix B');
  if (cols(A) !== rows(B)) {
    throw new EngineError(`A is ${rows(A)}×${cols(A)} and B is ${rows(B)}×${cols(B)}: the columns of A must equal the rows of B.`);
  }
  const working = [];
  const result = A.map((r, i) => B[0].map((_, j) => {
    let s = 0;
    const terms = [];
    for (let k = 0; k < cols(A); k++) {
      s += r[k] * B[k][j];
      terms.push(`(${r[k]})(${B[k][j]})`);
    }
    s = clean(s);
    working.push({ i, j, text: `${terms.join(' + ')} = ${fmt(s)}` });
    return s;
  }));
  return { result, working };
}

/** Aⁿ for a whole number n ≥ 0 (A⁰ = I). Records each power. */
export function power(A, n) {
  needSquare(A, 'A matrix power');
  if (!Number.isInteger(n) || n < 0) throw new EngineError('The power must be a whole number 0 or more.');
  if (n > 50) throw new EngineError('Use a power of 50 or less.');
  const powers = [identity(rows(A))];
  for (let p = 1; p <= n; p++) powers.push(multiply(powers[p - 1], A).result);
  return { result: powers[n], powers };
}

// ---------- determinant ----------

/** Matrix without row i and column j. */
export function minor(A, i, j) {
  return A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
}

function detRaw(A) {
  const n = rows(A);
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  let s = 0;
  for (let j = 0; j < n; j++) if (A[0][j] !== 0) s += (j % 2 ? -1 : 1) * A[0][j] * detRaw(minor(A, 0, j));
  return s;
}

/**
 * Determinant by expansion along the first row (the school method). Up to 5×5.
 * terms: [{ j, sign, entry, minor, minorDet, value }] — one per first-row entry.
 */
export function detByCofactors(A) {
  needSquare(A, 'A determinant');
  const n = rows(A);
  if (n > 5) throw new EngineError('Expansion by cofactors is shown for matrices up to 5×5. Use row reduction for bigger ones.');
  if (n === 1) return { result: A[0][0], terms: [] };
  const terms = A[0].map((entry, j) => {
    const M = minor(A, 0, j);
    const minorDet = clean(detRaw(M));
    const sign = j % 2 ? -1 : 1;
    return { j, sign, entry, minor: M, minorDet, value: clean(sign * entry * minorDet) };
  });
  return { result: clean(terms.reduce((s, t) => s + t.value, 0)), terms };
}

/**
 * Determinant by row reduction to upper-triangular form.
 * Swapping rows flips the sign; adding a multiple of a row changes nothing. det = sign × product of the diagonal.
 */
export function detByRowReduction(A) {
  needSquare(A, 'A determinant');
  const M = copy(A);
  const n = rows(M);
  const ops = [];
  let sign = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && isZero(M[p][c])) p++;
    if (p === n) {
      ops.push({ kind: 'note', text: `Column ${c + 1} has no non-zero entry on or below the diagonal, so the determinant is 0.`, matrix: copy(M) });
      return { result: 0, ops, triangular: M };
    }
    if (p !== c) {
      [M[c], M[p]] = [M[p], M[c]];
      sign = -sign;
      ops.push({ kind: 'swap', text: `${R(c)} ↔ ${R(p)} (the determinant changes sign)`, matrix: copy(M) });
    }
    for (let r = c + 1; r < n; r++) {
      if (isZero(M[r][c])) continue;
      const k = M[r][c] / M[c][c];
      M[r] = M[r].map((v, j) => clean(v - k * M[c][j]));
      ops.push({ kind: 'add', text: `${R(r)} → ${R(r)} − (${fmt(k)})${R(c)}`, matrix: copy(M) });
    }
  }
  const diag = M.map((r, i) => r[i]);
  return { result: clean(sign * diag.reduce((a, b) => a * b, 1)), ops, triangular: M, sign, diagonal: diag };
}

/** Determinant (value only), by row reduction. */
export const det = (A) => detByRowReduction(A).result;

// ---------- inverse ----------

/** Inverse by the adjoint method: cofactors → adjoint (transpose) → divide by |A|. Up to 4×4. */
export function inverseByAdjoint(A) {
  needSquare(A, 'An inverse');
  const n = rows(A);
  if (n > 4) throw new EngineError('The adjoint method is shown for matrices up to 4×4. Use Gauss-Jordan for bigger ones.');
  const d = det(A);
  if (isZero(d)) throw new EngineError('The determinant is 0, so this matrix has no inverse (it is singular).');
  const cofactors = n === 1 ? [[1]] : A.map((r, i) => r.map((_, j) => clean((i + j) % 2 ? -detRaw(minor(A, i, j)) : detRaw(minor(A, i, j)))));
  const adjoint = transpose(cofactors);
  return { result: adjoint.map((r) => r.map((v) => clean(v / d))), det: d, cofactors, adjoint };
}

/** Inverse by Gauss-Jordan on [A | I]. Uses partial pivoting (largest pivot) and records every row operation. */
export function inverseByGaussJordan(A) {
  needSquare(A, 'An inverse');
  const n = rows(A);
  const M = A.map((r, i) => [...r, ...identity(n)[i]]);
  const { ops, rank } = reduce(M, { pivotCols: n, partialPivot: true });
  if (rank < n) throw new EngineError('The left side cannot be turned into I, so this matrix has no inverse (it is singular).');
  return { result: M.map((r) => r.slice(n)), ops, augmented: M };
}

// ---------- RREF and rank ----------

/**
 * Gauss-Jordan reduction in place, recording each operation. Works on the first `pivotCols` columns
 * (the rest are carried along, e.g. the right-hand side or the identity block).
 */
function reduce(M, { pivotCols = cols(M), partialPivot = false } = {}) {
  const n = rows(M);
  const ops = [];
  const pivots = [];
  let r = 0;
  for (let c = 0; c < pivotCols && r < n; c++) {
    let p = r;
    if (partialPivot) {
      for (let i = r + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c]) + EPS) p = i;
    } else {
      while (p < n && isZero(M[p][c])) p++;
    }
    if (p === n || isZero(M[p][c])) continue;
    if (p !== r) {
      [M[r], M[p]] = [M[p], M[r]];
      ops.push({ kind: 'swap', text: `${R(r)} ↔ ${R(p)}`, matrix: copy(M) });
    }
    const pv = M[r][c];
    if (!isZero(pv - 1)) {
      M[r] = M[r].map((v) => clean(v / pv));
      ops.push({ kind: 'scale', text: `${R(r)} → ${R(r)} ÷ (${fmt(pv)})`, matrix: copy(M) });
    }
    for (let i = 0; i < n; i++) {
      if (i === r || isZero(M[i][c])) continue;
      const k = M[i][c];
      M[i] = M[i].map((v, j) => clean(v - k * M[r][j]));
      ops.push({ kind: 'add', text: `${R(i)} → ${R(i)} − (${fmt(k)})${R(r)}`, matrix: copy(M) });
    }
    pivots.push(c);
    r++;
  }
  return { ops, rank: r, pivots };
}

/** Reduced row echelon form, its rank and pivot columns, with every row operation. */
export function rref(A) {
  check(A);
  const M = copy(A);
  const { ops, rank, pivots } = reduce(M);
  return { result: M, rank, pivots, ops };
}

/** Rank (number of non-zero rows in echelon form). */
export const rank = (A) => rref(A).rank;
