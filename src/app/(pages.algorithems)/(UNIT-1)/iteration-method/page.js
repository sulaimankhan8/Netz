'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import IterationMethod from './algorithems.fixed-point-method';

export default function IterationMethods() {
  const iterationData = [
    { k: 1, xprev: '1.500000', xk: '1.357209', err: '0.142791' },
    { k: 2, xprev: '1.357209', xk: '1.330861', err: '0.026348' },
    { k: 3, xprev: '1.330861', xk: '1.325884', err: '0.004977' },
    { k: 4, xprev: '1.325884', xk: '1.324939', err: '0.000944' },
    { k: 5, xprev: '1.324939', xk: '1.324760', err: '0.000179' },
    { k: 6, xprev: '1.324760', xk: '1.324726', err: '0.000034' },
  ];

  return (
    <>

      <MethodShell route="/iteration-method" steps={5} solve={<IterationMethod />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Fixed Point Iteration Method</strong> rewrites an equation <InlineMath math="f(x) = 0" /> into the self-feeding form <InlineMath math="x = \phi(x)" />. Starting from an initial guess <InlineMath math="x_0" />, each output becomes the next input, drawing a staircase or cobweb diagram straight into the fixed point!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Recurrence relation & convergence
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Cobweb stability
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={`x_{k} = \\phi(x_{k-1})`} />
                    <BlockMath math={`|\\phi'(x)| < 1 \\quad (\\text{Strict Convergence Condition})`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Rewrite f(x) = 0</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Isolate <InlineMath math="x" /> to create iteration form <InlineMath math="x = \phi(x)" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Test Slope Derivative</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Ensure <InlineMath math="|\phi'(x)| < 1" /> near the root for rapid convergence.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Feed Next Guess</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Plug <InlineMath math="x_{k}" /> back into <InlineMath math="\phi" /> until differences vanish.
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
                    Find the root of <InlineMath math="f(x) = x^3 - x - 1 = 0" /> starting at initial guess <InlineMath math="x_0 = 1.5" />.
                  </p>
                </div>

                {/* Step 1 */}
                <Step n={1} title="Rewrite & verify convergence">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Isolate <InlineMath math="x" /> to define <InlineMath math="\phi(x)" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="\phi(x) = (x + 1)^{1/3}" />
                    <BlockMath math="\phi'(x) = \frac{1}{3(x+1)^{2/3}} \implies |\phi'(1.5)| = \frac{1}{3(2.5)^{2/3}} \approx 0.1809 < 1 \quad (\text{Strictly Converges!})" />
                  </div>
                </Step>

                {/* Step 2 */}
                <Step n={2} title="Compute first iteration (x₁)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug initial guess <InlineMath math="x_0 = 1.5" /> into <InlineMath math="\phi(x)" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="x_1 = \phi(1.5) = (1.5 + 1)^{1/3} = (2.5)^{1/3} \approx 1.357209" />
                  </div>
                </Step>

                {/* Step 3 */}
                <Step n={3} title="Compute second iteration (x₂)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Feed <InlineMath math="x_1 = 1.357209" /> back into <InlineMath math="\phi(x)" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="x_2 = \phi(1.357209) = (1.357209 + 1)^{1/3} = (2.357209)^{1/3} \approx 1.330861" />
                  </div>
                </Step>

                {/* Step 4: Iterations Walkthrough */}
                <Step n={4} title="Subsequent iterations walkthrough">

                  {/* Iteration 3 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 3:</strong>
                    <div>Calculation: <InlineMath math="x_3 = (1.330861 + 1)^{1/3} = (2.330861)^{1/3} \approx 1.325884" /></div>
                  </div>

                  {/* Iteration 4 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 4:</strong>
                    <div>Calculation: <InlineMath math="x_4 = (1.325884 + 1)^{1/3} = (2.325884)^{1/3} \approx 1.324939" /></div>
                  </div>
                </Step>

                {/* Step 5: Summary Table */}
                <Step n={5} title="Iteration summary table">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Iteration (k)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Input Guess (x_{'{k-1}'})</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Output Next Guess (x_k)</th>
                          <th className="p-2.5">Difference (|x_k - x_{'{k-1}'}|)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iterationData.map((row) => (
                          <tr key={row.k} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row.k}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.xprev}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.xk}</td>
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
                      Approximated Fixed Point: x ≈ 1.3247
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\text{Exact Root } \\alpha \\approx 1.324718, \\quad (1.324718)^3 - (1.324718) - 1 = 0`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Continuous self-feeding evaluation quickly stabilizes at the exact root <strong>1.32472</strong> because the slope derivative condition <InlineMath math="|\phi'(x)| < 1" /> holds!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}