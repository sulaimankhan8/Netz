'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import EmiCalculator from './algorithems.emi-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the EMI formula?',
    a: <><InlineMath math="EMI = \frac{P\,i\,(1+i)^N}{(1+i)^N - 1}" />, where P is the loan, <InlineMath math="i" /> is the monthly rate (yearly rate ÷ 12 ÷ 100) and N is the number of months.</>,
  },
  {
    q: 'Why is most of the early EMI interest?',
    a: <>Interest is charged on what you still owe. At the start you owe the most, so the interest part is biggest and only a small part of the EMI reduces the loan. Each month the balance falls, so more of the same EMI goes to principal.</>,
  },
  {
    q: 'Is a flat rate cheaper than a reducing rate?',
    a: <>Usually not. A flat rate charges interest on the full loan for the whole term, even after you have paid most of it back. A 10% flat rate over one year costs about the same as an 18% reducing rate, and the calculator shows the equivalent for your loan.</>,
  },
  {
    q: 'Does prepaying a loan save money?',
    a: <>Yes. A prepayment goes straight to the principal, so every later month charges less interest. If you keep the same EMI, the loan ends sooner. Check whether your lender charges a prepayment fee first.</>,
  },
];

export default function EmiPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="EMI Calculator" subtitle="with Amortisation Schedule">
        An <strong>EMI</strong> (equated monthly instalment) is the fixed monthly payment that clears a loan with interest: <InlineMath math="EMI = \frac{P\,i\,(1+i)^N}{(1+i)^N - 1}" />. Each EMI pays that month&apos;s interest first; the rest reduces the loan.
      </MethodHeader>

      <FormulaBox label="HOW AN EMI IS WORKED OUT" tag="REDUCING BALANCE">
        <Formula math={`\\begin{gathered} EMI = \\frac{P \\, i \\, (1 + i)^N}{(1 + i)^N - 1} \\\\ i = \\frac{R}{12 \\times 100}, \\quad N = \\text{months} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Monthly Rate', text: <>Divide the yearly rate by 12 and by 100: 9% a year gives <InlineMath math="i = 0.0075" />.</> },
            { title: '2. Months', text: <>Turn the tenure into months: 5 years is <InlineMath math="N = 60" />.</> },
            { title: '3. Each Month', text: <>Interest = balance × i. The rest of the EMI reduces the balance.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A car loan of ₹5,00,000 is taken at 9% a year for 5 years. Find the EMI, the total interest, and how the first two EMIs are split.
        </ExampleProblem>

        <ExampleStep n={1} title="MONTHLY RATE AND MONTHS">
          <MathPanel>
            <BlockMath math="i = \frac{9}{12 \times 100} = 0.0075, \qquad N = 5 \times 12 = 60, \qquad (1.0075)^{60} = 1.565681" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="EMI">
          <MathPanel>
            <BlockMath math="EMI = \frac{5{,}00{,}000 \times 0.0075 \times 1.565681}{1.565681 - 1} = \frac{5871.30}{0.565681} \approx 10{,}379.18" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="TOTAL INTEREST">
          <MathPanel>
            <BlockMath math="\text{Total paid} = 10{,}379.18 \times 60 = 6{,}22{,}750.66" />
            <BlockMath math="\text{Total interest} = 6{,}22{,}750.66 - 5{,}00{,}000 = 1{,}22{,}750.66" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={4} title="THE FIRST TWO EMIs">
          <MathPanel>
            <BlockMath math="\text{Month 1: interest} = 5{,}00{,}000 \times 0.0075 = 3750, \quad \text{principal} = 10{,}379.18 - 3750 = 6629.18" />
            <BlockMath math="\text{Month 2: interest} = 4{,}93{,}370.82 \times 0.0075 = 3700.28, \quad \text{principal} = 6678.90" />
          </MathPanel>
          <StepText>The interest part shrinks each month and the principal part grows, while the EMI stays the same.</StepText>
        </ExampleStep>

        <Conclusion result="EMI ≈ ₹10,379.18 for 60 months" math={<BlockMath math="EMI \approx 10{,}379.18, \qquad \text{interest} \approx 1{,}22{,}750.66" />}>
          The calculator below opens on this loan. Add a prepayment of ₹1,00,000 after month 24 to see it finish a year early.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive EMI Calculator">
        <EmiCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['compound-interest', 'percentage', 'bisection']} />
    </MethodPage>
  );
}
