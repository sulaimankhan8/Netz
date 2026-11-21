'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import GaussJordan from './algorithems.gauss-jordan';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';
import { gaussJordan as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes, WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion } from '@/app/components/method';

export default function GaussJordanPage() {
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

                  {/* The two row operations used for every column */}
                  <div className="py-2 text-center overflow-x-auto space-y-1">
                    <BlockMath math={`R_k \\leftarrow \\frac{R_k}{a_{kk}} \\quad (\\text{make the pivot } 1), \\qquad R_i \\leftarrow R_i - a_{ik}R_k \\quad (\\text{every other row } i)`} />
                  </div>

                  {/* What each symbol means */}
                  <SymbolKey rows={[
                    { s: '[A \\mid b]', t: 'The augmented matrix: the coefficients with the right-hand sides as an extra column.', e: '[2\\ 1\\ 1 \\mid 10]' },
                    { s: 'a_{kk}', t: 'The pivot: the diagonal entry of the column being cleared.', e: 'a_{11} = 2' },
                    { s: 'R_k / a_{kk}', t: 'Divide the pivot row by its pivot so the pivot becomes 1.', e: 'R_1 / 2' },
                    { s: 'R_i - a_{ik}R_k', t: 'Clear the column in every other row, above and below the pivot.', e: 'R_2 - 3R_1' },
                    { s: '[I \\mid x]', t: 'Reduced row echelon form: the identity on the left, the answer in the last column.', e: 'x = 7' },
                  ]} />
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <WorkedExample>
                <ExampleProblem>
                  Solve <InlineMath math="2x + y + z = 10,\ 3x + 2y + 3z = 18,\ x + 4y + 9z = 16" /> by Gauss-Jordan elimination.
                </ExampleProblem>
                <ExampleStep n={1} title="WRITE THE AUGMENTED MATRIX">
                  <MathPanel>
                    <BlockMath math={`\\left[\\begin{array}{ccc|c} 2 & 1 & 1 & 10 \\\\ 3 & 2 & 3 & 18 \\\\ 1 & 4 & 9 & 16 \\end{array}\\right]`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={2} title="COLUMN 1: PIVOT 2">
                  <MathPanel>
                    <BlockMath math={`R_1 \\div 2: \\ [1,\\ 0.5,\\ 0.5 \\mid 5]`} />
                    <BlockMath math={`R_2 - 3R_1: \\ [3 - 3,\\ 2 - 1.5,\\ 3 - 1.5 \\mid 18 - 15] = [0,\\ 0.5,\\ 1.5 \\mid 3]`} />
                    <BlockMath math={`R_3 - R_1: \\ [1 - 1,\\ 4 - 0.5,\\ 9 - 0.5 \\mid 16 - 5] = [0,\\ 3.5,\\ 8.5 \\mid 11]`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={3} title="COLUMN 2: PIVOT 0.5">
                  <MathPanel>
                    <BlockMath math={`R_2 \\div 0.5: \\ [0,\\ 1,\\ 3 \\mid 6]`} />
                    <BlockMath math={`R_1 - 0.5R_2: \\ [1,\\ 0,\\ 0.5 - 1.5 \\mid 5 - 3] = [1,\\ 0,\\ -1 \\mid 2]`} />
                    <BlockMath math={`R_3 - 3.5R_2: \\ [0,\\ 0,\\ 8.5 - 10.5 \\mid 11 - 21] = [0,\\ 0,\\ -2 \\mid -10]`} />
                  </MathPanel>
                  <StepText>Unlike Gauss elimination, row 1 above the pivot is cleared too.</StepText>
                </ExampleStep>
                <ExampleStep n={4} title="COLUMN 3: PIVOT −2">
                  <MathPanel>
                    <BlockMath math={`R_3 \\div (-2): \\ [0,\\ 0,\\ 1 \\mid 5]`} />
                    <BlockMath math={`R_1 + R_3: \\ [1,\\ 0,\\ 0 \\mid 7], \\qquad R_2 - 3R_3: \\ [0,\\ 1,\\ 0 \\mid 6 - 15] = [0,\\ 1,\\ 0 \\mid -9]`} />
                  </MathPanel>
                </ExampleStep>
                <ExampleStep n={5} title="READ OFF THE ANSWER">
                  <MathPanel>
                    <BlockMath math={`\\left[\\begin{array}{ccc|c} 1 & 0 & 0 & 7 \\\\ 0 & 1 & 0 & -9 \\\\ 0 & 0 & 1 & 5 \\end{array}\\right] \\quad\\Rightarrow\\quad x = 7,\\ y = -9,\\ z = 5`} />
                  </MathPanel>
                  <StepText>Check in equation 2: <InlineMath math="3(7) + 2(-9) + 3(5) = 21 - 18 + 15 = 18" /> ✓</StepText>
                </ExampleStep>
                <Conclusion result="x = 7, y = −9, z = 5" math={<BlockMath math="(x, y, z) = (7, -9, 5)" />}>
                  No back substitution was needed: the identity on the left means each row already reads &quot;variable = number&quot;.
                </Conclusion>
              </WorkedExample>

              {/* Common Mistakes */}
              <CommonMistakes items={[
                { m: <>Clearing only below the pivot.</>, f: <>Gauss-Jordan clears the column above and below, so the left part ends as the identity.</> },
                { m: <>Forgetting to make the pivot 1.</>, f: <>Divide the pivot row by its pivot first; then each multiplier is just the entry to remove.</> },
                { m: <>Using an old copy of a row.</>, f: <>Always use the latest version of the pivot row (after dividing).</> },
                { m: <>Not applying the operation to the right-hand side.</>, f: <>Every entry of the row changes, including the last column.</> },
                { m: <>Dividing by a zero pivot.</>, f: <>Swap in a lower row with a non-zero entry in that column first.</> },
                { m: <>Writing only the final answer.</>, f: <>Name each row operation and show the matrix after every column.</> },
              ]} />

              {/* Interactive Calculator */}
              <div id="calculator" className="scroll-mt-24 pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">LABORATORY</div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Interactive Live Calculator</h2>
                <GaussJordan />
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
