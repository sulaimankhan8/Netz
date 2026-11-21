'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.assignment-problem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['assignment-problem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['assignment-problem'].example} />
      <CommonMistakes items={EX['assignment-problem'].mistakes} />
      <Lab heading="Interactive Assignment Problem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["transportation-problem","simplex","kuhn-tucker"]} />
    </MethodPage>
  );
}
