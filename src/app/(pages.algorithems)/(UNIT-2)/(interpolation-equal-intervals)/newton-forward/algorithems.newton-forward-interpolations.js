"use client";
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs, rowsToXY } from '@/app/utils/codeExport/inputs';
import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import DataPointsInput from '@/app/components/DataPointsInput';
import { fixed } from '@/app/utils/numberFormat';
import { FiPlay, FiRotateCcw, FiPlus, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

// Same look and controls as Newton backward (2026-11-03); the calculation below is unchanged.
const DEMO_ROWS = [
  { x: "1", y: "2" },
  { x: "2", y: "5" },
  { x: "3", y: "10" },
  { x: "4", y: "17" },
];
const DEMO_X = "2.5";

const tabClass = (active) => `px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
  active
    ? 'bg-black text-white dark:bg-white dark:text-black'
    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
}`;

export default function NewtonForwardInterpolations({ theme }) {
  const [vSteps, setVSteps] = useState([]);
  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [rows, setRows] = useState(DEMO_ROWS.map((r) => ({ ...r })));
  const [interpolateX, setInterpolateX] = useState(DEMO_X);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  useRecordSolve('newton-forward', 2, output, () => ({ points: rows.filter((r) => r && String(r.x ?? '').trim() !== '').length }));
  useCodeExportInputs('newton-forward', () => ({ ...rowsToXY(rows), at: interpolateX }));
  const [diffTable, setDiffTable] = useState([]);
  const [tableX, setTableX] = useState([]);
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: "",
  });
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [viewTab, setViewTab] = useState('all');

  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);
  };

  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      setRows([{ x: "", y: "" }]);
    } else {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index, type, value) => {
    const newRows = rows.map((r) => ({ ...r }));
    newRows[index][type] = value;
    setRows(newRows);
  };

  const clearResults = () => {
    setOutput("");
    setDiffTable([]);
    setTableX([]);
    setVSteps([]);
    setPolynomialSteps({ formulas: [], substituted: [], calculated: [], final: "" });
  };

  const solve = (dataRows, xText) => {
    setError("");
    clearResults();

    // Fully blank rows are ignored; a half-filled row is reported, not dropped
    const filled = dataRows
      .map((row, i) => ({ i, x: String(row.x ?? '').trim(), y: String(row.y ?? '').trim() }))
      .filter((r) => r.x !== '' || r.y !== '');
    const bad = filled.find((r) => !Number.isFinite(Number(r.x)) || !Number.isFinite(Number(r.y)) || r.x === '' || r.y === '');
    if (bad) {
      setError(`Point ${bad.i + 1} needs a number for both x and y.`);
      return;
    }
    const points = filled.map((r) => ({ x: Number(r.x), y: Number(r.y) }));
    if (points.length < 2) {
      setError("Please enter at least two data points.");
      return;
    }
    const x = Number(String(xText ?? '').trim());
    if (String(xText ?? '').trim() === '' || !Number.isFinite(x)) {
      setError("Please enter the x value to interpolate at.");
      return;
    }

    const {
      interpolatedValue,
      diffTable: computedTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps: computedVSteps,
    } = newtonForwardInterpolation(points, x);

    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs) - 5;
    const maxX = Math.max(...xs) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + (i * (maxX - minX)) / 99));

    setTableX(xs);
    setVSteps(computedVSteps);
    setDiffTable(computedTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${x}: P(${x}) = ${interpolatedValue}`,
    });
    setOutput(`P(${x}) = ${fixed(interpolatedValue, 6)}`);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    solve(rows, interpolateX);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoRows = DEMO_ROWS.map((r) => ({ ...r }));
    setRows(demoRows);
    setInterpolateX(DEMO_X);
    solve(demoRows, DEMO_X);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setRows([{ x: "", y: "" }]);
    setInterpolateX("");
    setError("");
    clearResults();
  };

  const exportData = diffTable.map((row, rowIndex) => {
    const rowObj = { x: tableX[rowIndex] };
    row.forEach((val, colIndex) => {
      rowObj[`Δ^${colIndex}Y`] = val !== undefined ? fixed(val, 4) : '';
    });
    return rowObj;
  });

  // Top row is what the formula uses: it always shows its values (0 included); lower rows hide the unused zeros
  const cell = (val, rowIndex, colIndex) => {
    if (val === undefined) return '';
    const text = fixed(val, 4);
    if (rowIndex === 0) return text === '0.0000' ? '0' : text;
    return text === '0.0000' && colIndex >= diffTable.length - rowIndex ? '' : text;
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              FORWARD INTERPOLATION LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Newton Forward Interactive Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EditorialButton variant="secondary" size="sm" onClick={handleDemo} disabled={demoInProgress}>
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton variant="outline" size="sm" onClick={handleReset}>
              <FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </EditorialButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Data Points (<InlineMath math="(x_i, y_i)" />)
              </label>
              <EditorialButton type="button" variant="outline" size="sm" onClick={handleAddRow}>
                <FiPlus className="w-3.5 h-3.5 mr-1" /> Add Point
              </EditorialButton>
            </div>

            <DataPointsInput
              rows={rows}
              onChange={handleInputChange}
              onDelete={handleDeleteRow}
              xPlaceholder="e.g. 1"
              yPlaceholder="e.g. 2"
            />
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              x values must be equally spaced (same step h). The formula starts from the first row.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="interpolateX" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Target Interpolation Point (<InlineMath math="x" />)
              </label>
              <input
                type="number"
                step="any"
                id="interpolateX"
                value={interpolateX}
                onChange={(e) => setInterpolateX(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <EditorialButton type="submit" variant="primary" size="md" className="w-full">
              <FiCheckCircle className="w-4 h-4 mr-2" /> Interpolate Value
            </EditorialButton>
          </div>
        </form>

        {error && (
          <div role="alert" className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-xl flex items-start gap-2 text-sm font-mono">
            <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        {output && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div className="min-w-0">
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Interpolated Solution
              </span>
              <span className="text-base md:text-lg font-mono font-black break-words">{output}</span>
            </div>
            <EditorialExportButton
              title="Newton Forward Interpolation Report"
              elementId="newton-forward-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {diffTable.length > 0 && (
        <div id="newton-forward-results-container" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black dark:border-neutral-700 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => setViewTab('all')} className={tabClass(viewTab === 'all')}>All Views</button>
              <button type="button" onClick={() => setViewTab('table')} className={tabClass(viewTab === 'table')}>
                <FiList className="w-3.5 h-3.5" /> Difference Table
              </button>
              <button type="button" onClick={() => setViewTab('steps')} className={tabClass(viewTab === 'steps')}>
                <FiLayers className="w-3.5 h-3.5" /> Polynomial Steps
              </button>
              <button type="button" onClick={() => setViewTab('plot')} className={tabClass(viewTab === 'plot')}>
                <FiTrendingUp className="w-3.5 h-3.5" /> Polynomial Curve
              </button>
            </div>
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Forward Difference Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      {Array.from({ length: diffTable.length }).map((_, i) => (
                        <th key={i} className="p-3 border-r border-neutral-700 dark:border-neutral-300">
                          Δ<sup>{i}</sup>Y
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {diffTable.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex === 0
                            ? 'bg-emerald-500 text-white font-bold'
                            : rowIndex % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{tableX[rowIndex]}</td>
                        {row.map((val, colIndex) => (
                          <td key={colIndex} className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">
                            {cell(val, rowIndex, colIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Green row: <InlineMath math="y_0, \Delta y_0, \Delta^2 y_0, \dots" /> used in the formula.
              </p>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Step Derivation & Polynomial Expansion
              </h4>

              {vSteps.length > 0 && (
                <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Step Parameter v Calculation:</span>
                  <div className="overflow-x-auto py-1">
                    <BlockMath math={vSteps.join(" \\quad, \\quad ")} />
                  </div>
                </div>
              )}

              {polynomialSteps.formulas.length > 0 && (
                <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">1. General Polynomial Formula:</span>
                    <div className="overflow-x-auto py-1">
                      <BlockMath math={polynomialSteps.formulas.join(" + ")} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-300 dark:border-neutral-700">
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">2. Substituted Terms:</span>
                    <div className="overflow-x-auto py-1">
                      <BlockMath math={polynomialSteps.substituted.join(" + ")} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-300 dark:border-neutral-700">
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">3. Evaluated Terms Sum:</span>
                    <div className="overflow-x-auto py-1">
                      <BlockMath math={polynomialSteps.calculated.join(" + ")} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-300 dark:border-neutral-700">
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">Final Result:</span>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 break-words">{polynomialSteps.final}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Interpolation Polynomial Plot
              </h4>
              <div id="graphCanvas" className="w-full">
                <Plot
                  points={tableX.map((x, i) => ({ x, y: diffTable[i]?.[0] }))}
                  xRange={xRange}
                  darkTheme={theme}
                  func={newtonForwardInterpolation}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Newton Forward Interpolation Calculation (unchanged apart from terms past the written list)
function newtonForwardInterpolation(points, x) {
  // Written-out terms cover 11 points; later terms follow the same pattern (no "undefined" in the formula)
  const termAfterList = (i) => `\\frac{v${Array.from({ length: i - 1 }, (_, k) => `(v-${k + 1})`).join('')}}{${i}!} \\Delta^{${i}} y_{0}`;
  const tr = [
    `y_{0}`,
    `\\frac{v}{1!} \\Delta^{1} y_{0} `,
    `\\frac{v(v-1)}{2!} \\Delta^{2} y_{0}`,
    `\\frac{v(v-1)(v-2)}{3!} \\Delta^{3} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)}{4!} \\Delta^{4} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)}{5!} \\Delta^{5} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)}{6!} \\Delta^{6} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)}{7!} \\Delta^{7} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)}{8!} \\Delta^{8} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)(v-8)}{9!} \\Delta^{9} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)(v-8)(v-9)}{10!} \\Delta^{10} y_{0}`
  ];

  const n = points.length;
  const xi = points.map((p) => p.x);
  const yi = points.map((p) => p.y);

  // Initialize the difference table as a 2D array (n x n)
  const diffTable = Array.from({ length: n }, () => Array(n).fill(0));

  // Populate the first column of the difference table with y-values
  for (let i = 0; i < n; i++) {
    diffTable[i][0] = yi[i];
  }

  // Calculate the forward differences for the rest of the table
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      diffTable[i][j] = diffTable[i + 1][j - 1] - diffTable[i][j - 1];
    }
  }

  // Calculate h (the interval size)
  const h = xi[1] - xi[0];
  let v = (x - xi[0]) / h; // Calculate the u-value

  let interpolatedValue = yi[0]; // Start with y_0
  let uProduct = 1; // To hold the product of u terms
  let factorial = 1; // To hold the factorial values

  // Steps for detailed explanation
  let stepFormulas = [`P(x) = ${tr[0]}`];
  let stepSubstituted = [`P(${x}) = ${yi[0]}`];
  let stepCalculated = [`P(${x}) = ${yi[0]}`];

  // Adding steps for calculating 'v'
  let vSteps = [];
  vSteps.push(`h = x_1 - x_0 = ${h}`);
  vSteps.push(`v = \\frac{x - x_0}{h}`);
  vSteps.push(`v = \\frac{(${x} - ${xi[0]})}{ ${h}}`);
  vSteps.push(`v = ${+v.toFixed(6)}`);

  // Building the polynomial step by step
  for (let i = 1; i < n; i++) {
    // A column of zero differences means the data is a polynomial of degree i - 1: stop here
    const column = diffTable.slice(0, n - i).map((row) => row[i]);
    if (column.every((d) => Math.abs(d) < 1e-12)) {
      vSteps.push(`\\Delta^{${i}} y = 0 \\Rightarrow \\text{stop after } \\Delta^{${i - 1}}`);
      break;
    }

    uProduct *= v - (i - 1); // Update uProduct for each term
    factorial *= i; // Calculate factorial

    // Calculate the ith term
    let term = (uProduct * diffTable[0][i]) / factorial;
    interpolatedValue += term; // Add the term to the final value

    // Formula steps
    stepFormulas.push(`${tr[i] ?? termAfterList(i)}`);

    let stepMid = [``];
    for (let ij = 2; ij <= i; ij++) {

      stepMid.push(` (${+v.toFixed(6)} - ${ij-1})`);
    }
    let stepMidString = stepMid.join(" \\times ");

    stepSubstituted.push(
      `\\frac{(${+v.toFixed(6)})${stepMidString} \\times ${diffTable[0][i].toFixed(4)}}{${i}!}`
    );
    stepCalculated.push(`(${term.toFixed(4)})`);
  }

  return {
    interpolatedValue,
    diffTable,
    stepFormulas,
    stepSubstituted,
    stepCalculated,
    vSteps,
  };
}
