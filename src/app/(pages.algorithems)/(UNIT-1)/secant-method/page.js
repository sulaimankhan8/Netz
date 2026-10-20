'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import SecantMethod from './algorithems.secant-method';

export default function SecantMethodPage() {
  const iterationData = [
    { k: 1, x0: '2.000000', x1: '3.000000', x2: '2.058824', fx0: '-1.000000', fx1: '16.000000', fx2: '-0.390800', ea: '45.714%' },
    { k: 2, x0: '3.000000', x1: '2.058824', x2: '2.081264', fx0: '16.000000', fx1: '-0.390800', fx2: '-0.147204', ea: '1.078%' },
    { k: 3, x0: '2.058824', x1: '2.081264', x2: '2.094824', fx0: '-0.390800', fx1: '-0.147204', fx2: '0.003044', ea: '0.647%' },
    { k: 4, x0: '2.081264', x1: '2.094824', x2: '2.094549', fx0: '-0.147204', fx1: '0.003044', fx2: '-0.000023', ea: '0.013%' },
  ];

  return (
    <>

      <MethodShell route="/secant-method" steps={4} solve={<SecantMethod />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Secant Method</strong> is an open root-finding method that approximates derivatives using two recent function evaluations — making it faster than Bisection with <strong>no need for analytical derivatives</strong>. It achieves super-linear convergence (order ≈ 1.618, the golden ratio).
                </p>

              {/* Core Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      How the secant method works
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Secant line approximation
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={`x_{n+1} = x_n - f(x_n) \\cdot \\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Two Initial Guesses</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Choose <InlineMath math="x_0" /> and <InlineMath math="x_1" /> — no bracketing required (unlike Bisection).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Draw a Secant Line</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Approximate the derivative by a secant through <InlineMath math="(x_{n-1}, f(x_{n-1}))" /> and <InlineMath math="(x_n, f(x_n))" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Find x-Intercept</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Where the secant crosses the x-axis becomes the new estimate <InlineMath math="x_{n+1}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">4. Repeat Until Convergence</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Slide the window forward: old <InlineMath math="x_1" /> becomes new <InlineMath math="x_0" />, new estimate becomes <InlineMath math="x_1" />.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <div className="space-y-6">
                <div className="am-section-title"><h2>Worked example</h2></div>

                {/* Problem Statement */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                    Our problem to solve
                  </span>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Find the root of <InlineMath math="f(x) = x^3 - 2x - 5 = 0" /> using the Secant Method with <InlineMath math="x_0 = 2" />, <InlineMath math="x_1 = 3" />, tolerance = 0.0001.
                  </p>
                </div>

                {/* Step 1 */}
                <Step n={1} title="Evaluate initial points">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate <InlineMath math="f(x_0)" /> and <InlineMath math="f(x_1)" /> to set up the first secant line:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`f(x_0) = f(2) = 2^3 - 2(2) - 5 = 8 - 4 - 5 = -1`} />
                    <BlockMath math={`f(x_1) = f(3) = 3^3 - 2(3) - 5 = 27 - 6 - 5 = 16`} />
                  </div>
                </Step>

                {/* Step 2 */}
                <Step n={2} title="Apply the secant formula">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug into the secant formula to find the first new estimate <InlineMath math="x_2" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_2 = x_1 - f(x_1) \\cdot \\frac{x_1 - x_0}{f(x_1) - f(x_0)}`} />
                    <BlockMath math={`x_2 = 3 - 16 \\cdot \\frac{3 - 2}{16 - (-1)} = 3 - 16 \\cdot \\frac{1}{17} \\approx 2.0588`} />
                  </div>
                </Step>

                {/* Step 3 */}
                <Step n={3} title="Slide the window forward">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Update the pair: the old <InlineMath math="x_1 = 3" /> becomes the new <InlineMath math="x_0" />, and <InlineMath math="x_2 \approx 2.0588" /> becomes the new <InlineMath math="x_1" />.
                    Repeat until <InlineMath math="|f(x_{n+1})| < \epsilon" />.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl font-mono text-xs text-center font-bold">
                    New pair: <InlineMath math="x_0 = 3,\; x_1 = 2.0588" /> → Continue iterating
                  </div>
                </Step>

                {/* Iteration Summary Table */}
                <Step n={4} title="Iteration summary table">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">k</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₀</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₁</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₂ (New)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x₀)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x₁)</th>
                          <th className="p-2.5">Ea (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iterationData.map((row) => (
                          <tr key={row.k} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row.k}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.x0}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.x1}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.x2}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fx0}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fx1}</td>
                            <td className="p-2.5">{row.ea}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Step>
<StepControls />
<StepsDone>

                {/* Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final conclusion
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Root Converged: x ≈ 2.094549
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`f(2.094549) = (2.094549)^3 - 2(2.094549) - 5 = -0.000023 \\approx 0`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      The Secant Method converged in just <strong>4 iterations</strong>, compared to 14 for Bisection on the same problem.
                      This is the power of the <InlineMath math="\phi" />-order (≈1.618) convergence rate — each step dramatically improves accuracy!
                      Note: unlike Newton-Raphson, no derivative <InlineMath math="f'(x)" /> was required.
                    </p>
                  </div>
                </div>
              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
