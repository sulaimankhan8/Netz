'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const LeastSquaresSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [fitType, setFitType] = useState('exponential');
  const [xValuesInput, setXValuesInput] = useState('1, 2, 3, 4, 5');
  const [yValuesInput, setYValuesInput] = useState('2.5, 4.2, 7.5, 12.8, 22.1');

  const [result, setResult] = useState(null);
  useRecordSolve('least-squares', 5, result);
  useCodeExportInputs('least-squares', () => ({ x: xValuesInput, y: yValuesInput, model: fitType }));
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateLeastSquares = (type, xStr, yStr) => {
    setError('');
    setResult(null);
    setStepsData([]);

    const xArr = xStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const yArr = yStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (xArr.length !== yArr.length || xArr.length < 2) {
      setError('Please enter equal numbers of numeric x and y values (at least 2 points).');
      return;
    }

    if (yArr.some(v => v <= 0) || (type === 'power' && xArr.some(v => v <= 0))) {
      setError('Logarithmic transformations require strictly positive values (x > 0 and y > 0).');
      return;
    }

    const n = xArr.length;
    const log = [];
    log.push(`Fitting Mode: ${type === 'exponential' ? 'Exponential y = a * e^(b*x)' : 'Power y = a * x^b'}`);
    log.push(`Sample Count n = ${n}`);

    let sumX = 0, sumY = 0, sumX2 = 0, sumXY = 0;
    const table = [];

    for (let i = 0; i < n; i++) {
      const origX = xArr[i];
      const origY = yArr[i];
      const X = type === 'power' ? Math.log(origX) : origX;
      const Y = Math.log(origY);
      const X2 = X * X;
      const XY = X * Y;

      sumX += X;
      sumY += Y;
      sumX2 += X2;
      sumXY += XY;

      table.push({ index: i + 1, origX, origY, X, Y, X2, XY });
    }

    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
      setError('Degenerate dataset for logarithmic transformation.');
      return;
    }

    const B = (n * sumXY - sumX * sumY) / denom;
    const A_cap = (sumY * sumX2 - sumX * sumXY) / denom;
    const A = Math.exp(A_cap);

    let eqnString = '';
    if (type === 'exponential') {
      eqnString = `y = ${A.toFixed(4)} \\cdot e^{${B.toFixed(4)} x}`;
    } else {
      eqnString = `y = ${A.toFixed(4)} \\cdot x^{${B.toFixed(4)}}`;
    }

    log.push(`Transformed Sum X = ${sumX.toFixed(4)}, Sum Y = ${sumY.toFixed(4)}`);
    log.push(`Transformed Sum X^2 = ${sumX2.toFixed(4)}, Sum XY = ${sumXY.toFixed(4)}`);
    log.push(`Linearized A' = ln(a) = ${A_cap.toFixed(4)}, b = ${B.toFixed(4)}`);
    log.push(`Converted a = e^A' = ${A.toFixed(4)}`);

    setGridLog(log);
    setStepsData(table);
    setResult({ n, sumX, sumY, sumX2, sumXY, denom, A_cap, A, B, eqnString });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateLeastSquares(fitType, xValuesInput, yValuesInput);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFitType('exponential');
    setXValuesInput('1, 2, 3, 4, 5');
    setYValuesInput('2.5, 4.2, 7.5, 12.8, 22.1');
    calculateLeastSquares('exponential', '1, 2, 3, 4, 5', '2.5, 4.2, 7.5, 12.8, 22.1');
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFitType('exponential');
    setXValuesInput('1, 2, 3, 4, 5');
    setYValuesInput('2.5, 4.2, 7.5, 12.8, 22.1');
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    Index: row.index,
    'orig x': row.origX,
    'orig y': row.origY,
    'Transformed X': row.X.toFixed(4),
    'Transformed Y': row.Y.toFixed(4),
    'X^2': row.X2.toFixed(4),
    'X*Y': row.XY.toFixed(4),
  }));

  if (result) {
    exportData.push({
      Index: 'Sum',
      'orig x': '-',
      'orig y': '-',
      'Transformed X': result.sumX.toFixed(4),
      'Transformed Y': result.sumY.toFixed(4),
      'X^2': result.sumX2.toFixed(4),
      'X*Y': result.sumXY.toFixed(4),
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Non-linear curve fitting calculator
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Least Squares Fitting Engine
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
          <div className="space-y-1.5">
            <label htmlFor="fitType" className="text-xs font-mono font-bold uppercase text-black dark:text-white block">
              Curve Fitting Mode
            </label>
            <select
              id="fitType"
              value={fitType}
              onChange={(e) => setFitType(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="exponential">Exponential Curve: y = a * e^(b*x)</option>
              <option value="power">Power Curve: y = a * x^b</option>
            </select>
          </div>

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
                placeholder="e.g. 1, 2, 3, 4, 5"
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
                placeholder="e.g. 2.5, 4.2, 7.5, 12.8, 22.1"
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Fit Non-Linear Curve
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Fitted Curve Equation Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                <InlineMath math={result.eqnString} />
              </span>
            </div>

            <EditorialExportButton
              title="Least Squares Fitting Report"
              elementId="least-squares-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="least-squares-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Transformed Data Table
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
                <FiLayers className="w-3.5 h-3.5" /> Log-Linear Derivation
              </button>
            </div>

            <EditorialExportButton
              title="Least Squares Fitting Report"
              elementId="least-squares-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Transformed Log Data Matrix
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">#</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">orig x</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">orig y</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">X = {fitType === 'power' ? 'ln(x)' : 'x'}</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Y = ln(y)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">X^2</th>
                      <th className="p-3">X &middot; Y</th>
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
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.origX}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.origY}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.X.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.Y.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.X2.toFixed(4)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.XY.toFixed(4)}</td>
                      </tr>
                    ))}
                    {result && (
                      <tr className="bg-emerald-500 text-white font-bold">
                        <td className="p-3 border-t border-r border-emerald-600">Sum (&Sigma;)</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
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
                <FiLayers className="w-5 h-5 text-neutral-500" /> Log-Linear Parameter Solving Derivation
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Log Linear Transformation:</span>
                  <BlockMath math={`Y = \\ln a + b X \\implies Y = A' + b X`} />
                  <BlockMath math={`b = \\frac{n \\sum XY - \\sum X \\sum Y}{n \\sum X^2 - (\\sum X)^2} = ${result.B.toFixed(4)}`} />
                  <BlockMath math={`A' = \\ln a = ${result.A_cap.toFixed(4)} \\implies a = e^{A'} = ${result.A.toFixed(4)}`} />
                  <BlockMath math={`\\text{Final Equation: } ${result.eqnString}`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default LeastSquaresSolver;
