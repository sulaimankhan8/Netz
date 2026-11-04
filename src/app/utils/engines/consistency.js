/**
 * Consistency of a system of linear equations AX = B by the rank test (Rouché–Capelli):
 *   row-reduce the augmented matrix [A | B], then compare ρ(A), ρ([A | B]) and n (the number of unknowns):
 *     ρ(A) ≠ ρ([A|B])           inconsistent: no solution
 *     ρ(A) = ρ([A|B]) = n       consistent: exactly one solution
 *     ρ(A) = ρ([A|B]) = r < n   consistent: infinitely many, with n − r free unknowns
 * For homogeneous systems (B = 0) this is "only the trivial solution" vs "non-trivial solutions".
 * The solution (or the general solution in terms of parameters) is read from the reduced form and checked.
 */
import { EngineError } from '../numeric/steps';
import * as M from '../numeric/matrix';
import { texNumber } from '../numeric/latex';

/** Names for the unknowns: x, y, z (, w) or x₁ … xₙ. */
export const unknowns = (n) => (n <= 3 ? ['x', 'y', 'z'].slice(0, n) : n === 4 ? ['x', 'y', 'z', 'w'] : Array.from({ length: n }, (_, i) => `x_{${i + 1}}`));
const PARAMS = ['t', 's', 'u', 'v', 'p', 'q'];

/** a₁x + a₂y + … in LaTeX (skips zero terms). */
function linearTex(coeffs, names, constant = null) {
  const parts = [];
  coeffs.forEach((c, j) => {
    if (Math.abs(c) < 1e-12) return;
    const mag = Math.abs(c), t = texNumber(mag);
    parts.push({ neg: c < 0, s: `${t === '1' ? '' : t}${names[j]}` });
  });
  if (constant !== null && (Math.abs(constant) > 1e-12 || !parts.length)) parts.push({ neg: constant < 0, s: texNumber(Math.abs(constant)) });
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? `${p.neg ? '-' : ''}${p.s}` : ` ${p.neg ? '-' : '+'} ${p.s}`)).join('');
}

export function solve({ cells }) {
  const Aug = M.fromStrings(cells, 'The augmented matrix');
  M.check(Aug);
  const m = Aug.length, n = Aug[0].length - 1;
  if (n < 1) throw new EngineError('The augmented matrix needs at least two columns: the coefficients and the constants.');
  const names = unknowns(n);
  const A = Aug.map((r) => r.slice(0, n));
  const B = Aug.map((r) => r[n]);
  const homogeneous = B.every((b) => Math.abs(b) < 1e-12);

  const { result: R, ops } = M.rref(Aug);
  // ρ(A): pivots inside the first n columns; ρ([A|B]): all non-zero rows
  const rankAug = R.filter((row) => row.some((v) => Math.abs(v) > 1e-9)).length;
  const pivots = [];
  R.forEach((row) => { const j = row.findIndex((v) => Math.abs(v) > 1e-9); if (j >= 0 && j < n) pivots.push(j); });
  const rankA = pivots.length;

  const equations = A.map((row, i) => `${linearTex(row, names)} = ${texNumber(B[i])}`);
  const steps = [
    { title: 'Write the system as AX = B and form the augmented matrix [A | B]', lines: [`\\begin{aligned} ${equations.map((e) => e.replace('=', '&=')).join(' \\\\ ')} \\end{aligned}`] },
  ];

  let kind, solution = null, general = null;
  if (rankA !== rankAug) {
    kind = 'none';
    const badRow = R.findIndex((row) => row.slice(0, n).every((v) => Math.abs(v) < 1e-9) && Math.abs(row[n]) > 1e-9);
    steps.push({ title: 'Compare the ranks', formula: '\\rho(A) \\neq \\rho([A|B]) \\Rightarrow \\text{inconsistent}', lines: [`\\rho(A) = ${rankA}, \\quad \\rho([A|B]) = ${rankAug}`, `\\text{Row ${badRow + 1} reads } 0 = ${texNumber(R[badRow][n])} \\text{, which is impossible: no solution.}`] });
  } else if (rankA === n) {
    kind = 'one';
    solution = names.map((_, j) => R[pivots.indexOf(j)][n]);
    steps.push({ title: 'Compare the ranks', formula: '\\rho(A) = \\rho([A|B]) = n \\Rightarrow \\text{unique solution}', lines: [`\\rho(A) = \\rho([A|B]) = ${rankA} = n`, homogeneous ? '\\text{Homogeneous: only the trivial solution.}' : '\\text{Consistent, with exactly one solution.}'] });
    steps.push({ title: 'Read off the solution', lines: [names.map((x, j) => `${x} = ${texNumber(solution[j])}`).join(', \\quad ')] });
  } else {
    kind = 'many';
    const free = names.map((_, j) => j).filter((j) => !pivots.includes(j));
    const param = Object.fromEntries(free.map((j, k) => [j, PARAMS[k] || `t_{${k + 1}}`]));
    // Each pivot unknown = constant − Σ (coefficient × free unknown)
    general = names.map((x, j) => {
      if (free.includes(j)) return `${x} = ${param[j]}`;
      const row = R[pivots.indexOf(j)];
      const coeffs = names.map((_, k) => (free.includes(k) ? -row[k] : 0));
      const pNames = names.map((_, k) => param[k] || '');
      return `${x} = ${linearTex(coeffs, pNames, row[n])}`;
    });
    steps.push({ title: 'Compare the ranks', formula: '\\rho(A) = \\rho([A|B]) = r < n \\Rightarrow \\text{infinitely many solutions}', lines: [`\\rho(A) = \\rho([A|B]) = ${rankA} < ${n} = n`, `${n - rankA} \\text{ unknown${n - rankA > 1 ? 's are' : ' is'} free: } ${free.map((j) => `${names[j]} = ${param[j]}`).join(', ')}`, homogeneous ? '\\text{Homogeneous: non-trivial solutions exist.}' : '\\text{Consistent, with infinitely many solutions.}'] });
    steps.push({ title: 'General solution', lines: [general.join(', \\quad ')] });
  }

  // Check: the unique solution, or two members of the family, satisfy every equation
  let verified = true;
  const satisfies = (X) => A.every((row, i) => Math.abs(row.reduce((s, a, j) => s + a * X[j], 0) - B[i]) < 1e-7 * Math.max(1, Math.abs(B[i])));
  if (kind === 'one') verified = satisfies(solution);
  if (kind === 'many') {
    for (const t of [0, 1.7]) {
      const X = new Array(n).fill(0);
      names.forEach((_, j) => { if (!pivots.includes(j)) X[j] = t + j * 0.3; });
      pivots.forEach((j, r) => { X[j] = R[r][n] - names.reduce((s, _, k) => s + (pivots.includes(k) ? 0 : R[r][k] * X[k]), 0); });
      if (!satisfies(X)) verified = false;
    }
  }
  return { m, n, names, A, B, Aug, rref: R, ops, rankA, rankAug, kind, homogeneous, solution, general, steps, verified, result: kind, notes: [], plot: null };
}
