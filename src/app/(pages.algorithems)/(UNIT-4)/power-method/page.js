'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PowerMethodCalculator from './algorithems.power-method';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What does the power method find?',
    a: <>The dominant eigenvalue (the one with the largest size) of a square matrix, and its eigenvector. Repeatedly multiplying any starting vector by A makes the dominant direction take over.</>,
  },
  {
    q: 'How do you find the smallest eigenvalue?',
    a: <>Use the inverse power method: run the power method on <InlineMath math="A^{-1}" />. Its largest eigenvalue is <InlineMath math="1/\lambda_{\min}" /> of A, so take the reciprocal.</>,
  },
  {
    q: 'When does the power method fail or go slowly?',
    a: <>When two eigenvalues have the same size (like 3 and −3) it can&apos;t settle, and when the top two are close it converges slowly. A starting vector with no part in the dominant direction can also cause trouble; the default of all 1s usually works.</>,
  },
];

export default function PowerMethodPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • LINEAR ALGEBRA & MATRIX METHODS" title="Power Method" subtitle="Dominant Eigenvalue">
        The <strong>power method</strong> finds the largest eigenvalue of a matrix: multiply a vector by A again and again, rescaling each time so its biggest entry is 1. The scale factor settles on the eigenvalue <InlineMath math="\lambda" /> and the vector on its eigenvector.
      </MethodHeader>

      <FormulaBox label="ONE ITERATION" tag="LARGEST |λ|">
        <Formula math={`y^{(k)} = A\\,x^{(k-1)}, \\qquad \\lambda^{(k)} = \\text{largest entry of } y^{(k)}, \\qquad x^{(k)} = \\frac{y^{(k)}}{\\lambda^{(k)}}`} />
        <FormulaSteps
          steps={[
            { title: '1. Multiply', text: <>Work out <InlineMath math="y = Ax" />.</> },
            { title: '2. Scale', text: <>Take the entry of y with the biggest size as λ, and divide y by it.</> },
            { title: '3. Repeat', text: <>Stop when λ stops changing; the vector is the eigenvector.</> },
          ]}
        />
        <SymbolKey rows={EX['power-method'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['power-method'].example} />
      <CommonMistakes items={EX['power-method'].mistakes} />

      <Lab heading="Interactive Power Method Calculator">
        <PowerMethodCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['matrix-inverse', 'determinant', 'gauss-jordan', 'matrix-calculator']} />
    </MethodPage>
  );
}
