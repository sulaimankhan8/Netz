'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.related-rates';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why put the numbers in only at the end?", a: <>The relation must hold at every moment so it can be differentiated; the values describe one moment, after differentiating.</> },
  { q: "What does a negative rate mean?", a: <>The quantity is decreasing: the top of the ladder is coming down.</> },
  { q: "Can I type my own problem?", a: <>Problems are given as templates so they can be read reliably; change any number in them.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Related Rates" subtitle="Ladders, Cones, Balloons and Shadows">
        When quantities linked by an equation change with time, differentiate the equation with respect to t to link their <strong>rates</strong>. Pick a classic problem and change the numbers.
      </MethodHeader>
      <FormulaBox label="THE METHOD" tag="d/dt">
        <Formula math={"x^2 + y^2 = L^2 \\;\\Rightarrow\\; 2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0"} />
        <FormulaSteps steps={[
          { title: "1. Relation", text: <>An equation between the quantities.</> },
          { title: "2. Differentiate", text: <>With respect to t (chain rule).</> },
          { title: "3. Substitute", text: <>The values at that moment.</> },
        ]} />
        <SymbolKey rows={EX['related-rates'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['related-rates'].example} />
      <CommonMistakes items={EX['related-rates'].mistakes} />
      <Lab heading="Interactive Related Rates Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["implicit","derivative","optimization"]} />
    </MethodPage>
  );
}
