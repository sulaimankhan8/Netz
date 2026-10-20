'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import BooleRuleSolver from './algorithems.boole-rule';

export default function BooleRulePage() {
  const formula = `
    I \\approx \\frac{2h}{45} \\left[ 7y_0 + 32y_1 + 12y_2 + 32y_3 + 7y_4 + \\dots \\right]
  `;

  return (
    <>

      <MethodShell route="/boole-Rule" steps={3} solve={<BooleRuleSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Boole&apos;s Rule</strong> fits a 4th-order quartic polynomial across blocks of 5 points (4 subintervals), providing high-order numerical integration precision when total subintervals <InlineMath math="n" /> is a <strong>multiple of 4</strong>!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Boole’s closed 4th-order formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Multiple of 4 requirement
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Pre-factor (2h / 45)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        2 times step size over 45: <InlineMath math="h = \frac{b-a}{n}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Weight Pattern</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Block weights repeat in sequence: 7, 32, 12, 32, 7.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Shared Boundaries</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Block boundaries sum: <InlineMath math="7 + 7 = 14" /> at interior segment junctions.
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
                    Evaluate the definite exponential integral:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\int_{0}^{4} e^x \, dx" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Using <InlineMath math="n = 4" /> subintervals (multiple of 4)!
                  </p>
                </div>

                {/* Step 1: Step Size */}
                <Step n={1} title="Calculate step size (h)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    With limits <InlineMath math="a = 0, b = 4" /> and <InlineMath math="n = 4" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`h = \\frac{b - a}{n} = \\frac{4 - 0}{4} = 1.0`} />
                  </div>
                </Step>

                {/* Step 2: Grid Table */}
                <Step n={2} title="Tabulate function values & Boole weights">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x_i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y_i = e^(x_i)</th>
                          <th className="p-2.5">Boole Weight (w_i)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">0.0</td>
                          <td className="p-2 border-r border-emerald-600">1.00000 (y_0)</td>
                          <td className="p-2">7</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.71828 (y_1)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">32</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">7.38906 (y_2)</td>
                          <td className="p-2 font-bold text-blue-600 dark:text-blue-400">12</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20.08554 (y_3)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">32</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">4</td>
                          <td className="p-2 border-r border-emerald-600">4.0</td>
                          <td className="p-2 border-r border-emerald-600">54.59815 (y_4)</td>
                          <td className="p-2">7</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 3: Formula & Explicit Substitution */}
                <Step n={3} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Boole&apos;s Rule Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`I = \\frac{2h}{45} \\left[ 7y_0 + 32y_1 + 12y_2 + 32y_3 + 7y_4 \\right]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{2(1.0)}{45} \\left[ 7(1.0) + 32(2.71828) + 12(7.38906) + 32(20.08554) + 7(54.59815) \\right]`} />
                    <BlockMath math={`I = \\frac{2}{45} \\left[ 7.00000 + 86.98496 + 88.66872 + 642.73728 + 382.18705 \\right]`} />
                    <BlockMath math={`I = \\frac{2}{45} (1207.57801) = 53.67013`} />
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
                      Approximated Integral: I ≈ 53.6701
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\int_0^4 e^x dx \\approx 53.6701} \\quad (\\text{Exact: } e^4 - 1 \\approx 53.59815)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With <InlineMath math="n = 4" /> subintervals, Boole&apos;s Rule evaluates <strong>53.6701</strong>, matching the true analytical exponential integral with remarkable precision!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}