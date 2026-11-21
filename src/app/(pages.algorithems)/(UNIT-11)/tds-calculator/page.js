'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.tds-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Is TDS an extra tax?", a: <>No. It is advance tax collected by the payer. The receiver claims it against their final tax, or gets a refund.</> },
  { q: "What happens without a PAN?", a: <>Section 206AA makes the rate at least 20%.</> },
  { q: "Why can I type my own rate?", a: <>TDS rates and limits depend on the exact payment and change with budgets; a lower-deduction certificate can also set a special rate.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="TDS Calculator" subtitle="Tax Deducted at Source, Net Payment and the No-PAN Rate">
        <strong>Tax deducted at source</strong> is taken out by the payer before you are paid, and credited to your income tax. Type the rate (or pick a common section), and see the TDS and what reaches the receiver.
      </MethodHeader>
      <FormulaBox label="THE CALCULATION" tag="AT SOURCE">
        <Formula math={"\\text{TDS} = \\text{payment} \\times \\text{rate}, \\qquad \\text{net} = \\text{payment} - \\text{TDS}, \\qquad \\text{no PAN: rate} = \\max(\\text{rate}, 20\\%)"} />
        <FormulaSteps steps={[
          { title: "1. Limit", text: <>Below it, no TDS.</> },
          { title: "2. Rate", text: <>The section rate, or 20% without PAN.</> },
          { title: "3. Deduct", text: <>Pay the rest.</> },
        ]} />
        <SymbolKey rows={EX['tds-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['tds-calculator'].example} />
      <CommonMistakes items={EX['tds-calculator'].mistakes} />
      <Lab heading="Interactive TDS Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","hra-exemption","gst"]} />
    </MethodPage>
  );
}
