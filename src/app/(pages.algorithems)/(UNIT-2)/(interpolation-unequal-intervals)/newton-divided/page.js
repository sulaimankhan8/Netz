'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import NewtonsDividedDifference from './algorithems.newton-s-divided-difference-interpolations';

export default function NewtonsDividedDifferences() {
  const formula = `
    f(x) = y_0 + (x-x_0)f[x_0,x_1] + (x-x_0)(x-x_1)f[x_0,x_1,x_2] 
    + (x-x_0)(x-x_1)(x-x_2)f[x_0,x_1,x_2,x_3] + \\cdots
  `;

  return (
    <>

      <MethodShell route="/newton-divided" steps={2} solve={<NewtonsDividedDifference />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  When your data points are <strong>unequally spaced</strong>, standard forward/backward difference tables break down. <strong>Newton&apos;s Divided Difference Method</strong> solves this by dividing each difference by its corresponding interval span!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Divided difference formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Unequal spacing ready
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. First Divided Diff</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="f[x_0,x_1] = \frac{y_1 - y_0}{x_1 - x_0}" />
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Second Divided Diff</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="f[x_0,x_1,x_2] = \frac{f[x_1,x_2] - f[x_0,x_1]}{x_2 - x_0}" />
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Polynomial Terms</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Multiplies differences by progressive factors <InlineMath math="(x - x_0)(x - x_1)\dots" />
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
                    Given the unequally spaced dataset:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">0</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">4</th>
                          <th className="p-2">7</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">49</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">129</td>
                          <td className="p-2">813</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Let&apos;s estimate the value of <InlineMath math="f(x)" /> at <InlineMath math="x = 0.3" />!
                  </p>
                </div>

                {/* Step 1: Divided Difference Table */}
                <Step n={1} title="Construct divided difference table">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">1st Order</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">2nd Order</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">3rd Order</th>
                          <th className="p-2.5">4th Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">0 (x_0)</td>
                          <td className="p-2 border-r border-emerald-600">1 (y_0)</td>
                          <td className="p-2 border-r border-emerald-600">2 (f[x_0,x_1])</td>
                          <td className="p-2 border-r border-emerald-600">7 (f[x_0,x_1,x_2])</td>
                          <td className="p-2 border-r border-emerald-600">3 (f[x_0..x_3])</td>
                          <td className="p-2">0</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">23</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">19</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">49</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">80</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">37</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">129</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">228</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">7</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">813</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 2: Formula & Explicit Substitution */}
                <Step n={2} title="Formula & numerical substitution">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Newton Divided Difference Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`f(x) = y_0 + (x-x_0)f[x_0,x_1] + (x-x_0)(x-x_1)f[x_0,x_1,x_2] + (x-x_0)(x-x_1)(x-x_2)f[x_0,x_1,x_2,x_3]`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values (<InlineMath math="x = 0.3, y_0 = 1, f[x_0,x_1] = 2, f[x_0,x_1,x_2] = 7, f[x_0..x_3] = 3" />):
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`f(0.3) = 1 + (0.3)(2) + (0.3)(-0.7)(7) + (0.3)(-0.7)(-2.7)(3)`} />
                    <BlockMath math={`f(0.3) = 1.00000 + 0.60000 - 1.47000 + 1.70100`} />
                    <BlockMath math={`f(0.3) = 1.83100`} />
                  </div>
                </Step>
<StepControls />
<StepsDone>

                {/* Step 3: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final result
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Interpolated Value at x = 0.3: f(0.3) = 1.831
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{f(0.3) = 1.831}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using Newton&apos;s divided differences for unequal spacing, the estimated functional value at <InlineMath math="x = 0.3" /> is <strong>1.831</strong>!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
