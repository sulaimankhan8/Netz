'use client';
import { useRecordSolve } from '@/app/utils/activity';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { parseUserFunction } from '@/app/utils/evaluateMath';
import Plot from '@/app/components/UnifiedPlot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const ModifiedEulerSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [functionInput, setFunctionInput] = useState('x + y');
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const [stepH, setStepH] = useState(0.1);
  const [targetX, setTargetX] = useState(0.3);

  const [result, setResult] = useState(null);
  useRecordSolve('modified-euler', 4, result);
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

  const calculateModifiedEuler = (fExpr, xStartVal, yStartVal, hVal, targetVal) => {
    setError('');
    const xStart = parseFloat(xStartVal);
    const yStart = parseFloat(yStartVal);
    const h = parseFloat(hVal);
    const xTarget = parseFloat(targetVal);

    if (isNaN(xStart) || isNaN(yStart) || isNaN(h) || isNaN(xTarget) || h <= 0) {
      setError('Please enter valid numerical inputs and a positive step size (h > 0).');
      return;
    }
    if (xTarget <= xStart) {
      setError('Target evaluation point (x) must be strictly greater than initial x0.');
      return;
    }

    let f;
    try {
      f = parseUserFunction(fExpr, ['x', 'y']);
      f(xStart, yStart);
    } catch (err) {
      setError('Invalid function input. Please enter a valid function of x and y, like x + y.');
      return;
    }

    const stepsCount = Math.round((xTarget - xStart) / h);
    const log = [];
    log.push(`Solving ODE dy/dx = ${fExpr}`);
    log.push(`Initial Condition: y(${xStart}) = ${yStart}`);
    log.push(`Step Size h = ${h}, Target Evaluation Point x = ${xTarget}`);
    log.push(`Estimated Total Steps = ${stepsCount}`);

    let currentX = xStart;
    let currentY = yStart;
    const history = [];

    for (let step = 1; step <= stepsCount; step++) {
      let slope1 = 0;
      try {
        slope1 = f(currentX, currentY);
      } catch (err) {
        setError(`Evaluation error at step ${step} (x = ${currentX.toFixed(4)}).`);
        return;
      }

      const yPredictor = currentY + h * slope1;
      const nextX = currentX + h;

      let slope2 = 0;
      try {
        slope2 = f(nextX, yPredictor);
      } catch (err) {
        setError(`Evaluation error at predictor step ${step} (nextX = ${nextX.toFixed(4)}).`);
        return;
      }

      const yCorrector = currentY + (h / 2) * (slope1 + slope2);

      history.push({
        step,
        x: currentX,
        y: currentY,
        nextX,
        slope1,
        yPredictor,
        slope2,
        yCorrector,
      });

      currentX = nextX;
      currentY = yCorrector;
    }

    setGridLog(log);
    setStepsData(history);
    setResult({
      targetX: currentX,
      finalY: currentY,
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateModifiedEuler(functionInput, x0, y0, stepH, targetX);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput('x + y');
    setX0(0);
    setY0(1);
    setStepH(0.1);
    setTargetX(0.3);
    calculateModifiedEuler('x + y', 0, 1, 0.1, 0.3);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setFunctionInput('x + y');
    setX0(0);
    setY0(1);
    setStepH(0.1);
    setTargetX(0.3);
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    'Step n': row.step,
    x_n: row.x.toFixed(4),
    y_n: row.y.toFixed(6),
    'Predictor y_{n+1}^{(0)}': row.yPredictor.toFixed(6),
    'Corrector y_{n+1}^{(1)}': row.yCorrector.toFixed(6),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Predictor-corrector ODE calculator
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Modified Euler (Heun&apos;s) Engine
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Solution
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Modified Euler Solution Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                y({result.targetX.toFixed(4)}) ≈ {result.finalY.toFixed(6)}
              </span>
            </div>

            <EditorialExportButton
              title="Modified Euler Method Report"
              elementId="mod-euler-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="mod-euler-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Predictor-Corrector Table
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
                <FiLayers className="w-3.5 h-3.5" /> Step Derivation
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
                <FiTrendingUp className="w-3.5 h-3.5" /> Solution Trajectory
              </button>
            </div>

            <EditorialExportButton
              title="Modified Euler Method Report"
              elementId="mod-euler-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Predictor-Corrector Iteration Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Step n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x_n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">y_n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Predictor y_{'{n+1}^{(0)}'}</th>
                      <th className="p-3">Corrector y_{'{n+1}^{(1)}'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepsData.map((row, idx) => (
                      <tr
                        key={row.step}
                        className={
                          idx === stepsData.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : idx % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.step}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.x.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.y.toFixed(6)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-mono">{row.yPredictor.toFixed(6)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.yCorrector.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Predictor-Corrector Formula Derivation
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-4 font-mono text-xs">
                {stepsData.map((row) => (
                  <div key={row.step} className="p-3 border-b border-neutral-200 dark:border-neutral-700 last:border-none space-y-2">
                    <span className="font-bold text-neutral-500 uppercase block">Step {row.step}: x_{row.step - 1} = {row.x.toFixed(4)} to x_{row.step} = {row.nextX.toFixed(4)}</span>
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg space-y-1">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 block">Predictor Step:</span>
                      <BlockMath math={`y_{${row.step}}^{(0)} = ${row.y.toFixed(6)} + (${stepH}) \\times (${row.slope1.toFixed(6)}) = ${row.yPredictor.toFixed(6)}`} />
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-neutral-900 rounded-lg space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Corrector Step:</span>
                      <BlockMath math={`y_{${row.step}}^{(1)} = ${row.y.toFixed(6)} + \\frac{${stepH}}{2} \\left[ ${row.slope1.toFixed(6)} + ${row.slope2.toFixed(6)} \\right] = ${row.yCorrector.toFixed(6)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Solution Trajectory Plot
              </h4>

              <div id="graphCanvas" className="w-full">
                <Plot
                  steps={[{ step: 0, x: parseFloat(x0), y: parseFloat(y0) }, ...stepsData.map(s => ({ step: s.step, x: s.nextX, y: s.yCorrector }))]}
                  title="Modified Euler (Heun's) Trajectory Curve"
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ModifiedEulerSolver;
