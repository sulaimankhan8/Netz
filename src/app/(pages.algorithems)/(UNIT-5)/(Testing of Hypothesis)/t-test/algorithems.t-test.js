'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { tCritical } from '@/app/utils/criticalValues';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const TTestSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [sampleDataInput, setSampleDataInput] = useState('12, 15, 14, 11, 13, 16, 15, 14');
  const [hypothesizedMean, setHypothesizedMean] = useState(13);

  const [result, setResult] = useState(null);
  useRecordSolve('t-test', 5, result);
  useCodeExportInputs('t-test', () => ({ data: sampleDataInput, mu: hypothesizedMean }));
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateTTest = (sampleStr, muVal) => {
    setError('');
    setResult(null);

    const data = sampleStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const mu = parseFloat(muVal);

    if (data.length < 2 || isNaN(mu)) {
      setError('Please enter at least 2 sample values and a valid hypothesized mean (\\mu).');
      return;
    }

    const n = data.length;
    const log = [];
    log.push(`Sample Size n = ${n}, Hypothesized Mean μ₀ = ${mu}`);
    log.push(`Degrees of Freedom d.f. = n - 1 = ${n - 1}`);

    const mean = data.reduce((sum, v) => sum + v, 0) / n;
    const varSum = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    const s2 = varSum / (n - 1);
    const s = Math.sqrt(s2);
    const df = n - 1;

    const tCalc = (mean - mu) / (s / Math.sqrt(n));

    setGridLog(log);
    setResult({
      n,
      mean,
      s,
      s2,
      df,
      mu,
      tCalc,
      critical: tCritical(df),
      reject: Math.abs(tCalc) > tCritical(df),
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateTTest(sampleDataInput, hypothesizedMean);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setSampleDataInput('12, 15, 14, 11, 13, 16, 15, 14');
    setHypothesizedMean(13);
    calculateTTest('12, 15, 14, 11, 13, 16, 15, 14', 13);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setSampleDataInput('12, 15, 14, 11, 13, 16, 15, 14');
    setHypothesizedMean(13);
    setResult(null);
    setGridLog([]);
    setError('');
  };

  const exportData = result ? [
    { Statistic: 'Sample Size', Symbol: 'n', Value: result.n },
    { Statistic: 'Sample Mean', Symbol: 'x̄', Value: result.mean.toFixed(4) },
    { Statistic: 'Sample Variance', Symbol: 's^2', Value: result.s2.toFixed(4) },
    { Statistic: 'Sample Std Deviation', Symbol: 's', Value: result.s.toFixed(4) },
    { Statistic: 'Degrees of Freedom', Symbol: 'd.f.', Value: result.df },
    { Statistic: 'Calculated t-Statistic', Symbol: 't', Value: result.tCalc.toFixed(4) },
  ] : [];

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              HYPOTHESIS TESTING LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Student&apos;s t-Test Engine (One-Sample)
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
              <label htmlFor="sampleData" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Sample Values (comma separated)
              </label>
              <input
                type="text"
                id="sampleData"
                value={sampleDataInput}
                onChange={(e) => setSampleDataInput(e.target.value)}
                placeholder="e.g. 12, 15, 14, 11, 13, 16, 15, 14"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="hypoMean" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Hypothesized Mean (<InlineMath math="\mu_0" />)
              </label>
              <input
                type="number"
                step="any"
                id="hypoMean"
                value={hypothesizedMean}
                onChange={(e) => setHypothesizedMean(e.target.value)}
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate t-Statistic
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Calculated t-Statistic Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                t = {result.tCalc.toFixed(4)} (d.f. = {result.df})
              </span>
              <span className="text-sm font-mono font-bold block">
                {result.reject ? 'Reject' : 'Accept'} H₀ at 5% (table value ±{result.critical})
              </span>
            </div>

            <EditorialExportButton
              title="Student t-Test Report"
              elementId="ttest-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {result && (
        <div id="ttest-results-container" className="space-y-6">
          <SetupSteps lines={gridLog} />

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
                <FiList className="w-3.5 h-3.5" /> Sample Statistics Table
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
                <FiLayers className="w-3.5 h-3.5" /> Formula Substitution
              </button>
            </div>

            <EditorialExportButton
              title="Student t-Test Report"
              elementId="ttest-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Sample Descriptives Table
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Statistic</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Symbol</th>
                      <th className="p-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Size</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">n</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.n}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Mean</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">x&#772;</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.mean.toFixed(4)}</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Variance</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">s^2</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.s2.toFixed(4)}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Standard Deviation</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">s</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.s.toFixed(4)}</td>
                    </tr>
                    <tr className="bg-emerald-500 text-white font-bold">
                      <td className="p-3 border-t border-r border-emerald-600">Degrees of Freedom</td>
                      <td className="p-3 border-t border-r border-emerald-600">d.f.</td>
                      <td className="p-3 border-t border-emerald-600">{result.df}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> t-Statistic Formula Substitution
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Formula Evaluation:</span>
                  <BlockMath math={`t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}`} />
                  <BlockMath math={`t = \\frac{${result.mean.toFixed(4)} - ${result.mu}}{${result.s.toFixed(4)} / \\sqrt{${result.n}}} = \\frac{${(result.mean - result.mu).toFixed(4)}}{${(result.s / Math.sqrt(result.n)).toFixed(4)}} = ${result.tCalc.toFixed(4)}`} />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Hypothesis and Decision (5% level, two-tailed):</span>
                  <BlockMath math={`H_0: \\mu = ${result.mu}, \\quad H_1: \\mu \\neq ${result.mu}`} />
                  <BlockMath math={`t_{0.05}(${result.df}) = ${result.critical} \\quad \\text{(table value)}`} />
                  <BlockMath math={`|t_{\\text{calc}}| = ${Math.abs(result.tCalc).toFixed(4)} ${result.reject ? '>' : '<'} ${result.critical} \\;\\Rightarrow\\; \\text{${result.reject ? 'reject' : 'accept'} } H_0`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TTestSolver;
