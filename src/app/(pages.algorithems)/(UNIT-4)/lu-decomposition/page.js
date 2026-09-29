'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import LUDecomposition from './algorithems.lu-decomposition';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function LUDecompositionPage() {
  return (
    <>
      <Head>
        <title>LU Decomposition | Netz</title>
        <meta name="description" content="Master LU Decomposition (Doolittle method) — factorize any square matrix into lower and upper triangular matrices and solve Ax=b efficiently." />
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
                  LU Decomposition <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Doolittle Method Guide</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>LU Decomposition</strong> factors any square matrix <InlineMath math="A = LU" /> where <InlineMath math="L" /> is lower triangular (with 1s on diagonal) and <InlineMath math="U" /> is upper triangular. Once factored, solving <InlineMath math="Ax = b" /> becomes two simple triangular solves — making it ideal for <em>multiple right-hand side problems</em>.
                </p>
              </div>

              {/* Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">TWO-PHASE SOLVE STRATEGY</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">A = LU</span>
                  </div>
                  <div className="py-4 text-center overflow-x-auto space-y-3">
                    <BlockMath math={`A = LU \\implies Ax = b \\implies LUx = b`} />
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Let <InlineMath math="y = Ux" />, then solve in two steps:</p>
                    <BlockMath math={`\\text{Phase 1: } Ly = b \\quad \\text{(forward substitution)}`} />
                    <BlockMath math={`\\text{Phase 2: } Ux = y \\quad \\text{(back substitution)}`} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">Doolittle vs Crout</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Doolittle: L has 1s on diagonal. Crout: U has 1s on diagonal. Both are equivalent.</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">Key Advantage</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">Factor A once, then solve for any number of different <InlineMath math="b" /> vectors efficiently.</span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="block mb-1">When to Use</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">FEM/FEA, circuit analysis, structural mechanics — any repeated solve with fixed A.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Calculator */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <LUDecomposition />
              </div>

              <AlgorithmNavigation />
            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}
