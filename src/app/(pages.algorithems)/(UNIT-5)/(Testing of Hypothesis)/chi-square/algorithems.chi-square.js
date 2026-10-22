'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { chiSquareCritical } from '@/app/utils/criticalValues';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const ChiSquareSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [observedInput, setObservedInput] = useState('20, 30, 25, 25');
  const [expectedInput, setExpectedInput] = useState('25, 25, 25, 25');

  const [result, setResult] = useState(null);
  useRecordSolve('chi-square', 5, result);
  useCodeExportInputs('chi-square', () => ({ observed: observedInput, expected: expectedInput }));
  const [stepsData, setStepsData] = useState([]);
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateChiSquare = (obsStr, expStr) => {
    setError('');
    setResult(null);
    setStepsData([]);

    const O = obsStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const E = expStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (O.length !== E.length || O.length < 2) {
      setError('Please enter equal numbers of observed and expected values (at least 2).');
      return;
    }

    if (E.some(v => v <= 0)) {
      setError('Expected frequencies must be strictly positive (> 0).');
      return;
    }

    const n = O.length;
    const log = [];
    log.push(`Categories Count k = ${n}`);
    log.push(`Degrees of Freedom d.f. = k - 1 = ${n - 1}`);

    const table = [];
    let chiSquareSum = 0;

    for (let i = 0; i < n; i++) {
      const obs = O[i];
      const exp = E[i];
      const diff = obs - exp;
      const diffSq = diff * diff;
      const term = diffSq / exp;
      chiSquareSum += term;

      table.push({ index: i + 1, obs, exp, diff, diffSq, term });
    }

    log.push(`Sum (O-E)^2 / E = Chi-Square = ${chiSquareSum.toFixed(4)}`);

    setGridLog(log);
    setStepsData(table);
    const critical = chiSquareCritical(n - 1);
    setResult({ n, df: n - 1, chiSquareSum, critical, reject: chiSquareSum > critical });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateChiSquare(observedInput, expectedInput);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setObservedInput('20, 30, 25, 25');
    setExpectedInput('25, 25, 25, 25');
    calculateChiSquare('20, 30, 25, 25', '25, 25, 25, 25');
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setObservedInput('20, 30, 25, 25');
    setExpectedInput('25, 25, 25, 25');
    setResult(null);
    setStepsData([]);
    setGridLog([]);
    setError('');
  };

  const exportData = stepsData.map((row) => ({
    Category: `i = ${row.index}`,
    'Observed (O)': row.obs,
    'Expected (E)': row.exp,
    'O - E': row.diff,
    '(O - E)^2': row.diffSq,
    '(O - E)^2 / E': row.term.toFixed(4),
  }));

  if (result) {
    exportData.push({
      Category: 'Total Chi-Square',
      'Observed (O)': '-',
      'Expected (E)': '-',
      'O - E': '-',
      '(O - E)^2': '-',
      '(O - E)^2 / E': result.chiSquareSum.toFixed(4),
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              GOODNESS OF FIT LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Chi-Square Test Engine (<InlineMath math="\chi^2" />)
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
              <label htmlFor="obsValues" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Observed Frequencies (comma separated)
              </label>
              <input
                type="text"
                id="obsValues"
                value={observedInput}
                onChange={(e) => setObservedInput(e.target.value)}
                placeholder="e.g. 20, 30, 25, 25"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="expValues" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Expected Frequencies (comma separated)
              </label>
              <input
                type="text"
                id="expValues"
                value={expectedInput}
                onChange={(e) => setExpectedInput(e.target.value)}
                placeholder="e.g. 25, 25, 25, 25"
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Chi-Square Statistic
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Calculated Chi-Square Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                <InlineMath math={`\\chi^2 = ${result.chiSquareSum.toFixed(4)}`} /> (d.f. = {result.df})
              </span>
              <span className="text-sm font-mono font-bold block">
                {result.reject ? 'Reject' : 'Accept'} H₀ at 5% (table value {result.critical})
              </span>
            </div>

            <EditorialExportButton
              title="Chi-Square Test Report"
              elementId="chisquare-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {stepsData.length > 0 && (
        <div id="chisquare-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Frequencies Table
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
                <FiLayers className="w-3.5 h-3.5" /> Summation Derivation
              </button>
            </div>

            <EditorialExportButton
              title="Chi-Square Test Report"
              elementId="chisquare-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Chi-Square Frequency Contingency Matrix
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Category</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Observed (O)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Expected (E)</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">O - E</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">(O - E)^2</th>
                      <th className="p-3">(O - E)^2 / E</th>
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
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">i = {row.index}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.obs}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.exp}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.diff}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.diffSq}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold text-emerald-600 dark:text-emerald-400">{row.term.toFixed(4)}</td>
                      </tr>
                    ))}
                    {result && (
                      <tr className="bg-emerald-500 text-white font-bold">
                        <td className="p-3 border-t border-r border-emerald-600">Total Chi-Square (&chi;^2)</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
                        <td className="p-3 border-t border-r border-emerald-600">-</td>
                        <td className="p-3 border-t border-emerald-600">{result.chiSquareSum.toFixed(4)}</td>
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
                <FiLayers className="w-5 h-5 text-neutral-500" /> Chi-Square Summation Evaluation
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Chi-Square Test Statistic:</span>
                  <BlockMath math={`\\chi^2_{\\text{calc}} = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i} = ${result.chiSquareSum.toFixed(4)}`} />
                  <BlockMath math={`d.f. = k - 1 = ${result.n} - 1 = ${result.df}`} />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Hypothesis and Decision (5% level):</span>
                  <BlockMath math={`H_0: \\text{the observed frequencies agree with the expected ones}`} />
                  <BlockMath math={`\\chi^2_{0.05}(${result.df}) = ${result.critical} \\quad \\text{(table value)}`} />
                  <BlockMath math={`\\chi^2_{\\text{calc}} = ${result.chiSquareSum.toFixed(4)} ${result.reject ? '>' : '<'} ${result.critical} \\;\\Rightarrow\\; \\text{${result.reject ? 'reject' : 'accept'} } H_0`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ChiSquareSolver;
