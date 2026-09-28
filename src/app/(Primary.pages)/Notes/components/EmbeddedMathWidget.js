'use client';

import { useState, useEffect } from 'react';
import { ALGORITHMS_CATALOG } from '../utils/algorithmRegistry';
import { FaCalculator, FaPlay, FaCheckCircle, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function EmbeddedMathWidget({ config, onChange, onOpenPicker }) {
  const initialAlg = ALGORITHMS_CATALOG.find((a) => a.id === config?.algorithmId) || ALGORITHMS_CATALOG[0];

  const [currentAlg, setCurrentAlg] = useState(initialAlg);
  const [params, setParams] = useState(config?.params || initialAlg.defaultParams);
  const [solverOutput, setSolverOutput] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    if (config?.algorithmId) {
      const found = ALGORITHMS_CATALOG.find((a) => a.id === config.algorithmId);
      if (found) {
        setCurrentAlg(found);
        setParams(config.params || found.defaultParams);
      }
    }
  }, [config?.algorithmId]);

  const handleParamChange = (key, value) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    if (onChange) {
      onChange({ algorithmId: currentAlg.id, params: updated });
    }
  };

  const handleSolve = () => {
    setIsSolving(true);
    setErrorMsg(null);
    setSolverOutput(null);

    try {
      const output = currentAlg.solve(params);
      setSolverOutput(output);
    } catch (err) {
      setErrorMsg(err.message || 'Calculation error. Please check parameter inputs.');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="my-4 p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 shadow-lg text-slate-900 dark:text-slate-100 font-sans transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4 gap-2">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <FaCalculator className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0" />
          <span>{currentAlg.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-mono">
            {currentAlg.unit.split(':')[0]}
          </span>
        </div>

        <button
          onClick={onOpenPicker}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors font-medium"
        >
          <FaExchangeAlt className="w-3 h-3" />
          <span>Change Algorithm</span>
        </button>
      </div>

      {/* Dynamic Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {Object.keys(currentAlg.defaultParams).map((key) => (
          <div
            key={key}
            className={
              key === 'expression' || key === 'observed' || key === 'expected' || key === 'xValues' || key === 'yValues'
                ? 'sm:col-span-2'
                : ''
            }
          >
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={typeof currentAlg.defaultParams[key] === 'number' ? 'number' : 'text'}
              step="any"
              value={params[key] !== undefined ? params[key] : currentAlg.defaultParams[key]}
              onChange={(e) => handleParamChange(key, e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Solve Button & Result Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleSolve}
          disabled={isSolving}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
        >
          <FaPlay className="w-3 h-3" />
          <span>{isSolving ? 'Solving...' : 'Calculate In Note'}</span>
        </button>

        {solverOutput?.result && (
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-mono text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl">
            <FaCheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{solverOutput.result}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <FaExclamationTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Iteration / Step Table */}
      {solverOutput?.steps && solverOutput.steps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Step-by-Step Table Output:</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
            <table className="w-full text-xs font-mono text-left text-slate-800 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400">
                  {solverOutput.headers.map((h, i) => (
                    <th key={i} className="py-2 px-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solverOutput.steps.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className={`py-1.5 px-3 ${cIdx === 0 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
