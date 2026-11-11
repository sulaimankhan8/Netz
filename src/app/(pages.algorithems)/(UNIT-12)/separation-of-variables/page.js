'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.separation-of-variables';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why must the separation constant be negative?", a: <>With a positive or zero constant the only X with X(0) = X(L) = 0 is X = 0. A negative one gives X = sin(nπx/L).</> },
  { q: "What does each term of the heat solution do?", a: <>Each mode decays like e^{'{'}−c²n²π²t/L²{'}'}, the higher ones much faster, so the temperature soon looks like the first sine.</> },
  { q: "How is the Laplace case different?", a: <>The y part satisfies Y″ = λY, giving sinh(nπy/a); the coefficient is divided by sinh(nπb/a) to match the top edge.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Separation of Variables Calculator" subtitle="Heat, Wave and Laplace Equations with Fourier Series">
        Write <InlineMath math={"u = X(x)T(t)"} />: the PDE splits into two ODEs linked by a constant. The boundary conditions allow only <InlineMath math={"X = \\sin\\frac{n\\pi x}{L}"} />, and the starting shape is matched by a <strong>Fourier sine series</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE SOLUTIONS" tag="u = 0 AT THE ENDS">
        <Formula math={"\\text{heat: } \\sum b_n \\sin\\frac{n\\pi x}{L}e^{-c^2n^2\\pi^2t/L^2}, \\quad \\text{wave: } \\sum \\left(a_n\\cos\\frac{n\\pi ct}{L} + b_n\\sin\\frac{n\\pi ct}{L}\\right)\\sin\\frac{n\\pi x}{L}"} />
        <FormulaSteps steps={[
          { title: "1. Separate", text: <>u = X(x)T(t).</> },
          { title: "2. Eigenfunctions", text: <>X = sin(nπx/L) from u = 0 at both ends.</> },
          { title: "3. Fourier", text: <>bₙ = (2/L)∫ f sin(nπx/L) dx.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve u_t = u_xx on 0 &lt; x &lt; π with u(0, t) = u(π, t) = 0 and u(x, 0) = x(π − x).</ExampleProblem>
        <ExampleStep n={1} title="SEPARATE"><MathPanel><BlockMath math={"u = X(x)T(t): \\ X'' + n^2X = 0, \\ T' = -n^2T \\Rightarrow u_n = \\sin nx\\,e^{-n^2t}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FOURIER"><MathPanel><BlockMath math={"b_n = \\frac{2}{\\pi}\\int_0^{\\pi} x(\\pi - x)\\sin nx\\,dx = \\frac{4(1 - (-1)^n)}{\\pi n^3}"} /></MathPanel><StepText>So bₙ = 8/(πn³) for odd n and 0 for even n.</StepText></ExampleStep>
        <Conclusion result="u = Σ 8/(πn³) sin nx e^{−n²t} (odd n)" math={<BlockMath math={"u(x, t) = \\frac{8}{\\pi}\\sum_{n \\text{ odd}} \\frac{\\sin nx}{n^3}\\,e^{-n^2t}"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Separation of Variables Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","heat-equation","pde-constant-coefficients"]} />
    </MethodPage>
  );
}
