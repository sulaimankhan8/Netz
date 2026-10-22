'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import UnifiedPlot from '@/app/components/UnifiedPlot';
import { parseUserFunction, getSymbolicDerivative, evaluateMath, expressionToTex } from "@/app/utils/evaluateMath";
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const FixedPointMethod = () => {
  const [functionInput, setFunctionInput] = useState("(x + 1)^(1/3)");
  const [initialGuess, setInitialGuess] = useState('1.5');
  const [tolerance, setTolerance] = useState(0.0001);
  const [result, setResult] = useState(null);
  useRecordSolve('fixed-point', 1, result, () => ({ fn: functionInput }));
  useCodeExportInputs('fixed-point', () => ({ g: functionInput, x0: initialGuess, tol: tolerance, maxIter: 100 }));
  const [iterationSteps, setIterationSteps] = useState([]);
  const [error, setError] = useState('');
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [intervalFound, setIntervalFound] = useState(null);
  const [convergenceCheck, setConvergenceCheck] = useState(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [viewTab, setViewTab] = useState('all');

  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  const handleInitialGuessChange = (e) => {
    setInitialGuess(e.target.value);
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setTolerance(0.0001);
    } else {
      setTolerance(value);
    }
  };

  const findIntervals = (g, min = -100, max = 100, step = 1) => {
    const intervals = [];
    let a = min;
    let fa = g(a) - a;

    for (let x = a + step; x <= max; x += step) {
      let fx = g(x) - x;
      if (isNaN(fx)) {
        a = x;
        fa = fx;
        continue;
      }
      if (fa * fx < 0) {
        intervals.push([a, x]);
      }
      a = x;
      fa = fx;
    }

    return intervals;
  };

  // Step 0: x = g(x) converges near x0 only if |g'(x0)| < 1
  const checkConvergence = (expr, x0) => {
    try {
      const derivative = getSymbolicDerivative(expr);
      const slope = evaluateMath(derivative, x0);
      return { x0, derivative, slope, ok: Math.abs(slope) < 1 };
    } catch {
      return null; // derivative not available: skip the check
    }
  };

  const fixedPointIteration = (g, x0, tol = 0.00001, maxIter = 100) => {
    let iterations = [];
    let x = x0;
    let xNext;
    try {
      xNext = g(x);
    } catch (err) {
      return {
        root: null,
        iterations: 0,
        steps: [],
        converged: false,
        error: `Error evaluating function at x = ${x}: ${err.message}`
      };
    }
    let iter = 1;
    let difference = Math.abs(xNext - x);

    iterations.push({ iter: iter, x_n: x, x_next: xNext, difference: difference });

    while (difference > tol && iter < maxIter) {
      x = xNext;
      try {
        xNext = g(x);
      } catch (err) {
        return {
          root: null,
          iterations: iter,
          steps: iterations,
          converged: false,
          error: `Error evaluating function at x = ${x}: ${err.message}`
        };
      }
      iter++;
      difference = Math.abs(xNext - x);
      iterations.push({ iter: iter, x_n: x, x_next: xNext, difference: difference });
    }

    return {
      root: (difference <= tol) ? xNext : null,
      iterations: iter,
      steps: iterations,
      converged: difference <= tol,
      error: difference <= tol ? null : `Did not converge within ${maxIter} iterations.`
    };
  };

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setError('');
    setResult(null);
    setIterationSteps([]);
    setIntervalFound(null);
    setConvergenceCheck(null);

    let g;
    try {
      g = parseUserFunction(functionInput.trim());
      g(0);
    } catch (err) {
      setError("Invalid function input. Please enter a valid mathematical expression like cos(x).");
      return;
    }

    let x0;
    if (initialGuess.trim() !== '') {
      x0 = parseFloat(initialGuess);
      if (isNaN(x0)) {
        setError("Initial guess must be a valid number.");
        return;
      }
    } else {
      const intervals = findIntervals(g);
      if (intervals.length === 0) {
        setError("Could not find an interval where g(x) - x changes sign. Please provide an initial guess.");
        return;
      }
      const [a, b] = intervals[0];
      setIntervalFound([a, b]);
      x0 = (a + b) / 2;
    }

    const check = checkConvergence(functionInput.trim(), x0);
    setConvergenceCheck(check);
    if (check && !check.ok) {
      setError(`|g'(x0)| = |${check.slope.toFixed(4)}| ≥ 1 at x0 = ${x0}, so x = g(x) will not converge here. Rearrange f(x) = 0 into a different form x = g(x) (one with |g'(x)| < 1 near the root).`);
      return;
    }

    const iterationResult = fixedPointIteration(g, x0, tolerance, 100);

    if (iterationResult.error) {
      setError(iterationResult.error);
      return;
    }

    setResult(`Fixed-point root converged to x = ${(iterationResult.root !== null && iterationResult.root !== undefined) ? iterationResult.root.toFixed(6) : x0.toFixed(6)} in ${iterationResult.iterations} iterations`);
    setIterationSteps(iterationResult.steps);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoFn = "(x + 1)^(1/3)";
    const demoX0Str = "1.5";
    const demoTol = 0.0001;

    setFunctionInput(demoFn);
    setInitialGuess(demoX0Str);
    setTolerance(demoTol);
    setError('');

    let g;
    try {
      g = parseUserFunction(demoFn);
      g(0);
    } catch {
      setError("Invalid demo expression.");
      setDemoInProgress(false);
      return;
    }

    const x0 = parseFloat(demoX0Str);
    setConvergenceCheck(checkConvergence(demoFn, x0));
    const iterationResult = fixedPointIteration(g, x0, demoTol);

    if (iterationResult.error) {
      setError(iterationResult.error);
      setDemoInProgress(false);
      return;
    }

    setResult(`Fixed-point root converged to x = ${(iterationResult.root !== null && iterationResult.root !== undefined) ? iterationResult.root.toFixed(6) : x0.toFixed(6)} in ${iterationResult.iterations} iterations`);
    setIterationSteps(iterationResult.steps);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput("(x + 1)^(1/3)");
    setInitialGuess("1.5");
    setTolerance(0.0001);
    setResult(null);
    setIterationSteps([]);
    setError('');
    setIntervalFound(null);
    setConvergenceCheck(null);
  };

  const exportData = iterationSteps.map((step) => ({
    Iteration: step.iter,
    'x_n': step.x_n.toFixed(6),
    'x_{n+1} = g(x_n)': step.x_next.toFixed(6),
    'Difference': step.difference.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Fixed-point solver calculator
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Fixed-Point Iteration Engine
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="g(x)" />
              </label>
              <input
                type="text"
                id="function"
                value={functionInput}
                onChange={handleFunctionChange}
                placeholder="e.g., cos(x)"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="initial-guess" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Initial Guess (<InlineMath math="x_0" />)
              </label>
              <input
                type="text"
                id="initial-guess"
                value={initialGuess}
                onChange={handleInitialGuessChange}
                placeholder="e.g., 1"
                required
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
                step="any"
                value={tolerance}
                onChange={handleToleranceChange}
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
              <FiCheckCircle className="w-4 h-4 mr-2" /> Run Iteration Loop
            </EditorialButton>
          </div>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Iteration Convergence Summary
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                {result}
              </span>
            </div>

            <EditorialExportButton
              title="Fixed Point Iteration Report"
              elementId="fixed-point-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {iterationSteps.length > 0 && (
        <div id="fixed-point-results-container" className="space-y-6">
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Iteration Plot
              </button>
            </div>

            <EditorialExportButton
              title="Fixed Point Iteration Report"
              elementId="fixed-point-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Fixed-Point Iteration Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x_n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x_next = g(x_n)</th>
                      <th className="p-3">|x_next - x_n|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iterationSteps.map((step, index) => (
                      <tr
                        key={index}
                        className={
                          index === iterationSteps.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{step.iter}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{step.x_n.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{step.x_next.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{step.difference.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="fixed-point-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Function Substitution ({iterationSteps.length} Total Steps)
                </h4>
                <div className="flex items-center gap-2">
                  {iterationSteps.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(!showAllSteps)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      {showAllSteps ? 'Show First 5 Steps' : `Show All ${iterationSteps.length} Steps`}
                    </button>
                  )}
                  <EditorialExportButton
                    title="Fixed Point Iteration Steps"
                    targetId="fixed-point-steps-container"
                    label="Export Steps"
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {convergenceCheck && (
                  <div className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-amber-50 dark:bg-amber-950/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Step 0</span>
                      <span>Convergence Check</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1">
                      <BlockMath math={`g'(x) = ${expressionToTex(convergenceCheck.derivative)}, \\quad |g'(${convergenceCheck.x0})| = ${Math.abs(convergenceCheck.slope).toFixed(4)} ${convergenceCheck.ok ? '< 1 \\;\\Rightarrow\\; \\text{converges}' : '\\geq 1 \\;\\Rightarrow\\; \\text{diverges}'}`} />
                    </div>
                  </div>
                )}
                {(showAllSteps ? iterationSteps : iterationSteps.slice(0, 5)).map((step, index) => (
                  <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Iteration {step.iter}</span>
                      <span>Next Approximation</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1">
                      <BlockMath math={`x^{(${step.iter})} = g(x^{(${step.iter - 1})}) = g(${step.x_n.toFixed(6)}) = ${step.x_next.toFixed(6)}`} />
                    </div>
                    <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300 text-center">
                      <InlineMath math={`|x_{${step.iter}} - x_{${step.iter - 1}}| = ${Math.abs(step.x_next - step.x_n).toFixed(6)}`} />
                    </div>
                  </div>
                ))}
                {!showAllSteps && iterationSteps.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Click to expand and view remaining {iterationSteps.length - 5} step derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="fixed-point-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Iteration Cobweb Plot
                </h4>
                <EditorialExportButton
                  title="Fixed Point Graph Plot"
                  targetId="fixed-point-plot-container"
                  label="Export Graph"
                  variant="outline"
                  size="sm"
                />
              </div>

              <div id="graphCanvas" className="w-full">
                <UnifiedPlot
                  iterations={iterationSteps}
                  functionInput={functionInput}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default FixedPointMethod;
