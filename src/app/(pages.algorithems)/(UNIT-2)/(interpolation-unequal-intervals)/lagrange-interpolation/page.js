'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import LagrangeInterpolations from './algorithems.lagrange-interpolations';

export default function LagrangeInterpolationPage() {
  const formula = `
    P(x) = \\sum_{i=0}^n y_i \\cdot L_i(x) = y_0 L_0(x) + y_1 L_1(x) + \\cdots + y_n L_n(x)
  `;

  const basisFormula = `
    L_i(x) = \\prod_{j=0, j \\neq i}^n \\frac{x - x_j}{x_i - x_j}
  `;

  return (
    <>

      <MethodShell route="/lagrange-interpolation" steps={2} solve={<LagrangeInterpolations />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Lagrange Interpolation</strong> builds a weighted combination of basis polynomials <InlineMath math="L_i(x)" /> where each basis equals <InlineMath math="1" /> at its own point <InlineMath math="x_i" /> and <InlineMath math="0" /> at all other points—making it ideal for non-uniform data without computing difference tables!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Lagrange basis formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Exact polynomial weights
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={formula} />
                    <BlockMath math={basisFormula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Basis Condition</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="L_i(x_j) = 1" /> if <InlineMath math="i=j" />, else <InlineMath math="0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Sum of Weights</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Always sums to 1: <InlineMath math="\sum L_i(x) = 1" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. No Grid Restriction</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Works seamlessly for equal or unequal intervals.
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
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">5</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">6</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">9</th>
                          <th className="p-2">11</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">12</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">13</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">14</td>
                          <td className="p-2">16</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Let&apos;s estimate the value at <InlineMath math="x = 10" />!
                  </p>
                </div>

                {/* Step 1: Calculate Basis Polynomials */}
                <Step n={1} title="Evaluate Lagrange basis weights L_i(10)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate each basis fraction at <InlineMath math="x = 10" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`L_0(10) = \\frac{(10-6)(10-9)(10-11)}{(5-6)(5-9)(5-11)} = \\frac{-4}{-24} = \\frac{1}{6}`} />
                    <BlockMath math={`L_1(10) = \\frac{(10-5)(10-9)(10-11)}{(6-5)(6-9)(6-11)} = \\frac{-5}{15} = -\\frac{1}{3}`} />
                    <BlockMath math={`L_2(10) = \\frac{(10-5)(10-6)(10-11)}{(9-5)(9-6)(9-11)} = \\frac{-20}{-24} = \\frac{5}{6}`} />
                    <BlockMath math={`L_3(10) = \\frac{(10-5)(10-6)(10-9)}{(11-5)(11-6)(11-9)} = \\frac{20}{60} = \\frac{1}{3}`} />
                  </div>
                </Step>

                {/* Step 2: Combine Weighted Sum */}
                <Step n={2} title="Combine weighted sum">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Multiply each basis weight by its corresponding <InlineMath math="y_i" /> value:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`P(10) = 12\\left(\\frac{1}{6}\\right) + 13\\left(-\\frac{1}{3}\\right) + 14\\left(\\frac{5}{6}\\right) + 16\\left(\\frac{1}{3}\\right)`} />
                    <BlockMath math={`P(10) = 2.00000 - 4.33333 + 11.66667 + 5.33333`} />
                    <BlockMath math={`P(10) = 14.66667 = \\frac{44}{3}`} />
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
                      Interpolated Value at x = 10: P(10) ≈ 14.6667
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{P(10) = 14.6667 = \\frac{44}{3}}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using Lagrange polynomial interpolation, the estimated value of <InlineMath math="y" /> at <InlineMath math="x = 10" /> is <strong>14.6667</strong>!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
