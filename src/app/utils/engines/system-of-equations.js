/**
 * Systems of linear equations (2×2 or 3×3): the maths for /system-of-equations.
 *   method 'cramer'        x = Dₓ/D, y = D_y/D, … (needs D ≠ 0)
 *   method 'elimination'   row-reduce [A | b] (Gauss-Jordan), every row operation shown
 *   method 'substitution'  2×2 only: make x the subject of one equation and put it in the other
 * Every method first decides: one solution, none, or infinitely many (by rank).
 */
import { EngineError, isZero } from '../numeric/steps';
import { n, q } from '../numeric/geometry';
import * as M from '../numeric/matrix';
import { matrixTex } from '../numeric/latex';

export const VARS = ['x', 'y', 'z'];

/** One equation as LaTeX: 2x + 3y - z = 4. */
export function equationTex(row, size) {
  let s = '';
  for (let j = 0; j < size; j++) {
    const k = row[j];
    if (isZero(k)) continue;
    const sign = k < 0 ? '-' : s ? '+' : '';
    const mag = Math.abs(k);
    s += `${s ? ` ${sign} ` : sign}${Math.abs(mag - 1) < 1e-12 ? '' : q(mag)}${VARS[j]}`;
  }
  return `${s || '0'} = ${q(row[size])}`;
}

/** Replace column j of A with b. */
const withColumn = (A, b, j) => A.map((r, i) => r.map((v, c) => (c === j ? b[i] : v)));

export function solve({ cells, method = 'cramer' }) {
  const size = cells.length;
  if (size !== 2 && size !== 3) throw new EngineError('Use 2 or 3 equations.');
  const aug = M.fromStrings(cells, 'The equations');
  if (aug.some((r) => r.length !== size + 1)) throw new EngineError(`Each equation needs ${size} coefficients and a constant.`);
  const A = aug.map((r) => r.slice(0, size));
  const b = aug.map((r) => r[size]);
  const system = aug.map((r) => equationTex(r, size));

  // One, none or infinitely many?
  const rankA = M.rank(A), rankAug = M.rank(aug);
  const kind = rankA === rankAug ? (rankA === size ? 'unique' : 'infinite') : 'none';
  const D = M.det(A);
  const base = { size, A, b, system, kind, rankA, rankAug, D, method, steps: { headers: [], rows: [] }, notes: [], plot: null };

  if (kind !== 'unique') {
    const lines = [`D = |A| = ${q(D)}`, `\\text{rank}(A) = ${rankA}, \\quad \\text{rank}([A \\mid b]) = ${rankAug}`];
    const verdict = kind === 'none'
      ? 'No solution: the equations contradict each other (for two equations, the lines are parallel).'
      : `Infinitely many solutions: the equations are not independent (only ${rankA} of them carry new information).`;
    return { ...base, result: null, lines, verdict, rref: M.rref(aug).result };
  }

  let lines = [];
  let ops = null;
  if (method === 'cramer') {
    lines.push(`D = ${matrixTex(A, { bars: '|' })} = ${q(D)}`);
    const sol = VARS.slice(0, size).map((v, j) => {
      const Aj = withColumn(A, b, j);
      const Dj = M.det(Aj);
      lines.push(`D_${v} = ${matrixTex(Aj, { bars: '|' })} = ${q(Dj)}, \\quad ${v} = \\frac{D_${v}}{D} = \\frac{${q(Dj)}}{${q(D)}} = ${q(Dj / D)}`);
      return Dj / D;
    });
    return { ...base, result: sol, lines };
  }

  if (method === 'substitution') {
    if (size !== 2) throw new EngineError('Substitution is shown for 2 equations. Choose Cramer or elimination for 3.');
    // Make x the subject of an equation whose x-coefficient isn't 0
    const i = isZero(A[0][0]) ? 1 : 0;
    const o = 1 - i;
    const [a1, b1, c1] = aug[i];
    const [a2, b2, c2] = aug[o];
    const yCoef = b2 - (a2 * b1) / a1;
    const rhs = c2 - (a2 * c1) / a1;
    const y = rhs / yCoef;
    const x = (c1 - b1 * y) / a1;
    lines = [
      `\\text{From equation ${i + 1}: } x = \\frac{${q(c1)} - (${q(b1)})y}{${q(a1)}}`,
      `\\text{Put it in equation ${o + 1}: } ${q(a2)}\\left(\\frac{${q(c1)} - (${q(b1)})y}{${q(a1)}}\\right) + (${q(b2)})y = ${q(c2)}`,
      `(${q(yCoef)})y = ${q(rhs)} \\;\\Rightarrow\\; y = ${q(y)}`,
      `x = \\frac{${q(c1)} - (${q(b1)})(${q(y)})}{${q(a1)}} = ${q(x)}`,
    ];
    return { ...base, result: [x, y], lines };
  }

  if (method === 'elimination') {
    const r = M.rref(aug);
    ops = r.ops;
    const sol = r.result.map((row) => row[size]);
    lines = [`\\text{Row-reduce } [A \\mid b] \\text{ until the left side is } I; \\text{ the last column is the answer.}`];
    return { ...base, result: sol, lines, ops, rref: r.result };
  }

  throw new EngineError('Choose a method.');
}

export const formatSolution = (sol) => sol.map((v, j) => `${VARS[j]} = ${n(v)}`).join(', ');
