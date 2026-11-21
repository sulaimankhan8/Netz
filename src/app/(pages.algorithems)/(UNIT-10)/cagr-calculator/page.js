'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cagr-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why not just divide the total growth by the years?", a: <>Growth compounds: 16.5% a year for 6 years multiplies the money by 2.5, while 25% a year would multiply it by 3.8.</> },
  { q: "What does CAGR hide?", a: <>The ups and downs in between. Two investments with the same CAGR can have had very different journeys.</> },
  { q: "What is the real return?", a: <>The growth after removing inflation — how much more you can actually buy.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="CAGR Calculator" subtitle="Compound Annual Growth Rate and Real Return">
        The <strong>compound annual growth rate</strong> is the steady yearly rate that turns the starting value into the final one: <InlineMath math={"\\text{CAGR} = (\\text{end}/\\text{start})^{1/n} - 1"} />. Subtract inflation for the real return.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="n YEARS">
        <Formula math={"\\text{CAGR} = \\left(\\frac{\\text{end}}{\\text{start}}\\right)^{1/n} - 1, \\qquad \\text{real} = \\frac{1 + \\text{CAGR}}{1 + \\text{inflation}} - 1"} />
        <FormulaSteps steps={[
          { title: "1. Ratio", text: <>End ÷ start.</> },
          { title: "2. Root", text: <>The nth root for n years.</> },
          { title: "3. Subtract 1", text: <>As a percentage.</> },
        ]} />
        <SymbolKey rows={EX['cagr-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['cagr-calculator'].example} />
      <CommonMistakes items={EX['cagr-calculator'].mistakes} />
      <Lab heading="Interactive CAGR Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","lumpsum","npv-irr"]} />
    </MethodPage>
  );
}
