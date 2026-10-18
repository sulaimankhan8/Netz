'use client';

import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton, EditorialStepViewer } from '@/app/components/editorial';
import { FiPlus, FiTrash2, FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

export default function GaussForwardInterpolation({ theme }) {
  const [vSteps, setVSteps] = useState([]);
  const [xRange, setXRange] = useState([]);
  const [inline, setInline] = useState(false);
  const [rows, setRows] = useState([
    { x: "2.5", y: "24.145" },
    { x: "3.0", y: "22.043" },
    { x: "3.5", y: "20.225" },
    { x: "4.0", y: "18.644" },
    { x: "4.5", y: "17.262" },
    { x: "5.0", y: "16.047" }
  ]);
  const [interpolateX, setInterpolateX] = useState("3.75");
  const [output, setOutput] = useState("");
  const [diffTable, setDiffTable] = useState([]);
  const [mid, setMid] = useState(0);
  const [interpolatedValue, setInterpolatedValue] = useState(null);
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: "",
  });
  const [demoInProgress, setDemoInProgress] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.length > 1 ? rows.filter((_, i) => i !== index) : [{ x: "", y: "" }];
    setRows(newRows);
  };

  const handleReset = () => {
    setRows([
      { x: "2.5", y: "24.145" },
      { x: "3.0", y: "22.043" },
      { x: "3.5", y: "20.225" },
      { x: "4.0", y: "18.644" },
      { x: "4.5", y: "17.262" },
      { x: "5.0", y: "16.047" }
    ]);
    setInterpolateX("3.75");
    setOutput("");
    setDiffTable([]);
    setVSteps([]);
    setInterpolatedValue(null);
    setPolynomialSteps({
      formulas: [],
      substituted: [],
      calculated: [],
      final: "",
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const xValues = rows.map((row) => parseFloat(row.x));
    const yValues = rows.map((row) => parseFloat(row.y));
    const x = parseFloat(interpolateX);

    if (xValues.length < 2 || yValues.length < 2 || isNaN(x)) {
      setOutput("Please enter at least two valid data points and a target X value.");
      return;
    }

    const points = xValues.map((xi, i) => ({ x: xi, y: yValues[i] }));
    const midp = midPoint(points, x);
    setMid(midp);

    const {
      interpolatedValue: interpVal,
      diffTable: dTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps: stepsV,
    } = gaussianFowardInterpolation(points, x, midp);

    const minX = Math.min(...xValues) - 1;
    const maxX = Math.max(...xValues) + 1;
    setXRange(
      Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99)
    );

    setVSteps(stepsV);
    setDiffTable(dTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${x}: P(${x}) = ${interpVal.toFixed(6)}`,
    });
    setOutput(`Interpolated value at x = ${x}: P(${x}) = ${interpVal.toFixed(6)}`);
    setInterpolatedValue(interpVal);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoX = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    const demoY = [24.145, 22.043, 20.225, 18.644, 17.262, 16.047];
    const demoInterpolateX = 3.75;

    const newRows = demoX.map((val, idx) => ({ x: String(val), y: String(demoY[idx]) }));
    setRows(newRows);
    setInterpolateX(String(demoInterpolateX));

    const points = demoX.map((xi, i) => ({ x: xi, y: demoY[i] }));
    const midp = midPoint(points, demoInterpolateX);
    setMid(midp);

    const {
      interpolatedValue: interpVal,
      diffTable: dTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps: stepsV,
    } = gaussianFowardInterpolation(points, demoInterpolateX, midp);

    const minX = Math.min(...demoX) - 1;
    const maxX = Math.max(...demoX) + 1;
    setXRange(
      Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99)
    );

    setVSteps(stepsV);
    setDiffTable(dTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${demoInterpolateX}: P(${demoInterpolateX}) = ${interpVal.toFixed(6)}`,
    });
    setOutput(`Interpolated value at x = ${demoInterpolateX}: P(${demoInterpolateX}) = ${interpVal.toFixed(6)}`);
    setInterpolatedValue(interpVal);
    setDemoInProgress(false);
  };

  // Convert difference table to JSON/CSV export format
  const exportData = diffTable.map((row, rIdx) => {
    const item = { x: rows[rIdx]?.x || '', p: (parseFloat(rows[rIdx]?.x) - mid).toFixed(4) };
    row.forEach((val, cIdx) => {
      item[`Δ^${cIdx}Y`] = val !== undefined ? val.toFixed(4) : '';
    });
    return item;
  });

  return (
    <div className="w-full space-y-6">
      {/* Primary Calculator Container */}
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        {/* Header Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              CENTRAL DIFFERENCE INTERPOLATOR
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Gauss Forward Calculation Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EditorialButton
              variant="secondary"
              size="sm"
              onClick={handleDemo}
              disabled={demoInProgress}
            >
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Load Example Preset
            </EditorialButton>
            <EditorialButton
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Inputs
            </EditorialButton>
          </div>
        </div>

        {/* Input Table Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Data Points (<InlineMath math="x_i, y_i" />)
              </label>
              <EditorialButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
              >
                <FiPlus className="w-3.5 h-3.5 mr-1" /> Add Point Row
              </EditorialButton>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
              <table className="w-full text-sm font-mono text-left">
                <thead>
                  <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold text-xs">
                    <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Point #</th>
                    <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">X Value</th>
                    <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Y Value = f(X)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {rows.map((row, index) => (
                    <tr key={index} className="bg-white dark:bg-neutral-900">
                      <td className="p-3 font-bold text-neutral-500 border-r border-neutral-200 dark:border-neutral-800">
                        P{index + 1}
                      </td>
                      <td className="p-2 border-r border-neutral-200 dark:border-neutral-800">
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 2.5"
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                          value={row.x}
                          onChange={(e) => handleInputChange(index, "x", e.target.value)}
                          required
                        />
                      </td>
                      <td className="p-2 border-r border-neutral-200 dark:border-neutral-800">
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 24.145"
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                          value={row.y}
                          onChange={(e) => handleInputChange(index, "y", e.target.value)}
                          required
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Row"
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
                Target Interpolation Point (<InlineMath math="x_{target}" />)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 3.75"
                id="interpolateX"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                value={interpolateX}
                onChange={(e) => setInterpolateX(e.target.value)}
                required
              />
            </div>

            <EditorialButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
            >
              <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Interpolation
            </EditorialButton>
          </div>
        </form>

        {/* Interpolated Output Banner */}
        {interpolatedValue !== null && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Interpolated Result at x = {interpolateX}
              </span>
              <span className="text-xl md:text-2xl font-mono font-black">
                P({interpolateX}) = {interpolatedValue.toFixed(6)}
              </span>
            </div>

            <EditorialExportButton
              title="Gauss Forward Interpolation Report"
              elementId="gauss-forward-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Results & Visualizer Tabbed Display */}
      {diffTable.length > 0 && (
        <div id="gauss-forward-results-container" className="space-y-6">
          
          {/* Sub-navigation Tabs */}
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
                <FiLayers className="w-3.5 h-3.5" /> Derivation Steps
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Curve Plot
              </button>
            </div>

            <EditorialExportButton
              title="Gauss Forward Interpolation Report"
              elementId="gauss-forward-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {/* Central Difference Table View */}
          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Gauss Forward Central Difference Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">X</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">p</th>
                      {Array.from({ length: diffTable.length }).map((_, i) => (
                        <th key={i} className="p-3 border-r border-neutral-700 dark:border-neutral-300 last:border-r-0">
                          Δ<sup>{i}</sup>Y
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {diffTable.map((row, rowIndex) => {
                      const xVal = parseFloat(rows[rowIndex]?.x || 0);
                      const isMidpointRow = xVal === mid;
                      return (
                        <tr
                          key={rowIndex}
                          className={
                            isMidpointRow
                              ? 'bg-amber-100 dark:bg-amber-950/60 font-bold text-amber-900 dark:text-amber-200'
                              : rowIndex % 2 === 0
                              ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                              : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                          }
                        >
                          <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{xVal}</td>
                          <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{(xVal - mid).toFixed(2)}</td>
                          {row.map((value, colIndex) => (
                            <td key={colIndex} className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 last:border-r-0">
                              {value !== undefined ? value.toFixed(4) : ''}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Derivation Steps View */}
          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Parameter & Polynomial Derivation
              </h4>

              {vSteps.length > 0 && (
                <div className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Central Parameter (p) Calculation:</span>
                  <div className="overflow-x-auto text-center py-2">
                    <BlockMath math={vSteps.join(" \\quad, \\quad ")} />
                  </div>
                </div>
              )}

              {polynomialSteps.formulas.length > 0 && (
                <div className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-4">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">Substituted Gauss Forward Series:</span>
                    <div className="overflow-x-auto text-center py-2">
                      <BlockMath math={polynomialSteps.substituted.join(" + ")} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-300 dark:border-neutral-700">
                    <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-1">Evaluated Term Sum:</span>
                    <div className="overflow-x-auto text-center py-2 font-mono text-sm font-bold">
                      {polynomialSteps.calculated.join(" + ")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Curve Plot View */}
          {(viewTab === 'all' || viewTab === 'plot') && xRange.length > 0 && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Interpolated Polynomial Curve
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot
                  points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))}
                  xRange={xRange}
                  darkTheme={theme}
                  func={gaussianFowardInterpolation}
                  helpfunc={midPoint}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function gaussianFowardInterpolation(points, x ,mid) {
    const tr = [
        `y_0`,
        `\\frac{p}{1!} \\Delta y_0`,
        `\\frac{p(p-1)}{2!} \\Delta^2 y_{-1}`,
        `\\frac{(p+1)p(p-1)}{3!} \\Delta^3 y_{-1}`,
        `\\frac{(p+1)p(p-1)(p-2)}{4!} \\Delta^4 y_{-2}`,
        `\\frac{(p+2)(p+1)p(p-1)(p-2)}{5!} \\Delta^5 y_{-2}`,
        `\\frac{(p+2)(p+1)p(p-1)(p-2)(p-3)}{6!} \\Delta^6 y_{-3}`,
        `\\frac{(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)}{7!} \\Delta^7 y_{-3}`,
        `\\frac{(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)}{8!} \\Delta^8 y_{-4}`,
        `\\frac{(p+4)(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)}{9!} \\Delta^9 y_{-4}`,
        `\\frac{(p+4)(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)(p-5)}{10!} \\Delta^{10} y_{-5}`
    ];

    
   
    const n = points.length;
    const xi = points.map((p) => p.x);
    const yi = points.map((p) => p.y);
    const closestMid = xi.reduce((prev, curr) => (Math.abs(curr - mid) < Math.abs(prev - mid) ? curr : prev));
    const midpoint = xi.indexOf(closestMid);
    const diffTable2 = Array.from({ length: n }, () => Array(n).fill(0));
    const diffTable = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        diffTable2[i][0] = yi[i];
        diffTable[i][0] = yi[i];
      }
    
    for (let j = 1; j < n; j++) {
        let start = 0;
        for (let i = start; i < n - j+start; i++ ) {
          diffTable2[i][j] = (diffTable2[i + 1][j - 1] - diffTable2[i][j - 1]) ;
         
          
        }
      }

    for (let j = 1; j < n; j++) {
        let start = Math.floor(j/2),k=0;
        for (let i = start; i < n - j+start; i++ ,k++) {
          diffTable[i][j] =  diffTable2[k][j];
        }
      }
    
    const h = xi[1] - xi[0];
    let p = (x - mid) / h; 
    
    let interpolatedValue = yi[midpoint]; 
    let uProduct ; 
    let factorial = 1; 

    let stepFormulas = [`P(x) = ${tr[0]}`];
    let stepSubstituted = [`P(${x}) = ${yi[midpoint]}`];
    let stepCalculated = [`P(${x}) = ${yi[midpoint]}`];

    let vSteps = [];
    vSteps.push(`h = x_1 - x_0 = ${h}`);
    vSteps.push(`p = \\frac{x - x_0}{h}`);
    vSteps.push(`p = \\frac{(${x} - ${mid})}{ ${h}}`);
    vSteps.push(`p = ${+p.toFixed(6)}`);


    for (let i = 1; i < n; i++) {

        // Δⁱy is needed at row midpoint - floor(i / 2); stop once the table has no such difference
        const k = midpoint - Math.floor(i / 2);
        if (k < 0 || k >= n - i) {
            vSteps.push(`\\Delta^{${i}} y_{${k - midpoint}} \\text{ is outside the table} \\Rightarrow \\text{stop after } ${i - 1} \\text{ differences}`);
            break;
        }

        uProduct = p; 
        for (let ij = 2; ij <= i; ij++) {
            if (ij % 2 === 0) {
                uProduct *= p - Math.floor(ij / 2);
            } else {
                uProduct *= p + Math.floor(ij / 2);
            }

        }
       
        
        factorial *= i; 
       
        let term = (uProduct * diffTable[midpoint][i]) / factorial;
       
        interpolatedValue += term;
       
        stepCalculated.push(`(${term.toFixed(4)})`);
        stepFormulas.push(`${tr[i]}`);

        let stepMid = [` `];
        let stepMidr = [` `];

        for (let ij = 2; ij <= i; ij++) {
            if (ij%2===0){
          stepMid.push(` (${p} - ${Math.floor((ij)/2)})`);}
          else{
          stepMidr.push(` (${p} + ${Math.floor((ij)/2)})`);}
        }

        let stepMidString = stepMid.join(" \\times ");    
        let stepMidStringr = stepMidr.slice(1).join(" \\times "); 
        if(stepMidStringr)   
        stepMidStringr += " \\times ";
        stepSubstituted.push(
            `\\frac{(${stepMidStringr}${+p.toFixed(6)}${stepMidString}) \\times ${diffTable[midpoint][i].toFixed(4)}}{${factorial}}`
        );
        
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
 
  
  
  function midPoint(points, x) {
    const xi = points.map((p) => p.x);
  
    if (x < xi[0]) {
      return xi[0];
    }
    if (x > xi[xi.length - 1]) {
      return xi[xi.length - 1];
    }
  
    let p = -1;
    for (let i = xi.length - 1; i >= 0; i--) {
      if (xi[i] <= x) {
        p = i;
        break;
      }
    }
   
    return xi[p];
  }
  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };