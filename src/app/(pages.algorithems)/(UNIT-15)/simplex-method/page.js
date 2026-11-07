'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.simplex-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the Big-M method?", a: <>A ≥ or = constraint needs an artificial variable to start. Giving it a huge penalty M in the objective forces it out of the solution.</> },
  { q: "How do I minimise?", a: <>Minimising z is maximising −z; the calculator does this for you and reports the minimum.</> },
  { q: "What is the dual problem?", a: <>Every LP has a twin: constraints become variables and the objective coefficients become the limits. Both have the same optimal value.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • LINEAR PROGRAMMING" title="Simplex Method Calculator" subtitle="Tableaux, Big-M and Duality">
        The <strong>simplex method</strong> solves linear programmes by moving from corner to corner of the feasible region. Each <strong>tableau</strong> picks an entering variable (most negative zⱼ − cⱼ) and a leaving one (smallest ratio).
      </MethodHeader>
      <FormulaBox label="ONE ITERATION" tag="PIVOT">
        <Formula math={"\\text{enter: } \\min_j (z_j - c_j) < 0, \\qquad \\text{leave: } \\min_i \\frac{b_i}{a_{ij}}, \\ a_{ij} > 0"} />
        <FormulaSteps steps={[
          { title: "1. Standard form", text: <>Slack (and Big-M) variables.</> },
          { title: "2. Pivot", text: <>Entering column, leaving row.</> },
          { title: "3. Stop", text: <>When every zⱼ − cⱼ ≥ 0.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Maximise <InlineMath math={"z = 3x + 5y"} /> subject to x ≤ 4, 2y ≤ 12, 3x + 2y ≤ 18.</ExampleProblem>
        <ExampleStep n={1} title="FIRST PIVOT"><StepText>y enters (−5 is the most negative); ratios 12/2 = 6 and 18/2 = 9, so s₂ leaves.</StepText></ExampleStep>
        <ExampleStep n={2} title="SECOND PIVOT"><StepText>x enters; ratios 4/1 and 6/3 = 2, so s₃ leaves. All zⱼ − cⱼ ≥ 0: optimal.</StepText></ExampleStep>
        <Conclusion result="x = 2, y = 6, z = 36" math={<BlockMath math={"x = 2, \\ y = 6, \\quad z_{\\max} = 36"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Simplex Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["system-of-equations","gauss-jordan","dijkstra"]} />
    </MethodPage>
  );
}
