'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.time-value-of-money';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the difference between an ordinary annuity and an annuity due?", a: <>Payments at the end of each period (ordinary) or at the start (due). An annuity due is worth (1 + i) times as much.</> },
  { q: "How can a perpetuity have a finite value?", a: <>Payments far in the future are discounted so heavily that the infinite sum converges: PV = PMT/i.</> },
  { q: "When does a bond sell above face value?", a: <>When its coupon rate is higher than the market yield: buyers pay a premium for the bigger coupons.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="Time Value of Money Calculator" subtitle="Annuities, Perpetuities, Sinking Funds and Bonds">
        Money now is worth more than money later. Discount future payments to a <strong>present value</strong> or grow them to a <strong>future value</strong>: annuities (ordinary and due), perpetuities, sinking funds and bond prices.
      </MethodHeader>
      <FormulaBox label="ANNUITY FORMULAS" tag="i PER PERIOD">
        <Formula math={"PV = PMT\\cdot\\frac{1 - (1 + i)^{-n}}{i}, \\qquad FV = PMT\\cdot\\frac{(1 + i)^{n} - 1}{i}"} />
        <FormulaSteps steps={[
          { title: "1. Rate per period", text: <>i = yearly rate ÷ payments a year.</> },
          { title: "2. Periods", text: <>n = years × payments a year.</> },
          { title: "3. Formula", text: <>Times (1 + i) for an annuity due.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the present value of ₹10,000 a year for 5 years at 8%.</ExampleProblem>
        <ExampleStep n={1} title="FORMULA"><MathPanel><BlockMath math={"PV = 10{,}000\\cdot\\frac{1 - (1.08)^{-5}}{0.08}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="VALUE"><MathPanel><BlockMath math={"= 10{,}000 \\times 3.9927 = 39{,}927.10"} /></MathPanel><StepText>Worth less than the ₹50,000 paid, because later rupees are discounted.</StepText></ExampleStep>
        <Conclusion result="₹39,927.10" math={<BlockMath math={"PV \\approx 39{,}927.10"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Time Value of Money Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","npv-irr","emi"]} />
    </MethodPage>
  );
}
