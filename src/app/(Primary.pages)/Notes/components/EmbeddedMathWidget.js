'use client';

import { useState, useEffect } from 'react';
import { ALGORITHMS_CATALOG } from '../utils/algorithmRegistry';
import { LuAlertTriangle, LuArrowLeftRight, LuCalculator, LuCheckCircle, LuExternalLink } from 'react-icons/lu';
import { BTN_MAIN, FIELD, FIELD_INPUT, ICON_BTN, LABEL } from './ui';

// Sentence-case labels for the solvers' inputs (the rest are spelled out from their names)
const PARAM_LABELS = {
  expression: 'Expression f(x)',
  x0: 'First guess x₀',
  x1: 'Second guess x₁',
  y0: 'Starting value y₀',
  a: 'Start a',
  b: 'End b',
  h: 'Step size h',
  n: 'Steps n',
  tolerance: 'Tolerance',
  maxIter: 'Most iterations',
  targetX: 'Find y at x',
  xValues: 'x values (comma-separated)',
  yValues: 'y values (comma-separated)',
  row1: 'Row 1: a₁₁, a₁₂, a₁₃, b₁',
  row2: 'Row 2: a₂₁, a₂₂, a₂₃, b₂',
  row3: 'Row 3: a₃₁, a₃₂, a₃₃, b₃',
  sample1: 'Sample 1 (comma-separated)',
  sample2: 'Sample 2 (comma-separated)',
  observed: 'Observed frequencies Oᵢ',
  expected: 'Expected frequencies Eᵢ',
  sampleMean: 'Sample mean x̄',
  popMean: 'Population mean μ',
  sampleSize: 'Sample size n',
  sampleStd: 'Sample standard deviation s',
  popStd: 'Population standard deviation σ',
  alpha: 'Significance level α',
  points: 'Points'
};

function paramLabel(key) {
  if (PARAM_LABELS[key]) return PARAM_LABELS[key];
  const words = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}


export default function EmbeddedMathWidget({ config, onChange, onOpenPicker, menuButton = null }) {
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

  const wideKeys = ['expression', 'observed', 'expected', 'xValues', 'yValues', 'row1', 'row2', 'row3', 'sample1', 'sample2'];

  return (
    <div className="my-2 rounded-2xl border border-nt-line bg-nt-surface text-nt-ink">
      {/* Header: type, algorithm, tools */}
      <div className="flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 min-h-[56px]">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-nt-solver-tint text-nt-solver" aria-hidden="true">
          <LuCalculator className="w-4 h-4" />
        </span>
        <span className="text-[13px] font-semibold text-nt-solver shrink-0">Solver</span>
        <span className="flex-1 min-w-0 text-[15px] font-semibold truncate" title={currentAlg.name}>
          {currentAlg.name}
          <span className="font-normal text-nt-text2"> · {currentAlg.unit.split(':')[0]}</span>
        </span>
        {currentAlg.route && (
          <a href={currentAlg.route} target="_blank" rel="noopener noreferrer" className={ICON_BTN} aria-label={`Open the ${currentAlg.name} page`} title="Open the full page">
            <LuExternalLink className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        )}
        <button type="button" onClick={onOpenPicker} className={ICON_BTN} aria-label="Change algorithm" title="Change algorithm">
          <LuArrowLeftRight className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
        {menuButton}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(currentAlg.defaultParams).map((key) => (
            <label key={key} className={`flex flex-col gap-1.5 ${wideKeys.includes(key) ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
              <span className={LABEL}>{paramLabel(key)}</span>
              <span className={FIELD}>
                <input
                  type={typeof currentAlg.defaultParams[key] === 'number' ? 'number' : 'text'}
                  step="any"
                  value={params[key] !== undefined ? params[key] : currentAlg.defaultParams[key]}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  className={`${FIELD_INPUT} font-nt-mono`}
                  spellCheck={false}
                />
              </span>
            </label>
          ))}
        </div>

        {/* Calculate and the answer */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleSolve} disabled={isSolving} className={BTN_MAIN}>
            {isSolving ? 'Calculating…' : 'Calculate'}
          </button>
          {solverOutput?.result && (
            <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-nt-ok-tint text-nt-ok" role="status">
              <LuCheckCircle className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              <span className="text-[15px] font-semibold font-nt-mono">{solverOutput.result}</span>
              {solverOutput.steps?.length > 0 && <span className="ml-auto text-[13px] tabular-nums">{solverOutput.steps.length} steps</span>}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-nt-danger-tint text-nt-danger text-sm" role="alert">
            <LuAlertTriangle className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step by step */}
        {solverOutput?.steps && solverOutput.steps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className={LABEL}>Step by step</span>
            <div className="overflow-x-auto rounded-xl border border-nt-line">
              <table className="w-full text-[13px] text-left tabular-nums">
                <thead>
                  <tr className="bg-nt-paper text-nt-text2">
                    {solverOutput.headers.map((h, i) => (
                      <th key={i} className="py-2 px-3 font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-nt-mono">
                  {solverOutput.steps.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-nt-line">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className={`py-2 px-3 whitespace-nowrap ${cIdx === 0 ? 'text-nt-text2' : ''}`}>
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
    </div>
  );
}
