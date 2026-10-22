'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import RungeKuttaSolver from './algorithems.runge-kutta';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function RungeKuttaMethodPage() {
  const k1Formula = `k_1 = h \\cdot f(x_n, y_n)`;
  const k2Formula = `k_2 = h \\cdot f\\left(x_n + \\frac{h}{2}, y_n + \\frac{k_1}{2}\\right)`;
  const k3Formula = `k_3 = h \\cdot f\\left(x_n + \\frac{h}{2}, y_n + \\frac{k_2}{2}\\right)`;
  const k4Formula = `k_4 = h \\cdot f\\left(x_n + h, y_n + k_3\\right)`;
  const updateFormula = `y_{n+1} = y_n + \\frac{1}{6} \\left( k_1 + 2k_2 + 2k_3 + k_4 \\right)`;

  return (
    <>
      <Head>
        <title>Runge-Kutta 4th Order (RK4) | Netz</title>
        <meta name="description" content="Master Runge-Kutta 4th Order (RK4) for ODEs with friendly step-by-step guidance, 4-stage slope evaluations, and an interactive visualizer." />
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
                  Runge-Kutta 4th Order <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">RK4 Classical Method</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The gold standard of ODE solvers, <strong>Runge-Kutta 4th Order (RK4)</strong> samples 4 trial slopes across each step interval to achieve 4th-order <InlineMath math="\mathcal{O}(h^4)" /> accuracy—matching Taylor series precision without computing high-order analytical derivatives!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      RK4 FOUR-STAGE STENCIL
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      4TH-ORDER ACCURACY
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={k1Formula} />
                    <BlockMath math={k2Formula} />
                    <BlockMath math={k3Formula} />
                    <BlockMath math={k4Formula} />
                    <div className="pt-2 border-t border-black/10 dark:border-neutral-800">
                      <BlockMath math={updateFormula} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Start & End Slopes</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="k_1" /> at start <InlineMath math="x_n" /> and <InlineMath math="k_4" /> at full step <InlineMath math="x_n + h" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Midpoint Slopes (2×)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="k_2" /> and <InlineMath math="k_3" /> evaluated at midpoint <InlineMath math="x_n + \frac{h}{2}" /> with double weight.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Simpson-Like Weighting</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Weights <InlineMath math="1:2:2:1" /> divided by 6 yield optimal 4th-order cancelation.
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
                    Solve the initial value problem:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\frac{dy}{dx} = x + y, \quad \text{with initial condition } y(0) = 1" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Find the value of <InlineMath math="y(0.1)" /> using single RK4 step <InlineMath math="h = 0.1" />!
                  </p>
                </div>

                {/* Step 1: Intermediate Slopes */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>EVALUATE 4 INTERMEDIATE SLOPES (k₁, k₂, k₃, k₄)</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Compute each RK4 stage starting from <InlineMath math="x_0 = 0, y_0 = 1" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="k_1 = (0.1)(0 + 1) = 0.10000" />
                    <BlockMath math="k_2 = (0.1)(0.05 + 1.05) = 0.11000" />
                    <BlockMath math="k_3 = (0.1)(0.05 + 1.055) = 0.11050" />
                    <BlockMath math="k_4 = (0.1)(0.1 + 1.1105) = 0.12105" />
                  </div>
                </div>

                {/* Step 2: Weighted Average Update */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>WEIGHTED AVERAGE INCREMENT</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Combine the 4 slopes into the RK4 update equation:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ k_1 + 2k_2 + 2k_3 + k_4 \\right]`} />
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ 0.10000 + 2(0.11000) + 2(0.11050) + 0.12105 \\right]`} />
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ 0.10000 + 0.22000 + 0.22100 + 0.12105 \\right] = \\frac{0.66205}{6} = 0.110342`} />
                    <BlockMath math={`y(0.1) = y_0 + \\Delta y = 1.00000 + 0.110342 = 1.11034`} />
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
                      RK4 Value: y(0.1) ≈ 1.11034
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y(0.1) \\approx 1.11034} \\quad (\\text{Exact: } 2e^{0.1} - 1.1 \\approx 1.1103418)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With a single step of size <InlineMath math="h = 0.1" />, RK4 computes <strong>1.11034</strong>, matching the exact analytical solution to 6 decimal places!
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
                <RungeKuttaSolver />
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