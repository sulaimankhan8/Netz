"use client";
import { useRecordSolve } from '@/app/utils/activity';
import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiPlus, FiTrash2, FiCheckCircle, FiTrendingUp, FiLayers, FiList } from 'react-icons/fi';

export default function NewtonBackwardInterpolations({ theme }) {
  const [vSteps, setVSteps] = useState([]);
  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [rows, setRows] = useState([
    { x: "10", y: "0.1736" },
    { x: "20", y: "0.3420" },
    { x: "30", y: "0.5000" },
    { x: "40", y: "0.6428" },
  ]);
  const [interpolateX, setInterpolateX] = useState("38");
  const [output, setOutput] = useState("");
  useRecordSolve('newton-backward', 2, output, () => ({ points: rows.filter((r) => r && String(r.x ?? '').trim() !== '').length }));
  const [diffTable, setDiffTable] = useState([]);
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
    const newRows = [...rows];
    newRows[index][type] = value;
    setRows(newRows);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const points = rows
      .map((row) => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    if (points.length < 2) {
      alert("Please enter at least 2 valid points.");
      return;
    }

    const xToInterpolate = parseFloat(interpolateX);
    if (isNaN(xToInterpolate)) {
      alert("Please enter a valid X value to interpolate.");
      return;
    }

    const {
      interpolatedValue,
      diffTable: computedTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps: calculatedVSteps,
    } = newtonBackwardInterpolation(points, xToInterpolate);

    const minX = Math.min(...points.map(p => p.x)) - 5;
    const maxX = Math.max(...points.map(p => p.x)) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99));

    setOutput(`f(${xToInterpolate}) = ${interpolatedValue.toFixed(6)}`);
    setDiffTable(computedTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `f(${xToInterpolate}) = ${interpolatedValue.toFixed(6)}`,
    });
    setVSteps(calculatedVSteps);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoRows = [
      { x: "10", y: "0.1736" },
      { x: "20", y: "0.3420" },
      { x: "30", y: "0.5000" },
      { x: "40", y: "0.6428" },
    ];
    const demoX = "38";

    setRows(demoRows);
    setInterpolateX(demoX);

    const points = demoRows.map((row) => ({ x: parseFloat(row.x), y: parseFloat(row.y) }));
    const xToInterpolate = parseFloat(demoX);

    const {
      interpolatedValue,
      diffTable: computedTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps: calculatedVSteps,
    } = newtonBackwardInterpolation(points, xToInterpolate);

    const minX = Math.min(...points.map((p) => p.x)) - 5;
    const maxX = Math.max(...points.map((p) => p.x)) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + (i * (maxX - minX)) / 99));

    setOutput(`f(${xToInterpolate}) = ${interpolatedValue.toFixed(6)}`);
    setDiffTable(computedTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `f(${xToInterpolate}) = ${interpolatedValue.toFixed(6)}`,
    });
    setVSteps(calculatedVSteps);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setRows([{ x: "", y: "" }]);
    setInterpolateX("");
    setOutput("");
    setDiffTable([]);
    setPolynomialSteps({
      formulas: [],
      substituted: [],
      calculated: [],
      final: "",
    });
    setVSteps([]);
  };

  const xValues = rows.map((r) => r.x);

  const exportData = diffTable.map((row, rowIndex) => {
    const rowObj = { x: xValues[rowIndex] };
    row.forEach((val, colIndex) => {
      rowObj[`∇^${colIndex}Y`] = val !== undefined ? val.toFixed(4) : '';
    });
    return rowObj;
  });

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              BACKWARD INTERPOLATION LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Newton Backward Interactive Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EditorialButton
              variant="secondary"
              size="sm"
              onClick={handleDemo}
              disabled={demoInProgress}
            >
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </EditorialButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Data Points (<InlineMath math="(x_i, y_i)" />)
              </label>
              <EditorialButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
              >
                <FiPlus className="w-3.5 h-3.5 mr-1" /> Add Point
              </EditorialButton>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
              <table className="w-full text-xs md:text-sm font-mono">
                <thead>
                  <tr className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase">
                    <th className="p-3 text-center border-r border-neutral-700 dark:border-neutral-300">Point #</th>
                    <th className="p-3 text-center border-r border-neutral-700 dark:border-neutral-300">x_i</th>
                    <th className="p-3 text-center border-r border-neutral-700 dark:border-neutral-300">y_i</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-t border-neutral-200 dark:border-neutral-800">
                      <td className="p-2 text-center font-bold text-neutral-500">{index + 1}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={row.x}
                          onChange={(e) => handleInputChange(index, "x", e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold text-black dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={row.y}
                          onChange={(e) => handleInputChange(index, "y", e.target.value)}
                          placeholder="e.g. 0.1736"
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold text-black dark:text-white"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                placeholder="e.g. 38"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <EditorialButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
            >
              <FiCheckCircle className="w-4 h-4 mr-2" /> Interpolate Value
            </EditorialButton>
          </div>
        </form>

        {output && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Interpolated Solution
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                {output}
              </span>
            </div>

            <EditorialExportButton
              title="Newton Backward Interpolation Report"
              elementId="newton-backward-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {diffTable.length > 0 && (
        <div id="newton-backward-results-container" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black dark:border-neutral-700 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  viewTab === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                onClick={() => setViewTab('table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'table'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiList className="w-3.5 h-3.5" /> Difference Table
              </button>
              <button
                type="button"
                onClick={() => setViewTab('steps')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'steps'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiLayers className="w-3.5 h-3.5" /> Polynomial Steps
              </button>
              <button
                type="button"
                onClick={() => setViewTab('plot')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'plot'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiTrendingUp className="w-3.5 h-3.5" /> Polynomial Curve
              </button>
            </div>
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Backward Difference Matrix
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      {Array.from({ length: diffTable.length }).map((_, i) => (
                        <th key={i} className="p-3 border-r border-neutral-700 dark:border-neutral-300">
                          &nabla;<sup>{i}</sup>Y
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {diffTable.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex === diffTable.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : rowIndex % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{xValues[rowIndex]}</td>
                        {row.map((val, colIndex) => (
                          <td key={colIndex} className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">
                            {val !== undefined && val.toFixed(4) !== "0.0000" ? val.toFixed(4) : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{polynomialSteps.final}</p>
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
                  points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))}
                  xRange={xRange}
                  darkTheme={theme}
                  func={newtonBackwardInterpolation}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function newtonBackwardInterpolation(points, x) {
  const tr = [
    `y_{n}`,
    `\\frac{v}{1!} \\Delta^{1} y_{n-1} `,
    `\\frac{v(v+1)}{2!} \\Delta^{2} y_{n-2}`,
    `\\frac{v(v+1)(v+2)}{3!} \\Delta^{3} y_{n-3}`,
    `\\frac{v(v+1)(v+2)(v+3)}{4!} \\Delta^{4} y_{n-4}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)}{5!} \\Delta^{5} y_{n-5}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)}{6!} \\Delta^{6} y_{n-6}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)}{7!} \\Delta^{7} y_{n-7}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)}{8!} \\Delta^{8} y_{n-8}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)}{9!} \\Delta^{9} y_{n-9}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)(v+9)}{10!} \\Delta^{10} y_{n-10}`
  ];

  const n = points.length;
  const xi = points.map((p) => p.x);
  const yi = points.map((p) => p.y);

  let diffTable = Array.from({ length: n }, (_, i) => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    diffTable[i][0] = yi[i];
  }

  // Building the difference table
  for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      diffTable[i][j] = diffTable[i][j - 1] - diffTable[i - 1][j - 1];
    }
  }
  const h = xi[1] - xi[0];
  let u = (x - xi[n - 1]) / (xi[1] - xi[0]); // Calculate 'u'
  let interpolatedValue = diffTable[n - 1][0]; // Starting with the last y-value
  let uProduct = 1;
  let factorial = 1;

  let stepFormulas = [`P(x) = ${tr[0]}`]; // Step for polynomial formula
  let stepSubstituted = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Substituted step
  let stepCalculated = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Initial calculated step

  // Adding step for calculating 'v'
  let vSteps = [];
  vSteps.push(`h = x_1 - x_0 = ${h}`);
  vSteps.push(`v =\\frac{(x - x_n)}{ h}`);
  vSteps.push(`v =\\frac{(${x} - ${xi[n - 1]})}{ ${h}}`);
  vSteps.push(`v = ${+u.toFixed(6)}`);

  // Building the polynomial step by step
  for (let i = 1; i < n; i++) {
    uProduct *= u + i - 1;
    factorial *= i;
    let term = (uProduct * diffTable[n - 1][i]) / factorial;

    // Adding this term to the interpolated value
    interpolatedValue += term;

    // Formula steps
    stepFormulas.push(`${tr[i]}`);

    // Substituted steps
    let stepMid = [` `];
    for (let ij = 2; ij <= i; ij++) {
      stepMid.push(` (${+u.toFixed(6)} + ${ij-1})`);
    }
    let stepMidString = stepMid.join(" \\times ");

    stepSubstituted.push(
      `\\frac{(${+u.toFixed(6)})${stepMidString} \\times ${diffTable[n - 1][i].toFixed(4)}}{${i}!}`
    );

    // Calculated steps
    stepCalculated.push(`(${term.toFixed(6)})`);
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
