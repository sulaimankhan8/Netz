'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import UnifiedPlot from '@/app/components/UnifiedPlot';
import { parseUserFunction, checkParses, substituteTex } from "@/app/utils/evaluateMath";
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { plural, fixed } from '@/app/utils/numberFormat';
import SetupSteps from '@/app/components/SetupSteps';
import ConvergenceBanner from '@/app/components/ConvergenceBanner';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';
import { useLoadInput, solveSoon } from '@/app/components/method/calcDemo';

const FalsePositionMethod = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState("x^3 - 4*x - 9");
  const [tolerance, setTolerance] = useState(0.0001);
  const [result, setResult] = useState(null);
  useRecordSolve('false-position', 1, result, () => ({ fn: functionInput }));
  useCodeExportInputs('false-position', () => ({ f: functionInput, tol: tolerance }));
  const [intervalSteps, setIntervalSteps] = useState([]);
  const [falsePositionIterations, setFalsePositionIterations] = useState([]);
  const [error, setError] = useState('');
  const [iterationsCount, setIterationsCount] = useState(0);
  const [viewTab, setViewTab] = useState('all');
  const [showAllSteps, setShowAllSteps] = useState(false);

  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setTolerance(0.0001);
    } else {
      setTolerance(value);
    }
  };

  const findInterval = (f, maxRange = 1000, step = 1) => {
    const steps = [];
    let fa, fb, a, b;

    const evaluateFunction = (x) => {
      try {
        const fx = f(x);
        steps.push(`f(${x}) = ${fx.toFixed(6)}`);
        return fx;
      } catch {
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
      return { interval: [a, a], exactRoot: a, steps };
    } else {
      for (let x = a + step; x <= maxRange; x += step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;
        if (fx === 0) {
          steps.push(`Exact root found at x = ${x}`);
          return { interval: [x, x], exactRoot: x, steps };
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

    steps.push(`Searching in negative direction.`);
    a = 0;
    fa = evaluateFunction(a);
    if (fa !== null) {
      for (let x = a - step; x >= -maxRange; x -= step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;
        if (fx === 0) {
          steps.push(`Exact root found at x = ${x}`);
          return { interval: [x, x], exactRoot: x, steps };
        }
        if (fa * fx < 0) {
          b = a;
          a = x;
          steps.push(`Sign change detected between x = ${a} and x = ${b}`);
          return { interval: [a, b], steps };
        }
        a = x;
        fa = fx;
      }
    }

    return { interval: null, steps };
  };

  const falsePositionMethod = (f, a, b, tol, maxIter = 100) => {
    let iterations = [];
    let c = a;
    let prevC = null;
    let iter = 0;

    while (iter < maxIter) {
      iter++;
      const fa = f(a);
      const fb = f(b);
      c = (a * fb - b * fa) / (fb - fa);
      const fc = f(c);

      iterations.push({ iteration: iter, a, b, c, fa, fb, fc });

      // Stop when f(c) is small enough, or the intercept has stopped moving
      if (Math.abs(fc) < tol || (prevC !== null && Math.abs(c - prevC) < tol)) {
        return {
          message: `Root found at x = ${c.toFixed(6)} with tolerance ${tol}`,
          iterations,
        };
      }
      prevC = c;

      if (fa * fc < 0) {
        b = c;
      } else {
        a = c;
      }
    }

    return {
      message: `Tolerance not met within the iteration limit. Last estimate x = ${c.toFixed(6)} is not a confirmed root.`,
      iterations,
    };
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setIntervalSteps([]);
    setFalsePositionIterations([]);
    setIterationsCount(0);

    let f;
    try {
      f = parseUserFunction(functionInput);
      checkParses(f);
    } catch {
      setError("Invalid function input. Please enter a valid mathematical expression.");
      return;
    }

    const { interval, exactRoot, steps: intervalLog } = findInterval(f, 1000);
    setIntervalSteps(intervalLog);

    if (!interval) {
      setError("Could not find an interval where the function changes sign.");
      return;
    }

    const { message, iterations } = exactRoot !== undefined
      ? exactRootResult(exactRoot)
      : falsePositionMethod(f, interval[0], interval[1], tolerance);

    setResult(message);
    setFalsePositionIterations(iterations);
    setIterationsCount(iterations.length);
  };

  // The sign-change search hit f(x) = 0 exactly, so no chord iterations are needed
  const exactRootResult = (x) => ({
    message: `f(${x}) = 0 exactly, so x = ${x} is the root (found while searching for a sign change; no iterations needed)`,
    iterations: [],
  });

  // Values sent with loadIntoCalculator() (calcDemo.js) load here and solve

  useLoadInput((v) => { setFunctionInput(v.f); if (v.tol) setTolerance(Number(v.tol)); solveSoon(); });


  const handleDemo = () => {
    setDemoInProgress(true);
    const demoFn = "x^3 - 4*x - 9";
    const demoTol = 0.0001;

    setFunctionInput(demoFn);
    setTolerance(demoTol);
    setError('');

    let f;
    try {
      f = parseUserFunction(demoFn);
      checkParses(f);
    } catch {
      setError("Invalid demo function input.");
      setDemoInProgress(false);
      return;
    }

    const { interval, exactRoot, steps: intervalLog } = findInterval(f, 1000);
    setIntervalSteps(intervalLog);

    if (!interval) {
      setError("Could not auto-detect interval.");
      setDemoInProgress(false);
      return;
    }

    const { message, iterations } = exactRoot !== undefined
      ? exactRootResult(exactRoot)
      : falsePositionMethod(f, interval[0], interval[1], demoTol);

    setResult(message);
    setFalsePositionIterations(iterations);
    setIterationsCount(iterations.length);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput("x^3 - 4*x - 9");
    setTolerance(0.0001);
    setResult(null);
    setIntervalSteps([]);
    setFalsePositionIterations([]);
    setError('');
    setIterationsCount(0);
  };

  const exportData = falsePositionIterations.map((iter) => ({
    Iteration: iter.iteration,
    a: iter.a.toFixed(6),
    b: iter.b.toFixed(6),
    'c (Chord Root)': iter.c.toFixed(6),
    'f(a)': iter.fa.toFixed(6),
    'f(b)': iter.fb.toFixed(6),
    'f(c)': iter.fc.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              REGULA-FALSI LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              False Position Interactive Engine
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
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function Expression <InlineMath math="f(x)" />
              </label>
              <input
                type="text" maxLength={2000}
                id="function"
                value={functionInput}
                onChange={handleFunctionChange}
                placeholder="e.g., x^2 - 4"
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
                step="0.00001"
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
              <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Root
            </EditorialButton>
          </div>
        </form>

        {result && (
          <ConvergenceBanner
            converged={/^Root found|is the root/.test(result)}
            count={iterationsCount}
            action={(
              <EditorialExportButton
                title="False Position Method Report"
                elementId="false-position-results-container"
                exportData={exportData}
                variant="accent"
                size="sm"
              />
            )}
          >
            {result}
          </ConvergenceBanner>
        )}
      </div>

      {falsePositionIterations.length > 0 && (
        <div id="false-position-results-container" className="space-y-6">
          <SetupSteps lines={intervalSteps} title="Step 0: Find an interval where f(x) changes sign" />
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Chord Plot
              </button>
            </div>

            <EditorialExportButton
              title="False Position Method Report"
              elementId="false-position-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> False Position Iteration Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">a</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">b</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">c (Chord Root)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f(a)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">f(b)</th>
                      <th className="p-3">f(c)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {falsePositionIterations.map((iter, index) => (
                      <tr
                        key={index}
                        className={
                          index === falsePositionIterations.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{iter.iteration}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{fixed(iter.a, 6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{fixed(iter.b, 6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{fixed(iter.c, 6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{fixed(iter.fa, 6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{fixed(iter.fb, 6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{fixed(iter.fc, 6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="false-position-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Secant Chord Interpolation ({plural(falsePositionIterations.length, 'Total Step')})
                </h4>
                <div className="flex items-center gap-2">
                  {falsePositionIterations.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(!showAllSteps)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      {showAllSteps ? 'Show First 5 Steps' : `Show All ${falsePositionIterations.length} Steps`}
                    </button>
                  )}
                  <EditorialExportButton
                    title="False Position Steps"
                    targetId="false-position-steps-container"
                    label="Export Steps"
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              {/* 1. The formula used in every iteration */}
              <div className="p-4 md:p-5 border-2 border-black/80 dark:border-neutral-600 rounded-xl bg-[#FAF8F5] dark:bg-neutral-800 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">The formula used in every iteration</div>
                <div className="overflow-x-auto text-center text-black dark:text-white">
                  <BlockMath math={`c = \\frac{a \\cdot f(b) - b \\cdot f(a)}{f(b) - f(a)}`} />
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <InlineMath math="c" /> is where the straight line from <InlineMath math="(a, f(a))" /> to <InlineMath math="(b, f(b))" /> crosses the x-axis. Work out <InlineMath math="f(c)" />: if it has the same sign as <InlineMath math="f(a)" />, <InlineMath math="a" /> becomes <InlineMath math="c" />; otherwise <InlineMath math="b" /> becomes <InlineMath math="c" />. Stop when <InlineMath math="|f(c)|" /> or the change <InlineMath math="|c_k - c_{k-1}|" /> is smaller than the tolerance <InlineMath math={`\\varepsilon = ${tolerance}`} />.
                </p>
              </div>

              {/* 2. Each iteration with every number put in */}
              <div className="space-y-3">
                {(showAllSteps ? falsePositionIterations : falsePositionIterations.slice(0, 5)).map((iter) => {
                  const n6 = (v) => Number(v.toFixed(6));
                  const br = (v) => (v < 0 ? `(${n6(v)})` : `${n6(v)}`);
                  const sgn = (v) => (v < 0 ? '< 0' : v > 0 ? '> 0' : '= 0');
                  const i = iter.iteration;
                  const prev = falsePositionIterations[i - 2];
                  const isLast = iter === falsePositionIterations[falsePositionIterations.length - 1];
                  const sub = substituteTex(functionInput, iter.c);
                  const sameSign = iter.fa * iter.fc > 0;
                  return (
                    <div key={i} className="p-4 md:p-5 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2 text-black dark:text-white">
                      <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                        <span>Iteration {i}</span>
                        <span>[a, b] = [{n6(iter.a)}, {n6(iter.b)}]</span>
                      </div>
                      <div className="overflow-x-auto text-center">
                        <BlockMath math={`f(a) = f(${n6(iter.a)}) = ${n6(iter.fa)}`} />
                        <BlockMath math={`f(b) = f(${n6(iter.b)}) = ${n6(iter.fb)}`} />
                        <BlockMath math={`c_{${i}} = \\frac{${br(iter.a)}(${n6(iter.fb)}) - ${br(iter.b)}(${n6(iter.fa)})}{${n6(iter.fb)} - ${br(iter.fa)}}`} />
                        <BlockMath math={`= \\frac{${n6(iter.a * iter.fb - iter.b * iter.fa)}}{${n6(iter.fb - iter.fa)}} = ${n6(iter.c)}`} />
                        <BlockMath math={`f(${n6(iter.c)}) = ${sub ? `${sub} = ` : ''}${n6(iter.fc)}`} />
                      </div>
                      <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {isLast ? (
                          <>
                            Check the stopping rule:
                            <div className="overflow-x-auto text-center text-black dark:text-white">
                              {Math.abs(iter.fc) < tolerance
                                ? <BlockMath math={`|f(c_{${i}})| = ${Math.abs(n6(iter.fc))} < ${tolerance}`} />
                                : <BlockMath math={`|c_{${i}} - c_{${i - 1}}| = |${n6(iter.c)} - ${n6(prev.c)}| = ${n6(Math.abs(iter.c - prev.c))} < ${tolerance}`} />}
                              <BlockMath math={`\\text{Root: } x \\approx ${n6(iter.c)}`} />
                            </div>
                          </>
                        ) : (
                          <>
                            <InlineMath math={`f(c) ${sgn(iter.fc)}`} /> has the {sameSign ? 'same sign as' : 'opposite sign to'} <InlineMath math={`f(a) ${sgn(iter.fa)}`} />, so set <InlineMath math={sameSign ? `a = ${n6(iter.c)}` : `b = ${n6(iter.c)}`} />.
                            {prev && <> The guess moved by <InlineMath math={`|c_{${i}} - c_{${i - 1}}| = ${n6(Math.abs(iter.c - prev.c))}`} />, not yet below <InlineMath math={`${tolerance}`} />.</>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!showAllSteps && falsePositionIterations.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Click to expand and view remaining {falsePositionIterations.length - 5} step derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="false-position-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Interactive Function Plot
                </h4>
                <EditorialExportButton
                  title="False Position Graph Plot"
                  targetId="false-position-plot-container"
                  label="Export Graph"
                  variant="outline"
                  size="sm"
                />
              </div>

              <div id="graphCanvas" className="w-full">
                <UnifiedPlot
                  iterations={falsePositionIterations}
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

export default FalsePositionMethod;
