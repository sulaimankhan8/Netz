'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.exponential-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['exponential-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['exponential-distribution'].example} />
      <CommonMistakes items={EX['exponential-distribution'].mistakes} />
      <Lab heading="Interactive Exponential Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["poisson","gamma-dist","normal"]} />
    </MethodPage>
  );
}
