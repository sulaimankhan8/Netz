'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.gradient-descent';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I choose α?", a: <>Small α is safe but slow; too large and the steps overshoot and grow. For x² + 3y², α must be below 1/3 (try 0.4 to see it diverge).</> },
  { q: "Does it find the global minimum?", a: <>Only a local one, near where it starts. For bowl-shaped (convex) functions the local minimum is the global one.</> },
  { q: "Why is it used in machine learning?", a: <>Training means minimising a loss over millions of parameters; the gradient is cheap to compute even then, so these simple steps scale.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOTS & OPTIMISATION" title="Gradient Descent" subtitle="Step by Step, With the Path Drawn">
        <strong>Gradient descent</strong> walks downhill: <InlineMath math={"\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha\\nabla f(\\mathbf{x}_k)"} />. It is how machine-learning models are trained. Watch each step and see what the learning rate α does.
      </MethodHeader>
      <FormulaBox label="THE UPDATE" tag="α">
        <Formula math={"\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha\\,\\nabla f(\\mathbf{x}_k)"} />
        <FormulaSteps steps={[
          { title: "1. Gradient", text: <>The direction of steepest climb.</> },
          { title: "2. Step", text: <>Move α times it the other way.</> },
          { title: "3. Repeat", text: <>Until the gradient is tiny.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Minimise <InlineMath math={"f = x^2 + 3y^2"} /> from (2, 1) with α = 0.1.</ExampleProblem>
        <ExampleStep n={1} title="GRADIENT"><MathPanel><BlockMath math={"\\nabla f = (2x, 6y) = (4, 6) \\text{ at } (2, 1)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FIRST STEP"><MathPanel><BlockMath math={"(2, 1) - 0.1(4, 6) = (1.6, 0.4)"} /></MathPanel><StepText>Each step shrinks x by 0.8 and y by 0.4.</StepText></ExampleStep>
        <Conclusion result="→ (0, 0)" math={<BlockMath math={"(x, y) \\to (0, 0), \\quad f \\to 0"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Gradient Descent Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["golden-section","newton-system","maxima-minima-2var"]} />
    </MethodPage>
  );
}
