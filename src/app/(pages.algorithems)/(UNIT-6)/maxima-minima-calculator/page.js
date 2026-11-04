'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MaximaMinimaCalculator from './algorithems.maxima-minima-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'First derivative test or second derivative test?',
    a: <>The second derivative test is quicker: <InlineMath math="f''(c) < 0" /> means a maximum, <InlineMath math="f''(c) > 0" /> a minimum. But when <InlineMath math="f''(c) = 0" /> it tells you nothing, and then the first derivative test (does f′ change sign?) decides. The calculator uses both.</>,
  },
  {
    q: 'What is the difference between local and absolute maxima?',
    a: <>A local maximum is higher than the points just around it. The absolute maximum on [a, b] is the highest value anywhere on the interval, and it can be at an end point. Compare f at the ends and at every critical point.</>,
  },
  {
    q: 'Can a maximum be where f′ is undefined?',
    a: <>Yes, at a corner. <InlineMath math="|x|" /> has its minimum at 0, where the graph has a sharp point and f′ does not exist. That is why such points count as critical points too.</>,
  },
];

export default function MaximaMinimaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Maxima & Minima Calculator" subtitle="First and Second Derivative Tests">
        Local maxima and minima happen at <strong>critical points</strong>, where <InlineMath math="f'(x) = 0" /> or f′ is undefined. Test each one: <InlineMath math="f''(c) < 0" /> is a maximum, <InlineMath math="f''(c) > 0" /> a minimum.
      </MethodHeader>

      <FormulaBox label="THE TESTS" tag="f′(c) = 0">
        <Formula math={`f''(c) < 0 \\Rightarrow \\text{local max}, \\qquad f''(c) > 0 \\Rightarrow \\text{local min}`} />
        <FormulaSteps
          steps={[
            { title: '1. Critical points', text: <>Solve f′(x) = 0 (and note where f′ is undefined).</> },
            { title: '2. Classify', text: <>Use f″(c); if it is 0, check whether f′ changes sign.</> },
            { title: '3. On [a, b]', text: <>Compare f at the ends and the critical points for the absolute max and min.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>Find the local maxima and minima of <InlineMath math="f(x) = 2x^3 - 9x^2 + 12x + 1" />.</ExampleProblem>
        <ExampleStep n={1} title="CRITICAL POINTS">
          <MathPanel><BlockMath math="f'(x) = 6(x - 1)(x - 2) = 0 \ \Rightarrow \ x = 1, \ 2" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="SECOND DERIVATIVE TEST">
          <MathPanel><BlockMath math="f''(x) = 12x - 18: \quad f''(1) = -6 < 0, \quad f''(2) = 6 > 0" /></MathPanel>
          <StepText>So x = 1 is a local maximum and x = 2 a local minimum.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="THE VALUES">
          <MathPanel><BlockMath math="f(1) = 6, \qquad f(2) = 5" /></MathPanel>
        </ExampleStep>
        <Conclusion result="Local max 6 at x = 1; local min 5 at x = 2" math={<BlockMath math="\max f(1) = 6, \qquad \min f(2) = 5" />}>
          The calculator below opens on this function. Add an interval to get the absolute maximum and minimum.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Maxima & Minima Calculator">
        <MaximaMinimaCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['monotonicity', 'derivative', 'tangent-normal']} />
    </MethodPage>
  );
}
