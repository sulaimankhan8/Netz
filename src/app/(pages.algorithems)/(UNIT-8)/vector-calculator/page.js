'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import VectorCalculator from './algorithems.vector-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Dot product or cross product?', a: <>The <strong>dot product</strong> is a number: it measures how much two vectors point the same way, and gives the angle between them. The <strong>cross product</strong> (3D only) is a vector at right angles to both, whose length is the area of the parallelogram they make.</> },
  { q: 'How do I know two vectors are perpendicular or parallel?', a: <>Perpendicular: <InlineMath math="\vec a \cdot \vec b = 0" />. Parallel: <InlineMath math="\vec a \times \vec b = \vec 0" /> (or one is a multiple of the other).</> },
  { q: 'What is the scalar triple product for?', a: <><InlineMath math="[\vec a\ \vec b\ \vec c] = \vec a \cdot (\vec b \times \vec c)" /> is the volume of the box (parallelepiped) on the three vectors. It is 0 exactly when the three vectors lie in one plane (coplanar).</> },
];

export default function VectorPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • VECTORS" title="Vector Calculator" subtitle="Magnitude, Dot & Cross Product, Projection">
        Vectors have size and direction. With <InlineMath math="\vec a = a_1\hat i + a_2\hat j + a_3\hat k" />, the formulas below give the length, the angle between two vectors, a perpendicular vector, projections and volumes.
      </MethodHeader>
      <FormulaBox label="KEY FORMULAS" tag="î ĵ k̂">
        <Formula math={`|\\vec a| = \\sqrt{a_1^2 + a_2^2 + a_3^2}, \\quad \\vec a \\cdot \\vec b = a_1b_1 + a_2b_2 + a_3b_3 = |\\vec a||\\vec b|\\cos\\theta`} />
        <FormulaSteps steps={[
          { title: 'Dot product', text: <>Multiply matching components and add.</> },
          { title: 'Cross product', text: <>Expand the î ĵ k̂ determinant along the top row.</> },
          { title: 'Projection', text: <>(a · b / |b|²) b is the part of a along b.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the angle between <InlineMath math="\hat i + \hat j" /> and <InlineMath math="\hat j + \hat k" />.</ExampleProblem>
        <ExampleStep n={1} title="DOT PRODUCT AND LENGTHS"><MathPanel><BlockMath math="\vec a \cdot \vec b = (1)(0) + (1)(1) + (0)(1) = 1, \qquad |\vec a| = |\vec b| = \sqrt{2}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="THE ANGLE"><MathPanel><BlockMath math="\cos\theta = \frac{1}{\sqrt2 \cdot \sqrt2} = \frac{1}{2} \ \Rightarrow \ \theta = \frac{\pi}{3} = 60^\circ" /></MathPanel><StepText>Try it with the first example button below.</StepText></ExampleStep>
        <Conclusion result="θ = π/3 (60°)" math={<BlockMath math="\theta = \frac{\pi}{3}" />}>The calculator below also does cross products, projections and triple products.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Vector Calculator"><VectorCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['coordinate-geometry', 'determinant', 'linear-dependence']} />
    </MethodPage>
  );
}
