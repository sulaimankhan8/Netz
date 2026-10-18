'use client';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { evaluateMath, getSymbolicDerivative, simplifyExpression, expressionToTex } from '@/app/utils/evaluateMath';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const TaylorSeriesSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState('x + y');
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const [targetX, setTargetX] = useState(0.2);

  const [result, setResult] = useState(null);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateTaylor = (fExpr, xStartVal, yStartVal, targetVal) => {
    setError('');
    const xStart = parseFloat(xStartVal);
    const yStart = parseFloat(yStartVal);
    const xTarget = parseFloat(targetVal);

    if (isNaN(xStart) || isNaN(yStart) || isNaN(xTarget)) {
      setError('Please enter valid numeric values for x0, y0, and target x.');
      return;
    }

    const h = xTarget - xStart;
    const log = [];
    log.push(`Initial Condition: (x0, y0) = (${xStart}, ${yStart})`);
    log.push(`Target Point x = ${xTarget}, Step Size h = x - x0 = ${h.toFixed(6)}`);

    // Differentiate y' = f(x, y) along the solution, where y' itself is f:
    //   y''  = f_x + f_y * f
    //   y''' = (y'')_x + (y'')_y * f
    let derivs;
    try {
      const fStr = simplifyExpression(fExpr);
      const totalDerivative = (g) =>
        simplifyExpression(`(${getSymbolicDerivative(g, 'x')}) + (${getSymbolicDerivative(g, 'y')}) * (${fStr})`);
      const y2Str = totalDerivative(fStr);
      const y3Str = totalDerivative(y2Str);
      const at = (g) => evaluateMath(g, { x: xStart, y: yStart });
      derivs = [
        { order: 1, expr: fStr, value: at(fStr) },
        { order: 2, expr: y2Str, value: at(y2Str) },
        { order: 3, expr: y3Str, value: at(y3Str) },
      ];
    } catch (err) {
      setError('Invalid function input. Please enter a valid function of x and y, like x + y.');
      return;
    }

    const [y1_val, y2_val, y3_val] = derivs.map((d) => d.value);

    const t1 = yStart;
    const t2 = h * y1_val;
    const t3 = ((h * h) / 2) * y2_val;
    const t4 = ((h * h * h) / 6) * y3_val;
    const approxY = t1 + t2 + t3 + t4;

    setGridLog(log);
    setResult({
      h,
      x0: xStart,
      derivs,
      y1_val,
      y2_val,
      y3_val,
      t1,
      t2,
      t3,
      t4,
      approxY,
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateTaylor(functionInput, x0, y0, targetX);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput('x + y');
    setX0(0);
    setY0(1);
    setTargetX(0.2);
    calculateTaylor('x + y', 0, 1, 0.2);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput('x + y');
    setX0(0);
    setY0(1);
    setTargetX(0.2);
    setResult(null);
    setGridLog([]);
    setError('');
  };

  const exportData = result ? [
    { Term: 'Order 0 (y0)', Formula: 'y0', Derivative: y0, Value: result.t1.toFixed(6) },
    { Term: "Order 1 (y')", Formula: "h * y'(x0)", Derivative: result.y1_val.toFixed(6), Value: result.t2.toFixed(6) },
    { Term: "Order 2 (y'')", Formula: "(h^2 / 2!) * y''(x0)", Derivative: result.y2_val.toFixed(6), Value: result.t3.toFixed(6) },
    { Term: "Order 3 (y''')", Formula: "(h^3 / 3!) * y'''(x0)", Derivative: result.y3_val.toFixed(6), Value: result.t4.toFixed(6) },
  ] : [];

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              SERIES EXPANSION ODE LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Taylor Series Expansion Engine
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
              <label htmlFor="function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Derivative Expression <InlineMath math="f(x, y) = \frac{dy}{dx}" />
              </label>
              <input
                type="text"
                id="function"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="e.g., x + y"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="targetX" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Target Evaluation Point (<InlineMath math="x_{target}" />)
              </label>
              <input
                type="number"
                step="any"
                id="targetX"
                value={targetX}
                onChange={(e) => setTargetX(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="x0" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Initial Condition (<InlineMath math="x_0" />)
              </label>
              <input
                type="number"
                step="any"
                id="x0"
                value={x0}
                onChange={(e) => setX0(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="y0" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Initial Value (<InlineMath math="y_0" />)
              </label>
              <input
                type="number"
                step="any"
                id="y0"
                value={y0}
                onChange={(e) => setY0(e.target.value)}
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Expand & Calculate
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Taylor Series Approximation Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                y({targetX}) ≈ {result.approxY.toFixed(6)}
              </span>
            </div>

            <EditorialExportButton
              title="Taylor Series Report"
              elementId="taylor-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {result && (
        <div id="taylor-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Series Terms Breakdown
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
                <FiLayers className="w-3.5 h-3.5" /> KaTeX Formula Derivation
              </button>
            </div>

            <EditorialExportButton
              title="Taylor Series Report"
              elementId="taylor-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Series Terms Expansion Breakdown
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Order Term</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Formula</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Derivative Value</th>
                      <th className="p-3">Term Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Order 0 (y_0)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">y_0</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{y0}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.t1.toFixed(6)}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Order 1 (y&apos;)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">h &middot; y&apos;(x_0)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.y1_val.toFixed(6)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.t2.toFixed(6)}</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Order 2 (y&apos;&apos;)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">(h^2 / 2!) &middot; y&apos;&apos;(x_0)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.y2_val.toFixed(6)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.t3.toFixed(6)}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Order 3 (y&apos;&apos;&apos;)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">(h^3 / 3!) &middot; y&apos;&apos;&apos;(x_0)</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.y3_val.toFixed(6)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.t4.toFixed(6)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Taylor Expansion Formula Substitution
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Step 1: Differentiate y&apos; = f(x, y) (replace y&apos; by f each time)</span>
                  {result.derivs.map((d) => {
                    const primes = "'".repeat(d.order);
                    const rule = d.order === 1
                      ? `y' = f(x, y)`
                      : `y${primes} = \\frac{\\partial y${"'".repeat(d.order - 1)}}{\\partial x} + \\frac{\\partial y${"'".repeat(d.order - 1)}}{\\partial y} \\cdot y'`;
                    return (
                      <div key={d.order} className="overflow-x-auto">
                        <BlockMath math={`${rule} = ${expressionToTex(d.expr)}`} />
                        <BlockMath math={`y${primes}(${result.x0}) = ${d.value.toFixed(6)}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Step 2: Expansion Formula (h = {result.h.toFixed(4)}):</span>
                  <BlockMath math={`y(x_0 + h) = y(x_0) + h \\cdot y'(x_0) + \\frac{h^2}{2!} y''(x_0) + \\frac{h^3}{3!} y'''(x_0)`} />
                  <BlockMath math={`y(${targetX}) = ${result.t1.toFixed(6)} + ${result.t2.toFixed(6)} + ${result.t3.toFixed(6)} + ${result.t4.toFixed(6)}`} />
                  <BlockMath math={`y(${targetX}) \\approx ${result.approxY.toFixed(6)}`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TaylorSeriesSolver;
