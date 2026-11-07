'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.confidence-interval';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What does 95% confidence mean?", a: <>If you took many samples and built an interval from each, about 95% of those intervals would contain the true mean. Any one interval either does or doesn&apos;t.</> },
  { q: "When do I use t instead of z?", a: <>When σ is unknown and estimated by s, especially for small samples; t has fatter tails, giving wider intervals.</> },
  { q: "How do I make the interval narrower?", a: <>Take a larger sample (the width shrinks like 1/√n) or accept a lower confidence level.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Confidence Interval Calculator" subtitle="For a Mean (z or t) or a Proportion">
        A <strong>confidence interval</strong> is an estimate with a margin: <InlineMath math={"\\bar{x} \\pm z\\frac{\\sigma}{\\sqrt{n}}"} />. Use t instead of z when σ comes from a small sample, and <InlineMath math={"\\hat p \\pm z\\sqrt{\\hat p\\hat q/n}"} /> for proportions.
      </MethodHeader>
      <FormulaBox label="THE INTERVALS" tag="ESTIMATE ± MARGIN">
        <Formula math={"\\bar{x} \\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\qquad \\bar{x} \\pm t_{\\alpha/2,\\,n-1}\\frac{s}{\\sqrt{n}}, \\qquad \\hat p \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p(1 - \\hat p)}{n}}"} />
        <FormulaSteps steps={[
          { title: "1. Standard error", text: <>σ/√n (or the proportion form).</> },
          { title: "2. Critical value", text: <>z or t for the level.</> },
          { title: "3. Margin", text: <>Critical value × SE, either side.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A sample of 25 has mean 50; σ = 10. Find a 95% confidence interval for the mean.</ExampleProblem>
        <ExampleStep n={1} title="STANDARD ERROR"><MathPanel><BlockMath math={"SE = \\frac{10}{\\sqrt{25}} = 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTERVAL"><MathPanel><BlockMath math={"50 \\pm 1.96 \\times 2 = 50 \\pm 3.92"} /></MathPanel></ExampleStep>
        <Conclusion result="(46.08, 53.92)" math={<BlockMath math={"46.08 < \\mu < 53.92"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Confidence Interval Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["t-test","z-test","normal"]} />
    </MethodPage>
  );
}
