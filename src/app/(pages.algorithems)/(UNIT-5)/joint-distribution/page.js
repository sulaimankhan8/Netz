'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.joint-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Does zero covariance mean independent?", a: <>No. Independence makes the covariance 0, but not the other way round — the third example has Cov = 0 yet X and Y are dependent.</> },
  { q: "What is a marginal distribution?", a: <>The distribution of X alone, found by adding each row of the table (and of Y by adding each column).</> },
  { q: "What does ρ tell me?", a: <>How strongly X and Y move together in a straight-line way, from −1 to 1.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Joint Distributions and Covariance" subtitle="Marginals, Covariance, Correlation and Independence">
        From a <strong>joint probability table</strong> P(X = x, Y = y): the marginal distributions, expectations, <InlineMath math={"\\text{Cov}(X, Y) = E[XY] - E[X]E[Y]"} />, the correlation ρ, and a check for independence.
      </MethodHeader>
      <FormulaBox label="THE KEY FORMULAS" tag="Cov">
        <Formula math={"\\text{Cov}(X, Y) = E[XY] - E[X]E[Y], \\qquad \\rho = \\frac{\\text{Cov}(X, Y)}{\\sigma_X\\sigma_Y}"} />
        <FormulaSteps steps={[
          { title: "1. Marginals", text: <>Row and column totals.</> },
          { title: "2. Expectations", text: <>E[X], E[Y], E[XY].</> },
          { title: "3. Independence", text: <>Every cell = product of its marginals.</> },
        ]} />
        <SymbolKey rows={EX['joint-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['joint-distribution'].example} />
      <CommonMistakes items={EX['joint-distribution'].mistakes} />
      <Lab heading="Interactive Joint Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["random-variables","correlation","bayes"]} />
    </MethodPage>
  );
}
