'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import TrapezoidalRuleSolver from './algorithems.trapezoidal-rule';

export default function TrapezoidalRulePage() {
  const formula = `
    I = \\int_{a}^{b} f(x) \\, dx \\approx \\frac{h}{2} \\left[ (y_0 + y_n) + 2(y_1 + y_2 + \\dots + y_{n-1}) \\right]
  `;

  return (
    <>

      <MethodShell route="/trapezoidal-Rule" steps={3} solve={<TrapezoidalRuleSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Trapezoidal Rule</strong> approximates a definite integral <InlineMath math="\int_a^b f(x) dx" /> by connecting neighboring function evaluations with straight lines, forming a series of trapezoids whose areas sum to the total definite integral!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Composite trapezoidal formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Linear interpolation
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Subinterval Step (h)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="h = \frac{b - a}{n}" /> (width of each trapezoid strip).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. End Heights (y₀ + yₙ)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        The boundaries at <InlineMath math="a" /> and <InlineMath math="b" /> are counted once.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Interior Heights (2 × Sum)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Shared internal boundaries are counted twice: <InlineMath math="2(y_1 + \dots + y_{n-1})" />.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <div className="space-y-6">
                <div className="am-section-title"><h2>Worked example</h2></div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      Our problem to solve
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Evaluate the classic definite integral:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\int_{0}^{1} \frac{1}{1 + x^2} \, dx" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Using <InlineMath math="n = 6" /> subintervals!
                  </p>
                </div>

                {/* Step 1: Step Size */}
                <Step n={1} title="Calculate strip step size (h)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    With integration limits <InlineMath math="a = 0, b = 1" /> and <InlineMath math="n = 6" /> subintervals:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`h = \\frac{b - a}{n} = \\frac{1 - 0}{6} = \\frac{1}{6} \\approx 0.166667`} />
                  </div>
                </Step>

                {/* Step 2: Grid Table */}
                <Step n={2} title="Tabulate grid points & function values">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x_i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x_i) = 1 / (1 + x_i²)</th>
                          <th className="p-2.5">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">0.00000</td>
                          <td className="p-2 border-r border-emerald-600">1.00000 (y_0)</td>
                          <td className="p-2">Boundary End</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.16667</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.97297 (y_1)</td>
                          <td className="p-2">Interior (×2)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.33333</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.90000 (y_2)</td>
                          <td className="p-2">Interior (×2)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.50000</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.80000 (y_3)</td>
                          <td className="p-2">Interior (×2)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.66667</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.69231 (y_4)</td>
                          <td className="p-2">Interior (×2)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.83333</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.59016 (y_5)</td>
                          <td className="p-2">Interior (×2)</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">6</td>
                          <td className="p-2 border-r border-emerald-600">1.00000</td>
                          <td className="p-2 border-r border-emerald-600">0.50000 (y_6)</td>
                          <td className="p-2">Boundary End</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 3: Formula & Explicit Substitution */}
                <Step n={3} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Trapezoidal Integration Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`I = \\frac{h}{2} \\left[ (y_0 + y_6) + 2(y_1 + y_2 + y_3 + y_4 + y_5) \\right]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{1/6}{2} \\left[ (1.00000 + 0.50000) + 2(0.97297 + 0.90000 + 0.80000 + 0.69231 + 0.59016) \\right]`} />
                    <BlockMath math={`I = \\frac{1}{12} \\left[ 1.50000 + 2(3.95544) \\right] = \\frac{1}{12} \\left[ 1.50000 + 7.91088 \\right]`} />
                    <BlockMath math={`I = \\frac{1}{12} (9.41088) = 0.78424`} />
                  </div>
                </Step>
<StepControls />
<StepsDone>

                {/* Step 4: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final result
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Approximated Integral: I ≈ 0.78424
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\int_0^1 \\frac{1}{1+x^2} dx \\approx 0.78424} \\quad (\\text{Exact: } \\frac{\\pi}{4} \\approx 0.78540)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With <InlineMath math="n = 6" /> trapezoidal strips, the numerical integral <strong>0.78424</strong> matches the analytical value <InlineMath math="\pi/4" /> to 3 decimal places!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}