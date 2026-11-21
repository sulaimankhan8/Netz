'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.simultaneous-differential-equations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why do x and y share C₁ and C₂?", a: <>y is found from x, not solved on its own, so no new constants appear. Solving both separately would give four constants that are not independent.</> },
  { q: "What if b = 0?", a: <>Then x′ = ax + f does not involve y: solve it first, then the y equation becomes a first-order equation in y.</> },
  { q: "Can I use the operator D?", a: <>Yes: Dx + 2y = eᵗ means dx/dt + 2y = eᵗ.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Simultaneous Differential Equations Solver" subtitle="Linear Systems in x(t), y(t) by Elimination">
        Two linear equations in <InlineMath math={"x(t)"} /> and <InlineMath math={"y(t)"} /> with constant coefficients are solved by <strong>eliminating</strong> one unknown: that leaves a single second-order equation, solved by CF + PI, and the other unknown follows from the first equation.
      </MethodHeader>
      <FormulaBox label="ELIMINATION" tag="x′ = ax + by + f">
        <Formula math={"x'' - (a + d)x' + (ad - bc)x = f' - df + bg, \\qquad y = \\frac{x' - ax - f}{b}"} />
        <FormulaSteps steps={[
          { title: "1. Normal form", text: <>x′ = ax + by + f, y′ = cx + dy + g.</> },
          { title: "2. Eliminate y", text: <>A second-order equation in x.</> },
          { title: "3. Back-substitute", text: <>y from the first equation.</> },
        ]} />
        <SymbolKey rows={EX['simultaneous-differential-equations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['simultaneous-differential-equations'].example} />
      <CommonMistakes items={EX['simultaneous-differential-equations'].mistakes} />
      <Lab heading="Interactive Simultaneous ODEs Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-cc","laplace-ode","eigenvalues"]} />
    </MethodPage>
  );
}
