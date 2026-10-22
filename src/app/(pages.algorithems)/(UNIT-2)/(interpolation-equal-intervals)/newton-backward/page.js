'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import NewtonBackwardInterpolations from './algorithems.newton-backward-interpolations';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function NewtonBackwardInterpolation() {
  const formula = `
    P(x) = y_n + v \\cdot \\nabla y_n + \\frac{v(v+1)}{2!} \\cdot \\nabla^2 y_n + \\frac{v(v+1)(v+2)}{3!} \\cdot \\nabla^3 y_n + \\frac{v(v+1)(v+2)(v+3)}{4!} \\cdot \\nabla^4 y_n + \\cdots
  `;

  return (
    <>
      <Head>
        <title>Newton Backward Interpolation | Netz</title>
        <meta name="description" content="Master Newton Backward Interpolation with friendly step-by-step guidance, backward difference tables, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 2 • EQUAL INTERVAL INTERPOLATION
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  Newton Backward <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Interpolation Method</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Newton Backward Interpolation</strong> is used to estimate the value of a function at a given point when data points are tabulated at equal intervals. This method is particularly useful when you want to interpolate a value near the end of the data set by utilizing backward differences.
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)] space-y-6">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      BACKWARD DIFFERENCE FORMULA
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      END-POINT ANCHOR
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <p className="font-bold text-black dark:text-white">Where:</p>
                    <ul className="list-disc list-inside space-y-1.5 font-mono text-xs pl-2">
                      <li>
                        <InlineMath math="v = \frac{x - x_n}{h}" /> is the backward fractional distance.
                      </li>
                      <li>
                        <InlineMath math="x_n" /> is the last value of <InlineMath math="x" /> in the dataset.
                      </li>
                      <li>
                        <InlineMath math="h" /> is the uniform step size between <InlineMath math="x" /> values (<InlineMath math="h = x_n - x_{n-1}" />).
                      </li>
                      <li>
                        <InlineMath math="\nabla y_n, \nabla^2 y_n, \nabla^3 y_n, \dots" /> are the backward differences along the bottom row.
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Backward Ratio (v)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Distance measured backwards from the final baseline <InlineMath math="x_n" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Equal Spacing (h)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Constant gap between consecutive tabulated points.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Bottom-Row Operators</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Uses backward difference values along the bottom diagonal.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example Guide */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                    Example of Newton Backward Interpolation
                  </h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
                    GUIDED STORY TUTORIAL
                  </span>
                </div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      OUR PROBLEM TO SOLVE
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Let&apos;s say we are given the following data points:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">24</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">28</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">32</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">36</th>
                          <th className="p-2.5">40</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2.5 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2.5 border-r border-black/20 dark:border-neutral-700">28.06</td>
                          <td className="p-2.5 border-r border-black/20 dark:border-neutral-700">30.19</td>
                          <td className="p-2.5 border-r border-black/20 dark:border-neutral-700">32.75</td>
                          <td className="p-2.5 border-r border-black/20 dark:border-neutral-700">34.94</td>
                          <td className="p-2.5">40.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    We are tasked with finding <InlineMath math="y" /> where <InlineMath math="x = 33" />.
                  </p>
                </div>

                {/* Step 1: Backward Difference Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>CALCULATE THE BACKWARD DIFFERENCES FOR THE Y VALUES</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    We construct the difference table by subtracting each <InlineMath math="y" /> value from its successor. The bottom row values (highlighted in emerald) form our primary backward difference vector <InlineMath math="[y_n, \nabla y_n, \nabla^2 y_n, \nabla^3 y_n, \nabla^4 y_n]" />:
                  </p>

                  <div className="overflow-x-auto rounded-xl border-2 border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs md:text-sm font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b-2 border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-3 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-3 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-3 border-r border-black/20 dark:border-neutral-700">&nabla;y</th>
                          <th className="p-3 border-r border-black/20 dark:border-neutral-700">&nabla;²y</th>
                          <th className="p-3 border-r border-black/20 dark:border-neutral-700">&nabla;³y</th>
                          <th className="p-3">&nabla;⁴y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">24</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">28.06</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">28</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">30.19</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">2.13</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">32</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">32.75</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">2.56</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">0.43</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2.5">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">36</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">34.94</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">2.19</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-0.37</td>
                          <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">-0.80</td>
                          <td className="p-2.5">-</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2.5 border-r border-emerald-600">40 (x_n)</td>
                          <td className="p-2.5 border-r border-emerald-600">40.00 (y_n)</td>
                          <td className="p-2.5 border-r border-emerald-600">5.06 (∇y_n)</td>
                          <td className="p-2.5 border-r border-emerald-600">2.87 (∇²y_n)</td>
                          <td className="p-2.5 border-r border-emerald-600">3.24 (∇³y_n)</td>
                          <td className="p-2.5">4.04 (∇⁴y_n)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 2: Calculate v */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>USE THE FORMULA v = (x - x_n) / h</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Given target point <InlineMath math="x = 33" />, final base point <InlineMath math="x_n = 40" />, and uniform step size <InlineMath math="h = 4" />:
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-sm overflow-x-auto text-center space-y-2">
                    <BlockMath math={`v = \\frac{x - x_n}{h}`} />
                    <BlockMath math={`v = \\frac{33 - 40}{4} = \\frac{-7}{4} = -1.75`} />
                  </div>
                </div>

                {/* Step 3: Apply Formula & Numerical Substitution */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>APPLY THE NEWTON BACKWARD INTERPOLATION FORMULA</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Governing polynomial expansion:
                    </p>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs md:text-sm overflow-x-auto text-center">
                      <BlockMath math={`P(x) = y_n + v \\cdot \\nabla y_n + \\frac{v(v+1)}{2!} \\cdot \\nabla^2 y_n + \\frac{v(v+1)(v+2)}{3!} \\cdot \\nabla^3 y_n + \\frac{v(v+1)(v+2)(v+3)}{4!} \\cdot \\nabla^4 y_n + \\cdots`} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-bold text-black dark:text-white">
                      Substituting values (<InlineMath math="v = -1.75, y_n = 40, \nabla y_n = 5.06, \nabla^2 y_n = 2.87, \nabla^3 y_n = 3.24, \nabla^4 y_n = 4.04" />):
                    </p>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                      <BlockMath math={`P(33) = 40 + \\frac{-1.75}{1!}(5.06) + \\frac{(-1.75)(-0.75)}{2!}(2.87) + \\frac{(-1.75)(-0.75)(0.25)}{3!}(3.24) + \\frac{(-1.75)(-0.75)(0.25)(1.25)}{4!}(4.04)`} />
                      <BlockMath math={`P(33) = 40.00000 - 8.85500 + 1.88344 + 0.17719 + 0.06904`} />
                      <BlockMath math={`P(33) = 33.27467`} />
                    </div>
                  </div>
                </div>

                {/* Step 4: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      CONCLUSION
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Interpolated Result: y(33) ≈ 33.27466
                    </h3>
                    <div className="p-4 bg-white dark:bg-neutral-800 border-2 border-black/20 dark:border-neutral-700 rounded-xl font-mono text-sm overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{P(33) \\approx 33.27466}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Thus, the interpolated value of <InlineMath math="y" /> at <InlineMath math="x = 33" /> using <strong>Newton Backward Interpolation</strong> is approximately <strong>33.27466</strong>.
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
                <NewtonBackwardInterpolations />
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