'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import FittingParabolaSolver from './algorithems.fitting-parabola';

export default function FittingParabolaPage() {
  const parabolaEquation = `y = a + b x + c x^2`;
  const normalSystem = `
    \\begin{aligned}
      \\sum y &= n a + b \\sum x + c \\sum x^2 \\\\
      \\sum x y &= a \\sum x + b \\sum x^2 + c \\sum x^3 \\\\
      \\sum x^2 y &= a \\sum x^2 + b \\sum x^3 + c \\sum x^4
    \\end{aligned}
  `;

  return (
    <>

      <MethodShell route="/fitting-parabola" steps={2} solve={<FittingParabolaSolver />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  When data exhibits non-linear curvature, <strong>Quadratic Polynomial Regression</strong> fits a 2nd-degree parabola <InlineMath math="y = a + bx + cx^2" /> by constructing a 3×3 system of normal equations to minimize squared residual errors!
                </p>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      Parabolic 3×3 normal system
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Quadratic least squares
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={parabolaEquation} />
                    <div className="pt-2 border-t border-black/10 dark:border-neutral-800">
                      <BlockMath math={normalSystem} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Intercept (a)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Constant offset elevation at <InlineMath math="x = 0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Linear Slope (b)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Initial linear tangent slope coefficient.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Curvature (c)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Quadratic term controlling parabola concavity (<InlineMath math="c > 0" /> opens upward).
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
                    Fit a second-degree parabola <InlineMath math="y = a + bx + cx^2" /> to the 5 points:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">0</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">2</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3</th>
                          <th className="p-2">4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">1.0</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">1.8</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">3.3</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">6.0</td>
                          <td className="p-2">9.5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 1: Statistical Power Sums Table */}
                <Step n={1} title="Tabulate statistical power sums">

                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x²</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x³</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x⁴</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x·y</th>
                          <th className="p-2">x²·y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.0</td>
                          <td className="p-2">0.0</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.8</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.8</td>
                          <td className="p-2">1.8</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3.3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">8</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">16</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">6.6</td>
                          <td className="p-2">13.2</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">6.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">9</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">27</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">81</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">18.0</td>
                          <td className="p-2">54.0</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">9.5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">16</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">64</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">256</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">38.0</td>
                          <td className="p-2">152.0</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">Sum = 10</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 21.6</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 30</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 100</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 354</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 64.4</td>
                          <td className="p-2">Sum = 221.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step>

                {/* Step 2: Solve 3x3 System */}
                <Step n={2} title="Solve 3×3 normal matrix system">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Construct system with <InlineMath math="n = 5" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="5 a + 10 b + 30 c = 21.6" />
                    <BlockMath math="10 a + 30 b + 100 c = 64.4" />
                    <BlockMath math="30 a + 100 b + 354 c = 221.0" />
                    <BlockMath math="a = 1.0229, \quad b = 0.2343, \quad c = 0.4714" />
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
                      Best-Fit Parabola: y = 1.0229 + 0.2343 x + 0.4714 x²
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y = 1.0229 + 0.2343 x + 0.4714 x^2}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using quadratic least squares regression, the parabolic model of best fit is <strong>y = 1.0229 + 0.2343x + 0.4714x²</strong>!
                    </p>
                  </div>
                </div>

              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}