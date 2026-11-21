'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.greens-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why anticlockwise?", a: <>With the region on your left as you walk round, the theorem has a plus sign. Going clockwise flips the sign of the line integral.</> },
  { q: "How does Green give an area?", a: <>With M = −y, N = x, N_x − M_y = 2, so the area is ½∮(x dy − y dx).</> },
  { q: "What if the region has a hole?", a: <>Then C has two parts: the outer curve anticlockwise and the inner one clockwise.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Green's Theorem Calculator" subtitle="Line Integral and Double Integral, Both Worked Out">
        <strong>Green&apos;s theorem</strong> links a line integral round a closed curve <InlineMath math={"C"} /> with a double integral over the region <InlineMath math={"R"} /> inside it. The page works out both sides independently, so you can see them agree.
      </MethodHeader>
      <FormulaBox label="GREEN'S THEOREM" tag="C ANTICLOCKWISE">
        <Formula math={"\\oint_C (M\\,dx + N\\,dy) = \\iint_R \\left(\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}\\right)dA"} />
        <FormulaSteps steps={[
          { title: "1. Boundary", text: <>Each piece of C, anticlockwise.</> },
          { title: "2. Line side", text: <>Add the line integrals.</> },
          { title: "3. Area side", text: <>∬(N_x − M_y) dA.</> },
        ]} />
        <SymbolKey rows={EX['greens-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['greens-theorem'].example} />
      <CommonMistakes items={EX['greens-theorem'].mistakes} />
      <Lab heading="Interactive Green's Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["line-integral","stokes-theorem","double-integral"]} />
    </MethodPage>
  );
}
