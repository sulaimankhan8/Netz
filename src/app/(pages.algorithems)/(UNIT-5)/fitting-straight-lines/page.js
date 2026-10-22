'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import StraightLineSolver from './algorithems.straight-line';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function FittingStraightLinesPage() {
  const lineEquation = `y = a + b x`;
  const normalSystem = `
    \\begin{aligned}
      \\sum y &= n a + b \\sum x \\\\
      \\sum x y &= a \\sum x + b \\sum x^2
    \\end{aligned}
  `;

  return (
    <>
      <Head>
        <title>Fitting a Straight Line | Netz</title>
        <meta name="description" content="Master Linear Regression and Straight Line Fitting with friendly step-by-step guidance, normal equations, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 5 • CURVE FITTING & STATISTICS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  Fitting a Straight Line <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Linear Least Squares Regression</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Linear Least Squares Regression</strong> finds the best-fit line <InlineMath math="y = a + bx" /> by minimizing the sum of squared vertical distance errors (residuals) between raw sample data points and the regression line!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      LINEAR SYSTEM OF NORMAL EQUATIONS
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      MINIMUM RESIDUAL SQUARES
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={lineEquation} />
                    <div className="pt-2 border-t border-black/10 dark:border-neutral-800">
                      <BlockMath math={normalSystem} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Intercept (a)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        The vertical y-axis baseline elevation: <InlineMath math="a = \bar{y} - b \bar{x}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Slope (b)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Rate of change coefficient: <InlineMath math="b = \frac{n\sum xy - \sum x \sum y}{n\sum x^2 - (\sum x)^2}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Normal Determinants</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Direct 2×2 linear system solver using sample sums.
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
                    Fit a straight line <InlineMath math="y = a + bx" /> to the 5 observation pairs:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">2</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">4</th>
                          <th className="p-2">5</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">5</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">4</td>
                          <td className="p-2">6</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 1: Summary Statistics Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>TABULATE STATISTICAL SUMS</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x²</th>
                          <th className="p-2.5">x · y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2">2</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2">6</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">9</td>
                          <td className="p-2">15</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">16</td>
                          <td className="p-2">16</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">6</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">25</td>
                          <td className="p-2">30</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">Sum = 15</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 20</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 55</td>
                          <td className="p-2">Sum = 69</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 2: Solve Normal System */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>SOLVE NORMAL EQUATIONS</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug sums into system with <InlineMath math="n = 5" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="5 a + 15 b = 20" />
                    <BlockMath math="15 a + 55 b = 69" />
                    <BlockMath math="b = \frac{5(69) - 15(20)}{5(55) - (15)^2} = \frac{345 - 300}{275 - 225} = \frac{45}{50} = 0.9" />
                    <BlockMath math="a = \frac{20 - 15(0.9)}{5} = \frac{20 - 13.5}{5} = \frac{6.5}{5} = 1.3" />
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
                      Linear Regression Line: y = 1.3 + 0.9 x
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y = 1.3 + 0.9 x}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      The straight line of best fit calculated by linear least squares is <strong>y = 1.3 + 0.9x</strong>!
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
                <StraightLineSolver />
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