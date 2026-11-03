'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AreaPerimeterCalculator from './algorithems.area-and-perimeter';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between area and perimeter?',
    a: <>Perimeter is the length all the way round the edge (in cm, m…). Area is the space inside (in cm², m²…). A 4 × 2 rectangle has perimeter 12 cm and area 8 cm².</>,
  },
  {
    q: 'What is the formula for the area of a circle?',
    a: <><InlineMath math="A = \pi r^2" />, and the circumference is <InlineMath math="C = 2\pi r" />. Many school books use <InlineMath math="\pi = \tfrac{22}{7}" />: with r = 7 cm the area is 154 cm².</>,
  },
  {
    q: "When do you use Heron's formula?",
    a: <>When you know all three sides of a triangle but not its height. Find the half-perimeter <InlineMath math="s = \frac{a + b + c}{2}" />, then <InlineMath math="A = \sqrt{s(s-a)(s-b)(s-c)}" />.</>,
  },
  {
    q: 'How do you find the area of a trapezium?',
    a: <>Add the two parallel sides, halve, and multiply by the height between them: <InlineMath math="A = \tfrac{1}{2}(a + b)h" />.</>,
  },
];

export default function AreaPerimeterPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Area & Perimeter" subtitle="Every 2D Shape, Step by Step">
        <strong>Area</strong> is the space inside a flat shape, in square units; <strong>perimeter</strong> is the distance around it. Each shape has its own formula, from <InlineMath math="l \times b" /> for a rectangle to <InlineMath math="\pi r^2" /> for a circle.
      </MethodHeader>

      <FormulaBox label="THE MOST-USED FORMULAS" tag="11 SHAPES">
        <Formula math={`\\begin{gathered} \\text{Rectangle: } A = lb,\\ P = 2(l + b) \\\\ \\text{Circle: } A = \\pi r^2,\\ C = 2\\pi r \\\\ \\text{Triangle: } A = \\tfrac{1}{2}bh \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Pick the Shape', text: <>Match the figure to its formula. Split odd shapes into rectangles, triangles and circles.</> },
            { title: '2. Same Units', text: <>Put every length in the same unit (all cm or all m) before you substitute.</> },
            { title: '3. Square for Area', text: <>Area answers are in square units (cm²); perimeter answers are plain lengths (cm).</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A triangular field has sides 13 m, 14 m and 15 m. Find its perimeter and its area.
        </ExampleProblem>

        <ExampleStep n={1} title="PERIMETER AND HALF-PERIMETER">
          <MathPanel>
            <BlockMath math="P = a + b + c = 13 + 14 + 15 = 42 \text{ m}" />
            <BlockMath math="s = \frac{P}{2} = \frac{42}{2} = 21 \text{ m}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="HERON'S FORMULA">
          <StepText>We know all three sides but not the height, so use Heron&apos;s formula:</StepText>
          <MathPanel>
            <BlockMath math="A = \sqrt{s(s - a)(s - b)(s - c)}" />
            <BlockMath math="A = \sqrt{21 \times (21 - 13) \times (21 - 14) \times (21 - 15)}" />
            <BlockMath math="A = \sqrt{21 \times 8 \times 7 \times 6}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="SIMPLIFY THE ROOT">
          <MathPanel>
            <BlockMath math="21 \times 8 \times 7 \times 6 = 7056, \qquad \sqrt{7056} = 84" />
          </MathPanel>
          <StepText>Check: the height onto the 14 m side is 12 m, and <InlineMath math="\tfrac{1}{2} \times 14 \times 12 = 84" /> ✓</StepText>
        </ExampleStep>

        <Conclusion result="Perimeter = 42 m, Area = 84 m²" math={<BlockMath math="P = 42 \text{ m}, \qquad A = 84 \text{ m}^2" />}>
          The calculator below opens on this triangle. Switch shape to try a circle, trapezium or regular polygon.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Area & Perimeter Calculator">
        <AreaPerimeterCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['volume-surface-area', 'pythagoras', 'triangle-solver', 'coordinate-geometry']} />
    </MethodPage>
  );
}
