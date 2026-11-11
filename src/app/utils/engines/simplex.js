/**
 * Linear programming by the simplex method: the maths for /simplex-method (Unit 15).
 * Objective "max 3x + 5y" (or min), constraints "x + 2y <= 8; 3x + 2y <= 12; x >= 1", all variables ≥ 0.
 *   ≤ constraints get slack variables; ≥ and = constraints get surplus and artificial variables with a big penalty M
 *   (Big-M). Each tableau is shown with the entering column (most negative zⱼ − cⱼ) and the leaving row (smallest ratio).
 *   mode 'dual' writes the dual problem of a standard max (≤) or min (≥) problem.
 * Fractions are kept exact.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { readMulti } from '../symbolic/multi';

// Exact fractions (n/d with BigInt-free integers; inputs are small)
const g = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const k = g(n, d); return { n: n / k, d: d / k }; };
const fromNum = (x) => { const f = math.fraction(x); return F(Number(f.s * f.n), Number(f.d)); };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => { if (b.n === 0) throw new EngineError('Division by zero in the tableau.'); return F(a.n * b.d, a.d * b.n); };
const val = (a) => a.n / a.d;
const tex = (a) => (a.d === 1 ? String(a.n) : `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}`);
const txt = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);
// Values with a Big-M part: { m, c } = mM + c
const MV = (m, c) => ({ m, c });
const mAdd = (a, b) => MV(add(a.m, b.m), add(a.c, b.c));
const mMul = (a, k) => MV(mul(a.m, k), mul(a.c, k));
const mLess = (a, b) => (val(a.m) !== val(b.m) ? val(a.m) < val(b.m) : val(a.c) < val(b.c));
const mTxt = (a) => { const m = val(a.m), c = val(a.c); if (!m) return txt(a.c); const mp = `${txt(a.m) === '1' ? '' : txt(a.m) === '-1' ? '-' : txt(a.m)}M`; return c ? `${mp} ${c > 0 ? '+' : '−'} ${txt(F(Math.abs(a.c.n), a.c.d))}` : mp; };

/** Coefficients of a linear expression in the given variables. */
function linear(text, label) {
  const node = readMulti(text, label);
  const vars = [...new Set(node.toString().match(/\b[a-z]\w*\b/g) || [])];
  return { node, vars };
}

export function solve({ objective, constraints, mode = 'simplex' }) {
  const obj = String(objective ?? '').trim().match(/^(max|min)(?:imi[sz]e)?\s*(?:z\s*=)?\s*(.+)$/i);
  if (!obj) throw new EngineError('Write the objective as "max 3x + 5y" or "min 2x + y".');
  const sense = obj[1].toLowerCase();
  const cons = String(constraints ?? '').split(/[;\n]/).map((s) => s.trim()).filter(Boolean)
    .filter((s) => !/^[a-z]\w*\s*>=\s*0$/i.test(s.replace(/\s+/g, ' ')) && !/^[a-z](\s*,\s*[a-z])*\s*>=\s*0$/i.test(s));
  if (!cons.length) throw new EngineError('Type at least one constraint, e.g. x + 2y <= 8.');
  const parsed = cons.map((c) => {
    const m = c.replace(/≤/g, '<=').replace(/≥/g, '>=').match(/^(.+?)(<=|>=|=)(.+)$/);
    if (!m) throw new EngineError(`Write each constraint with <=, >= or = (could not read "${c}").`);
    return { lhs: linear(m[1], 'A constraint'), op: m[2], rhs: Number(math.evaluate(m[3])) };
  });
  const objL = linear(obj[2], 'The objective');
  const vars = [...new Set([...objL.vars, ...parsed.flatMap((p) => p.lhs.vars)])].sort();
  if (!vars.length || vars.length > 6) throw new EngineError('Use 1 to 6 decision variables.');
  const coef = (node) => vars.map((v) => { const d = math.derivative(node, v); if (d.toString().match(/[a-z]/i)) throw new EngineError('Constraints and the objective must be linear.'); return fromNum(d.evaluate({})); });
  const c = coef(objL.node);
  const rows = parsed.map((p) => {
    let a = coef(p.lhs.node), b = fromNum(p.rhs - p.lhs.node.evaluate(Object.fromEntries(vars.map((v) => [v, 0])))), op = p.op;
    if (val(b) < 0) { a = a.map((x) => mul(x, F(-1))); b = mul(b, F(-1)); op = op === '<=' ? '>=' : op === '>=' ? '<=' : '='; }
    return { a, b, op };
  });
  if (mode === 'dual') {
    const isMax = sense === 'max';
    if (rows.some((r) => r.op !== (isMax ? '<=' : '>='))) throw new EngineError(`For the dual, write a ${isMax ? 'max problem with all ≤' : 'min problem with all ≥'} constraints.`);
    const ys = rows.map((_, i) => `y_{${i + 1}}`);
    const dualObj = `${isMax ? '\\min' : '\\max'}\\ w = ${rows.map((r, i) => `${tex(r.b)}${ys[i]}`).join(' + ')}`;
    const dualCons = vars.map((v, j) => `${rows.map((r, i) => `${tex(r.a[j])}${ys[i]}`).join(' + ')} ${isMax ? '\\ge' : '\\le'} ${tex(c[j])}`);
    return { mode, answer: dualObj, dual: { obj: dualObj, cons: dualCons, ys }, steps: [{ title: 'Primal → dual', depth: 0, lines: ['\\text{Constraints become variables, the right side becomes the objective, the matrix is transposed.}', dualObj, ...dualCons, `${ys.join(', ')} \\ge 0`] }], notes: ['By the duality theorem, the primal and dual have the same optimal value.'], verified: true, tableaux: [] };
  }
  // Build the tableau: columns = decision vars, slacks/surpluses, artificials
  const cols = [...vars];
  const cost = [...c.map((x) => MV(F(0), sense === 'max' ? x : mul(x, F(-1))))];
  const big = MV(F(-1), F(0)); // −M for artificials (maximisation)
  const A = rows.map((r) => [...r.a]);
  const basis = [];
  rows.forEach((r, i) => {
    const addCol = (name, coefInRow, cst) => { cols.push(name); cost.push(cst); A.forEach((row, k) => row.push(k === i ? coefInRow : F(0))); return cols.length - 1; };
    if (r.op === '<=') basis.push(addCol(`s${i + 1}`, F(1), MV(F(0), F(0))));
    else {
      if (r.op === '>=') addCol(`s${i + 1}`, F(-1), MV(F(0), F(0)));
      basis.push(addCol(`A${i + 1}`, F(1), big));
    }
  });
  const b = rows.map((r) => r.b);
  const tableaux = [];
  const snapshot = (enter, leave) => {
    const z = cols.map((_, j) => A.reduce((s, row, i) => mAdd(s, mMul(cost[basis[i]], row[j])), MV(F(0), F(0))));
    const zc = z.map((zj, j) => mAdd(zj, mMul(cost[j], F(-1))));
    const zval = A.reduce((s, _, i) => mAdd(s, mMul(cost[basis[i]], b[i])), MV(F(0), F(0)));
    tableaux.push({
      columns: [{ key: 'basis', label: 'Basis', bold: true }, ...cols.map((cname, j) => ({ key: `c${j}`, label: cname, highlight: j === enter })), { key: 'b', label: 'b' }, { key: 'ratio', label: 'Ratio' }],
      rows: [...A.map((row, i) => ({ basis: cols[basis[i]], ...Object.fromEntries(row.map((x, j) => [`c${j}`, txt(x)])), b: txt(b[i]), ratio: enter !== null && val(row[enter]) > 0 ? txt(div(b[i], row[enter])) + (i === leave ? ' ←' : '') : '—' })),
        { basis: 'zⱼ − cⱼ', ...Object.fromEntries(zc.map((x, j) => [`c${j}`, mTxt(x)])), b: mTxt(zval), ratio: '' }],
    });
    return { zc, zval };
  };
  for (let it = 0; it < 30; it++) {
    const { zc } = (() => { const z = cols.map((_, j) => A.reduce((s, row, i) => mAdd(s, mMul(cost[basis[i]], row[j])), MV(F(0), F(0)))); return { zc: z.map((zj, j) => mAdd(zj, mMul(cost[j], F(-1)))) }; })();
    let enter = null;
    zc.forEach((x, j) => { if (mLess(x, MV(F(0), F(0))) && (enter === null || mLess(x, zc[enter]))) enter = j; });
    if (enter === null) { snapshot(null, null); break; }
    let leave = null;
    A.forEach((row, i) => { if (val(row[enter]) > 0 && (leave === null || val(div(b[i], row[enter])) < val(div(b[leave], A[leave][enter])))) leave = i; });
    snapshot(enter, leave);
    if (leave === null) throw new EngineError(`The column of ${cols[enter]} has no positive entry: the problem is unbounded.`);
    const piv = A[leave][enter];
    A[leave] = A[leave].map((x) => div(x, piv)); b[leave] = div(b[leave], piv);
    A.forEach((row, i) => { if (i === leave) return; const k = row[enter]; A[i] = row.map((x, j) => sub(x, mul(k, A[leave][j]))); b[i] = sub(b[i], mul(k, b[leave])); });
    basis[leave] = enter;
  }
  if (basis.some((j, i) => cols[j].startsWith('A') && val(b[i]) > 1e-12)) throw new EngineError('An artificial variable is still in the basis with a positive value: the problem is infeasible.');
  const x = vars.map((_, j) => { const i = basis.indexOf(j); return i >= 0 ? b[i] : F(0); });
  const zOpt = c.reduce((s, cj, j) => add(s, mul(cj, x[j])), F(0));
  const steps = [
    { title: 'Standard form', depth: 0, lines: [`\\text{${rows.some((r) => r.op !== '<=') ? 'Slack, surplus and artificial (Big-M) variables added' : 'Slack variables added'}; } ${sense === 'min' ? '\\min z = -\\max(-z)' : ''}`] },
    { title: `${tableaux.length} tableau${tableaux.length > 1 ? 'x' : ''}`, formula: '\\text{enter: most negative } z_j - c_j; \\ \\text{leave: smallest ratio } b_i/a_{ij}', depth: 0, lines: [`\\text{Optimal: } ${vars.map((v, j) => `${v} = ${tex(x[j])}`).join(', \\ ')}, \\quad z = ${tex(zOpt)}`] },
  ];
  return { mode, answer: `${vars.map((v, j) => `${v} = ${tex(x[j])}`).join(', \\ ')}, \\quad z_{\\text{${sense}}} = ${tex(zOpt)}`, tableaux, steps, notes: ['The arrow marks the leaving row; the highlighted column is the entering variable.'], verified: true };
}
