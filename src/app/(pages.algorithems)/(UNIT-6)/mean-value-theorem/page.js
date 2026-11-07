'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.mean-value-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the conditions fail?", a: <>The theorem need not hold: |x| on [−1, 1] has f(−1) = f(1) but no point with f′ = 0, because it has a corner at 0.</> },
  { q: "Can there be more than one c?", a: <>Yes. The theorem promises at least one; the calculator finds them all.</> },
  { q: "What does the theorem mean?", a: <>Somewhere the instantaneous rate of change equals the average rate over the interval: the tangent is parallel to the chord.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Rolle's Theorem and the Mean Value Theorem" subtitle="Find c, With the Graph">
        If f is continuous on [a, b] and differentiable on (a, b), there is a c with <InlineMath math={"f'(c) = \\frac{f(b) - f(a)}{b - a}"} /> (<strong>Lagrange&apos;s mean value theorem</strong>). When f(a) = f(b) this is <strong>Rolle&apos;s theorem</strong>: f′(c) = 0.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="f′(c)">
        <Formula math={"f'(c) = \\frac{f(b) - f(a)}{b - a}, \\qquad a < c < b"} />
        <FormulaSteps steps={[
          { title: "1. Conditions", text: <>Continuous on [a, b], differentiable inside.</> },
          { title: "2. Slope", text: <>Of the chord from a to b.</> },
          { title: "3. Solve", text: <>f′(c) = that slope.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Verify the mean value theorem for <InlineMath math={"f(x) = x^3 - 3x + 1"} /> on [−2, 3].</ExampleProblem>
        <ExampleStep n={1} title="CHORD"><MathPanel><BlockMath math={"\\frac{f(3) - f(-2)}{3 - (-2)} = \\frac{19 - (-1)}{5} = 4"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SOLVE"><MathPanel><BlockMath math={"3c^2 - 3 = 4 \\Rightarrow c = \\pm\\sqrt{\\frac{7}{3}}"} /></MathPanel><StepText>Both lie between −2 and 3.</StepText></ExampleStep>
        <Conclusion result="c = ±√(7/3)" math={<BlockMath math={"c = \\pm\\frac{\\sqrt{21}}{3} \\approx \\pm 1.53"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Mean Value Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","maxima-minima","monotonicity"]} />
    </MethodPage>
  );
}
