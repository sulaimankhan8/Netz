'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.line-integral';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When does the path not matter?", a: <>When curl F = 0 (a conservative field): then F = ∇φ and the work is φ(end) − φ(start). Round a closed path it is 0.</> },
  { q: "How do I enter a broken line?", a: <>Type points joined by arrows, like (0,0) -&gt; (1,0) -&gt; (1,1). Each segment is r = p + t(q − p) for 0 ≤ t ≤ 1.</> },
  { q: "Which way round?", a: <>The direction matters for work: going the other way changes the sign. ∫ f ds does not depend on the direction.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Line Integral Calculator" subtitle="Work Done Along a Curve, Step by Step">
        A <strong>line integral</strong> adds a quantity along a curve. For a force <InlineMath math={"\\mathbf{F}"} /> it gives the <strong>work done</strong> <InlineMath math={"\\int_C \\mathbf{F}\\cdot d\\mathbf{r}"} />; for a function <InlineMath math={"f"} /> it gives <InlineMath math={"\\int_C f\\,ds"} />, which is the arc length when <InlineMath math={"f = 1"} />.
      </MethodHeader>
      <FormulaBox label="ALONG r(t)" tag="a ≤ t ≤ b">
        <Formula math={"\\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\cdot\\mathbf{r}'(t)\\,dt, \\qquad \\int_C f\\,ds = \\int_a^b f(\\mathbf{r}(t))\\,|\\mathbf{r}'(t)|\\,dt"} />
        <FormulaSteps steps={[
          { title: "1. Parametrise", text: <>r(t) and r′(t).</> },
          { title: "2. Substitute", text: <>F(r(t))·r′(t), one function of t.</> },
          { title: "3. Integrate", text: <>From t = a to t = b.</> },
        ]} />
        <SymbolKey rows={EX['line-integral'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['line-integral'].example} />
      <CommonMistakes items={EX['line-integral'].mistakes} />
      <Lab heading="Interactive Line Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["greens-theorem","grad-div-curl","arc-length"]} />
    </MethodPage>
  );
}
