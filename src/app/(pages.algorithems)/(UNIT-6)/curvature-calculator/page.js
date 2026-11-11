'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.curvature-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What happens at an inflection point?", a: <>y″ = 0, so κ = 0 and ρ is infinite: the curve is momentarily straight.</> },
  { q: "Why the 3/2 power?", a: <>κ = |dψ/ds|; with tan ψ = y′ and ds = √(1 + y′²) dx the chain rule gives y″/(1 + y′²)^{'{'}3/2{'}'}.</> },
  { q: "What is the circle of curvature?", a: <>The circle with radius ρ centred at the centre of curvature: it has the same tangent and the same bending as the curve at that point.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Radius of Curvature Calculator" subtitle="Cartesian, Parametric and Polar Curves">
        The <strong>curvature</strong> <InlineMath math={"\\kappa"} /> measures how fast a curve turns; the <strong>radius of curvature</strong> <InlineMath math={"\\rho = 1/\\kappa"} /> is the radius of the circle that fits the curve best at a point, centred at the <strong>centre of curvature</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE FORMS" tag="ρ = 1/κ">
        <Formula math={"\\rho = \\frac{(1 + y'^2)^{3/2}}{|y''|}, \\qquad \\rho = \\frac{(\\dot x^2 + \\dot y^2)^{3/2}}{|\\dot x\\ddot y - \\dot y\\ddot x|}, \\qquad \\rho = \\frac{(r^2 + r'^2)^{3/2}}{|r^2 + 2r'^2 - rr''|}"} />
        <FormulaSteps steps={[
          { title: "1. Derivatives", text: <>y′ and y″ (or the t, θ ones).</> },
          { title: "2. At the point", text: <>Put the numbers in.</> },
          { title: "3. Formula", text: <>ρ, κ and the centre.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the radius of curvature of y = x² at x = 1.</ExampleProblem>
        <ExampleStep n={1} title="DERIVATIVES"><MathPanel><BlockMath math={"y' = 2x = 2, \\quad y'' = 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FORMULA"><MathPanel><BlockMath math={"\\rho = \\frac{(1 + 4)^{3/2}}{2} = \\frac{5\\sqrt5}{2}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="CENTRE"><MathPanel><BlockMath math={"\\left(1 - \\frac{2\\cdot 5}{2},\\ 1 + \\frac{5}{2}\\right) = \\left(-4, \\frac72\\right)"} /></MathPanel></ExampleStep>
        <Conclusion result="ρ = 5√5/2" math={<BlockMath math={"\\rho = \\frac{5\\sqrt5}{2} \\approx 5.59"} />}>The calculator below opens on this curve.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Radius of Curvature Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["tangent-normal","parametric","polar-coordinates"]} />
    </MethodPage>
  );
}
