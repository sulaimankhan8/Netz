'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.stokes-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which way round the edge?", a: <>Curl the fingers of your right hand round C; the thumb points along n. For an upward normal, C goes anticlockwise seen from above.</> },
  { q: "Is Green's theorem a special case?", a: <>Yes: Stokes for a flat region in the plane z = 0 with F = (M, N, 0) is exactly Green&apos;s theorem.</> },
  { q: "Why do different surfaces with the same edge give the same flux?", a: <>Because both equal the same line integral round the edge.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Stokes' Theorem Calculator" subtitle="Circulation Round the Edge and Flux of the Curl">
        <strong>Stokes&apos; theorem</strong> says the circulation of <InlineMath math={"\\mathbf{F}"} /> round the edge <InlineMath math={"C"} /> of a surface equals the flux of <InlineMath math={"\\nabla \\times \\mathbf{F}"} /> through it. Both sides are worked out here.
      </MethodHeader>
      <FormulaBox label="STOKES' THEOREM" tag="RIGHT-HAND RULE">
        <Formula math={"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F})\\cdot\\mathbf{n}\\,dS"} />
        <FormulaSteps steps={[
          { title: "1. Curl", text: <>∇ × F.</> },
          { title: "2. Surface side", text: <>Flux of the curl through S.</> },
          { title: "3. Edge side", text: <>Work round C.</> },
        ]} />
        <SymbolKey rows={EX['stokes-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['stokes-theorem'].example} />
      <CommonMistakes items={EX['stokes-theorem'].mistakes} />
      <Lab heading="Interactive Stokes' Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["greens-theorem","grad-div-curl","divergence-theorem"]} />
    </MethodPage>
  );
}
