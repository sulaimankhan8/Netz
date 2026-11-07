/**
 * Joint probability distributions (discrete): the maths for /joint-distribution (Unit 5).
 * From a table P(X = xᵢ, Y = yⱼ): marginal distributions, E[X], E[Y], E[XY], variances,
 *   Cov(X, Y) = E[XY] − E[X]E[Y],  ρ = Cov/(σₓσᵧ),  and whether X and Y are independent (P(x, y) = P(x)P(y) everywhere).
 */
import { EngineError } from '../numeric/steps';
import { math } from '../symbolic/tree';
import { exactTex } from '../symbolic/multi';

const nums = (t, label) => {
  const v = String(t ?? '').split(/[,\s]+/).filter(Boolean).map((s) => { try { return math.evaluate(s); } catch { return NaN; } });
  if (!v.length || v.some((x) => typeof x !== 'number' || !Number.isFinite(x))) throw new EngineError(`${label}: use numbers (fractions like 1/8 are fine).`);
  return v;
};
const E = (v) => exactTex(v);

export function solve({ xs, ys, table }) {
  const X = nums(xs, 'The x values'), Y = nums(ys, 'The y values');
  const rows = String(table ?? '').split(/[;\n]/).map((r) => r.trim()).filter(Boolean);
  if (rows.length !== X.length) throw new EngineError(`Give ${X.length} rows of probabilities (one per x value), separated by ;.`);
  const P = rows.map((r, i) => { const v = nums(r, `Row ${i + 1}`); if (v.length !== Y.length) throw new EngineError(`Row ${i + 1} needs ${Y.length} probabilities (one per y value).`); return v; });
  if (P.flat().some((p) => p < 0)) throw new EngineError('Probabilities can\'t be negative.');
  const tot = P.flat().reduce((s, v) => s + v, 0);
  if (Math.abs(tot - 1) > 1e-9) throw new EngineError(`The probabilities add up to ${E(tot)}, not 1.`);
  const px = P.map((r) => r.reduce((s, v) => s + v, 0));
  const py = Y.map((_, j) => P.reduce((s, r) => s + r[j], 0));
  const EX = X.reduce((s, x, i) => s + x * px[i], 0), EY = Y.reduce((s, y, j) => s + y * py[j], 0);
  const EX2 = X.reduce((s, x, i) => s + x * x * px[i], 0), EY2 = Y.reduce((s, y, j) => s + y * y * py[j], 0);
  const EXY = X.reduce((s, x, i) => s + Y.reduce((t, y, j) => t + x * y * P[i][j], 0), 0);
  const vx = EX2 - EX * EX, vy = EY2 - EY * EY, cov = EXY - EX * EY;
  const rho = vx > 0 && vy > 0 ? cov / Math.sqrt(vx * vy) : NaN;
  const indep = P.every((r, i) => r.every((p, j) => Math.abs(p - px[i] * py[j]) < 1e-12));
  const firstBad = indep ? null : (() => { for (let i = 0; i < X.length; i++) for (let j = 0; j < Y.length; j++) if (Math.abs(P[i][j] - px[i] * py[j]) > 1e-12) return { i, j }; return null; })();
  const columns = [{ key: 'x', label: 'X \\ Y', bold: true }, ...Y.map((y, j) => ({ key: `y${j}`, label: `y = ${E(y)}` })), { key: 'px', label: 'P(X = x)', highlight: true }];
  const tableRows = [...X.map((x, i) => ({ x: `x = ${E(x)}`, ...Object.fromEntries(P[i].map((p, j) => [`y${j}`, E(p)])), px: E(px[i]) })), { x: 'P(Y = y)', ...Object.fromEntries(py.map((p, j) => [`y${j}`, E(p)])), px: '1' }];
  const steps = [
    { title: 'Marginal distributions', formula: 'P(X = x) = \\sum_y P(x, y)', depth: 0, lines: [`P(X): ${px.map(E).join(', ')}, \\qquad P(Y): ${py.map(E).join(', ')}`] },
    { title: 'Expectations', depth: 0, lines: [`E[X] = ${E(EX)}, \\quad E[Y] = ${E(EY)}, \\quad E[XY] = \\sum xy\\,P(x, y) = ${E(EXY)}`] },
    { title: 'Variances', formula: 'V(X) = E[X^2] - E[X]^2', depth: 0, lines: [`V(X) = ${E(EX2)} - (${E(EX)})^2 = ${E(vx)}, \\quad V(Y) = ${E(EY2)} - (${E(EY)})^2 = ${E(vy)}`] },
    { title: 'Covariance and correlation', formula: '\\text{Cov} = E[XY] - E[X]E[Y], \\ \\rho = \\frac{\\text{Cov}}{\\sigma_X\\sigma_Y}', depth: 0, lines: [`\\text{Cov}(X, Y) = ${E(EXY)} - (${E(EX)})(${E(EY)}) = ${E(cov)}`, Number.isFinite(rho) ? `\\rho = \\frac{${E(cov)}}{\\sqrt{${E(vx)}\\cdot${E(vy)}}} = ${E(rho)}` : '\\rho \\text{ is undefined (a variance is 0)}'] },
    { title: indep ? 'Independent' : 'Not independent', depth: 0, lines: [indep ? 'P(x, y) = P(x)P(y) \\text{ for every cell}' : `P(X = ${E(X[firstBad.i])}, Y = ${E(Y[firstBad.j])}) = ${E(P[firstBad.i][firstBad.j])} \\neq ${E(px[firstBad.i])} \\times ${E(py[firstBad.j])}`] },
  ];
  return { EX: E(EX), EY: E(EY), cov: E(cov), rho: Number.isFinite(rho) ? E(rho) : 'undefined', indep, columns, rows: tableRows, steps, notes: indep ? [] : ['Cov = 0 does not by itself mean independent; independence needs every cell to factor.'], verified: true };
}
