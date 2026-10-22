'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { parseUserFunction } from '@/app/utils/evaluateMath';
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const TrapezoidalRuleSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState('1 / (1 + x^2)');
  const [lowerLimit, setLowerLimit] = useState(0);
  const [upperLimit, setUpperLimit] = useState(1);
  const [subintervals, setSubintervals] = useState(6);

  const [result, setResult] = useState(null);
  useRecordSolve('trapezoidal', 3, result, () => ({ fn: functionInput, a: String(lowerLimit), b: String(upperLimit) }));
  useCodeExportInputs('trapezoidal', () => ({ f: functionInput, a: lowerLimit, b: upperLimit, n: subintervals }));
  const [stepsData, setStepsData] = useState([]);
  const [plotPoints, setPlotPoints] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

  const calculateTrapezoidal = (fExpr, aVal, bVal, nVal) => {
    setError('');
    const a = parseFloat(aVal);
    const b = parseFloat(bVal);
    const n = parseInt(nVal, 10);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
      setError('Please enter valid numeric limits and a positive integer for subintervals (n).');
      return;
    }
    if (a >= b) {
      setError('Lower limit (a) must be strictly less than upper limit (b).');
      return;
    }

    let f;
    try {
      f = parseUserFunction(fExpr);
      f(a);
      f(b);
    } catch (err) {
      setError('Invalid function input. Please enter a valid mathematical expression like 1 / (1 + x^2).');
      return;
    }

    const h = (b - a) / n;
    const log = [];
    log.push(`Step size h = (b - a) / n = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`);

    const points = [];
    const tableData = [];

    let sumMiddle = 0;
    let y0 = 0;
    let yn = 0;

    for (let i = 0; i <= n; i++) {
      const x_i = a + i * h;
      let y_i = 0;
      try {
        y_i = f(x_i);
      } catch (err) {
        setError(`Evaluation error at x_${i} = ${x_i.toFixed(6)}.`);
        return;
      }

      points.push({ x: x_i, y: y_i });

      let weight = 2;
      if (i === 0) {
        weight = 1;
        y0 = y_i;
      } else if (i === n) {
        weight = 1;
        yn = y_i;
      } else {
        sumMiddle += y_i;
      }

      const contribution = weight * y_i;
      tableData.push({
        index: i,
        x: x_i,
        y: y_i,
        weight,
        contribution,
      });
    }

    const integralValue = (h / 2) * (y0 + yn + 2 * sumMiddle);

    setGridLog(log);
    setStepsData(tableData);
    setPlotPoints(points);
    setResult({
      integralValue,
      h,
      y0,
      yn,
      sumMiddle,
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateTrapezoidal(functionInput, lowerLimit, upperLimit, subintervals);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput('1 / (1 + x^2)');
    setLowerLimit(0);
    setUpperLimit(1);
    setSubintervals(6);
    calculateTrapezoidal('1 / (1 + x^2)', 0, 1, 6);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput('1 / (1 + x^2)');
    setLowerLimit(0);
    setUpperLimit(1);
    setSubintervals(6);
    setResult(null);
    setStepsData([]);
    setPlotPoints([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    i: row.index,
    x_i: row.x.toFixed(6),
    'y_i = f(x_i)': row.y.toFixed(6),
    Weight: row.weight,
    'Contribution (Weight * y_i)': row.contribution.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Numerical integration calculator
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Trapezoidal Rule Interactive Engine
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

        {error && (
          <div className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Integrand Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text"
                id="function"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="e.g., 1 / (1 + x^2)"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lowerLimit" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Lower Limit (<InlineMath math="a" />)
              </label>
              <input
                type="number"
                step="any"
                id="lowerLimit"
                value={lowerLimit}
                onChange={(e) => setLowerLimit(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="upperLimit" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Upper Limit (<InlineMath math="b" />)
              </label>
              <input
                type="number"
                step="any"
                id="upperLimit"
                value={upperLimit}
                onChange={(e) => setUpperLimit(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="subintervals" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Subintervals (<InlineMath math="n" />)
              </label>
              <input
                type="number"
                id="subintervals"
                value={subintervals}
                onChange={(e) => setSubintervals(e.target.value)}
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
              <FiCheckCircle className="w-4 h-4 mr-2" /> Integrate Area
            </EditorialButton>
          </div>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Approximated Integral Area
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                I ≈ {result.integralValue.toFixed(8)}
              </span>
            </div>

            <EditorialExportButton
              title="Trapezoidal Rule Report"
              elementId="trapezoidal-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="trapezoidal-results-container" className="space-y-6">
          <SetupSteps lines={gridLog} />

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
                <FiList className="w-3.5 h-3.5" /> Grid Weights Table
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
                <FiLayers className="w-3.5 h-3.5" /> Formula Derivation
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Integrand Plot
              </button>
            </div>

            <EditorialExportButton
              title="Trapezoidal Rule Report"
              elementId="trapezoidal-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Trapezoidal Grid Evaluation Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">i</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x_i</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">y_i = f(x_i)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Weight</th>
                      <th className="p-3">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepsData.map((row) => (
                      <tr
                        key={row.index}
                        className={
                          row.index === 0 || row.index === stepsData.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : row.index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.index}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.y.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{row.weight}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.contribution.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && result && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Trapezoidal Formula Substitution
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <BlockMath math={`I = \\frac{h}{2} \\left[ (y_0 + y_n) + 2 \\sum_{i=1}^{n-1} y_i \\right]`} />
                <BlockMath math={`I = \\frac{${result.h.toFixed(6)}}{2} \\left[ (${result.y0.toFixed(6)} + ${result.yn.toFixed(6)}) + 2(${result.sumMiddle.toFixed(6)}) \\right]`} />
                <BlockMath math={`I \\approx ${result.integralValue.toFixed(8)}`} />
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Integrand Curve Plot
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot points={plotPoints} title={`Trapezoidal Rule Approximation (n = ${subintervals})`} />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TrapezoidalRuleSolver;
