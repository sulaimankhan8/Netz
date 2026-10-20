'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import NumericalDifferentiationSolver from './algorithems.numerical-differentiation';

export default function NumericalDifferentiationPage() {
  const firstDerivativeFormula = `
    f'(x) \\approx \\frac{f(x + h) - f(x - h)}{2h}
  `;

  const secondDerivativeFormula = `
    f''(x) \\approx \\frac{f(x + h) - 2f(x) + f(x - h)}{h^2}
  `;

  return (
    <>

      <MethodShell route="/numerical-differentiation" steps={3} solve={<NumericalDifferentiationSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  When symbolic calculus is impossible or discrete experimental data is collected, <strong>Numerical Differentiation</strong> uses symmetric finite difference stencils to compute high-precision derivative slopes <InlineMath math="f'(x)" /> and curvatures <InlineMath math="f''(x)" />!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Central difference stencils
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      O(h²) ACCURACY
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">First Derivative (Slope)</span>
                      <BlockMath math={firstDerivativeFormula} />
                    </div>
                    <div className="space-y-1 pt-2 border-t border-black/10 dark:border-neutral-800">
                      <span className="text-xs font-mono font-bold uppercase text-neutral-500 block">Second Derivative (Curvature)</span>
                      <BlockMath math={secondDerivativeFormula} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Target Point (x)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        The exact evaluation point where rates of change are measured.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Small Step Size (h)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Symmetric perturbations <InlineMath math="x + h" /> and <InlineMath math="x - h" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Error Cancellation</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Symmetry cancels odd-order Taylor error terms automatically.
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
                    Consider the cubic polynomial function:
                  </p>
                  <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-xs text-center">
                    <BlockMath math="f(x) = x^3 - 2x + 5" />
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Let&apos;s evaluate <InlineMath math="f'(2)" /> and <InlineMath math="f''(2)" /> using step size <InlineMath math="h = 0.1" />!
                  </p>
                </div>

                {/* Step 1: Function Evaluations */}
                <Step n={1} title="Evaluate function at neighboring points">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Compute <InlineMath math="f(x-h), f(x)," /> and <InlineMath math="f(x+h)" /> around <InlineMath math="x = 2" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(1.9) = (1.9)^3 - 2(1.9) + 5 = 6.859 - 3.8 + 5 = 8.059" />
                    <BlockMath math="f(2.0) = (2.0)^3 - 2(2.0) + 5 = 8 - 4 + 5 = 9.000" />
                    <BlockMath math="f(2.1) = (2.1)^3 - 2(2.1) + 5 = 9.261 - 4.2 + 5 = 10.061" />
                  </div>
                </Step>

                {/* Step 2: First Derivative Calculation */}
                <Step n={2} title="Compute first derivative f'(2)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug functional values into central first derivative formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f'(2) \approx \frac{10.061 - 8.059}{2(0.1)} = \frac{2.002}{0.2} = 10.0100" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-mono">
                    (Exact calculus value: <InlineMath math="f'(x) = 3x^2 - 2 \implies f'(2) = 10" />).
                  </p>
                </Step>

                {/* Step 3: Second Derivative Calculation */}
                <Step n={3} title="Compute second derivative f''(2)">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug values into central second derivative curvature formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f''(2) \approx \frac{10.061 - 2(9.000) + 8.059}{0.1^2} = \frac{0.120}{0.01} = 12.0000" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-mono">
                    (Exact calculus value: <InlineMath math="f''(x) = 6x \implies f''(2) = 12" />).
                  </p>
                </Step>
<StepControls />
<StepsDone>

                {/* Step 4: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final result
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Estimated Derivatives: f&apos;(2) = 10.0100 , f&apos;&apos;(2) = 12.0000
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{f'(2) \\approx 10.0100, \\quad f''(2) \\approx 12.0000}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      With <InlineMath math="h = 0.1" />, central numerical differentiation matches the exact analytical slope <strong>10</strong> and curvature <strong>12</strong> to extraordinary accuracy!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}