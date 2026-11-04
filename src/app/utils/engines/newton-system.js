/**
 * Newton's method for a system of 2 or 3 nonlinear equations f₁ = 0, f₂ = 0 (, f₃ = 0):
 *   X_{n+1} = X_n + Δ, where J(X_n) Δ = −F(X_n) and J is the Jacobian matrix of partial derivatives.
 * The Jacobian is built symbolically and shown; the first iteration is worked in full, the rest in a table.
 * Stops when every |Δ| is below the tolerance (or after 30 iterations, saying it did not converge).
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { math, parse, variablesOf, tex, polish, bestForm } from '../symbolic/tree';

const n6 = (v) => String(Number(Number(v).toPrecision(8)));
const n4 = (v) => (Math.abs(v) < 1e-4 && v !== 0 ? Number(v).toExponential(3) : String(Number(Number(v).toFixed(6))));

/** Solve the small linear system M Δ = r by Gaussian elimination with partial pivoting; null if singular. */
function solveSmall(M, r) {
  const n = r.length;
  const A = M.map((row, i) => [...row, r[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    if (Math.abs(A[p][c]) < 1e-14) return null;
    [A[c], A[p]] = [A[p], A[c]];
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const k = A[i][c] / A[c][c];
      for (let j = c; j <= n; j++) A[i][j] -= k * A[c][j];
    }
  }
  return A.map((row, i) => row[n] / row[i]);
}

export function solve({ f1 = '', f2 = '', f3 = '', x0 = '', y0 = '', z0 = '', tol: tt = '0.0001' }) {
  const texts = [f1, f2, f3].map((s) => String(s ?? '').trim()).filter(Boolean);
  if (texts.length < 2) throw new EngineError('Enter at least two equations.');
  const eqs = texts.map((s, i) => {
    // "x^2 + y^2 = 4" means x² + y² − 4 = 0
    const parts = s.split('=');
    if (parts.length > 2) throw new EngineError(`Equation ${i + 1} has more than one = sign.`);
    return parts.length === 2 ? parse(`(${parts[0]}) - (${parts[1]})`, `Equation ${i + 1}`) : parse(s, `Equation ${i + 1}`);
  });
  const n = eqs.length;
  const names = ['x', 'y', 'z'].slice(0, n);
  const used = new Set(eqs.flatMap((e) => [...variablesOf(e)]));
  const extra = [...used].filter((v) => !names.includes(v));
  if (extra.length) throw new EngineError(`With ${n} equations use only ${names.join(', ')} (this also uses ${extra.join(', ')}).`);
  const tol = readNumber(tt, 'The tolerance');
  if (!(tol > 0)) throw new EngineError('The tolerance must be more than 0.');
  let X = [x0, y0, z0].slice(0, n).map((t, i) => readNumber(t, `The starting ${names[i]}₀`));

  // Jacobian J[i][j] = ∂fᵢ/∂xⱼ
  const J = eqs.map((e) => names.map((v) => bestForm(math.derivative(e, v))));
  const scope = (P) => Object.fromEntries(names.map((v, i) => [v, P[i]]));
  const F = (P) => eqs.map((e) => { const r = e.evaluate(scope(P)); if (typeof r !== 'number' || !Number.isFinite(r)) throw new EngineError(`The equations are not defined at (${P.map(n6).join(', ')}). Try another starting point.`); return r; });
  const JA = (P) => J.map((row) => row.map((d) => d.evaluate(scope(P))));

  const steps = [
    { title: 'Write each equation as f = 0', lines: eqs.map((e, i) => `f_{${i + 1}}(${names.join(', ')}) = ${tex(polish(e)).trim()}`) },
    { title: 'The Jacobian matrix', formula: 'J = \\left[\\frac{\\partial f_i}{\\partial x_j}\\right]', lines: [`J = \\begin{bmatrix} ${J.map((row) => row.map((d) => tex(polish(d)).trim()).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`] },
  ];
  const rows = [];
  let converged = false, Fx;
  for (let k = 0; k < 30; k++) {
    Fx = F(X);
    const Jx = JA(X);
    const delta = solveSmall(Jx, Fx.map((v) => -v));
    if (!delta) throw new EngineError(`The Jacobian is singular at (${X.map(n6).join(', ')}) (its determinant is 0). Try another starting point.`);
    if (k === 0) {
      steps.push({
        title: 'Iteration 1 in full',
        formula: 'J(X_0)\\,\\Delta = -F(X_0), \\quad X_1 = X_0 + \\Delta',
        lines: [
          `X_0 = (${X.map(n6).join(', ')}), \\quad F(X_0) = (${Fx.map(n6).join(', ')})`,
          `J(X_0) = \\begin{bmatrix} ${Jx.map((row) => row.map(n6).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`,
          `\\Delta = (${delta.map(n6).join(', ')}) \\Rightarrow X_1 = (${X.map((v, i) => n6(v + delta[i])).join(', ')})`,
        ],
      });
    }
    const next = X.map((v, i) => v + delta[i]);
    const step = Math.max(...delta.map(Math.abs));
    rows.push(Object.fromEntries([['k', String(k + 1)], ...names.map((v, i) => [v, n6(next[i])]), ...Fx.map((v, i) => [`f${i + 1}`, n4(v)]), ['d', n4(step)]]));
    X = next;
    if (!X.every(Number.isFinite) || Math.max(...X.map(Math.abs)) > 1e12) throw new EngineError('The iterations are running away to infinity: Newton’s method does not converge from this start. Try a point closer to the solution.');
    if (step < tol) { converged = true; break; }
  }
  Fx = F(X);
  const table = { columns: [{ key: 'k', label: 'n' }, ...names.map((v) => ({ key: v, label: `${v}ₙ`, highlight: true })), ...Fx.map((_, i) => ({ key: `f${i + 1}`, label: `f${'₁₂₃'[i]} (before)` })), { key: 'd', label: 'max |Δ|' }], rows };
  steps.push({
    title: converged ? `Converged after ${rows.length} iterations` : 'Did not converge in 30 iterations',
    lines: [`(${names.join(', ')}) = (${X.map(n6).join(', ')})`, `F = (${Fx.map(n4).join(', ')})`],
  });
  return { n, names, solution: X, converged, iterations: rows.length, residual: Math.max(...Fx.map(Math.abs)), steps, table, verified: converged && Math.max(...Fx.map(Math.abs)) < 1e-6, result: X, notes: converged ? [] : ['Newton’s method needs a starting point close enough to a solution. Try another start.'], plot: null };
}
