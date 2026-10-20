'use client';

import MethodShell from '@/app/components/algorithms/MethodShell';
import React from 'react';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import GaussJordan from './algorithems.gauss-jordan';

export default function GaussJordanPage() {
  return (
    <>

      <MethodShell route="/gauss-jordan" steps={0} solve={<GaussJordan />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Gauss-Jordan Elimination</strong> extends Gaussian Elimination by also eliminating elements <em>above</em> each pivot — reducing the augmented matrix to <strong>Reduced Row Echelon Form (RREF)</strong>. The solution is read off directly with <em>no back substitution</em> needed. It also forms the basis for computing matrix inverses.
                </p>

              {/* Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">Difference from Gauss elimination</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">RREF target</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold uppercase text-neutral-500">Gauss (Upper Triangular)</p>
                      <div className="overflow-x-auto text-center">
                        <BlockMath math={`\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 0 & 0 & 1 \\end{pmatrix}`} />
                      </div>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Needs back substitution to find x</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold uppercase text-neutral-500">Gauss-Jordan (RREF)</p>
                      <div className="overflow-x-auto text-center">
                        <BlockMath math={`\\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}`} />
                      </div>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Solution reads directly: <InlineMath math="x = b'" /></p>
                    </div>
                  </div>
                </div>
              </div>

            </MethodShell>
    </>
  );
}
