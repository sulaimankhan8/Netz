'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ComplexCalculator from './algorithems.complex-number-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why multiply by the conjugate to divide?', a: <>Because <InlineMath math="(c + di)(c - di) = c^2 + d^2" /> is a real number. Multiplying top and bottom by the conjugate of the bottom leaves an ordinary number underneath, so the answer splits into a + bi.</> },
  { q: 'How do I get the argument in the right quadrant?', a: <>Find the angle <InlineMath math="\alpha = \tan^{-1}|b/a|" />, then place it by the signs of a and b: first quadrant θ = α, second π − α, third −(π − α), fourth −α. A calculator&apos;s tan⁻¹(b/a) alone gets quadrants 2 and 3 wrong.</> },
  { q: "What is De Moivre's theorem?", a: <><InlineMath math="(r(\cos\theta + i\sin\theta))^n = r^n(\cos n\theta + i\sin n\theta)" />: raise the modulus to the power n and multiply the angle by n. It makes powers like <InlineMath math="(1 + i)^8 = 16" /> quick.</> },
];

export default function ComplexPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Complex Number Calculator" subtitle="Arithmetic, Modulus, Polar Form & De Moivre">
        A <strong>complex number</strong> <InlineMath math="z = a + bi" /> has a real part a and an imaginary part b, with <InlineMath math="i^2 = -1" />. It is a point on the Argand plane, with distance <InlineMath math="|z|" /> from 0 and angle <InlineMath math="\theta" />.
      </MethodHeader>
      <FormulaBox label="KEY FORMULAS" tag="i² = −1">
        <Formula math={`\\begin{gathered} (a + bi)(c + di) = (ac - bd) + (ad + bc)i \\\\ |z| = \\sqrt{a^2 + b^2}, \\qquad z = r(\\cos\\theta + i\\sin\\theta) = re^{i\\theta} \\end{gathered}`} />
        <FormulaSteps steps={[
          { title: 'Add / subtract', text: <>Real parts together, imaginary parts together.</> },
          { title: 'Multiply / divide', text: <>Expand with i² = −1; divide using the conjugate.</> },
          { title: 'Polar form', text: <>Modulus r and argument θ (check the quadrant).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find <InlineMath math="\frac{3 + 4i}{1 - 2i}" />.</ExampleProblem>
        <ExampleStep n={1} title="MULTIPLY BY THE CONJUGATE"><MathPanel><BlockMath math="\frac{3 + 4i}{1 - 2i} \cdot \frac{1 + 2i}{1 + 2i}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TOP AND BOTTOM"><MathPanel><BlockMath math="(3 + 4i)(1 + 2i) = 3 + 6i + 4i + 8i^2 = -5 + 10i, \qquad 1^2 + 2^2 = 5" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="DIVIDE"><MathPanel><BlockMath math="\frac{-5 + 10i}{5} = -1 + 2i" /></MathPanel><StepText>Check: (−1 + 2i)(1 − 2i) = −1 + 2i + 2i + 4 = 3 + 4i ✓</StepText></ExampleStep>
        <Conclusion result="−1 + 2i" math={<BlockMath math="\frac{3 + 4i}{1 - 2i} = -1 + 2i" />}>Try it in the calculator below, with the points drawn on the Argand plane.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Complex Number Calculator"><ComplexCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['quadratic', 'unit-circle', 'binomial-theorem']} />
    </MethodPage>
  );
}
