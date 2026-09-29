'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import UnifiedPlot from '@/app/components/UnifiedPlot';
import { parseUserFunction } from "@/app/utils/evaluateMath";
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const SecantMethod = () => {
  const [functionInput, setFunctionInput] = useState("x^3 - 2*x - 5");
  const [x0Input, setX0Input] = useState("2");
  const [x1Input, setX1Input] = useState("3");
  const [tolerance, setTolerance] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);
  const [result, setResult] = useState(null);
  const [iterations, setIterations] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all');
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [demoInProgress, setDemoInProgress] = useState(false);

  const secantSolver = (f, x0, x1, tol, maxIterations) => {
    const iters = [];
    let prevX = x0;
    let currX = x1;

    for (let i = 1; i <= maxIterations; i++) {
      const fprev = f(prevX);
      const fcurr = f(currX);
      const denom = fcurr - fprev;

      if (Math.abs(denom) < 1e-14) {
        return { message: `Denominator near zero at iteration ${i}. Method failed.`, iterations: iters, failed: true };
      }

      const nextX = currX - fcurr * (currX - prevX) / denom;
      const ea = Math.abs((nextX - currX) / nextX) * 100;
      const fnext = f(nextX);

      iters.push({
        iteration: i,
        x0: prevX,
        x1: currX,
        x2: nextX,
        fx0: fprev,
        fx1: fcurr,
        fx2: fnext,
        ea,
        // For UnifiedPlot compatibility
        a: prevX,
        b: currX,
        c: nextX,
        fa: fprev,
        fb: fcurr,
        fc: fnext,
      });

      if (Math.abs(fnext) < tol || Math.abs(nextX - currX) < tol) {
        return {
          message: `Root found at x = ${nextX.toFixed(8)} after ${i} iterations (tolerance ${tol})`,
          iterations: iters,
          failed: false,
        };
      }

      prevX = currX;
      currX = nextX;
    }

    return {
      message: `Max iterations reached. Approximate root at x = ${currX.toFixed(8)}`,
      iterations: iters,
      failed: false,
    };
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setIterations([]);

    let f;
    try {
      f = parseUserFunction(functionInput);
      f(0);
    } catch {
      setError("Invalid function. Use expressions like x^3 - 2*x - 5");
      return;
    }

    const x0 = parseFloat(x0Input);
    const x1 = parseFloat(x1Input);
    if (isNaN(x0) || isNaN(x1)) { setError("x₀ and x₁ must be valid numbers."); return; }
    if (x0 === x1) { setError("x₀ and x₁ must be different."); return; }

    const { message, iterations: iters, failed } = secantSolver(f, x0, x1, tolerance, maxIter);
    if (failed) { setError(message); return; }
    setResult(message);
    setIterations(iters);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput("x^3 - 2*x - 5");
    setX0Input("2");
    setX1Input("3");
    setTolerance(0.0001);
    setMaxIter(50);
    setError('');

    setTimeout(() => {
      try {
        const f = parseUserFunction("x^3 - 2*x - 5");
        const { message, iterations: iters } = secantSolver(f, 2, 3, 0.0001, 50);
        setResult(message);
        setIterations(iters);
      } catch {
        setError("Demo failed.");
      }
      setDemoInProgress(false);
    }, 50);
  };

  const handleReset = () => {
    setFunctionInput("x^3 - 2*x - 5");
    setX0Input("2");
    setX1Input("3");
    setTolerance(0.0001);
    setMaxIter(50);
    setResult(null);
    setIterations([]);
    setError('');
  };

  const exportData = iterations.map((iter) => ({
    Iteration: iter.iteration,
    'x₀': iter.x0.toFixed(8),
    'x₁': iter.x1.toFixed(8),
    'x₂ (New)': iter.x2.toFixed(8),
    'f(x₀)': iter.fx0.toFixed(8),
    'f(x₁)': iter.fx1.toFixed(8),
    'f(x₂)': iter.fx2.toFixed(8),
    'Ea (%)': iter.ea.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      {/* Control Card */}
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              ROOT FINDER LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Secant Method Interactive Engine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <EditorialButton variant="secondary" size="sm" onClick={handleDemo} disabled={demoInProgress}>
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton variant="outline" size="sm" onClick={handleReset}>
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
            <div className="md:col-span-3 space-y-1.5">
              <label htmlFor="sec-function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text" id="sec-function" value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="e.g., x^3 - 2*x - 5" required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sec-x0" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Initial Guess <InlineMath math="x_0" />
              </label>
              <input
                type="number" id="sec-x0" step="any" value={x0Input}
                onChange={(e) => setX0Input(e.target.value)} required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sec-x1" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Second Guess <InlineMath math="x_1" />
              </label>
              <input
                type="number" id="sec-x1" step="any" value={x1Input}
                onChange={(e) => setX1Input(e.target.value)} required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sec-tol" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Tolerance <InlineMath math="\epsilon" />
              </label>
              <input
                type="number" id="sec-tol" step="0.00001" value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)} required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <EditorialButton type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              <FiCheckCircle className="w-4 h-4 mr-2" /> Find Root
            </EditorialButton>
          </div>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Convergence Reached ({iterations.length} iterations)
              </span>
              <span className="text-base md:text-lg font-mono font-black">{result}</span>
            </div>
            <EditorialExportButton
              title="Secant Method Report"
              elementId="secant-results-container"
              exportData={exportData}
              variant="accent" size="sm"
            />
          </div>
        )}
      </div>

      {/* Output Sections */}
      {iterations.length > 0 && (
        <div id="secant-results-container" className="space-y-6">

          {/* Tab Nav */}
          <div className="flex items-center justify-between border-b-2 border-black dark:border-neutral-700 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {['all', 'table', 'steps', 'plot'].map((tab) => (
                <button key={tab} type="button" onClick={() => setViewTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                    viewTab === tab
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}>
                  {tab === 'table' && <FiList className="w-3.5 h-3.5" />}
                  {tab === 'steps' && <FiLayers className="w-3.5 h-3.5" />}
                  {tab === 'plot' && <FiTrendingUp className="w-3.5 h-3.5" />}
                  {tab === 'all' ? 'All Views' : tab === 'table' ? 'Iteration Table' : tab === 'steps' ? 'Step Derivations' : 'Convergence Plot'}
                </button>
              ))}
            </div>
            <EditorialExportButton
              title="Secant Method Report"
              elementId="secant-results-container"
              exportData={exportData} size="sm"
            />
          </div>

          {/* Iteration Table */}
          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Secant Iteration Log
              </h4>
              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      {['Iter', 'x₀', 'x₁', 'x₂ (New Root)', 'f(x₀)', 'f(x₁)', 'f(x₂)', 'Ea (%)'].map((h) => (
                        <th key={h} className="p-3 border-r border-neutral-700 dark:border-neutral-300 last:border-r-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {iterations.map((iter, index) => (
                      <tr key={index} className={
                        index === iterations.length - 1
                          ? 'bg-emerald-500 text-white font-bold'
                          : index % 2 === 0
                          ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                          : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                      }>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.iteration}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.x0.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.x1.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{iter.x2.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.fx0.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.fx1.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.fx2.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{iter.ea.toFixed(4)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step Derivations */}
          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="secant-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Secant Derivations ({iterations.length} Steps)
                </h4>
                {iterations.length > 5 && (
                  <button type="button" onClick={() => setShowAllSteps(!showAllSteps)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all">
                    {showAllSteps ? 'Show First 5 Steps' : `Show All ${iterations.length} Steps`}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {(showAllSteps ? iterations : iterations.slice(0, 5)).map((iter, index) => (
                  <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Iteration {iter.iteration}</span>
                      <span>Secant Step</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1">
                      <BlockMath math={`x_2 = ${iter.x1.toFixed(6)} - ${iter.fx1.toFixed(6)} \\cdot \\frac{${iter.x1.toFixed(6)} - ${iter.x0.toFixed(6)}}{${iter.fx1.toFixed(6)} - ${iter.fx0.toFixed(6)}} = ${iter.x2.toFixed(6)}`} />
                    </div>
                    <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300 text-center">
                      <InlineMath math={`f(x_2) = ${iter.fx2.toFixed(6)}`} /> &rarr; Ea = {iter.ea.toFixed(4)}%
                    </div>
                  </div>
                ))}
                {!showAllSteps && iterations.length > 5 && (
                  <div className="text-center pt-2">
                    <button type="button" onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Click to expand and view remaining {iterations.length - 5} step derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plot */}
          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="secant-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Interactive Function Plot
              </h4>
              <div className="w-full">
                <UnifiedPlot iterations={iterations} functionInput={functionInput} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecantMethod;
