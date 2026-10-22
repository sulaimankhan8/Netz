'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import FTestSolver from './algorithems.f-test';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function FTestPage() {
  const formula = `
    F = \\frac{s_1^2}{s_2^2} \\quad \\text{where } s_1^2 \\ge s_2^2
  `;

  return (
    <>
      <Head>
        <title>F-Test Variance Ratio Test | Netz</title>
        <meta name="description" content="Master F-Test for comparing two sample variances with friendly step-by-step guidance, variance ratio calculation, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 5 • TESTING OF HYPOTHESIS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  F-Test <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Variance Ratio Test</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>F-Test</strong> compares the ratio of two sample variances <InlineMath math="F = s_1^2 / s_2^2" /> to test whether two independent populations have equal variability (<InlineMath math="\sigma_1^2 = \sigma_2^2" />)!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      F-STATISTIC VARIANCE RATIO FORMULA
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      RIGHT-TAILED RATIO
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Numerator (s₁²)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Always place the larger sample variance in numerator (<InlineMath math="s_1^2 \ge s_2^2" />).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Degrees of Freedom</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Numerator <InlineMath math="df_1 = n_1 - 1" />, Denominator <InlineMath math="df_2 = n_2 - 1" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Critical Decision</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Reject <InlineMath math="H_0" /> if <InlineMath math="F_{calc} > F_{\alpha}(df_1, df_2)" />.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                    Step-by-Step Worked Example
                  </h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
                    GUIDED STORY
                  </span>
                </div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      OUR PROBLEM TO SOLVE
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Compare variances of 2 independent sample groups:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="n_1 = 10, \, s_1^2 = 25.0 \quad \text{vs} \quad n_2 = 12, \, s_2^2 = 10.0" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Test the null hypothesis <InlineMath math="H_0: \sigma_1^2 = \sigma_2^2" /> at significance level <InlineMath math="\alpha = 0.05" />!
                  </p>
                </div>

                {/* Step 1: Degrees of Freedom & Hypotheses */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>DEGREES OF FREEDOM & HYPOTHESES</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Formulate hypotheses and calculate degrees of freedom:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="H_0: \sigma_1^2 = \sigma_2^2, \quad H_1: \sigma_1^2 \neq \sigma_2^2" />
                    <BlockMath math="df_1 = n_1 - 1 = 9, \quad df_2 = n_2 - 1 = 11" />
                  </div>
                </div>

                {/* Step 2: F-Statistic Computation */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>COMPUTE F-STATISTIC & CRITICAL THRESHOLD</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate variance ratio <InlineMath math="F_{calc}" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="F_{\text{calc}} = \frac{s_1^2}{s_2^2} = \frac{25.0}{10.0} = 2.50" />
                    <BlockMath math="F_{\text{calc}} = 2.50 < F_{0.05}(9, 11) = 2.896" />
                  </div>
                </div>

                {/* Step 3: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      FINAL RESULT
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Decision: Fail to Reject H₀ (Variances Not Significantly Different)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{\\text{Fail to Reject } H_0: F_{\\text{calc}} = 2.50 < 2.896}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Because calculated <InlineMath math="F_{calc} = 2.50" /> is less than critical value <InlineMath math="2.896" />, we <strong>fail to reject the null hypothesis</strong>—concluding there is no significant difference between population variances!
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Calculator Section */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
                  LABORATORY
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Interactive Live Calculator & Visualizer
                </h2>
                <FTestSolver />
              </div>

              {/* Sequential Routing Navigation */}
              <AlgorithmNavigation />

            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}