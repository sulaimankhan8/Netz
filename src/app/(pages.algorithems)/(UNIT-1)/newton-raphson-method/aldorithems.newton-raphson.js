'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import UnifiedPlot from '@/app/components/UnifiedPlot';
import { evaluateMath, getSymbolicDerivative } from '@/app/utils/evaluateMath';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const NewtonRaphsonMethod = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [expression, setExpression] = useState("x * x * x - 4 * x - 9");
  const [initialGuess, setInitialGuess] = useState('2.5');
  const [tolerance, setTolerance] = useState(0.0001);
  const [result, setResult] = useState(null);
  useRecordSolve('newton-raphson', 1, result, () => ({ fn: expression }));
  useCodeExportInputs('newton-raphson', () => ({ f: expression, x0: initialGuess, tol: tolerance }));
  const [tableResults, setTableResults] = useState([]);
  const [stepDetails, setStepDetails] = useState([]);
  const [intervalSteps, setIntervalSteps] = useState([]);
  const [error, setError] = useState('');
  const [derivativeText, setDerivativeText] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'
  const [showAllSteps, setShowAllSteps] = useState(false);

  const evaluateFunction = (fStr, xVal) => {
    try {
      return evaluateMath(fStr, xVal);
    } catch {
      return null;
    }
  };

  const findInterval = (fStr, maxRange = 100, step = 1) => {
    const steps = [];
    let a = 0;
    let fa = evaluateFunction(fStr, a);

    if (fa === null) {
      steps.push(`Evaluation error at x = 0.`);
      return { interval: null, steps };
    } else if (fa === 0) {
      steps.push(`Exact root found at x = 0.`);
      return { interval: [0, 0], steps };
    } else {
      for (let x = a + step; x <= maxRange; x += step) {
        const fx = evaluateFunction(fStr, x);
        if (fx === null) continue;
        if (fx === 0) {
          steps.push(`Exact root found at x = ${x}.`);
          return { interval: [x, x], steps };
        }
        if (fa * fx < 0) {
          steps.push(`Sign change between x = ${a} and x = ${x}.`);
          return { interval: [a, x], steps };
        }
        a = x;
        fa = fx;
      }
    }

    steps.push(`No interval found in positive direction. Searching negative direction.`);
    a = 0;
    fa = evaluateFunction(fStr, a);
    for (let x = a - step; x >= -maxRange; x -= step) {
      const fx = evaluateFunction(fStr, x);
      if (fx === null) continue;
      if (fx === 0) {
        steps.push(`Exact root found at x = ${x}.`);
        return { interval: [x, x], steps };
      }
      if (fa * fx < 0) {
        steps.push(`Sign change between x = ${x} and x = ${a}.`);
        return { interval: [x, a], steps };
      }
      a = x;
      fa = fx;
    }

    steps.push(`No sign change interval found up to max range.`);
    return { interval: null, steps };
  };

  const handleCalculateRoot = (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setTableResults([]);
    setStepDetails([]);
    setIntervalSteps([]);

    let dfStr = '';
    try {
      dfStr = getSymbolicDerivative(expression);
      setDerivativeText(dfStr);
    } catch {
      setError("Failed to generate symbolic derivative. Please check expression syntax.");
      return;
    }

    let x0;
    if (!initialGuess || initialGuess.trim() === '') {
      const { interval, steps: searchSteps } = findInterval(expression);
      setIntervalSteps(searchSteps);
      if (!interval) {
        setError("Could not auto-detect initial guess interval. Please provide x_0 manually.");
        return;
      }
      x0 = (interval[0] + interval[1]) / 2;
    } else {
      x0 = parseFloat(initialGuess);
      if (isNaN(x0)) {
        setError("Invalid initial guess.");
        return;
      }
    }

    let currentX = x0;
    const maxIter = 50;
    const iterations = [];
    const stepsLog = [];
    let converged = false;

    for (let i = 1; i <= maxIter; i++) {
      const fx = evaluateFunction(expression, currentX);
      const fpx = evaluateFunction(dfStr, currentX);

      if (fx === null || fpx === null) {
        setError(`Evaluation error at iteration ${i}.`);
        return;
      }

      if (Math.abs(fpx) < 1e-12) {
        setError(`Derivative near zero at x = ${currentX.toFixed(6)}. Method failed.`);
        return;
      }

      const nextX = currentX - fx / fpx;

      iterations.push({ iteration: i, x: currentX, fx, fpx, nextX });
      stepsLog.push({ iteration: i, x: currentX, fx, fpx, nextX });

      if (Math.abs(nextX - currentX) < tolerance || Math.abs(fx) < tolerance) {
        converged = true;
        setResult(`Newton-Raphson converged to root x = ${nextX.toFixed(6)} in ${i} iterations`);
        break;
      }

      currentX = nextX;
    }

    if (!converged) {
      setResult(`Max iterations reached. Approximate root at x = ${currentX.toFixed(6)}`);
    }

    setTableResults(iterations);
    setStepDetails(stepsLog);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoExpr = "x * x * x - 4 * x - 9";
    const demoX0 = "2.5";
    const demoTol = 0.0001;

    setExpression(demoExpr);
    setInitialGuess(demoX0);
    setTolerance(demoTol);
    setError('');

    let dfStr = '';
    try {
      dfStr = getSymbolicDerivative(demoExpr);
      setDerivativeText(dfStr);
    } catch {
      setError("Failed to generate symbolic derivative.");
      setDemoInProgress(false);
      return;
    }

    let currentX = parseFloat(demoX0);
    const maxIter = 50;
    const iterations = [];
    const stepsLog = [];
    let converged = false;

    for (let i = 1; i <= maxIter; i++) {
      const fx = evaluateFunction(demoExpr, currentX);
      const fpx = evaluateFunction(dfStr, currentX);

      if (fx === null || fpx === null || Math.abs(fpx) < 1e-12) break;

      const nextX = currentX - fx / fpx;
      iterations.push({ iteration: i, x: currentX, fx, fpx, nextX });
      stepsLog.push({ iteration: i, x: currentX, fx, fpx, nextX });

      if (Math.abs(nextX - currentX) < demoTol || Math.abs(fx) < demoTol) {
        converged = true;
        setResult(`Newton-Raphson converged to root x = ${nextX.toFixed(6)} in ${i} iterations`);
        break;
      }
      currentX = nextX;
    }

    if (!converged && iterations.length > 0) {
      setResult(`Max iterations reached. Approximate root at x = ${currentX.toFixed(6)}`);
    }

    setTableResults(iterations);
    setStepDetails(stepsLog);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setExpression("x * x * x - 4 * x - 9");
    setInitialGuess("2.5");
    setTolerance(0.0001);
    setResult(null);
    setTableResults([]);
    setStepDetails([]);
    setIntervalSteps([]);
    setError('');
    setDerivativeText('');
  };

  const exportData = tableResults.map((item) => ({
    Iteration: item.iteration,
    'x_n': item.x.toFixed(6),
    'f(x_n)': item.fx.toFixed(6),
    "f'(x_n)": item.fpx.toFixed(6),
    'x_{n+1}': item.nextX.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              TANGENT SOLVER LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Newton-Raphson Interactive Engine
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

        <form onSubmit={handleCalculateRoot} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text"
                id="function"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., x^3 - 4*x - 9"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="initialGuess" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Initial Guess (<InlineMath math="x_0" />)
              </label>
              <input
                type="number"
                id="initialGuess"
                step="any"
                value={initialGuess}
                onChange={(e) => setInitialGuess(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tolerance" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Tolerance (<InlineMath math="\epsilon" />)
              </label>
              <input
                type="number"
                id="tolerance"
                step="0.00001"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                placeholder="e.g., 0.0001"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <EditorialButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Root
            </EditorialButton>
          </div>
        </form>

        {derivativeText && (
          <div className="p-4 border border-black/30 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-xl font-mono text-xs text-black dark:text-white">
            <strong className="uppercase text-neutral-500 block mb-1">Auto-Derived Derivative:</strong>
            <InlineMath math={`f'(x) = ${derivativeText}`} />
          </div>
        )}

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Convergence Reached ({tableResults.length} iterations)
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                {result}
              </span>
            </div>

            <EditorialExportButton
              title="Newton Raphson Method Report"
              elementId="newton-raphson-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {tableResults.length > 0 && (
        <div id="newton-raphson-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Iteration Table
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
                <FiLayers className="w-3.5 h-3.5" /> Step Derivations
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Tangent Plot
              </button>
            </div>

            <EditorialExportButton
              title="Newton Raphson Method Report"
              elementId="newton-raphson-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Newton-Raphson Iteration Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x_n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f(x_n)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f′(x_n)</th>
                      <th className="p-3">x_{'{n+1}'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableResults.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index === tableResults.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{item.iteration}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{item.x.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{item.fx.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{item.fpx.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{item.nextX.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="newton-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Tangent Slopes ({stepDetails.length} Total Steps)
                </h4>
                <div className="flex items-center gap-2">
                  {stepDetails.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(!showAllSteps)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      {showAllSteps ? 'Show First 5 Steps' : `Show All ${stepDetails.length} Steps`}
                    </button>
                  )}
                  <EditorialExportButton
                    title="Newton-Raphson Steps"
                    targetId="newton-steps-container"
                    label="Export Steps"
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(showAllSteps ? stepDetails : stepDetails.slice(0, 5)).map((step, index) => (
                  <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Iteration {step.iteration}</span>
                      <span>Tangent Intersect Calculation</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1">
                      <BlockMath math={`x_{${step.iteration}} = x_{${step.iteration - 1}} - \\frac{f(x_{${step.iteration - 1}})}{f'(x_{${step.iteration - 1}})} = ${step.x.toFixed(6)} - \\frac{${step.fx.toFixed(6)}}{${step.fpx.toFixed(6)}} = ${step.nextX.toFixed(6)}`} />
                    </div>
                    <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300 text-center">
                      <InlineMath math={`f(x) = ${step.fx.toFixed(6)}, \\quad f'(x) = ${step.fpx.toFixed(6)}`} />
                    </div>
                  </div>
                ))}
                {!showAllSteps && stepDetails.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Click to expand and view remaining {stepDetails.length - 5} step derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="newton-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Tangent Intersect Plot
                </h4>
                <EditorialExportButton
                  title="Newton-Raphson Graph Plot"
                  targetId="newton-plot-container"
                  label="Export Graph"
                  variant="outline"
                  size="sm"
                />
              </div>

              <div id="graphCanvas" className="w-full">
                <UnifiedPlot
                  iterations={tableResults}
                  functionInput={expression}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NewtonRaphsonMethod;
