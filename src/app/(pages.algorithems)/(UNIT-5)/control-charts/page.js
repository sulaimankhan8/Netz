'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.control-charts';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['control-charts'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['control-charts'].example} />
      <CommonMistakes items={EX['control-charts'].mistakes} />
      <Lab heading="Interactive Control Charts Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["descriptive-statistics","normal","z-test"]} />
    </MethodPage>
  );
}
