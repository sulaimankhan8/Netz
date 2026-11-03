'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import InterestCalculator from './algorithems.compound-interest';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between simple and compound interest?',
    a: <>Simple interest is always worked out on the original principal. Compound interest is worked out on the principal plus the interest already added, so it grows faster. ₹10,000 at 10% for 2 years earns ₹2,000 simple interest but ₹2,100 compound interest.</>,
  },
  {
    q: 'How does compounding half-yearly or quarterly change the formula?',
    a: <>Divide the yearly rate by the number of times a year and multiply the time by it: half-yearly uses <InlineMath math="\frac{R}{2}" /> per period and <InlineMath math="2T" /> periods, so <InlineMath math="A = P\left(1 + \frac{R}{200}\right)^{2T}" />.</>,
  },
  {
    q: 'What is the effective annual rate?',
    a: <>The yearly rate that, compounded once a year, gives the same result. 12% compounded monthly is the same as 12.68% compounded yearly, because of interest on interest within the year.</>,
  },
  {
    q: 'What is the rule of 72?',
    a: <>A quick estimate of how long money takes to double: divide 72 by the yearly interest rate. At 8%, about 72 ÷ 8 = 9 years (the exact answer is 9.006 years).</>,
  },
];

export default function CompoundInterestPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="Compound Interest" subtitle="and Simple Interest, Year by Year">
        <strong>Compound interest</strong> adds each period&apos;s interest to the principal, so the next interest is bigger: <InlineMath math="A = P\left(1 + \frac{R}{100}\right)^{T}" />. <strong>Simple interest</strong> is always on the original amount: <InlineMath math="SI = \frac{PRT}{100}" />.
      </MethodHeader>

      <FormulaBox label="THE FORMULAS" tag="P, R, T">
        <Formula math={`\\begin{gathered} SI = \\frac{P \\times R \\times T}{100} \\\\ A = P\\left(1 + \\frac{R}{100n}\\right)^{nT}, \\quad CI = A - P \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Rate per Period', text: <>Divide the yearly rate by n: 2 for half-yearly, 4 for quarterly, 12 for monthly.</> },
            { title: '2. Number of Periods', text: <>Multiply the years by n. 1½ years half-yearly is 3 periods.</> },
            { title: '3. Grow, then Subtract', text: <>Work out the amount A, then CI = A − P.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the compound interest on ₹8,000 for 1½ years at 10% a year, compounded half-yearly. Compare it with the simple interest.
        </ExampleProblem>

        <ExampleStep n={1} title="RATE AND PERIODS">
          <StepText>Half-yearly means 2 periods a year:</StepText>
          <MathPanel>
            <BlockMath math="\text{Rate per half-year} = \frac{10}{2} = 5\%, \qquad \text{periods} = 2 \times 1\tfrac{1}{2} = 3" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="AMOUNT">
          <MathPanel>
            <BlockMath math="A = 8000\left(1 + \frac{5}{100}\right)^{3} = 8000 \times (1.05)^3 = 8000 \times 1.157625 = 9261" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="INTEREST, AND THE SIMPLE INTEREST CHECK">
          <MathPanel>
            <BlockMath math="CI = A - P = 9261 - 8000 = 1261" />
            <BlockMath math="SI = \frac{8000 \times 10 \times 1.5}{100} = 1200" />
          </MathPanel>
          <StepText>Compound interest is ₹61 more, because each half-year&apos;s interest also earns interest.</StepText>
        </ExampleStep>

        <Conclusion result="CI = ₹1,261 (amount ₹9,261)" math={<BlockMath math="A = 9261, \qquad CI = 1261" />}>
          The calculator below opens on this question and shows the amount at the end of each year.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Interest Calculator">
        <InterestCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['emi', 'percentage']} />
    </MethodPage>
  );
}
