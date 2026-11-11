'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.control-charts';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Where do A₂, D₃, D₄ come from?", a: <>From the relation between the range and the standard deviation for normal samples of size n; they are in every SQC table and built into the page for n = 2 to 10.</> },
  { q: "Why can LCL be 0?", a: <>Counts and ranges cannot be negative, so a negative limit is replaced by 0.</> },
  { q: "p chart or c chart?", a: <>A p chart counts defective items in each sample; a c chart counts defects on each unit (a unit may have many).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Control Charts: x̄, R, p and c" subtitle="Statistical Quality Control Limits, Step by Step">
        A <strong>control chart</strong> plots a measurement sample by sample between a centre line and two <strong>control limits</strong> about three standard errors away. A point outside the limits signals a special cause worth looking for.
      </MethodHeader>
      <FormulaBox label="THE LIMITS" tag="±3σ">
        <Formula math={"\\bar{x}: \\ \\bar{\\bar{x}} \\pm A_2\\bar{R}; \\quad R: \\ D_3\\bar{R}, D_4\\bar{R}; \\quad p: \\ \\bar{p} \\pm 3\\sqrt{\\frac{\\bar{p}(1 - \\bar{p})}{n}}; \\quad c: \\ \\bar{c} \\pm 3\\sqrt{\\bar{c}}"} />
        <FormulaSteps steps={[
          { title: "1. Centre line", text: <>The overall mean (x̄̄, R̄, p̄ or c̄).</> },
          { title: "2. Limits", text: <>From the table constants or 3√…</> },
          { title: "3. Check", text: <>Points outside are out of control.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A c chart for defects 2 3 5 1 4 12 3 2.</ExampleProblem>
        <ExampleStep n={1} title="CENTRE"><MathPanel><BlockMath math={"\\bar{c} = \\frac{32}{8} = 4"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="LIMITS"><MathPanel><BlockMath math={"\\text{UCL} = 4 + 3\\sqrt4 = 10, \\quad \\text{LCL} = \\max(0, 4 - 6) = 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="CHECK"><MathPanel><BlockMath math={"12 > 10: \\text{ unit 6 is out of control}"} /></MathPanel></ExampleStep>
        <Conclusion result="Unit 6 out of control" math={<BlockMath math={"\\text{UCL} = 10, \\ c_6 = 12"} />}>The calculator below opens on an x̄–R chart.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Control Charts Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["descriptive-statistics","normal","z-test"]} />
    </MethodPage>
  );
}
