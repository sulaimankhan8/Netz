'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.exponential-distribution';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What does memoryless mean?", a: <>P(X &gt; s + t | X &gt; s) = P(X &gt; t): a bulb that has already lasted s hours is as good as new.</> },
  { q: "How is it related to the Poisson distribution?", a: <>If events happen at a Poisson rate λ, the time between them is exponential with the same λ.</> },
  { q: "Mean or rate?", a: <>Read carefully: &quot;mean 1000 h&quot; means λ = 0.001; &quot;rate 2 per hour&quot; means λ = 2.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Exponential Distribution Calculator" subtitle="Waiting Times and the Memoryless Property">
        The <strong>exponential distribution</strong> models waiting times: <InlineMath math={"f(x) = \\lambda e^{-\\lambda x}"} />, with <InlineMath math={"P(X \\le x) = 1 - e^{-\\lambda x}"} /> and mean 1/λ.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="λ">
        <Formula math={"P(X \\le x) = 1 - e^{-\\lambda x}, \\quad \\mu = \\frac{1}{\\lambda}, \\quad \\sigma^2 = \\frac{1}{\\lambda^2}"} />
        <FormulaSteps steps={[
          { title: "1. Rate", text: <>λ = 1/mean.</> },
          { title: "2. Formula", text: <>1 − e^(−λx) for P(X ≤ x).</> },
          { title: "3. Between", text: <>Subtract two values.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Bulbs last on average 1000 hours (exponential). Find the chance one lasts more than 1200 hours.</ExampleProblem>
        <ExampleStep n={1} title="RATE"><MathPanel><BlockMath math={"\\lambda = \\frac{1}{1000} = 0.001"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="PROBABILITY"><MathPanel><BlockMath math={"P(X > 1200) = e^{-0.001 \\times 1200} = e^{-1.2} = 0.3012"} /></MathPanel></ExampleStep>
        <Conclusion result="0.3012" math={<BlockMath math={"P(X > 1200) = e^{-1.2} \\approx 0.3012"} />}>The second example button below loads this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Exponential Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["poisson","gamma-dist","normal"]} />
    </MethodPage>
  );
}
