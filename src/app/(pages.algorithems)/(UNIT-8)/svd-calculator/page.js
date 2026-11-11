'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.svd-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the SVD of A = [3 2 2; 2 3 −2].</ExampleProblem>
        <ExampleStep n={1} title="AᵀA"><MathPanel><BlockMath math={"A^TA = \\begin{bmatrix} 13 & 12 & 2 \\\\ 12 & 13 & -2 \\\\ 2 & -2 & 8 \\end{bmatrix}, \\quad \\lambda = 25, 9, 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SINGULAR VALUES"><MathPanel><BlockMath math={"\\sigma_1 = 5, \\ \\sigma_2 = 3"} /></MathPanel><StepText>The rank is 2.</StepText></ExampleStep>
        <ExampleStep n={3} title="U"><MathPanel><BlockMath math={"u_1 = \\frac{Av_1}{5} = \\tfrac{1}{\\sqrt2}(1, 1), \\quad u_2 = \\frac{Av_2}{3} = \\tfrac{1}{\\sqrt2}(1, -1)"} /></MathPanel></ExampleStep>
        <Conclusion result="σ = 5, 3" math={<BlockMath math={"\\Sigma = \\begin{bmatrix} 5 & 0 & 0 \\\\ 0 & 3 & 0 \\end{bmatrix}"} />}>The calculator below opens on this matrix.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive SVD Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["eigenvalues","diagonalization","qr"]} />
    </MethodPage>
  );
}
