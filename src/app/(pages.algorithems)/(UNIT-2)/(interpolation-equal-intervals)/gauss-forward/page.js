'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussForwardInterpolation from './algorithems.gauss-forward-interpolations';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function GaussForwardInterpolations() {
  const formula = `
    P(x) = y_0 + p \\cdot \\Delta y_0 + \\frac{p(p-1)}{2!} \\cdot \\Delta^2 y_{-1} + 
    \\frac{(p+1) p (p-1)}{3!} \\cdot \\Delta^3 y_{-1} + \\cdots
  `;

  return (
    <>
      <Head>
        <title>Gauss Forward Interpolation | Netz</title>
        <meta name="description" content="Master Gauss Forward Interpolation method with step-by-step explanations, central difference tables, and an interactive visualizer." />
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
                  Gauss Forward <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Central Difference Method</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Gauss Forward Interpolation</strong> estimates functional values near the <em>middle</em> of an equally spaced table by taking forward zig-zag central difference steps around a central origin point <InlineMath math="x_0" />.
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      GAUSS FORWARD FORMULA
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      MID-RANGE ACCURACY
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Central Parameter (p)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="p = \frac{x - x_0}{h}" /> (distance from central origin <InlineMath math="x_0" />).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Equal Mesh Step (h)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="h = x_{i+1} - x_i" /> (constant grid spacing).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Forward Central Path</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Uses <InlineMath math="\Delta y_0, \Delta^2 y_{-1}, \Delta^3 y_{-1}, \dots" />
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
                    Given the functional dataset:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">2.5</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3.0</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3.5</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">4.0</th>
                          <th className="p-2">4.5</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">24.145</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">22.043</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">20.225</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">18.644</td>
                          <td className="p-2">17.262</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Let&apos;s estimate the value at <InlineMath math="x = 3.75" />!
                  </p>
                </div>

                {/* Step 1: Choose Central Origin & p */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>SELECT CENTRAL ORIGIN & CALCULATE p</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Select <InlineMath math="x_0 = 3.5" /> as central origin (closest point preceding <InlineMath math="3.75" />) with step size <InlineMath math="h = 0.5" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`p = \\frac{x - x_0}{h} = \\frac{3.75 - 3.5}{0.5} = \\frac{0.25}{0.5} = 0.5`} />
                  </div>
                </div>

                {/* Step 2: Difference Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>CONSTRUCT CENTRAL DIFFERENCE TABLE</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">p</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">&Delta;y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">&Delta;²y</th>
                          <th className="p-2.5">&Delta;³y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">24.145</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">22.043</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-1.818</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">3.5 (x_0)</td>
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">20.225 (y_0)</td>
                          <td className="p-2 border-r border-emerald-600">-1.581 (&Delta;y_0)</td>
                          <td className="p-2 border-r border-emerald-600">0.237 (&Delta;²y_{-1})</td>
                          <td className="p-2">-0.038 (&Delta;³y_{-1})</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4.0</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">18.644</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-1.382</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.199</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4.5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">17.262</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 3: Formula & Explicit Substitution */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>FORMULA & NUMERICAL SUBSTITUTION</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Gauss Forward Polynomial Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`P(x) = y_0 + p \\Delta y_0 + \\frac{p(p-1)}{2!} \\Delta^2 y_{-1} + \\frac{(p+1)p(p-1)}{3!} \\Delta^3 y_{-1}`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting values (<InlineMath math="p = 0.5, y_0 = 20.225, \Delta y_0 = -1.581, \Delta^2 y_{-1} = 0.237, \Delta^3 y_{-1} = -0.038" />):
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`P(3.75) = 20.225 + (0.5)(-1.581) + \\frac{(0.5)(-0.5)}{2}(0.237) + \\frac{(1.5)(0.5)(-0.5)}{6}(-0.038)`} />
                    <BlockMath math={`P(3.75) = 20.22500 - 0.79050 - 0.02963 + 0.00238`} />
                    <BlockMath math={`P(3.75) = 19.40725`} />
                  </div>
                </div>

                {/* Step 4: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      FINAL RESULT
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Interpolated Value at x = 3.75: P(3.75) = 19.4072
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{P(3.75) = 19.4072}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using Gauss Forward central difference interpolation, the calculated value at <InlineMath math="x = 3.75" /> is exactly <strong>19.4072</strong>!
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
                <GaussForwardInterpolation />
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
