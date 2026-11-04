'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CorrelationCalculator from './algorithems.correlation-coefficient';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find r for x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 4, 5.</ExampleProblem>
        <ExampleStep n={1} title="MEANS"><MathPanel><BlockMath math="\bar x = 3, \qquad \bar y = 4" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TOTALS"><MathPanel><BlockMath math="\sum (x - \bar x)^2 = 10, \quad \sum (y - \bar y)^2 = 6, \quad \sum (x - \bar x)(y - \bar y) = 6" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="r"><MathPanel><BlockMath math="r = \frac{6}{\sqrt{10 \times 6}} = 0.7746" /></MathPanel><StepText>A moderately strong positive correlation.</StepText></ExampleStep>
        <Conclusion result="r = 0.7746" math={<BlockMath math="r \approx 0.775" />}>The calculator below opens on this data, with the full table.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Correlation Calculator"><CorrelationCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['regression', 'straight-line', 'descriptive-statistics']} />
    </MethodPage>
  );
}
