'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import RungeKuttaSolver from './algorithems.runge-kutta';

export default function RungeKuttaMethodPage() {
  const k1Formula = `k_1 = h \\cdot f(x_n, y_n)`;
  const k2Formula = `k_2 = h \\cdot f\\left(x_n + \\frac{h}{2}, y_n + \\frac{k_1}{2}\\right)`;
  const k3Formula = `k_3 = h \\cdot f\\left(x_n + \\frac{h}{2}, y_n + \\frac{k_2}{2}\\right)`;
  const k4Formula = `k_4 = h \\cdot f\\left(x_n + h, y_n + k_3\\right)`;
  const updateFormula = `y_{n+1} = y_n + \\frac{1}{6} \\left( k_1 + 2k_2 + 2k_3 + k_4 \\right)`;

  return (
    <>

      <MethodShell route="/runge-kutta-method" steps={2} solve={<RungeKuttaSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The gold standard of ODE solvers, <strong>Runge-Kutta 4th Order (RK4)</strong> samples 4 trial slopes across each step interval to achieve 4th-order <InlineMath math="\mathcal{O}(h^4)" /> accuracy—matching Taylor series precision without computing high-order analytical derivatives!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      RK4 four-stage stencil
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      4Th-order accuracy
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
                <div className="am-section-title"><h2>Worked example</h2></div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      Our problem to solve
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
                <Step n={1} title="Evaluate 4 intermediate slopes (k₁, k₂, k₃, k₄)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Compute each RK4 stage starting from <InlineMath math="x_0 = 0, y_0 = 1" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="k_1 = (0.1)(0 + 1) = 0.10000" />
                    <BlockMath math="k_2 = (0.1)(0.05 + 1.05) = 0.11000" />
                    <BlockMath math="k_3 = (0.1)(0.05 + 1.055) = 0.11050" />
                    <BlockMath math="k_4 = (0.1)(0.1 + 1.1105) = 0.12105" />
                  </div>
                </Step>

                {/* Step 2: Weighted Average Update */}
                <Step n={2} title="Weighted average increment">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Combine the 4 slopes into the RK4 update equation:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ k_1 + 2k_2 + 2k_3 + k_4 \\right]`} />
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ 0.10000 + 2(0.11000) + 2(0.11050) + 0.12105 \\right]`} />
                    <BlockMath math={`\\Delta y = \\frac{1}{6} \\left[ 0.10000 + 0.22000 + 0.22100 + 0.12105 \\right] = \\frac{0.66205}{6} = 0.110342`} />
                    <BlockMath math={`y(0.1) = y_0 + \\Delta y = 1.00000 + 0.110342 = 1.11034`} />
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

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}