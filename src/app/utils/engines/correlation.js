/**
 * Correlation between two variables:
 *   Karl Pearson    r = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² Σ(y − ȳ)²), from the deviation table
 *   Spearman rank   ρ = 1 − 6(Σd² + CF) / (n(n² − 1)), with ties given average ranks and the
 *                   correction CF = Σ m(m² − 1)/12 for each group of m tied values
 * r is checked against the formula with raw sums: (nΣxy − ΣxΣy) / √((nΣx² − (Σx)²)(nΣy² − (Σy)²)).
 */
import { EngineError } from '../numeric/steps';
import { readList } from './input';
import { deviationTable, ranks, sum } from '../numeric/distributions';

const n4 = (v) => String(Number(Number(v).toFixed(4)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));

export function strength(r) {
  const a = Math.abs(r);
  const size = a >= 0.999999 ? 'perfect' : a >= 0.8 ? 'strong' : a >= 0.5 ? 'moderate' : a >= 0.2 ? 'weak' : 'very weak or no';
  return a < 1e-12 ? 'no linear correlation' : `${size} ${r > 0 ? 'positive' : 'negative'} correlation`;
}

export function readPairs(tx, ty) {
  const x = readList(tx, 'The x values', 2), y = readList(ty, 'The y values', 2);
  if (x.length !== y.length) throw new EngineError(`There are ${x.length} x values but ${y.length} y values. They must pair up.`);
  if (x.length < 3) throw new EngineError('Use at least 3 pairs of values.');
  return { x, y };
}

export function solve({ method = 'pearson', x: tx, y: ty }) {
  if (!['pearson', 'spearman'].includes(method)) throw new EngineError('Choose Karl Pearson or Spearman.');
  const { x, y } = readPairs(tx, ty);
  const n = x.length, steps = [];

  if (method === 'pearson') {
    const t = deviationTable(x, y);
    if (t.Sxx === 0 || t.Syy === 0) throw new EngineError('All the x values (or all the y values) are the same, so r is not defined.');
    const r = t.Sxy / Math.sqrt(t.Sxx * t.Syy);
    steps.push({ title: 'Means', lines: [`\\bar x = \\frac{${n6(sum(x))}}{${n}} = ${n6(t.mx)}, \\quad \\bar y = \\frac{${n6(sum(y))}}{${n}} = ${n6(t.my)}`] });
    steps.push({ title: 'Totals from the deviation table', lines: [`\\sum (x - \\bar x)^2 = ${n6(t.Sxx)}, \\ \\sum (y - \\bar y)^2 = ${n6(t.Syy)}, \\ \\sum (x - \\bar x)(y - \\bar y) = ${n6(t.Sxy)}`] });
    steps.push({ title: "Karl Pearson's coefficient", formula: 'r = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sqrt{\\sum (x - \\bar x)^2 \\sum (y - \\bar y)^2}}', lines: [`r = \\frac{${n6(t.Sxy)}}{\\sqrt{${n6(t.Sxx)} \\times ${n6(t.Syy)}}} = ${n4(r)}`, `\\text{${strength(r)}}`] });
    // Check with raw sums
    const Sx = sum(x), Sy = sum(y), Sxy = sum(x.map((v, i) => v * y[i])), Sx2 = sum(x.map((v) => v * v)), Sy2 = sum(y.map((v) => v * v));
    const r2 = (n * Sxy - Sx * Sy) / Math.sqrt((n * Sx2 - Sx * Sx) * (n * Sy2 - Sy * Sy));
    const table = {
      columns: [{ key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'dx', label: 'x − x̄' }, { key: 'dy', label: 'y − ȳ' }, { key: 'dx2', label: '(x − x̄)²' }, { key: 'dy2', label: '(y − ȳ)²' }, { key: 'dxdy', label: '(x − x̄)(y − ȳ)', highlight: true }],
      rows: [...t.rows.map((rw) => ({ x: n6(rw.x), y: n6(rw.y), dx: n4(rw.dx), dy: n4(rw.dy), dx2: n4(rw.dx2), dy2: n4(rw.dy2), dxdy: n4(rw.dxdy) })), { x: `Σ ${n6(Sx)}`, y: `Σ ${n6(Sy)}`, dx: '0', dy: '0', dx2: n4(t.Sxx), dy2: n4(t.Syy), dxdy: n4(t.Sxy) }],
    };
    return { method, n, r, rTex: n4(r), interpretation: strength(r), steps, table, verified: Math.abs(r - r2) < 1e-9, result: r, notes: [], plot: null, points: x.map((v, i) => ({ x: v, y: y[i] })) };
  }

  // Spearman
  const rx = ranks(x), ry = ranks(y);
  const d = rx.ranks.map((v, i) => v - ry.ranks[i]);
  const d2 = sum(d.map((v) => v * v));
  const cf = [...rx.ties, ...ry.ties].reduce((s, m) => s + (m * (m * m - 1)) / 12, 0);
  const rho = 1 - (6 * (d2 + cf)) / (n * (n * n - 1));
  steps.push({ title: 'Rank each variable (1 = largest; ties share the average rank)', lines: [`\\sum d^2 = ${n6(d2)}`] });
  if (cf > 0) steps.push({ title: 'Correction for tied ranks', formula: 'CF = \\sum \\frac{m(m^2 - 1)}{12}', lines: [`\\text{tie groups of size } ${[...rx.ties, ...ry.ties].join(', ')}: \\quad CF = ${n6(cf)}`] });
  steps.push({ title: "Spearman's rank correlation", formula: '\\rho = 1 - \\frac{6\\left(\\sum d^2 + CF\\right)}{n(n^2 - 1)}', lines: [`\\rho = 1 - \\frac{6(${n6(d2)}${cf ? ` + ${n6(cf)}` : ''})}{${n}(${n}^2 - 1)} = ${n4(rho)}`, `\\text{${strength(rho)}}`] });
  // Check: Pearson's r on the ranks equals ρ when there are no ties
  const rr = (() => { const t = deviationTable(rx.ranks, ry.ranks); return t.Sxy / Math.sqrt(t.Sxx * t.Syy); })();
  const table = {
    columns: [{ key: 'x', label: 'x' }, { key: 'rx', label: 'R₁' }, { key: 'y', label: 'y' }, { key: 'ry', label: 'R₂' }, { key: 'd', label: 'd = R₁ − R₂' }, { key: 'd2', label: 'd²', highlight: true }],
    rows: [...x.map((v, i) => ({ x: n6(v), rx: n6(rx.ranks[i]), y: n6(y[i]), ry: n6(ry.ranks[i]), d: n6(d[i]), d2: n6(d[i] * d[i]) })), { x: '', rx: '', y: '', ry: '', d: 'Σ', d2: n6(d2) }],
  };
  const noTies = !rx.ties.length && !ry.ties.length;
  return { method, n, r: rho, rTex: n4(rho), interpretation: strength(rho), steps, table, verified: noTies ? Math.abs(rr - rho) < 1e-9 : Math.abs(rr - rho) < 0.05, result: rho, notes: noTies ? [] : ['With tied ranks, ρ uses the correction factor; it can differ slightly from Pearson’s r calculated on the ranks.'], plot: null, points: x.map((v, i) => ({ x: v, y: y[i] })) };
}
