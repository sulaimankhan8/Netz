'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cauchy-riemann-equations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is z̄ not analytic?", a: <>For z̄ = x − iy, uₓ = 1 but v_y = −1, so the first Cauchy–Riemann equation fails everywhere.</> },
  { q: "Can a function be differentiable at only one point?", a: <>Yes: |z|² = x² + y² satisfies the equations only at z = 0. It is differentiable there but analytic nowhere, since analytic needs a whole neighbourhood.</> },
  { q: "Are the equations enough on their own?", a: <>They are necessary. With continuous partial derivatives they are also sufficient.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Cauchy-Riemann Equations Calculator" subtitle="Is f(z) Analytic? u, v, the Equations and f′(z)">
        Write <InlineMath math={"f(z) = u(x, y) + i\\,v(x, y)"} /> with <InlineMath math={"z = x + iy"} />. The function is <strong>analytic</strong> where the <strong>Cauchy–Riemann equations</strong> hold (with continuous partial derivatives), and then <InlineMath math={"f'(z) = u_x + i\\,v_x"} />.
      </MethodHeader>
      <FormulaBox label="THE EQUATIONS" tag="z = x + iy">
        <Formula math={"u_x = v_y, \\qquad u_y = -v_x, \\qquad f'(z) = u_x + i\\,v_x"} />
        <FormulaSteps steps={[
          { title: "1. Split", text: <>Put z = x + iy: f = u + iv.</> },
          { title: "2. Differentiate", text: <>uₓ, u_y, vₓ, v_y.</> },
          { title: "3. Compare", text: <>Both equations hold → analytic.</> },
        ]} />
        <SymbolKey rows={EX['cauchy-riemann-equations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['cauchy-riemann-equations'].example} />
      <CommonMistakes items={EX['cauchy-riemann-equations'].mistakes} />
      <Lab heading="Interactive Cauchy-Riemann Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["harmonic-conjugate","complex-numbers","partial-derivative"]} />
    </MethodPage>
  );
}
