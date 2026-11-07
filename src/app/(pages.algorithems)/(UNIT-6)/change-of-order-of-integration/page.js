'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ChangeOfOrderCalculator from './algorithems.change-of-order-of-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why change the order?', a: <>Sometimes the inner integral can&apos;t be done one way but can the other. <InlineMath math="\int e^{y^2}\,dy" /> has no elementary answer, but <InlineMath math="\int e^{y^2}\,dx = x\,e^{y^2}" /> is easy.</> },
  { q: 'Why does the new integral sometimes split into two?', a: <>When the left or right edge of the region changes from one curve to another partway up, each part needs its own limits. For the region between y = x² and y = 2 − x, the right edge is x = √y below y = 1 and x = 2 − y above it.</> },
  { q: 'How do I find the new limits by hand?', a: <>Sketch the region. Draw a horizontal strip: where it enters and leaves the region give the new inner limits (solve each curve for x). The lowest and highest points of the region give the outer limits.</> },
];

export default function ChangeOfOrderPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Change of Order of Integration" subtitle="Swap dy dx and dx dy, With the Region Sketched">
        Rewrite <InlineMath math="\int\int f\,dy\,dx" /> as <InlineMath math="\int\int f\,dx\,dy" /> over the same region: find where y runs, then solve each boundary curve for x. Splits into pieces when the edge changes.
      </MethodHeader>
      <FormulaBox label="SAME REGION, OTHER STRIPS" tag="dy dx ⇄ dx dy">
        <Formula math={'\\int_a^b\\int_{g_1(x)}^{g_2(x)} f\\,dy\\,dx = \\int_c^d\\int_{h_1(y)}^{h_2(y)} f\\,dx\\,dy'} />
        <FormulaSteps steps={[
          { title: '1. Sketch', text: <>Draw the curves and shade the region.</> },
          { title: '2. New strip', text: <>Horizontal instead of vertical.</> },
          { title: '3. Solve for x', text: <>Each curve gives the new inner limits.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Change the order and evaluate <InlineMath math="\int_0^1\int_x^1 e^{y^2}\,dy\,dx" />.</ExampleProblem>
        <ExampleStep n={1} title="THE REGION"><MathPanel><BlockMath math="0 \le x \le 1, \quad x \le y \le 1" /></MathPanel><StepText>The triangle above y = x. A horizontal strip at height y runs from x = 0 to x = y.</StepText></ExampleStep>
        <ExampleStep n={2} title="NEW ORDER"><MathPanel><BlockMath math="\int_0^1\int_0^y e^{y^2}\,dx\,dy = \int_0^1 y\,e^{y^2}\,dy = \left[\frac{e^{y^2}}{2}\right]_0^1" /></MathPanel></ExampleStep>
        <Conclusion result="(e − 1)/2" math={<BlockMath math="= \frac{e - 1}{2} \approx 0.859" />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Change of Order Calculator"><ChangeOfOrderCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['double-integral', 'triple-integral', 'area-under-curve']} />
    </MethodPage>
  );
}
