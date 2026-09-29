'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import MatrixInputGrid from '@/app/components/MatrixInputGrid';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiList, FiAlertCircle } from 'react-icons/fi';

function initMatrix(n) {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n + 1 }, (_, c) => {
      if (c < n) return r === c ? '4' : '1';
      return String(r + 5);
    })
  );
}

const GaussElimination = () => {
  const [n, setN] = useState(3);
  const [matrix, setMatrix] = useState(initMatrix(3));
  const [steps, setSteps] = useState([]);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState('');

  const deepCopy = (m) => m.map((r) => [...r]);

  const gaussEliminate = (rawMatrix) => {
    const m = rawMatrix.map((row) => row.map(Number));
    const n = m.length;
    const stepsLog = [];

    for (let col = 0; col < n; col++) {
      // Partial pivoting
      let maxRow = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(m[r][col]) > Math.abs(m[maxRow][col])) maxRow = r;
      }
      [m[col], m[maxRow]] = [m[maxRow], m[col]];
      if (maxRow !== col) {
        stepsLog.push({ label: `Pivot: Swap R${col + 1} ↔ R${maxRow + 1}`, matrix: deepCopy(m) });
      }

      if (Math.abs(m[col][col]) < 1e-12) {
        return { error: `Zero pivot at column ${col + 1}. System may have no unique solution.`, steps: stepsLog };
      }

      // Eliminate below
      for (let r = col + 1; r < n; r++) {
        const factor = m[r][col] / m[col][col];
        if (Math.abs(factor) < 1e-15) continue;
        for (let c = col; c <= n; c++) {
          m[r][c] -= factor * m[col][c];
        }
        stepsLog.push({
          label: `R${r + 1} = R${r + 1} − (${factor.toFixed(4)}) × R${col + 1}`,
          matrix: deepCopy(m),
        });
      }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = m[i][n];
      for (let j = i + 1; j < n; j++) x[i] -= m[i][j] * x[j];
      x[i] /= m[i][i];
    }

    return { steps: stepsLog, solution: x, upper: m };
  };

  const handleSolve = () => {
    setError('');
    setSolution(null);
    setSteps([]);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c <= n; c++) {
        if (matrix[r][c] === '' || isNaN(Number(matrix[r][c]))) {
          setError(`Cell [${r + 1}][${c + 1}] has an invalid value.`);
          return;
        }
      }
    }

    const { steps: stepsLog, solution: sol, error: solveError } = gaussEliminate(matrix);
    setSteps(stepsLog);
    if (solveError) { setError(solveError); return; }
    setSolution(sol);
  };

  const handleDemo = () => {
    const demo = [
      ['2', '1', '-1', '8'],
      ['-3', '-1', '2', '-11'],
      ['-2', '1', '2', '-3'],
    ];
    setN(3);
    setMatrix(demo);
    setError('');
    setSolution(null);
    setSteps([]);
    setTimeout(() => {
      const { steps: s, solution: sol } = gaussEliminate(demo);
      setSteps(s);
      setSolution(sol);
    }, 50);
  };

  const handleReset = () => {
    setN(3);
    setMatrix(initMatrix(3));
    setSolution(null);
    setSteps([]);
    setError('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">MATRIX LABORATORY</span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">Gauss Elimination Engine</h3>
          </div>
          <div className="flex items-center gap-2">
            <EditorialButton variant="secondary" size="sm" onClick={handleDemo}>
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton variant="outline" size="sm" onClick={handleReset}>
              <FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </EditorialButton>
          </div>
        </div>

        {error && (
          <div className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
          </div>
        )}

        <MatrixInputGrid n={n} setN={(newN) => { setN(newN); setMatrix(initMatrix(newN)); }} matrix={matrix} setMatrix={setMatrix} augmented />

        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={handleSolve} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve System
          </EditorialButton>
        </div>

        {solution && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">Solution Vector x</span>
            <div className="flex flex-wrap gap-4">
              {solution.map((xi, i) => (
                <div key={i} className="bg-white dark:bg-neutral-800 border border-emerald-400 dark:border-emerald-700 rounded-xl px-4 py-3 font-mono text-sm font-bold text-black dark:text-white">
                  x<sub>{i + 1}</sub> = {xi.toFixed(6)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <div id="gauss-elim-steps" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
          <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
            <FiList className="w-5 h-5 text-neutral-500" /> Elimination Steps ({steps.length})
          </h4>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
                <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700">
                  Step {idx + 1}: {step.label}
                </div>
                <div className="overflow-x-auto p-3">
                  <table className="text-xs font-mono border-collapse">
                    <tbody>
                      {step.matrix.map((row, r) => (
                        <tr key={r}>
                          <td className="pr-2 py-1 text-neutral-500 dark:text-neutral-400 font-bold">R{r + 1}</td>
                          {row.map((val, c) => (
                            <td key={c} className={`px-3 py-1 text-center border border-black/15 dark:border-neutral-700 ${c === n ? 'bg-amber-50 dark:bg-amber-950/30 font-bold text-amber-800 dark:text-amber-300' : ''}`}>
                              {typeof val === 'number' ? val.toFixed(4) : val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GaussElimination;
