'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SystemSolver from './algorithems.system-of-equations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: "What is Cramer's rule?",
    a: <>For a system with a non-zero determinant D, each unknown is a ratio of determinants: <InlineMath math="x = \frac{D_x}{D}" />, where <InlineMath math="D_x" /> is D with the x-column replaced by the constants. The same works for y and z.</>,
  },
  {
    q: 'When does a system of equations have no solution?',
    a: <>When the equations contradict each other: for two equations, the lines are parallel. Then D = 0 and the rank of the coefficient matrix is less than the rank of the augmented matrix.</>,
  },
  {
    q: 'When are there infinitely many solutions?',
    a: <>When one equation is just a multiple (or combination) of the others, so the lines or planes coincide. D = 0 and both ranks are equal but less than the number of unknowns.</>,
  },
  {
    q: 'Which method should I use: substitution, elimination or Cramer?',
    a: <>Substitution is quick when one equation already gives x or y easily. Elimination works for any size and is the basis of Gauss elimination. Cramer&apos;s rule is neat for 2 or 3 equations but needs D ≠ 0.</>,
  },
];

export default function SystemPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="System of Equations" subtitle="Cramer, Elimination, Substitution">
        A <strong>system of linear equations</strong> asks for values that satisfy every equation at once. With 2 equations, that is where two lines cross. <strong>Cramer&apos;s rule</strong> gives each unknown as a ratio of determinants, <InlineMath math="x = \frac{D_x}{D}" />.
      </MethodHeader>

      <FormulaBox label="CRAMER'S RULE (2 × 2)" tag="NEEDS D ≠ 0">
        <Formula math={`\\begin{gathered} D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix}, \\quad D_x = \\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix}, \\quad D_y = \\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix} \\\\ x = \\frac{D_x}{D}, \\quad y = \\frac{D_y}{D} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Standard Form', text: <>Write each equation as <InlineMath math="ax + by = c" />, with the unknowns lined up.</> },
            { title: '2. One, None or Many', text: <>D ≠ 0: one solution. D = 0: none or infinitely many (check the ranks).</> },
            { title: '3. Solve and Check', text: <>Find the values, then put them back into every equation.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="2x + 3y = 13" /> and <InlineMath math="x - y = -1" /> by Cramer&apos;s rule.
        </ExampleProblem>

        <ExampleStep n={1} title="THE DETERMINANT D">
          <MathPanel>
            <BlockMath math="D = \begin{vmatrix} 2 & 3 \\ 1 & -1 \end{vmatrix} = (2)(-1) - (3)(1) = -5 \neq 0" />
          </MathPanel>
          <StepText>D is not zero, so there is exactly one solution.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="REPLACE EACH COLUMN WITH THE CONSTANTS">
          <MathPanel>
            <BlockMath math="D_x = \begin{vmatrix} 13 & 3 \\ -1 & -1 \end{vmatrix} = -13 + 3 = -10, \qquad D_y = \begin{vmatrix} 2 & 13 \\ 1 & -1 \end{vmatrix} = -2 - 13 = -15" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="DIVIDE AND CHECK">
          <MathPanel>
            <BlockMath math="x = \frac{-10}{-5} = 2, \qquad y = \frac{-15}{-5} = 3" />
            <BlockMath math="2(2) + 3(3) = 13 \ \checkmark \qquad 2 - 3 = -1 \ \checkmark" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="x = 2, y = 3" math={<BlockMath math="(x, y) = (2, 3)" />}>
          The solver below opens on this pair and draws the two lines meeting at (2, 3).
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Equation Solver">
        <SystemSolver />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['determinant', 'gauss-elimination', 'gauss-jordan', 'quadratic']} />
    </MethodPage>
  );
}
