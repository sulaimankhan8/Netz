'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussBackwardInterpolation from './algorithems.gauss-backward-interpolations';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function GaussBackwardInterpolations() {
  const formula = `
    P(x) = y_0 + p \\Delta y_{-1} + \\frac{(p+1)p}{2!} \\Delta^2 y_{-1} 
    + \\frac{(p+1)p(p-1)}{3!} \\Delta^3 y_{-2} + \\cdots
  `;

  return (
    <>
      <Head>
        <title>Gauss Backward Interpolation | Netz</title>
        <meta name="description" content="Master Gauss Backward Interpolation with friendly step-by-step guidance, central difference tables, and an interactive visualizer." />
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
                  Gauss Backward <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Central Difference Method</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  When your target point lies just past or near the center of a table, <strong>Gauss Backward Interpolation</strong> starts at a central origin point <InlineMath math="x_0" /> and steps backwards first, offering maximum accuracy for middle-to-lower values!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      GAUSS BACKWARD FORMULA
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      CENTRAL ANCHOR
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Central Fraction (p)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="p = \frac{x - x_0}{h}" /> (distance from central origin <InlineMath math="x_0" />).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Upward Step First</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Uses <InlineMath math="\Delta y_{-1}" />, then <InlineMath math="\Delta^2 y_{-1}" />, then <InlineMath math="\Delta^3 y_{-2}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Equal Mesh Step (h)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Uniform spacing between table x entries: <InlineMath math="h = x_1 - x_0" />.
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
                    Given the population dataset (in millions):
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">Year (x)</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1931</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1941</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1951</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1961</th>
                          <th className="p-2">1971</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">Population (y)</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">15</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">27</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">39</td>
                          <td className="p-2">52</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
                    Let&apos;s estimate the population for the year <InlineMath math="x = 1946" />!
                  </p>
                </div>

                {/* Step 1: Choose Origin and p */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>SELECT CENTRAL ORIGIN & CALCULATE p</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    We pick <InlineMath math="x_0 = 1951" /> as our central origin because <InlineMath math="1946" /> lies just before it. With step size <InlineMath math="h = 10" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`p = \\frac{x - x_0}{h} = \\frac{1946 - 1951}{10} = \\frac{-5}{10} = -0.5`} />
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
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Year (x)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">p</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">&Delta;y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">&Delta;²y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">&Delta;³y</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1931</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">15</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1941</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">-1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">20</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/30 text-black">7 (&Delta;y_{-1})</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2 (&Delta;²y_{-2})</td>
                          <td className="p-2">-</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">1951 (x_0)</td>
                          <td className="p-2 border-r border-emerald-600">0</td>
                          <td className="p-2 border-r border-emerald-600">27 (y_0)</td>
                          <td className="p-2 border-r border-emerald-600">12 (&Delta;y_0)</td>
                          <td className="p-2 border-r border-emerald-600">5 (&Delta;²y_{-1})</td>
                          <td className="p-2">3 (&Delta;³y_{-2})</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1961</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">39</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">13</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2">-4</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1971</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">52</td>
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
                    Gauss Backward Polynomial Formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`P(x) = y_0 + p \\Delta y_{-1} + \\frac{(p+1)p}{2!} \\Delta^2 y_{-1} + \\frac{(p+1)p(p-1)}{3!} \\Delta^3 y_{-2}`} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-1">
                    Substituting our calculated values (<InlineMath math="p = -0.5, y_0 = 27, \Delta y_{-1} = 7, \Delta^2 y_{-1} = 5, \Delta^3 y_{-2} = 3" />):
                  </p>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`P(1946) = 27 + (-0.5)(7) + \\frac{(0.5)(-0.5)}{2}(5) + \\frac{(0.5)(-0.5)(-1.5)}{6}(3)`} />
                    <BlockMath math={`P(1946) = 27.00000 - 3.50000 - 0.62500 + 0.18750`} />
                    <BlockMath math={`P(1946) = 23.06250 \\text{ million}`} />
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
                      Interpolated Population (1946): P(1946) = 23.0625 Million
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{P(1946) = 23.0625 \\text{ million}}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using Gauss Backward central difference interpolation, the estimated population in 1946 is <strong>23.0625 million</strong>!
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
                <GaussBackwardInterpolation />
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
