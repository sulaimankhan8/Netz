'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixCalculator from './algorithems.matrix-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How do you multiply two matrices?',
    a: <>Entry (i, j) of <InlineMath math="AB" /> is row i of A times column j of B: multiply the matching entries and add. The number of columns of A must equal the number of rows of B.</>,
  },
  {
    q: 'Is AB the same as BA?',
    a: <>Usually not. Matrix multiplication is not commutative, and BA may not even exist when AB does. With the example on this page, <InlineMath math="BA = \begin{bmatrix} 23 & 34 \\ 31 & 46 \end{bmatrix}" />, which is different from AB.</>,
  },
  {
    q: 'What is the transpose of a matrix?',
    a: <>The matrix you get by turning rows into columns: <InlineMath math="(A^{T})_{ij} = a_{ji}" />. A 2×3 matrix becomes 3×2.</>,
  },
  {
    q: 'When can two matrices be added?',
    a: <>Only when they have the same size. You then add the entries in the same position.</>,
  },
];

export default function MatrixCalculatorPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES & LINEAR ALGEBRA" title="Matrix Calculator" subtitle="Add, Multiply, Transpose & Powers">
        A <strong>matrix calculator</strong> that shows its working. Add or subtract matrices of the same size; multiply when the columns of A match the rows of B. Each entry of a product is row i of A times column j of B.
      </MethodHeader>

      <FormulaBox label="THE RULES" tag="SIZE MATTERS">
        <Formula math={`(A + B)_{ij} = a_{ij} + b_{ij} \\qquad (AB)_{ij} = \\sum_{k} a_{ik}\\, b_{kj} \\qquad (A^{T})_{ij} = a_{ji}`} />
        <FormulaSteps
          steps={[
            { title: '1. Check the Sizes', text: <>Add/subtract: same size. Multiply: an <InlineMath math="m \times n" /> times an <InlineMath math="n \times p" /> gives <InlineMath math="m \times p" />.</> },
            { title: '2. Row × Column', text: <>For each entry of AB, multiply row i of A by column j of B, entry by entry, and add.</> },
            { title: '3. Order Matters', text: <>In general <InlineMath math="AB \neq BA" />, so keep the order the question gives.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="AB" /> for <InlineMath math="A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}" /> and <InlineMath math="B = \begin{bmatrix} 5 & 6 \\ 7 & 8 \end{bmatrix}" />.
        </ExampleProblem>

        <ExampleStep n={1} title="CHECK THE SIZES">
          <StepText>A is 2×2 and B is 2×2: the inner numbers match (2 = 2), so AB exists and is 2×2.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="ROW 1 OF A × EACH COLUMN OF B">
          <MathPanel>
            <BlockMath math="c_{11} = (1)(5) + (2)(7) = 19, \qquad c_{12} = (1)(6) + (2)(8) = 22" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="ROW 2 OF A × EACH COLUMN OF B">
          <MathPanel>
            <BlockMath math="c_{21} = (3)(5) + (4)(7) = 43, \qquad c_{22} = (3)(6) + (4)(8) = 50" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="AB = [[19, 22], [43, 50]]" math={<BlockMath math="AB = \begin{bmatrix} 19 & 22 \\ 43 & 50 \end{bmatrix}" />}>
          Try B × A in the calculator: the answer is different, because matrix multiplication depends on the order.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Matrix Calculator">
        <MatrixCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['determinant', 'matrix-inverse', 'rank', 'gauss-elimination']} />
    </MethodPage>
  );
}
