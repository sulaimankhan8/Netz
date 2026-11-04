'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DescriptiveCalculator from './algorithems.descriptive-statistics';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the mean and standard deviation of <InlineMath math="2, 4, 4, 4, 5, 5, 7, 9" />.</ExampleProblem>
        <ExampleStep n={1} title="MEAN"><MathPanel><BlockMath math="\bar x = \frac{40}{8} = 5" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SQUARED DEVIATIONS"><MathPanel><BlockMath math="(x - 5)^2: \ 9, 1, 1, 1, 0, 0, 4, 16 \ \Rightarrow \ \sum = 32" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="VARIANCE AND SD"><MathPanel><BlockMath math="\sigma^2 = \frac{32}{8} = 4, \qquad \sigma = 2" /></MathPanel><StepText>Median = 4.5 (between the 4th and 5th values) and mode = 4.</StepText></ExampleStep>
        <Conclusion result="x̄ = 5, σ = 2" math={<BlockMath math="\bar x = 5, \quad \sigma = 2" />}>Try it with the first example button below.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Statistics Calculator"><DescriptiveCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['correlation', 'normal', 'least-squares']} />
    </MethodPage>
  );
}
