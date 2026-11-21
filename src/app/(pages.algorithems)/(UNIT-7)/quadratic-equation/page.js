'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import QuadraticSolver from './algorithems.quadratic-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['quadratic-equation'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['quadratic-equation'].example} />
      <CommonMistakes items={EX['quadratic-equation'].mistakes} />

      <Lab heading="Interactive Quadratic Solver">
        <QuadraticSolver />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['system-of-equations', 'bisection', 'newton-raphson', 'coordinate-geometry']} />
    </MethodPage>
  );
}
