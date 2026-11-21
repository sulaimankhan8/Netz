'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.grad-div-curl';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What do grad, div and curl mean?', a: <>∇φ points in the direction φ increases fastest. ∇·F measures how much F spreads out from a point (sources). ∇×F measures how much F swirls around it.</> },
  { q: 'What are solenoidal and irrotational fields?', a: <>Solenoidal: <InlineMath math="\nabla\cdot\vec F = 0" /> (no sources). Irrotational: <InlineMath math="\nabla\times\vec F = 0" />; then <InlineMath math="\vec F = \nabla\phi" /> for a scalar potential φ.</> },
  { q: 'How do I find a directional derivative?', a: <>Dot the gradient with a <strong>unit</strong> vector: <InlineMath math="D_{\hat a}\phi = \nabla\phi\cdot\frac{\vec a}{|\vec a|}" />. Its largest value is |∇φ|.</> },
];

export default function GradDivCurlPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • VECTOR CALCULUS" title="Gradient, Divergence and Curl" subtitle="Directional Derivative, Solenoidal and Irrotational Fields">
        Apply <InlineMath math="\nabla = \mathbf{i}\partial_x + \mathbf{j}\partial_y + \mathbf{k}\partial_z" /> to a scalar φ (the <strong>gradient</strong>) or a vector field F (<strong>divergence</strong> and <strong>curl</strong>), at a point if you like, and find scalar potentials.
      </MethodHeader>
      <FormulaBox label="THE OPERATORS" tag="∇">
        <Formula math={'\\nabla\\phi = (\\phi_x, \\phi_y, \\phi_z), \\quad \\nabla\\cdot\\vec F = P_x + Q_y + R_z, \\quad \\nabla\\times\\vec F = (R_y - Q_z,\\ P_z - R_x,\\ Q_x - P_y)'} />
        <FormulaSteps steps={[
          { title: '1. Partials', text: <>Of each component.</> },
          { title: '2. Combine', text: <>As a vector, a sum or a determinant.</> },
          { title: '3. At a point', text: <>Put the numbers in.</> },
        ]} />
        <SymbolKey rows={EX['grad-div-curl'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['grad-div-curl'].example} />
      <CommonMistakes items={EX['grad-div-curl'].mistakes} />
      <Lab heading="Interactive Grad, Div & Curl Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['partial-derivative', 'vectors', 'jacobian']} />
    </MethodPage>
  );
}
