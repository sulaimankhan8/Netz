'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RandomVariableCalculator from './algorithems.random-variables';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What makes a valid probability distribution?', a: <>Discrete: every probability between 0 and 1, adding up to 1. Continuous: the density f(x) is never negative and the area under it is 1. Questions with an unknown k use exactly this to find k.</> },
  { q: 'Why Var(X) = E(X²) − [E(X)]²?', a: <>It is the same as the average squared distance from the mean, <InlineMath math="E[(X - \mu)^2]" />, rearranged into a form that is quicker to calculate.</> },
  { q: 'Is the expected value a value X can take?', a: <>Not necessarily. A fair die has E(X) = 3.5, which never comes up. It is the long-run average over many repeats.</> },
];

export default function RandomVariablesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Random Variables" subtitle="Expectation, Variance and Distributions">
        A <strong>random variable</strong> assigns a number to each outcome. From its probability table (discrete) or density f(x) (continuous), find the <strong>expected value</strong> E(X), the <strong>variance</strong> and probabilities.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="E(X), Var(X)">
        <Formula math={`E(X) = \\sum x\\,p(x) \\ \\text{or} \\ \\int x f(x)\\,dx, \\qquad \\text{Var}(X) = E(X^2) - [E(X)]^2`} />
        <FormulaSteps steps={[
          { title: '1. Check', text: <>Probabilities add to 1 (or the area is 1).</> },
          { title: '2. E(X) and E(X²)', text: <>Weighted sums (or integrals).</> },
          { title: '3. Variance', text: <>E(X²) minus the square of E(X).</> },
        ]} />
        <SymbolKey rows={EX['random-variables'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['random-variables'].example} />
      <CommonMistakes items={EX['random-variables'].mistakes} />
      <Lab heading="Interactive Random Variable Calculator"><RandomVariableCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['binomial', 'poisson', 'bayes']} />
    </MethodPage>
  );
}
