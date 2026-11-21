'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NormalCalculator from './algorithems.normal-distribution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is a z-score?', a: <><InlineMath math="z = \frac{x - \mu}{\sigma}" /> counts how many standard deviations x is from the mean. It turns any normal distribution into the standard one, N(0, 1), so one table works for all.</> },
  { q: 'My table gives the area from 0 to z. How do I use it?', a: <>Half the area (0.5) is on each side of the mean. P(Z &lt; z) for positive z is 0.5 + table value; for P(Z &gt; z) it is 0.5 − table value. Between two z&apos;s: add the table values if they are on opposite sides, subtract if on the same side.</> },
  { q: 'What is the 68–95–99.7 rule?', a: <>About 68% of values lie within 1σ of the mean, 95% within 2σ (1.96σ exactly), and 99.7% within 3σ.</> },
];

export default function NormalPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Normal Distribution Calculator" subtitle="Areas, z-Scores and the Inverse">
        For a <strong>normal distribution</strong> N(μ, σ²), probabilities are areas under the bell curve. Standardise with <InlineMath math="z = \frac{x - \mu}{\sigma}" />, then read the area from the standard normal table (or let the calculator do it).
      </MethodHeader>
      <FormulaBox label="STANDARDISE" tag="z = (x − μ)/σ">
        <Formula math={`P(X < a) = \\Phi\\left(\\frac{a - \\mu}{\\sigma}\\right), \\qquad P(a < X < b) = \\Phi(z_b) - \\Phi(z_a)`} />
        <FormulaSteps steps={[
          { title: '1. z-scores', text: <>Convert each x to z.</> },
          { title: '2. Areas', text: <>Look up Φ(z), or the area from 0 to z.</> },
          { title: '3. Combine', text: <>Left, right, or between: add or subtract.</> },
        ]} />
        <SymbolKey rows={EX['normal-distribution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['normal-distribution'].example} />
      <CommonMistakes items={EX['normal-distribution'].mistakes} />
      <Lab heading="Interactive Normal Distribution Calculator"><NormalCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['z-test', 'binomial', 'descriptive-statistics']} />
    </MethodPage>
  );
}
