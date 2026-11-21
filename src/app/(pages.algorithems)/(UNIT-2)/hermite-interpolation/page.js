'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.hermite-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey,
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
        <SymbolKey rows={[
          { s: 'x_i', t: 'The points where we know both the value and the slope.', e: '0,\\ 1' },
          { s: 'z_k', t: 'The node list: every xᵢ written twice.', e: '0, 0, 1, 1' },
          { s: "f[x_i, x_i] = f'(x_i)", t: 'A divided difference over a repeated node is the given slope.', e: "f[0,0] = H'(0) = 0" },
          { s: 'f[z_0, \\ldots, z_j]', t: 'Higher divided differences, worked out as usual.', e: 'f[0,0,1,1] = -2' },
          { s: 'H(x)', t: 'The Hermite polynomial: it matches every value and every slope; degree at most 2n − 1.', e: '-2x^3 + 4x^2 + 1' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find H with H(0) = 1, H′(0) = 0, H(1) = 3, H′(1) = 2.</ExampleProblem>
        <ExampleStep n={1} title="LIST EACH NODE TWICE">
          <MathPanel>
            <BlockMath math={"z_0 = 0, \\quad z_1 = 0, \\quad z_2 = 1, \\quad z_3 = 1"} />
          </MathPanel>
          <StepText>Each point appears twice because we know two facts there: the value and the slope.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="FIRST DIVIDED DIFFERENCES">
          <MathPanel>
            <BlockMath math={"f[0, 0] = H'(0) = 0 \\quad (\\text{repeated node: use the slope})"} />
            <BlockMath math={"f[0, 1] = \\frac{H(1) - H(0)}{1 - 0} = \\frac{3 - 1}{1} = 2"} />
            <BlockMath math={"f[1, 1] = H'(1) = 2"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="HIGHER DIVIDED DIFFERENCES">
          <MathPanel>
            <BlockMath math={"f[0, 0, 1] = \\frac{f[0,1] - f[0,0]}{1 - 0} = \\frac{2 - 0}{1} = 2, \\qquad f[0, 1, 1] = \\frac{f[1,1] - f[0,1]}{1 - 0} = \\frac{2 - 2}{1} = 0"} />
            <BlockMath math={"f[0, 0, 1, 1] = \\frac{f[0,1,1] - f[0,0,1]}{1 - 0} = \\frac{0 - 2}{1} = -2"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="BUILD THE POLYNOMIAL">
          <MathPanel>
            <BlockMath math={"H(x) = f[z_0] + f[z_0,z_1](x - z_0) + f[z_0,z_1,z_2](x - z_0)(x - z_1) + f[z_0,\\ldots,z_3](x - z_0)(x - z_1)(x - z_2)"} />
            <BlockMath math={"= 1 + 0\\cdot x + 2x^2 + (-2)x^2(x - 1) = -2x^3 + 4x^2 + 1"} />
          </MathPanel>
          <StepText>Check: <InlineMath math="H(1) = -2 + 4 + 1 = 3" /> ✓, <InlineMath math="H'(x) = -6x^2 + 8x" />, so <InlineMath math="H'(1) = 2" /> ✓.</StepText>
        </ExampleStep>
        <Conclusion result="H(x) = −2x³ + 4x² + 1" math={<BlockMath math={"H(x) = -2x^3 + 4x^2 + 1, \\quad H(0.5) = \\tfrac74"} />}>The calculator below opens on this data.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Dividing by zero for a repeated node.</>, f: <>When the two nodes are the same, <InlineMath math="f[x_i, x_i]" /> is not a fraction: it is the given slope <InlineMath math="f'(x_i)" />.</> },
        { m: <>Listing each node only once.</>, f: <>Each point carries a value and a slope, so it appears twice: 0, 0, 1, 1.</> },
        { m: <>Dividing by the wrong span.</>, f: <>Higher differences divide by the span of the nodes they cover: <InlineMath math="f[0,0,1]" /> uses <InlineMath math="1 - 0" />.</> },
        { m: <>Wrong product factors.</>, f: <>The factors repeat with the nodes: <InlineMath math="(x - 0)(x - 0)(x - 1) = x^2(x - 1)" />.</> },
        { m: <>Not checking the slopes.</>, f: <>Differentiate H and check <InlineMath math="H'(x_i)" /> as well as <InlineMath math="H(x_i)" />.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the node list, every divided difference with its fraction, and the build-up of H.</> },
      ]} />
      <Lab heading="Interactive Hermite Interpolation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","newton-divided","cubic-spline"]} />
    </MethodPage>
  );
}
