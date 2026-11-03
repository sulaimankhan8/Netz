'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PythagorasCalculator from './algorithems.pythagoras-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the Pythagoras theorem?',
    a: <>In a right-angled triangle, the square on the hypotenuse equals the sum of the squares on the other two sides: <InlineMath math="a^2 + b^2 = c^2" />, where <InlineMath math="c" /> is the side opposite the right angle.</>,
  },
  {
    q: 'How do you find a shorter side?',
    a: <>Rearrange: <InlineMath math="a = \sqrt{c^2 - b^2}" />. Subtract, don&apos;t add, when the hypotenuse is the side you know.</>,
  },
  {
    q: 'What are Pythagorean triples?',
    a: <>Whole numbers that fit <InlineMath math="a^2 + b^2 = c^2" />: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and any multiple of them such as 6-8-10.</>,
  },
  {
    q: 'How do you check if a triangle is right-angled?',
    a: <>Square the two shorter sides and add them. If the total equals the square of the longest side, the triangle has a right angle (the converse of Pythagoras). If it is smaller, the largest angle is obtuse; if bigger, all angles are acute.</>,
  },
];

export default function PythagorasPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Pythagoras Theorem" subtitle="Find the Missing Side">
        The <strong>Pythagoras theorem</strong> says that in a right-angled triangle <InlineMath math="a^2 + b^2 = c^2" />, where <InlineMath math="c" /> is the hypotenuse (the longest side, opposite the right angle). Know any two sides and you can find the third.
      </MethodHeader>

      <FormulaBox label="HOW IT WORKS" tag="RIGHT TRIANGLES ONLY">
        <Formula math={`\\begin{gathered} c^2 = a^2 + b^2 \\\\ c = \\sqrt{a^2 + b^2} \\\\ a = \\sqrt{c^2 - b^2} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Find the Hypotenuse', text: <>It is opposite the right angle and is always the longest side, <InlineMath math="c" />.</> },
            { title: '2. Add or Subtract', text: <>Finding <InlineMath math="c" />: add the squares. Finding a leg: subtract the squares from <InlineMath math="c^2" />.</> },
            { title: '3. Square Root', text: <>Take the square root. Leave it as a surd (like <InlineMath math="5\sqrt{2}" />) if the question asks for an exact answer.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A 13 m ladder leans against a wall and reaches a window 12 m above the ground. How far is the foot of the ladder from the wall?
        </ExampleProblem>

        <ExampleStep n={1} title="NAME THE SIDES">
          <StepText>The wall and the ground meet at a right angle. The ladder is the hypotenuse <InlineMath math="c = 13" />, the height is <InlineMath math="b = 12" />, and the distance we want is <InlineMath math="a" />.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="SUBTRACT THE SQUARES">
          <MathPanel>
            <BlockMath math="a^2 = c^2 - b^2 = 13^2 - 12^2 = 169 - 144 = 25" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="SQUARE ROOT">
          <MathPanel>
            <BlockMath math="a = \sqrt{25} = 5 \text{ m}" />
          </MathPanel>
          <StepText>Check: <InlineMath math="5^2 + 12^2 = 25 + 144 = 169 = 13^2" /> ✓ (5-12-13 is a Pythagorean triple).</StepText>
        </ExampleStep>

        <Conclusion result="The foot of the ladder is 5 m from the wall" math={<BlockMath math="a = 5 \text{ m}" />}>
          The calculator below opens on this ladder and also gives the angle it makes with the ground.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Pythagoras Calculator">
        <PythagorasCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['triangle-solver', 'coordinate-geometry', 'unit-circle', 'area-perimeter']} />
    </MethodPage>
  );
}
