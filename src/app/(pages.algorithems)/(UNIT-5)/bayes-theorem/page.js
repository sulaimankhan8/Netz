'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import BayesCalculator from './algorithems.bayes-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does Bayes’ theorem do?', a: <>It turns the question around: from &quot;how likely is A if E happened?&quot; to &quot;how likely is it that E happened, now that we saw A?&quot;. It updates a prior probability using new evidence.</> },
  { q: 'Why must the P(Eᵢ) add up to 1?', a: <>The events must cover every possible cause, with no overlaps (a partition). Then the total probability of A is the sum over all the causes.</> },
  { q: 'Why is a positive medical test often a false alarm?', a: <>If an illness is rare, most positive results come from the many healthy people (a small false-positive rate times a big group). Try the medical example: with 1% prevalence and a 95%-accurate test, a positive result means only about a 16% chance of being ill.</> },
];

export default function BayesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Bayes' Theorem Calculator" subtitle="Total Probability and Posterior Probabilities">
        <strong>Bayes&apos; theorem</strong> finds the probability of each possible cause Eᵢ given that an event A happened: multiply each prior by how likely A is under it, then divide by the total probability of A.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="P(Eᵢ | A)">
        <Formula math={`P(E_i \\mid A) = \\frac{P(E_i)\\,P(A \\mid E_i)}{\\sum_j P(E_j)\\,P(A \\mid E_j)}`} />
        <FormulaSteps steps={[
          { title: '1. Products', text: <>Prior × likelihood for each cause.</> },
          { title: '2. Total', text: <>Add them: P(A).</> },
          { title: '3. Divide', text: <>Each product over the total.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Machines A, B, C make 25%, 35% and 40% of the bolts; 5%, 4% and 2% of their bolts are defective. A bolt is defective. Which machine most likely made it?</ExampleProblem>
        <ExampleStep n={1} title="TOTAL PROBABILITY"><MathPanel><BlockMath math="P(D) = 0.25(0.05) + 0.35(0.04) + 0.40(0.02) = 0.0345" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="POSTERIORS"><MathPanel><BlockMath math="P(A \mid D) = \frac{0.0125}{0.0345} = \frac{25}{69}, \quad P(B \mid D) = \frac{28}{69}, \quad P(C \mid D) = \frac{16}{69}" /></MathPanel><StepText>Machine B is the most likely, even though C makes the most bolts.</StepText></ExampleStep>
        <Conclusion result="B, with probability 28/69" math={<BlockMath math="P(B \mid D) = \frac{28}{69} \approx 0.406" />}>The first example button below loads this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Bayes' Theorem Calculator"><BayesCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['random-variables', 'binomial', 'permutations-combinations']} />
    </MethodPage>
  );
}
