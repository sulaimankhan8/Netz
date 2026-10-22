'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import TaylorSeriesSolver from './algorithems.taylor-series';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function TaylorSeriesMethodPage() {
  const formula = `
    y(x) = y(x_0) + (x - x_0) y'(x_0) + \\frac{(x - x_0)^2}{2!} y''(x_0) + \\frac{(x - x_0)^3}{3!} y'''(x_0) + \\cdots
  `;

  return (
    <>
      <Head>
        <title>Taylor&apos;s Series Method | Netz</title>
        <meta name="description" content="Master Taylor's Series Method for ODEs with friendly step-by-step guidance, derivative expansions, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 4 • INITIAL VALUE PROBLEMS (ODE)
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  Taylor&apos;s Series <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">ODE Expansion Method</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Taylor&apos;s Series Method</strong> computes exact localized polynomial approximations to initial value problems <InlineMath math="y' = f(x, y)" /> by repeatedly differentiating the differential equation at initial anchor point <InlineMath math="(x_0, y_0)" />!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      TAYLOR TAYLOR SERIES EXPANSION
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      DERIVATIVE STACKING
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Initial Base (y₀)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Initial starting condition <InlineMath math="y(x_0) = y_0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Successive Derivatives</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Differentiate <InlineMath math="y' = f(x, y)" /> repeatedly to find <InlineMath math="y'', y''', y''''" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Factorial Division</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Each term scales by <InlineMath math="\frac{h^k}{k!}" /> where <InlineMath math="h = x - x_0" />.
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
                    Solve the first-order differential equation:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\frac{dy}{dx} = x + y, \quad \text{with initial condition } y(0) = 1" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Find the value of <InlineMath math="y(0.1)" /> using expansion up to the 4th derivative!
                  </p>
                </div>

                {/* Step 1: Derivative Stack */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>EVALUATE HIGHER-ORDER DERIVATIVES AT (0, 1)</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Differentiate <InlineMath math="y' = x + y" /> repeatedly with respect to <InlineMath math="x" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="y'(0) = 0 + 1 = 1" />
                    <BlockMath math="y''(x) = 1 + y' \implies y''(0) = 1 + 1 = 2" />
                    <BlockMath math="y'''(x) = y'' \implies y'''(0) = 2" />
                    <BlockMath math="y''''(x) = y''' \implies y''''(0) = 2" />
                  </div>
                </div>

                {/* Step 2: Taylor Expansion Substitution */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>NUMERICAL TAYLOR EXPANSION</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug derivatives into Taylor series formula for <InlineMath math="h = 0.1" />:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`y(0.1) = y_0 + h y'_0 + \\frac{h^2}{2!} y''_0 + \\frac{h^3}{3!} y'''_0 + \\frac{h^4}{4!} y^{(4)}_0`} />
                    <BlockMath math={`y(0.1) = 1.00000 + (0.1)(1) + \\frac{(0.1)^2}{2}(2) + \\frac{(0.1)^3}{6}(2) + \\frac{(0.1)^4}{24}(2)`} />
                    <BlockMath math={`y(0.1) = 1.00000 + 0.10000 + 0.01000 + 0.000333 + 0.000008`} />
                    <BlockMath math={`y(0.1) = 1.11034`} />
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
                      Approximated Value: y(0.1) ≈ 1.11034
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y(0.1) \\approx 1.11034} \\quad (\\text{Exact: } 2e^{0.1} - 1.1 \\approx 1.11034)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Our 4th-order Taylor series approximation <strong>1.11034</strong> matches the exact analytical solution <InlineMath math="y(x) = 2e^x - x - 1" /> to 5 decimal places!
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
                <TaylorSeriesSolver />
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