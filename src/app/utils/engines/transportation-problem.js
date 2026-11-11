/**
 * The transportation problem: the maths for /transportation-problem (Unit 15).
 *   Balance first (a dummy row or column with cost 0 takes the difference).
 *   Starting solution: North-West corner, least cost, or Vogel's approximation (VAM: penalty = the two smallest
 *   costs' difference in each row and column; allocate in the cheapest cell of the largest penalty).
 *   Optimise by MODI: uᵢ + vⱼ = cᵢⱼ on the m + n − 1 basic cells; dᵢⱼ = cᵢⱼ − (uᵢ + vⱼ) on the others; while some
 *   dᵢⱼ < 0, bring the most negative in round its closed loop (+ − + − …), moving the smallest "−" amount.
 *   Degenerate solutions (fewer than m + n − 1 basic cells) get an ε (0) allocation in an independent cell.
 */
import { EngineError } from '../numeric/steps';

const parseRow = (s, label) => String(s ?? '').trim().split(/[\s,]+/).filter(Boolean).map((x) => { const v = Number(x); if (!Number.isFinite(v)) throw new EngineError(`${label}: "${x}" is not a number.`); return v; });
export function readCosts(text) {
  const rows = String(text ?? '').trim().split(/[;\n]/).map((r) => r.trim()).filter(Boolean).map((r, i) => parseRow(r, `Row ${i + 1}`));
  if (rows.length < 2 || rows.some((r) => r.length !== rows[0].length) || rows[0].length < 2) throw new EngineError('Type the cost table as rows of numbers, one row per line (or separated by ;), all the same length.');
  return rows;
}
const sum = (a) => a.reduce((s, v) => s + v, 0);

/** cells in a loop through the basic cells, starting and ending at (r0, c0): alternate row / column moves */
function findLoop(basic, r0, c0) {
  const isB = (r, c) => basic.some((b) => b.r === r && b.c === c);
  const dfs = (path, rowMove) => {
    const [r, c] = path.at(-1);
    if (path.length >= 4 && (rowMove ? r === r0 : c === c0)) {
      // close: next move would reach the start
      if ((rowMove && r === r0) || (!rowMove && c === c0)) return path;
    }
    const cand = rowMove ? basic.filter((b) => b.r === r && b.c !== c).map((b) => [b.r, b.c]) : basic.filter((b) => b.c === c && b.r !== r).map((b) => [b.r, b.c]);
    for (const p of cand) {
      if (path.some(([pr, pc]) => pr === p[0] && pc === p[1])) continue;
      const res = dfs([...path, p], !rowMove);
      if (res) return res;
    }
    return null;
  };
  void isB;
  return dfs([[r0, c0]], true) || dfs([[r0, c0]], false);
}

export function solve({ costs, supply, demand, method = 'vam', goal = 'min' }) {
  let C = readCosts(costs);
  let S = parseRow(supply, 'Supply'), D = parseRow(demand, 'Demand');
  if (S.length !== C.length) throw new EngineError(`Give ${C.length} supplies (one per row).`);
  if (D.length !== C[0].length) throw new EngineError(`Give ${C[0].length} demands (one per column).`);
  if ([...S, ...D].some((v) => v < 0)) throw new EngineError('Supplies and demands cannot be negative.');
  const steps = [];
  const notes = [];
  const maxi = goal === 'max';
  // maximise profit: minimise (largest − profit)
  const orig = C.map((r) => [...r]);
  if (maxi) { const M = Math.max(...C.flat()); C = C.map((r) => r.map((v) => M - v)); notes.push(`To maximise, each profit p was replaced by ${M} − p and the cost minimised.`); }
  let rowNames = S.map((_, i) => `S${i + 1}`), colNames = D.map((_, j) => `D${j + 1}`);
  const ts = sum(S), td = sum(D);
  if (Math.abs(ts - td) > 1e-9) {
    if (ts > td) { C = C.map((r) => [...r, 0]); D = [...D, ts - td]; colNames = [...colNames, 'Dummy']; orig.forEach((r) => r.push(0)); }
    else { C = [...C, C[0].map(() => 0)]; S = [...S, td - ts]; rowNames = [...rowNames, 'Dummy']; orig.push(orig[0].map(() => 0)); }
    steps.push({ title: 'Balance the problem', depth: 0, lines: [`\\text{supply } ${ts} \\neq \\text{demand } ${td}: \\text{ a dummy ${ts > td ? 'column' : 'row'} with cost 0 takes } ${Math.abs(ts - td)}`] });
  }
  const m = S.length, n = D.length;
  const X = Array.from({ length: m }, () => Array(n).fill(null)); // null = not basic
  const s = [...S], d = [...D];
  const log = [];
  const rowDone = Array(m).fill(false), colDone = Array(n).fill(false);
  const alloc = (i, j) => { const q = Math.min(s[i], d[j]); X[i][j] = q; s[i] -= q; d[j] -= q; log.push(`x_{${i + 1}${j + 1}} = ${q}`); if (s[i] === 0 && !(d[j] === 0 && rowDone.filter((x) => !x).length === 1)) rowDone[i] = true; else colDone[j] = true; if (s[i] === 0) rowDone[i] = true; if (d[j] === 0 && !rowDone[i]) colDone[j] = true; };
  const open = () => rowDone.some((x) => !x) && colDone.some((x) => !x);
  if (method === 'nw') {
    let i = 0, j = 0;
    while (i < m && j < n) { const q = Math.min(s[i], d[j]); X[i][j] = q; s[i] -= q; d[j] -= q; log.push(`x_{${i + 1}${j + 1}} = ${q}`); if (s[i] === 0 && i < m - 1) i++; else j++; }
  } else if (method === 'least') {
    while (open()) {
      let best = null;
      for (let i = 0; i < m; i++) if (!rowDone[i]) for (let j = 0; j < n; j++) if (!colDone[j]) if (!best || C[i][j] < C[best[0]][best[1]] || (C[i][j] === C[best[0]][best[1]] && Math.min(s[i], d[j]) > Math.min(s[best[0]], d[best[1]]))) best = [i, j];
      alloc(best[0], best[1]);
    }
  } else {
    while (open()) {
      const pen = (vals) => { const v = [...vals].sort((p, q) => p - q); return v.length > 1 ? v[1] - v[0] : v[0]; };
      const rp = C.map((r, i) => (rowDone[i] ? -1 : pen(r.filter((_, j) => !colDone[j]))));
      const cp = C[0].map((_, j) => (colDone[j] ? -1 : pen(C.map((r) => r[j]).filter((_, i) => !rowDone[i]))));
      const mr = Math.max(...rp), mc = Math.max(...cp);
      let i, j;
      if (mr >= mc) { i = rp.indexOf(mr); j = C[i].map((v, k) => (colDone[k] ? Infinity : v)).reduce((bi, v, k, arr) => (v < arr[bi] ? k : bi), 0); }
      else { j = cp.indexOf(mc); i = C.map((r, k) => (rowDone[k] ? Infinity : r[j])).reduce((bi, v, k, arr) => (v < arr[bi] ? k : bi), 0); }
      log.push(`\\text{penalties: rows } (${rp.map((v) => (v < 0 ? '-' : v)).join(', ')}), \\text{ columns } (${cp.map((v) => (v < 0 ? '-' : v)).join(', ')}) \\Rightarrow \\text{cell } (${i + 1}, ${j + 1})`);
      alloc(i, j);
    }
  }
  const basicCells = () => { const b = []; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (X[i][j] !== null) b.push({ r: i, c: j }); return b; };
  const cost = () => { let t = 0; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (X[i][j]) t += X[i][j] * orig[i][j]; return t; };
  const snapshot = (u, v, dd) => ({ rowNames, colNames, costs: orig.map((r) => [...r]), alloc: X.map((r) => r.map((q) => (q === null ? null : q))), supply: S, demand: D, u, v, d: dd });
  const initCost = cost();
  steps.push({ title: { nw: 'North-West corner rule', least: 'Least cost method', vam: "Vogel's approximation method" }[method] || 'Starting solution', depth: 0, lines: [...log, `\\text{starting cost} = ${initCost}`] });
  // degeneracy: add ε cells until m + n − 1 basic cells, each not closing a loop
  const fixDegenerate = () => {
    let b = basicCells();
    while (b.length < m + n - 1) {
      let added = false;
      const cand = [];
      for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (X[i][j] === null) cand.push([C[i][j], i, j]);
      cand.sort((p, q) => p[0] - q[0]);
      for (const [, i, j] of cand) { if (!findLoop(b, i, j)) { X[i][j] = 0; added = true; steps.push({ title: 'Degenerate: add ε', depth: 1, lines: [`\\text{only } ${b.length} \\text{ basic cells (need } ${m + n - 1}): x_{${i + 1}${j + 1}} = \\varepsilon`] }); break; } }
      if (!added) break;
      b = basicCells();
    }
  };
  fixDegenerate();
  const tables = [snapshot(null, null, null)];
  // MODI
  let iter = 0;
  for (; iter < 30; iter++) {
    const b = basicCells();
    const u = Array(m).fill(null), v = Array(n).fill(null);
    u[0] = 0;
    for (let k = 0; k < m + n; k++) for (const { r, c } of b) { if (u[r] !== null && v[c] === null) v[c] = C[r][c] - u[r]; else if (v[c] !== null && u[r] === null) u[r] = C[r][c] - v[c]; }
    if (u.includes(null) || v.includes(null)) throw new EngineError('The basic cells do not connect every row and column (a degenerate case NETZ could not fix).');
    const dd = C.map((row, i) => row.map((cij, j) => (X[i][j] === null ? cij - u[i] - v[j] : null)));
    let worst = null;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (dd[i][j] !== null && dd[i][j] < -1e-9 && (!worst || dd[i][j] < dd[worst[0]][worst[1]])) worst = [i, j];
    tables.push(snapshot(u, v, dd));
    steps.push({ title: `MODI, round ${iter + 1}`, formula: 'u_i + v_j = c_{ij} \\text{ (basic)}, \\quad d_{ij} = c_{ij} - (u_i + v_j)', depth: 0, lines: [`u = (${u.join(', ')}), \\quad v = (${v.join(', ')})`, worst ? `\\text{most negative } d_{${worst[0] + 1}${worst[1] + 1}} = ${dd[worst[0]][worst[1]]} \\Rightarrow \\text{improve}` : '\\text{every } d_{ij} \\ge 0: \\text{ optimal}'] });
    if (!worst) break;
    const loop = findLoop(b, worst[0], worst[1]);
    if (!loop) throw new EngineError('No closed loop was found (this should not happen).');
    const minus = loop.filter((_, k) => k % 2 === 1);
    const theta = Math.min(...minus.map(([r, c]) => X[r][c]));
    loop.forEach(([r, c], k) => { X[r][c] = (X[r][c] ?? 0) + (k % 2 === 0 ? theta : -theta); });
    // one "−" cell that reached 0 leaves the basis
    const leave = minus.find(([r, c]) => X[r][c] === 0);
    X[leave[0]][leave[1]] = null;
    steps.push({ title: 'Move round the loop', depth: 1, lines: [`\\text{loop } ${loop.map(([r, c]) => `(${r + 1},${c + 1})`).join(' \\to ')}, \\ \\theta = ${theta}`, `\\text{cost} = ${cost()}`] });
    fixDegenerate();
  }
  const total = cost();
  const routes = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (X[i][j]) routes.push(`${rowNames[i]} \\to ${colNames[j]}: ${X[i][j]}`);
  // alternative optima: a zero d on a non-basic cell
  const last = tables.at(-1);
  if (last.d && last.d.some((r) => r.some((v) => v !== null && Math.abs(v) < 1e-9))) notes.push('Some dᵢⱼ = 0 on an empty cell: there is another optimal plan with the same cost.');
  return { total, initial: initCost, routes, tables, rounds: iter, steps, notes, verified: true, result: total, goal };
}
