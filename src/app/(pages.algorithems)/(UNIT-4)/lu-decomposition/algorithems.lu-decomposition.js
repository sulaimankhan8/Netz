'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import MatrixInputGrid from '@/app/components/MatrixInputGrid';
import { EditorialButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

function initMatrix(n) {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n + 1 }, (_, c) => {
      if (c < n) return r === c ? '4' : '1';
      return String(r + 5);
    })
  );
}

const LUDecomposition = () => {
  const [n, setN] = useState(3);
  const [matrix, setMatrix] = useState(initMatrix(3));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const luDecompose = (rawMatrix) => {
    const sz = rawMatrix.length;
    const A = rawMatrix.map((row) => row.slice(0, sz).map(Number));
    const b = rawMatrix.map((row) => Number(row[sz]));

    // Doolittle method: L has 1s on diagonal
    const L = Array.from({ length: sz }, (_, i) => Array.from({ length: sz }, (_, j) => (i === j ? 1 : 0)));
    const U = Array.from({ length: sz }, () => new Array(sz).fill(0));

    for (let i = 0; i < sz; i++) {
      // U row
      for (let k = i; k < sz; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
        U[i][k] = A[i][k] - sum;
      }
      if (Math.abs(U[i][i]) < 1e-12) return { error: `Zero pivot at position [${i + 1}][${i + 1}]. Matrix may be singular.` };

      // L column
      for (let k = i + 1; k < sz; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
        L[k][i] = (A[k][i] - sum) / U[i][i];
      }
    }

    // Forward substitution: Ly = b
    const y = new Array(sz).fill(0);
    for (let i = 0; i < sz; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
      y[i] = (b[i] - sum) / L[i][i]; // L[i][i] === 1 for Doolittle
    }

    // Back substitution: Ux = y
    const x = new Array(sz).fill(0);
    for (let i = sz - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < sz; j++) sum += U[i][j] * x[j];
      x[i] = (y[i] - sum) / U[i][i];
    }

    return { L, U, y, x };
  };

  const handleSolve = () => {
    setError('');
    setResult(null);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c <= n; c++) {
        if (matrix[r][c] === '' || isNaN(Number(matrix[r][c]))) {
          setError(`Cell [${r + 1}][${c + 1}] is invalid.`); return;
        }
      }
    }
    const res = luDecompose(matrix);
    if (res.error) { setError(res.error); return; }
    setResult(res);
  };

  const handleDemo = () => {
    const demo = [['2', '1', '1', '4'], ['4', '3', '3', '8'], ['8', '7', '9', '12']];
    setN(3); setMatrix(demo); setError(''); setResult(null);
    setTimeout(() => { const res = luDecompose(demo); if (!res.error) setResult(res); }, 50);
  };

  const handleReset = () => {
    setN(3); setMatrix(initMatrix(3)); setResult(null); setError('');
  };

  const MatrixDisplay = ({ data, label, highlight = false }) => (
    <div className="space-y-2">
      <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono border-collapse border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td key={c} className={`px-3 py-2 text-center border border-black/15 dark:border-neutral-700 ${
                    highlight && r === c ? 'bg-amber-100 dark:bg-amber-950/40 font-bold text-amber-800 dark:text-amber-300' :
                    val === 0 ? 'text-neutral-300 dark:text-neutral-600' : 'text-black dark:text-white'
                  }`}>
                    {typeof val === 'number' ? val.toFixed(4) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">MATRIX LABORATORY</span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">LU Decomposition Engine</h3>
          </div>
          <div className="flex items-center gap-2">
            <EditorialButton variant="secondary" size="sm" onClick={handleDemo}><FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo</EditorialButton>
            <EditorialButton variant="outline" size="sm" onClick={handleReset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>
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
            <FiCheckCircle className="w-4 h-4 mr-2" /> Decompose & Solve
          </EditorialButton>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* L and U Matrices */}
          <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
            <h4 className="text-lg font-black uppercase text-black dark:text-white">Decomposition: A = L × U</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MatrixDisplay data={result.L} label="Lower Triangular Matrix L (Doolittle: 1s on diagonal)" highlight />
              <MatrixDisplay data={result.U} label="Upper Triangular Matrix U" highlight />
            </div>
          </div>

          {/* Intermediate y and final x */}
          <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
            <h4 className="text-lg font-black uppercase text-black dark:text-white">Two-Phase Solve: Ly = b → Ux = y</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">Phase 1 — Intermediate Vector y (from Ly = b)</span>
                <div className="flex flex-wrap gap-3">
                  {result.y.map((yi, i) => (
                    <div key={i} className="bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl px-4 py-3 font-mono text-sm font-bold text-black dark:text-white">
                      y<sub>{i + 1}</sub> = {yi.toFixed(6)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">Phase 2 — Solution Vector x (from Ux = y)</span>
                <div className="flex flex-wrap gap-3">
                  {result.x.map((xi, i) => (
                    <div key={i} className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-700 rounded-xl px-4 py-3 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      x<sub>{i + 1}</sub> = {xi.toFixed(6)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LUDecomposition;
