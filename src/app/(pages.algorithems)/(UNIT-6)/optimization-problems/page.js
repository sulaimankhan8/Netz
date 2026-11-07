'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.optimization-problems';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why also check the end points?", a: <>On a closed interval the largest or smallest value can be at an end, where f′ need not be 0.</> },
  { q: "What if f″ = 0 at the critical point?", a: <>The second-derivative test fails; look at the sign of f′ on each side instead.</> },
  { q: "Can I use my own function?", a: <>Yes: choose &quot;Your own function&quot; and give f(x) and the interval.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Optimisation Problems" subtitle="Maximum and Minimum Word Problems">
        Turn a word problem into one function f(x), find where <InlineMath math={"f'(x) = 0"} />, and use the second derivative to decide <strong>maximum or minimum</strong>. Boxes, fences, cans, windows — or your own function.
      </MethodHeader>
      <FormulaBox label="THE METHOD" tag="f′ = 0">
        <Formula math={"f'(x) = 0, \\qquad f''(x) < 0 \\Rightarrow \\text{maximum}, \\quad f''(x) > 0 \\Rightarrow \\text{minimum}"} />
        <FormulaSteps steps={[
          { title: "1. Model", text: <>One variable, one function, an interval.</> },
          { title: "2. Critical points", text: <>Solve f′(x) = 0.</> },
          { title: "3. Test", text: <>Second derivative (and the ends).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Squares of side x are cut from the corners of a 12 cm square sheet, which is folded into an open box. Find the largest volume.</ExampleProblem>
        <ExampleStep n={1} title="MODEL"><MathPanel><BlockMath math={"V = x(12 - 2x)^2, \\quad 0 < x < 6"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DIFFERENTIATE"><MathPanel><BlockMath math={"V' = (12 - 2x)(12 - 6x) = 0 \\Rightarrow x = 2"} /></MathPanel><StepText>V″(2) = −48 &lt; 0, so a maximum.</StepText></ExampleStep>
        <Conclusion result="128 cm³ at x = 2" math={<BlockMath math={"V_{\\max} = 2(8)^2 = 128 \\text{ cm}^3"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Optimisation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["maxima-minima","related-rates","maxima-minima-2var"]} />
    </MethodPage>
  );
}
