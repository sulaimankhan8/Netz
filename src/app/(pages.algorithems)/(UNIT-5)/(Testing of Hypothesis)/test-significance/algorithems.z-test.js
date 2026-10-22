'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const ZTestSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [sampleMean, setSampleMean] = useState(105);
  const [popMean, setPopMean] = useState(100);
  const [stdDev, setStdDev] = useState(15);
  const [sampleSize, setSampleSize] = useState(50);

  const [result, setResult] = useState(null);
  useRecordSolve('z-test', 5, result);
  useCodeExportInputs('z-test', () => ({ mean: sampleMean, mu: popMean, sigma: stdDev, n: sampleSize }));
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateZTest = (xBarVal, muVal, sigmaVal, nVal) => {
    setError('');
    setResult(null);

    const xBar = parseFloat(xBarVal);
    const mu = parseFloat(muVal);
    const sigma = parseFloat(sigmaVal);
    const n = parseInt(nVal, 10);

    if (isNaN(xBar) || isNaN(mu) || isNaN(sigma) || isNaN(n) || sigma <= 0 || n <= 0) {
      setError('Please enter valid numeric sample inputs (sigma > 0 and n > 0).');
      return;
    }

    const log = [];
    log.push(`Sample Mean x̄ = ${xBar}, Population Mean μ₀ = ${mu}`);
    log.push(`Standard Deviation σ = ${sigma}, Sample Size n = ${n} (large sample: n ≥ 30)`);

    const se = sigma / Math.sqrt(n);
    const zCalc = (xBar - mu) / se;

    setGridLog(log);
    setResult({
      xBar,
      mu,
      sigma,
      n,
      se,
      zCalc,
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateZTest(sampleMean, popMean, stdDev, sampleSize);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setSampleMean(105);
    setPopMean(100);
    setStdDev(15);
    setSampleSize(50);
    calculateZTest(105, 100, 15, 50);
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setSampleMean(105);
    setPopMean(100);
    setStdDev(15);
    setSampleSize(50);
    setResult(null);
    setGridLog([]);
    setError('');
  };

  const exportData = result ? [
    { Parameter: 'Sample Mean', Symbol: 'x̄', Value: result.xBar },
    { Parameter: 'Population Mean', Symbol: 'μ0', Value: result.mu },
    { Parameter: 'Standard Deviation', Symbol: 'σ', Value: result.sigma },
    { Parameter: 'Sample Size', Symbol: 'n', Value: result.n },
    { Parameter: 'Standard Error', Symbol: 'SE', Value: result.se.toFixed(6) },
    { Parameter: 'Calculated Z-Statistic', Symbol: 'Z', Value: result.zCalc.toFixed(4) },
    { Parameter: 'Decision (5% Level)', Symbol: 'Result', Value: Math.abs(result.zCalc) > 1.96 ? 'Reject H0 (|Z| > 1.96)' : 'Accept H0 (|Z| <= 1.96)' },
  ] : [];

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Large sample hypothesis testing
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Z-Test Engine (Test of Significance for Means)
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
              <label htmlFor="sampleMean" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Sample Mean (<InlineMath math="\bar{x}" />)
              </label>
              <input
                type="number"
                step="any"
                id="sampleMean"
                value={sampleMean}
                onChange={(e) => setSampleMean(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="popMean" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Population Mean (<InlineMath math="\mu_0" />)
              </label>
              <input
                type="number"
                step="any"
                id="popMean"
                value={popMean}
                onChange={(e) => setPopMean(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stdDev" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Standard Deviation (<InlineMath math="\sigma" /> or s)
              </label>
              <input
                type="number"
                step="any"
                id="stdDev"
                value={stdDev}
                onChange={(e) => setStdDev(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sampleSize" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Sample Size (n &ge; 30)
              </label>
              <input
                type="number"
                id="sampleSize"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Z-Statistic
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Calculated Z-Statistic Result
              </span>
              <span className="text-base md:text-lg font-mono font-black block">
                Z = {result.zCalc.toFixed(4)}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                Decision (5% Level): {Math.abs(result.zCalc) > 1.96 ? 'Reject H0 (|Z| > 1.96)' : 'Accept H0 (|Z| <= 1.96)'}
              </span>
            </div>

            <EditorialExportButton
              title="Z-Test Report"
              elementId="ztest-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {result && (
        <div id="ztest-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Z-Test Parameters Table
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
              title="Z-Test Report"
              elementId="ztest-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Z-Test Parameter Matrix
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Parameter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Symbol</th>
                      <th className="p-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Mean</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">x&#772;</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.xBar}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Population Mean</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">&mu;_0</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.mu}</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Standard Deviation</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">&sigma;</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.sigma}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample Size</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">n</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{result.n}</td>
                    </tr>
                    <tr className="bg-emerald-500 text-white font-bold">
                      <td className="p-3 border-t border-r border-emerald-600">Standard Error</td>
                      <td className="p-3 border-t border-r border-emerald-600">SE = &sigma; / &radic;n</td>
                      <td className="p-3 border-t border-emerald-600">{result.se.toFixed(6)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> Z-Statistic Formula Evaluation
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Formula Evaluation:</span>
                  <BlockMath math={`SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${result.sigma}}{\\sqrt{${result.n}}} = ${result.se.toFixed(6)}`} />
                  <BlockMath math={`Z_{\\text{calc}} = \\frac{\\bar{x} - \\mu_0}{SE} = \\frac{${result.xBar} - ${result.mu}}{${result.se.toFixed(6)}} = ${result.zCalc.toFixed(4)}`} />
                  <p className="text-sm font-sans font-bold text-indigo-700 dark:text-indigo-300 pt-2">
                    {Math.abs(result.zCalc) > 1.96 ? 'Decision: |Z| > 1.96. Reject H0 at 5% significance level.' : 'Decision: |Z| <= 1.96. Accept H0 at 5% significance level.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ZTestSolver;
