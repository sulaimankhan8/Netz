'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SystemSolver from './algorithems.system-of-equations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['system-of-equations'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['system-of-equations'].example} />
      <CommonMistakes items={EX['system-of-equations'].mistakes} />

      <Lab heading="Interactive Equation Solver">
        <SystemSolver />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['determinant', 'gauss-elimination', 'gauss-jordan', 'quadratic']} />
    </MethodPage>
  );
}
