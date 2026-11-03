'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CoordinateGeometryCalculator from './algorithems.coordinate-geometry';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the distance formula?',
    a: <><InlineMath math="d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" />. It is Pythagoras: the horizontal and vertical gaps are the two legs, and the distance is the hypotenuse.</>,
  },
  {
    q: 'How do you find the slope of a line through two points?',
    a: <>Rise over run: <InlineMath math="m = \frac{y_2 - y_1}{x_2 - x_1}" />. A vertical line (same x) has no slope; a horizontal line has slope 0.</>,
  },
  {
    q: 'What is the section formula?',
    a: <>The point dividing AB internally in the ratio m : n is <InlineMath math="\left(\frac{mx_2 + nx_1}{m + n}, \frac{my_2 + ny_1}{m + n}\right)" />. For external division, the plus signs become minus signs. The midpoint is the case m = n = 1.</>,
  },
  {
    q: 'How do you tell if two lines are parallel or perpendicular?',
    a: <>Parallel lines have equal slopes, <InlineMath math="m_1 = m_2" />. Perpendicular lines have slopes that multiply to −1, <InlineMath math="m_1 m_2 = -1" /> (for example 2 and −1/2).</>,
  },
];

export default function CoordinateGeometryPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Coordinate Geometry" subtitle="Points, Lines & Slopes">
        <strong>Coordinate geometry</strong> turns points and lines into numbers: the distance between <InlineMath math="(x_1, y_1)" /> and <InlineMath math="(x_2, y_2)" /> is <InlineMath math="\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" />, and the slope of the line through them is <InlineMath math="\frac{y_2 - y_1}{x_2 - x_1}" />.
      </MethodHeader>

      <FormulaBox label="THE CORE FORMULAS" tag="8 TOOLS">
        <Formula math={`\\begin{gathered} d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \\\\ M = \\left(\\tfrac{x_1 + x_2}{2}, \\tfrac{y_1 + y_2}{2}\\right) \\\\ m = \\frac{y_2 - y_1}{x_2 - x_1} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Label the Points', text: <>Call them <InlineMath math="(x_1, y_1)" /> and <InlineMath math="(x_2, y_2)" /> and keep that order all the way through.</> },
            { title: '2. Watch the Signs', text: <>Subtracting a negative adds: <InlineMath math="3 - (-2) = 5" />. Brackets help.</> },
            { title: '3. Draw It', text: <>A quick sketch shows whether the answer is sensible: a positive slope rises to the right.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          For <InlineMath math="A(1, 2)" /> and <InlineMath math="B(3, 8)" />, find the distance AB, the midpoint of AB, and the equation of line AB.
        </ExampleProblem>

        <ExampleStep n={1} title="DISTANCE">
          <MathPanel>
            <BlockMath math="AB = \sqrt{(3 - 1)^2 + (8 - 2)^2} = \sqrt{4 + 36} = \sqrt{40} = 2\sqrt{10} \approx 6.325" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="MIDPOINT">
          <MathPanel>
            <BlockMath math="M = \left(\frac{1 + 3}{2}, \frac{2 + 8}{2}\right) = (2, 5)" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="SLOPE AND EQUATION">
          <MathPanel>
            <BlockMath math="m = \frac{8 - 2}{3 - 1} = \frac{6}{2} = 3" />
            <BlockMath math="y - 2 = 3(x - 1) \;\Rightarrow\; y = 3x - 1 \;\Rightarrow\; 3x - y - 1 = 0" />
          </MathPanel>
          <StepText>Check with B: <InlineMath math="3(3) - 1 = 8" /> ✓</StepText>
        </ExampleStep>

        <Conclusion result="AB = 2√10, M = (2, 5), line: y = 3x − 1" math={<BlockMath math="3x - y - 1 = 0" />}>
          The calculator below opens on this line. Switch tool to try the section formula or the area of a triangle.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Coordinate Geometry Calculator">
        <CoordinateGeometryCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['pythagoras', 'triangle-solver', 'area-perimeter', 'unit-circle']} />
    </MethodPage>
  );
}
