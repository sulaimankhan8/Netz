'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SipCalculator from './algorithems.sip-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is a step-up SIP?', a: <>The monthly amount rises by a fixed percentage every year, usually in line with your salary. A 10% step-up on ₹10,000 means ₹11,000 a month in year 2, ₹12,100 in year 3, and so on.</> },
  { q: 'Why does the formula multiply by (1 + i) at the end?', a: <>Each payment is made at the start of the month, so it earns that month&apos;s return too. Without the extra <InlineMath math="(1 + i)" /> you get the value for payments at the end of each month.</> },
  { q: 'Will I really get this amount?', a: <>Only if the fund returns exactly this rate every month, which never happens. Use it to compare plans and see the effect of time, not as a promise.</> },
];

export default function SipPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INDIA SAVINGS" title="SIP Calculator" subtitle="Monthly Investments, With or Without a Step-Up">
        A <strong>SIP</strong> invests the same amount every month. Each payment grows for the months it stays invested; their total is the future value of an annuity: <InlineMath math="P \cdot \frac{(1 + i)^{n} - 1}{i}(1 + i)" />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="i = r/1200">
        <Formula math={'F = P \\times \\frac{(1 + i)^{n} - 1}{i} \\times (1 + i), \\qquad i = \\frac{r}{12 \\times 100}, \\ n = 12 \\times \\text{years}'} />
        <FormulaSteps steps={[
          { title: '1. Monthly rate', text: <>Expected yearly return ÷ 12.</> },
          { title: '2. Months', text: <>12 × years.</> },
          { title: '3. Step-up', text: <>Optional: work out each year&apos;s 12 payments and add.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>₹10,000 is invested every month for 10 years at an expected 12% a year. Find the expected value.</ExampleProblem>
        <ExampleStep n={1} title="RATE AND MONTHS"><MathPanel><BlockMath math="i = \frac{12}{1200} = 0.01, \qquad n = 120" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FORMULA"><MathPanel><BlockMath math="F = 10{,}000 \times \frac{(1.01)^{120} - 1}{0.01} \times 1.01 = 23{,}23{,}391" /></MathPanel><StepText>Invested: ₹12,00,000, so the gains are ₹11,23,391.</StepText></ExampleStep>
        <Conclusion result="About ₹23.23 lakh" math={<BlockMath math="F \approx 23{,}23{,}391" />}>The calculator below opens on this SIP; try adding a 10% step-up.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive SIP Calculator"><SipCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['lumpsum', 'ppf', 'compound-interest']} />
    </MethodPage>
  );
}
