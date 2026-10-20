'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import TTestSolver from './algorithems.t-test';

export default function TTestPage() {
  const formula = `
    t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\quad \\text{with } df = n - 1
  `;

  return (
    <>

      <MethodShell route="/t-test" steps={2} solve={<TTestSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  When sample size is small (<InlineMath math="n < 30" />) and true population variance <InlineMath math="\sigma^2" /> is unknown, the <strong>Student&apos;s t-Test</strong> evaluates whether an observed mean deviation is statistically significant or merely sampling noise!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Student’s t-statistic formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Heavy-tailed t-distribution
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Sample Standard Dev (s)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Unbiased variance estimate: <InlineMath math="s = \sqrt{\frac{\sum(x - \bar{x})^2}{n-1}}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Degrees of Freedom</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Parameter constraints: <InlineMath math="df = n - 1" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Critical Decision</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Reject <InlineMath math="H_0" /> if <InlineMath math="|t_{calc}| > t_{\alpha/2, df}" />.
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
                    Given the 5 sample observations:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="[12, 15, 11, 14, 13]" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Test the null hypothesis <InlineMath math="H_0: \mu = 10" /> at significance level <InlineMath math="\alpha = 0.05" />!
                  </p>
                </div>

                {/* Step 1: Summary Statistics */}
                <Step n={1} title="Compute sample mean & standard deviation">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate sample mean <InlineMath math="\bar{x}" /> and sample standard deviation <InlineMath math="s" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="\bar{x} = \frac{12 + 15 + 11 + 14 + 13}{5} = \frac{65}{5} = 13.0" />
                    <BlockMath math="s^2 = \frac{(-1)^2 + 2^2 + (-2)^2 + 1^2 + 0^2}{5 - 1} = \frac{10}{4} = 2.5 \implies s = \sqrt{2.5} \approx 1.5811" />
                    <BlockMath math="SE = \frac{s}{\sqrt{n}} = \frac{1.5811}{\sqrt{5}} \approx 0.7071" />
                  </div>
                </Step>

                {/* Step 2: t-Statistic Computation */}
                <Step n={2} title="Compute t-statistic & threshold">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate test statistic with <InlineMath math="df = 4" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="t_{\text{calc}} = \frac{13.0 - 10}{0.7071} = 4.2426" />
                    <BlockMath math="|t_{\text{calc}}| = 4.2426 > t_{0.025, 4} = 2.776" />
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
                      Decision: Reject H₀ (Mean is Significantly Greater)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\text{Reject } H_0: |t_{\\text{calc}}| = 4.2426 > 2.776}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Because calculated <InlineMath math="|t_{calc}| = 4.2426" /> exceeds the critical value <InlineMath math="2.776" /> at <InlineMath math="df = 4" />, we <strong>reject the null hypothesis</strong> and conclude the mean is significantly greater than 10!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}