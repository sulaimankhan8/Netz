'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import ChiSquareSolver from './algorithems.chi-square';

export default function ChiSquarePage() {
  const formula = `
    \\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i} \\quad \\text{with } df = k - 1
  `;

  return (
    <>

      <MethodShell route="/chi-square" steps={2} solve={<ChiSquareSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The non-parametric <strong>Chi-Square (&chi;&sup2;) Test</strong> evaluates whether observed counts across categorical bins match expected theoretical frequencies, testing if discrepancies are statistically significant!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Chi-square goodness of fit statistic
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Right-tailed distribution
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Residual Component</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Normalized squared difference: <InlineMath math="\frac{(O_i - E_i)^2}{E_i}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Degrees of Freedom</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Number of categories minus 1: <InlineMath math="df = k - 1" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Critical Decision</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Reject <InlineMath math="H_0" /> if <InlineMath math="\chi^2_{calc} > \chi^2_{\alpha, df}" />.
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
                    Test for equal distribution across 4 categories:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="O = [25, 19, 16, 20], \quad E_i = 20 \quad (\text{Equal expected counts})" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Test <InlineMath math="H_0" /> at significance level <InlineMath math="\alpha = 0.05" />!
                  </p>
                </div>

                {/* Step 1: Component Residual Table */}
                <Step n={1} title="Tabulate category residual components">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Category (i)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Observed (O_i)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Expected (E_i)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">O_i - E_i</th>
                          <th className="p-2.5">(O_i - E_i)² / E_i</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">25</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">+5</td>
                          <td className="p-2 font-bold">1.25</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">19</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-1</td>
                          <td className="p-2 font-bold">0.05</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">16</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-4</td>
                          <td className="p-2 font-bold">0.80</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0</td>
                          <td className="p-2 font-bold">0.00</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">Total</td>
                          <td className="p-2 border-r border-emerald-600">80</td>
                          <td className="p-2 border-r border-emerald-600">80</td>
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2">χ²_calc = 2.10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 2: Chi-Square Test Comparison */}
                <Step n={2} title="Chi-square critical comparison">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Compare test statistic with critical threshold for <InlineMath math="df = 4 - 1 = 3" />:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`\\chi^2_{\\text{calc}} = \\sum_{i=1}^4 \\frac{(O_i - E_i)^2}{E_i}`} />
                    <BlockMath math={`\\chi^2_{\\text{calc}} = \\frac{(25-20)^2}{20} + \\frac{(19-20)^2}{20} + \\frac{(16-20)^2}{20} + \\frac{(20-20)^2}{20}`} />
                    <BlockMath math={`\\chi^2_{\\text{calc}} = 1.25000 + 0.05000 + 0.80000 + 0.00000 = 2.10000`} />
                    <BlockMath math={`\\chi^2_{\\text{calc}} = 2.10000 < \\chi^2_{0.05, 3} = 7.815`} />
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
                      Decision: Fail to Reject H₀ (Observed Counts Fit Expected Model)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\text{Fail to Reject } H_0: \\chi^2_{\\text{calc}} = 2.10 < 7.815}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Because calculated <InlineMath math="\chi^2_{calc} = 2.10" /> is well below critical value <InlineMath math="7.815" />, we <strong>fail to reject the null hypothesis</strong>—concluding that observed frequencies match the theoretical distribution!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}