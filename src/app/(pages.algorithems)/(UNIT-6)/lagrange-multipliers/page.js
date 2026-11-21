'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LagrangeCalculator from './algorithems.lagrange-multipliers';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why does ∇f = λ∇φ work?', a: <>At the best point on the constraint, the level curve of f just touches the constraint curve, so their normals (the gradients) point the same way.</> },
  { q: 'What does λ mean?', a: <>How fast the best value of f changes if the constraint constant changes: <InlineMath math="\lambda = \frac{df^{*}}{dc}" />. Economists call it the shadow price.</> },
  { q: 'How do I know which point is the maximum?', a: <>Work out f at every candidate. On a closed, bounded constraint (circle, ellipse, sphere) the largest is the maximum and the smallest the minimum.</> },
];

export default function LagrangePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Lagrange Multipliers" subtitle="Constrained Maxima and Minima">
        Find the largest and smallest values of f(x, y) or f(x, y, z) on a constraint φ = 0. Solve <InlineMath math="\nabla f = \lambda \nabla \varphi" /> together with the constraint, then compare f at the solutions.
      </MethodHeader>
      <FormulaBox label="THE CONDITIONS" tag="∇f = λ∇φ">
        <Formula math={'f_x = \\lambda\\varphi_x, \\quad f_y = \\lambda\\varphi_y, \\quad \\varphi(x, y) = 0'} />
        <FormulaSteps steps={[
          { title: '1. Write φ = 0', text: <>Move everything in the constraint to one side.</> },
          { title: '2. Equations', text: <>One per variable, plus the constraint.</> },
          { title: '3. Compare', text: <>f at every solution.</> },
        ]} />
        <SymbolKey rows={EX['lagrange-multipliers'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['lagrange-multipliers'].example} />
      <CommonMistakes items={EX['lagrange-multipliers'].mistakes} />
      <Lab heading="Interactive Lagrange Multiplier Calculator"><LagrangeCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['maxima-minima-2var', 'partial-derivative', 'maxima-minima']} />
    </MethodPage>
  );
}
