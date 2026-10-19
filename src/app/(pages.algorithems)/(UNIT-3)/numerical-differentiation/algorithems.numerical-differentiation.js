'use client';
import { useRecordSolve } from '@/app/utils/activity';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { parseUserFunction } from '@/app/utils/evaluateMath';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const NumericalDifferentiationSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState('x^3 - 2*x + 5');
  const [evalX, setEvalX] = useState(2);
  const [stepH, setStepH] = useState(0.01);

  const [result, setResult] = useState(null);
  useRecordSolve('numerical-differentiation', 3, result, () => ({ fn: functionInput }));
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateDifferentiation = (fExpr, xVal, hVal) => {
    setError('');
    const x0 = parseFloat(xVal);
    const h = parseFloat(hVal);

    if (isNaN(x0) || isNaN(h) || h <= 0) {
      setError('Please enter valid numeric values for x and a positive step size (h > 0).');
      return;
    }

    let f;
    try {
      f = parseUserFunction(fExpr);
      f(x0);
    } catch (err) {
      setError('Invalid function input. Please enter a valid mathematical expression like x^3 - 2*x + 5.');
      return;
    }

    const log = [];
    log.push(`Evaluation Point x = ${x0}, Step Size h = ${h}`);

    const fx0 = f(x0);
    const fx_plus_h = f(x0 + h);
    const fx_minus_h = f(x0 - h);

    const firstDerivCentral = (fx_plus_h - fx_minus_h) / (2 * h);
    const secondDerivCentral = (fx_plus_h - 2 * fx0 + fx_minus_h) / (h * h);

    const gridPoints = [
      { label: 'f(x - h)', xVal: x0 - h, fVal: fx_minus_h },
      { label: 'f(x)', xVal: x0, fVal: fx0 },
      { label: 'f(x + h)', xVal: x0 + h, fVal: fx_plus_h },
    ];

    setGridLog(log);
    setStepsData(gridPoints);
    setResult({
      x0,
      h,
      fx0,
      fx_plus_h,
      fx_minus_h,
      firstDerivCentral,
      secondDerivCentral,
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateDifferentiation(functionInput, evalX, stepH);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput('x^3 - 2*x + 5');
    setEvalX(2);
    setStepH(0.01);
    calculateDifferentiation('x^3 - 2*x + 5', 2, 0.01);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput('x^3 - 2*x + 5');
    setEvalX(2);
    setStepH(0.01);
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    Symbol: row.label,
    'Grid Point x': row.xVal.toFixed(6),
    'f(x) Value': row.fVal.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              FINITE DIFFERENCE DERIVATIVE LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Numerical Differentiation Engine
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text"
                id="function"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="e.g., x^3 - 2*x + 5"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="evalX" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Evaluation Point (<InlineMath math="x_0" />)
              </label>
              <input
                type="number"
                step="any"
                id="evalX"
                value={evalX}
                onChange={(e) => setEvalX(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stepH" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Step Size (<InlineMath math="h" />)
              </label>
              <input
                type="number"
                step="any"
                id="stepH"
                value={stepH}
                onChange={(e) => setStepH(e.target.value)}
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Compute Derivatives
          </EditorialButton>
        </form>

        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 rounded-xl space-y-1 shadow-[2px_2px_0px_0px_rgba(37,99,235,0.3)]">
              <span className="text-xs font-mono font-bold uppercase block text-blue-700 dark:text-blue-400">
                1st Derivative f&apos;(x_0)
              </span>
              <span className="text-xl md:text-2xl font-mono font-black">
                {result.firstDerivCentral.toFixed(6)}
              </span>
            </div>

            <div className="p-5 border-2 border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 rounded-xl space-y-1 shadow-[2px_2px_0px_0px_rgba(147,51,234,0.3)]">
              <span className="text-xs font-mono font-bold uppercase block text-purple-700 dark:text-purple-400">
                2nd Derivative f&apos;&apos;(x_0)
              </span>
              <span className="text-xl md:text-2xl font-mono font-black">
                {result.secondDerivCentral.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="differentiation-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Grid Values Table
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
                <FiLayers className="w-3.5 h-3.5" /> Finite Difference Formulas
              </button>
            </div>

            <EditorialExportButton
              title="Numerical Differentiation Report"
              elementId="differentiation-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Grid Function Evaluations
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Symbol</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Grid Point x</th>
                      <th className="p-3">f(x) Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepsData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.label === 'f(x)'
                            ? 'bg-emerald-500 text-white font-bold'
                            : idx % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.label}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.xVal.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.fVal.toFixed(6)}</td>
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
                <FiLayers className="w-5 h-5 text-neutral-500" /> Central Difference Substitutions
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">1st Derivative Formula:</span>
                  <BlockMath math={`f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}`} />
                  <BlockMath math={`f'(${result.x0}) \\approx \\frac{${result.fx_plus_h.toFixed(6)} - ${result.fx_minus_h.toFixed(6)}}{2 \\times ${result.h}} = ${result.firstDerivCentral.toFixed(6)}`} />
                </div>

                <div className="space-y-1 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="font-bold text-neutral-500 uppercase block">2nd Derivative Formula:</span>
                  <BlockMath math={`f''(x) \\approx \\frac{f(x+h) - 2f(x) + f(x-h)}{h^2}`} />
                  <BlockMath math={`f''(${result.x0}) \\approx \\frac{${result.fx_plus_h.toFixed(6)} - 2(${result.fx0.toFixed(6)}) + ${result.fx_minus_h.toFixed(6)}}{${result.h}^2} = ${result.secondDerivCentral.toFixed(6)}`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NumericalDifferentiationSolver;
