'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import VatCalculator from './algorithems.vat-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How do you remove 20% VAT from a price?',
    a: <>Divide by 1.2. A price of £240 including VAT is <InlineMath math="240 \div 1.2 = 200" /> before VAT, so the VAT is £40. Subtracting 20% of £240 (£48) is a common mistake.</>,
  },
  {
    q: 'How do you add VAT to a price?',
    a: <>Multiply by <InlineMath math="1 + \frac{r}{100}" />. At 20%, £200 becomes <InlineMath math="200 \times 1.2 = 240" />.</>,
  },
  {
    q: 'What is the standard VAT rate in the UK and the EU?',
    a: <>The UK standard rate is 20%. EU countries set their own, from 17% in Luxembourg to 27% in Hungary; EU law sets 15% as the minimum. The calculator lists every EU country.</>,
  },
  {
    q: 'Is GST the same as VAT?',
    a: <>They work the same way: a tax added at each sale and passed on to the buyer. Australia, New Zealand, Singapore and India call it GST; Japan calls it consumption tax. For India&apos;s CGST/SGST split, use the GST calculator.</>,
  },
];

export default function VatPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="VAT Calculator" subtitle="Add or Remove VAT by Country">
        <strong>VAT</strong> (value added tax) is added to a price: <InlineMath math="\text{gross} = \text{net} \times \left(1 + \frac{r}{100}\right)" />. To take it off again, divide by that same number. Don&apos;t subtract the percentage.
      </MethodHeader>

      <FormulaBox label="ADD AND REMOVE" tag="UK, EU AND MORE">
        <Formula math={`\\begin{gathered} \\text{Add: } \\ \\text{gross} = \\text{net} \\times \\left(1 + \\frac{r}{100}\\right) \\\\ \\text{Remove: } \\ \\text{net} = \\frac{\\text{gross}}{1 + \\frac{r}{100}} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Net or Gross?', text: <>Is the price before VAT (net) or including VAT (gross)?</> },
            { title: '2. The Multiplier', text: <>Turn the rate into <InlineMath math="1 + \frac{r}{100}" />: 20% → 1.2, 5% → 1.05.</> },
            { title: '3. Multiply or Divide', text: <>Net → gross: multiply. Gross → net: divide. VAT = gross − net.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A UK shop sells a jacket for £240, including 20% VAT. How much is the jacket before VAT, and how much is the VAT?
        </ExampleProblem>

        <ExampleStep n={1} title="DIVIDE BY THE MULTIPLIER">
          <MathPanel>
            <BlockMath math="\text{net} = \frac{240}{1 + \frac{20}{100}} = \frac{240}{1.2} = 200" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="THE VAT">
          <MathPanel>
            <BlockMath math="\text{VAT} = 240 - 200 = 40" />
          </MathPanel>
          <StepText>Check: 20% of £200 is £40, and £200 + £40 = £240 ✓</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="WHY NOT SUBTRACT 20%?">
          <MathPanel>
            <BlockMath math="240 - 20\% \text{ of } 240 = 240 - 48 = 192" />
            <BlockMath math="\text{but } 192 \times 1.2 = 230.40 \neq 240" />
          </MathPanel>
          <StepText>The 20% was worked out on £200, not on £240, so you have to undo the multiplication.</StepText>
        </ExampleStep>

        <Conclusion result="£200 before VAT, £40 VAT" math={<BlockMath math="240 = 200 + 40" />}>
          The calculator below opens on this jacket. Pick another country to use its rate.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive VAT Calculator">
        <VatCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['gst', 'percentage']} />
    </MethodPage>
  );
}
