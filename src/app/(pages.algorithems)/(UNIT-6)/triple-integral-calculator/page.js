'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TripleIntegralCalculator from './algorithems.triple-integral-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I find a volume with a triple integral?', a: <>Integrate 1 over the solid: <InlineMath math="V = \iiint dV" />. The tetrahedron x + y + z ≤ 1 in the first octant has volume 1/6.</> },
  { q: 'What are dV in cylindrical and spherical coordinates?', a: <>Cylindrical: <InlineMath math="dV = r\,dr\,d\theta\,dz" />. Spherical: <InlineMath math="dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta" />. Include these factors in the integrand.</> },
  { q: 'Which limits may contain letters?', a: <>The innermost limits may use both outer letters, the middle limits only the outermost letter, and the outermost limits must be numbers.</> },
];

export default function TripleIntegralPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Triple Integral Calculator" subtitle="Cartesian, Cylindrical and Spherical">
        Evaluate a <strong>triple integral</strong> from the inside out: integrate in the innermost variable with the other two held constant, then the middle, then the outermost. Volumes, masses and averages over solids.
      </MethodHeader>
      <FormulaBox label="ITERATED INTEGRAL" tag="INSIDE OUT">
        <Formula math={'\\iiint_V f\\,dV = \\int_a^b\\int_{y_1(x)}^{y_2(x)}\\int_{z_1(x, y)}^{z_2(x, y)} f\\,dz\\,dy\\,dx'} />
        <FormulaSteps steps={[
          { title: '1. Innermost', text: <>In z; x and y are constants.</> },
          { title: '2. Middle', text: <>In y; x is a constant.</> },
          { title: '3. Outermost', text: <>In x, between numbers.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the volume of the tetrahedron <InlineMath math="x, y, z \ge 0, \ x + y + z \le 1" />.</ExampleProblem>
        <ExampleStep n={1} title="INNERMOST"><MathPanel><BlockMath math="\int_0^{1-x-y} dz = 1 - x - y" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MIDDLE"><MathPanel><BlockMath math="\int_0^{1-x} (1 - x - y)\,dy = \frac{(1-x)^2}{2}" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="OUTERMOST"><MathPanel><BlockMath math="\int_0^1 \frac{(1-x)^2}{2}\,dx = \frac{1}{6}" /></MathPanel><StepText>As expected: a sixth of the unit cube.</StepText></ExampleStep>
        <Conclusion result="V = 1/6" math={<BlockMath math="V = \frac{1}{6}" />}>The second example button below loads this solid.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Triple Integral Calculator"><TripleIntegralCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['double-integral', 'jacobian', 'beta-gamma']} />
    </MethodPage>
  );
}
