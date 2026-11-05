'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RdCalculator from './algorithems.rd-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Where does the RD formula come from?', a: <>Each monthly payment is a small FD. The first stays in for N months, the last for 1 month, each growing at <InlineMath math="(1 + i)^{\text{months}/3}" /> with quarterly compounding. Adding them up (a geometric series) gives the formula.</> },
  { q: 'Why is the interest less than on an FD of the same total?', a: <>Because the money goes in gradually. On average each rupee is in the RD for only about half the time.</> },
  { q: 'What if I miss an instalment?', a: <>Banks usually charge a small penalty and the late payment earns less interest. The calculator assumes every payment is on time.</> },
];

export default function RdPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INDIA SAVINGS" title="RD Calculator" subtitle="Recurring Deposit Maturity, Step by Step">
        A <strong>recurring deposit</strong> takes the same amount every month and adds interest every quarter. Each instalment grows for the months it stays in, and the maturity amount is their total.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="i = r/400">
        <Formula math={'M = R \\times \\frac{(1 + i)^{N/3} - 1}{1 - (1 + i)^{-1/3}}, \\qquad i = \\frac{r}{400}'} />
        <FormulaSteps steps={[
          { title: '1. Quarterly rate', text: <>i = r/400.</> },
          { title: '2. Each instalment', text: <>Grows to R(1 + i)^(months left/3).</> },
          { title: '3. Add them up', text: <>A geometric series gives the closed formula.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>₹1,000 is paid into an RD every month for 1 year at 7% a year, compounded quarterly. Find the maturity amount.</ExampleProblem>
        <ExampleStep n={1} title="RATE"><MathPanel><BlockMath math="i = \frac{7}{400} = 0.0175, \qquad N = 12 \text{ months} = 4 \text{ quarters}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FORMULA"><MathPanel><BlockMath math="M = 1000 \times \frac{(1.0175)^{4} - 1}{1 - (1.0175)^{-1/3}} = 12{,}462.13" /></MathPanel><StepText>Paid in: 12 × ₹1,000 = ₹12,000, so the interest is ₹462.13.</StepText></ExampleStep>
        <Conclusion result="Maturity ₹12,462.13" math={<BlockMath math="M = 12{,}462.13" />}>The second example button below loads this RD.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive RD Calculator"><RdCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['fd', 'sip', 'compound-interest']} />
    </MethodPage>
  );
}
