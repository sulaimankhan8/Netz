'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SalesTaxCalculator from './algorithems.sales-tax-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I find the price before sales tax?', a: <>Divide the total by <InlineMath math="1 + \frac{c}{100}" />. At 8.25%, <InlineMath math="\$108.25 \div 1.0825 = \$100" />. Subtracting 8.25% of $108.25 would give the wrong answer.</> },
  { q: 'Why is my receipt rate higher than the state rate?', a: <>Counties, cities and special districts add their own rates on top of the state rate. The combined rate depends on the exact address; type the local part into the calculator.</> },
  { q: 'Which states have no sales tax?', a: <>Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax, though some towns in Alaska and Montana charge a local one.</> },
];

export default function SalesTaxPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="Sales Tax Calculator" subtitle="US State and Local Sales Tax">
        <strong>Sales tax</strong> in the US is the state rate plus any local rate, charged on the price: <InlineMath math="\text{tax} = \text{price} \times \frac{c}{100}" />. Add it to a price, or take it out of a total.
      </MethodHeader>
      <FormulaBox label="THE TWO DIRECTIONS" tag="USA">
        <Formula math={'\\begin{gathered} c = \\text{state rate} + \\text{local rate} \\\\ \\text{Add: } \\ \\text{Total} = P\\left(1 + \\frac{c}{100}\\right), \\qquad \\text{Remove: } \\ P = \\text{Total} \\times \\frac{100}{100 + c} \\end{gathered}'} />
        <FormulaSteps steps={[
          { title: '1. Combined rate', text: <>State rate plus county and city rates.</> },
          { title: '2. Add or remove', text: <>Multiply by c/100, or divide by 1 + c/100.</> },
          { title: '3. Split', text: <>Each part is its own rate × the price.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A $100 item is bought in a California city with a 1% local rate. Find the sales tax and the total.</ExampleProblem>
        <ExampleStep n={1} title="COMBINED RATE"><MathPanel><BlockMath math="c = 7.25\% + 1\% = 8.25\%" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TAX"><MathPanel><BlockMath math="\text{Tax} = 100 \times \frac{8.25}{100} = 8.25, \qquad \text{Total} = 108.25" /></MathPanel><StepText>The state&apos;s share is $7.25 and the local share $1.00.</StepText></ExampleStep>
        <Conclusion result="Tax $8.25, total $108.25" math={<BlockMath math="100 + 7.25 + 1.00 = 108.25" />}>The calculator below opens on this purchase.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Sales Tax Calculator"><SalesTaxCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['canada-sales-tax', 'vat', 'percentage']} />
    </MethodPage>
  );
}
