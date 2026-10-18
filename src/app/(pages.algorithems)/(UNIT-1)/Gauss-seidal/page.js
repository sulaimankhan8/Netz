'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussSeidel from './algorithems.gauss-seidale-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import Tour from '@/app/components/tour/Tour';

const GaussSeidelPage = () => {
  return (
    <>
      <Head>
        <title>Gauss-Seidel Method | Netz</title>
        <meta name="description" content="Master the Gauss-Seidel Method for solving linear systems with step-by-step guidance, matrix iterations, and interactive tour." />
      </Head>

      {/* The tour from the landing page's "Learn a method" card (?tour=true) */}
      <Tour ids={['gauss-seidel']} aliases={{ true: 'gauss-seidel' }} />

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 1 • LINEAR SYSTEMS & ITERATIONS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  Gauss-Seidel Method <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Iterative System Solver</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed step-intro-1">
                  The <strong>Gauss-Seidel Method</strong> is an iterative technique designed to solve large systems of linear equations. By immediately plugging newly calculated variable values into subsequent equations within the exact same pass, it accelerates convergence!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)] step-intro-2">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      SYSTEM FORMULATION
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      DIAGONAL DOMINANCE
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath>
                      {`\\begin{cases} 
                        a_1 x + b_1 y + c_1 z = d_1 \\\\
                        a_2 x + b_2 y + c_2 z = d_2 \\\\
                        a_3 x + b_3 y + c_3 z = d_3 
                      \\end{cases}`}
                    </BlockMath>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Diagonal Dominance</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Ensure <InlineMath math="|a_1| > |b_1| + |c_1|" /> for guaranteed convergence.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Isolate Variables</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Solve equation 1 for <InlineMath math="x" />, 2 for <InlineMath math="y" />, 3 for <InlineMath math="z" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Immediate Update</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Use new <InlineMath math="x^{(k+1)}" /> immediately when solving for <InlineMath math="y^{(k+1)}" />.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <div className="space-y-6 step-intro-3">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                    Step-by-Step Worked Example
                  </h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
                    HAND-HOLDING TUTORIAL
                  </span>
                </div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2 step-intro-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      OUR PROBLEM TO SOLVE
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Solve the 3x3 linear system starting from initial guess <InlineMath math="(x_0, y_0, z_0) = (0, 0, 0)" />:
                  </p>
                  <div className="py-2 text-center">
                    <BlockMath>
                      {`\\begin{cases} 
                        4x + y + z = 12 \\\\
                        x + 5y + 2z = 27 \\\\
                        2x + y + 6z = 18 
                      \\end{cases}`}
                    </BlockMath>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>ISOLATE DIAGONAL VARIABLES</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Solve each equation for its diagonal dominant variable:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="x = \frac{12 - y - z}{4}" />
                    <BlockMath math="y = \frac{27 - x - 2z}{5}" />
                    <BlockMath math="z = \frac{18 - 2x - y}{6}" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>FIRST ITERATION (IMMEDIATE REUSE)</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Substitute initial guess <InlineMath math="y = 0, z = 0" /> to find <InlineMath math="x_1" />, then immediately use <InlineMath math="x_1" /> to find <InlineMath math="y_1" />, and so on:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="x_1 = \frac{12 - 0 - 0}{4} = 3.0000" />
                    <BlockMath math="y_1 = \frac{27 - 3.0000 - 2(0)}{5} = \frac{24}{5} = 4.8000" />
                    <BlockMath math="z_1 = \frac{18 - 2(3.0000) - 4.8000}{6} = \frac{7.2}{6} = 1.2000" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>SECOND ITERATION</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug <InlineMath math="(y_1, z_1) = (4.8, 1.2)" /> into the recurrence formulas:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="x_2 = \frac{12 - 4.8000 - 1.2000}{4} = \frac{6.0}{4} = 1.5000" />
                    <BlockMath math="y_2 = \frac{27 - 1.5000 - 2(1.2000)}{5} = \frac{23.1}{5} = 4.6200" />
                    <BlockMath math="z_2 = \frac{18 - 2(1.5000) - 4.6200}{6} = \frac{10.38}{6} = 1.7300" />
                  </div>
                </div>

                {/* Step 4: Summary Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 04</span> • <span>ITERATION SUMMARY TABLE</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Step (k)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5">z</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">0</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">0.0000</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">0.0000</td>
                          <td className="p-2.5">0.0000</td>
                        </tr>
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">1</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">3.0000</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">4.8000</td>
                          <td className="p-2.5">1.2000</td>
                        </tr>
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">2</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">1.5000</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">4.6200</td>
                          <td className="p-2.5">1.7300</td>
                        </tr>
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">3</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">1.4125</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">4.4255</td>
                          <td className="p-2.5">1.7916</td>
                        </tr>
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">4</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">1.4457</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">4.3742</td>
                          <td className="p-2.5">1.8057</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Conclusion Box */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      FINAL CONCLUSION
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Converged Solution: (x, y, z) ≈ (1.45, 4.36, 1.80)
                    </h3>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      By immediately reusing newly solved values within each pass, Gauss-Seidel converges much faster than Jacobi iteration!
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Calculator Section */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6 step-intro-5">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
                  LABORATORY
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Interactive Live Calculator & Visualizer
                </h2>
                <GaussSeidel />
              </div>

              {/* Sequential Routing Navigation */}
              <AlgorithmNavigation />

            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
};

export default GaussSeidelPage;