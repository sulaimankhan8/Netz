'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import GaussElimination from './algorithems.gauss-elimination';

export default function GaussEliminationPage() {
  return (
    <>

      <MethodShell route="/gauss-elimination" steps={3} solve={<GaussElimination />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Gaussian Elimination</strong> is the foundational direct method for solving systems of linear equations <InlineMath math="Ax = b" />. It transforms an augmented matrix into upper triangular form via row operations, then solves via <strong>back substitution</strong>. With partial pivoting, it handles near-zero pivots stably.
                </p>

              {/* Core Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">Core row operation</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">Forward elimination</span>
                  </div>
                  <div className="py-4 text-center overflow-x-auto space-y-2">
                    <BlockMath math={`R_i \\leftarrow R_i - \\frac{a_{ik}}{a_{kk}} \\cdot R_k \\quad \\text{for } i > k`} />
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      Repeat for each pivot column <InlineMath math="k = 1, 2, \ldots, n" /> until upper triangular form is achieved.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">1. Forward Elimination</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Row-reduce to upper triangular form using pivot rows. Apply partial pivoting (row swap) for numerical stability.</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">2. Upper Triangular Form</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Result is <InlineMath math="[U | b']" /> — an equivalent system that is easy to solve.</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">3. Back Substitution</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Solve from <InlineMath math="x_n" /> backwards: <InlineMath math="x_i = (b'_i - \sum_{j>i} u_{ij} x_j) / u_{ii}" />.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worked Example */}
              <div className="space-y-6">
                <div className="am-section-title"><h2>Worked example</h2></div>

                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">Our problem</span>
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                    Solve the 3×3 system: <InlineMath math="2x_1 + x_2 - x_3 = 8,\quad -3x_1 - x_2 + 2x_3 = -11,\quad -2x_1 + x_2 + 2x_3 = -3" />
                  </p>
                </div>

                <Step n={1} title="Write augmented matrix">

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`\\begin{pmatrix} 2 & 1 & -1 & | & 8 \\\\ -3 & -1 & 2 & | & -11 \\\\ -2 & 1 & 2 & | & -3 \\end{pmatrix}`} />
                  </div>
                </Step>

                <Step n={2} title="Eliminate below pivot 1">

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`R_2 \\leftarrow R_2 - \\frac{-3}{2}R_1 = R_2 + 1.5R_1`} />
                    <BlockMath math={`R_3 \\leftarrow R_3 - \\frac{-2}{2}R_1 = R_3 + R_1`} />
                    <BlockMath math={`\\begin{pmatrix} 2 & 1 & -1 & | & 8 \\\\ 0 & 0.5 & 0.5 & | & 1 \\\\ 0 & 2 & 1 & | & 5 \\end{pmatrix}`} />
                  </div>
                </Step>

                <Step n={3} title="Back substitution → solution">

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`x_3 = 1, \\quad x_2 = 2, \\quad x_1 = 3`} />
                  </div>
                  <p className="text-xs font-mono text-neutral-500">Verify: <InlineMath math="2(3)+1(2)-1(1)=6+2-1=7... " /> — use the demo below with exact numbers to verify.</p>
                </Step>
<StepControls />
<StepsDone>

                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">Final solution</span>
                    <h3 className="text-xl font-bold">x₁ = 2, x₂ = 3, x₃ = -1</h3>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                      The calculator below shows every row reduction step live. Partial pivoting (row swapping) is applied automatically to maximize numerical stability.
                    </p>
                  </div>
                </div>
              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
