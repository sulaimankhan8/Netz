'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

// "+ 1.3300x" or "- 1.3300x", so equations never print "+ -"
const signedTerm = (value, variable) => `${value < 0 ? '-' : '+'} ${Math.abs(value).toFixed(4)}${variable}`;

const StraightLineSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [xValuesInput, setXValuesInput] = useState('0, 1, 2, 3, 4');
  const [yValuesInput, setYValuesInput] = useState('1, 1.8, 3.3, 4.5, 6.3');

  const [result, setResult] = useState(null);
  useRecordSolve('straight-line', 5, result);
  useCodeExportInputs('straight-line', () => ({ x: xValuesInput, y: yValuesInput }));
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

  const calculateLinearFit = (xStr, yStr) => {
    setError('');
    setResult(null);
    setStepsData([]);

    const xArr = xStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const yArr = yStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (xArr.length !== yArr.length || xArr.length < 2) {
      setError('Please enter equal numbers of numeric x and y values (at least 2 points).');
      return;
    }

    const n = xArr.length;
    const log = [];
    log.push(`Sample Data Count n = ${n}`);

    let sumX = 0, sumY = 0, sumX2 = 0, sumXY = 0;
    const table = [];

    for (let i = 0; i < n; i++) {
      const x = xArr[i];
      const y = yArr[i];
      const x2 = x * x;
      const xy = x * y;

      sumX += x;
      sumY += y;
      sumX2 += x2;
      sumXY += xy;

      table.push({ index: i + 1, x, y, x2, xy });
    }

    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
      setError('System matrix is singular or degenerate (all x values might be identical).');
      return;
    }

    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY * sumX2 - sumX * sumXY) / denom;

    log.push(`Sum X = ${sumX.toFixed(4)}, Sum Y = ${sumY.toFixed(4)}`);
    log.push(`Sum X^2 = ${sumX2.toFixed(4)}, Sum XY = ${sumXY.toFixed(4)}`);
    log.push(`Intercept a = ${b.toFixed(4)}, Slope b = ${a.toFixed(4)} (line y = a + bx)`);

    setGridLog(log);
    setStepsData(table);
    setResult({ n, sumX, sumY, sumX2, sumXY, denom, a, b });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateLinearFit(xValuesInput, yValuesInput);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoX = '0, 1, 2, 3, 4';
    const demoY = '1, 1.8, 3.3, 4.5, 6.3';
    setXValuesInput(demoX);
    setYValuesInput(demoY);
    calculateLinearFit(demoX, demoY);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setXValuesInput('0, 1, 2, 3, 4');
    setYValuesInput('1, 1.8, 3.3, 4.5, 6.3');
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    Index: row.index,
    x: row.x.toFixed(4),
    y: row.y.toFixed(4),
    'x^2': row.x2.toFixed(4),
    'x*y': row.xy.toFixed(4),
  }));

  if (result) {
    exportData.push({
      Index: 'Sum',
      x: result.sumX.toFixed(4),
      y: result.sumY.toFixed(4),
      'x^2': result.sumX2.toFixed(4),
      'x*y': result.sumXY.toFixed(4),
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              CURVE FITTING LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Fitting Straight Lines (Linear Regression)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="xValues" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                x Values (comma separated)
              </label>
              <input
                type="text"
                id="xValues"
                value={xValuesInput}
                onChange={(e) => setXValuesInput(e.target.value)}
                placeholder="e.g. 0, 1, 2, 3, 4"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="yValues" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                y Values (comma separated)
              </label>
              <input
                type="text"
                id="yValues"
                value={yValuesInput}
                onChange={(e) => setYValuesInput(e.target.value)}
                placeholder="e.g. 1, 1.8, 3.3, 4.5, 6.3"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <EditorialButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
          >
            <FiCheckCircle className="w-4 h-4 mr-2" /> Fit Line Y = aX + b
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Fitted Line Equation Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                y = {result.b.toFixed(4)} {signedTerm(result.a, 'x')}
              </span>
            </div>

            <EditorialExportButton
              title="Linear Regression Report"
              elementId="linear-fit-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="linear-fit-results-container" className="space-y-6">
          <SetupSteps lines={gridLog} />

          <div className="flex items-center justify-between border-b-2 border-black dark:border-neutral-700 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
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
                <FiList className="w-3.5 h-3.5" /> Summation Table
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
                <FiLayers className="w-3.5 h-3.5" /> Normal Equations Derivation
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Regression Curve Plot
              </button>
            </div>

            <EditorialExportButton
              title="Linear Regression Report"
              elementId="linear-fit-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Linear Normal Equations Data Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">#</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">y</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x^2</th>
                      <th className="p-3">x &middot; y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepsData.map((row, idx) => (
                      <tr
                        key={row.index}
                        className={
                          idx % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.index}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.y.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-mono">{row.x2.toFixed(4)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.xy.toFixed(4)}</td>
                      </tr>
                    ))}
                    {result && (
                      <tr className="bg-emerald-500 text-white font-bold">
                        <td className="p-3 border-t border-r border-emerald-600">Sum (&Sigma;)</td>
                        <td className="p-3 border-t border-r border-emerald-600">{result.sumX.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-emerald-600">{result.sumY.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-emerald-600">{result.sumX2.toFixed(4)}</td>
                        <td className="p-3 border-t border-emerald-600">{result.sumXY.toFixed(4)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && result && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Normal Equations System Substitution
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Normal Equations:</span>
                  {/* Textbook form y = a + bx: a is the intercept (result.b), b the slope (result.a) */}
                  <BlockMath math={`\\sum y = n a + b \\sum x \\implies ${result.sumY.toFixed(4)} = ${result.n} a + ${result.sumX.toFixed(4)} b`} />
                  <BlockMath math={`\\sum xy = a \\sum x + b \\sum x^2 \\implies ${result.sumXY.toFixed(4)} = ${result.sumX.toFixed(4)} a + ${result.sumX2.toFixed(4)} b`} />
                  <BlockMath math={`b = \\frac{n \\sum xy - \\sum x \\sum y}{n \\sum x^2 - (\\sum x)^2} = \\frac{${result.n}(${result.sumXY.toFixed(4)}) - (${result.sumX.toFixed(4)})(${result.sumY.toFixed(4)})}{${result.denom.toFixed(4)}} = ${result.a.toFixed(4)}`} />
                  <BlockMath math={`a = \\frac{\\sum y \\sum x^2 - \\sum x \\sum xy}{n \\sum x^2 - (\\sum x)^2} = \\frac{(${result.sumY.toFixed(4)})(${result.sumX2.toFixed(4)}) - (${result.sumX.toFixed(4)})(${result.sumXY.toFixed(4)})}{${result.denom.toFixed(4)}} = ${result.b.toFixed(4)}`} />
                  <BlockMath math={`y = ${result.b.toFixed(4)} ${signedTerm(result.a, 'x')}`} />
                </div>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && result && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Regression Line Scatter Plot
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot dataPoints={stepsData} lineEquation={{ a: result.a, b: result.b }} title="Linear Regression Curve Fit" />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default StraightLineSolver;
