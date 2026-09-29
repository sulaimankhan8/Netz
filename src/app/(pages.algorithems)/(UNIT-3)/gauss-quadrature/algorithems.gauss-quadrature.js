'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import { parseUserFunction } from "@/app/utils/evaluateMath";
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiList, FiAlertCircle } from 'react-icons/fi';

// Standard Gauss-Legendre nodes and weights on [-1, 1]
const GAUSS_LEGENDRE = {
  2: {
    nodes: [-0.5773502692, 0.5773502692],
    weights: [1.0, 1.0],
  },
  3: {
    nodes: [-0.7745966692, 0.0, 0.7745966692],
    weights: [0.5555555556, 0.8888888889, 0.5555555556],
  },
  4: {
    nodes: [-0.8611363116, -0.3399810436, 0.3399810436, 0.8611363116],
    weights: [0.3478548451, 0.6521451549, 0.6521451549, 0.3478548451],
  },
  5: {
    nodes: [-0.9061798459, -0.5384693101, 0.0, 0.5384693101, 0.9061798459],
    weights: [0.2369268851, 0.4786286705, 0.5688888889, 0.4786286705, 0.2369268851],
  },
};

const GaussQuadrature = () => {
  const [functionInput, setFunctionInput] = useState("x^2 + 1");
  const [aInput, setAInput] = useState("0");
  const [bInput, setBInput] = useState("1");
  const [nPoints, setNPoints] = useState(3);
  const [result, setResult] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [error, setError] = useState('');
  const [demoInProgress, setDemoInProgress] = useState(false);

  const gaussSolve = (funcStr, a, b, n) => {
    const f = parseUserFunction(funcStr);
    const { nodes, weights } = GAUSS_LEGENDRE[n];

    const rows = [];
    let integral = 0;
    const scale = (b - a) / 2;
    const shift = (a + b) / 2;

    for (let i = 0; i < n; i++) {
      const ti = nodes[i];
      const xi = scale * ti + shift;
      const fxi = f(xi);
      const product = weights[i] * fxi;
      integral += product;

      rows.push({
        i: i + 1,
        ti,
        wi: weights[i],
        xi,
        fxi,
        product,
      });
    }

    return { integral: scale * integral, rows };
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setTableRows([]);

    const a = parseFloat(aInput);
    const b = parseFloat(bInput);
    if (isNaN(a) || isNaN(b)) { setError("a and b must be valid numbers."); return; }
    if (a >= b) { setError("Lower limit a must be less than upper limit b."); return; }

    let f;
    try {
      f = parseUserFunction(functionInput);
      f(1);
    } catch {
      setError("Invalid function. Try expressions like x^2 + sin(x)");
      return;
    }

    try {
      const { integral, rows } = gaussSolve(functionInput, a, b, nPoints);
      setResult(integral);
      setTableRows(rows);
    } catch (err) {
      setError("Function evaluation error: " + err.message);
    }
  };

  const handleDemo = () => {
    setDemoInProgress(true);
    setFunctionInput("x^2 + 1");
    setAInput("0");
    setBInput("1");
    setNPoints(3);
    setError('');
    setTimeout(() => {
      try {
        const { integral, rows } = gaussSolve("x^2 + 1", 0, 1, 3);
        setResult(integral);
        setTableRows(rows);
      } catch {
        setError("Demo failed.");
      }
      setDemoInProgress(false);
    }, 50);
  };

  const handleReset = () => {
    setFunctionInput("x^2 + 1");
    setAInput("0");
    setBInput("1");
    setNPoints(3);
    setResult(null);
    setTableRows([]);
    setError('');
  };

  const exportData = tableRows.map((row) => ({
    'Point i': row.i,
    'Node tᵢ': row.ti.toFixed(10),
    'Weight wᵢ': row.wi.toFixed(10),
    'xᵢ (mapped)': row.xi.toFixed(10),
    'f(xᵢ)': row.fxi.toFixed(10),
    'wᵢ × f(xᵢ)': row.product.toFixed(10),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              INTEGRATION LABORATORY
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Gauss Quadrature Interactive Engine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <EditorialButton variant="secondary" size="sm" onClick={handleDemo} disabled={demoInProgress}>
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton variant="outline" size="sm" onClick={handleReset}>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 space-y-1.5">
              <label htmlFor="gq-function" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Function <InlineMath math="f(x)" />
              </label>
              <input
                type="text" id="gq-function" value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                placeholder="e.g., x^2 + 1 or sin(x)" required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gq-a" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Lower Limit <InlineMath math="a" />
              </label>
              <input type="number" id="gq-a" step="any" value={aInput}
                onChange={(e) => setAInput(e.target.value)} required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gq-b" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Upper Limit <InlineMath math="b" />
              </label>
              <input type="number" id="gq-b" step="any" value={bInput}
                onChange={(e) => setBInput(e.target.value)} required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gq-n" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Number of Points <InlineMath math="n" />
              </label>
              <select id="gq-n" value={nPoints} onChange={(e) => setNPoints(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                <option value={2}>2-Point (degree 3)</option>
                <option value={3}>3-Point (degree 5)</option>
                <option value={4}>4-Point (degree 7)</option>
                <option value={5}>5-Point (degree 9)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <EditorialButton type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              <FiCheckCircle className="w-4 h-4 mr-2" /> Integrate
            </EditorialButton>
          </div>
        </form>

        {result !== null && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                {nPoints}-Point Gauss Quadrature Result
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                ∫ f(x) dx ≈ {result.toFixed(10)}
              </span>
            </div>
            <EditorialExportButton
              title="Gauss Quadrature Report"
              elementId="gq-results-container"
              exportData={exportData}
              variant="accent" size="sm"
            />
          </div>
        )}
      </div>

      {/* Results Table */}
      {tableRows.length > 0 && (
        <div id="gq-results-container" className="space-y-6">
          <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
            <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
              <FiList className="w-5 h-5 text-neutral-500" /> Gauss Points & Computation Table
            </h4>

            <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
              <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                <thead>
                  <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                    {['i', 'Node tᵢ', 'Weight wᵢ', 'xᵢ (mapped)', 'f(xᵢ)', 'wᵢ × f(xᵢ)'].map((h) => (
                      <th key={h} className="p-3 border-r border-neutral-700 dark:border-neutral-300 last:border-r-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => (
                    <tr key={index} className={index % 2 === 0
                      ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                      : 'bg-white dark:bg-neutral-900 text-black dark:text-white'}>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{row.i}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.ti.toFixed(10)}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.wi.toFixed(10)}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.xi.toFixed(10)}</td>
                      <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{row.fxi.toFixed(10)}</td>
                      <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{row.product.toFixed(10)}</td>
                    </tr>
                  ))}
                  {/* Sum row */}
                  <tr className="bg-emerald-500 text-white font-bold border-t-2 border-black/30 dark:border-neutral-600">
                    <td colSpan={5} className="p-3 border-r border-white/30 text-right">
                      I = ((b−a)/2) × Σwᵢf(xᵢ) =
                    </td>
                    <td className="p-3 font-black text-lg">{result?.toFixed(10)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Accuracy note */}
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 bg-neutral-50 dark:bg-neutral-800">
              ℹ️ An {nPoints}-point Gauss-Legendre rule integrates polynomials of degree ≤ {2 * nPoints - 1} exactly.
              For oscillatory or singularity-containing functions, increase n or subdivide the interval.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaussQuadrature;
