'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.z-transform';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the region of convergence?", a: <>The values of z where the series converges. For aⁿ it is |z| &gt; |a|; for a sum, the overlap of the regions.</> },
  { q: "Why is Z{cos(nπ/2)} = z²/(z² + 1)?", a: <>Use Z{'{'}cos θn{'}'} = z(z − cos θ)/(z² − 2z cos θ + 1) with θ = π/2, where cos θ = 0.</> },
  { q: "How do I enter a delayed impulse?", a: <>Type delta(n - k); its transform is z^{'{'}−k{'}'}.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Z-Transform Calculator" subtitle="With the Rules Used and the Region of Convergence">
        The <strong>Z-transform</strong> <InlineMath math={"X(z) = \\sum_{n=0}^{\\infty} x(n)z^{-n}"} /> turns a sequence into a function of <InlineMath math={"z"} />. It does for difference equations what the Laplace transform does for differential equations.
      </MethodHeader>
      <FormulaBox label="THE KEY RULES" tag="ONE-SIDED">
        <Formula math={"\\mathcal{Z}\\{a^n\\} = \\frac{z}{z - a}, \\qquad \\mathcal{Z}\\{a^n f(n)\\} = F\\!\\left(\\frac{z}{a}\\right), \\qquad \\mathcal{Z}\\{n f(n)\\} = -z\\frac{d}{dz}F(z)"} />
        <FormulaSteps steps={[
          { title: "1. Base", text: <>Z{'{'}1{'}'}, Z{'{'}cos θn{'}'}, Z{'{'}sin θn{'}'}.</> },
          { title: "2. Rules", text: <>Damping by aⁿ, multiplying by n.</> },
          { title: "3. Add", text: <>Linearity; |z| &gt; the largest |a|.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find Z{'{'}n·2ⁿ{'}'}.</ExampleProblem>
        <ExampleStep n={1} title="BASE"><MathPanel><BlockMath math={"\\mathcal{Z}\\{2^n\\} = \\frac{z}{z - 2}, \\quad |z| > 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MULTIPLY BY n"><MathPanel><BlockMath math={"\\mathcal{Z}\\{n\\,2^n\\} = -z\\frac{d}{dz}\\left(\\frac{z}{z - 2}\\right) = -z\\cdot\\frac{-2}{(z - 2)^2}"} /></MathPanel></ExampleStep>
        <Conclusion result="2z/(z − 2)²" math={<BlockMath math={"\\mathcal{Z}\\{n\\,2^n\\} = \\frac{2z}{(z - 2)^2}"} />}>The calculator below opens on this sequence.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Z-Transform Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["inverse-z","difference-equation-z","laplace"]} />
    </MethodPage>
  );
}
