'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.moment-generating-function';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is it called moment generating?", a: <>Expanding e^(tX) gives M(t) = 1 + tE[X] + t²E[X²]/2! + …: the moments are its Taylor coefficients.</> },
  { q: "What is it good for besides moments?", a: <>The MGF of a sum of independent variables is the product of their MGFs, which proves results like &quot;the sum of Poissons is Poisson&quot;.</> },
  { q: "Why does the uniform MGF need a limit?", a: <>M(t) = (e^(bt) − e^(at))/(t(b − a)) is 0/0 at t = 0; the limit gives the moments.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Moment Generating Function Calculator" subtitle="M(t), Mean and Variance From Derivatives">
        The <strong>moment generating function</strong> <InlineMath math={"M(t) = E[e^{tX}]"} /> packs every moment into one function: <InlineMath math={"E[X^r] = M^{(r)}(0)"} />. Find M(t) and get the mean and variance by differentiating.
      </MethodHeader>
      <FormulaBox label="MOMENTS" tag="M⁽ʳ⁾(0)">
        <Formula math={"\\mu = M'(0), \\qquad \\sigma^2 = M''(0) - M'(0)^2"} />
        <FormulaSteps steps={[
          { title: "1. M(t)", text: <>Standard formula or Σ p e^(tx).</> },
          { title: "2. Differentiate", text: <>Once and twice.</> },
          { title: "3. Put t = 0", text: <>Mean and second moment.</> },
        ]} />
        <SymbolKey rows={EX['moment-generating-function'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['moment-generating-function'].example} />
      <CommonMistakes items={EX['moment-generating-function'].mistakes} />
      <Lab heading="Interactive Moment Generating Function Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["random-variables","binomial","poisson"]} />
    </MethodPage>
  );
}
