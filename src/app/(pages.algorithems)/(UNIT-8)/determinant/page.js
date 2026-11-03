'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DeterminantCalculator from './algorithems.determinant';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the determinant of a matrix?',
    a: <>A single number worked out from a square matrix. For a 2×2 matrix it is <InlineMath math="ad - bc" />. It tells you whether the matrix has an inverse (only when <InlineMath math="|A| \neq 0" />) and how the matrix scales area or volume.</>,
  },
  {
    q: 'How do you find the determinant of a 3×3 matrix?',
    a: <>Expand along the first row: take each entry, multiply it by the 2×2 determinant left when you cross out its row and column (its minor), give the three terms the signs + − +, and add them. Row reduction to a triangular matrix gives the same answer.</>,
  },
  {
    q: 'What does a determinant of 0 mean?',
    a: <>The matrix is singular: it has no inverse, its rows are linearly dependent, and a system <InlineMath math="Ax = b" /> with this matrix has either no solution or infinitely many.</>,
  },
  {
    q: 'What happens to the determinant when you swap two rows?',
    a: <>It changes sign. Adding a multiple of one row to another leaves it unchanged, and multiplying a row by k multiplies the determinant by k. These rules are what make row reduction work.</>,
  },
];

export default function DeterminantPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES & LINEAR ALGEBRA" title="Determinant" subtitle="Cofactor Expansion & Row Reduction">
        The <strong>determinant</strong> <InlineMath math="|A|" /> of a square matrix is a single number: <InlineMath math="ad - bc" /> for a 2×2 matrix, and for bigger matrices you expand along a row using cofactors. If <InlineMath math="|A| = 0" />, the matrix has no inverse.
      </MethodHeader>

      <FormulaBox label="HOW A DETERMINANT IS FOUND" tag="SQUARE MATRICES ONLY">
        <Formula math={`\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc \\qquad |A| = \\sum_{j=1}^{n} (-1)^{1+j}\\, a_{1j}\\, M_{1j}`} />
        <FormulaSteps
          steps={[
            { title: '1. Pick a Row', text: <>Usually row 1 (or the row with the most zeros, so there is less to work out).</> },
            { title: '2. Find Each Minor', text: <>Cross out the entry&apos;s row and column; <InlineMath math="M_{1j}" /> is the determinant of what is left.</> },
            { title: '3. Signs and Sum', text: <>Use the signs <InlineMath math="+,\ -,\ +,\ \dots" /> and add <InlineMath math="a_{1j} M_{1j}" /> with those signs.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="|A|" /> for <InlineMath math="A = \begin{bmatrix} 2 & -3 & 1 \\ 2 & 0 & -1 \\ 1 & 4 & 5 \end{bmatrix}" />.
        </ExampleProblem>

        <ExampleStep n={1} title="EXPAND ALONG ROW 1">
          <StepText>Each entry of row 1 multiplies the 2×2 determinant left after crossing out its row and column. The signs go + − +.</StepText>
          <MathPanel>
            <BlockMath math="|A| = 2\begin{vmatrix} 0 & -1 \\ 4 & 5 \end{vmatrix} - (-3)\begin{vmatrix} 2 & -1 \\ 1 & 5 \end{vmatrix} + 1\begin{vmatrix} 2 & 0 \\ 1 & 4 \end{vmatrix}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="WORK OUT THE THREE MINORS">
          <StepText>Each 2×2 determinant is <InlineMath math="ad - bc" />:</StepText>
          <MathPanel>
            <BlockMath math="M_{11} = (0)(5) - (-1)(4) = 4" />
            <BlockMath math="M_{12} = (2)(5) - (-1)(1) = 11" />
            <BlockMath math="M_{13} = (2)(4) - (0)(1) = 8" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="COMBINE WITH THE SIGNS">
          <MathPanel>
            <BlockMath math="|A| = 2(4) - (-3)(11) + 1(8) = 8 + 33 + 8 = 49" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={4} title="CHECK BY ROW REDUCTION">
          <StepText>Make the matrix upper triangular; the determinant is then the product of the diagonal.</StepText>
          <MathPanel>
            <BlockMath math="R_2 \to R_2 - R_1,\quad R_3 \to R_3 - \tfrac{1}{2}R_1:\quad \begin{bmatrix} 2 & -3 & 1 \\ 0 & 3 & -2 \\ 0 & \tfrac{11}{2} & \tfrac{9}{2} \end{bmatrix}" />
            <BlockMath math="R_3 \to R_3 - \tfrac{11}{6}R_2:\quad \begin{bmatrix} 2 & -3 & 1 \\ 0 & 3 & -2 \\ 0 & 0 & \tfrac{49}{6} \end{bmatrix}" />
            <BlockMath math="|A| = (2)(3)\left(\tfrac{49}{6}\right) = 49 \ \checkmark" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="|A| = 49" math={<BlockMath math="|A| = 49 \neq 0" />}>
          Because the determinant is not zero, this matrix has an inverse.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Determinant Calculator">
        <DeterminantCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['matrix-inverse', 'rank', 'matrix-calculator', 'gauss-elimination']} />
    </MethodPage>
  );
}
