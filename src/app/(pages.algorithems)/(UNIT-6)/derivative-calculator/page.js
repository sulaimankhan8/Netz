'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DerivativeCalculator from './algorithems.derivative-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is a derivative?',
    a: <>The rate at which a function changes: the slope of its graph at each point. <InlineMath math="f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" />. For <InlineMath math="f(x) = x^2" />, <InlineMath math="f'(x) = 2x" />, so the slope at x = 3 is 6.</>,
  },
  {
    q: 'When do you use the chain rule?',
    a: <>Whenever one function sits inside another, like <InlineMath math="\sin(x^3)" /> or <InlineMath math="e^{2x}" />. Differentiate the outside, keep the inside as it is, then multiply by the derivative of the inside: <InlineMath math="\frac{d}{dx}\sin(x^3) = \cos(x^3) \cdot 3x^2" />.</>,
  },
  {
    q: 'What is the difference between the product rule and the quotient rule?',
    a: <>Product: <InlineMath math="(uv)' = u'v + uv'" />. Quotient: <InlineMath math="\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}" />. The order matters in the quotient rule because of the minus sign.</>,
  },
  {
    q: 'What are the derivatives of eˣ and ln x?',
    a: <><InlineMath math="\frac{d}{dx}e^x = e^x" /> (it is its own derivative) and <InlineMath math="\frac{d}{dx}\ln x = \frac{1}{x}" /> for x &gt; 0. With the chain rule: <InlineMath math="\frac{d}{dx}e^{u} = e^{u}u'" /> and <InlineMath math="\frac{d}{dx}\ln u = \frac{u'}{u}" />.</>,
  },
];

export default function DerivativePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Derivative Calculator" subtitle="Power, Product, Quotient & Chain Rules">
        A <strong>derivative</strong> measures how fast a function changes. You find it rule by rule: <InlineMath math="\frac{d}{dx}x^n = nx^{n-1}" /> for powers, then the product, quotient and chain rules to combine pieces. This calculator shows every rule it uses.
      </MethodHeader>

      <FormulaBox label="THE CORE RULES" tag="d/dx">
        <Formula math={`\\begin{gathered} (x^n)' = n x^{n-1} \\qquad (uv)' = u'v + uv' \\\\ \\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2} \\qquad \\frac{d}{dx}f(g(x)) = f'(g(x))\\,g'(x) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Spot the Outer Shape', text: <>Is the whole thing a sum, a product, a quotient, or a function of something?</> },
            { title: '2. Apply That Rule', text: <>Write it out with u and v, leaving their derivatives to work out next.</> },
            { title: '3. Go Inside', text: <>Differentiate each piece the same way, then tidy up.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Differentiate <InlineMath math="y = x^2 \sin(3x)" />.
        </ExampleProblem>

        <ExampleStep n={1} title="IT IS A PRODUCT">
          <StepText>Take <InlineMath math="u = x^2" /> and <InlineMath math="v = \sin(3x)" />, and use <InlineMath math="(uv)' = u'v + uv'" />.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="DIFFERENTIATE EACH PART">
          <MathPanel>
            <BlockMath math="u' = \frac{d}{dx}x^2 = 2x \quad \text{(power rule)}" />
            <BlockMath math="v' = \frac{d}{dx}\sin(3x) = \cos(3x) \cdot 3 = 3\cos(3x) \quad \text{(chain rule)}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="PUT IT TOGETHER">
          <MathPanel>
            <BlockMath math="\frac{dy}{dx} = 2x \cdot \sin(3x) + x^2 \cdot 3\cos(3x) = 2x\sin(3x) + 3x^2\cos(3x)" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="dy/dx = 2x sin(3x) + 3x² cos(3x)" math={<BlockMath math="\frac{dy}{dx} = 2x\sin(3x) + 3x^2\cos(3x)" />}>
          The calculator below opens on this function and shows the same rules, then checks the answer numerically.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Derivative Calculator">
        <DerivativeCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['numerical-differentiation', 'newton-raphson', 'quadratic', 'taylor']} />
    </MethodPage>
  );
}
