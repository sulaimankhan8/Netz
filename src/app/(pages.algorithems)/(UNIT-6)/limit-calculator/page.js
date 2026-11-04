'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LimitCalculator from './algorithems.limit-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is a limit?',
    a: <>The value a function gets closer and closer to as x approaches a point, even if the function is not defined at that point. <InlineMath math="\frac{x^2 - 4}{x - 2}" /> has no value at x = 2, but it gets as close as you like to 4.</>,
  },
  {
    q: "When can you use L'Hôpital's rule?",
    a: <>Only for the forms <InlineMath math="\frac{0}{0}" /> and <InlineMath math="\frac{\infty}{\infty}" />. Then <InlineMath math="\lim \frac{f(x)}{g(x)} = \lim \frac{f'(x)}{g'(x)}" />: differentiate the top and the bottom separately (not with the quotient rule). Repeat if the form is still 0/0 or ∞/∞.</>,
  },
  {
    q: 'Why is the limit of sin x / x equal to 1?',
    a: <>It is a standard limit, true when x is in radians: near 0 the curve <InlineMath math="\sin x" /> and the line <InlineMath math="y = x" /> are almost the same. L&apos;Hôpital&apos;s rule confirms it: <InlineMath math="\lim_{x\to0} \frac{\cos x}{1} = 1" />.</>,
  },
  {
    q: 'When does a limit not exist?',
    a: <>When the left and right limits are different (like <InlineMath math="\frac{|x|}{x}" /> at 0, which gives −1 and 1), when the values grow without bound in opposite directions (like <InlineMath math="\frac{1}{x}" /> at 0), or when they never settle (like <InlineMath math="\sin\frac{1}{x}" /> at 0).</>,
  },
];

export default function LimitPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Limit Calculator" subtitle="Substitution, Factoring & L'Hôpital">
        A <strong>limit</strong> is the value <InlineMath math="f(x)" /> approaches as <InlineMath math="x" /> approaches a point. Try substituting first; if that gives <InlineMath math="\frac{0}{0}" />, factor and cancel, or use <strong>L&apos;Hôpital&apos;s rule</strong>.
      </MethodHeader>

      <FormulaBox label="THE ORDER TO TRY" tag="0/0 · ∞/∞">
        <Formula math={`\\begin{gathered} \\lim_{x \\to a} f(x) = f(a) \\ \\text{(if defined)} \\\\ \\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)} \\ \\text{(for } \\tfrac{0}{0} \\text{ or } \\tfrac{\\infty}{\\infty}\\text{)} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Substitute', text: <>Put x = a in. A normal number is the answer.</> },
            { title: '2. Simplify 0/0', text: <>Factor and cancel, or rationalise a square root, then substitute again.</> },
            { title: "3. L'Hôpital", text: <>Still 0/0 or ∞/∞? Differentiate top and bottom separately and try again.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="\lim_{x \to 2} \frac{x^2 - 5x + 6}{x^2 - 4}" />.
        </ExampleProblem>

        <ExampleStep n={1} title="TRY SUBSTITUTING">
          <MathPanel>
            <BlockMath math="\frac{2^2 - 5(2) + 6}{2^2 - 4} = \frac{0}{0}" />
          </MathPanel>
          <StepText>0/0 is indeterminate: it doesn&apos;t tell us the limit, so simplify first.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="FACTOR AND CANCEL">
          <StepText>Both top and bottom are 0 at x = 2, so both have the factor <InlineMath math="(x - 2)" />:</StepText>
          <MathPanel>
            <BlockMath math="\frac{x^2 - 5x + 6}{x^2 - 4} = \frac{(x - 2)(x - 3)}{(x - 2)(x + 2)} = \frac{x - 3}{x + 2} \quad (x \neq 2)" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="SUBSTITUTE AGAIN">
          <MathPanel>
            <BlockMath math="\lim_{x \to 2} \frac{x - 3}{x + 2} = \frac{2 - 3}{2 + 2} = -\frac{1}{4}" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="The limit is −1/4" math={<BlockMath math="\lim_{x \to 2} \frac{x^2 - 5x + 6}{x^2 - 4} = -\frac{1}{4}" />}>
          The calculator below opens on this limit. Tap sin(x)/x to see L&apos;Hôpital&apos;s rule instead.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Limit Calculator">
        <LimitCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'quadratic', 'taylor']} />
    </MethodPage>
  );
}
