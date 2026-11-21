'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ChangeOfOrderCalculator from './algorithems.change-of-order-of-integration';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why change the order?', a: <>Sometimes the inner integral can&apos;t be done one way but can the other. <InlineMath math="\int e^{y^2}\,dy" /> has no elementary answer, but <InlineMath math="\int e^{y^2}\,dx = x\,e^{y^2}" /> is easy.</> },
  { q: 'Why does the new integral sometimes split into two?', a: <>When the left or right edge of the region changes from one curve to another partway up, each part needs its own limits. For the region between y = x² and y = 2 − x, the right edge is x = √y below y = 1 and x = 2 − y above it.</> },
  { q: 'How do I find the new limits by hand?', a: <>Sketch the region. Draw a horizontal strip: where it enters and leaves the region give the new inner limits (solve each curve for x). The lowest and highest points of the region give the outer limits.</> },
];

export default function ChangeOfOrderPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Change of Order of Integration" subtitle="Swap dy dx and dx dy, With the Region Sketched">
        Rewrite <InlineMath math="\int\int f\,dy\,dx" /> as <InlineMath math="\int\int f\,dx\,dy" /> over the same region: find where y runs, then solve each boundary curve for x. Splits into pieces when the edge changes.
      </MethodHeader>
      <FormulaBox label="SAME REGION, OTHER STRIPS" tag="dy dx ⇄ dx dy">
        <Formula math={'\\int_a^b\\int_{g_1(x)}^{g_2(x)} f\\,dy\\,dx = \\int_c^d\\int_{h_1(y)}^{h_2(y)} f\\,dx\\,dy'} />
        <FormulaSteps steps={[
          { title: '1. Sketch', text: <>Draw the curves and shade the region.</> },
          { title: '2. New strip', text: <>Horizontal instead of vertical.</> },
          { title: '3. Solve for x', text: <>Each curve gives the new inner limits.</> },
        ]} />
        <SymbolKey rows={EX['change-of-order-of-integration'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['change-of-order-of-integration'].example} />
      <CommonMistakes items={EX['change-of-order-of-integration'].mistakes} />
      <Lab heading="Interactive Change of Order Calculator"><ChangeOfOrderCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['double-integral', 'triple-integral', 'area-under-curve']} />
    </MethodPage>
  );
}
