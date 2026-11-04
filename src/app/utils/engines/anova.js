/**
 * Analysis of variance (ANOVA), worked with the correction-factor method used in textbooks:
 *   CF = G²/N (G = grand total, N = number of observations), SST = Σx² − CF
 *   one-way (k treatments):     SSTr = Σ Tᵢ²/nᵢ − CF, SSE = SST − SSTr; F = MSTr / MSE
 *   two-way (r rows × c columns, one value per cell):
 *                               SSR = Σ Rᵢ²/c − CF, SSC = Σ Cⱼ²/r − CF, SSE = SST − SSR − SSC
 * Each F is compared with the critical F at the chosen level (and its p-value given).
 */
import { EngineError } from '../numeric/steps';
import { readList, readNumber } from './input';
import { fCritical, fUpper } from '../criticalValues';
import { sum } from '../numeric/distributions';

const n4 = (v) => String(Number(Number(v).toFixed(4)));
const n6 = (v) => String(Number(Number(v).toPrecision(6)));

/** "12, 15, 14; 18, 20, 17" or one group per line → arrays. */
function readGroups(text, label) {
  const groups = String(text ?? '').split(/[;\n]+/).map((s) => s.trim()).filter(Boolean).map((g, i) => readList(g, `${label} ${i + 1}`, 1));
  if (groups.length < 2) throw new EngineError(`Enter at least two ${label.toLowerCase()}s, separated by semicolons (;).`);
  return groups;
}

function decide(F, df1, df2, alpha) {
  const crit = fCritical(df1, df2, alpha);
  const p = fUpper(F, df1, df2);
  return { crit, p, reject: F > crit };
}

export function solve({ kind = 'one', groups: tg, alpha: ta = '0.05' }) {
  if (!['one', 'two'].includes(kind)) throw new EngineError('Choose one-way or two-way ANOVA.');
  const alpha = readNumber(ta, 'The significance level');
  if (!(alpha > 0 && alpha < 0.5)) throw new EngineError('Use a significance level like 0.05 or 0.01.');
  const steps = [];
  const data = readGroups(tg, kind === 'one' ? 'Group' : 'Row');
  const all = data.flat();
  const N = all.length, G = sum(all), CF = (G * G) / N, SST = sum(all.map((v) => v * v)) - CF;
  steps.push({ title: 'Grand total and correction factor', formula: 'CF = \\frac{G^2}{N}', lines: [`G = ${n6(G)}, \\quad N = ${N}, \\quad CF = \\frac{${n6(G)}^2}{${N}} = ${n4(CF)}`] });
  steps.push({ title: 'Total sum of squares', formula: 'SST = \\sum x^2 - CF', lines: [`SST = ${n6(sum(all.map((v) => v * v)))} - ${n4(CF)} = ${n4(SST)}`] });
  let rows, tests;

  if (kind === 'one') {
    const k = data.length;
    const T = data.map(sum), n = data.map((g) => g.length);
    const SSTr = sum(T.map((t, i) => (t * t) / n[i])) - CF, SSE = SST - SSTr;
    const df1 = k - 1, df2 = N - k;
    if (df2 < 1) throw new EngineError('There are not enough observations: each group needs more values.');
    const MSTr = SSTr / df1, MSE = SSE / df2, F = MSTr / MSE;
    steps.push({ title: 'Between-treatment sum of squares', formula: 'SSTr = \\sum \\frac{T_i^2}{n_i} - CF', lines: [`T_i = ${T.map(n6).join(', ')}`, `SSTr = ${T.map((t, i) => `\\frac{${n6(t)}^2}{${n[i]}}`).join(' + ')} - ${n4(CF)} = ${n4(SSTr)}`] });
    steps.push({ title: 'Error (within) sum of squares', formula: 'SSE = SST - SSTr', lines: [`SSE = ${n4(SST)} - ${n4(SSTr)} = ${n4(SSE)}`] });
    const d = decide(F, df1, df2, alpha);
    steps.push({ title: 'F ratio and decision', formula: 'F = \\frac{MSTr}{MSE}', lines: [`F = \\frac{${n4(MSTr)}}{${n4(MSE)}} = ${n4(F)}`, `F_{${alpha}}(${df1}, ${df2}) = ${d.crit}, \\quad p = ${n4(d.p)}`, d.reject ? `F > F_{${alpha}}: \\text{ reject } H_0 \\text{ (the treatment means differ)}` : `F \\le F_{${alpha}}: \\text{ do not reject } H_0 \\text{ (no significant difference)}`] });
    rows = [
      { src: 'Treatments', ss: n4(SSTr), df: String(df1), ms: n4(MSTr), f: n4(F), crit: String(d.crit) },
      { src: 'Error', ss: n4(SSE), df: String(df2), ms: n4(MSE), f: '', crit: '' },
      { src: 'Total', ss: n4(SST), df: String(N - 1), ms: '', f: '', crit: '' },
    ];
    tests = [{ name: 'treatments', F, ...d, df1, df2 }];
  } else {
    const r = data.length, c = data[0].length;
    if (data.some((row) => row.length !== c)) throw new EngineError('Two-way ANOVA needs the same number of values in every row (one value per cell).');
    if (c < 2) throw new EngineError('Each row needs at least two values (one per column).');
    const R = data.map(sum), C = Array.from({ length: c }, (_, j) => sum(data.map((row) => row[j])));
    const SSR = sum(R.map((t) => t * t)) / c - CF, SSC = sum(C.map((t) => t * t)) / r - CF, SSE = SST - SSR - SSC;
    const dfR = r - 1, dfC = c - 1, dfE = (r - 1) * (c - 1);
    const MSR = SSR / dfR, MSC = SSC / dfC, MSE = SSE / dfE;
    const FR = MSR / MSE, FC = MSC / MSE;
    steps.push({ title: 'Between rows', formula: 'SSR = \\frac{\\sum R_i^2}{c} - CF', lines: [`R_i = ${R.map(n6).join(', ')}`, `SSR = ${n4(SSR)}`] });
    steps.push({ title: 'Between columns', formula: 'SSC = \\frac{\\sum C_j^2}{r} - CF', lines: [`C_j = ${C.map(n6).join(', ')}`, `SSC = ${n4(SSC)}`] });
    steps.push({ title: 'Error', formula: 'SSE = SST - SSR - SSC', lines: [`SSE = ${n4(SST)} - ${n4(SSR)} - ${n4(SSC)} = ${n4(SSE)}`] });
    const dr = decide(FR, dfR, dfE, alpha), dc = decide(FC, dfC, dfE, alpha);
    steps.push({ title: 'F ratios and decisions', lines: [
      `F_{\\text{rows}} = \\frac{${n4(MSR)}}{${n4(MSE)}} = ${n4(FR)} \\ ${dr.reject ? '>' : '\\le'} \\ ${dr.crit}: \\ \\text{${dr.reject ? 'rows differ significantly' : 'no significant difference between rows'}}`,
      `F_{\\text{columns}} = \\frac{${n4(MSC)}}{${n4(MSE)}} = ${n4(FC)} \\ ${dc.reject ? '>' : '\\le'} \\ ${dc.crit}: \\ \\text{${dc.reject ? 'columns differ significantly' : 'no significant difference between columns'}}`,
    ] });
    rows = [
      { src: 'Rows', ss: n4(SSR), df: String(dfR), ms: n4(MSR), f: n4(FR), crit: String(dr.crit) },
      { src: 'Columns', ss: n4(SSC), df: String(dfC), ms: n4(MSC), f: n4(FC), crit: String(dc.crit) },
      { src: 'Error', ss: n4(SSE), df: String(dfE), ms: n4(MSE), f: '', crit: '' },
      { src: 'Total', ss: n4(SST), df: String(N - 1), ms: '', f: '', crit: '' },
    ];
    tests = [{ name: 'rows', F: FR, ...dr, df1: dfR, df2: dfE }, { name: 'columns', F: FC, ...dc, df1: dfC, df2: dfE }];
  }

  const table = { columns: [{ key: 'src', label: 'Source' }, { key: 'ss', label: 'Sum of squares' }, { key: 'df', label: 'df' }, { key: 'ms', label: 'Mean square' }, { key: 'f', label: 'F', highlight: true }, { key: 'crit', label: `F crit (${alpha})` }], rows };
  // Check: the sums of squares add up (SST = parts)
  const parts = rows.filter((r) => r.src !== 'Total').reduce((s, r) => s + Number(r.ss), 0);
  return { kind, alpha, N, tests, steps, table, verified: Math.abs(parts - SST) < 1e-3 * Math.max(1, SST), result: tests, notes: ['H₀: all the means are equal. Reject it when F is bigger than the critical F.'], plot: null };
}
