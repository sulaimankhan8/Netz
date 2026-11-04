'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GstCalculator from './algorithems.gst-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How do you calculate GST on a price?',
    a: <>Multiply the price by the rate and divide by 100: at 18%, GST on ₹50,000 is <InlineMath math="50{,}000 \times \frac{18}{100} = 9{,}000" />, so the total is ₹59,000.</>,
  },
  {
    q: 'How do you remove GST from a price that already includes it?',
    a: <>Divide by <InlineMath math="1 + \frac{r}{100}" />, don&apos;t subtract r%. At 18%, <InlineMath math="59{,}000 \div 1.18 = 50{,}000" />. Subtracting 18% of 59,000 would wrongly give 48,380.</>,
  },
  {
    q: 'What is the difference between CGST, SGST and IGST?',
    a: <>For a sale within one state, the GST is split equally: half is CGST (to the Centre) and half SGST (to the state), or UTGST in a union territory. For a sale to another state, or an import, the whole amount is IGST.</>,
  },
  {
    q: 'What are the GST rates after GST 2.0?',
    a: <>From 22 September 2025 the main rates are 5% and 18%, with 40% for luxury and sin goods. 0%, 0.25% and 3% remain for exempt items, rough diamonds and gold, and a few items stay at 12%. The old 12% and 28% slabs were mostly removed.</>,
  },
];

export default function GstPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="GST Calculator" subtitle="Add or Remove GST, CGST & SGST">
        <strong>GST</strong> (Goods and Services Tax) is added on top of a price: <InlineMath math="\text{GST} = \text{price} \times \frac{r}{100}" />. Within a state it is split half CGST, half SGST; between states it is all IGST.
      </MethodHeader>

      <FormulaBox label="THE TWO DIRECTIONS" tag="INDIA">
        <Formula math={`\\begin{gathered} \\text{Add: } \\ \\text{GST} = P \\times \\frac{r}{100}, \\quad \\text{Total} = P\\left(1 + \\frac{r}{100}\\right) \\\\ \\text{Remove: } \\ P = \\text{Total} \\times \\frac{100}{100 + r} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Which Price?', text: <>Before GST (exclusive) or including GST (inclusive)? The formula is different.</> },
            { title: '2. Find the Rate', text: <>Look up the item&apos;s slab: 5%, 18% and 40% are the main GST 2.0 rates.</> },
            { title: '3. Split It', text: <>Same state: CGST = SGST = GST ÷ 2. Different state or import: IGST = GST.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A shop in Pune sells a laptop for ₹50,000 before GST, to a customer in Pune. GST is 18%. Find the GST, the CGST and SGST, and the bill total. Then work backwards from the total.
        </ExampleProblem>

        <ExampleStep n={1} title="ADD GST">
          <MathPanel>
            <BlockMath math="\text{GST} = 50{,}000 \times \frac{18}{100} = 9{,}000, \qquad \text{Total} = 50{,}000 + 9{,}000 = 59{,}000" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="SPLIT INTO CGST AND SGST">
          <StepText>The sale is within Maharashtra, so the GST is shared equally between the Centre and the state:</StepText>
          <MathPanel>
            <BlockMath math="\text{CGST} = \text{SGST} = \frac{9{,}000}{2} = 4{,}500 \quad (9\% + 9\%)" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="REMOVE GST FROM THE TOTAL">
          <StepText>If you only know the total of ₹59,000, divide by 1.18 (not subtract 18%):</StepText>
          <MathPanel>
            <BlockMath math="\text{Price before GST} = 59{,}000 \times \frac{100}{118} = 50{,}000" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="GST ₹9,000 (CGST ₹4,500 + SGST ₹4,500), total ₹59,000" math={<BlockMath math="59{,}000 = 50{,}000 + 4{,}500 + 4{,}500" />}>
          If the customer were in another state, the same ₹9,000 would be charged as IGST.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive GST Calculator">
        <GstCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['vat', 'percentage', 'compound-interest']} />
    </MethodPage>
  );
}
