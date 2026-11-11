'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.divergence-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Verify the theorem for F = 4xz i − y² j + yz k over the unit cube 0 ≤ x, y, z ≤ 1.</ExampleProblem>
        <ExampleStep n={1} title="DIVERGENCE"><MathPanel><BlockMath math={"\\nabla\\cdot\\mathbf{F} = 4z - 2y + y = 4z - y"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="VOLUME SIDE"><MathPanel><BlockMath math={"\\iiint (4z - y)\\,dV = 2 - \\tfrac12 = \\tfrac32"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="FACES"><MathPanel><BlockMath math={"x = 1: \\iint 4z = 2, \\quad y = 1: \\iint -1 = -1, \\quad z = 1: \\iint y = \\tfrac12, \\quad \\text{others } 0"} /></MathPanel><StepText>The total flux is 2 − 1 + ½ = 3/2.</StepText></ExampleStep>
        <Conclusion result="Both sides = 3/2" math={<BlockMath math={"\\oint\\!\\!\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\frac32"} />}>The calculator below opens on this cube.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Divergence Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["surface-integral","grad-div-curl","triple-integral"]} />
    </MethodPage>
  );
}
