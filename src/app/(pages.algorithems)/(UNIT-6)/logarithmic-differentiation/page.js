'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LogarithmicCalculator from './algorithems.logarithmic-differentiation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'When should I use logarithmic differentiation?',
    a: <>When x is in the power as well as the base, like <InlineMath math="x^x" /> or <InlineMath math="(\sin x)^{\cos x}" />: no ordinary rule covers these. It also saves work on long products and quotients, because logs turn them into sums.</>,
  },
  {
    q: 'Why is xˣ not x · xˣ⁻¹?',
    a: <>The power rule <InlineMath math="(x^n)' = n x^{n-1}" /> needs a fixed n, and the exponential rule <InlineMath math="(a^x)' = a^x \ln a" /> needs a fixed a. In xˣ both change, so the answer <InlineMath math="x^x(\ln x + 1)" /> has a piece from each.</>,
  },
  {
    q: 'What about negative values, where ln is not defined?',
    a: <>Strictly we take <InlineMath math="\ln|y|" />, which has the same derivative <InlineMath math="\frac{1}{y}\frac{dy}{dx}" />. So the final formula for dy/dx is right wherever y is defined and not 0.</>,
  },
];

export default function LogarithmicPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Logarithmic Differentiation" subtitle="For xˣ, Powers of Functions & Long Products">
        Take <strong>ln</strong> of both sides, expand with the log laws, differentiate (the left side gives <InlineMath math="\frac{1}{y}\frac{dy}{dx}" />), then multiply by y.
      </MethodHeader>

      <FormulaBox label="THE METHOD" tag="ln y">
        <Formula math={`\\ln y = v \\ln u \\quad \\Rightarrow \\quad \\frac{1}{y}\\frac{dy}{dx} = v' \\ln u + \\frac{v\\,u'}{u}`} />
        <FormulaSteps
          steps={[
            { title: '1. Take ln', text: <>ln y = ln(right side).</> },
            { title: '2. Use the log laws', text: <>ln(ab) = ln a + ln b, ln(a/b) = ln a − ln b, ln aᵏ = k ln a.</> },
            { title: '3. Differentiate, multiply by y', text: <>The left side is (1/y) dy/dx; multiply the result by the original y.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Differentiate <InlineMath math="y = x^x" /> (x &gt; 0).
        </ExampleProblem>
        <ExampleStep n={1} title="TAKE ln OF BOTH SIDES">
          <MathPanel><BlockMath math="\ln y = \ln\left(x^x\right) = x \ln x" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="DIFFERENTIATE BOTH SIDES">
          <MathPanel><BlockMath math="\frac{1}{y}\frac{dy}{dx} = 1 \cdot \ln x + x \cdot \frac{1}{x} = \ln x + 1" /></MathPanel>
          <StepText>The right side needs the product rule.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="MULTIPLY BY y">
          <MathPanel><BlockMath math="\frac{dy}{dx} = y(\ln x + 1) = x^x(\ln x + 1)" /></MathPanel>
        </ExampleStep>
        <Conclusion result="dy/dx = xˣ(ln x + 1)" math={<BlockMath math="\frac{d}{dx}\left(x^x\right) = x^x(1 + \ln x)" />}>
          The calculator below opens on this example.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Logarithmic Differentiation Calculator">
        <LogarithmicCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'implicit', 'parametric']} />
    </MethodPage>
  );
}
