'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TangentNormalCalculator from './algorithems.tangent-normal-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between a tangent and a normal?',
    a: <>The <strong>tangent</strong> touches the curve at the point and has the same slope, <InlineMath math="m = f'(a)" />. The <strong>normal</strong> goes through the same point at right angles to the tangent, so its slope is <InlineMath math="-\frac{1}{m}" /> (the two slopes multiply to −1).</>,
  },
  {
    q: 'What if the slope is 0?',
    a: <>Then the tangent is horizontal, <InlineMath math="y = f(a)" />, and the normal is the vertical line <InlineMath math="x = a" /> (its slope −1/0 is undefined).</>,
  },
  {
    q: 'Can the tangent be vertical?',
    a: <>Yes, where the derivative is infinite. <InlineMath math="y = \sqrt[3]{x}" /> has a vertical tangent <InlineMath math="x = 0" /> at the origin, and its normal there is the x-axis.</>,
  },
];

export default function TangentNormalPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Tangent & Normal Calculator" subtitle="Equations of the Tangent and Normal Lines">
        At <InlineMath math="x = a" /> the tangent to <InlineMath math="y = f(x)" /> has slope <InlineMath math="f'(a)" /> and passes through <InlineMath math="(a, f(a))" />. The normal is the line through the same point at right angles to it.
      </MethodHeader>

      <FormulaBox label="THE EQUATIONS" tag="m = f′(a)">
        <Formula math={`\\begin{gathered} \\text{Tangent: } y - f(a) = f'(a)(x - a) \\\\ \\text{Normal: } y - f(a) = -\\frac{1}{f'(a)}(x - a) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. The point', text: <>Work out y = f(a).</> },
            { title: '2. The slope', text: <>Differentiate and put x = a: m = f′(a).</> },
            { title: '3. The lines', text: <>Tangent with slope m; normal with slope −1/m, both through the point.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>Find the tangent and normal to <InlineMath math="y = x^2" /> at x = 1.</ExampleProblem>
        <ExampleStep n={1} title="THE POINT AND THE SLOPE">
          <MathPanel><BlockMath math="y = 1^2 = 1, \qquad \frac{dy}{dx} = 2x \ \Rightarrow \ m = 2(1) = 2" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="THE TANGENT">
          <MathPanel><BlockMath math="y - 1 = 2(x - 1) \quad \Rightarrow \quad y = 2x - 1" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="THE NORMAL">
          <StepText>Its slope is −1/2:</StepText>
          <MathPanel><BlockMath math="y - 1 = -\frac{1}{2}(x - 1) \quad \Rightarrow \quad y = -\frac{1}{2}x + \frac{3}{2}" /></MathPanel>
        </ExampleStep>
        <Conclusion result="Tangent y = 2x − 1, normal y = −x/2 + 3/2" math={<BlockMath math="y = 2x - 1, \qquad x + 2y = 3" />}>
          The calculator below opens on this example and draws both lines.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Tangent & Normal Calculator">
        <TangentNormalCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'implicit', 'maxima-minima']} />
    </MethodPage>
  );
}
