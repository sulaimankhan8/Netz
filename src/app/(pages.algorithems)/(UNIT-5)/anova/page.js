'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AnovaCalculator from './algorithems.anova';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Three fertilisers give yields 8, 10, 7, 14, 11 / 7, 5, 10, 9, 9 / 12, 9, 13, 12, 14. Do they differ at the 5% level?</ExampleProblem>
        <ExampleStep n={1} title="SUMS OF SQUARES"><MathPanel><BlockMath math="G = 150, \ CF = \frac{150^2}{15} = 1500: \quad SST = 1600 - 1500 = 100, \quad SSTr = 40, \quad SSE = 60" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="F RATIO"><MathPanel><BlockMath math="F = \frac{40/2}{60/12} = \frac{20}{5} = 4" /></MathPanel><StepText>The 5% critical value F(2, 12) is 3.885.</StepText></ExampleStep>
        <Conclusion result="F = 4 > 3.885: significant" math={<BlockMath math="F = 4.0 > F_{0.05}(2, 12) = 3.885" />}>So the fertilisers do not all give the same mean yield.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive ANOVA Calculator"><AnovaCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['f-test', 't-test', 'descriptive-statistics']} />
    </MethodPage>
  );
}
