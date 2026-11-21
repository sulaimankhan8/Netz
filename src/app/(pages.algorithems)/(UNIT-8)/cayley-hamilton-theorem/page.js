'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CayleyHamiltonCalculator from './algorithems.cayley-hamilton-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does the theorem say?', a: <>Every square matrix satisfies its own characteristic equation: if <InlineMath math="|A - \lambda I| = 0" /> is <InlineMath math="\lambda^2 - 5\lambda - 2 = 0" />, then <InlineMath math="A^2 - 5A - 2I = O" />. The constant term becomes a multiple of I.</> },
  { q: 'How does it give the inverse?', a: <>Multiply the matrix equation by <InlineMath math="A^{-1}" />: each power drops by one and the constant term gives a multiple of <InlineMath math="A^{-1}" />, which you then solve for. No cofactors needed.</> },
  { q: 'Can it find high powers like A⁵?', a: <>Yes: Aⁿ can be written using lower powers repeatedly. For a 2×2 matrix with <InlineMath math="A^2 = 5A + 2I" />, <InlineMath math="A^3 = 5A^2 + 2A = 27A + 10I" />, and so on.</> },
];

export default function CayleyHamiltonPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES" title="Cayley–Hamilton Theorem" subtitle="Verify p(A) = O and Find A⁻¹">
        The <strong>Cayley–Hamilton theorem</strong>: every square matrix satisfies its own characteristic equation. Replace λ by A in <InlineMath math="|A - \lambda I| = 0" /> and you get the zero matrix, which also gives a quick formula for <InlineMath math="A^{-1}" />.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="p(A) = O">
        <Formula math={`p(\\lambda) = \\lambda^n + c_{n-1}\\lambda^{n-1} + \\cdots + c_0 \\ \\Rightarrow \\ A^n + c_{n-1}A^{n-1} + \\cdots + c_0I = O`} />
        <FormulaSteps steps={[
          { title: '1. Characteristic equation', text: <>Find p(λ) = |A − λI|.</> },
          { title: '2. Verify', text: <>Compute A², A³ … and check p(A) = O.</> },
          { title: '3. Inverse', text: <>Multiply by A⁻¹ and rearrange.</> },
        ]} />
        <SymbolKey rows={EX['cayley-hamilton-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['cayley-hamilton-theorem'].example} />
      <CommonMistakes items={EX['cayley-hamilton-theorem'].mistakes} />
      <Lab heading="Interactive Cayley–Hamilton Calculator"><CayleyHamiltonCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['eigenvalues', 'matrix-inverse', 'matrix-calculator']} />
    </MethodPage>
  );
}
