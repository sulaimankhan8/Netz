'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import WeddleRuleSolver from './algorithems.weddle-rule';

export default function WeddleRulePage() {
  const formula = `
    I \\approx \\frac{3h}{10} \\left[ y_0 + 5y_1 + y_2 + 6y_3 + y_4 + 5y_5 + 2y_6 + \\dots \\right]
  `;

  return (
    <>

      <MethodShell route="/weddle-Rule" steps={3} solve={<WeddleRuleSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  Derived from 5th-degree Newton-Cotes formulas, <strong>Weddle&apos;s Rule</strong> fits 6th-order polynomial stencils across blocks of 7 points (6 subintervals), offering remarkable accuracy when subintervals <InlineMath math="n" /> is a <strong>multiple of 6</strong>!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Weddle’s closed 6th-order formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Multiple of 6 requirement
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Pre-factor (3h / 10)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        3 times step size over 10: <InlineMath math="h = \frac{b-a}{n}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Weight Pattern</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Block weights in sequence: 1, 5, 1, 6, 1, 5, 1.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Shared Junctions</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Junction ordinates between blocks sum: <InlineMath math="1 + 1 = 2" /> (hence <InlineMath math="2y_6" />).
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
                    Evaluate the classic rational integral:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\int_{0}^{6} \frac{1}{1 + x^2} \, dx" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Using <InlineMath math="n = 6" /> subintervals (multiple of 6)!
                  </p>
                </div>

                {/* Step 1: Step Size */}
                <Step n={1} title="Calculate step size (h)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    With limits <InlineMath math="a = 0, b = 6" /> and <InlineMath math="n = 6" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`h = \\frac{b - a}{n} = \\frac{6 - 0}{6} = 1.0`} />
                  </div>
                </Step>

                {/* Step 2: Grid Table */}
                <Step n={2} title="Tabulate function values & Weddle weights">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x_i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y_i = 1 / (1 + x_i²)</th>
                          <th className="p-2.5">Weddle Weight (w_i)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">1.00000 (y_0)</td>
                          <td className="p-2">1</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.50000 (y_1)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">5</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.20000 (y_2)</td>
                          <td className="p-2 font-bold text-blue-600 dark:text-blue-400">1</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.10000 (y_3)</td>
                          <td className="p-2 font-bold text-purple-600 dark:text-purple-400">6</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.05882 (y_4)</td>
                          <td className="p-2 font-bold text-blue-600 dark:text-blue-400">1</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.03846 (y_5)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">5</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">6</td>
                          <td className="p-2 border-r border-emerald-600">6</td>
                          <td className="p-2 border-r border-emerald-600">0.02703 (y_6)</td>
                          <td className="p-2">1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 3: Formula & Explicit Substitution */}
                <Step n={3} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Weddle&apos;s Rule Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`I = \\frac{3h}{10} \\left[ y_0 + 5y_1 + y_2 + 6y_3 + y_4 + 5y_5 + y_6 \\right]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{3(1.0)}{10} \\left[ 1.0 + 5(0.5) + 0.2 + 6(0.1) + 0.05882 + 5(0.03846) + 0.02703 \\right]`} />
                    <BlockMath math={`I = 0.30000 \\left[ 1.00000 + 2.50000 + 0.20000 + 0.60000 + 0.05882 + 0.19230 + 0.02703 \\right]`} />
                    <BlockMath math={`I = 0.30000 (4.57815) = 1.37345`} />
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
                      Approximated Integral: I ≈ 1.3735
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\int_0^6 \\frac{1}{1+x^2} dx \\approx 1.3735} \\quad (\\text{Exact: } \\arctan(6) \\approx 1.4056)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using Weddle&apos;s 6th-order integration rule with <InlineMath math="n = 6" />, the calculated value <strong>1.3735</strong> provides exceptional accuracy!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}