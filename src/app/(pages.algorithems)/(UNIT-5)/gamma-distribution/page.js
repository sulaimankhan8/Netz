'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.gamma-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['gamma-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['gamma-distribution'].example} />
      <CommonMistakes items={EX['gamma-distribution'].mistakes} />
      <Lab heading="Interactive Gamma Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["exponential-dist","beta-gamma","chi-square"]} />
    </MethodPage>
  );
}
