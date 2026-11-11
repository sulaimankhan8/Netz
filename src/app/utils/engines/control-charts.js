/**
 * Control charts: the maths for /control-charts (Unit 5).
 *   x̄ and R   subgroups of size n (2–10):  CL = x̿,  UCL/LCL = x̿ ± A₂R̄;   R chart: CL = R̄, UCL = D₄R̄, LCL = D₃R̄
 *   p chart    defectives dᵢ in samples of n:  p̄ = Σd/Σn,  UCL/LCL = p̄ ± 3√(p̄(1 − p̄)/n)  (LCL at least 0)
 *   c chart    defects cᵢ per unit:  c̄,  UCL/LCL = c̄ ± 3√c̄  (LCL at least 0)
 * Points outside the limits are listed as out of control.
 */
import { EngineError } from '../numeric/steps';
import { readMatrix, readVector } from '../numeric/extras';

const r4 = (v) => Number(v.toPrecision(5));
// A₂, D₃, D₄ for n = 2 … 10
const A2 = { 2: 1.88, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 };
const D3 = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 };
const D4 = { 2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 };

function chartPlot(vals, cl, ucl, lcl) {
  const k = vals.length;
  const pts = vals.map((v, i) => ({ x: i + 1, y: v, label: '' }));
  const seg = (y) => [{ x: 0.5, y }, { x: k + 0.5, y }];
  const ys = [...vals, ucl, lcl];
  const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.15 || 1;
  return { points: pts, segments: [...pts.slice(1).map((p, i) => [pts[i], p]), seg(cl), seg(ucl), seg(lcl)], view: { x0: 0.5, x1: k + 0.5, y0: lo - pad, y1: hi + pad } };
}
const outOf = (vals, ucl, lcl) => vals.map((v, i) => (v > ucl + 1e-12 || v < lcl - 1e-12 ? i + 1 : null)).filter(Boolean);

export function solve({ chart = 'xbar', data, n: nt = '' }) {
  const steps = [];
  if (chart === 'xbar') {
    const S = readMatrix(data, 'The subgroups', 40);
    const n = S[0].length;
    if (!(n >= 2 && n <= 10)) throw new EngineError('Each subgroup (row) needs 2 to 10 measurements.');
    if (S.length < 2) throw new EngineError('Give at least two subgroups (rows).');
    const xb = S.map((r) => r.reduce((s, v) => s + v, 0) / n), R = S.map((r) => Math.max(...r) - Math.min(...r));
    const X = xb.reduce((s, v) => s + v, 0) / xb.length, Rb = R.reduce((s, v) => s + v, 0) / R.length;
    const xu = X + A2[n] * Rb, xl = X - A2[n] * Rb, ru = D4[n] * Rb, rl = D3[n] * Rb;
    const ox = outOf(xb, xu, xl), orr = outOf(R, ru, rl);
    steps.push({ title: 'Subgroup means and ranges', depth: 0, lines: [`\\bar{x}_i = ${xb.map(r4).join(', ')}`, `R_i = ${R.map(r4).join(', ')}`, `\\bar{\\bar{x}} = ${r4(X)}, \\quad \\bar{R} = ${r4(Rb)}`] });
    steps.push({ title: 'x̄ chart', formula: `\\bar{\\bar{x}} \\pm A_2\\bar{R}, \\ A_2 = ${A2[n]} \\ (n = ${n})`, depth: 0, lines: [`\\text{CL} = ${r4(X)}, \\ \\text{UCL} = ${r4(xu)}, \\ \\text{LCL} = ${r4(xl)}`, ox.length ? `\\text{out of control: subgroup } ${ox.join(', ')}` : '\\text{all means within the limits}'] });
    steps.push({ title: 'R chart', formula: `D_3\\bar{R} \\le R \\le D_4\\bar{R}, \\ D_3 = ${D3[n]}, \\ D_4 = ${D4[n]}`, depth: 0, lines: [`\\text{CL} = ${r4(Rb)}, \\ \\text{UCL} = ${r4(ru)}, \\ \\text{LCL} = ${r4(rl)}`, orr.length ? `\\text{out of control: subgroup } ${orr.join(', ')}` : '\\text{all ranges within the limits}'] });
    const inControl = !ox.length && !orr.length;
    return { chart, limits: { cl: r4(X), ucl: r4(xu), lcl: r4(xl) }, rLimits: { cl: r4(Rb), ucl: r4(ru), lcl: r4(rl) }, out: [...new Set([...ox, ...orr])], inControl, plot: chartPlot(xb, X, xu, xl), plot2: chartPlot(R, Rb, ru, rl), steps, notes: [inControl ? 'The process is in statistical control.' : 'Some points are outside the limits: look for assignable causes.'], verified: true, result: inControl };
  }
  const v = readVector(data, chart === 'p' ? 'The numbers of defectives' : 'The numbers of defects');
  if (v.length < 2) throw new EngineError('Give at least two samples.');
  if (chart === 'p') {
    const n = Number(nt);
    if (!(n > 0)) throw new EngineError('Give the sample size n.');
    const ps = v.map((d) => d / n);
    const pb = v.reduce((s, d) => s + d, 0) / (n * v.length);
    const sd = Math.sqrt((pb * (1 - pb)) / n);
    const u = pb + 3 * sd, l = Math.max(0, pb - 3 * sd);
    const o = outOf(ps, u, l);
    steps.push({ title: 'p chart', formula: '\\bar{p} \\pm 3\\sqrt{\\frac{\\bar{p}(1 - \\bar{p})}{n}}', depth: 0, lines: [`p_i = ${ps.map(r4).join(', ')}`, `\\bar{p} = ${r4(pb)}, \\ \\text{UCL} = ${r4(u)}, \\ \\text{LCL} = ${r4(l)}`, o.length ? `\\text{out of control: sample } ${o.join(', ')}` : '\\text{all within the limits}'] });
    return { chart, limits: { cl: r4(pb), ucl: r4(u), lcl: r4(l) }, out: o, inControl: !o.length, plot: chartPlot(ps, pb, u, l), steps, notes: [!o.length ? 'The process is in statistical control.' : 'Some samples are outside the limits.'], verified: true, result: !o.length };
  }
  const cb = v.reduce((s, c) => s + c, 0) / v.length;
  const u = cb + 3 * Math.sqrt(cb), l = Math.max(0, cb - 3 * Math.sqrt(cb));
  const o = outOf(v, u, l);
  steps.push({ title: 'c chart', formula: '\\bar{c} \\pm 3\\sqrt{\\bar{c}}', depth: 0, lines: [`\\bar{c} = ${r4(cb)}, \\ \\text{UCL} = ${r4(u)}, \\ \\text{LCL} = ${r4(l)}`, o.length ? `\\text{out of control: unit } ${o.join(', ')}` : '\\text{all within the limits}'] });
  return { chart, limits: { cl: r4(cb), ucl: r4(u), lcl: r4(l) }, out: o, inControl: !o.length, plot: chartPlot(v, cb, u, l), steps, notes: [!o.length ? 'The process is in statistical control.' : 'Some units are outside the limits.'], verified: true, result: !o.length };
}
