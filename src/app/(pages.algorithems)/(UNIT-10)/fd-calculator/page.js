'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FdCalculator from './algorithems.fd-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do banks calculate FD interest?', a: <>Most Indian banks add interest every quarter, so the interest itself earns interest: <InlineMath math="A = P\left(1 + \frac{r}{400}\right)^{4T}" />. Deposits under 6 months usually earn simple interest instead.</> },
  { q: 'Cumulative or payout: which gives more?', a: <>Cumulative. In a payout FD the interest is paid to you each month or quarter, so it stops earning. A cumulative FD keeps it in and compounds it, which is why 7% quarterly is really about 7.19% a year.</> },
  { q: 'Is FD interest taxed?', a: <>Yes, it is added to your income and taxed at your slab rate. Banks deduct TDS when the interest in a year passes the threshold. The calculator shows the amount before tax.</> },
];

export default function FdPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INDIA SAVINGS" title="FD Calculator" subtitle="Fixed Deposit Maturity and Interest">
        A <strong>fixed deposit</strong> earns compound interest, usually added every quarter: <InlineMath math="A = P\left(1 + \frac{r}{400}\right)^{4T}" />. See the maturity amount, the interest, and how it grows year by year.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="QUARTERLY">
        <Formula math={'A = P\\left(1 + \\frac{r}{100n}\\right)^{nT}, \\qquad \\text{interest} = A - P'} />
        <FormulaSteps steps={[
          { title: '1. Rate per period', text: <>Quarterly: i = r/400.</> },
          { title: '2. Number of periods', text: <>4 × years (plus any part quarter).</> },
          { title: '3. Grow', text: <>Multiply by (1 + i) once for each quarter.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>₹1,00,000 is deposited for 5 years at 7% a year, compounded quarterly. Find the maturity amount.</ExampleProblem>
        <ExampleStep n={1} title="RATE AND PERIODS"><MathPanel><BlockMath math="i = \frac{7}{400} = 0.0175, \qquad 4T = 4 \times 5 = 20" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="GROW"><MathPanel><BlockMath math="A = 1{,}00{,}000 \times (1.0175)^{20} = 1{,}41{,}477.8" /></MathPanel><StepText>The interest is ₹41,477.8, against ₹35,000 if it were simple interest.</StepText></ExampleStep>
        <Conclusion result="Maturity ₹1,41,478" math={<BlockMath math="A \approx 1{,}41{,}478" />}>The calculator below opens on this deposit.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive FD Calculator"><FdCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['rd', 'compound-interest', 'ppf']} />
    </MethodPage>
  );
}
