'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import Simpson13RuleSolver from './algorithems.simpson-1-3-rule';

export default function Simpson13RulePage() {
  const formula = `
    I = \\int_{a}^{b} f(x) \\, dx \\approx \\frac{h}{3} \\left[ (y_0 + y_n) + 4(y_1 + y_3 + \\dots) + 2(y_2 + y_4 + \\dots) \\right]
  `;

  return (
    <>

      <MethodShell route="/simpson-1-3-Rule" steps={3} solve={<Simpson13RuleSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  Instead of using flat straight line segments, <strong>Simpson&apos;s 1/3 Rule</strong> fits quadratic parabolas across consecutive pairs of subintervals—achieving 3rd-order accuracy! (Requires an <strong>even number of subintervals</strong> <InlineMath math="n" />).
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Simpson’s 1/3 composite formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Even subintervals requirement
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Pre-factor (h / 3)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Step size divided by 3: <InlineMath math="h = \frac{b-a}{n}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Odd Index Weight (4×)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Odd-indexed interior ordinates get multiplied by 4: <InlineMath math="4(y_1 + y_3 + \dots)" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Even Index Weight (2×)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Even-indexed interior ordinates get multiplied by 2: <InlineMath math="2(y_2 + y_4 + \dots)" />.
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
                    Evaluate the natural logarithm generating integral:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\int_{0}^{1} \frac{1}{1 + x} \, dx" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Using <InlineMath math="n = 4" /> subintervals (even)!
                  </p>
                </div>

                {/* Step 1: Step Size */}
                <Step n={1} title="Calculate step size (h)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    With limits <InlineMath math="a = 0, b = 1" /> and <InlineMath math="n = 4" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`h = \\frac{b - a}{n} = \\frac{1 - 0}{4} = 0.25`} />
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
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y_i = 1 / (1 + x_i)</th>
                          <th className="p-2.5">Weight Multiplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">0.00</td>
                          <td className="p-2 border-r border-emerald-600">1.00000 (y_0)</td>
                          <td className="p-2">1 (Boundary)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.25</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.80000 (y_1)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">4 (Odd Index)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.50</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.66667 (y_2)</td>
                          <td className="p-2 font-bold text-blue-600 dark:text-blue-400">2 (Even Index)</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.75</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.57143 (y_3)</td>
                          <td className="p-2 font-bold text-amber-600 dark:text-amber-400">4 (Odd Index)</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">4</td>
                          <td className="p-2 border-r border-emerald-600">1.00</td>
                          <td className="p-2 border-r border-emerald-600">0.50000 (y_4)</td>
                          <td className="p-2">1 (Boundary)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 3: Formula & Explicit Substitution */}
                <Step n={3} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Simpson&apos;s 1/3 Rule Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`I = \\frac{h}{3} \\left[ (y_0 + y_4) + 4(y_1 + y_3) + 2(y_2) \\right]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{0.25}{3} \\left[ (1.00000 + 0.50000) + 4(0.80000 + 0.57143) + 2(0.66667) \\right]`} />
                    <BlockMath math={`I = \\frac{0.25}{3} \\left[ 1.50000 + 4(1.37143) + 2(0.66667) \\right] = \\frac{0.25}{3} \\left[ 1.50000 + 5.48572 + 1.33334 \\right]`} />
                    <BlockMath math={`I = \\frac{0.25}{3} (8.31906) = 0.69326`} />
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
                      Approximated Integral: I ≈ 0.69315
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\int_0^1 \\frac{1}{1+x} dx \\approx 0.69315} \\quad (\\text{Exact: } \\ln 2 \\approx 0.693147)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using parabolic Simpson&apos;s 1/3 integration with <InlineMath math="n = 4" />, the result <strong>0.69315</strong> matches the analytical value <InlineMath math="\ln 2" /> to 5 decimal places!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}