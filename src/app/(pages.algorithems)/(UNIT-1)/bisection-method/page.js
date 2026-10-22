'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import BisectionMethod from './algorithems.bisection-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function BisectionMethods() {
  const iterationData = [
    { k: 1, a: '2.0000', b: '3.0000', c: '2.5000', fc: '-3.3750', sign: 'f(2.5) < 0', next: '[2.5000, 3.0000]' },
    { k: 2, a: '2.5000', b: '3.0000', c: '2.7500', fc: '+0.7969', sign: 'f(2.75) > 0', next: '[2.5000, 2.7500]' },
    { k: 3, a: '2.5000', b: '2.7500', c: '2.6250', fc: '-1.4121', sign: 'f(2.625) < 0', next: '[2.6250, 2.7500]' },
    { k: 4, a: '2.6250', b: '2.7500', c: '2.6875', fc: '-0.3391', sign: 'f(2.6875) < 0', next: '[2.6875, 2.7500]' },
    { k: 5, a: '2.6875', b: '2.7500', c: '2.7188', fc: '+0.2209', sign: '(b − a)/2 = 0.0313 < 0.05', next: 'Stop' },
  ];

  return (
    <>
      <Head>
        <title>Bisection Method | Netz</title>
        <meta name="description" content="Master the Bisection Method with gentle step-by-step guidance, clear formula derivations, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 1 • FINDING ROOTS OF EQUATIONS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  The Bisection Method <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Step-by-Step Friendly Guide</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Bisection Method</strong> is a straightforward and reliable numerical technique used to find roots (solutions) of continuous functions. It works by repeatedly dividing an interval in half and selecting the subinterval where the function changes sign, thereby narrowing down the location of the root.
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      HOW THE BISECTION METHOD WORKS
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      MIDPOINT CALCULATION
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={`C = \\frac{a + b}{2}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Select Interval [a, b]</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Choose two points <InlineMath math="a" /> and <InlineMath math="b" /> such that <InlineMath math="f(a)" /> and <InlineMath math="f(b)" /> have opposite signs.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Calculate Midpoint (C)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Compute <InlineMath math="C = \frac{a+b}{2}" /> to split interval in half.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Evaluate f(C)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Check sign and value of <InlineMath math="f(C)" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">4. Update Interval</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        If <InlineMath math="f(C) \approx 0" />, <InlineMath math="C" /> is the root! Otherwise, set <InlineMath math="a=C" /> or <InlineMath math="b=C" />.
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
                    HAND-HOLDING TUTORIAL
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
                    Find a root of <InlineMath math="x^3 - 4x - 9 = 0" /> correct to one decimal place (tolerance <InlineMath math="\varepsilon = 0.05" />) using the Bisection Method.
                  </p>
                </div>

                {/* Step 1: Rearranging Equation */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>REARRANGING THE EQUATION</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    First, set the equation to zero to get our standard function <InlineMath math="f(x) = 0" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`f(x) = x^3 - 4x - 9 = 0`} />
                  </div>
                </div>

                {/* Step 2: Choose Initial Points */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>CHOOSE INITIAL POINTS</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Choose two initial points <InlineMath math="a" /> and <InlineMath math="b" /> such that <InlineMath math="f(a)" /> and <InlineMath math="f(b)" /> have opposite signs. Let&apos;s choose <InlineMath math="a = 2" /> and <InlineMath math="b = 3" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`f(2) = 2^3 - 4(2) - 9 = 8 - 8 - 9 = -9 \\quad (\\text{Negative})`} />
                    <BlockMath math={`f(3) = 3^3 - 4(3) - 9 = 27 - 12 - 9 = 6 \\quad (\\text{Positive})`} />
                  </div>
                  <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    Since <InlineMath math="f(2) < 0" /> and <InlineMath math="f(3) > 0" />, a root must lie in <InlineMath math="[2, 3]" />. Each step halves the interval, so the number of steps is known in advance: stop at step <InlineMath math="k" /> once <InlineMath math="\frac{b-a}{2^k} < \varepsilon" />, i.e. <InlineMath math="k > \log_2 \frac{3-2}{0.05} = \log_2 20 \approx 4.32" />, so <strong>5 steps</strong>.
                  </p>
                </div>

                {/* Step 3: Calculate Midpoint */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>CALCULATE FIRST MIDPOINT</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate the midpoint <InlineMath math="C" /> of the interval <InlineMath math="[a, b] = [2, 3]" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`C = \\frac{a + b}{2} = \\frac{2 + 3}{2} = 2.5`} />
                    <BlockMath math={`f(2.5) = (2.5)^3 - 4(2.5) - 9 = 15.625 - 10 - 9 = -3.375 \\quad (\\text{Negative})`} />
                  </div>
                </div>

                {/* Step 4: Update Interval */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 04</span> • <span>UPDATE THE INTERVAL</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Since <InlineMath math="f(2) < 0" /> and <InlineMath math="f(2.5) < 0" />, both left points are negative. The sign change happens between <InlineMath math="C = 2.5" /> and <InlineMath math="b = 3" />.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl font-mono text-xs text-center font-bold">
                    Set new left bound: <InlineMath math="a = C = 2.5" />. New interval is <InlineMath math="[2.5, 3.0]" />.
                  </div>
                </div>

                {/* Step 5: Iterations Walkthrough */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 05</span> • <span>STEP-BY-STEP ITERATIONS WALKTHROUGH</span>
                  </div>

                  {/* Iteration 2 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 2:</strong>
                    <div>Midpoint: <InlineMath math="C_2 = \frac{2.5 + 3}{2} = 2.75" /></div>
                    <div>Function Value: <InlineMath math="f(2.75) = (2.75)^3 - 4(2.75) - 9 = +0.7969" /></div>
                    <div>Update: <InlineMath math="f(2.5) < 0" /> and <InlineMath math="f(2.75) > 0" />, so set <InlineMath math="b = 2.75" />. New interval: <InlineMath math="[2.5, 2.75]" /></div>
                  </div>

                  {/* Iteration 3 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 3:</strong>
                    <div>Midpoint: <InlineMath math="C_3 = \frac{2.5 + 2.75}{2} = 2.625" /></div>
                    <div>Function Value: <InlineMath math="f(2.625) = -1.4121" /></div>
                    <div>Update: set <InlineMath math="a = 2.625" />. New interval: <InlineMath math="[2.625, 2.75]" /></div>
                  </div>

                  {/* Iteration 4 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 4:</strong>
                    <div>Midpoint: <InlineMath math="C_4 = \frac{2.625 + 2.75}{2} = 2.6875" /></div>
                    <div>Function Value: <InlineMath math="f(2.6875) = -0.3391" /></div>
                    <div>Update: set <InlineMath math="a = 2.6875" />. New interval: <InlineMath math="[2.6875, 2.75]" /></div>
                  </div>

                  {/* Iteration 5 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 5:</strong>
                    <div>Midpoint: <InlineMath math="C_5 = \frac{2.6875 + 2.75}{2} = 2.71875" /></div>
                    <div>Function Value: <InlineMath math="f(2.71875) = +0.2209" /></div>
                    <div>Check: <InlineMath math="\frac{b - a}{2} = \frac{2.75 - 2.6875}{2} = 0.03125 < 0.05" />, so stop. The root lies within 0.03 of 2.71875.</div>
                  </div>
                </div>

                {/* Step 6: Summary Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 06</span> • <span>ITERATION SUMMARY TABLE</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Step (k)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Left Bound (a)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Right Bound (b)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Midpoint (C)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Value f(C)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Sign of f(C)</th>
                          <th className="p-2.5">Next Interval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iterationData.map((row) => (
                          <tr key={row.k} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row.k}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.a}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.b}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.c}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fc}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.sign}</td>
                            <td className="p-2.5 font-bold">{row.next}</td>
                          </tr>
                        ))}
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
                      Root Correct to 1 Decimal Place: x ≈ 2.7
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`x \\approx 2.71875 \\Rightarrow x = 2.7 \\quad (\\text{true root } 2.7065)`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      The Bisection Method guarantees convergence as long as you start with points that bracket the root. Notice how the interval width <InlineMath math="|b - a|" /> is cut in half at every step (<InlineMath math="1 \to 0.5 \to 0.25 \to 0.125 \to 0.0625" />). After 5 steps the half-width is below <InlineMath math="0.05" />, giving the root <InlineMath math="x \approx 2.7" />. Each extra decimal place costs about 3.3 more steps (4 decimal places need 14 steps).
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
                <BisectionMethod />
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
