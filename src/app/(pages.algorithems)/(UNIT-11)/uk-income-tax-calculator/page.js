'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.uk-income-tax-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the 60% tax trap?", a: <>Between £100,000 and £125,140 the personal allowance shrinks by £1 for every £2 earned, so each extra pound costs 40% tax plus 20% from the lost allowance.</> },
  { q: "Why is Scotland different?", a: <>Scotland sets its own income tax bands and rates for wages, with six bands from 19% to 48%. National Insurance is the same everywhere.</> },
  { q: "How does salary sacrifice help?", a: <>The pension comes out before both income tax and National Insurance, so it saves more than paying in from take-home pay.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="UK Income Tax Calculator" subtitle="Income Tax, National Insurance and Take-Home Pay">
        Work out UK take-home pay: the <strong>personal allowance</strong> (tapered above £100,000), income tax band by band for England, Wales and Northern Ireland or for Scotland, and employee <strong>National Insurance</strong>.
      </MethodHeader>
      <FormulaBox label="THE BANDS" tag="ENGLAND, WALES, NI">
        <Formula math={"\\text{tax} = 20\\% \\text{ to } \\pounds50{,}270, \\ 40\\% \\text{ to } \\pounds125{,}140, \\ 45\\% \\text{ above}; \\qquad NI = 8\\% \\text{ from } \\pounds12{,}570 \\text{ to } \\pounds50{,}270, \\ 2\\% \\text{ above}"} />
        <FormulaSteps steps={[
          { title: "1. Allowance", text: <>£12,570, less £1 per £2 over £100,000.</> },
          { title: "2. Income tax", text: <>Band by band.</> },
          { title: "3. NI", text: <>8% and 2%.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A £45,000 salary with 5% pension by salary sacrifice. Find the take-home pay.</ExampleProblem>
        <ExampleStep n={1} title="PAY"><MathPanel><BlockMath math={"45{,}000 - 2{,}250 = 42{,}750, \\quad \\text{taxable} = 42{,}750 - 12{,}570 = 30{,}180"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TAX AND NI"><MathPanel><BlockMath math={"30{,}180 \\times 20\\% = 6{,}036, \\quad 30{,}180 \\times 8\\% = 2{,}414.40"} /></MathPanel></ExampleStep>
        <Conclusion result="£34,299.60 a year" math={<BlockMath math={"45{,}000 - 2{,}250 - 6{,}036 - 2{,}414.40 = 34{,}299.60"} />}>The calculator below opens on this salary.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive UK Income Tax Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["us-income-tax","vat","percentage"]} />
    </MethodPage>
  );
}
