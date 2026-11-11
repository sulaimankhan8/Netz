'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cauchy-integral-formula';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the point is outside C?", a: <>Then g(z)/(z − a) is analytic inside C and the integral is 0, by Cauchy&apos;s theorem.</> },
  { q: "What if there are two points inside?", a: <>Split the contour around each point (or use partial fractions) and add the parts. This is the residue theorem.</> },
  { q: "Which way round is C?", a: <>Once, anticlockwise. Going clockwise changes the sign.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Cauchy's Integral Formula Calculator" subtitle="Contour Integrals Around a Circle">
        If <InlineMath math={"g"} /> is analytic inside and on a closed curve <InlineMath math={"C"} /> and <InlineMath math={"a"} /> lies inside, then <InlineMath math={"\\oint_C \\frac{g(z)}{z - a}dz = 2\\pi i\\,g(a)"} />. Its derivative form handles higher powers of <InlineMath math={"(z - a)"} />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="a INSIDE C">
        <Formula math={"\\oint_C \\frac{g(z)}{(z - a)^{n+1}}\\,dz = \\frac{2\\pi i}{n!}\\,g^{(n)}(a)"} />
        <FormulaSteps steps={[
          { title: "1. Points", text: <>Where the bottom is zero.</> },
          { title: "2. Inside?", text: <>Only points inside C count.</> },
          { title: "3. Formula", text: <>2πi g(a), or the derivative form.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate ∮ e²ᶻ/(z + 1)⁴ dz around |z| = 3.</ExampleProblem>
        <ExampleStep n={1} title="THE POINT"><MathPanel><BlockMath math={"a = -1 \\text{ (inside } |z| = 3), \\quad n + 1 = 4, \\quad g(z) = e^{2z}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DERIVATIVE"><MathPanel><BlockMath math={"g'''(z) = 8e^{2z}, \\quad g'''(-1) = 8e^{-2}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="FORMULA"><MathPanel><BlockMath math={"\\oint = \\frac{2\\pi i}{3!}\\cdot 8e^{-2} = \\frac{8\\pi i}{3e^{2}}"} /></MathPanel></ExampleStep>
        <Conclusion result="8πi/(3e²)" math={<BlockMath math={"\\oint_C \\frac{e^{2z}}{(z + 1)^4}dz = \\frac{8\\pi i}{3e^{2}}"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Cauchy Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["residues","laurent-series","cauchy-riemann"]} />
    </MethodPage>
  );
}
