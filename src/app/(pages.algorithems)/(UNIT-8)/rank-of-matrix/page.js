'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RankCalculator from './algorithems.rank-of-matrix';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the rank of a matrix?',
    a: <>The number of linearly independent rows (which always equals the number of independent columns). In practice: row-reduce the matrix and count the rows that are not all zeros.</>,
  },
  {
    q: 'What is the difference between echelon form and reduced row echelon form (RREF)?',
    a: <>In echelon form, each leading entry is to the right of the one above and everything below it is 0. RREF also makes every leading entry 1 and clears the entries above it. Both give the same rank.</>,
  },
  {
    q: 'What is the rank of a 3×3 matrix with determinant 0?',
    a: <>Less than 3. A square matrix has full rank exactly when its determinant is not zero.</>,
  },
  {
    q: 'How is rank used to check a system of equations?',
    a: <>Compare the rank of the coefficient matrix <InlineMath math="A" /> with the rank of the augmented matrix <InlineMath math="[A \mid b]" />. If they are equal the system is consistent; if they also equal the number of unknowns, the solution is unique.</>,
  },
];

export default function RankPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES & LINEAR ALGEBRA" title="Rank of a Matrix" subtitle="Row Echelon Form (RREF)">
        The <strong>rank</strong> <InlineMath math="\rho(A)" /> of a matrix is the number of non-zero rows left after you reduce it to echelon form. It counts how many rows (or columns) are truly independent.
      </MethodHeader>

      <FormulaBox label="HOW RANK IS FOUND" tag="ANY m × n MATRIX">
        <Formula math={`\\rho(A) = \\text{number of non-zero rows in the echelon form of } A \\ \\le\\ \\min(m, n)`} />
        <FormulaSteps
          steps={[
            { title: '1. Pivot', text: <>Take the first column with a non-zero entry; swap a row up if needed and make the pivot 1.</> },
            { title: '2. Clear the Column', text: <>Use <InlineMath math="R_i \to R_i - k R_j" /> to make every other entry in that column 0.</> },
            { title: '3. Count', text: <>Repeat for the next column. The rank is the number of pivots (non-zero rows).</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the rank of <InlineMath math="A = \begin{bmatrix} 1 & 2 & 3 \\ 2 & 4 & 6 \\ 1 & 1 & 1 \end{bmatrix}" />.
        </ExampleProblem>

        <ExampleStep n={1} title="CLEAR COLUMN 1">
          <StepText>The pivot is the 1 in row 1. Subtract multiples of row 1 from the rows below:</StepText>
          <MathPanel>
            <BlockMath math="R_2 \to R_2 - 2R_1,\quad R_3 \to R_3 - R_1:\quad \begin{bmatrix} 1 & 2 & 3 \\ 0 & 0 & 0 \\ 0 & -1 & -2 \end{bmatrix}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="PIVOT IN COLUMN 2">
          <StepText>Row 2 now has a 0 in column 2, so swap it with row 3, then make the pivot 1:</StepText>
          <MathPanel>
            <BlockMath math="R_2 \leftrightarrow R_3,\quad R_2 \to R_2 \div (-1):\quad \begin{bmatrix} 1 & 2 & 3 \\ 0 & 1 & 2 \\ 0 & 0 & 0 \end{bmatrix}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="CLEAR ABOVE THE PIVOT">
          <MathPanel>
            <BlockMath math="R_1 \to R_1 - 2R_2:\quad \begin{bmatrix} 1 & 0 & -1 \\ 0 & 1 & 2 \\ 0 & 0 & 0 \end{bmatrix}" />
          </MathPanel>
          <StepText>Column 3 has no pivot left (only zeros below row 2), so the reduction is finished. This is the RREF.</StepText>
        </ExampleStep>

        <Conclusion result="ρ(A) = 2" math={<BlockMath math="\text{2 non-zero rows} \implies \rho(A) = 2" />}>
          Row 2 was just 2 × row 1, so only two rows are independent. That also means |A| = 0.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Rank Calculator">
        <RankCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['determinant', 'matrix-inverse', 'gauss-jordan', 'gauss-elimination']} />
    </MethodPage>
  );
}
