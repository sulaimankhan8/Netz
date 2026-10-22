'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import FalsePositionMethod from './algorithems.false-positions-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function FalsePositionMethods() {
  const iterationData = [
    { k: 1, a: '2.0000', b: '3.0000', c: '2.6000', fc: '-1.8240', sign: 'f(c) < 0', next: '[2.6000, 3.0000]' },
    { k: 2, a: '2.6000', b: '3.0000', c: '2.6933', fc: '-0.2372', sign: 'f(c) < 0', next: '[2.6933, 3.0000]' },
    { k: 3, a: '2.6933', b: '3.0000', c: '2.7049', fc: '-0.0289', sign: 'f(c) < 0', next: '[2.7049, 3.0000]' },
    { k: 4, a: '2.7049', b: '3.0000', c: '2.7063', fc: '-0.0035', sign: 'f(c) < 0', next: '[2.7063, 3.0000]' },
    { k: 5, a: '2.7063', b: '3.0000', c: '2.7065', fc: '-0.0004', sign: 'f(c) < 0', next: '[2.7065, 3.0000]' },
    { k: 6, a: '2.7065', b: '3.0000', c: '2.706525', fc: '-0.00005', sign: '|C₆ − C₅| = 0.00002 < 0.0001', next: 'Stop' },
  ];

  return (
    <>
      <Head>
        <title>False Position Method (Regula Falsi) | Netz</title>
        <meta name="description" content="Master the False Position Method (Regula Falsi) with gentle step-by-step guidance, formula derivations, and an interactive visualizer." />
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
                  False Position Method <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Regula Falsi Strategy</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>False Position Method</strong> (Regula Falsi) improves upon the Bisection method by connecting boundary points <InlineMath math="(a, f(a))" /> and <InlineMath math="(b, f(b))" /> with a straight secant line. Instead of cutting blindly in the middle, it places the next guess right at the x-intercept of this secant line!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      HOW REGULA FALSI WORKS
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      SECANT INTERCEPT
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={`C = \\frac{a \\cdot f(b) - b \\cdot f(a)}{f(b) - f(a)}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Pick Starting Bracket [a, b]</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Choose points where <InlineMath math="f(a)" /> and <InlineMath math="f(b)" /> have opposite signs.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Draw Secant Line (C)</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Find x-intercept <InlineMath math="C" /> where secant line crosses <InlineMath math="y=0" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Update Bound & Repeat</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Replace <InlineMath math="a" /> or <InlineMath math="b" /> with <InlineMath math="C" /> keeping root bracketed.
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
                    Find the real root of <InlineMath math="f(x) = x^3 - 4x - 9 = 0" /> in the interval <InlineMath math="[a, b] = [2, 3]" />, stopping when two successive intercepts differ by less than <InlineMath math="0.0001" />.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>INITIAL BRACKET EVALUATION</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Evaluate <InlineMath math="f(x)" /> at initial points <InlineMath math="a = 2" /> and <InlineMath math="b = 3" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="f(2) = (2)^3 - 4(2) - 9 = 8 - 8 - 9 = -9 \quad (\text{Negative})" />
                    <BlockMath math="f(3) = (3)^3 - 4(3) - 9 = 27 - 12 - 9 = +6 \quad (\text{Positive})" />
                  </div>
                  <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    Since <InlineMath math="f(2) < 0" /> and <InlineMath math="f(3) > 0" />, a root exists in <InlineMath math="[2, 3]" />.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>COMPUTE FIRST INTERCEPT (C₁)</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Substitute values into the Regula Falsi secant formula:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="C_1 = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)} = \frac{2(6) - 3(-9)}{6 - (-9)} = \frac{12 + 27}{15} = \frac{39}{15} = 2.6" />
                    <BlockMath math="f(2.6) = (2.6)^3 - 4(2.6) - 9 = 17.576 - 10.4 - 9 = -1.824 \quad (\text{Negative})" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>UPDATE INTERVAL BOUNDS</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Since <InlineMath math="f(2.6) < 0" /> and <InlineMath math="f(3) > 0" />, replace the old left bound <InlineMath math="a = 2" /> with <InlineMath math="a = 2.6" />.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl font-mono text-xs text-center font-bold">
                    New Search Bracket: <InlineMath math="[a, b] = [2.6, 3]" />
                  </div>
                </div>

                {/* Step 4: Iterations Walkthrough */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 04</span> • <span>SUBSEQUENT ITERATIONS WALKTHROUGH</span>
                  </div>

                  {/* Iteration 2 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 2:</strong>
                    <div>Secant Formula: <InlineMath math="C_2 = \frac{2.6(6) - 3(-1.824)}{6 - (-1.824)} = \frac{21.072}{7.824} \approx 2.693252" /></div>
                    <div>Function Evaluation: <InlineMath math="f(2.693252) = -0.237227" /> (Negative)</div>
                    <div>Update: Set <InlineMath math="a = 2.693252" />. Change from last intercept: <InlineMath math="|C_2 - C_1| = 0.093252" /></div>
                  </div>

                  {/* Iteration 3 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 3:</strong>
                    <div>Secant Formula: <InlineMath math="C_3 \approx 2.704918" /></div>
                    <div>Function Evaluation: <InlineMath math="f(2.704918) = -0.028912" /> (Negative)</div>
                    <div>Update: Set <InlineMath math="a = 2.704918" />. <InlineMath math="|C_3 - C_2| = 0.011667" /></div>
                  </div>

                  {/* Iteration 4 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 4:</strong>
                    <div>Secant Formula: <InlineMath math="C_4 \approx 2.706333" /></div>
                    <div>Function Evaluation: <InlineMath math="f(2.706333) = -0.003495" /> (Negative)</div>
                    <div>Update: Set <InlineMath math="a = 2.706333" />. <InlineMath math="|C_4 - C_3| = 0.001415" /></div>
                  </div>

                  {/* Iteration 5 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 5:</strong>
                    <div>Secant Formula: <InlineMath math="C_5 \approx 2.706504" /></div>
                    <div>Function Evaluation: <InlineMath math="f(2.706504) = -0.000422" /> (Negative)</div>
                    <div>Update: Set <InlineMath math="a = 2.706504" />. <InlineMath math="|C_5 - C_4| = 0.000171" /></div>
                  </div>

                  {/* Iteration 6 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
                    <strong className="text-amber-600 dark:text-amber-400 block">Iteration 6:</strong>
                    <div>Secant Formula: <InlineMath math="C_6 \approx 2.706525" /></div>
                    <div>Function Evaluation: <InlineMath math="f(2.706525) = -0.000051" /> (Negative)</div>
                    <div>Stop: <InlineMath math="|C_6 - C_5| = 0.000021 < 0.0001" />.</div>
                  </div>
                </div>

                {/* Step 5: Summary Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 05</span> • <span>ITERATION SUMMARY TABLE</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Step (k)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Left Bound (a)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Right Bound (b)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Intercept (C)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Value f(C)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Sign of f(C)</th>
                          <th className="p-2.5">Next Bracket</th>
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
                      Approximated Root: x ≈ 2.7065
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\text{Exact Root } \\alpha \\approx 2.706528, \\quad f(2.706525) = -0.00005 \\approx 0`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Six chord steps pin the root to 4 decimal places. Bisection needs 14 halvings for the same accuracy on the same interval.
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
                <FalsePositionMethod />
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