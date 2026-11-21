'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import EigenvalueCalculator from './algorithems.eigenvalues-eigenvectors';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is an eigenvector?', a: <>A non-zero vector that A only stretches (or flips), without turning: <InlineMath math="AX = \lambda X" />. The stretch factor λ is the eigenvalue.</> },
  { q: 'Is there a quick check?', a: <>The sum of the eigenvalues equals the trace (sum of the diagonal), and their product equals |A|. For <InlineMath math="\begin{bmatrix} 4 & 1 \\ 2 & 3 \end{bmatrix}" />: 2 + 5 = 7 = 4 + 3 and 2 × 5 = 10 = |A|.</> },
  { q: 'Why can an eigenvector be multiplied by any number?', a: <>If AX = λX then A(tX) = λ(tX) too. So the answer is a whole line of vectors; the calculator gives the simplest one with whole numbers.</> },
];

export default function EigenvaluesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES" title="Eigenvalues & Eigenvectors" subtitle="Characteristic Equation, Step by Step">
        The <strong>eigenvalues</strong> of A are the roots of the characteristic equation <InlineMath math="|A - \lambda I| = 0" />. For each one, the <strong>eigenvectors</strong> are the non-zero solutions of <InlineMath math="(A - \lambda I)X = 0" />.
      </MethodHeader>
      <FormulaBox label="THE CHARACTERISTIC EQUATION" tag="|A − λI| = 0">
        <Formula math={`\\lambda^3 - S_1\\lambda^2 + S_2\\lambda - |A| = 0, \\qquad S_1 = \\text{tr}\\,A, \\ S_2 = \\text{sum of 2×2 principal minors}`} />
        <FormulaSteps steps={[
          { title: '1. Characteristic equation', text: <>Expand |A − λI| (or use the trace and minors).</> },
          { title: '2. Eigenvalues', text: <>Solve it: factor, or use the factor theorem.</> },
          { title: '3. Eigenvectors', text: <>For each λ, row-reduce A − λI and solve.</> },
        ]} />
        <SymbolKey rows={EX['eigenvalues-eigenvectors'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['eigenvalues-eigenvectors'].example} />
      <CommonMistakes items={EX['eigenvalues-eigenvectors'].mistakes} />
      <Lab heading="Interactive Eigenvalue Calculator"><EigenvalueCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['cayley-hamilton', 'power-method', 'determinant']} />
    </MethodPage>
  );
}
