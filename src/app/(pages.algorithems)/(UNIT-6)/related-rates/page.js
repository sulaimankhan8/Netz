'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.related-rates';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why put the numbers in only at the end?", a: <>The relation must hold at every moment so it can be differentiated; the values describe one moment, after differentiating.</> },
  { q: "What does a negative rate mean?", a: <>The quantity is decreasing: the top of the ladder is coming down.</> },
  { q: "Can I type my own problem?", a: <>Problems are given as templates so they can be read reliably; change any number in them.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Related Rates" subtitle="Ladders, Cones, Balloons and Shadows">
        When quantities linked by an equation change with time, differentiate the equation with respect to t to link their <strong>rates</strong>. Pick a classic problem and change the numbers.
      </MethodHeader>
      <FormulaBox label="THE METHOD" tag="d/dt">
        <Formula math={"x^2 + y^2 = L^2 \\;\\Rightarrow\\; 2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0"} />
        <FormulaSteps steps={[
          { title: "1. Relation", text: <>An equation between the quantities.</> },
          { title: "2. Differentiate", text: <>With respect to t (chain rule).</> },
          { title: "3. Substitute", text: <>The values at that moment.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A 10 m ladder slides away from a wall at 2 m/s. How fast does the top slide down when the foot is 6 m from the wall?</ExampleProblem>
        <ExampleStep n={1} title="RELATION"><MathPanel><BlockMath math={"x^2 + y^2 = 100, \\quad x = 6 \\Rightarrow y = 8"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DIFFERENTIATE"><MathPanel><BlockMath math={"2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0 \\Rightarrow \\frac{dy}{dt} = -\\frac{6}{8}(2) = -\\frac{3}{2}"} /></MathPanel></ExampleStep>
        <Conclusion result="1.5 m/s downwards" math={<BlockMath math={"\\frac{dy}{dt} = -\\frac{3}{2} \\text{ m/s}"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Related Rates Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["implicit","derivative","optimization"]} />
    </MethodPage>
  );
}
