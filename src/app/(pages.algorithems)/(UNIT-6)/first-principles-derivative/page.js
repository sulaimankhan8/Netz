'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FirstPrinciplesCalculator from './algorithems.first-principles-derivative';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What does "from first principles" mean?',
    a: <>Finding the derivative straight from its definition, the limit of <InlineMath math="\frac{f(x+h) - f(x)}{h}" /> as <InlineMath math="h \to 0" />, without using rules like the power rule. It is the slope of the chord from x to x + h, as the two points come together.</>,
  },
  {
    q: 'Why can we not just put h = 0?',
    a: <>Because the fraction becomes <InlineMath math="\frac{0}{0}" />, which has no value. We first simplify so that h cancels from the bottom; after that, putting h = 0 is allowed.</>,
  },
  {
    q: 'Which standard limits are used?',
    a: <><InlineMath math="\lim_{\theta \to 0} \frac{\sin\theta}{\theta} = 1" /> for sin and cos, <InlineMath math="\lim_{h \to 0} \frac{e^h - 1}{h} = 1" /> for eˣ, and <InlineMath math="\lim_{t \to 0} \frac{\ln(1 + t)}{t} = 1" /> for ln x.</>,
  },
];

export default function FirstPrinciplesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Derivative from First Principles" subtitle="The Limit Definition, Step by Step">
        The <strong>derivative</strong> of f at x is the limit of the slope of a chord: <InlineMath math="f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" />. Expand, cancel, divide by h, then let h go to 0.
      </MethodHeader>

      <FormulaBox label="THE DEFINITION" tag="h → 0">
        <Formula math={`f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}`} />
        <FormulaSteps
          steps={[
            { title: '1. Write f(x + h)', text: <>Replace every x by (x + h) and expand.</> },
            { title: '2. Subtract and divide', text: <>Take away f(x) and divide by h; h must cancel from the bottom.</> },
            { title: '3. Let h → 0', text: <>Every term still containing h disappears. What is left is f′(x).</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the derivative of <InlineMath math="f(x) = x^2" /> from first principles.
        </ExampleProblem>
        <ExampleStep n={1} title="WRITE f(x + h)">
          <MathPanel><BlockMath math="f(x + h) = (x + h)^2 = x^2 + 2xh + h^2" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="SUBTRACT f(x) AND DIVIDE BY h">
          <MathPanel><BlockMath math="\frac{f(x + h) - f(x)}{h} = \frac{2xh + h^2}{h} = 2x + h" /></MathPanel>
          <StepText>h cancels from the bottom, so the 0/0 problem is gone.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="LET h → 0">
          <MathPanel><BlockMath math="f'(x) = \lim_{h \to 0} (2x + h) = 2x" /></MathPanel>
        </ExampleStep>
        <Conclusion result="f′(x) = 2x" math={<BlockMath math="\frac{d}{dx}\left(x^2\right) = 2x" />}>
          The same answer as the power rule, which is proved exactly this way. The calculator below opens on this example.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive First Principles Calculator">
        <FirstPrinciplesCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'limit', 'implicit']} />
    </MethodPage>
  );
}
