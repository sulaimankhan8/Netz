'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.assignment-problem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does subtracting a constant from a row not change the answer?", a: <>Every assignment uses exactly one cell of that row, so every total drops by the same amount.</> },
  { q: "How is a maximum found?", a: <>Replace each value p by (largest − p) and minimise.</> },
  { q: "What if the table is not square?", a: <>Add dummy rows or columns of zeros; whoever gets a dummy is left without a job.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="Assignment Problem Solver (Hungarian Method)" subtitle="Row and Column Reduction, Covering Zeros, the Optimal Assignment">
        The <strong>assignment problem</strong> gives each worker one job (and each job one worker) at the least total cost. The <strong>Hungarian method</strong> subtracts row and column minimums until an assignment can be made entirely on zeros.
      </MethodHeader>
      <FormulaBox label="THE HUNGARIAN METHOD" tag="n LINES">
        <Formula math={"\\text{reduce rows and columns; cover zeros with the fewest lines; if fewer than } n: \\ \\text{uncovered} - k, \\ \\text{crossings} + k"} />
        <FormulaSteps steps={[
          { title: "1. Reduce", text: <>Row minimums, then column minimums.</> },
          { title: "2. Cover", text: <>The fewest lines through all zeros.</> },
          { title: "3. Adjust or assign", text: <>Fewer than n lines: adjust; n lines: assign.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Assign five jobs to five workers with the cost table 9 11 14 11 7 / 6 15 13 13 10 / 12 13 6 8 8 / 11 9 10 12 9 / 7 12 14 10 14.</ExampleProblem>
        <ExampleStep n={1} title="REDUCE"><MathPanel><BlockMath math={"\\text{row minimums } 7, 6, 6, 9, 7, \\text{ then the column minimums}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COVER AND ADJUST"><MathPanel><BlockMath math={"\\text{fewer than 5 lines: subtract the smallest uncovered number, add it at the crossings}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="ASSIGN"><MathPanel><BlockMath math={"1 \\to 5, \\ 2 \\to 1, \\ 3 \\to 3, \\ 4 \\to 2, \\ 5 \\to 4: \\quad 7 + 6 + 6 + 9 + 10 = 38"} /></MathPanel></ExampleStep>
        <Conclusion result="Minimum total 38" math={<BlockMath math={"\\text{minimum total} = 38"} />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Assignment Problem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["transportation-problem","simplex","kuhn-tucker"]} />
    </MethodPage>
  );
}
