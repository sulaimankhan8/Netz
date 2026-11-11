/**
 * The assignment problem by the Hungarian method: the maths for /assignment-problem (Unit 15).
 *   1. Square the table (dummy rows or columns of 0); to maximise, use (largest − value).
 *   2. Subtract each row's smallest number, then each column's.
 *   3. Cover every 0 with the fewest lines. Fewer lines than n: take the smallest uncovered number off every
 *      uncovered cell and add it where two lines cross; repeat.
 *   4. n lines: pick one 0 in each row and column (the assignment).
 * The total is checked against a brute-force search for n ≤ 7.
 */
import { EngineError } from '../numeric/steps';
import { readCosts } from './transportation-problem';

const matTex = (M, mark = null) => `\\begin{bmatrix} ${M.map((r, i) => r.map((v, j) => (mark && mark[i] === j ? `\\boxed{${v}}` : String(Number(v.toPrecision(10))))).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** a maximum matching on the zero cells (augmenting paths) */
function zeroMatching(M) {
  const n = M.length;
  const matchCol = Array(n).fill(-1);
  const tryRow = (i, seen) => {
    for (let j = 0; j < n; j++) {
      if (Math.abs(M[i][j]) > 1e-9 || seen[j]) continue;
      seen[j] = true;
      if (matchCol[j] < 0 || tryRow(matchCol[j], seen)) { matchCol[j] = i; return true; }
    }
    return false;
  };
  let size = 0;
  for (let i = 0; i < n; i++) if (tryRow(i, Array(n).fill(false))) size++;
  const rowOf = Array(n).fill(-1);
  matchCol.forEach((i, j) => { if (i >= 0) rowOf[i] = j; });
  return { size, rowOf, matchCol };
}
/** the fewest lines covering every 0 (König: from the maximum matching) */
function coverLines(M, rowOf, matchCol) {
  const n = M.length;
  const visR = Array(n).fill(false), visC = Array(n).fill(false);
  const stack = [];
  for (let i = 0; i < n; i++) if (rowOf[i] < 0) { visR[i] = true; stack.push(i); }
  while (stack.length) {
    const i = stack.pop();
    for (let j = 0; j < n; j++) if (Math.abs(M[i][j]) < 1e-9 && !visC[j]) { visC[j] = true; const i2 = matchCol[j]; if (i2 >= 0 && !visR[i2]) { visR[i2] = true; stack.push(i2); } }
  }
  // lines: rows not visited, columns visited
  return { rows: visR.map((v) => !v), cols: visC };
}

export function solve({ costs, goal = 'min' }) {
  let C = readCosts(costs);
  const r0 = C.length, c0 = C[0].length;
  const steps = [];
  const notes = [];
  const orig = C.map((r) => [...r]);
  if (goal === 'max') { const M = Math.max(...C.flat()); C = C.map((r) => r.map((v) => M - v)); steps.push({ title: 'Maximise: change to a loss table', depth: 0, lines: [`\\text{each value } p \\to ${M} - p`, matTex(C)] }); }
  const n = Math.max(r0, c0);
  if (n > 9) throw new EngineError('Use at most 9 rows and columns.');
  if (r0 !== c0) {
    C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i < r0 && j < c0 ? C[i][j] : 0)));
    steps.push({ title: 'Make it square', depth: 0, lines: [`\\text{add ${r0 < c0 ? `${c0 - r0} dummy row(s)` : `${r0 - c0} dummy column(s)`} of 0s}`, matTex(C)] });
    notes.push('A dummy row or column means one job (or worker) is left unassigned.');
  }
  let M = C.map((r) => [...r]);
  M = M.map((r) => { const m = Math.min(...r); return r.map((v) => v - m); });
  steps.push({ title: 'Subtract each row\'s smallest', depth: 0, lines: [matTex(M)] });
  for (let j = 0; j < n; j++) { const m = Math.min(...M.map((r) => r[j])); for (let i = 0; i < n; i++) M[i][j] -= m; }
  steps.push({ title: 'Subtract each column\'s smallest', depth: 0, lines: [matTex(M)] });
  let match;
  for (let round = 0; round < 50; round++) {
    match = zeroMatching(M);
    if (match.size === n) break;
    const { rows, cols } = coverLines(M, match.rowOf, match.matchCol);
    const lines = rows.filter(Boolean).length + cols.filter(Boolean).length;
    let k = Infinity;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!rows[i] && !cols[j]) k = Math.min(k, M[i][j]);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (!rows[i] && !cols[j]) M[i][j] -= k; else if (rows[i] && cols[j]) M[i][j] += k; }
    steps.push({ title: `Cover the zeros: ${lines} line${lines > 1 ? 's' : ''} < ${n}`, depth: 0, lines: [`\\text{lines through rows } ${rows.map((v, i) => (v ? i + 1 : null)).filter(Boolean).join(', ') || '-'}, \\text{ columns } ${cols.map((v, j) => (v ? j + 1 : null)).filter(Boolean).join(', ') || '-'}`, `\\text{smallest uncovered} = ${Number(k.toPrecision(10))}: \\text{ subtract it from uncovered cells, add where lines cross}`, matTex(M)] });
  }
  if (!match || match.size !== n) throw new EngineError('The method did not finish; check the table.');
  steps.push({ title: `${n} lines: assign`, formula: '\\text{one } 0 \\text{ in each row and column}', depth: 0, lines: [matTex(M, match.rowOf)] });
  const pairs = [];
  let total = 0;
  match.rowOf.forEach((j, i) => { if (i < r0 && j < c0) { pairs.push({ row: i + 1, col: j + 1, value: orig[i][j] }); total += orig[i][j]; } });
  // brute force check
  let verified = true;
  if (n <= 7) {
    let best = goal === 'max' ? -Infinity : Infinity;
    const perm = (i, used, s) => { if (i === n) { best = goal === 'max' ? Math.max(best, s) : Math.min(best, s); return; } for (let j = 0; j < n; j++) if (!used[j]) { used[j] = true; perm(i + 1, used, s + (i < r0 && j < c0 ? orig[i][j] : 0)); used[j] = false; } };
    perm(0, Array(n).fill(false), 0);
    verified = Math.abs(best - total) < 1e-9;
  }
  steps.push({ title: 'The assignment', depth: 0, lines: [...pairs.map((p) => `\\text{row } ${p.row} \\to \\text{column } ${p.col}: \\ ${p.value}`), `\\text{total} = ${total}`] });
  return { pairs, total, steps, notes, verified, result: total, goal, table: { columns: [{ key: 'row', label: 'Row', bold: true }, { key: 'col', label: 'Column' }, { key: 'value', label: goal === 'max' ? 'Profit' : 'Cost', highlight: true }], rows: pairs } };
}
