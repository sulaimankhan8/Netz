'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.depreciation-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which method is used in India for tax?", a: <>The Income Tax Act uses the written-down value method with fixed rates for blocks of assets; company accounts may use straight line.</> },
  { q: "Why does WDV never reach zero?", a: <>It always takes a percentage of what is left, so the value shrinks but never quite vanishes; the exact rate is chosen to land on the salvage value.</> },
  { q: "Why use sum of years' digits?", a: <>Many assets lose value fastest when new; SYD charges more in the early years in a simple, predictable way.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="Depreciation Calculator" subtitle="Straight Line, Written-Down Value and Sum of Years' Digits">
        <strong>Depreciation</strong> spreads the cost of an asset over its life. Straight line charges the same each year; the <strong>written-down value</strong> method charges a fixed percentage of a falling value; <strong>sum of years&apos; digits</strong> front-loads the charge.
      </MethodHeader>
      <FormulaBox label="THE METHODS" tag="C, S, n">
        <Formula math={"D_{SL} = \\frac{C - S}{n}, \\qquad r_{WDV} = 1 - \\left(\\frac{S}{C}\\right)^{1/n}, \\qquad D_t = (C - S)\\frac{n - t + 1}{n(n+1)/2}"} />
        <FormulaSteps steps={[
          { title: "1. Cost, salvage, life", text: <>C, S and n.</> },
          { title: "2. Method", text: <>The yearly charge.</> },
          { title: "3. Schedule", text: <>Year by year.</> },
        ]} />
        <SymbolKey rows={EX['depreciation-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['depreciation-calculator'].example} />
      <CommonMistakes items={EX['depreciation-calculator'].mistakes} />
      <Lab heading="Interactive Depreciation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","tvm","percentage"]} />
    </MethodPage>
  );
}
