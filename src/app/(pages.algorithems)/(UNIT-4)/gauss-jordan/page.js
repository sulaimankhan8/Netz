'use client';

import React from 'react';
import Head from 'next/head';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussJordan from './algorithems.gauss-jordan';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function GaussJordanPage() {
  return (
    <>
      <Head>
        <title>Gauss-Jordan Elimination | Netz</title>
        <meta name="description" content="Master Gauss-Jordan Elimination — reduce augmented matrices to RREF to solve linear systems without back substitution." />
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
                  Gauss-Jordan Elimination <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Step-by-Step Friendly Guide</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Gauss-Jordan Elimination</strong> extends Gaussian Elimination by also eliminating elements <em>above</em> each pivot — reducing the augmented matrix to <strong>Reduced Row Echelon Form (RREF)</strong>. The solution is read off directly with <em>no back substitution</em> needed. It also forms the basis for computing matrix inverses.
                </p>
              </div>

              {/* Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest">DIFFERENCE FROM GAUSS ELIMINATION</span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">RREF TARGET</span>
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

              {/* Interactive Calculator */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <GaussJordan />
              </div>

              <AlgorithmNavigation />
            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}
