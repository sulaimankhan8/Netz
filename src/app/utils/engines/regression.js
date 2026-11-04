/**
 * The two lines of regression:
 *   y on x:  y − ȳ = b_yx (x − x̄),  b_yx = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²   (to estimate y from x)
 *   x on y:  x − x̄ = b_xy (y − ȳ),  b_xy = Σ(x − x̄)(y − ȳ) / Σ(y − ȳ)²   (to estimate x from y)
 * Also r = ±√(b_yx · b_xy) (same sign as the coefficients), and estimates at a given x or y.
 * Both lines pass through (x̄, ȳ); this and r are checked.
 */
import { EngineError } from '../numeric/steps';
import { readNumber } from './input';
import { deviationTable, sum } from '../numeric/distributions';
import { readPairs, strength } from './correlation';

const n4 = (v) => String(Number(Number(v).toFixed(4)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));
/** y = a + bx in LaTeX. */
const line = (yv, xv, b, a) => {
  const coef = n4(b) === '1' ? '' : n4(b) === '-1' ? '-' : n4(b);
  return Math.abs(a) < 5e-5 ? `${yv} = ${coef}${xv}` : `${yv} = ${coef}${xv} ${a < 0 ? '-' : '+'} ${n4(Math.abs(a))}`;
};

export function solve({ x: tx, y: ty, atX = '', atY = '' }) {
  const { x, y } = readPairs(tx, ty);
  const n = x.length;
  const t = deviationTable(x, y);
  if (t.Sxx === 0 || t.Syy === 0) throw new EngineError('All the x values (or all the y values) are the same, so there is no regression line.');
  const byx = t.Sxy / t.Sxx, bxy = t.Sxy / t.Syy;
  const ayx = t.my - byx * t.mx, axy = t.mx - bxy * t.my;
  const r = Math.sign(t.Sxy) * Math.sqrt(byx * bxy);

  const steps = [
    { title: 'Means', lines: [`\\bar x = \\frac{${n6(sum(x))}}{${n}} = ${n6(t.mx)}, \\quad \\bar y = \\frac{${n6(sum(y))}}{${n}} = ${n6(t.my)}`] },
    { title: 'Regression coefficients', formula: 'b_{yx} = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (x - \\bar x)^2}, \\ b_{xy} = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (y - \\bar y)^2}', lines: [`b_{yx} = \\frac{${n6(t.Sxy)}}{${n6(t.Sxx)}} = ${n4(byx)}, \\quad b_{xy} = \\frac{${n6(t.Sxy)}}{${n6(t.Syy)}} = ${n4(bxy)}`] },
    { title: 'Line of regression of y on x', formula: 'y - \\bar y = b_{yx}(x - \\bar x)', lines: [`y - ${n6(t.my)} = ${n4(byx)}(x - ${n6(t.mx)})`, line('y', 'x', byx, ayx)] },
    { title: 'Line of regression of x on y', formula: 'x - \\bar x = b_{xy}(y - \\bar y)', lines: [`x - ${n6(t.mx)} = ${n4(bxy)}(y - ${n6(t.my)})`, line('x', 'y', bxy, axy)] },
    { title: 'Correlation coefficient from the two slopes', formula: 'r = \\pm\\sqrt{b_{yx} \\cdot b_{xy}}', lines: [`r = ${r < 0 ? '-' : ''}\\sqrt{${n4(byx)} \\times ${n4(bxy)}} = ${n4(r)} \\quad (\\text{${strength(r)}})`] },
  ];

  let estY = null, estX = null;
  if (String(atX ?? '').trim()) {
    const x0 = readNumber(atX, 'The x value');
    estY = { x: x0, y: ayx + byx * x0 };
    steps.push({ title: `Estimate y when x = ${n6(x0)} (use y on x)`, lines: [`y = ${n4(byx)}(${n6(x0)}) ${ayx < 0 ? '-' : '+'} ${n4(Math.abs(ayx))} = ${n4(estY.y)}`] });
  }
  if (String(atY ?? '').trim()) {
    const y0 = readNumber(atY, 'The y value');
    estX = { y: y0, x: axy + bxy * y0 };
    steps.push({ title: `Estimate x when y = ${n6(y0)} (use x on y)`, lines: [`x = ${n4(bxy)}(${n6(y0)}) ${axy < 0 ? '-' : '+'} ${n4(Math.abs(axy))} = ${n4(estX.x)}`] });
  }

  const table = {
    columns: [{ key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'dx', label: 'x − x̄' }, { key: 'dy', label: 'y − ȳ' }, { key: 'dx2', label: '(x − x̄)²' }, { key: 'dy2', label: '(y − ȳ)²' }, { key: 'dxdy', label: '(x − x̄)(y − ȳ)', highlight: true }],
    rows: [...t.rows.map((rw) => ({ x: n6(rw.x), y: n6(rw.y), dx: n4(rw.dx), dy: n4(rw.dy), dx2: n4(rw.dx2), dy2: n4(rw.dy2), dxdy: n4(rw.dxdy) })), { x: `Σ ${n6(sum(x))}`, y: `Σ ${n6(sum(y))}`, dx: '0', dy: '0', dx2: n4(t.Sxx), dy2: n4(t.Syy), dxdy: n4(t.Sxy) }],
  };
  // Checks: both lines through (x̄, ȳ); r agrees with Pearson's formula
  const verified = Math.abs(ayx + byx * t.mx - t.my) < 1e-9 && Math.abs(axy + bxy * t.my - t.mx) < 1e-9 && Math.abs(r - t.Sxy / Math.sqrt(t.Sxx * t.Syy)) < 1e-9;
  return {
    n, mx: t.mx, my: t.my, byx, bxy, ayx, axy, r, yOnX: line('y', 'x', byx, ayx), xOnY: line('x', 'y', bxy, axy), estY, estX,
    steps, table, verified, result: { byx, bxy }, notes: [], plot: null, points: x.map((v, i) => ({ x: v, y: y[i] })),
  };
}
