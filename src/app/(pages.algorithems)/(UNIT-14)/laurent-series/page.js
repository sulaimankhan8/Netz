'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laurent-series';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why are there different series for one function?", a: <>Each ring between poles needs its own expansion, because a geometric series only converges for |u| &lt; 1.</> },
  { q: "What is the principal part?", a: <>The terms with negative powers. When the ring is a punctured disc around a pole, the coefficient of 1/(z − z₀) is the residue.</> },
  { q: "What about eᶻ/z²?", a: <>Divide the Taylor series of eᶻ by z²: 1/z² + 1/z + 1/2 + z/6 + ⋯, valid for 0 &lt; |z| &lt; ∞.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Laurent Series Calculator" subtitle="Taylor and Laurent Expansions in Every Region">
        A <strong>Laurent series</strong> <InlineMath math={"\\sum_{n=-\\infty}^{\\infty} c_n (z - z_0)^n"} /> represents <InlineMath math={"f"} /> in a ring between its poles. Inside the first pole it is a <strong>Taylor series</strong>; each ring outward gives a different expansion of the same function.
      </MethodHeader>
      <FormulaBox label="THE TWO EXPANSIONS" tag="|u| < 1">
        <Formula math={"\\frac{1}{z - p} = -\\frac{1}{p}\\sum_{n=0}^{\\infty}\\left(\\frac{z}{p}\\right)^n \\ (|z| < |p|), \\qquad \\frac{1}{z - p} = \\frac{1}{z}\\sum_{n=0}^{\\infty}\\left(\\frac{p}{z}\\right)^n \\ (|z| > |p|)"} />
        <FormulaSteps steps={[
          { title: "1. Partial fractions", text: <>One fraction per pole.</> },
          { title: "2. Choose", text: <>Pole inside the ring or outside it?</> },
          { title: "3. Expand", text: <>A geometric series in z/p or p/z.</> },
        ]} />
        <SymbolKey rows={EX['laurent-series'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['laurent-series'].example} />
      <CommonMistakes items={EX['laurent-series'].mistakes} />
      <Lab heading="Interactive Laurent Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["residues","taylor-series","power-series"]} />
    </MethodPage>
  );
}
