'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CircleCalculator from './algorithems.circle-equation-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I find the centre and radius from the general equation?', a: <>Make the x² and y² coefficients 1, then compare with <InlineMath math="x^2 + y^2 + 2gx + 2fy + c = 0" />: the centre is <InlineMath math="(-g, -f)" /> and the radius is <InlineMath math="\sqrt{g^2 + f^2 - c}" />.</> },
  { q: 'When is an equation not a circle?', a: <>When x² and y² have different coefficients (an ellipse or hyperbola), when there is an xy term, or when <InlineMath math="g^2 + f^2 - c" /> is negative (no real points) or zero (a single point).</> },
  { q: 'How do I find the tangent at a point on the circle?', a: <>Replace x² by <InlineMath math="xx_1" />, y² by <InlineMath math="yy_1" />, x by <InlineMath math="\frac{x + x_1}{2}" /> and y by <InlineMath math="\frac{y + y_1}{2}" />: <InlineMath math="xx_1 + yy_1 + g(x + x_1) + f(y + y_1) + c = 0" />.</> },
];

export default function CirclePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="Circle Equation Calculator" subtitle="Centre, Radius, Tangents & Three-Point Circles">
        A circle with centre <InlineMath math="(h, k)" /> and radius r is <InlineMath math="(x - h)^2 + (y - k)^2 = r^2" />. Expanded, it is <InlineMath math="x^2 + y^2 + 2gx + 2fy + c = 0" />, with centre <InlineMath math="(-g, -f)" />.
      </MethodHeader>
      <FormulaBox label="TWO FORMS" tag="(−g, −f)">
        <Formula math={`(x - h)^2 + (y - k)^2 = r^2 \\iff x^2 + y^2 + 2gx + 2fy + c = 0, \\quad r = \\sqrt{g^2 + f^2 - c}`} />
        <FormulaSteps steps={[
          { title: 'From centre and radius', text: <>Write the standard form and expand.</> },
          { title: 'From three points', text: <>Each point gives a linear equation in g, f, c.</> },
          { title: 'From an equation', text: <>Compare coefficients to read g, f, c.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the centre and radius of <InlineMath math="x^2 + y^2 - 4x + 6y - 12 = 0" />.</ExampleProblem>
        <ExampleStep n={1} title="COMPARE"><MathPanel><BlockMath math="2g = -4, \ 2f = 6, \ c = -12 \ \Rightarrow \ g = -2, \ f = 3" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="CENTRE AND RADIUS"><MathPanel><BlockMath math="\text{Centre } (2, -3), \qquad r = \sqrt{4 + 9 + 12} = 5" /></MathPanel><StepText>Completing the square gives the same: (x − 2)² + (y + 3)² = 25.</StepText></ExampleStep>
        <Conclusion result="Centre (2, −3), radius 5" math={<BlockMath math="(x - 2)^2 + (y + 3)^2 = 5^2" />}>The first example button below also finds the tangent at (5, 1).</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Circle Calculator"><CircleCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['conics', 'coordinate-geometry', 'tangent-normal']} />
    </MethodPage>
  );
}
