'use client';

import MethodShell from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import LUDecomposition from './algorithems.lu-decomposition';

export default function LUDecompositionPage() {
  return (
    <>

      <MethodShell route="/lu-decomposition" steps={0} solve={<LUDecomposition />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>LU Decomposition</strong> factors any square matrix <InlineMath math="A = LU" /> where <InlineMath math="L" /> is lower triangular (with 1s on diagonal) and <InlineMath math="U" /> is upper triangular. Once factored, solving <InlineMath math="Ax = b" /> becomes two simple triangular solves — making it ideal for <em>multiple right-hand side problems</em>.
                </p>

              {/* Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">Two-phase solve strategy</span>
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

            </MethodShell>
    </>
  );
}
