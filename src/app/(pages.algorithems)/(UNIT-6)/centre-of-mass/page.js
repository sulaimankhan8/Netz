'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.centre-of-mass';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the polar moment?", a: <>I_O = I_x + I_y, the moment of inertia about the axis through the origin perpendicular to the plate (the perpendicular axis theorem).</> },
  { q: "Does symmetry help?", a: <>Yes: for a shape symmetric about the y-axis with symmetric density, x̄ = 0, which the page confirms.</> },
  { q: "What about a solid?", a: <>Use triple integrals the same way; the surface-integral page does ∭ f dV over boxes, balls and cylinders.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Centre of Mass and Moment of Inertia" subtitle="Of a Lamina, by Double Integrals">
        For a thin plate with density <InlineMath math={"\\rho(x, y)"} />, the <strong>mass</strong> is <InlineMath math={"\\iint \\rho\\,dA"} /> and the <strong>centre of mass</strong> is the average position weighted by <InlineMath math={"\\rho"} />. The <strong>moments of inertia</strong> weight by the square of the distance from an axis.
      </MethodHeader>
      <FormulaBox label="THE INTEGRALS" tag="ρ = DENSITY">
        <Formula math={"\\bar{x} = \\frac{1}{M}\\iint x\\rho\\,dA, \\quad \\bar{y} = \\frac{1}{M}\\iint y\\rho\\,dA, \\quad I_x = \\iint y^2\\rho\\,dA, \\quad I_y = \\iint x^2\\rho\\,dA"} />
        <FormulaSteps steps={[
          { title: "1. Mass", text: <>M = ∬ρ dA.</> },
          { title: "2. Moments", text: <>∬xρ and ∬yρ.</> },
          { title: "3. Divide", text: <>x̄ = M_y/M, ȳ = M_x/M.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the centre of mass of a uniform half-disc x² + y² ≤ a², y ≥ 0.</ExampleProblem>
        <ExampleStep n={1} title="MASS"><MathPanel><BlockMath math={"M = \\tfrac12\\pi a^2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MOMENT"><MathPanel><BlockMath math={"\\iint y\\,dA = \\int_0^{\\pi}\\int_0^a r\\sin\\theta\\cdot r\\,dr\\,d\\theta = \\frac{a^3}{3}\\cdot 2 = \\frac{2a^3}{3}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="DIVIDE"><MathPanel><BlockMath math={"\\bar{y} = \\frac{2a^3/3}{\\pi a^2/2} = \\frac{4a}{3\\pi}, \\quad \\bar{x} = 0 \\text{ by symmetry}"} /></MathPanel></ExampleStep>
        <Conclusion result="(0, 4a/3π)" math={<BlockMath math={"(\\bar{x}, \\bar{y}) = \\left(0, \\frac{4a}{3\\pi}\\right)"} />}>The calculator below opens on a half-disc of radius 2.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Centre of Mass Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["double-integral","area-under-curve","triple-integral"]} />
    </MethodPage>
  );
}
