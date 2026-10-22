'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import SetupSteps from '@/app/components/SetupSteps';
import { fCritical } from '@/app/utils/criticalValues';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const FTestSolver = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [sample1Input, setSample1Input] = useState('20, 22, 19, 23, 21, 24');
  const [sample2Input, setSample2Input] = useState('18, 17, 21, 19, 16');

  const [result, setResult] = useState(null);
  useRecordSolve('f-test', 5, result);
  useCodeExportInputs('f-test', () => ({ s1: sample1Input, s2: sample2Input }));
  const [gridLog, setGridLog] = useState([]);
  const [error, setError] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps'

  const calculateFTest = (s1Str, s2Str) => {
    setError('');
    setResult(null);

    const s1Data = s1Str.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const s2Data = s2Str.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (s1Data.length < 2 || s2Data.length < 2) {
      setError('Please enter at least 2 sample values for both Sample 1 and Sample 2.');
      return;
    }

    const n1 = s1Data.length;
    const n2 = s2Data.length;

    const log = [];
    log.push(`Sample 1 Size n1 = ${n1}, Sample 2 Size n2 = ${n2}`);

    const m1 = s1Data.reduce((a, b) => a + b, 0) / n1;
    const m2 = s2Data.reduce((a, b) => a + b, 0) / n2;

    const var1 = s1Data.reduce((sum, v) => sum + Math.pow(v - m1, 2), 0) / (n1 - 1);
    const var2 = s2Data.reduce((sum, v) => sum + Math.pow(v - m2, 2), 0) / (n2 - 1);

    if (var1 === 0 || var2 === 0) {
      setError('Sample variances cannot be zero.');
      return;
    }

    let fRatio, df1, df2, largerVar, smallerVar;
    if (var1 >= var2) {
      fRatio = var1 / var2;
      df1 = n1 - 1;
      df2 = n2 - 1;
      largerVar = var1;
      smallerVar = var2;
    } else {
      fRatio = var2 / var1;
      df1 = n2 - 1;
      df2 = n1 - 1;
      largerVar = var2;
      smallerVar = var1;
    }

    log.push(`Sample 1 Variance = ${var1.toFixed(4)}, Sample 2 Variance = ${var2.toFixed(4)}`);
    log.push(`F-Ratio (Larger/Smaller) = ${fRatio.toFixed(4)}`);
    log.push(`Degrees of Freedom df1 = ${df1}, df2 = ${df2}`);

    setGridLog(log);
    setResult({
      n1,
      n2,
      m1,
      m2,
      var1,
      var2,
      fRatio,
      df1,
      df2,
      largerVar,
      smallerVar,
      critical: fCritical(df1, df2),
      reject: fRatio > fCritical(df1, df2),
    });
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    calculateFTest(sample1Input, sample2Input);
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setSample1Input('20, 22, 19, 23, 21, 24');
    setSample2Input('18, 17, 21, 19, 16');
    calculateFTest('20, 22, 19, 23, 21, 24', '18, 17, 21, 19, 16');
    setDemoInProgress(false);
  };

  const handleReset = () => {
    setSample1Input('20, 22, 19, 23, 21, 24');
    setSample2Input('18, 17, 21, 19, 16');
    setResult(null);
    setGridLog([]);
    setError('');
  };

  const exportData = result ? [
    { Sample: 'Sample 1', Size: result.n1, Mean: result.m1.toFixed(4), Variance: result.var1.toFixed(4), df: result.n1 - 1 },
    { Sample: 'Sample 2', Size: result.n2, Mean: result.m2.toFixed(4), Variance: result.var2.toFixed(4), df: result.n2 - 1 },
    { Sample: 'Calculated F', Size: '-', Mean: '-', Variance: result.fRatio.toFixed(4), df: `${result.df1}, ${result.df2}` },
  ] : [];

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Variance ratio calculator
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Snedecor&apos;s F-Test Engine (Two-Sample Variance)
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
              <label htmlFor="sample1" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Sample 1 Data (comma separated)
              </label>
              <input
                type="text"
                id="sample1"
                value={sample1Input}
                onChange={(e) => setSample1Input(e.target.value)}
                placeholder="e.g. 20, 22, 19, 23, 21, 24"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sample2" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Sample 2 Data (comma separated)
              </label>
              <input
                type="text"
                id="sample2"
                value={sample2Input}
                onChange={(e) => setSample2Input(e.target.value)}
                placeholder="e.g. 18, 17, 21, 19, 16"
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate F-Ratio
          </EditorialButton>
        </form>

        {result && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Calculated F-Statistic Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                F = {result.fRatio.toFixed(4)} (d.f. = {result.df1}, {result.df2})
              </span>
              <span className="text-sm font-mono font-bold block">
                {result.reject ? 'Reject' : 'Accept'} H₀ at 5% (table value {result.critical})
              </span>
            </div>

            <EditorialExportButton
              title="F-Test Report"
              elementId="ftest-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {result && (
        <div id="ftest-results-container" className="space-y-6">
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
                <FiList className="w-3.5 h-3.5" /> Variances Matrix Table
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
                <FiLayers className="w-3.5 h-3.5" /> Formula Derivation
              </button>
            </div>

            <EditorialExportButton
              title="F-Test Report"
              elementId="ftest-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Sample Variances Matrix
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Sample</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Size n</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Mean x&#772;</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Variance S^2</th>
                      <th className="p-3">Degrees of Freedom</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample 1</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.n1}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.m1.toFixed(4)}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{result.var1.toFixed(4)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{result.n1 - 1}</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">Sample 2</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.n2}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{result.m2.toFixed(4)}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{result.var2.toFixed(4)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{result.n2 - 1}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-neutral-500" /> F-Ratio Variance Comparison Formula
              </h4>

              <div className="p-4 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Variance Ratio Evaluation:</span>
                  <BlockMath math={`F_{\\text{calc}} = \\frac{S_1^2}{S_2^2} = \\frac{${result.largerVar.toFixed(4)}}{${result.smallerVar.toFixed(4)}} = ${result.fRatio.toFixed(4)}`} />
                  <BlockMath math={`d.f._1 = ${result.df1}, \\quad d.f._2 = ${result.df2}`} />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-neutral-500 uppercase block">Hypothesis and Decision (5% level):</span>
                  <BlockMath math={`H_0: \\sigma_1^2 = \\sigma_2^2 \\quad \\text{(the two populations have equal variances)}`} />
                  <BlockMath math={`F_{0.05}(${result.df1}, ${result.df2}) = ${result.critical} \\quad \\text{(table value)}`} />
                  <BlockMath math={`F_{\\text{calc}} = ${result.fRatio.toFixed(4)} ${result.reject ? '>' : '<'} ${result.critical} \\;\\Rightarrow\\; \\text{${result.reject ? 'reject' : 'accept'} } H_0`} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default FTestSolver;
