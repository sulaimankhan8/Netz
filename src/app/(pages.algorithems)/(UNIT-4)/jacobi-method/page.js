'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import JacobiMethod from './algorithems.jacobi-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import { jacobi as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import { StepTable, Conclusion } from '@/app/components/method';

export default function JacobiMethodPage() {
  return (
    <>
      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 4 • LINEAR ALGEBRA & MATRIX METHODS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                  Jacobi Iterative Method <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Step-by-Step Friendly Guide</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  The <strong>Jacobi Method</strong> is an iterative solver for systems <InlineMath math="Ax = b" />. Starting from an initial guess (typically <InlineMath math="x^{(0)} = 0" />), each variable is updated simultaneously using the previous iteration’s values — converging when the matrix <InlineMath math="A" /> is <strong>strictly diagonally dominant</strong>.
                </p>
              </div>

              {/* Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">JACOBI UPDATE FORMULA</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">SIMULTANEOUS UPDATE</span>
                  </div>
                  <div className="py-4 text-center overflow-x-auto space-y-3">
                    <BlockMath math={`x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)}\\right)`} />
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      All <InlineMath math="x_i" /> are updated simultaneously using values from iteration <InlineMath math="k" /> (unlike Gauss-Seidel which uses newest available values).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">Convergence Condition</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Matrix must be <em>strictly diagonally dominant</em>: <InlineMath math="|a_{ii}| > \sum_{j \neq i}|a_{ij}|" /> for all rows.</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">Jacobi vs Gauss-Seidel</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Jacobi uses all old values for each update; Gauss-Seidel uses fresh values immediately (faster convergence).</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">Parallelism Advantage</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">All variable updates are independent per iteration — making Jacobi naturally parallelizable on GPUs.</span>
                    </div>
                  </div>

                  {/* What each symbol means */}
                  <SymbolKey rows={[
                    { s: 'x_i^{(k)}', t: 'The value of unknown i after k iterations. Start from a guess, usually all zeros.', e: 'x_1^{(1)} = 0.6' },
                    { s: 'a_{ii}', t: 'The diagonal coefficient of equation i: we divide by it.', e: 'a_{11} = 10' },
                    { s: 'b_i', t: 'The right-hand side of equation i.', e: 'b_1 = 6' },
                    { s: '\\sum_{j \\ne i} a_{ij}x_j^{(k)}', t: 'All the other unknowns, using the values from the previous iteration only.', e: '-x_2 + 2x_3' },
                    { s: '|a_{ii}| > \\sum_{j \\ne i} |a_{ij}|', t: 'Diagonal dominance: it guarantees the iterations settle down.', e: '10 > 1 + 2' },
                  ]} />
                </div>
              </div>

              {/* Worked Example */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Step-by-Step Worked Example</h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">HAND-HOLDING TUTORIAL</span>
                </div>

                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">OUR PROBLEM</span>
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                    Solve: <InlineMath math="10x_1 - x_2 + 2x_3 = 6,\quad -x_1 + 11x_2 - x_3 = 25,\quad 2x_1 - x_2 + 10x_3 = -11" />
                  </p>
                  <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">Start from x = (0, 0, 0) and stop when no value changes by more than 0.0001.</p>
                </div>

                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-neutral-500">STEP 01 • REARRANGE FOR EACH VARIABLE</div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_1^{(k+1)} = \\frac{6 + x_2^{(k)} - 2x_3^{(k)}}{10}`} />
                    <BlockMath math={`x_2^{(k+1)} = \\frac{25 + x_1^{(k)} + x_3^{(k)}}{11}`} />
                    <BlockMath math={`x_3^{(k+1)} = \\frac{-11 - 2x_1^{(k)} + x_2^{(k)}}{10}`} />
                  </div>
                </div>

                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-neutral-500">STEP 02 • ITERATION 1 (starting from x = [0,0,0])</div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_1^{(1)} = \\frac{6 + 0 - 0}{10} = 0.6`} />
                    <BlockMath math={`x_2^{(1)} = \\frac{25 + 0 + 0}{11} = 2.2727`} />
                    <BlockMath math={`x_3^{(1)} = \\frac{-11 - 0 + 0}{10} = -1.1`} />
                  </div>
                </div>
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-neutral-500">STEP 03 • ITERATION 2 (using only the iteration-1 values)</div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_1^{(2)} = \\frac{6 + 2.2727 - 2(-1.1)}{10} = \\frac{10.4727}{10} = 1.0473`} />
                    <BlockMath math={`x_2^{(2)} = \\frac{25 + 0.6 + (-1.1)}{11} = \\frac{24.5}{11} = 2.2273`} />
                    <BlockMath math={`x_3^{(2)} = \\frac{-11 - 2(0.6) + 2.2727}{10} = \\frac{-9.9273}{10} = -0.9927`} />
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">All three use the old values (0.6, 2.2727, −1.1), even though x₁ was just updated: that is what makes it Jacobi.</p>
                </div>
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="text-xs font-mono font-bold uppercase text-neutral-500">STEP 04 • ITERATION TABLE</div>
                  <StepTable
                    columns={[{ key: 'k', label: 'k', bold: true }, { key: 'x1', label: 'x₁' }, { key: 'x2', label: 'x₂' }, { key: 'x3', label: 'x₃' }, { key: 'd', label: 'Largest change', highlight: true }]}
                    rows={[
                      { k: 1, x1: '0.6000', x2: '2.2727', x3: '−1.1000', d: '2.2727' },
                      { k: 2, x1: '1.0473', x2: '2.2273', x3: '−0.9927', d: '0.4473' },
                      { k: 3, x1: '1.0213', x2: '2.2777', x3: '−1.0867', d: '0.0940' },
                      { k: 4, x1: '1.0451', x2: '2.2668', x3: '−1.0765', d: '0.0238' },
                      { k: 5, x1: '1.0420', x2: '2.2699', x3: '−1.0823', d: '0.0059' },
                      { k: 6, x1: '1.0435', x2: '2.2691', x3: '−1.0814', d: '0.0015' },
                      { k: 7, x1: '1.0432', x2: '2.2693', x3: '−1.0818', d: '0.0004' },
                      { k: 8, x1: '1.0433', x2: '2.2692', x3: '−1.0817', d: '0.0001' },
                      { k: 9, x1: '1.0433', x2: '2.2692', x3: '−1.0817', d: '0.0000' },
                    ]}
                    rowKey={(r) => r.k}
                  />
                </div>
                <Conclusion result="x₁ ≈ 1.0433, x₂ ≈ 2.2692, x₃ ≈ −1.0817" math={<BlockMath math="x_1 = 1.043269, \quad x_2 = 2.269231, \quad x_3 = -1.081731" />}>
                  The values swing either side of the answer and close in; after 9 iterations they agree to 4 decimals with the exact solution (by elimination).
                </Conclusion>
              </div>

              {/* Common Mistakes */}
              <CommonMistakes items={[
                { m: <>Using a new value in the same iteration.</>, f: <>That is Gauss-Seidel. Jacobi uses only the previous iteration&apos;s values for every unknown.</> },
                { m: <>Not checking diagonal dominance.</>, f: <>Each diagonal coefficient should beat the others in its row (|10| &gt; 1 + 2). Otherwise reorder the equations, or the values may grow.</> },
                { m: <>Sign slips when rearranging.</>, f: <><InlineMath math="10x_1 - x_2 + 2x_3 = 6" /> gives <InlineMath math="x_1 = \dfrac{6 + x_2 - 2x_3}{10}" />: every term that moves changes sign.</> },
                { m: <>Stopping too early.</>, f: <>Continue until no value changes by more than the tolerance (9 iterations here for 0.0001).</> },
                { m: <>Rounding each iteration heavily.</>, f: <>Keep 4–6 decimals; the last changes are tiny.</> },
                { m: <>Writing only the final answer.</>, f: <>Show the rearranged formulas, the first iteration in full, and a table of all iterations.</> },
              ]} />

              {/* Interactive Calculator */}
              <div id="calculator" className="scroll-mt-24 pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <JacobiMethod />
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
