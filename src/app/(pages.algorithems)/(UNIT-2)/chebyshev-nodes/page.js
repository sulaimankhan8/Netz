'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.chebyshev-nodes';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why do Chebyshev nodes work?", a: <>They make the factor ∏(x − xₖ) in the interpolation error as small as possible on the interval: its largest size is 2^{'{'}1−n{'}'} (on [−1, 1]).</> },
  { q: "Does Runge happen for every function?", a: <>No: for eˣ both node sets do well. It strikes when f has complex singularities close to the interval, as 1/(1 + 25x²) does at x = ±i/5.</> },
  { q: "What else avoids it?", a: <>Piecewise methods such as cubic splines.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Chebyshev Nodes and Runge's Phenomenon" subtitle="Equally Spaced versus Chebyshev Interpolation, Plotted">
        Interpolating with more equally spaced points can make things <strong>worse</strong>: for <InlineMath math={"f(x) = \\frac{1}{1 + 25x^2}"} /> the polynomial swings wildly near the ends (<strong>Runge&apos;s phenomenon</strong>). <strong>Chebyshev nodes</strong>, packed towards the ends, keep the error small.
      </MethodHeader>
      <FormulaBox label="CHEBYSHEV NODES" tag="ON [a, b]">
        <Formula math={"x_k = \\frac{a + b}{2} + \\frac{b - a}{2}\\cos\\frac{(2k + 1)\\pi}{2n}, \\qquad k = 0, 1, \\ldots, n - 1"} />
        <FormulaSteps steps={[
          { title: "1. Nodes", text: <>Equally spaced and Chebyshev.</> },
          { title: "2. Interpolate", text: <>A polynomial through each set.</> },
          { title: "3. Compare", text: <>The largest error on [a, b].</> },
        ]} />
        <SymbolKey rows={[
          { s: '[a, b]', t: 'The interval on which we interpolate.', e: '[-1, 1]' },
          { s: 'n', t: 'The number of interpolation points.', e: 'n = 11' },
          { s: 'x_k', t: 'The k-th Chebyshev node: a cosine spacing that puts more points near the ends.', e: 'x_0 = 0.989821' },
          { s: '\\frac{(2k + 1)\\pi}{2n}', t: 'The angle for node k: equally spaced angles give unequally spaced x values.', e: '\\dfrac{\\pi}{22}' },
          { s: '\\max|f - p|', t: 'The largest interpolation error over the interval: what Chebyshev nodes make small.', e: '0.109' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Interpolate f = 1/(1 + 25x²) on [−1, 1] with 11 points, equally spaced and Chebyshev.</ExampleProblem>
        <ExampleStep n={1} title="WORK OUT THE CHEBYSHEV NODES">
          <StepText>Here <InlineMath math="a = -1" />, <InlineMath math="b = 1" />, <InlineMath math="n = 11" />, so <InlineMath math="x_k = \cos\dfrac{(2k+1)\pi}{22}" />:</StepText>
          <MathPanel>
            <BlockMath math={"x_0 = \\cos\\frac{\\pi}{22} = 0.989821, \\quad x_1 = \\cos\\frac{3\\pi}{22} = 0.909632, \\quad x_2 = \\cos\\frac{5\\pi}{22} = 0.755750"} />
            <BlockMath math={"x_3 = 0.540641, \\quad x_4 = 0.281733, \\quad x_5 = \\cos\\frac{11\\pi}{22} = 0, \\quad x_6, \\ldots, x_{10} = -x_4, \\ldots, -x_0"} />
          </MathPanel>
          <StepText>The nodes crowd towards the ends of the interval; the equally spaced ones are <InlineMath math="-1, -0.8, \ldots, 0.8, 1" />.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="EQUALLY SPACED: THE ERROR">
          <MathPanel><BlockMath math={"\\max|f - p| \\approx 1.92 \\ (\\text{near } x = \\pm 0.94)"} /></MathPanel>
          <StepText>The polynomial swings wildly near the ends (Runge&apos;s phenomenon).</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="CHEBYSHEV: THE ERROR">
          <MathPanel><BlockMath math={"\\max|f - p| \\approx 0.109"} /></MathPanel>
          <StepText>Almost 18 times smaller with the same number of points.</StepText>
        </ExampleStep>
        <Conclusion result="Error 1.92 vs 0.109" math={<BlockMath math={"1.92 \\ \\text{(equal)} \\quad \\text{vs} \\quad 0.109 \\ \\text{(Chebyshev)}"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Using degrees in the cosine.</>, f: <>The angle <InlineMath math="\dfrac{(2k+1)\pi}{2n}" /> is in radians.</> },
        { m: <>Forgetting to map to [a, b].</>, f: <>On any interval other than [−1, 1] use <InlineMath math="\dfrac{a+b}{2} + \dfrac{b-a}{2}\cos(\cdots)" />.</> },
        { m: <>Using k = 1 … n.</>, f: <>k runs from 0 to n − 1 with this formula.</> },
        { m: <>Adding more equally spaced points to fix a wiggle.</>, f: <>With equal spacing more points can make it worse (Runge&apos;s phenomenon); move the points instead.</> },
        { m: <>Expecting the nodes to include the end points.</>, f: <>Chebyshev nodes lie strictly inside (a, b); the end points are not nodes.</> },
        { m: <>Writing only the final answer.</>, f: <>Show at least the first few nodes with the cosine worked out, and compare the errors.</> },
      ]} />
      <Lab heading="Interactive Chebyshev Nodes Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","cubic-spline","newton-divided"]} />
    </MethodPage>
  );
}
