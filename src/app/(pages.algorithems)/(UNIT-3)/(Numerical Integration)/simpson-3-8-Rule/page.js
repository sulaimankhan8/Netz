'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import Simpson38RuleSolver from './algorithems.simpson-3-8-rule';

export default function Simpson38RulePage() {
  const formula = `
    I = \\int_{a}^{b} f(x) \\, dx \\approx \\frac{3h}{8} \\left[ (y_0 + y_n) + 3(y_1 + y_2 + y_4 + y_5 + \\dots) + 2(y_3 + y_6 + \\dots) \\right]
  `;

  return (
    <>

      <MethodShell route="/simpson-3-8-Rule" steps={3} solve={<Simpson38RuleSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Simpson&apos;s 3/8 Rule</strong> fits cubic polynomials across sets of 4 consecutive points (3 subintervals), providing exceptional accuracy when the total subintervals <InlineMath math="n" /> is a <strong>multiple of 3</strong>!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Simpson’s 3/8 composite formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Multiple of 3 requirement
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Pre-factor (3h / 8)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        3 times step size over 8: <InlineMath math="h = \frac{b-a}{n}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Non-Multiple 3 (3×)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Indices not divisible by 3 get multiplied by 3: <InlineMath math="3(y_1 + y_2 + y_4 + \dots)" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Multiple of 3 (2×)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Interior indices divisible by 3 get multiplied by 2: <InlineMath math="2(y_3 + y_6 + \dots)" />.
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
                    Evaluate the exponential growth integral:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\int_{0}^{3} e^x \, dx" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Using <InlineMath math="n = 3" /> subintervals (multiple of 3)!
                  </p>
                </div>

                {/* Step 1: Step Size */}
                <Step n={1} title="Calculate step size (h)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    With limits <InlineMath math="a = 0, b = 3" /> and <InlineMath math="n = 3" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`h = \\frac{b - a}{n} = \\frac{3 - 0}{3} = 1.0`} />
                  </div>
                </Step>

                {/* Step 2: Grid Table */}
                <Step n={2} title="Tabulate function values & weight multipliers">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x_i</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y_i = e^(x_i)</th>
                          <th className="p-2.5">Weight Multiplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">0.0</td>
                          <td className="p-2 border-r border-emerald-600">1.00000 (y_0)</td>
                          <td className="p-2">1 (Boundary)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.71828 (y_1)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">3 (Non-mult of 3)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">7.38906 (y_2)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">3 (Non-mult of 3)</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">3</td>
                          <td className="p-2 border-r border-emerald-600">3.0</td>
                          <td className="p-2 border-r border-emerald-600">20.08554 (y_3)</td>
                          <td className="p-2">1 (Boundary)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 3: Formula & Explicit Substitution */}
                <Step n={3} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Simpson&apos;s 3/8 Rule Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`I = \\frac{3h}{8} \\left[ (y_0 + y_3) + 3(y_1 + y_2) \\right]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{3(1.0)}{8} \\left[ (1.00000 + 20.08554) + 3(2.71828 + 7.38906) \\right]`} />
                    <BlockMath math={`I = 0.37500 \\left[ 21.08554 + 3(10.10734) \\right] = 0.37500 \\left[ 21.08554 + 30.32202 \\right]`} />
                    <BlockMath math={`I = 0.37500 (51.40756) = 19.27784`} />
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
                      Approximated Integral: I ≈ 19.2778
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\int_0^3 e^x dx \\approx 19.2778} \\quad (\\text{Exact: } e^3 - 1 \\approx 19.0855)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With <InlineMath math="n = 3" /> cubic subintervals, Simpson&apos;s 3/8 Rule computes <strong>19.2778</strong>, accurately capturing steep exponential curvature!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}