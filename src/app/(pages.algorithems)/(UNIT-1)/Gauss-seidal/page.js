'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussSeidel from './algorithems.gauss-seidale-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import Tour from '@/app/components/tour/Tour';
import { gaussSeidel as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';

const GaussSeidelPage = () => {
  return (
    <>
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

                  {/* The iteration formulas */}
                  <div className="py-2 text-center overflow-x-auto space-y-1">
                    <BlockMath math={`x^{(k+1)} = \\frac{d_1 - b_1 y^{(k)} - c_1 z^{(k)}}{a_1}`} />
                    <BlockMath math={`y^{(k+1)} = \\frac{d_2 - a_2 x^{(k+1)} - c_2 z^{(k)}}{b_2}`} />
                    <BlockMath math={`z^{(k+1)} = \\frac{d_3 - a_3 x^{(k+1)} - b_3 y^{(k+1)}}{c_3}`} />
                  </div>

                  {/* What each symbol means */}
                  <SymbolKey rows={[
                    { s: 'a_i,\\ b_i,\\ c_i', t: 'The coefficients of x, y, z in equation i. The diagonal ones (a₁, b₂, c₃) should be the largest in their rows.', e: 'a_1 = 4,\\ b_2 = 5,\\ c_3 = 6' },
                    { s: 'd_i', t: 'The right-hand side of equation i.', e: 'd_1 = 12' },
                    { s: 'x^{(k)},\\ y^{(k)},\\ z^{(k)}', t: 'The values after k iterations. Start from a guess, usually all zeros.', e: '(0, 0, 0)' },
                    { s: 'x^{(k+1)}', t: 'The new value, worked out from the latest values available. Gauss–Seidel uses each new value straight away.', e: 'x_1 = 3' },
                    { s: '|a_1| > |b_1| + |c_1|', t: 'Diagonal dominance: each diagonal coefficient beats the others in its row. It guarantees convergence.', e: '4 > 1 + 1' },
                    { s: '\\varepsilon', t: 'The tolerance. Stop when no value changes by more than it between iterations.', e: '\\varepsilon = 0.001' },
                  ]} />
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

                {/* Step 4: Later iterations, each with every number put in */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 04</span> • <span>STEP-BY-STEP ITERATIONS WALKTHROUGH</span>
                  </div>
                  {[
                    { k: 3, y0: '4.6200', z0: '1.7300', x: '1.4125', xn: '5.6500', yn: '22.1275', y: '4.4255', zn: '10.7495', z: '1.7916', chg: '0.1945' },
                    { k: 4, y0: '4.4255', z0: '1.7916', x: '1.4457', xn: '5.7829', yn: '21.9711', y: '4.3942', zn: '10.7143', z: '1.7857', chg: '0.0332' },
                  ].map((it) => (
                    <div key={it.k} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2">
                      <strong className="text-amber-600 dark:text-amber-400 block text-xs font-mono">Iteration {it.k}:</strong>
                      <div className="overflow-x-auto text-center">
                        <BlockMath math={`x_${it.k} = \\frac{12 - ${it.y0} - ${it.z0}}{4} = \\frac{${it.xn}}{4} = ${it.x}`} />
                        <BlockMath math={`y_${it.k} = \\frac{27 - ${it.x} - 2(${it.z0})}{5} = \\frac{${it.yn}}{5} = ${it.y}`} />
                        <BlockMath math={`z_${it.k} = \\frac{18 - 2(${it.x}) - ${it.y}}{6} = \\frac{${it.zn}}{6} = ${it.z}`} />
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        The new <InlineMath math={`x_${it.k}`} /> is used straight away for <InlineMath math={`y_${it.k}`} />, and both for <InlineMath math={`z_${it.k}`} />. Largest change from the last iteration: <InlineMath math={`${it.chg}`} />.
                      </p>
                    </div>
                  ))}
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Iterations 5–7 follow the same pattern (see the table). Stop when no value changes by more than the tolerance: after iteration 7 the largest change is <InlineMath math="0.0002 < 0.001" />.
                  </p>
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
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">z</th>
                          <th className="p-2.5">Largest change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['0', '0.0000', '0.0000', '0.0000', ''],
                          ['1', '3.0000', '4.8000', '1.2000', '4.8000'],
                          ['2', '1.5000', '4.6200', '1.7300', '1.5000'],
                          ['3', '1.4125', '4.4255', '1.7916', '0.1945'],
                          ['4', '1.4457', '4.3942', '1.7857', '0.0332'],
                          ['5', '1.4550', '4.3947', '1.7825', '0.0093'],
                          ['6', '1.4557', '4.3958', '1.7821', '0.0011'],
                          ['7', '1.4555', '4.3960', '1.7822', '0.0002'],
                        ].map((row) => (
                          <tr key={row[0]} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700 font-bold">{row[0]}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row[1]}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row[2]}</td>
                            <td className="p-2.5 border-r border-black/15 dark:border-neutral-700">{row[3]}</td>
                            <td className="p-2.5 font-bold">{row[4]}</td>
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
                      Converged Solution: (x, y, z) ≈ (1.4555, 4.3960, 1.7822)
                    </h3>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      By immediately reusing newly solved values within each pass, Gauss-Seidel converges much faster than Jacobi iteration!
                    </p>
                  </div>
                </div>

              </div>

              {/* Common Mistakes */}
              <CommonMistakes items={[
                { m: <>Using last round&apos;s values for everything (that is Jacobi).</>, f: <>In Gauss–Seidel, <InlineMath math="y^{(k+1)}" /> already uses the new <InlineMath math="x^{(k+1)}" />, and <InlineMath math="z^{(k+1)}" /> uses both new values.</> },
                { m: <>Not checking diagonal dominance.</>, f: <>Reorder the equations so the largest coefficient of x is in row 1, of y in row 2, of z in row 3. Without it the values may grow instead of settle.</> },
                { m: <>Rearranging an equation for the wrong variable.</>, f: <>Equation 1 gives x, equation 2 gives y, equation 3 gives z: divide by the diagonal coefficient.</> },
                { m: <>Sign slips when moving terms across.</>, f: <><InlineMath math="x + 5y + 2z = 27" /> gives <InlineMath math="y = \dfrac{27 - x - 2z}{5}" />: every other term changes sign.</> },
                { m: <>Stopping after two iterations.</>, f: <>Continue until no value changes by more than the tolerance; here that takes 7 iterations for 0.001.</> },
                { m: <>Writing only the final answer.</>, f: <>Show the rearranged formulas, the first iteration with numbers, and a table of every iteration.</> },
              ]} />

              {/* Interactive Calculator Section */}
              <div id="calculator" className="scroll-mt-24 pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6 step-intro-5">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
                  LABORATORY
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Interactive Live Calculator & Visualizer
                </h2>
                <GaussSeidel />
              </div>

              {/* Sequential Routing Navigation */}
              <Faq items={EXTRAS.faq} />
              <RelatedMethods ids={EXTRAS.related} />
              <AlgorithmNavigation />

            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
};

export default GaussSeidelPage;