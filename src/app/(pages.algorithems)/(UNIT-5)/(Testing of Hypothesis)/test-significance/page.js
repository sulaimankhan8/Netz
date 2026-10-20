'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import ZTestSolver from './algorithems.z-test';

export default function TestOfSignificancePage() {
  const formula = `
    Z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} = \\frac{\\bar{x} - \\mu_0}{SE}
  `;

  return (
    <>

      <MethodShell route="/test-significance" steps={2} solve={<ZTestSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Z-Test</strong> determines whether an observed sample mean <InlineMath math="\bar{x}" /> differs significantly from a claimed population baseline <InlineMath math="\mu_0" /> when sample size is large (<InlineMath math="n \ge 30" />) or population standard deviation <InlineMath math="\sigma" /> is known!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Z-statistic computation formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Normal distribution
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Mean Deviation</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Difference between sample mean and target: <InlineMath math="\bar{x} - \mu_0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Standard Error</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Sampling variability denominator: <InlineMath math="SE = \frac{\sigma}{\sqrt{n}}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Decision Rule</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Reject <InlineMath math="H_0" /> if <InlineMath math="|Z_{calc}| > Z_{\alpha/2}" /> (e.g. 1.96 for 5% level).
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
                    Test the manufacturer&apos;s lifetime claim:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\mu_0 = 1000 \text{ hours}, \quad \sigma = 50 \text{ hours}" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    A sample of <InlineMath math="n = 100" /> lightbulbs yields <InlineMath math="\bar{x} = 1012" /> hours. Test at <InlineMath math="\alpha = 0.05" /> level!
                  </p>
                </div>

                {/* Step 1: Hypotheses & Standard Error */}
                <Step n={1} title="Hypotheses & standard error">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    State null (<InlineMath math="H_0" />) and alternative (<InlineMath math="H_1" />) hypotheses:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="H_0: \mu = 1000, \quad H_1: \mu \neq 1000 \quad (\text{Two-tailed test})" />
                    <BlockMath math="SE = \frac{\sigma}{\sqrt{n}} = \frac{50}{\sqrt{100}} = \frac{50}{10} = 5.0" />
                  </div>
                </Step>

                {/* Step 2: Z-Statistic Computation */}
                <Step n={2} title="Compute z-statistic & critical threshold">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate test statistic <InlineMath math="Z_{calc}" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="Z_{\text{calc}} = \frac{1012 - 1000}{5.0} = \frac{12}{5.0} = 2.40" />
                    <BlockMath math="|Z_{\text{calc}}| = 2.40 > Z_{0.025} = 1.96" />
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
                      Decision: Reject H₀ (Statistically Significant Difference)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\text{Reject } H_0: |Z_{\\text{calc}}| = 2.40 > 1.96}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Because calculated <InlineMath math="|Z_{calc}| = 2.40" /> exceeds the critical threshold <InlineMath math="1.96" /> at 5% significance level, we <strong>reject the null hypothesis</strong> and conclude the mean lifetime differs significantly from 1000 hours!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}