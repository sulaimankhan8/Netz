'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import BinomialCalculator from './algorithems.binomial-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When is a situation binomial?', a: <>A fixed number n of independent trials, each with only two outcomes (success or failure), and the same chance p of success every time. Counting heads in 10 coin tosses is binomial; drawing cards without putting them back is not.</> },
  { q: 'Why use 1 − P(X = 0) for "at least one"?', a: <>&quot;At least one&quot; means 1, 2, …, n: many terms. Its opposite, &quot;none&quot;, is a single term. Subtracting from 1 is much quicker.</> },
  { q: 'What are the mean and variance?', a: <>Mean <InlineMath math="np" />, variance <InlineMath math="npq" /> with q = 1 − p. For 10 fair coins: mean 5 heads, variance 2.5.</> },
];

export default function BinomialPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Binomial Distribution" subtitle="P(X = k) = nCk pᵏ qⁿ⁻ᵏ">
        The <strong>binomial distribution</strong> gives the chance of exactly k successes in n independent trials, each with success probability p. Add terms for &quot;at most&quot; or &quot;at least&quot; questions.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="B(n, p)">
        <Formula math={`P(X = k) = \\binom{n}{k} p^k q^{n - k}, \\quad q = 1 - p; \\qquad \\mu = np, \\ \\sigma^2 = npq`} />
        <FormulaSteps steps={[
          { title: '1. n, p, q', text: <>Number of trials, chance of success, chance of failure.</> },
          { title: '2. Which k?', text: <>One value, or several to add up.</> },
          { title: '3. Shortcut', text: <>Use the complement when it has fewer terms.</> },
        ]} />
        <SymbolKey rows={EX['binomial-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['binomial-distribution'].example} />
      <CommonMistakes items={EX['binomial-distribution'].mistakes} />
      <Lab heading="Interactive Binomial Calculator"><BinomialCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['poisson', 'normal', 'permutations-combinations']} />
    </MethodPage>
  );
}
