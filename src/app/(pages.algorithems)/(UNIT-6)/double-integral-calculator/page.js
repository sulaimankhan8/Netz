'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DoubleIntegralCalculator from './algorithems.double-integral-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Which integral do I do first?', a: <>The inner one, the one whose limits contain the other letter. In <InlineMath math="\int_0^1\int_0^x f\,dy\,dx" /> you integrate in y first (x held constant), then in x.</> },
  { q: 'How do I find the area of a region?', a: <>Integrate 1 over it: <InlineMath math="A = \iint_R dA" />. Between y = x² and y = x this gives 1/6.</> },
  { q: 'When should I use polar coordinates?', a: <>When the region is a circle, a sector or a curve like r = 2 sin θ, or the integrand has x² + y². Remember the extra r: <InlineMath math="dx\,dy = r\,dr\,d\theta" />.</> },
];

export default function DoubleIntegralPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Double Integral Calculator" subtitle="Iterated Integrals, Area and Polar Coordinates">
        Evaluate a <strong>double integral</strong> one variable at a time: the inner integral with the outer letter held constant, then the outer one. Cartesian (dy dx or dx dy) or polar, with a sketch of the region.
      </MethodHeader>
      <FormulaBox label="ITERATED INTEGRAL" tag="INNER FIRST">
        <Formula math={'\\iint_R f\\,dA = \\int_a^b \\left(\\int_{g_1(x)}^{g_2(x)} f(x, y)\\,dy\\right) dx'} />
        <FormulaSteps steps={[
          { title: '1. Inner', text: <>Integrate in y; x is a constant.</> },
          { title: '2. Limits', text: <>Put in y = g₂(x) and y = g₁(x).</> },
          { title: '3. Outer', text: <>Integrate the result in x from a to b.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate <InlineMath math="\int_0^1\int_0^x (x^2 + y^2)\,dy\,dx" />.</ExampleProblem>
        <ExampleStep n={1} title="INNER"><MathPanel><BlockMath math="\int_0^x (x^2 + y^2)\,dy = \left[x^2y + \frac{y^3}{3}\right]_0^x = \frac{4x^3}{3}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="OUTER"><MathPanel><BlockMath math="\int_0^1 \frac{4x^3}{3}\,dx = \left[\frac{x^4}{3}\right]_0^1 = \frac{1}{3}" /></MathPanel><StepText>The region is the triangle under y = x.</StepText></ExampleStep>
        <Conclusion result="1/3" math={<BlockMath math="\int_0^1\int_0^x (x^2 + y^2)\,dy\,dx = \frac{1}{3}" />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Double Integral Calculator"><DoubleIntegralCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['change-of-order', 'triple-integral', 'double-integration']} />
    </MethodPage>
  );
}
