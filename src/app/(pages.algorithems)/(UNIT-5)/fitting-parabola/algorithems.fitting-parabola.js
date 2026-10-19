'use client';
import { useRecordSolve } from '@/app/utils/activity';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

// "+ 2.0000x" or "- 2.0000x", so equations never print "+ -"
const signedTerm = (value, variable = '') => `${value < 0 ? '-' : '+'} ${Math.abs(value).toFixed(4)}${variable}`;

// "10 a - 2.5 b + 5 c": coefficients rounded to 4 d.p., signs folded in
const combo = (terms) => terms
  .map(([value, name], i) => (i === 0 ? `${+value.toFixed(4)} ${name}` : `${value < 0 ? '-' : '+'} ${+Math.abs(value).toFixed(4)} ${name}`))
  .join(' ');

const FittingParabolaSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [xValuesInput, setXValuesInput] = useState('-2, -1, 0, 1, 2');
  const [yValuesInput, setYValuesInput] = useState('15, 7, 3, 3, 7');

  const [result, setResult] = useState(null);
  useRecordSolve('parabola', 5, result);
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

  const solve3x3 = (A, B) => {
    const M = A.map((row, i) => [...row, B[i]]);
    for (let i = 0; i < 3; i++) {
      let maxEl = Math.abs(M[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(M[k][i]) > maxEl) {
          maxEl = Math.abs(M[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < 4; k++) {
        const tmp = M[maxRow][k];
        M[maxRow][k] = M[i][k];
        M[i][k] = tmp;
      }
      if (Math.abs(M[i][i]) < 1e-12) return null;
      for (let k = i + 1; k < 3; k++) {
        const c = -M[k][i] / M[i][i];
        for (let j = i; j < 4; j++) {
          if (i === j) M[k][j] = 0;
          else M[k][j] += c * M[i][j];
        }
      }
    }
    const x = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
      x[i] = M[i][3] / M[i][i];
      for (let k = i - 1; k >= 0; k--) {
        M[k][3] -= M[k][i] * x[i];
      }
    }
    return x;
  };

  const calculateParabolaFit = (xStr, yStr) => {
    setError('');
    setResult(null);
    setStepsData([]);

    const xArr = xStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const yArr = yStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (xArr.length !== yArr.length || xArr.length < 3) {
      setError('Please enter equal numbers of numeric x and y values (at least 3 points).');
      return;
    }

    const n = xArr.length;
    const log = [];
    log.push(`Sample Data Count n = ${n}`);

    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;
    const table = [];

    for (let i = 0; i < n; i++) {
      const x = xArr[i];
      const y = yArr[i];
      const x2 = x * x;
      const x3 = x2 * x;
      const x4 = x2 * x2;
      const xy = x * y;
      const x2y = x2 * y;

      sumX += x;
      sumY += y;
      sumX2 += x2;
      sumX3 += x3;
      sumX4 += x4;
      sumXY += xy;
      sumX2Y += x2y;

      table.push({ index: i + 1, x, y, x2, x3, x4, xy, x2y });
    }

    const A = [
      [sumX4, sumX3, sumX2],
      [sumX3, sumX2, sumX],
      [sumX2, sumX, n],
    ];
    const B = [sumX2Y, sumXY, sumY];

    const sol = solve3x3(A, B);
    if (!sol) {
      setError('System matrix is singular or degenerate (cannot solve 3x3 system).');
      return;
    }

    const [a, b, c] = sol;

    log.push(`Σx = ${sumX.toFixed(4)}, Σy = ${sumY.toFixed(4)}`);
    log.push(`Σx² = ${sumX2.toFixed(4)}, Σx³ = ${sumX3.toFixed(4)}, Σx⁴ = ${sumX4.toFixed(4)}`);
    log.push(`Σxy = ${sumXY.toFixed(4)}, Σx²y = ${sumX2Y.toFixed(4)}`);
    log.push(`Coefficients (y = a + bx + cx²): a = ${c.toFixed(4)}, b = ${b.toFixed(4)}, c = ${a.toFixed(4)}`);

    setGridLog(log);
    setStepsData(table);
    setResult({ n, sumX, sumY, sumX2, sumX3, sumX4, sumXY, sumX2Y, a, b, c });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateParabolaFit(xValuesInput, yValuesInput);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoX = '-2, -1, 0, 1, 2';
    const demoY = '15, 7, 3, 3, 7';
    setXValuesInput(demoX);
    setYValuesInput(demoY);
    calculateParabolaFit(demoX, demoY);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setXValuesInput('-2, -1, 0, 1, 2');
    setYValuesInput('15, 7, 3, 3, 7');
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    Index: row.index,
    x: row.x,
    y: row.y,
    'x^2': row.x2,
    'x^3': row.x3,
    'x^4': row.x4,
    'x*y': row.xy,
    'x^2*y': row.x2y,
  }));

  if (result) {
    exportData.push({
      Index: 'Sum',
      x: result.sumX,
      y: result.sumY,
      'x^2': result.sumX2,
      'x^3': result.sumX3,
      'x^4': result.sumX4,
      'x*y': result.sumXY,
      'x^2*y': result.sumX2Y,
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              QUADRATIC REGRESSION LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Fitting a Parabola Engine
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
                placeholder="e.g. -2, -1, 0, 1, 2"
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
                placeholder="e.g. 15, 7, 3, 3, 7"
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Fit Parabola Y = aX^2 + bX + c
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Fitted Parabola Equation Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                y = {result.c.toFixed(4)} {signedTerm(result.b, 'x')} {signedTerm(result.a, 'x²')}
              </span>
            </div>

            <EditorialExportButton
              title="Parabola Fitting Report"
              elementId="parabola-fit-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="parabola-fit-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Summation Matrix Table
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
                <FiLayers className="w-3.5 h-3.5" /> 3x3 System Substitution
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Parabola Curve Plot
              </button>
            </div>

            <EditorialExportButton
              title="Parabola Fitting Report"
              elementId="parabola-fit-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Parabola Normal Equations Data Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">#</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">y</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">x^2</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">x^3</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">x^4</th>
                      <th className="p-2 border-r border-neutral-700 dark:border-neutral-300">x &middot; y</th>
                      <th className="p-2">x^2 &middot; y</th>
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
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.index}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.y}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x2}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x3}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x4}</td>
                        <td className="p-2 border-t border-r border-neutral-200 dark:border-neutral-700">{row.xy}</td>
                        <td className="p-2 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.x2y}</td>
                      </tr>
                    ))}
                    {result && (
                      <tr className="bg-emerald-500 text-white font-bold">
                        <td className="p-2 border-t border-r border-emerald-600">Sum (&Sigma;)</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumX}</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumY}</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumX2}</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumX3}</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumX4}</td>
                        <td className="p-2 border-t border-r border-emerald-600">{result.sumXY}</td>
                        <td className="p-2 border-t border-emerald-600">{result.sumX2Y}</td>
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
                <FiLayers className="w-5 h-5 text-neutral-500" /> 3x3 Normal Equations System Substitution
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Normal Equations:</span>
                  <BlockMath math={`\\sum y = n a + b \\sum x + c \\sum x^2 \\implies ${+result.sumY.toFixed(4)} = ${combo([[result.n, 'a'], [result.sumX, 'b'], [result.sumX2, 'c']])}`} />
                  <BlockMath math={`\\sum xy = a \\sum x + b \\sum x^2 + c \\sum x^3 \\implies ${+result.sumXY.toFixed(4)} = ${combo([[result.sumX, 'a'], [result.sumX2, 'b'], [result.sumX3, 'c']])}`} />
                  <BlockMath math={`\\sum x^2 y = a \\sum x^2 + b \\sum x^3 + c \\sum x^4 \\implies ${+result.sumX2Y.toFixed(4)} = ${combo([[result.sumX2, 'a'], [result.sumX3, 'b'], [result.sumX4, 'c']])}`} />
                  <BlockMath math={`a = ${result.c.toFixed(4)}, \\quad b = ${result.b.toFixed(4)}, \\quad c = ${result.a.toFixed(4)}`} />
                  <BlockMath math={`y = ${result.c.toFixed(4)} ${signedTerm(result.b, ' x')} ${signedTerm(result.a, ' x^2')}`} />
                </div>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && result && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Quadratic Parabola Fit Plot
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot dataPoints={stepsData} parabolaCoeffs={{ a: result.a, b: result.b, c: result.c }} title="Quadratic Parabola Fit" />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default FittingParabolaSolver;
