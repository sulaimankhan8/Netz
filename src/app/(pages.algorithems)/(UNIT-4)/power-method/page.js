'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PowerMethodCalculator from './algorithems.power-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the dominant eigenvalue and eigenvector of <InlineMath math="A = \begin{bmatrix} 1 & 6 & 1 \\ 1 & 2 & 0 \\ 0 & 0 & 3 \end{bmatrix}" />, starting from <InlineMath math="x^{(0)} = [1, 0, 0]^T" />.
        </ExampleProblem>

        <ExampleStep n={1} title="FIRST TWO ITERATIONS">
          <MathPanel>
            <BlockMath math="A\,x^{(0)} = [1, 1, 0]^T \Rightarrow \lambda = 1, \quad x^{(1)} = [1, 1, 0]^T" />
            <BlockMath math="A\,x^{(1)} = [7, 3, 0]^T \Rightarrow \lambda = 7, \quad x^{(2)} = [1, 0.4286, 0]^T" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="KEEP GOING">
          <MathPanel>
            <BlockMath math="A\,x^{(2)} = [3.5714, 1.8571, 0]^T \Rightarrow \lambda = 3.5714, \quad x^{(3)} = [1, 0.52, 0]^T" />
            <BlockMath math="A\,x^{(3)} = [4.12, 2.04, 0]^T \Rightarrow \lambda = 4.12" />
          </MathPanel>
          <StepText>The estimates swing around 4 and settle there after about ten iterations.</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="CHECK">
          <MathPanel>
            <BlockMath math="A\begin{bmatrix} 1 \\ 0.5 \\ 0 \end{bmatrix} = \begin{bmatrix} 1 + 3 \\ 1 + 1 \\ 0 \end{bmatrix} = 4\begin{bmatrix} 1 \\ 0.5 \\ 0 \end{bmatrix} \ \checkmark" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="λ = 4, eigenvector [1, 0.5, 0]" math={<BlockMath math="\lambda_{\max} = 4, \qquad x = [1,\ 0.5,\ 0]^T" />}>
          The calculator below opens on this matrix. Switch to "smallest" for the inverse power method.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Power Method Calculator">
        <PowerMethodCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['matrix-inverse', 'determinant', 'gauss-jordan', 'matrix-calculator']} />
    </MethodPage>
  );
}
