'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import BayesCalculator from './algorithems.bayes-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['bayes-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['bayes-theorem'].example} />
      <CommonMistakes items={EX['bayes-theorem'].mistakes} />
      <Lab heading="Interactive Bayes' Theorem Calculator"><BayesCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['random-variables', 'binomial', 'permutations-combinations']} />
    </MethodPage>
  );
}
