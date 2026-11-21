'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AnovaCalculator from './algorithems.anova';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why not just do several t-tests?', a: <>Each t-test has a 5% chance of a false alarm, so many of them together make a false &quot;difference&quot; quite likely. ANOVA tests all the means at once with a single F-test.</> },
  { q: 'What is the correction factor?', a: <><InlineMath math="CF = \frac{G^2}{N}" />, the grand total squared over the number of observations. Subtracting it turns raw sums of squares into sums of squared deviations, which keeps the arithmetic simple.</> },
  { q: 'When should I use two-way ANOVA?', a: <>When the data are classified two ways at once, for example yield by fertiliser (columns) and by plot (rows). It tests both factors and removes the row effect from the error, making the test more sensitive.</> },
];

export default function AnovaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="ANOVA Calculator" subtitle="One-Way and Two-Way Analysis of Variance">
        <strong>Analysis of variance</strong> tests whether several group means are equal by comparing the variation <em>between</em> groups with the variation <em>within</em> them. A large F ratio means the groups really differ.
      </MethodHeader>
      <FormulaBox label="ONE-WAY ANOVA" tag="F = MSTr / MSE">
        <Formula math={`SST = \\sum x^2 - \\frac{G^2}{N}, \\quad SSTr = \\sum \\frac{T_i^2}{n_i} - \\frac{G^2}{N}, \\quad F = \\frac{SSTr/(k - 1)}{SSE/(N - k)}`} />
        <FormulaSteps steps={[
          { title: '1. Sums of squares', text: <>Total, between treatments, and error (the rest).</> },
          { title: '2. Mean squares', text: <>Divide each by its degrees of freedom.</> },
          { title: '3. F test', text: <>Compare F with the critical F from the table.</> },
        ]} />
        <SymbolKey rows={EX['anova'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['anova'].example} />
      <CommonMistakes items={EX['anova'].mistakes} />
      <Lab heading="Interactive ANOVA Calculator"><AnovaCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['f-test', 't-test', 'descriptive-statistics']} />
    </MethodPage>
  );
}
