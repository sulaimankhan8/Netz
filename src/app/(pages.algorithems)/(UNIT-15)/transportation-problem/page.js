'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.transportation-problem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which starting method is best?", a: <>VAM usually starts closest to the optimum (779 here, against 814 for least cost and 1015 for the North-West corner), so MODI needs fewer rounds.</> },
  { q: "What is degeneracy?", a: <>Fewer than m + n − 1 allocated cells. A tiny allocation ε is put in an empty cell (one that does not close a loop) so the u and v can be found.</> },
  { q: "How do I maximise profit?", a: <>Choose &quot;Maximise&quot;: each profit p is replaced by (largest − p) and the cost is minimised.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="Transportation Problem Solver" subtitle="North-West Corner, Least Cost, VAM and the MODI Method">
        The <strong>transportation problem</strong> ships goods from sources to destinations at the least total cost. A <strong>starting solution</strong> (North-West corner, least cost, or Vogel&apos;s method) is improved by the <strong>MODI method</strong> until no empty cell would lower the cost.
      </MethodHeader>
      <FormulaBox label="MODI" tag="m + n − 1 BASIC CELLS">
        <Formula math={"u_i + v_j = c_{ij} \\ (\\text{allocated cells}), \\qquad d_{ij} = c_{ij} - (u_i + v_j) \\ge 0 \\text{ for all empty cells} \\Rightarrow \\text{optimal}"} />
        <FormulaSteps steps={[
          { title: "1. Balance", text: <>Add a dummy if supply ≠ demand.</> },
          { title: "2. Start", text: <>NW corner, least cost or VAM.</> },
          { title: "3. MODI", text: <>Improve round loops until every d ≥ 0.</> },
        ]} />
        <SymbolKey rows={EX['transportation-problem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['transportation-problem'].example} />
      <CommonMistakes items={EX['transportation-problem'].mistakes} />
      <Lab heading="Interactive Transportation Problem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["assignment-problem","simplex","kuhn-tucker"]} />
    </MethodPage>
  );
}
