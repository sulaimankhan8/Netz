'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TriangleSolverCalculator from './algorithems.triangle-solver';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'When do you use the sine rule and when the cosine rule?',
    a: <>Use the cosine rule when you know three sides (SSS) or two sides and the angle between them (SAS). Use the sine rule when you know a side and the angle opposite it, as in ASA, AAS and SSA.</>,
  },
  {
    q: 'What is the ambiguous case of the sine rule?',
    a: <>With two sides and an angle that is not between them (SSA), the sine rule gives <InlineMath math="\sin B" />, and two angles have that sine: <InlineMath math="B" /> and <InlineMath math="180^\circ - B" />. So there can be two different triangles, one, or none. The calculator shows every one that fits.</>,
  },
  {
    q: 'How do you find the area of a triangle from two sides and an angle?',
    a: <><InlineMath math="\text{Area} = \tfrac{1}{2}ab\sin C" />: half the product of two sides times the sine of the angle between them.</>,
  },
  {
    q: 'Why can\'t I solve a triangle from three angles (AAA)?',
    a: <>Three angles fix the shape but not the size: every enlargement of the triangle has the same angles. You need at least one side.</>,
  },
];

export default function TriangleSolverPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Triangle Solver" subtitle="Sine Rule & Cosine Rule">
        A <strong>triangle solver</strong> finds every side and angle from three facts, as long as at least one is a side. The <strong>cosine rule</strong> <InlineMath math="a^2 = b^2 + c^2 - 2bc\cos A" /> handles SSS and SAS; the <strong>sine rule</strong> <InlineMath math="\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}" /> handles the rest.
      </MethodHeader>

      <FormulaBox label="THE TWO RULES" tag="ANY TRIANGLE">
        <Formula math={`\\begin{gathered} \\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\\\ a^2 = b^2 + c^2 - 2bc\\cos A \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Label', text: <>Side <InlineMath math="a" /> is opposite angle <InlineMath math="A" />, <InlineMath math="b" /> opposite <InlineMath math="B" />, <InlineMath math="c" /> opposite <InlineMath math="C" />.</> },
            { title: '2. Choose the Rule', text: <>SSS or SAS: cosine rule. A side with its opposite angle known: sine rule.</> },
            { title: '3. Angles Add to 180°', text: <>Once two angles are known, <InlineMath math="C = 180^\circ - A - B" />.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve the triangle with sides <InlineMath math="a = 7" />, <InlineMath math="b = 8" />, <InlineMath math="c = 9" />, and find its area.
        </ExampleProblem>

        <ExampleStep n={1} title="ANGLE A BY THE COSINE RULE">
          <MathPanel>
            <BlockMath math="\cos A = \frac{b^2 + c^2 - a^2}{2bc} = \frac{64 + 81 - 49}{2 \times 8 \times 9} = \frac{96}{144} = \frac{2}{3} \Rightarrow A \approx 48.19^\circ" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="ANGLE B, THEN ANGLE C">
          <MathPanel>
            <BlockMath math="\cos B = \frac{a^2 + c^2 - b^2}{2ac} = \frac{49 + 81 - 64}{2 \times 7 \times 9} = \frac{66}{126} = \frac{11}{21} \Rightarrow B \approx 58.41^\circ" />
            <BlockMath math="C = 180^\circ - 48.19^\circ - 58.41^\circ \approx 73.40^\circ" />
          </MathPanel>
          <StepText>Check with the cosine rule: <InlineMath math="\cos C = \frac{49 + 64 - 81}{2 \times 7 \times 8} = \frac{2}{7}" />, which gives <InlineMath math="C \approx 73.40^\circ" /> ✓</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="AREA">
          <StepText>Since <InlineMath math="\cos A = \tfrac{2}{3}" />, <InlineMath math="\sin A = \sqrt{1 - \tfrac{4}{9}} = \tfrac{\sqrt{5}}{3}" />:</StepText>
          <MathPanel>
            <BlockMath math="\text{Area} = \tfrac{1}{2}bc\sin A = \tfrac{1}{2} \times 8 \times 9 \times \frac{\sqrt{5}}{3} = 12\sqrt{5} \approx 26.83" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="A ≈ 48.19°, B ≈ 58.41°, C ≈ 73.40°, Area = 12√5" math={<BlockMath math="\text{Area} = 12\sqrt{5} \approx 26.83" />}>
          All three angles are under 90°, so this is an acute scalene triangle. The calculator below opens on it.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Triangle Solver">
        <TriangleSolverCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['pythagoras', 'unit-circle', 'area-perimeter', 'coordinate-geometry']} />
    </MethodPage>
  );
}
