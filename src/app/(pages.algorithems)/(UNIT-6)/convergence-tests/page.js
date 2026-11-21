'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.convergence-tests';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Which test should I try first?', a: <>Check that aₙ → 0 (if not, it diverges). Then: geometric or p-series if it looks like one; the ratio test for factorials and powers like 3ⁿ; comparison with 1/nᵖ for fractions of polynomials; the alternating series test for (−1)ⁿ.</> },
  { q: 'What if the ratio test gives 1?', a: <>Then it decides nothing. Σ1/n (diverges) and Σ1/n² (converges) both give 1. Use a comparison or the integral test instead.</> },
  { q: 'What is the difference between absolute and conditional convergence?', a: <>Σaₙ converges absolutely if Σ|aₙ| converges. Σ(−1)ⁿ/n converges, but Σ1/n doesn&apos;t, so it converges only conditionally.</> },
];

export default function ConvergencePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • SERIES" title="Series Convergence Tests" subtitle="Ratio, Root, Comparison, p-Series and Alternating">
        Does <InlineMath math="\sum a_n" /> converge? The calculator runs the standard <strong>convergence tests</strong> in the textbook order and stops at the first one that decides, showing each limit.
      </MethodHeader>
      <FormulaBox label="THE MAIN TESTS" tag="L = lim">
        <Formula math={'\\text{Ratio: } \\lim\\left|\\frac{a_{n+1}}{a_n}\\right| = L, \\quad \\text{Root: } \\lim |a_n|^{1/n} = L \\qquad L < 1 \\text{ converges}, \\ L > 1 \\text{ diverges}'} />
        <FormulaSteps steps={[
          { title: '1. nth term', text: <>If aₙ ↛ 0, it diverges.</> },
          { title: '2. Standard series', text: <>Geometric or p-series.</> },
          { title: '3. Tests', text: <>Ratio, root, comparison, alternating.</> },
        ]} />
        <SymbolKey rows={EX['convergence-tests'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['convergence-tests'].example} />
      <CommonMistakes items={EX['convergence-tests'].mistakes} />
      <Lab heading="Interactive Convergence Test Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['power-series', 'limit', 'taylor-series']} />
    </MethodPage>
  );
}
