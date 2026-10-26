'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import UnifiedPlot from '@/app/components/UnifiedPlot';
import { parseUserFunction } from "@/app/utils/evaluateMath";
import { EditorialButton, EditorialExportButton, EditorialStepViewer } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const BisectionMethod = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState("x * x * x - 4 * x - 9"); // Default function
  const [tolerance, setTolerance] = useState(0.05);
  const [result, setResult] = useState(null);
  useRecordSolve('bisection', 1, result, () => ({ fn: functionInput }));
  useCodeExportInputs('bisection', () => ({ f: functionInput, tol: tolerance }));
  const [intervalSteps, setIntervalSteps] = useState([]);
  const [bisectionIterations, setBisectionIterations] = useState([]);
  const [error, setError] = useState('');
  const [iterationsCount, setIterationsCount] = useState(0);
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'
  const [showAllSteps, setShowAllSteps] = useState(false);

  // Handle input changes
  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setTolerance(0.05);
    } else {
      setTolerance(value);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setIntervalSteps([]);
    setBisectionIterations([]);
    setIterationsCount(0);

    // Convert user input to a function safely
    let f;
    try {
      f = parseUserFunction(functionInput);
      f(0);
    } catch (err) {
      setError("Invalid function input. Please enter a valid mathematical expression like x^3 - 4*x - 9.");
      return;
    }

    // Find interval
    const { interval, steps: intervalLog } = findInterval(f, 1000);
    setIntervalSteps(intervalLog);

    if (!interval) {
      setError("Could not find an interval where the function changes sign within the search range.");
      return;
    }

    const [a, b] = interval;

    // Perform Bisection Method
    const { message, iterations } = bisectionMethod(f, a, b, tolerance);

    setResult(message);
    setBisectionIterations(iterations);
    setIterationsCount(iterations.length);
  };

  // Function to find interval automatically
  const findInterval = (f, maxRange = 1000, step = 1) => {
    const steps = [];
    let fa, fb, a, b;

    const evaluateFunction = (x) => {
      try {
        const fx = f(x);
        steps.push(`f(${x}) = ${fx.toFixed(6)}`);
        return fx;
      } catch (err) {
        steps.push(`Error evaluating function at x = ${x}`);
        return null;
      }
    };

    a = 0;
    fa = evaluateFunction(a);
    if (fa === null) {
      steps.push(`Skipping positive direction due to evaluation error at x = ${a}`);
    } else if (fa === 0) {
      steps.push(`Exact root found at x = ${a}`);
      return { interval: [a - 1, a + 1], steps };
    } else {
      for (let x = a + step; x <= maxRange; x += step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;

        if (fx === 0) {
          steps.push(`Exact root found at x = ${x}, Sign change detected between x = ${x - 1} and x = ${x + 1}`);
          return { interval: [x - 1, x + 1], steps };
        }

        if (fa * fx < 0) {
          b = x;
          fb = fx;
          steps.push(`Sign change detected between x = ${a} and x = ${b}`);
          return { interval: [a, b], steps };
        }

        a = x;
        fa = fx;
      }
    }

    steps.push(`No valid interval found in positive direction up to x = ${maxRange}. Searching in negative direction.`);

    a = 0;
    fa = evaluateFunction(a);
    if (fa === null) {
      steps.push(`Skipping negative direction due to evaluation error at x = ${a}`);
      return { interval: null, steps };
    } else if (fa === 0) {
      steps.push(`Exact root found at x = ${a}`);
      return { interval: [a, a], steps };
    } else {
      for (let x = a - step; x >= -maxRange; x -= step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;

        if (fx === 0) {
          steps.push(`Exact root found at x = ${x}`);
          return { interval: [x, x], steps };
        }

        if (fa * fx < 0) {
          b = a;
          a = x;
          fb = fa;
          fa = fx;
          steps.push(`Sign change detected between x = ${a} and x = ${b}`);
          return { interval: [a, b], steps };
        }

        a = x;
        fa = fx;
      }
    }

    steps.push(`No valid interval found in negative direction up to x = -${maxRange}.`);
    return { interval: null, steps };
  };

  const bisectionMethod = (f, a, b, tol, maxIter = 100) => {
    let iterations = [];
    let c = a;
    let iter = 0;

    while (iter < maxIter) {
      iter++;
      c = (a + b) / 2;
      const fa = f(a);
      const fb = f(b);
      const fc = f(c);

      iterations.push({ iteration: iter, a, b, c, fa, fb, fc });

      // Stop when the root is pinned within tol: half the interval width (or an exact hit)
      if (fc === 0 || (b - a) / 2 < tol) {
        return {
          message: `Root found at x = ${c.toFixed(6)} with tolerance ${tol}`,
          iterations,
        };
      }

      if (fa * fc < 0) {
        b = c;
      } else {
        a = c;
      }
    }

    return {
      message: `Max iterations reached. Approximate root at x = ${c.toFixed(6)}`,
      iterations,
    };
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    const demoFn = "x * x * x - 4 * x - 9";
    const demoTol = 0.05;

    setFunctionInput(demoFn);
    setTolerance(demoTol);
    setError('');

    let f;
    try {
      f = parseUserFunction(demoFn);
      f(0);
    } catch {
      setError("Invalid demo function input.");
      setDemoInProgress(false);
      return;
    }

    const evaluateFunction = (xVal) => {
      try {
        return f(xVal);
      } catch {
        return null;
      }
    };

    const steps = [];
    let a = 0;
    let fa = evaluateFunction(a);
    let detectedInterval = null;

    if (fa !== null) {
      steps.push(`f(${a}) = ${fa.toFixed(6)}`);
      for (let x = 1; x <= 100; x += 1) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;
        steps.push(`f(${x}) = ${fx.toFixed(6)}`);
        if (fa * fx < 0) {
          detectedInterval = [a, x];
          steps.push(`Sign change detected between x = ${a} and x = ${x}`);
          break;
        }
        a = x;
        fa = fx;
      }
    }

    setIntervalSteps(steps);

    if (!detectedInterval) {
      setError("Could not auto-detect a root-containing interval.");
      setDemoInProgress(false);
      return;
    }

    const [intA, intB] = detectedInterval;
    const bisectionResult = bisectionMethod(f, intA, intB, demoTol);
    setResult(bisectionResult.message);
    setBisectionIterations(bisectionResult.iterations);
    setIterationsCount(bisectionResult.iterations.length);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput("x * x * x - 4 * x - 9");
    setTolerance(0.05);
    setResult(null);
    setIntervalSteps([]);
    setBisectionIterations([]);
    setError('');
    setIterationsCount(0);
  };

  // Convert iterations to CSV for export
  const exportData = bisectionIterations.map((iter) => ({
    Iteration: iter.iteration,
    a: iter.a.toFixed(6),
    b: iter.b.toFixed(6),
    'c (Midpoint)': iter.c.toFixed(6),
    'f(a)': iter.fa.toFixed(6),
    'f(b)': iter.fb.toFixed(6),
    'f(c)': iter.fc.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      {/* Control Card */}
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              ROOT FINDER LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Bisection Method Interactive Engine
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

        {/* Solver Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text"
                id="function"
                value={functionInput}
                onChange={handleFunctionChange}
                placeholder="e.g., x^3 - 4*x - 9"
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
                placeholder="e.g., 0.05"
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

        {/* Results Banner */}
        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Convergence Reached ({iterationsCount} iterations)
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                {result}
              </span>
            </div>

            <EditorialExportButton
              title="Bisection Method Report"
              elementId="bisection-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Output & Visualizer Sections */}
      {bisectionIterations.length > 0 && (
        <div id="bisection-results-container" className="space-y-6">
          <SetupSteps lines={intervalSteps} title="Step 0: Find an interval where f(x) changes sign" />
          
          {/* Sub-navigation Tabs */}
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Convergence Plot
              </button>
            </div>

            <EditorialExportButton
              title="Bisection Method Report"
              elementId="bisection-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {/* Iteration Table View */}
          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Bisection Iteration Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">a</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">b</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">c (Midpoint)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f(a)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f(b)</th>
                      <th className="p-3">f(c)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bisectionIterations.map((iter, index) => (
                      <tr
                        key={index}
                        className={
                          index === bisectionIterations.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.iteration}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.a.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.b.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{iter.c.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.fa.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.fb.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{iter.fc.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Step Derivations View */}
          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="bisection-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Interval Halving ({bisectionIterations.length} Total Steps)
                </h4>
                <div className="flex items-center gap-2">
                  {bisectionIterations.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(!showAllSteps)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      {showAllSteps ? 'Show First 5 Steps' : `Show All ${bisectionIterations.length} Steps`}
                    </button>
                  )}
                  <EditorialExportButton
                    title="Bisection Step Derivations"
                    targetId="bisection-steps-container"
                    label="Export Steps"
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <div className="p-3 border border-black/30 dark:border-neutral-700 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs font-mono text-center text-black dark:text-white overflow-x-auto">
                <InlineMath math={`\\text{Steps needed: } \\frac{b-a}{2^k} < \\varepsilon \\iff k > \\log_2\\frac{${bisectionIterations[0].b} - ${bisectionIterations[0].a}}{${tolerance}} \\approx ${Math.log2((bisectionIterations[0].b - bisectionIterations[0].a) / tolerance).toFixed(2)}`} />
              </div>

              <div className="space-y-3">
                {(showAllSteps ? bisectionIterations : bisectionIterations.slice(0, 5)).map((iter, index) => (
                  <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Iteration {iter.iteration}</span>
                      <span>Midpoint Calculation</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1">
                      <BlockMath math={`c^{(${iter.iteration})} = \\frac{a + b}{2} = \\frac{${iter.a.toFixed(6)} + ${iter.b.toFixed(6)}}{2} = ${iter.c.toFixed(6)}`} />
                    </div>
                    <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300 text-center">
                      <InlineMath math={`f(c) = ${iter.fc.toFixed(6)}`} /> &rarr; {index === bisectionIterations.length - 1
                        ? (iter.fc === 0
                          ? `f(c) = 0 exactly, so c = ${iter.c} is the root.`
                          : `Half-width (b − a)/2 = ${((iter.b - iter.a) / 2).toFixed(6)} < ${tolerance}, so stop: root ≈ ${iter.c.toFixed(6)}.`)
                        : iter.fa * iter.fc < 0 ? 'Sign change in left interval [a, c]. New b = c.' : 'Sign change in right interval [c, b]. New a = c.'}
                    </div>
                  </div>
                ))}
                {!showAllSteps && bisectionIterations.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Click to expand and view remaining {bisectionIterations.length - 5} step derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plot View */}
          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="bisection-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Interactive Function Plot
                </h4>
                <EditorialExportButton
                  title="Bisection Graph Plot"
                  targetId="bisection-plot-container"
                  label="Export Graph"
                  variant="outline"
                  size="sm"
                />
              </div>

              <div id="graphCanvas" className="w-full">
                <UnifiedPlot
                  iterations={bisectionIterations}
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

export default BisectionMethod;

