'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import JacobiMethod from './algorithems.jacobi-method';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function JacobiMethodPage() {
  return (
    <>
      <Head>
        <title>Jacobi Iterative Method | Netz</title>
        <meta name="description" content="Master the Jacobi Iterative Method — solve systems of linear equations by repeatedly updating variable estimates until convergence." />
      </Head>

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
                  The <strong>Jacobi Method</strong> is an iterative solver for systems <InlineMath math="Ax = b" />. Starting from an initial guess (typically <InlineMath math="x^{(0)} = 0" />), each variable is updated simultaneously using the previous iteration's values — converging when the matrix <InlineMath math="A" /> is <strong>strictly diagonally dominant</strong>.
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
                  <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">Expected solution: x₁ = 1, x₂ = 2, x₃ = -1</p>
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
              </div>

              {/* Interactive Calculator */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <JacobiMethod />
              </div>

              <AlgorithmNavigation />
            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}
