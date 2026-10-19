"use client";
import { useRecordSolve } from '@/app/utils/activity';
import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiPlus, FiTrash2, FiCheckCircle, FiTrendingUp, FiLayers, FiList } from 'react-icons/fi';

export default function NewtonDividedDifference({ theme }) {
  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [rows, setRows] = useState([
    { x: "5", y: "12" },
    { x: "7", y: "15" },
    { x: "11", y: "21" },
    { x: "13", y: "27" },
  ]);
  const [interpolateX, setInterpolateX] = useState("10");
  const [output, setOutput] = useState("");
  useRecordSolve('newton-divided', 2, output, () => ({ points: rows.filter((r) => r && String(r.x ?? '').trim() !== '').length }));
  const [diffTable, setDiffTable] = useState([]);
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: "",
  });
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

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
    } = newtonDividedDifference(points, xToInterpolate);

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
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoRows = [
      { x: "5", y: "12" },
      { x: "7", y: "15" },
      { x: "11", y: "21" },
      { x: "13", y: "27" },
    ];
    const demoX = "10";

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
    } = newtonDividedDifference(points, xToInterpolate);

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
  };

  const xValues = rows.map((r) => r.x);

  const exportData = diffTable.map((row, rowIndex) => {
    const rowObj = { x: xValues[rowIndex] };
    row.forEach((val, colIndex) => {
      rowObj[colIndex === 0 ? 'y_0' : `${colIndex}-order`] = val.toString();
    });
    return rowObj;
  });

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              UNEQUAL INTERVAL INTERPOLATION LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Newton Divided Difference Engine
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
                          placeholder="e.g. 5"
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold text-black dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={row.y}
                          onChange={(e) => handleInputChange(index, "y", e.target.value)}
                          placeholder="e.g. 12"
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
                placeholder="e.g. 10"
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
              title="Newton Divided Difference Report"
              elementId="divided-diff-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {diffTable.length > 0 && (
        <div id="divided-diff-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Divided Difference Matrix
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
                <FiLayers className="w-3.5 h-3.5" /> Polynomial Expansion
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

            <EditorialExportButton
              title="Newton Divided Difference Report"
              elementId="divided-diff-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Divided Difference Matrix Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      {Array.from({ length: diffTable.length }).map((_, i) => (
                        <th key={i} className="p-3 border-r border-neutral-700 dark:border-neutral-300">
                          {i === 0 ? <InlineMath math="y_0" /> : <InlineMath math={`${i}^{st} \\text{ order}`} />}
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
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{xValues[rowIndex]}</td>
                        {row.map((val, colIndex) => (
                          <td key={colIndex} className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-mono text-xs overflow-x-auto">
                            <InlineMath math={val.toString()} />
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

              {polynomialSteps.formulas.length > 0 && (
                <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Substituted Dividend Terms:</span>
                  <div className="overflow-x-auto py-1">
                    <BlockMath math={polynomialSteps.substituted.join(" + ")} />
                  </div>
                </div>
              )}
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Divided Difference Curve Plot
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot
                  points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))}
                  xRange={xRange}
                  darkTheme={theme}
                  func={newtonDividedDifference}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function newtonDividedDifference(points, x) {
  const n = points.length;
  const diffTable = new Array(n).fill(0).map(() => new Array(n).fill(0));
  const diffTable2 = new Array(n).fill(0).map(() => new Array(n).fill(0));
  const stepFormulas = [];
  const stepSubstituted = [];
  const stepCalculated = [];

  for (let i = 0; i < n; i++) {
    diffTable[i][0] = points[i].y;
    diffTable2[i][0] = points[i].y;
  }

  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      diffTable2[i][j] = (diffTable2[i + 1][j - 1] - diffTable2[i][j - 1]) / (points[i + j].x - points[i].x);

      diffTable[i][j] = `\\frac{(${diffTable2[i + 1][j - 1].toFixed(4)} - ${diffTable2[i][j - 1].toFixed(4)}) }{(${points[i + j].x.toFixed(2)} - ${points[i].x.toFixed(2)})} = ${diffTable2[i][j].toFixed(4)}`;
    }
  }

  const interpolatedValue = calculateNewtonPolynomial(points, diffTable2, x, stepFormulas, stepSubstituted, stepCalculated);
  return {
    interpolatedValue,
    diffTable,
    stepFormulas,
    stepSubstituted,
    stepCalculated,
    vSteps: [], // Add your steps if needed
  };
}

function calculateNewtonPolynomial(points, diffTable, x, stepFormulas, stepSubstituted, stepCalculated) {
  const n = points.length;
  let result = diffTable[0][0]; // P(0)
  let step='' ;
  let step2=`x_0` ;
  let step3=`` ;
    stepFormulas.push(`f(${x}) = y_0`);
    stepSubstituted.push(`f(${x})= ${diffTable[0][0]}`);
    stepCalculated.push(`f(${x}) =  ${diffTable[0][0]}`);
  let product = 1;
  for (let i = 1; i < n; i++) {
    product = 1;
    for (let j = 0; j < i; j++) {
      product *= (x - points[j].x);
     
    }
    step += `(x - x_${i-1})`;
    step2 += `, x_${i}`;
    step3 += `(${x} - ${points[i-1].x})`;
    result += (product * diffTable[0][i]);
    stepFormulas.push(` ${step} f [${step2}]`);
    stepSubstituted.push(`${step3} \\times ${diffTable[0][i].toFixed(4)}`);
    stepCalculated.push(` ${(diffTable[0][i] * product).toFixed(4)}`);
  }

  return result;
}
