'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import QuadraticSolver from './algorithems.quadratic-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the quadratic formula?',
    a: <><InlineMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" /> solves any <InlineMath math="ax^2 + bx + c = 0" /> with <InlineMath math="a \neq 0" />. In India it is also called Sridharacharya&apos;s formula.</>,
  },
  {
    q: 'What does the discriminant tell you?',
    a: <><InlineMath math="D = b^2 - 4ac" />. If D &gt; 0 there are two different real roots (rational when D is a perfect square); if D = 0 the two roots are equal; if D &lt; 0 there are no real roots, only two complex ones.</>,
  },
  {
    q: 'How do you find the vertex of a parabola?',
    a: <>The vertex is at <InlineMath math="x = -\frac{b}{2a}" />; put that x back into the equation to get y. It is the lowest point when a &gt; 0 and the highest when a &lt; 0.</>,
  },
  {
    q: 'What are the sum and product of the roots?',
    a: <>For roots α and β: <InlineMath math="\alpha + \beta = -\frac{b}{a}" /> and <InlineMath math="\alpha\beta = \frac{c}{a}" />. They are a quick way to check an answer.</>,
  },
];

export default function QuadraticPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Quadratic Equation" subtitle="Quadratic Formula & Discriminant">
        A <strong>quadratic equation</strong> <InlineMath math="ax^2 + bx + c = 0" /> is solved by the quadratic formula <InlineMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />. The discriminant <InlineMath math="b^2 - 4ac" /> says whether the roots are real, equal or complex.
      </MethodHeader>

      <FormulaBox label="THE QUADRATIC FORMULA" tag="a ≠ 0">
        <Formula math={`\\begin{gathered} x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\\\ D = b^2 - 4ac \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Read a, b, c', text: <>Write the equation as <InlineMath math="ax^2 + bx + c = 0" /> first; watch the signs.</> },
            { title: '2. Discriminant', text: <>Work out <InlineMath math="D = b^2 - 4ac" />. Its sign tells you what kind of roots to expect.</> },
            { title: '3. Plus and Minus', text: <>Do the formula twice, once with + and once with −, to get both roots.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="2x^2 - 7x + 3 = 0" />, factorise it, and find the vertex of its graph.
        </ExampleProblem>

        <ExampleStep n={1} title="DISCRIMINANT">
          <StepText>Here <InlineMath math="a = 2" />, <InlineMath math="b = -7" />, <InlineMath math="c = 3" />:</StepText>
          <MathPanel>
            <BlockMath math="D = (-7)^2 - 4(2)(3) = 49 - 24 = 25" />
          </MathPanel>
          <StepText>D = 25 is a positive perfect square, so there are two different rational roots.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="QUADRATIC FORMULA">
          <MathPanel>
            <BlockMath math="x = \frac{7 \pm \sqrt{25}}{2 \times 2} = \frac{7 \pm 5}{4}" />
            <BlockMath math="x = \frac{12}{4} = 3 \quad \text{or} \quad x = \frac{2}{4} = \frac{1}{2}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="FACTORS AND CHECK">
          <MathPanel>
            <BlockMath math="2x^2 - 7x + 3 = (2x - 1)(x - 3)" />
            <BlockMath math="\alpha + \beta = 3 + \tfrac{1}{2} = \tfrac{7}{2} = -\tfrac{b}{a} \ \checkmark \qquad \alpha\beta = \tfrac{3}{2} = \tfrac{c}{a} \ \checkmark" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={4} title="VERTEX">
          <MathPanel>
            <BlockMath math="x = -\frac{b}{2a} = \frac{7}{4}, \qquad y = 2\left(\tfrac{7}{4}\right)^2 - 7\left(\tfrac{7}{4}\right) + 3 = -\frac{25}{8}" />
          </MathPanel>
          <StepText>a = 2 &gt; 0, so the parabola opens upwards and (7/4, −25/8) is its lowest point.</StepText>
        </ExampleStep>

        <Conclusion result="x = 3 or x = 1/2" math={<BlockMath math="2x^2 - 7x + 3 = (2x - 1)(x - 3) = 0" />}>
          The solver below opens on this equation and draws the parabola through both roots.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Quadratic Solver">
        <QuadraticSolver />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['system-of-equations', 'bisection', 'newton-raphson', 'coordinate-geometry']} />
    </MethodPage>
  );
}
