'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cauchy-riemann-equations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Show that f(z) = z² + 2z is analytic and find f′(z).</ExampleProblem>
        <ExampleStep n={1} title="SPLIT"><MathPanel><BlockMath math={"(x + iy)^2 + 2(x + iy) = (x^2 - y^2 + 2x) + i(2xy + 2y)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="CAUCHY–RIEMANN"><MathPanel><BlockMath math={"u_x = 2x + 2 = v_y, \\qquad u_y = -2y = -v_x"} /></MathPanel><StepText>Both hold everywhere, and the partials are continuous.</StepText></ExampleStep>
        <ExampleStep n={3} title="DERIVATIVE"><MathPanel><BlockMath math={"f'(z) = u_x + i\\,v_x = 2x + 2 + 2iy = 2z + 2"} /></MathPanel></ExampleStep>
        <Conclusion result="Analytic; f′(z) = 2z + 2" math={<BlockMath math={"f'(z) = 2z + 2"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Cauchy-Riemann Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["harmonic-conjugate","complex-numbers","partial-derivative"]} />
    </MethodPage>
  );
}
