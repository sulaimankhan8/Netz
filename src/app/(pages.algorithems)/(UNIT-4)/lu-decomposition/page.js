'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import LUDecomposition from './algorithems.lu-decomposition';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import { lu as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes, WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion } from '@/app/components/method';

export default function LUDecompositionPage() {
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

                  {/* Doolittle's formulas */}
                  <div className="py-2 text-center overflow-x-auto space-y-1">
                    <BlockMath math={`u_{ij} = a_{ij} - \\sum_{k<i} l_{ik}u_{kj} \\ (j \\ge i), \\qquad l_{ij} = \\frac{a_{ij} - \\sum_{k<j} l_{ik}u_{kj}}{u_{jj}} \\ (i > j), \\qquad l_{ii} = 1`} />
                  </div>

                  {/* What each symbol means */}
                  <SymbolKey rows={[
                    { s: 'L', t: 'Lower triangular: zeros above the diagonal; Doolittle puts 1s on its diagonal. It holds the multipliers of Gauss elimination.', e: 'l_{21} = 1.5' },
                    { s: 'U', t: 'Upper triangular: zeros below the diagonal. It is the matrix Gauss elimination ends with.', e: 'u_{11} = 2' },
                    { s: 'y', t: 'The in-between vector: solve Ly = b first (top to bottom).', e: 'y = (10,\\ 3,\\ -10)' },
                    { s: 'x', t: 'The answer: solve Ux = y (bottom to top).', e: 'x = (7,\\ -9,\\ 5)' },
                    { s: 'u_{ij},\\ l_{ij}', t: 'Each entry comes from the matching entry of A minus what the earlier entries already account for.', e: 'u_{22} = 2 - 1.5(1) = 0.5' },
                  ]} />
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <WorkedExample>
                <ExampleProblem>
                  Solve <InlineMath math="2x + y + z = 10,\ 3x + 2y + 3z = 18,\ x + 4y + 9z = 16" /> by LU decomposition (Doolittle).
                </ExampleProblem>
                <ExampleStep n={1} title="ROW 1 OF U AND COLUMN 1 OF L">
                  <MathPanel>
                    <BlockMath math={`u_{11} = 2,\\quad u_{12} = 1,\\quad u_{13} = 1 \\qquad (\\text{row 1 of } A)`} />
                    <BlockMath math={`l_{21} = \\frac{a_{21}}{u_{11}} = \\frac32 = 1.5, \\qquad l_{31} = \\frac{a_{31}}{u_{11}} = \\frac12 = 0.5`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={2} title="ROW 2 OF U AND COLUMN 2 OF L">
                  <MathPanel>
                    <BlockMath math={`u_{22} = a_{22} - l_{21}u_{12} = 2 - 1.5(1) = 0.5, \\qquad u_{23} = a_{23} - l_{21}u_{13} = 3 - 1.5(1) = 1.5`} />
                    <BlockMath math={`l_{32} = \\frac{a_{32} - l_{31}u_{12}}{u_{22}} = \\frac{4 - 0.5(1)}{0.5} = 7`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={3} title="THE LAST ENTRY AND THE FACTORS">
                  <MathPanel>
                    <BlockMath math={`u_{33} = a_{33} - l_{31}u_{13} - l_{32}u_{23} = 9 - 0.5(1) - 7(1.5) = -2`} />
                    <BlockMath math={`L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 1.5 & 1 & 0 \\\\ 0.5 & 7 & 1 \\end{bmatrix}, \\qquad U = \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 0.5 & 1.5 \\\\ 0 & 0 & -2 \\end{bmatrix}`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={4} title="PHASE 1: FORWARD SUBSTITUTION Ly = b">
                  <MathPanel>
                    <BlockMath math={`y_1 = 10, \\qquad y_2 = 18 - 1.5(10) = 3, \\qquad y_3 = 16 - 0.5(10) - 7(3) = -10`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={5} title="PHASE 2: BACK SUBSTITUTION Ux = y">
                  <MathPanel>
                    <BlockMath math={`-2z = -10 \\Rightarrow z = 5, \\qquad 0.5y + 1.5(5) = 3 \\Rightarrow y = -9, \\qquad 2x - 9 + 5 = 10 \\Rightarrow x = 7`} />
                  </MathPanel>
                  <StepText>Check: <InlineMath math="LU" /> multiplied out gives back A (e.g. row 3: <InlineMath math="0.5(2) = 1,\ 0.5(1) + 7(0.5) = 4,\ 0.5 + 10.5 - 2 = 9" /> ✓).</StepText>
                </ExampleStep>
                <Conclusion result="x = 7, y = −9, z = 5" math={<BlockMath math="(x, y, z) = (7, -9, 5)" />}>
                  A second right-hand side would only need the two quick substitutions, not a new factorisation.
                </Conclusion>
              </WorkedExample>

              {/* Common Mistakes */}
              <CommonMistakes items={[
                { m: <>Solving Ux = b directly.</>, f: <>First Ly = b (forward), then Ux = y (backward).</> },
                { m: <>Mixing Doolittle and Crout.</>, f: <>Doolittle puts the 1s on L&apos;s diagonal, Crout on U&apos;s. Choose one and keep it.</> },
                { m: <>Working out entries in the wrong order.</>, f: <>Row i of U, then column i of L: each entry needs the ones before it.</> },
                { m: <>Forgetting to subtract the earlier products.</>, f: <><InlineMath math="u_{33} = a_{33} - l_{31}u_{13} - l_{32}u_{23}" />, not just <InlineMath math="a_{33}" />.</> },
                { m: <>A zero pivot (u₁₁ = 0).</>, f: <>Swap rows first (LU with pivoting, PA = LU).</> },
                { m: <>Writing only the final answer.</>, f: <>Show every entry of L and U with its formula, then both substitutions.</> },
              ]} />

              {/* Interactive Calculator */}
              <div id="calculator" className="scroll-mt-24 pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <LUDecomposition />
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
