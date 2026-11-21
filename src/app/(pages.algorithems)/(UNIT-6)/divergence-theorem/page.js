'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.divergence-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is the theorem useful?", a: <>One triple integral replaces six (or more) surface integrals; or, the other way, a hard volume integral becomes a flux.</> },
  { q: "What does a zero divergence mean?", a: <>The field is solenoidal: as much flows in as out of every closed surface.</> },
  { q: "Why does a sphere with F = r give 4πa³?", a: <>∇·r = 3, so the flux is 3 × the volume (4/3)πa³.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Divergence Theorem Calculator" subtitle="Gauss's Theorem: Flux Out Equals Total Divergence">
        <strong>Gauss&apos;s divergence theorem</strong> says the flux of <InlineMath math={"\\mathbf{F}"} /> out of a closed surface equals the integral of <InlineMath math={"\\nabla\\cdot\\mathbf{F}"} /> over the solid inside. Here the flux through every face and the volume integral are both worked out.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="n OUTWARD">
        <Formula math={"\\oint\\!\\!\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV"} />
        <FormulaSteps steps={[
          { title: "1. Divergence", text: <>∇·F.</> },
          { title: "2. Volume side", text: <>∭ ∇·F dV.</> },
          { title: "3. Surface side", text: <>The flux through each face, added.</> },
        ]} />
        <SymbolKey rows={EX['divergence-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['divergence-theorem'].example} />
      <CommonMistakes items={EX['divergence-theorem'].mistakes} />
      <Lab heading="Interactive Divergence Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["surface-integral","grad-div-curl","triple-integral"]} />
    </MethodPage>
  );
}
