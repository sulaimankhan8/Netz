'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.residue-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the order of a pole?", a: <>How many times (z − a) divides the bottom, after cancelling factors shared with the top. sin z/z³ has a pole of order 2, not 3, because sin z has a zero at 0.</> },
  { q: "Is there a shortcut for simple poles?", a: <>For f = P/Q with Q(a) = 0 and Q′(a) ≠ 0, Res = P(a)/Q′(a).</> },
  { q: "What if a pole is on the contour?", a: <>Then the integral is not defined as it stands; move the contour or use a principal value.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Residue Calculator" subtitle="Poles, Residues and the Residue Theorem">
        The <strong>residue</strong> of <InlineMath math={"f"} /> at a pole is the coefficient of <InlineMath math={"\\frac{1}{z - a}"} /> in its Laurent series. The <strong>residue theorem</strong> turns a contour integral into a sum: <InlineMath math={"\\oint_C f\\,dz = 2\\pi i \\sum \\operatorname{Res}"} /> over the poles inside <InlineMath math={"C"} />.
      </MethodHeader>
      <FormulaBox label="RESIDUE AT A POLE" tag="ORDER m">
        <Formula math={"\\operatorname{Res}_{z = a} f = \\frac{1}{(m - 1)!}\\lim_{z \\to a}\\frac{d^{m-1}}{dz^{m-1}}\\left[(z - a)^m f(z)\\right]"} />
        <FormulaSteps steps={[
          { title: "1. Poles", text: <>Zeros of the bottom, with their order.</> },
          { title: "2. Residues", text: <>The limit formula at each.</> },
          { title: "3. Theorem", text: <>2πi × the residues inside.</> },
        ]} />
        <SymbolKey rows={EX['residue-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['residue-calculator'].example} />
      <CommonMistakes items={EX['residue-calculator'].mistakes} />
      <Lab heading="Interactive Residue Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["cauchy-integral","contour-integration","laurent-series"]} />
    </MethodPage>
  );
}
