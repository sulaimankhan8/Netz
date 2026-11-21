'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.k-map-simplifier';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are don't-cares for?", a: <>Inputs that never happen (or whose output does not matter). They may be grouped as 1s when that makes a group bigger, and left out otherwise.</> },
  { q: "Is the answer always minimal?", a: <>Yes: NETZ lists every prime implicant (Quine–McCluskey), takes the essential ones, then searches all covers for the rest.</> },
  { q: "Why Gray code order?", a: <>In 00, 01, 11, 10 neighbours differ in one bit, so adjacent cells combine.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="K-Map Simplifier" subtitle="Karnaugh Maps: Minimal SOP and POS, with the Groups Drawn">
        A <strong>Karnaugh map</strong> lays the truth table out so that neighbouring cells differ in one variable. Circling the largest blocks of 1s (1, 2, 4 or 8 cells, wrapping round the edges) gives the <strong>minimal sum of products</strong>; circling the 0s gives the product of sums.
      </MethodHeader>
      <FormulaBox label="THE RULE" tag="GRAY CODE">
        <Formula math={"AB + A\\overline{B} = A \\qquad \\text{(two neighbouring cells lose the variable that changes)}"} />
        <FormulaSteps steps={[
          { title: "1. Fill the map", text: <>1s, 0s and Xs (don&apos;t-cares).</> },
          { title: "2. Group", text: <>The largest blocks of 1s, overlapping is fine.</> },
          { title: "3. Read off", text: <>One product per group.</> },
        ]} />
        <SymbolKey rows={EX['k-map-simplifier'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['k-map-simplifier'].example} />
      <CommonMistakes items={EX['k-map-simplifier'].mistakes} />
      <Lab heading="Interactive K-Map Simplifier Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["truth-table","set-operations","modular-arithmetic"]} />
    </MethodPage>
  );
}
