'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixInverseCalculator from './algorithems.matrix-inverse';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How do you find the inverse of a matrix?',
    a: <>Check <InlineMath math="|A| \neq 0" />, find the cofactor of every entry, transpose that cofactor matrix to get the adjoint, then divide by the determinant: <InlineMath math="A^{-1} = \frac{1}{|A|}\operatorname{adj} A" />. For bigger matrices, row-reduce <InlineMath math="[A \mid I]" /> to <InlineMath math="[I \mid A^{-1}]" /> (Gauss-Jordan).</>,
  },
  {
    q: 'What is the formula for the inverse of a 2×2 matrix?',
    a: <>Swap the diagonal entries, change the signs of the other two, and divide by the determinant: <InlineMath math="\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}" />.</>,
  },
  {
    q: 'When does a matrix have no inverse?',
    a: <>When its determinant is 0 (a singular matrix). Only square matrices can have an inverse.</>,
  },
  {
    q: 'What is the difference between the adjoint and the inverse?',
    a: <>The adjoint (adjugate) is the transpose of the cofactor matrix. The inverse is the adjoint divided by the determinant, so <InlineMath math="A \cdot \operatorname{adj} A = |A|\, I" /> while <InlineMath math="A \cdot A^{-1} = I" />.</>,
  },
];

export default function MatrixInversePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES & LINEAR ALGEBRA" title="Inverse of a Matrix" subtitle="Adjoint & Gauss-Jordan Methods">
        The <strong>inverse</strong> <InlineMath math="A^{-1}" /> of a square matrix is the matrix with <InlineMath math="A A^{-1} = I" />. Find it as <InlineMath math="A^{-1} = \frac{1}{|A|}\operatorname{adj} A." /> It exists only when <InlineMath math="|A| \neq 0" />.
      </MethodHeader>

      <FormulaBox label="HOW THE INVERSE IS FOUND" tag="NEEDS |A| ≠ 0">
        <Formula math={`A^{-1} = \\frac{1}{|A|}\\,\\operatorname{adj} A, \\qquad \\operatorname{adj} A = \\left[ C_{ij} \\right]^{T}, \\quad C_{ij} = (-1)^{i+j} M_{ij}`} />
        <FormulaSteps
          steps={[
            { title: '1. Determinant', text: <>Find <InlineMath math="|A|" />. If it is 0, stop: there is no inverse.</> },
            { title: '2. Cofactors', text: <>For each entry, <InlineMath math="C_{ij}" /> = its minor with sign <InlineMath math="(-1)^{i+j}" />.</> },
            { title: '3. Adjoint ÷ |A|', text: <>Transpose the cofactor matrix to get <InlineMath math="\operatorname{adj} A" />, then divide every entry by <InlineMath math="|A|" />.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="A^{-1}" /> for <InlineMath math="A = \begin{bmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 5 & 6 & 0 \end{bmatrix}" />.
        </ExampleProblem>

        <ExampleStep n={1} title="DETERMINANT">
          <StepText>Expand along row 1:</StepText>
          <MathPanel>
            <BlockMath math="|A| = 1(0 - 24) - 2(0 - 20) + 3(0 - 5) = -24 + 40 - 15 = 1" />
          </MathPanel>
          <StepText>|A| = 1 ≠ 0, so the inverse exists.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="COFACTORS">
          <MathPanel>
            <BlockMath math="C_{11} = -24,\quad C_{12} = 20,\quad C_{13} = -5" />
            <BlockMath math="C_{21} = 18,\quad C_{22} = -15,\quad C_{23} = 4" />
            <BlockMath math="C_{31} = 5,\quad C_{32} = -4,\quad C_{33} = 1" />
          </MathPanel>
          <StepText>For example, <InlineMath math="C_{12} = -\begin{vmatrix} 0 & 4 \\ 5 & 0 \end{vmatrix} = -(0 - 20) = 20" />.</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="ADJOINT (TRANSPOSE THE COFACTORS)">
          <MathPanel>
            <BlockMath math="\operatorname{adj} A = \begin{bmatrix} -24 & 20 & -5 \\ 18 & -15 & 4 \\ 5 & -4 & 1 \end{bmatrix}^{T} = \begin{bmatrix} -24 & 18 & 5 \\ 20 & -15 & -4 \\ -5 & 4 & 1 \end{bmatrix}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={4} title="DIVIDE BY |A| AND CHECK">
          <MathPanel>
            <BlockMath math="A^{-1} = \frac{1}{1}\operatorname{adj} A = \begin{bmatrix} -24 & 18 & 5 \\ 20 & -15 & -4 \\ -5 & 4 & 1 \end{bmatrix}" />
            <BlockMath math="\text{Row 1 of } A \cdot \text{column 1 of } A^{-1} = (1)(-24) + (2)(20) + (3)(-5) = 1 \ \checkmark" />
          </MathPanel>
        </ExampleStep>

        <Conclusion
          result="A⁻¹ = adj A, since |A| = 1"
          math={<BlockMath math="A^{-1} = \begin{bmatrix} -24 & 18 & 5 \\ 20 & -15 & -4 \\ -5 & 4 & 1 \end{bmatrix}" />}
        >
          Multiplying A by this matrix gives the identity matrix I.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Inverse Calculator">
        <MatrixInverseCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['determinant', 'rank', 'gauss-jordan', 'matrix-calculator']} />
    </MethodPage>
  );
}
