'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.3d-geometry';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are direction cosines?", a: <>The cosines of the angles a line makes with the x, y and z axes. They are the direction ratios divided by the length, so l² + m² + n² = 1.</> },
  { q: "What are skew lines?", a: <>Lines in space that are neither parallel nor meeting. The shortest distance is along their common perpendicular, the direction b₁ × b₂.</> },
  { q: "Why |a·b| in the angle formula?", a: <>Lines have no preferred direction, so the acute angle is taken.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="3D Geometry Calculator" subtitle="Direction Cosines, Lines, Planes, Angles and Shortest Distance">
        Work with points, lines and planes in space using vectors: <strong>direction cosines</strong>, equations of lines and planes, angles between them, the distance from a point to a plane and the <strong>shortest distance</strong> between skew lines.
      </MethodHeader>
      <FormulaBox label="SHORTEST DISTANCE" tag="SKEW LINES">
        <Formula math={"D = \\frac{\\left|(\\vec a_2 - \\vec a_1) \\cdot (\\vec b_1 \\times \\vec b_2)\\right|}{\\left|\\vec b_1 \\times \\vec b_2\\right|}, \\qquad D_{\\text{plane}} = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}"} />
        <FormulaSteps steps={[
          { title: "1. Vectors", text: <>Directions and normals as vectors.</> },
          { title: "2. Dot / cross", text: <>Angles from dot products; normals from cross products.</> },
          { title: "3. Formula", text: <>Divide by the right length.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the shortest distance between r = (1, 2, 3) + λ(2, 3, 4) and r = (2, 4, 5) + μ(3, 4, 5).</ExampleProblem>
        <ExampleStep n={1} title="CROSS PRODUCT"><MathPanel><BlockMath math={"(2, 3, 4) \\times (3, 4, 5) = (-1, 2, -1), \\quad |\\,\\cdot\\,| = \\sqrt6"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DISTANCE"><MathPanel><BlockMath math={"\\vec a_2 - \\vec a_1 = (1, 2, 2), \\quad D = \\frac{|-1 + 4 - 2|}{\\sqrt6} = \\frac{1}{\\sqrt6}"} /></MathPanel></ExampleStep>
        <Conclusion result="D = 1/√6 ≈ 0.408" math={<BlockMath math={"D = \\frac{\\sqrt6}{6}"} />}>The calculator below opens on these lines.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive 3D Geometry Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["vectors","coordinate-geometry","polar-coordinates"]} />
    </MethodPage>
  );
}
