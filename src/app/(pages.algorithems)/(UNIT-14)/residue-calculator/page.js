'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.residue-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the order of a pole?", a: <>How many times (z − a) divides the bottom, after cancelling factors shared with the top. sin z/z³ has a pole of order 2, not 3, because sin z has a zero at 0.</> },
  { q: "Is there a shortcut for simple poles?", a: <>For f = P/Q with Q(a) = 0 and Q′(a) ≠ 0, Res = P(a)/Q′(a).</> },
  { q: "What if a pole is on the contour?", a: <>Then the integral is not defined as it stands; move the contour or use a principal value.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Residue Calculator" subtitle="Poles, Residues and the Residue Theorem">
        The <strong>residue</strong> of <InlineMath math={"f"} /> at a pole is the coefficient of <InlineMath math={"\\frac{1}{z - a}"} /> in its Laurent series. The <strong>residue theorem</strong> turns a contour integral into a sum: <InlineMath math={"\\oint_C f\\,dz = 2\\pi i \\sum \\operatorname{Res}"} /> over the poles inside <InlineMath math={"C"} />.
      </MethodHeader>
      <FormulaBox label="RESIDUE AT A POLE" tag="ORDER m">
        <Formula math={"\\operatorname{Res}_{z = a} f = \\frac{1}{(m - 1)!}\\lim_{z \\to a}\\frac{d^{m-1}}{dz^{m-1}}\\left[(z - a)^m f(z)\\right]"} />
        <FormulaSteps steps={[
          { title: "1. Poles", text: <>Zeros of the bottom, with their order.</> },
          { title: "2. Residues", text: <>The limit formula at each.</> },
          { title: "3. Theorem", text: <>2πi × the residues inside.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate ∮ (z − 3)/(z² + 2z + 5) dz around |z| = 3.</ExampleProblem>
        <ExampleStep n={1} title="POLES"><MathPanel><BlockMath math={"z^2 + 2z + 5 = 0 \\Rightarrow z = -1 \\pm 2i, \\quad |{-1} \\pm 2i| = \\sqrt5 < 3"} /></MathPanel><StepText>Both are inside.</StepText></ExampleStep>
        <ExampleStep n={2} title="RESIDUES"><MathPanel><BlockMath math={"\\operatorname{Res}_{-1 + 2i} = \\frac{-4 + 2i}{4i} = \\frac12 + i, \\quad \\operatorname{Res}_{-1 - 2i} = \\frac12 - i"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="THEOREM"><MathPanel><BlockMath math={"\\oint = 2\\pi i\\left(\\tfrac12 + i + \\tfrac12 - i\\right) = 2\\pi i"} /></MathPanel></ExampleStep>
        <Conclusion result="2πi" math={<BlockMath math={"\\oint_{|z| = 3}\\frac{z - 3}{z^2 + 2z + 5}dz = 2\\pi i"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Residue Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["cauchy-integral","contour-integration","laurent-series"]} />
    </MethodPage>
  );
}
