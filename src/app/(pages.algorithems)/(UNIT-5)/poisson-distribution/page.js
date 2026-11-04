'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PoissonCalculator from './algorithems.poisson-distribution';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When does the Poisson distribution apply?', a: <>For counts of rare, independent events in a fixed time or space with a steady average rate λ: calls per minute, typing errors per page, accidents per week.</> },
  { q: 'What is the Poisson approximation to the binomial?', a: <>When n is large and p is small (roughly n ≥ 50, np ≤ 5), <InlineMath math="B(n, p)" /> is close to Poisson with <InlineMath math="\lambda = np" />, which is much easier to calculate.</> },
  { q: 'Why are the mean and variance both λ?', a: <>It is a property of this distribution: <InlineMath math="E(X) = \text{Var}(X) = \lambda" />. If a data set has its variance close to its mean, a Poisson model may fit.</> },
];

export default function PoissonPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Poisson Distribution" subtitle="P(X = k) = e^(−λ) λᵏ / k!">
        The <strong>Poisson distribution</strong> counts how many times a rare event happens in a fixed interval, when it happens on average λ times. It is also the limit of the binomial for large n and small p.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="mean λ">
        <Formula math={`P(X = k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}, \\qquad \\mu = \\sigma^2 = \\lambda`} />
        <FormulaSteps steps={[
          { title: '1. λ', text: <>The average count, or λ = np.</> },
          { title: '2. Terms', text: <>Compute P(X = k) for the k you need.</> },
          { title: '3. Complement', text: <>&quot;At least k&quot; is 1 minus &quot;at most k − 1&quot;.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A switchboard gets on average 2 calls a minute. Find the probability of exactly 3 calls in a minute.</ExampleProblem>
        <ExampleStep n={1} title="SUBSTITUTE"><MathPanel><BlockMath math="P(X = 3) = \frac{e^{-2} \, 2^3}{3!} = \frac{8 \times 0.135335}{6}" /></MathPanel></ExampleStep>
        <Conclusion result="0.1804" math={<BlockMath math="P(X = 3) \approx 0.1804" />}>The calculator below opens on this question.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Poisson Calculator"><PoissonCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['binomial', 'normal', 'random-variables']} />
    </MethodPage>
  );
}
