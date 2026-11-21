'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DescriptiveCalculator from './algorithems.descriptive-statistics';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Population or sample standard deviation?', a: <>Divide by N when your data are the whole population (σ). Divide by N − 1 when they are a sample and you want to estimate the population (s). Most school textbooks use σ (divide by N); the calculator shows both.</> },
  { q: 'How is the median found for grouped data?', a: <>Find the class containing the <InlineMath math="\frac{N}{2}" />-th value (the median class), then interpolate inside it: <InlineMath math="L + \frac{N/2 - cf}{f} \times h" />, with L its lower limit, cf the cumulative frequency before it, f its frequency and h its width.</> },
  { q: 'What do skewness and kurtosis tell me?', a: <>Skewness measures lopsidedness: positive means a long right tail (mean &gt; median). Kurtosis β₂ compares the peak and tails with the normal curve (β₂ = 3): above 3 is more peaked, below 3 is flatter.</> },
];

export default function DescriptivePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Descriptive Statistics" subtitle="Mean, Median, Mode, SD, Skewness & Kurtosis">
        Summarise a set of numbers: where its centre is (<strong>mean, median, mode</strong>), how spread out it is (<strong>variance, standard deviation, quartiles</strong>) and its shape (<strong>skewness, kurtosis</strong>), for raw data, frequency tables or grouped data.
      </MethodHeader>
      <FormulaBox label="KEY FORMULAS" tag="x̄, σ">
        <Formula math={`\\bar x = \\frac{\\sum fx}{N}, \\qquad \\sigma^2 = \\frac{\\sum f(x - \\bar x)^2}{N}, \\qquad \\text{Median} = L + \\frac{\\frac{N}{2} - cf}{f}\\times h`} />
        <FormulaSteps steps={[
          { title: 'Centre', text: <>Mean, median (middle value), mode (most frequent).</> },
          { title: 'Spread', text: <>Variance, standard deviation, quartiles, range.</> },
          { title: 'Shape', text: <>Skewness (lopsided?) and kurtosis (peaked?).</> },
        ]} />
        <SymbolKey rows={EX['descriptive-statistics'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['descriptive-statistics'].example} />
      <CommonMistakes items={EX['descriptive-statistics'].mistakes} />
      <Lab heading="Interactive Statistics Calculator"><DescriptiveCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['correlation', 'normal', 'least-squares']} />
    </MethodPage>
  );
}
