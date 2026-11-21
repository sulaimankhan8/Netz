'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.volume-of-revolution';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When should I use shells instead of washers?", a: <>When the axis is vertical (the y-axis or x = k) and the curves are given as y = f(x): shells avoid solving for x.</> },
  { q: "What are R and r?", a: <>For a washer, R is the distance from the axis to the far curve and r to the near one. With no hole, r = 0 and it is a disc.</> },
  { q: "Can I check with a known shape?", a: <>Turning y = √(r² − x²) about the x-axis gives a sphere: V = 4πr³/3. Try the sphere example.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF INTEGRALS" title="Volume of Revolution" subtitle="Disc, Washer and Shell Methods">
        Turn a region about an axis and find the volume of the solid: <strong>discs or washers</strong> <InlineMath math={"V = \\pi\\int (R^2 - r^2)\\,dx"} /> about a horizontal axis, <strong>shells</strong> <InlineMath math={"V = 2\\pi\\int x\\,h\\,dx"} /> about a vertical one.
      </MethodHeader>
      <FormulaBox label="THE METHODS" tag="DISC • SHELL">
        <Formula math={"V_{\\text{washer}} = \\pi\\int_a^b (R^2 - r^2)\\,dx, \\qquad V_{\\text{shell}} = 2\\pi\\int_a^b (\\text{radius})(\\text{height})\\,dx"} />
        <FormulaSteps steps={[
          { title: "1. Sketch", text: <>The region and the axis.</> },
          { title: "2. Radii", text: <>R and r (washers) or radius and height (shells).</> },
          { title: "3. Integrate", text: <>From a to b.</> },
        ]} />
        <SymbolKey rows={EX['volume-of-revolution'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['volume-of-revolution'].example} />
      <CommonMistakes items={EX['volume-of-revolution'].mistakes} />
      <Lab heading="Interactive Volume of Revolution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["area-under-curve","arc-length","double-integral"]} />
    </MethodPage>
  );
}
