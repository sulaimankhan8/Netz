'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.chebyshev-nodes';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Interpolate f = 1/(1 + 25x²) on [−1, 1] with 11 points, equally spaced and Chebyshev.</ExampleProblem>
        <ExampleStep n={1} title="EQUALLY SPACED"><MathPanel><BlockMath math={"\\max|f - p| \\approx 1.92 \\ (\\text{near } x = \\pm 0.95)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="CHEBYSHEV"><MathPanel><BlockMath math={"\\max|f - p| \\approx 0.109"} /></MathPanel><StepText>Almost 18 times smaller with the same number of points.</StepText></ExampleStep>
        <Conclusion result="Error 1.92 vs 0.109" math={<BlockMath math={"1.92 \\ \\text{(equal)} \\quad \\text{vs} \\quad 0.109 \\ \\text{(Chebyshev)}"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Chebyshev Nodes Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","cubic-spline","newton-divided"]} />
    </MethodPage>
  );
}
