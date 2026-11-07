'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.arc-length-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why are arc-length integrals often hard?", a: <>The square root rarely simplifies. Textbook examples are chosen so that 1 + y′² is a perfect square; otherwise the value is found numerically.</> },
  { q: "What is the length of a full cardioid r = 1 + cos θ?", a: <>r² + r′² = 2 + 2cos θ = 4cos²(θ/2), so L = 8. Try it in the polar mode.</> },
  { q: "How is surface area different?", a: <>Each bit of curve ds sweeps a band of circumference 2πy, so S = 2π∫ y ds.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF INTEGRALS" title="Arc Length and Surface Area" subtitle="Cartesian, Parametric and Polar Curves">
        The <strong>length of a curve</strong> is <InlineMath math={"L = \\int \\sqrt{1 + (dy/dx)^2}\\,dx"} />. Parametric and polar curves have their own forms, and turning the curve about the x-axis gives the <strong>surface area</strong> <InlineMath math={"S = 2\\pi\\int y\\,ds"} />.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="ds">
        <Formula math={"L = \\int_a^b \\sqrt{1 + y'^2}\\,dx = \\int_{t_1}^{t_2} \\sqrt{x'^2 + y'^2}\\,dt = \\int_\\alpha^\\beta \\sqrt{r^2 + r'^2}\\,d\\theta"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate", text: <>y′, or x′ and y′, or r′.</> },
          { title: "2. Simplify", text: <>Often a perfect square under the root.</> },
          { title: "3. Integrate", text: <>Between the limits.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the length of <InlineMath math={"y = x^{3/2}"} /> from x = 0 to x = 4.</ExampleProblem>
        <ExampleStep n={1} title="DERIVATIVE"><MathPanel><BlockMath math={"y' = \\frac{3}{2}x^{1/2}, \\qquad 1 + y'^2 = 1 + \\frac{9x}{4}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math={"L = \\int_0^4 \\sqrt{1 + \\frac{9x}{4}}\\,dx = \\frac{8}{27}\\left[\\left(1 + \\frac{9x}{4}\\right)^{3/2}\\right]_0^4 = \\frac{8}{27}(10\\sqrt{10} - 1)"} /></MathPanel></ExampleStep>
        <Conclusion result="≈ 9.07" math={<BlockMath math={"L = \\frac{8}{27}\\left(10\\sqrt{10} - 1\\right) \\approx 9.07"} />}>The calculator below opens on this curve.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Arc Length Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["volume-revolution","integral","parametric"]} />
    </MethodPage>
  );
}
