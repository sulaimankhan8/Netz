'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import MatrixInputGrid from '@/app/components/MatrixInputGrid';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiList, FiAlertCircle } from 'react-icons/fi';

function initMatrix(n) {
  // Diagonally dominant default
  const mat = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n + 1 }, (_, c) => {
      if (c === r) return String(n * 3);         // strong diagonal
      if (c < n) return String(r === 0 ? 1 : -1); // off-diagonal
      return String((r + 1) * 5);                // b vector
    })
  );
  return mat;
}

function isDiagonallyDominant(A, n) {
  for (let i = 0; i < n; i++) {
    let diag = Math.abs(A[i][i]);
    let offSum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) offSum += Math.abs(A[i][j]);
    }
    if (diag < offSum) return false;
  }
  return true;
}

const JacobiMethod = () => {
  const [n, setN] = useState(3);
  const [matrix, setMatrix] = useState(initMatrix(3));
  const [maxIter, setMaxIter] = useState(50);
  const [tolerance, setTolerance] = useState(0.0001);
  const [iterations, setIterations] = useState([]);
  const [solution, setSolution] = useState(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');

  const jacobiSolve = (rawMatrix, tol, maxIterations) => {
    const A = rawMatrix.map((row) => row.slice(0, n).map(Number));
    const b = rawMatrix.map((row) => Number(row[n]));

    // Check for zero diagonal
    for (let i = 0; i < n; i++) {
      if (Math.abs(A[i][i]) < 1e-12) return { error: `Zero diagonal element at row ${i + 1}. Cannot divide. Rearrange rows.` };
    }

    let x = new Array(n).fill(0); // initial guess: all zeros
    const iters = [];

    for (let iter = 1; iter <= maxIterations; iter++) {
      const xNew = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sigma = 0;
        for (let j = 0; j < n; j++) {
          if (i !== j) sigma += A[i][j] * x[j];
        }
        xNew[i] = (b[i] - sigma) / A[i][i];
      }

      // Max absolute change (convergence check)
      const maxChange = Math.max(...xNew.map((val, i) => Math.abs(val - x[i])));
      iters.push({ iter, x: [...xNew], maxChange });

      x = xNew;
      if (maxChange < tol) return { iterations: iters, solution: x, converged: true };
    }

    return { iterations: iters, solution: x, converged: false };
  };

  const handleSolve = () => {
    setError('');
    setWarning('');
    setSolution(null);
    setIterations([]);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c <= n; c++) {
        if (matrix[r][c] === '' || isNaN(Number(matrix[r][c]))) {
          setError(`Cell [${r + 1}][${c + 1}] is invalid.`); return;
        }
      }
    }

    const A = matrix.map((row) => row.slice(0, n).map(Number));
    if (!isDiagonallyDominant(A, n)) {
      setWarning('⚠️ Matrix is not strictly diagonally dominant. Jacobi may diverge. Consider reordering rows.');
    }

    const res = jacobiSolve(matrix, tolerance, maxIter);
    if (res.error) { setError(res.error); return; }
    if (!res.converged) setWarning((prev) => prev + ' ⚠️ Max iterations reached without full convergence.');
    setIterations(res.iterations);
    setSolution(res.solution);
  };

  const handleDemo = () => {
    const demo = [
      ['10', '-1', '2', '6'],
      ['-1', '11', '-1', '25'],
      ['2', '-1', '10', '-11'],
    ];
    setN(3); setMatrix(demo); setMaxIter(50); setTolerance(0.0001);
    setError(''); setWarning(''); setSolution(null); setIterations([]);
    setTimeout(() => {
      const res = jacobiSolve(demo, 0.0001, 50);
      if (!res.error) { setIterations(res.iterations); setSolution(res.solution); }
    }, 50);
  };

  const handleReset = () => {
    setN(3); setMatrix(initMatrix(3)); setSolution(null); setIterations([]); setError(''); setWarning('');
  };

  const exportData = iterations.map((it) => ({
    Iteration: it.iter,
    ...Object.fromEntries(it.x.map((v, i) => [`x${i + 1}`, v.toFixed(8)])),
    'Max Change': it.maxChange.toFixed(8),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">ITERATIVE MATRIX LABORATORY</span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">Jacobi Method Engine</h3>
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
        {warning && !error && (
          <div className="p-4 border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 rounded-xl text-sm font-medium">
            {warning}
          </div>
        )}

        <MatrixInputGrid n={n} setN={(newN) => { setN(newN); setMatrix(initMatrix(newN)); }} matrix={matrix} setMatrix={setMatrix} augmented />

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">Tolerance</label>
            <input type="number" step="0.00001" value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-black dark:text-white">Max Iterations</label>
            <input type="number" step="1" min="1" max="500" value={maxIter}
              onChange={(e) => setMaxIter(parseInt(e.target.value) || 50)}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={handleSolve} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Iterate (Jacobi)
          </EditorialButton>
        </div>

        {solution && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
              Converged in {iterations.length} iterations
            </span>
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

      {iterations.length > 0 && (
        <div id="jacobi-table" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
              <FiList className="w-5 h-5 text-neutral-500" /> Iteration Log
            </h4>
            <EditorialExportButton title="Jacobi Method Report" elementId="jacobi-table" exportData={exportData} size="sm" />
          </div>
          <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700 max-h-[400px] overflow-y-auto">
            <table className="w-full table-auto border-collapse text-center text-xs font-mono">
              <thead className="sticky top-0">
                <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                  <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                  {Array.from({ length: n }, (_, i) => (
                    <th key={i} className="p-3 border-r border-neutral-700 dark:border-neutral-300">x<sub>{i + 1}</sub></th>
                  ))}
                  <th className="p-3">Max Change</th>
                </tr>
              </thead>
              <tbody>
                {iterations.map((it, idx) => (
                  <tr key={idx} className={idx === iterations.length - 1
                    ? 'bg-emerald-500 text-white font-bold'
                    : idx % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white' : 'bg-white dark:bg-neutral-900 text-black dark:text-white'}>
                    <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{it.iter}</td>
                    {it.x.map((xi, i) => (
                      <td key={i} className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{xi.toFixed(6)}</td>
                    ))}
                    <td className="p-3 border-t border-neutral-200 dark:border-neutral-700">{it.maxChange.toFixed(8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JacobiMethod;
