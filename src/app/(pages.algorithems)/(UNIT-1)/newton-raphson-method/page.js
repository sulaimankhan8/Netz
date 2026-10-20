'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import NewtonRaphsonMethod from './aldorithems.newton-raphson';

export default function NewtonRaphsonMethods() {
  const iterationData = [
    { k: 1, xn: '2.000000', fxn: '-1.000000', fpxn: '4.000000', xnext: '2.250000', err: '0.250000' },
    { k: 2, xn: '2.250000', fxn: '+0.062500', fpxn: '4.500000', xnext: '2.236111', err: '0.013889' },
    { k: 3, xn: '2.236111', fxn: '+0.000193', fpxn: '4.472222', xnext: '2.236068', err: '0.000043' },
    { k: 4, xn: '2.236068', fxn: '0.000000', fpxn: '4.472136', xnext: '2.236068', err: '0.000000' },
  ];

  return (
    <>

      <MethodShell route="/newton-raphson-method" steps={5} solve={<NewtonRaphsonMethod />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Newton-Raphson Method</strong> is a second-order root-finding algorithm that uses the tangent slope derivative <InlineMath math="f'(x_n)" /> at the current point <InlineMath math="x_n" /> to slide down the curve directly toward the zero crossing with quadratic speed!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      How Newton–Raphson works
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Quadratic convergence
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={`x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Current State (x_n)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Start with initial guess <InlineMath math="x_0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Compute Derivative f&apos;(x_n)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Evaluate tangent slope derivative <InlineMath math="f'(x_n) \neq 0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Tangent Intercept Step</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Subtract ratio <InlineMath math="\frac{f(x_n)}{f'(x_n)}" /> to slide directly along tangent line to <InlineMath math="x_{n+1}" />.
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
                    Find the root of <InlineMath math="f(x) = x^2 - 5 = 0" /> starting with initial guess <InlineMath math="x_0 = 2" />.
                  </p>
                </div>

                {/* Step 1 */}
                <Step n={1} title="Derive symbolic derivative">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Find derivative <InlineMath math="f'(x)" /> and formulate iteration formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(x) = x^2 - 5 \implies f'(x) = 2x" />
                    <BlockMath math="x_{n+1} = x_n - \frac{x_n^2 - 5}{2x_n} = \frac{2x_n^2 - x_n^2 + 5}{2x_n} = \frac{x_n^2 + 5}{2x_n}" />
                  </div>
                </Step>

                {/* Step 2 */}
                <Step n={2} title="Compute first Newton step (x₁)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug initial guess <InlineMath math="x_0 = 2" /> into function and derivative:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(2) = 2^2 - 5 = -1, \quad f'(2) = 2(2) = 4" />
                    <BlockMath math="x_1 = 2 - \frac{-1}{4} = 2 + 0.25 = 2.25" />
                  </div>
                </Step>

                {/* Step 3 */}
                <Step n={3} title="Compute second Newton step (x₂)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Evaluate at <InlineMath math="x_1 = 2.25" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(2.25) = (2.25)^2 - 5 = 5.0625 - 5 = +0.0625, \quad f'(2.25) = 2(2.25) = 4.5" />
                    <BlockMath math="x_2 = 2.25 - \frac{0.0625}{4.5} = 2.25 - 0.01388889 = 2.236111" />
                  </div>
                </Step>

                {/* Step 4: Iterations Walkthrough */}
                <Step n={4} title="Subsequent iterations walkthrough">

                  {/* Iteration 3 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 3:</strong>
                    <div>Function Value: <InlineMath math="f(2.236111) = (2.236111)^2 - 5 = +0.000193" /></div>
                    <div>Derivative Value: <InlineMath math="f'(2.236111) = 4.472222" /></div>
                    <div>Next Guess: <InlineMath math="x_3 = 2.236111 - \frac{0.000193}{4.472222} = 2.236068" /></div>
                  </div>
                </Step>

                {/* Step 5: Summary Table */}
                <Step n={5} title="Iteration summary table">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Iteration (k)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Current Guess (x_n)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x_n)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f&apos;(x_n)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Next Guess (x_n+1)</th>
                          <th className="p-2.5">Error (|x_n+1 - x_n|)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iterationData.map((row) => (
                          <tr key={row.k} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row.k}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.xn}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fxn}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fpxn}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.xnext}</td>
                            <td className="p-2.5 font-bold">{row.err}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Step>
<StepControls />
<StepsDone>

                {/* Conclusion Box */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final conclusion
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Approximated Root: x ≈ 2.236068 (√5)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\text{Exact Root } \\sqrt{5} \\approx 2.236067977, \\quad (2.236068)^2 - 5 = 0`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Newton-Raphson exhibits quadratic convergence, effectively doubling the number of correct digits on every single iteration!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
