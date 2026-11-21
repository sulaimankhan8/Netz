'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.geometric-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is P(X ≤ k) = 1 − qᵏ?", a: <>The only way to need more than k trials is to fail k times in a row, which has probability qᵏ.</> },
  { q: "Is it memoryless like the exponential?", a: <>Yes: after k failures, the number of further trials needed has the same distribution as at the start.</> },
  { q: "Some books give P(X = k) = qᵏp. Why?", a: <>They count failures before the first success (k = 0, 1, 2, …). Both are correct; check which your book uses.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Geometric Distribution Calculator" subtitle="Trials Until the First Success">
        The <strong>geometric distribution</strong> counts the trials up to the first success: <InlineMath math={"P(X = k) = (1 - p)^{k-1}p"} />, with mean 1/p.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="q = 1 − p">
        <Formula math={"P(X = k) = q^{k-1}p, \\quad P(X \\le k) = 1 - q^k, \\quad \\mu = \\frac{1}{p}, \\quad \\sigma^2 = \\frac{q}{p^2}"} />
        <FormulaSteps steps={[
          { title: "1. p and q", text: <>Success and failure.</> },
          { title: "2. k − 1 failures", text: <>Then one success.</> },
          { title: "3. Cumulative", text: <>1 − qᵏ.</> },
        ]} />
        <SymbolKey rows={EX['geometric-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['geometric-distribution'].example} />
      <CommonMistakes items={EX['geometric-distribution'].mistakes} />
      <Lab heading="Interactive Geometric Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["binomial","exponential-dist","poisson"]} />
    </MethodPage>
  );
}
