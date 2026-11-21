'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.svd-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How is it different from diagonalisation?", a: <>It works for any matrix, square or not, and always uses orthogonal U and V.</> },
  { q: "What does σ₁ mean?", a: <>The largest stretch A gives to a unit vector: ‖A‖₂ = σ₁.</> },
  { q: "Where is it used?", a: <>Least squares, image compression (keep the largest σ), principal component analysis and the pseudo-inverse.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES" title="Singular Value Decomposition Calculator" subtitle="A = UΣVᵀ, Step by Step">
        Every matrix factors as <InlineMath math={"A = U\\Sigma V^T"} /> with <InlineMath math={"U"} />, <InlineMath math={"V"} /> orthogonal and <InlineMath math={"\\Sigma"} /> diagonal. The <strong>singular values</strong> <InlineMath math={"\\sigma_i"} /> are the square roots of the eigenvalues of <InlineMath math={"A^TA"} />; the number of non-zero ones is the rank.
      </MethodHeader>
      <FormulaBox label="THE RECIPE" tag="σ = √λ">
        <Formula math={"A^TA = V\\Lambda V^T, \\qquad \\sigma_i = \\sqrt{\\lambda_i}, \\qquad u_i = \\frac{Av_i}{\\sigma_i}"} />
        <FormulaSteps steps={[
          { title: "1. AᵀA", text: <>Its eigenvalues and eigenvectors.</> },
          { title: "2. σ and V", text: <>σᵢ = √λᵢ, the vᵢ.</> },
          { title: "3. U", text: <>uᵢ = Avᵢ/σᵢ, completed.</> },
        ]} />
        <SymbolKey rows={EX['svd-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['svd-calculator'].example} />
      <CommonMistakes items={EX['svd-calculator'].mistakes} />
      <Lab heading="Interactive SVD Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["eigenvalues","diagonalization","qr"]} />
    </MethodPage>
  );
}
