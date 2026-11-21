'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CircleCalculator from './algorithems.circle-equation-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['circle-equation-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['circle-equation-calculator'].example} />
      <CommonMistakes items={EX['circle-equation-calculator'].mistakes} />
      <Lab heading="Interactive Circle Calculator"><CircleCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['conics', 'coordinate-geometry', 'tangent-normal']} />
    </MethodPage>
  );
}
