'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.gamma-distribution';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How is it related to the exponential distribution?", a: <>α = 1 gives the exponential with rate 1/θ; the sum of α independent exponentials is gamma with shape α.</> },
  { q: "Scale or rate?", a: <>Some books use a rate β = 1/θ: then the mean is α/β. Convert before typing.</> },
  { q: "What is the chi-square distribution?", a: <>A gamma with α = k/2 and θ = 2 (k degrees of freedom).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Gamma Distribution Calculator" subtitle="Shape α, Scale θ">
        The <strong>gamma distribution</strong> <InlineMath math={"f(x) = \\frac{x^{\\alpha-1}e^{-x/\\theta}}{\\Gamma(\\alpha)\\theta^\\alpha}"} /> models the total waiting time for α Poisson events. Mean αθ, variance αθ².
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="Γ">
        <Formula math={"P(X \\le x) = P\\left(\\alpha, \\frac{x}{\\theta}\\right), \\quad \\mu = \\alpha\\theta, \\quad \\sigma^2 = \\alpha\\theta^2"} />
        <FormulaSteps steps={[
          { title: "1. Parameters", text: <>Shape α and scale θ.</> },
          { title: "2. Incomplete gamma", text: <>Gives P(X ≤ x).</> },
          { title: "3. Whole α", text: <>A finite sum (Erlang).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>X has a gamma distribution with α = 2, θ = 3. Find <InlineMath math={"P(X \\le 5)"} />.</ExampleProblem>
        <ExampleStep n={1} title="ERLANG FORM"><MathPanel><BlockMath math={"P(X > 5) = e^{-5/3}\\left(1 + \\tfrac{5}{3}\\right) = 0.5037"} /></MathPanel><StepText>With whole α the tail is a short sum.</StepText></ExampleStep>
        <ExampleStep n={2} title="ANSWER"><MathPanel><BlockMath math={"P(X \\le 5) = 1 - 0.5037 = 0.4963"} /></MathPanel></ExampleStep>
        <Conclusion result="≈ 0.496" math={<BlockMath math={"P(X \\le 5) \\approx 0.4963"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Gamma Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["exponential-dist","beta-gamma","chi-square"]} />
    </MethodPage>
  );
}
