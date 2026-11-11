/**
 * Linear transformations: the maths for /linear-transformations (Unit 8).
 *   T: Rⁿ → Rᵐ given by its matrix, or by a formula T(x, y, z) = (x + y, y − z) (the matrix has T(eⱼ) as column j).
 *   kernel  = null space of A (basis from the free variables of the RREF);  image = column space (the pivot columns)
 *   rank + nullity = n (rank–nullity theorem); one-to-one when the kernel is {0}, onto when rank = m.
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { readMatrix } from '../numeric/extras';
import { rref } from '../numeric/matrix';
import { nullSpace } from '../numeric/eigen';
import { toFraction } from '../numeric/fraction';

const fx = (v) => { if (Math.abs(v) < 1e-12) return '0'; const f = toFraction(v, 10000, 1e-10); return f ? (f.d === 1 ? String(f.n) : `\\frac{${f.n}}{${f.d}}`) : String(Number(v.toPrecision(6))); };
const mtex = (M) => `\\begin{bmatrix} ${M.map((r) => r.map(fx).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
const vtex = (v) => `\\begin{pmatrix} ${v.map(fx).join(' \\\\ ')} \\end{pmatrix}`;

/** "T(x, y, z) = (x + y, y - z)" → matrix */
function fromFormula(text) {
  const m = String(text ?? '').replace(/[−–]/g, '-').match(/^\s*T\s*\(([^)]*)\)\s*=\s*\((.*)\)\s*$/);
  if (!m) throw new EngineError('Write it like T(x, y, z) = (x + y, y - z).');
  const vars = m[1].split(',').map((s) => s.trim()).filter(Boolean);
  if (!vars.length || vars.some((v) => !/^[a-z]\w*$/i.test(v))) throw new EngineError('Name the variables, like T(x, y).');
  const comps = m[2].split(',').map((s) => s.trim());
  const nodes = comps.map((c) => { try { return math.parse(c.replace(/(\d)\s*([a-z])/gi, '$1*$2')); } catch { throw new EngineError(`Could not read "${c}".`); } });
  const at = (pt) => nodes.map((nd) => nd.evaluate(Object.fromEntries(vars.map((v, i) => [v, pt[i]]))));
  const zero = at(vars.map(() => 0));
  if (zero.some((v) => Math.abs(v) > 1e-12)) throw new EngineError('T(0) is not 0, so T is not linear.');
  const cols = vars.map((_, j) => at(vars.map((__, i) => (i === j ? 1 : 0))));
  const A = comps.map((_, i) => cols.map((c) => c[i]));
  // linear? T(u + v) = T(u) + T(v) at a test pair
  const u = vars.map((_, i) => 0.7 + i), w = vars.map((_, i) => 1.3 - 0.4 * i);
  const lhs = at(u.map((v, i) => 2 * v + 3 * w[i])), rhs = at(u).map((v, i) => 2 * v + 3 * at(w)[i]);
  if (lhs.some((v, i) => Math.abs(v - rhs[i]) > 1e-9)) throw new EngineError('T is not linear (T(2u + 3v) ≠ 2T(u) + 3T(v)).');
  return { A, vars };
}

export function solve({ mode = 'matrix', A: At = '', formula = '' }) {
  const steps = [];
  let A;
  if (mode === 'formula') {
    const r = fromFormula(formula);
    A = r.A;
    steps.push({ title: 'Matrix of T', formula: 'A = [\\,T(e_1)\\ \\cdots\\ T(e_n)\\,]', depth: 0, lines: [`A = ${mtex(A)}`] });
  } else {
    A = readMatrix(At, 'A', 6);
    steps.push({ title: 'The matrix', depth: 0, lines: [`A = ${mtex(A)}`] });
  }
  const m = A.length, n = A[0].length;
  const R = rref(A);
  steps.push({ title: 'Reduced row echelon form', depth: 0, lines: [`${mtex(R.result)}`, `\\text{pivot columns: } ${R.pivots.map((p) => p + 1).join(', ') || '\\text{none}'}`] });
  const ker = nullSpace(A);
  const img = R.pivots.map((p) => A.map((r) => r[p]));
  steps.push({ title: 'Kernel', formula: '\\ker T = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}', depth: 0, lines: [ker.length ? `\\ker T = \\operatorname{span}\\left\\{${ker.map(vtex).join(',\\ ')}\\right\\}` : '\\ker T = \\{\\mathbf{0}\\}', `\\text{nullity} = ${ker.length}`] });
  steps.push({ title: 'Image (column space)', formula: '\\text{the pivot columns of } A', depth: 0, lines: [img.length ? `\\operatorname{Im} T = \\operatorname{span}\\left\\{${img.map(vtex).join(',\\ ')}\\right\\}` : '\\operatorname{Im} T = \\{\\mathbf{0}\\}', `\\text{rank} = ${R.rank}`] });
  steps.push({ title: 'Rank–nullity', formula: '\\text{rank} + \\text{nullity} = n', depth: 0, lines: [`${R.rank} + ${ker.length} = ${n}`] });
  const oneToOne = ker.length === 0, onto = R.rank === m;
  return { rank: R.rank, nullity: ker.length, kernel: ker.map(vtex), image: img.map(vtex), oneToOne, onto, steps, notes: [`T is ${oneToOne ? '' : 'not '}one-to-one and ${onto ? '' : 'not '}onto${oneToOne && onto ? ' (an isomorphism)' : ''}.`], verified: R.rank + ker.length === n, result: [R.rank, ker.length] };
}
