'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import VolumeSurfaceAreaCalculator from './algorithems.volume-and-surface-area';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between curved and total surface area?',
    a: <>Curved (or lateral) surface area is only the side surface. Total surface area adds the flat ends too: for a cylinder, <InlineMath math="TSA = CSA + 2\pi r^2 = 2\pi r(r + h)" />.</>,
  },
  {
    q: 'What is the formula for the volume of a cone?',
    a: <><InlineMath math="V = \tfrac{1}{3}\pi r^2 h" />: one third of the cylinder with the same base and height. Its curved surface area uses the slant height <InlineMath math="l = \sqrt{r^2 + h^2}" />: <InlineMath math="CSA = \pi r l" />.</>,
  },
  {
    q: 'What is the volume and surface area of a sphere?',
    a: <><InlineMath math="V = \tfrac{4}{3}\pi r^3" /> and <InlineMath math="S = 4\pi r^2" />. A hemisphere has half the volume, <InlineMath math="\tfrac{2}{3}\pi r^3" />, and total surface area <InlineMath math="3\pi r^2" /> (curved part plus the flat circle).</>,
  },
  {
    q: 'How do you convert between cm³ and litres?',
    a: <>1 litre = 1000 cm³, and 1 m³ = 1000 litres. So a 1540 cm³ tank holds 1.54 litres.</>,
  },
];

export default function VolumeSurfaceAreaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Volume & Surface Area" subtitle="Cylinders, Cones, Spheres and More">
        <strong>Volume</strong> is the space a solid fills, in cubic units; <strong>surface area</strong> is the total area of its outside, in square units. A cylinder, for example, has <InlineMath math="V = \pi r^2 h" /> and <InlineMath math="TSA = 2\pi r(r + h)" />.
      </MethodHeader>

      <FormulaBox label="THE MOST-USED FORMULAS" tag="9 SOLIDS">
        <Formula math={`\\begin{gathered} \\text{Cylinder: } V = \\pi r^2 h \\\\ \\text{Cone: } V = \\tfrac{1}{3}\\pi r^2 h \\\\ \\text{Sphere: } V = \\tfrac{4}{3}\\pi r^3 \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Name the Solid', text: <>Match it to its formulas; a cone or pyramid needs the slant height for its surface.</> },
            { title: '2. Radius, not Diameter', text: <>Most formulas use the radius <InlineMath math="r" />. Halve the diameter first.</> },
            { title: '3. Units', text: <>Volume in cm³ (or litres), surface area in cm². Keep every length in the same unit.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A closed cylindrical tank has radius 7 cm and height 10 cm. Taking <InlineMath math="\pi = \tfrac{22}{7}" />, find its volume, curved surface area and total surface area.
        </ExampleProblem>

        <ExampleStep n={1} title="VOLUME">
          <MathPanel>
            <BlockMath math="V = \pi r^2 h = \frac{22}{7} \times 7^2 \times 10 = 22 \times 7 \times 10 = 1540 \text{ cm}^3" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="CURVED SURFACE AREA">
          <StepText>The side of the tank unrolls into a rectangle <InlineMath math="2\pi r" /> wide and <InlineMath math="h" /> tall:</StepText>
          <MathPanel>
            <BlockMath math="CSA = 2\pi r h = 2 \times \frac{22}{7} \times 7 \times 10 = 440 \text{ cm}^2" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="TOTAL SURFACE AREA">
          <StepText>Add the top and bottom circles:</StepText>
          <MathPanel>
            <BlockMath math="TSA = 2\pi r(r + h) = 2 \times \frac{22}{7} \times 7 \times (7 + 10) = 44 \times 17 = 748 \text{ cm}^2" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="V = 1540 cm³, CSA = 440 cm², TSA = 748 cm²" math={<BlockMath math="V = 1540 \text{ cm}^3 = 1.54 \text{ litres}" />}>
          The calculator below opens on this tank. Change π to see the answer with π kept exact.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Volume & Surface Area Calculator">
        <VolumeSurfaceAreaCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['area-perimeter', 'pythagoras', 'coordinate-geometry']} />
    </MethodPage>
  );
}
