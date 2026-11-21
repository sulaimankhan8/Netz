'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bill-discounting';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are days of grace?", a: <>Three extra days allowed after the nominal due date of a bill; the legally due date is used for the discount.</> },
  { q: "Why is the banker's discount bigger?", a: <>It charges interest on the whole face value, while the true discount charges it only on the present worth, which is smaller.</> },
  { q: "What does the bank pay?", a: <>The face value minus the banker&apos;s discount (the discounted value).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • COMMERCIAL MATHS" title="Bill Discounting Calculator: Banker's Discount and True Discount" subtitle="Banker's Gain, Present Worth and Days of Grace">
        When a bill is cashed at a bank before it is due, the bank deducts the <strong>banker&apos;s discount</strong>: simple interest on the face value. The <strong>true discount</strong> is interest on the present worth only, so the bank gains a little: the <strong>banker&apos;s gain</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE DISCOUNTS" tag="t IN YEARS">
        <Formula math={"BD = Frt, \\qquad TD = \\frac{Frt}{1 + rt}, \\qquad BG = BD - TD = TD\\cdot rt"} />
        <FormulaSteps steps={[
          { title: "1. Time", text: <>Days to the legally due date, over 365.</> },
          { title: "2. Discounts", text: <>BD and TD.</> },
          { title: "3. Gain", text: <>BG = BD − TD.</> },
        ]} />
        <SymbolKey rows={EX['bill-discounting'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['bill-discounting'].example} />
      <CommonMistakes items={EX['bill-discounting'].mistakes} />
      <Lab heading="Interactive Bill Discounting Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","percentage","tvm"]} />
    </MethodPage>
  );
}
