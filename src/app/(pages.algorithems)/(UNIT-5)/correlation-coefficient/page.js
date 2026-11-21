'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CorrelationCalculator from './algorithems.correlation-coefficient';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does r tell me?', a: <>How close the points are to a straight line, from −1 to 1. r near 1: as x goes up, y goes up. r near −1: as x goes up, y goes down. r near 0: no straight-line pattern (there may still be a curve).</> },
  { q: 'When should I use Spearman instead of Pearson?', a: <>When the data are ranks (like judges&apos; placings), or when you care about order rather than exact values, or when there are outliers. Spearman&apos;s ρ is Pearson&apos;s r applied to the ranks.</> },
  { q: 'How are tied ranks handled?', a: <>Tied values share the average of the ranks they would have taken (two values tied for 2nd and 3rd both get 2.5). A correction <InlineMath math="\frac{m(m^2 - 1)}{12}" /> is added to Σd² for each group of m ties.</> },
];

export default function CorrelationPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Correlation Coefficient" subtitle="Karl Pearson's r and Spearman's Rank ρ">
        The <strong>correlation coefficient</strong> measures how strongly two variables move together in a straight line, on a scale from −1 to 1. Karl Pearson&apos;s r uses the values; Spearman&apos;s ρ uses their ranks.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="−1 ≤ r ≤ 1">
        <Formula math={`r = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sqrt{\\sum (x - \\bar x)^2 \\sum (y - \\bar y)^2}}, \\qquad \\rho = 1 - \\frac{6\\sum d^2}{n(n^2 - 1)}`} />
        <FormulaSteps steps={[
          { title: '1. Means', text: <>Find x̄ and ȳ.</> },
          { title: '2. Deviation table', text: <>x − x̄, y − ȳ, their squares and products.</> },
          { title: '3. Divide', text: <>The sum of products over the square root of the two sums of squares.</> },
        ]} />
        <SymbolKey rows={EX['correlation-coefficient'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['correlation-coefficient'].example} />
      <CommonMistakes items={EX['correlation-coefficient'].mistakes} />
      <Lab heading="Interactive Correlation Calculator"><CorrelationCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['regression', 'straight-line', 'descriptive-statistics']} />
    </MethodPage>
  );
}
