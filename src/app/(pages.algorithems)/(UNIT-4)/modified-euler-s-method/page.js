'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import ModifiedEulerSolver from './algorithems.modified-euler';

export default function ModifiedEulerMethodPage() {
  const predictorFormula = `
    y_{n+1}^{(0)} = y_n + h \\cdot f(x_n, y_n)
  `;

  const correctorFormula = `
    y_{n+1}^{(k+1)} = y_n + \\frac{h}{2} \\left[ f(x_n, y_n) + f(x_{n+1}, y_{n+1}^{(k)}) \\right]
  `;

  return (
    <>

      <MethodShell route="/modified-euler-s-method" steps={2} solve={<ModifiedEulerSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  Standard Euler&apos;s method suffers from slope drift. <strong>Modified Euler&apos;s Method</strong> (Heun&apos;s Method) predicts a trial step, calculates the destination slope, and averages both slopes for 2nd-order <InlineMath math="\mathcal{O}(h^2)" /> accuracy!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Predictor-corrector scheme
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Slope averaging
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Predictor Step (Euler Trial)</span>
                      <BlockMath math={predictorFormula} />
                    </div>
                    <div className="space-y-1 pt-2 border-t border-black/10 dark:border-neutral-800">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Corrector Step (Average Slope)</span>
                      <BlockMath math={correctorFormula} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Predictor Trial</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Uses starting slope to estimate endpoint <InlineMath math="y_{n+1}^{(0)}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Slope Average</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Averages initial slope <InlineMath math="f(x_n,y_n)" /> and trial slope <InlineMath math="f(x_{n+1},y_{n+1})" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Iterative Refinement</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Repeat corrector loop until successive estimates converge.
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
                    Given the differential equation:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="\frac{dy}{dx} = x + y, \quad \text{with initial condition } y(0) = 1" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Find the value of <InlineMath math="y(0.1)" /> using step size <InlineMath math="h = 0.1" /> and 2 corrector iterations!
                  </p>
                </div>

                {/* Step 1: Predictor Step */}
                <Step n={1} title="Predictor step (trial Euler estimate)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Evaluate starting slope <InlineMath math="f(0, 1) = 0 + 1 = 1.0" /> and project trial endpoint:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="y_1^{(0)} = y_0 + h \cdot f(x_0, y_0) = 1.0 + (0.1)(1.0) = 1.10000" />
                  </div>
                </Step>

                {/* Step 2: Corrector Iterations */}
                <Step n={2} title="Corrector iterations (average slopes)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    <strong>1st Corrector:</strong> Evaluate slope at trial point <InlineMath math="(0.1, 1.10000)" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(0.1, 1.10000) = 0.1 + 1.1 = 1.20000" />
                    <BlockMath math="y_1^{(1)} = 1.0 + \frac{0.1}{2} [1.0 + 1.20000] = 1.0 + (0.05)(2.2) = 1.11000" />
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-1">
                    <strong>2nd Corrector:</strong> Re-evaluate slope at updated point <InlineMath math="(0.1, 1.11000)" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(0.1, 1.11000) = 0.1 + 1.11000 = 1.21000" />
                    <BlockMath math="y_1^{(2)} = 1.0 + \frac{0.1}{2} [1.0 + 1.21000] = 1.0 + (0.05)(2.21) = 1.11050" />
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
                      Corrected Value: y(0.1) = 1.11050
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y(0.1) \\approx 1.11050} \\quad (\\text{Exact: } 1.11034)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With 2 corrector iterations, Modified Euler&apos;s method improves accuracy from <strong>1.10000</strong> (standard Euler) to <strong>1.11050</strong> (exact: <InlineMath math="1.11034" />)!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}