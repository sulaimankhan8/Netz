'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.capital-gains-tax-india';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What changed on 23 July 2024?", a: <>Equity STCG went from 15% to 20%, equity LTCG from 10% to 12.5% with the exemption raised to ₹1.25 lakh, and most other long-term gains moved to 12.5% without indexation.</> },
  { q: "Can I still use indexation on property?", a: <>For land or buildings bought before 23 July 2024, a resident individual can pay the lower of 12.5% without indexation and 20% with indexation. The calculator works out both.</> },
  { q: "Why are debt mutual funds always short-term?", a: <>Units bought from 1 April 2023 are taxed at your slab rate however long you hold them.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="Capital Gains Tax Calculator (India)" subtitle="STCG, LTCG, Indexation and the ₹1.25 Lakh Exemption">
        When you sell shares, property or gold for more than you paid, the profit is a <strong>capital gain</strong>. How long you held it decides whether it is short-term or long-term, and that decides the rate. From 23 July 2024 listed equity pays 20% short-term and 12.5% long-term above ₹1.25 lakh a year.
      </MethodHeader>
      <FormulaBox label="THE CALCULATION" tag="RESIDENT INDIVIDUAL">
        <Formula math={"\\text{gain} = \\text{sale} - \\text{cost} - \\text{expenses}, \\qquad \\text{indexed cost} = \\text{cost} \\times \\frac{CII_{\\text{sale}}}{CII_{\\text{purchase}}}"} />
        <FormulaSteps steps={[
          { title: "1. Holding period", text: <>Short- or long-term.</> },
          { title: "2. Gain", text: <>Less any exemption.</> },
          { title: "3. Rate", text: <>Special rate or your slab, plus 4% cess.</> },
        ]} />
        <SymbolKey rows={EX['capital-gains-tax-india'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['capital-gains-tax-india'].example} />
      <CommonMistakes items={EX['capital-gains-tax-india'].mistakes} />
      <Lab heading="Interactive Capital Gains Tax Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","cagr","lumpsum"]} />
    </MethodPage>
  );
}
