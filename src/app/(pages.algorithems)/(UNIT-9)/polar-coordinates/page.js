'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.polar-coordinates';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why not just θ = tan⁻¹(y/x)?", a: <>tan⁻¹ only gives angles in (−π/2, π/2), so points with x &lt; 0 come out in the wrong quadrant. The signs of x and y decide.</> },
  { q: "What does rotating the axes do?", a: <>It describes the same point from axes turned through θ: X = x cos θ + y sin θ, Y = −x sin θ + y cos θ. Distances are unchanged.</> },
  { q: "How do I convert r = 4 cos θ?", a: <>Multiply by r: r² = 4r cos θ, so x² + y² = 4x, a circle through the origin.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="Polar Coordinates Calculator" subtitle="Polar ↔ Cartesian, Rotation and Translation of Axes">
        A point can be named by its distance <InlineMath math={"r"} /> from the pole and its angle <InlineMath math={"\\theta"} />. Convert between <InlineMath math={"(x, y)"} /> and <InlineMath math={"(r, \\theta)"} /> with the correct quadrant, rotate or shift the axes, and turn a polar curve into an <InlineMath math={"x"} />–<InlineMath math={"y"} /> equation.
      </MethodHeader>
      <FormulaBox label="THE CONVERSIONS" tag="r, θ">
        <Formula math={"x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\qquad r = \\sqrt{x^2 + y^2}, \\quad \\tan\\theta = \\frac{y}{x}"} />
        <FormulaSteps steps={[
          { title: "1. r", text: <>The distance from the origin.</> },
          { title: "2. Quadrant", text: <>Look at the signs of x and y.</> },
          { title: "3. θ", text: <>The angle in that quadrant.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Write the point (−1, √3) in polar coordinates.</ExampleProblem>
        <ExampleStep n={1} title="DISTANCE"><MathPanel><BlockMath math={"r = \\sqrt{1 + 3} = 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ANGLE"><MathPanel><BlockMath math={"\\tan\\theta = -\\sqrt3, \\ \\text{quadrant II} \\Rightarrow \\theta = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}"} /></MathPanel><StepText>Not −π/3: that would be in quadrant IV.</StepText></ExampleStep>
        <Conclusion result="(2, 2π/3)" math={<BlockMath math={"(r, \\theta) = \\left(2, \\frac{2\\pi}{3}\\right)"} />}>The calculator below opens on this point.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Polar Coordinates Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["coordinate-geometry","unit-circle","geometry-3d"]} />
    </MethodPage>
  );
}
