'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.transportation-problem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Costs 19 30 50 10 / 70 30 40 60 / 40 8 70 20, supplies 7, 9, 18, demands 5, 8, 7, 14. Find the cheapest plan.</ExampleProblem>
        <ExampleStep n={1} title="VAM START"><MathPanel><BlockMath math={"x_{11} = 5, \\ x_{14} = 2, \\ x_{23} = 7, \\ x_{24} = 2, \\ x_{32} = 8, \\ x_{34} = 10 \\Rightarrow 779"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MODI"><MathPanel><BlockMath math={"d_{22} = -18 < 0 \\Rightarrow \\text{move 2 units round the loop}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="OPTIMAL"><MathPanel><BlockMath math={"\\text{every } d_{ij} \\ge 0, \\quad \\text{cost} = 743"} /></MathPanel></ExampleStep>
        <Conclusion result="Minimum cost 743" math={<BlockMath math={"\\text{total cost} = 743"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Transportation Problem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["assignment-problem","simplex","kuhn-tucker"]} />
    </MethodPage>
  );
}
