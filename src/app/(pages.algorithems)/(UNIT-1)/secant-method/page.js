'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import SecantMethod from './algorithems.secant-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import { secant as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';

export default function SecantMethodPage() {
  const iterationData = [
    { k: 1, x0: '2.000000', x1: '3.000000', x2: '2.058824', fx0: '-1.000000', fx1: '16.000000', fx2: '-0.390800', ea: '45.714%' },
    { k: 2, x0: '3.000000', x1: '2.058824', x2: '2.081264', fx0: '16.000000', fx1: '-0.390800', fx2: '-0.147204', ea: '1.078%' },
    { k: 3, x0: '2.058824', x1: '2.081264', x2: '2.094824', fx0: '-0.390800', fx1: '-0.147204', fx2: '0.003044', ea: '0.647%' },
    { k: 4, x0: '2.081264', x1: '2.094824', x2: '2.094549', fx0: '-0.147204', fx1: '0.003044', fx2: '-0.000023', ea: '0.013%' },
  ];

  return (
    <>
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
                  The Secant Method <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Step-by-Step Friendly Guide</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Secant Method</strong> is an open root-finding method that approximates derivatives using two recent function evaluations — making it faster than Bisection with <strong>no need for analytical derivatives</strong>. It achieves super-linear convergence (order ≈ 1.618, the golden ratio).
                </p>
              </div>

              {/* Core Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      HOW THE SECANT METHOD WORKS
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      SECANT LINE APPROXIMATION
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={`x_{n+1} = x_n - f(x_n) \\cdot \\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Two Initial Guesses</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Choose <InlineMath math="x_0" /> and <InlineMath math="x_1" /> — no bracketing required (unlike Bisection).
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Draw a Secant Line</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Approximate the derivative by a secant through <InlineMath math="(x_{n-1}, f(x_{n-1}))" /> and <InlineMath math="(x_n, f(x_n))" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Find x-Intercept</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Where the secant crosses the x-axis becomes the new estimate <InlineMath math="x_{n+1}" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">4. Repeat Until Convergence</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Slide the window forward: old <InlineMath math="x_1" /> becomes new <InlineMath math="x_0" />, new estimate becomes <InlineMath math="x_1" />.
                      </span>
                    </div>
                  </div>

                  {/* What each symbol means */}
                  <SymbolKey rows={[
                    { s: 'f(x)', t: 'The function whose root we want: where the graph crosses the x-axis.', e: 'f(x) = x^3 - 2x - 5' },
                    { s: 'x_{n-1},\\ x_n', t: 'The two latest guesses. The secant line is drawn through the curve at these two points. They do not need to bracket the root.', e: 'x_0 = 2,\\ x_1 = 3' },
                    { s: 'f(x_{n-1}),\\ f(x_n)', t: 'The heights of the curve at the two guesses.', e: 'f(2) = -1,\\ f(3) = 16' },
                    { s: '\\dfrac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}', t: 'One over the slope of the secant line. It replaces the 1 / f′(x) of Newton–Raphson, so no derivative is needed.', e: '\\dfrac{3 - 2}{16 - (-1)} = \\dfrac{1}{17}' },
                    { s: 'x_{n+1}', t: 'Where the secant line crosses the x-axis: the new guess.', e: 'x_2 = 2.058824' },
                    { s: '\\varepsilon', t: 'The tolerance. Stop when |f(x)| (or the change in x) is smaller than it.', e: '\\varepsilon = 0.0001' },
                  ]} />
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

                {/* Problem Statement */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                    OUR PROBLEM TO SOLVE
                  </span>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Find the root of <InlineMath math="f(x) = x^3 - 2x - 5 = 0" /> using the Secant Method with <InlineMath math="x_0 = 2" />, <InlineMath math="x_1 = 3" />, tolerance = 0.0001.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>EVALUATE INITIAL POINTS</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Calculate <InlineMath math="f(x_0)" /> and <InlineMath math="f(x_1)" /> to set up the first secant line:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`f(x_0) = f(2) = 2^3 - 2(2) - 5 = 8 - 4 - 5 = -1`} />
                    <BlockMath math={`f(x_1) = f(3) = 3^3 - 2(3) - 5 = 27 - 6 - 5 = 16`} />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>APPLY THE SECANT FORMULA</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Plug into the secant formula to find the first new estimate <InlineMath math="x_2" />:
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_2 = x_1 - f(x_1) \\cdot \\frac{x_1 - x_0}{f(x_1) - f(x_0)}`} />
                    <BlockMath math={`x_2 = 3 - 16 \\cdot \\frac{3 - 2}{16 - (-1)} = 3 - 16 \\cdot \\frac{1}{17} \\approx 2.0588`} />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 03</span> • <span>SLIDE THE WINDOW FORWARD</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Update the pair: the old <InlineMath math="x_1 = 3" /> becomes the new <InlineMath math="x_0" />, and <InlineMath math="x_2 \approx 2.0588" /> becomes the new <InlineMath math="x_1" />.
                    Repeat until <InlineMath math="|f(x_{n+1})| < \epsilon" />.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl font-mono text-xs text-center font-bold">
                    New pair: <InlineMath math="x_0 = 3,\; x_1 = 2.0588" /> → Continue iterating
                  </div>
                </div>

                {/* Later iterations, each with every number put in */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 04</span> • <span>STEP-BY-STEP ITERATIONS WALKTHROUGH</span>
                  </div>
                  {[
                    { k: 2, a: 3, b: '2.058824', fa: '16', fb: '-0.3908', d: '2.058824 - 3', df: '-0.3908 - 16', corr: '(-0.022440)', x: '2.081264', fx: '-0.147204', move: '0.022440' },
                    { k: 3, a: '2.058824', b: '2.081264', fa: '(-0.3908)', fb: '-0.147204', d: '2.081264 - 2.058824', df: '-0.147204 - (-0.3908)', corr: '(-0.013560)', x: '2.094824', fx: '+0.003044', move: '0.013560' },
                    { k: 4, a: '2.081264', b: '2.094824', fa: '(-0.147204)', fb: '0.003044', d: '2.094824 - 2.081264', df: '0.003044 - (-0.147204)', corr: '0.000275', x: '2.094549', fx: '-0.000023', move: '0.000275' },
                  ].map((it) => (
                    <div key={it.k} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2">
                      <strong className="text-amber-600 dark:text-amber-400 block text-xs font-mono">Iteration {it.k}: <InlineMath math={`x_{${it.k - 1}} = ${it.a},\\ x_{${it.k}} = ${it.b}`} /></strong>
                      <div className="overflow-x-auto text-center">
                        <BlockMath math={`x_{${it.k + 1}} = ${it.b} - (${it.fb}) \\cdot \\frac{${it.d}}{${it.df}} = ${it.b} - ${it.corr} = ${it.x}`} />
                        <BlockMath math={`f(${it.x}) = (${it.x})^3 - 2(${it.x}) - 5 = ${it.fx}`} />
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {it.k < 4
                          ? <>The guess moved by <InlineMath math={`${it.move}`} />. Slide the pair forward: <InlineMath math={`x_{${it.k}} = ${it.b},\\ x_{${it.k + 1}} = ${it.x}`} />, and repeat.</>
                          : <><InlineMath math={`|f(x_5)| = 0.000023 < 0.0001`} />, so stop: the root is <InlineMath math="x \approx 2.094549" />.</>}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Iteration Summary Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 05</span> • <span>ITERATION SUMMARY TABLE</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">k</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₀</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₁</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x₂ (New)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x₀)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">f(x₁)</th>
                          <th className="p-2.5">Ea (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iterationData.map((row) => (
                          <tr key={row.k} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row.k}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.x0}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.x1}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold bg-[#FFE600]/20 dark:bg-amber-950/40">{row.x2}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fx0}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row.fx1}</td>
                            <td className="p-2.5">{row.ea}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      FINAL CONCLUSION
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Root Converged: x ≈ 2.094549
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`f(2.094549) = (2.094549)^3 - 2(2.094549) - 5 = -0.000023 \\approx 0`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      The Secant Method converged in just <strong>4 iterations</strong>, compared to 14 for Bisection on the same problem.
                      This is the power of the <InlineMath math="\phi" />-order (≈1.618) convergence rate — each step dramatically improves accuracy!
                      Note: unlike Newton-Raphson, no derivative <InlineMath math="f'(x)" /> was required.
                    </p>
                  </div>
                </div>

                {/* Common Mistakes */}
                <CommonMistakes items={[
                  { m: <>Mixing up which point goes where in the formula.</>, f: <>The formula starts from the <strong>latest</strong> guess: <InlineMath math="x_{n+1} = x_n - f(x_n) \cdot \dfrac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}" />. Top and bottom must both be &quot;new minus old&quot;.</> },
                  { m: <>Sign slips with negative values.</>, f: <>Bracket negatives: <InlineMath math="16 - (-1) = 17" />, and <InlineMath math="-0.3908 - 16 = -16.3908" />.</> },
                  { m: <>Keeping the bracket as in false position.</>, f: <>The secant method always drops the <strong>oldest</strong> point, even if the two new points no longer bracket the root.</> },
                  { m: <>Two guesses with the same f value.</>, f: <>Then <InlineMath math="f(x_n) - f(x_{n-1}) = 0" /> and the formula divides by zero (the secant line is flat). Pick different starting guesses.</> },
                  { m: <>Rounding the guesses too early.</>, f: <>Keep 6 decimals; the corrections (0.000275 in the last step) are tiny.</> },
                  { m: <>Writing only the final answer.</>, f: <>Show <InlineMath math="f" /> at both guesses, the formula with numbers for each iteration, and the table.</> },
                ]} />
              </div>

              {/* Interactive Calculator */}
              <div id="calculator" className="scroll-mt-24 pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
                  LABORATORY
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Interactive Live Calculator & Visualizer
                </h2>
                <SecantMethod />
              </div>

              <Faq items={EXTRAS.faq} />
              <RelatedMethods ids={EXTRAS.related} />
              <AlgorithmNavigation />

            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}
