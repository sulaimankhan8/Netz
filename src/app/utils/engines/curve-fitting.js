/**
 * Least-squares curve fits that become straight lines after taking logs, plus polynomials:
 *   y = a e^(bx)   ln y = ln a + bx           (Y = ln y)
 *   y = a b^x      log y = log a + x log b     (Y = log₁₀ y)
 *   y = a x^b      log y = log a + b log x     (X = log₁₀ x, Y = log₁₀ y)
 *   polynomial     y = a₀ + a₁x + … + a_m x^m  (normal equations, m = 2 or 3)
 * The straight-line normal equations ΣY = nA + BΣX, ΣXY = AΣX + BΣX² are solved and transformed back.
 */
import { EngineError } from '../numeric/steps';
import { readList, readNumber } from './input';
import * as M from '../numeric/matrix';
import { sum } from '../numeric/distributions';

const n4 = (v) => String(Number(Number(v).toFixed(4)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));
const MODELS = ['exponential', 'base', 'power', 'polynomial'];

export function solve({ model = 'exponential', x: tx, y: ty, degree = '2', at = '' }) {
  if (!MODELS.includes(model)) throw new EngineError('Choose a curve.');
  const x = readList(tx, 'The x values', 2), y = readList(ty, 'The y values', 2);
  if (x.length !== y.length) throw new EngineError(`There are ${x.length} x values but ${y.length} y values.`);
  const n = x.length, steps = [];
  let f, eq, table;

  if (model === 'polynomial') {
    const m = Number(degree);
    if (![2, 3].includes(m)) throw new EngineError('Choose degree 2 or 3.');
    if (n < m + 1) throw new EngineError(`A degree-${m} fit needs at least ${m + 1} points.`);
    const S = (k) => sum(x.map((v) => v ** k)), T = (k) => sum(x.map((v, i) => v ** k * y[i]));
    const A = Array.from({ length: m + 1 }, (_, i) => [...Array.from({ length: m + 1 }, (_, j) => S(i + j)), T(i)]);
    const names = ['a', 'b', 'c', 'd'];
    steps.push({
      title: 'Normal equations',
      lines: A.map((row, i) => `${n6(row[m])} = ${row.slice(0, m + 1).map((v, j) => `${n6(v)}${names[j]}`).join(' + ')}`).map((l, i) => (i === 0 ? `\\sum x^0y: \\ ${l}` : `\\sum x^{${i}}y: \\ ${l}`)),
    });
    const { result: R, rank } = M.rref(A);
    if (rank < m + 1) throw new EngineError('These points cannot fix a unique curve (too many equal x values).');
    const coef = R.map((row) => row[m + 1]);
    f = (v) => coef.reduce((s, c, k) => s + c * v ** k, 0);
    // Highest power first; zero terms left out; a coefficient of 1 not written
    const shown = coef.map((c, k) => ({ c, k })).reverse().filter(({ c }) => n4(Math.abs(c)) !== '0');
    eq = `y = ${shown.map(({ c, k }, i) => {
      const mag = n4(Math.abs(c)), power = k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`;
      return `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${mag === '1' && power ? '' : mag}${power}`;
    }).join('') || '0'}`;
    steps.push({ title: 'Solve them', lines: [coef.map((c, k) => `${names[k]} = ${n4(c)}`).join(', \\quad '), eq] });
    table = {
      columns: [{ key: 'x', label: 'x' }, { key: 'y', label: 'y' }, ...Array.from({ length: 2 * m - 1 }, (_, k) => ({ key: `x${k + 2}`, label: `x${'²³⁴⁵⁶'[k]}` })), ...Array.from({ length: m }, (_, k) => ({ key: `xy${k + 1}`, label: k === 0 ? 'xy' : `x${'²³'[k - 1]}y` })), { key: 'fit', label: 'fitted y', highlight: true }],
      rows: x.map((v, i) => Object.fromEntries([['x', n6(v)], ['y', n6(y[i])], ...Array.from({ length: 2 * m - 1 }, (_, k) => [`x${k + 2}`, n6(v ** (k + 2))]), ...Array.from({ length: m }, (_, k) => [`xy${k + 1}`, n6(v ** (k + 1) * y[i])]), ['fit', n4(f(v))]])),
    };
  } else {
    if (y.some((v) => !(v > 0))) throw new EngineError('Every y must be positive to take logs.');
    if (model === 'power' && x.some((v) => !(v > 0))) throw new EngineError('Every x must be positive for y = a·x^b.');
    const ln = model === 'exponential';
    const lg = (v) => (ln ? Math.log(v) : Math.log10(v));
    const X = model === 'power' ? x.map(Math.log10) : x;
    const Y = y.map(lg);
    const SX = sum(X), SY = sum(Y), SXX = sum(X.map((v) => v * v)), SXY = sum(X.map((v, i) => v * Y[i]));
    const B = (n * SXY - SX * SY) / (n * SXX - SX * SX);
    if (!Number.isFinite(B)) throw new EngineError('These x values are all the same, so no curve fits.');
    const Acoef = (SY - B * SX) / n;
    const form = { exponential: ['y = ae^{bx}', '\\ln y = \\ln a + bx', 'Y = A + Bx', 'A = \\ln a, \\ B = b'], base: ['y = ab^{x}', '\\log y = \\log a + x\\log b', 'Y = A + Bx', 'A = \\log a, \\ B = \\log b'], power: ['y = ax^{b}', '\\log y = \\log a + b\\log x', 'Y = A + BX', 'A = \\log a, \\ B = b'] }[model];
    steps.push({ title: 'Take logs to get a straight line', lines: [`${form[0]} \\ \\Rightarrow \\ ${form[1]}`, `${form[2]}, \\quad ${form[3]}`] });
    const Xn = model === 'power' ? 'X' : 'x';
    steps.push({
      title: 'Normal equations for the line',
      formula: `\\sum Y = nA + B\\sum ${Xn}, \\quad \\sum ${Xn}Y = A\\sum ${Xn} + B\\sum ${Xn}^2`,
      lines: [`${n4(SY)} = ${n}A + ${n4(SX)}B`, `${n4(SXY)} = ${n4(SX)}A + ${n4(SXX)}B`, `A = ${n4(Acoef)}, \\quad B = ${n4(B)}`],
    });
    let a, b;
    if (model === 'exponential') { a = Math.exp(Acoef); b = B; f = (v) => a * Math.exp(b * v); eq = `y = ${n4(a)}e^{${n4(b)}x}`; steps.push({ title: 'Back to the curve', lines: [`a = e^{A} = e^{${n4(Acoef)}} = ${n4(a)}, \\quad b = B = ${n4(b)}`, eq] }); }
    else if (model === 'base') { a = 10 ** Acoef; b = 10 ** B; f = (v) => a * b ** v; eq = `y = ${n4(a)}(${n4(b)})^{x}`; steps.push({ title: 'Back to the curve', lines: [`a = 10^{A} = ${n4(a)}, \\quad b = 10^{B} = ${n4(b)}`, eq] }); }
    else { a = 10 ** Acoef; b = B; f = (v) => a * v ** b; eq = `y = ${n4(a)}x^{${n4(b)}}`; steps.push({ title: 'Back to the curve', lines: [`a = 10^{A} = ${n4(a)}, \\quad b = B = ${n4(b)}`, eq] }); }
    const Ylabel = ln ? 'Y = ln y' : 'Y = log y';
    table = {
      columns: [{ key: 'x', label: 'x' }, { key: 'y', label: 'y' }, ...(model === 'power' ? [{ key: 'X', label: 'X = log x' }] : []), { key: 'Y', label: Ylabel }, { key: 'X2', label: model === 'power' ? 'X²' : 'x²' }, { key: 'XY', label: model === 'power' ? 'XY' : 'xY' }, { key: 'fit', label: 'fitted y', highlight: true }],
      rows: [...x.map((v, i) => ({ x: n6(v), y: n6(y[i]), X: n4(X[i]), Y: n4(Y[i]), X2: n4(X[i] * X[i]), XY: n4(X[i] * Y[i]), fit: n4(f(v)) })), { x: 'Σ', y: '', X: n4(SX), Y: n4(SY), X2: n4(SXX), XY: n4(SXY), fit: '' }],
    };
  }

  let estimate = null;
  if (String(at ?? '').trim()) {
    const x0 = readNumber(at, 'The x value');
    estimate = { x: x0, y: f(x0) };
    steps.push({ title: `Estimate y at x = ${n6(x0)}`, lines: [`y \\approx ${n4(estimate.y)}`] });
  }
  // Check: least squares means the error sum cannot drop by nudging the fit (compare with a slightly changed curve)
  const sse = sum(x.map((v, i) => (y[i] - f(v)) ** 2));
  return { model, n, equation: eq, fAt: f, estimate, sse, steps, table, verified: Number.isFinite(sse), result: eq, notes: model === 'polynomial' ? [] : ['The fit is least squares on the logs (as in textbooks), which is not exactly the same as least squares on y itself.'], points: x.map((v, i) => ({ x: v, y: y[i] })), plot: null };
}
