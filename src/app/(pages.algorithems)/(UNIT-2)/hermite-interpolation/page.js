'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.hermite-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why use slopes?", a: <>Matching slopes too gives a much better fit with the same number of points, and smooth joins between pieces (cubic Hermite splines).</> },
  { q: "What degree is H?", a: <>At most 2n − 1 for n points: there are 2n conditions.</> },
  { q: "How is it checked?", a: <>H and H′ are evaluated at every node and compared with the given values.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Hermite Interpolation Calculator" subtitle="Matching Values and Slopes by Divided Differences">
        <strong>Hermite interpolation</strong> finds the polynomial that matches both the values <InlineMath math={"f(x_i)"} /> and the slopes <InlineMath math={"f'(x_i)"} />. Newton&apos;s divided differences work with every node written twice, where <InlineMath math={"f[x_i, x_i] = f'(x_i)"} />.
      </MethodHeader>
      <FormulaBox label="REPEATED NODES" tag="DEGREE ≤ 2n − 1">
        <Formula math={"z = x_0, x_0, x_1, x_1, \\ldots; \\quad f[x_i, x_i] = f'(x_i); \\quad H(x) = \\sum_j f[z_0, \\ldots, z_j]\\prod_{k<j}(x - z_k)"} />
        <FormulaSteps steps={[
          { title: "1. Double the nodes", text: <>Each x twice.</> },
          { title: "2. Differences", text: <>Use f′ where two nodes are equal.</> },
          { title: "3. Newton form", text: <>Expand to H(x).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find H with H(0) = 1, H′(0) = 0, H(1) = 3, H′(1) = 2.</ExampleProblem>
        <ExampleStep n={1} title="DIFFERENCES"><MathPanel><BlockMath math={"f[0, 0] = 0, \\ f[0, 1] = 2, \\ f[1, 1] = 2; \\quad f[0, 0, 1] = 2, \\ f[0, 1, 1] = 0; \\quad f[0, 0, 1, 1] = -2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="POLYNOMIAL"><MathPanel><BlockMath math={"H = 1 + 0\\cdot x + 2x^2 - 2x^2(x - 1) = -2x^3 + 4x^2 + 1"} /></MathPanel></ExampleStep>
        <Conclusion result="H(x) = −2x³ + 4x² + 1" math={<BlockMath math={"H(x) = -2x^3 + 4x^2 + 1, \\quad H(0.5) = \\tfrac74"} />}>The calculator below opens on this data.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Hermite Interpolation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","newton-divided","cubic-spline"]} />
    </MethodPage>
  );
}
