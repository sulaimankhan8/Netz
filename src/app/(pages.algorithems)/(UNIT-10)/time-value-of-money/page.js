'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.time-value-of-money';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['time-value-of-money'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['time-value-of-money'].example} />
      <CommonMistakes items={EX['time-value-of-money'].mistakes} />
      <Lab heading="Interactive Time Value of Money Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","npv-irr","emi"]} />
    </MethodPage>
  );
}
