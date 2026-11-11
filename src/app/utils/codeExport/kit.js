/**
 * Shared pieces for the code-export programs added with Batches 1–4 (programs2–5.js): the statement
 * shorthands of programs.js and readers that turn a page's raw inputs into clean numbers.
 * Each of those files exports EXPORTS = { methodId: { name, clean(raw), program(p) } }.
 */

import { evaluate, parse } from 'mathjs';
import { checkUserExpression, ExportError } from './compile.js';
import { readMulti } from '../symbolic/multi';

export const D = (name, type, init) => ({ k: 'decl', name, type, init });
export const S = (target, value) => ({ k: 'set', target, value });
export const FOR = (v, from, to, body) => ({ k: 'for', v, from, to, body });
export const DOWN = (v, from, to, body) => ({ k: 'down', v, from, to, body });
export const WHILE = (cond, body) => ({ k: 'while', cond, body });
export const IF = (cond, then, els) => ({ k: 'if', cond, then, else: els });
export const P = (...parts) => ({ k: 'print', parts });
export const C = (text) => ({ k: 'comment', text });
export const SWAP = (m, i, j) => ({ k: 'swap', m, i, j });
export const BREAK = { k: 'break' };
export const num = (e, p = 6, w = 0) => ({ e, p, w });
export const int = (e, w = 0) => ({ e, int: true, w });

/** A number written into the program text (12 significant digits, no float noise). */
export const lit = (v) => String(+Number(v).toPrecision(12));

/**
 * A student's expression read the way the NETZ pages read it (x(4 − x) and 3xy are products, ² is ^2),
 * written back as plain mathjs text.
 */
export function normal(expr, label = 'f', extra = []) {
  try {
    return readMulti(String(expr ?? ''), label, extra).toString();
  } catch (e) {
    throw new ExportError(e?.message || `Could not read ${label}.`);
  }
}

/** A student's function of `vars`, checked so every language can write it. */
export function fn(name, expr, vars = ['x'], doc = null) {
  const clean = normal(expr, name, vars.filter((v) => v.length > 1));
  checkUserExpression(clean, vars);
  return { name, params: vars, expr: clean, doc: doc || `${name}(${vars.join(', ')}) as you typed it: ${String(expr).trim()}` };
}

/** True when the expression uses the variable `v`. */
export function uses(expr, v) {
  let found = false;
  try {
    parse(normal(expr)).traverse((c) => { if (c.type === 'SymbolNode' && c.name === v) found = true; });
  } catch {
    found = false;
  }
  return found;
}

/* ---------------- reading the page's inputs ---------------- */

const parseNum = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').trim();
  if (/^-?\d+(\.\d+)?\s*\/\s*-?\d+(\.\d+)?$/.test(s)) {
    const [a, b] = s.split('/').map(Number);
    return a / b;
  }
  return s === '' ? NaN : Number(s);
};

/** A required number. */
export function n(v, name) {
  const x = parseNum(v);
  if (!Number.isFinite(x)) throw new ExportError(`Enter a number for ${name} first.`);
  return x;
}

/** A number, or `fallback` when the box is empty or not a number. */
export function opt(v, fallback) {
  const x = parseNum(v);
  return Number.isFinite(x) ? x : fallback;
}

/** A number that may be written with pi or e, such as "pi/2" or "2pi" (limits of integrals). */
export function cn(v, name) {
  const s = String(v ?? '').trim();
  let x = NaN;
  try {
    x = s ? Number(evaluate(s.replace(/π/g, 'pi'))) : NaN;
  } catch {
    x = NaN;
  }
  if (!Number.isFinite(x)) throw new ExportError(`Enter a number for ${name} first.`);
  return x;
}

/** A whole number between lo and hi. */
export function whole(v, name, lo = 1, hi = 1000) {
  const x = Math.round(n(v, name));
  if (x < lo || x > hi) throw new ExportError(`Use a whole number from ${lo} to ${hi} for ${name}.`);
  return x;
}

/** A positive number. */
export function pos(v, name) {
  const x = n(v, name);
  if (!(x > 0)) throw new ExportError(`${name[0].toUpperCase()}${name.slice(1)} must be more than 0.`);
  return x;
}

/** A list of numbers typed with commas or spaces (or already an array). */
export function list(v, name, min = 1) {
  const raw = Array.isArray(v) ? v : String(v ?? '').split(/[,;\s]+/).filter(Boolean);
  const arr = raw.map(parseNum);
  if (arr.some((x) => !Number.isFinite(x)) || arr.length < min) throw new ExportError(`Enter at least ${min} numbers for ${name}.`);
  return arr;
}

/** Two lists of the same length. */
export function pair(a, b, nameA, nameB, min = 2) {
  const x = list(a, nameA, min);
  const y = list(b, nameB, min);
  if (x.length !== y.length) throw new ExportError(`${nameA} and ${nameB} need the same number of values.`);
  return [x, y];
}

/** A table of numbers: rows split by new lines or ";", cells by commas or spaces; or an array of arrays. */
export function table(v, name, { square = false, minRows = 1, cols = null } = {}) {
  const rows = Array.isArray(v)
    ? v.map((r) => (Array.isArray(r) ? r : String(r).split(/[,\s]+/).filter(Boolean)).map(parseNum))
    : String(v ?? '').split(/\n|;/).map((r) => r.trim()).filter(Boolean).map((r) => r.split(/[,\s]+/).filter(Boolean).map(parseNum));
  const width = rows[0]?.length || 0;
  if (rows.length < minRows || !width || rows.some((r) => r.length !== width || r.some((c) => !Number.isFinite(c)))) {
    throw new ExportError(`Fill in every number of ${name}, with the same count in each row.`);
  }
  if (square && rows.length !== width) throw new ExportError(`${name[0].toUpperCase()}${name.slice(1)} must be square.`);
  if (cols && width !== cols) throw new ExportError(`${name[0].toUpperCase()}${name.slice(1)} needs ${cols} columns.`);
  if (rows.length > 12 || width > 12) throw new ExportError(`Code export takes up to 12 rows and columns for ${name}.`);
  return rows;
}

/** A text input that must not be empty. */
export function text(v, name) {
  const s = String(v ?? '').trim();
  if (!s) throw new ExportError(`Enter ${name} first.`);
  return s;
}

/** One of `allowed` (the first when the value is missing). */
export function choice(v, allowed) {
  return allowed.includes(v) ? v : allowed[0];
}

export { ExportError };

/* ---------------- program pieces used by several methods ---------------- */
// Each returns a list of statements. Loop variables are prefixed so they never clash with the caller's.

/** Solves M·sol = rhs (n×n, Gaussian elimination with partial pivoting). M and rhs are changed. */
export function gaussSolve(M, rhs, sol, size) {
  return [
    C(`Solve ${M} * ${sol} = ${rhs} by Gaussian elimination with partial pivoting`),
    D(sol, 'vec', { zeros: size }),
    FOR('gc', 0, size, [
      D('gp', 'int', 'gc'),
      FOR('gr', 'gc + 1', size, [IF(`abs(${M}[gr, gc]) > abs(${M}[gp, gc])`, [S('gp', 'gr')])]),
      IF('gp != gc', [
        SWAP(M, 'gc', 'gp'),
        D('gt', 'num', `${rhs}[gc]`),
        S(`${rhs}[gc]`, `${rhs}[gp]`),
        S(`${rhs}[gp]`, 'gt'),
      ]),
      FOR('gr', 'gc + 1', size, [
        D('gm', 'num', `${M}[gr, gc] / ${M}[gc, gc]`),
        FOR('gk', 'gc', size, [S(`${M}[gr, gk]`, `${M}[gr, gk] - gm * ${M}[gc, gk]`)]),
        S(`${rhs}[gr]`, `${rhs}[gr] - gm * ${rhs}[gc]`),
      ]),
    ]),
    DOWN('gr', `${size} - 1`, 0, [
      D('gs', 'num', `${rhs}[gr]`),
      FOR('gk', 'gr + 1', size, [S('gs', `gs - ${M}[gr, gk] * ${sol}[gk]`)]),
      S(`${sol}[gr]`, `gs / ${M}[gr, gr]`),
    ]),
  ];
}

/** inv = M⁻¹ by Gauss-Jordan on [M | I] (n×n). M is changed. */
export function invert(M, inv, size) {
  return [
    C(`${inv} = inverse of ${M}, by Gauss-Jordan elimination on [${M} | I]`),
    D(inv, 'mat', { zeros2: [size, size] }),
    FOR('ii', 0, size, [S(`${inv}[ii, ii]`, '1')]),
    FOR('ic', 0, size, [
      D('ip', 'int', 'ic'),
      FOR('ir', 'ic + 1', size, [IF(`abs(${M}[ir, ic]) > abs(${M}[ip, ic])`, [S('ip', 'ir')])]),
      SWAP(M, 'ic', 'ip'),
      SWAP(inv, 'ic', 'ip'),
      D('iv', 'num', `${M}[ic, ic]`),
      FOR('ik', 0, size, [S(`${M}[ic, ik]`, `${M}[ic, ik] / iv`), S(`${inv}[ic, ik]`, `${inv}[ic, ik] / iv`)]),
      FOR('ir', 0, size, [
        IF('ir != ic', [
          D('im', 'num', `${M}[ir, ic]`),
          FOR('ik', 0, size, [S(`${M}[ir, ik]`, `${M}[ir, ik] - im * ${M}[ic, ik]`), S(`${inv}[ir, ik]`, `${inv}[ir, ik] - im * ${inv}[ic, ik]`)]),
        ]),
      ]),
    ]),
  ];
}

/** det = determinant of M (n×n) by elimination with row swaps. M is changed. */
export function determinant(M, det, size) {
  return [
    C(`${det} = determinant of ${M}: reduce to upper triangular form, then multiply the diagonal`),
    D(det, 'num', '1'),
    FOR('dc', 0, size, [
      D('dp', 'int', 'dc'),
      FOR('dr', 'dc + 1', size, [IF(`abs(${M}[dr, dc]) > abs(${M}[dp, dc])`, [S('dp', 'dr')])]),
      IF('dp != dc', [SWAP(M, 'dc', 'dp'), S(det, `-${det}`)]),
      S(det, `${det} * ${M}[dc, dc]`),
      IF(`abs(${M}[dc, dc]) > 1e-12`, [
        FOR('dr', 'dc + 1', size, [
          D('dm', 'num', `${M}[dr, dc] / ${M}[dc, dc]`),
          FOR('dk', 'dc', size, [S(`${M}[dr, dk]`, `${M}[dr, dk] - dm * ${M}[dc, dk]`)]),
        ]),
      ]),
    ]),
  ];
}

/** sol = solution of a tridiagonal system (sub a, main b, super c, right side d; size m ≥ 1), Thomas algorithm. */
export function thomas(a, b, c, d, sol, size) {
  return [
    C('Thomas algorithm for the tridiagonal system'),
    D('tc', 'vec', { zeros: size }),
    D('td', 'vec', { zeros: size }),
    S('tc[0]', `${c}[0] / ${b}[0]`),
    S('td[0]', `${d}[0] / ${b}[0]`),
    FOR('ti', 1, size, [
      D('tden', 'num', `${b}[ti] - ${a}[ti] * tc[ti - 1]`),
      S('tc[ti]', `${c}[ti] / tden`),
      S('td[ti]', `(${d}[ti] - ${a}[ti] * td[ti - 1]) / tden`),
    ]),
    D(sol, 'vec', { zeros: size }),
    S(`${sol}[${size} - 1]`, `td[${size} - 1]`),
    IF(`${size} > 1`, [DOWN('ti', `${size} - 2`, 0, [S(`${sol}[ti]`, `td[ti] - tc[ti] * ${sol}[ti + 1]`)])]),
  ];
}

/** dst = a copy of the matrix src (rows × cols). Tables can't use { copy }: that copies only lists of numbers. */
export function copyMatrix(src, dst, rowsCount, colsCount) {
  return [
    D(dst, 'mat', { zeros2: [rowsCount, colsCount] }),
    FOR('cr', 0, rowsCount, [FOR('cc', 0, colsCount, [S(`${dst}[cr, cc]`, `${src}[cr, cc]`)])]),
  ];
}

/** Prints a matrix one row per line, `label[i] = a, b, c` style, up to 12 columns. */
export function printMatrix(M, rowsCount, colsCount, label = M, p = 4) {
  // A row with a varying number of entries can't be one print in every language, so each entry is printed
  // with the row number; small matrices (the usual case) get one line per row instead.
  if (Number.isInteger(colsCount) && colsCount <= 6) {
    const parts = [`  `];
    for (let j = 0; j < colsCount; j++) parts.push(num(`${M}[pr, ${j}]`, p, p + 6), j < colsCount - 1 ? '  ' : '');
    return [FOR('pr', 0, rowsCount, [P(...parts.filter((x) => x !== ''))])];
  }
  return [FOR('pr', 0, rowsCount, [FOR('pk', 0, colsCount, [P(`  ${label}[`, int('pr + 1'), ', ', int('pk + 1'), '] = ', num(`${M}[pr, pk]`, p))])])];
}

/** Prints a vector one entry per line: `name1 = …`. */
export function printVector(v, size, label = v, p = 6) {
  return [FOR('pv', 0, size, [P(`${label}`, int('pv + 1'), ' = ', num(`${v}[pv]`, p))])];
}
