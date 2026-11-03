'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import UnitCircle from './algorithems.unit-circle';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the unit circle?',
    a: <>A circle of radius 1 centred at the origin. The point at angle <InlineMath math="\theta" /> (measured anticlockwise from the positive x-axis) is <InlineMath math="(\cos\theta, \sin\theta)" />, which is how sine and cosine are defined for every angle, not just acute ones.</>,
  },
  {
    q: 'How do you convert degrees to radians?',
    a: <>Multiply by <InlineMath math="\frac{\pi}{180^\circ}" />: <InlineMath math="60^\circ = \frac{\pi}{3}" />. To go back, multiply radians by <InlineMath math="\frac{180^\circ}{\pi}" />. One radian is about 57.3°.</>,
  },
  {
    q: 'What does "All Students Take Calculus" (ASTC) mean?',
    a: <>It tells you which ratios are positive in each quadrant: All in I, Sin in II, Tan in III, Cos in IV. That fixes the sign; the reference angle gives the size.</>,
  },
  {
    q: 'Why is tan 90° undefined?',
    a: <><InlineMath math="\tan\theta = \frac{\sin\theta}{\cos\theta}" />, and <InlineMath math="\cos 90^\circ = 0" />, so you would be dividing by zero. The same happens at 270°.</>,
  },
];

export default function UnitCirclePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • GEOMETRY & TRIGONOMETRY" title="Unit Circle" subtitle="Sin, Cos & Tan of Any Angle">
        On the <strong>unit circle</strong> (radius 1), the point at angle <InlineMath math="\theta" /> is <InlineMath math="(\cos\theta, \sin\theta)" />. Its x-coordinate is the cosine, its y-coordinate is the sine, and <InlineMath math="\tan\theta = \frac{\sin\theta}{\cos\theta}" />.
      </MethodHeader>

      <FormulaBox label="READING THE CIRCLE" tag="RADIUS = 1">
        <Formula math={`\\begin{gathered} P(\\theta) = (\\cos\\theta,\\ \\sin\\theta) \\\\ \\cos^2\\theta + \\sin^2\\theta = 1 \\\\ \\theta_{\\text{rad}} = \\theta^\\circ \\times \\frac{\\pi}{180^\\circ} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Quadrant', text: <>Find which quarter the angle lands in (subtract 360° first if it is bigger).</> },
            { title: '2. Reference Angle', text: <>The acute angle to the x-axis: <InlineMath math="180^\circ - \theta" />, <InlineMath math="\theta - 180^\circ" /> or <InlineMath math="360^\circ - \theta" />.</> },
            { title: '3. Sign by ASTC', text: <>Take the value for the reference angle and give it the sign of that quadrant.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the exact values of <InlineMath math="\sin 150^\circ" />, <InlineMath math="\cos 150^\circ" /> and <InlineMath math="\tan 150^\circ" />, and write 150° in radians.
        </ExampleProblem>

        <ExampleStep n={1} title="QUADRANT AND REFERENCE ANGLE">
          <StepText>150° is between 90° and 180°, so it is in quadrant II. Its reference angle is <InlineMath math="180^\circ - 150^\circ = 30^\circ" />.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="VALUES FOR 30°, THEN THE SIGNS">
          <StepText>In quadrant II only sine is positive (ASTC: <strong>S</strong>in):</StepText>
          <MathPanel>
            <BlockMath math="\sin 150^\circ = +\sin 30^\circ = \frac{1}{2}, \qquad \cos 150^\circ = -\cos 30^\circ = -\frac{\sqrt{3}}{2}" />
            <BlockMath math="\tan 150^\circ = \frac{\sin 150^\circ}{\cos 150^\circ} = \frac{1/2}{-\sqrt{3}/2} = -\frac{1}{\sqrt{3}} = -\frac{\sqrt{3}}{3}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="RADIANS">
          <MathPanel>
            <BlockMath math="150^\circ \times \frac{\pi}{180^\circ} = \frac{5\pi}{6}" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="The point is (−√3/2, 1/2)" math={<BlockMath math="P(150^\circ) = \left(-\frac{\sqrt{3}}{2},\ \frac{1}{2}\right), \quad 150^\circ = \frac{5\pi}{6}" />}>
          Drag the point on the circle below to 150° and the same values appear.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Unit Circle">
        <UnitCircle />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['triangle-solver', 'pythagoras', 'coordinate-geometry']} />
    </MethodPage>
  );
}
