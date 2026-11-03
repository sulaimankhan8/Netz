'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PercentageCalculator from './algorithems.percentage-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How do you calculate percentage change?',
    a: <>Subtract the old value from the new one, divide by the old value, and multiply by 100: <InlineMath math="\frac{\text{new} - \text{old}}{\text{old}} \times 100" />. From 80 to 100 is a 25% increase; from 100 to 80 is a 20% decrease.</>,
  },
  {
    q: 'Is profit percentage calculated on cost price or selling price?',
    a: <>On the cost price: <InlineMath math="\text{Profit \%} = \frac{SP - CP}{CP} \times 100" />. Loss % is also on the cost price.</>,
  },
  {
    q: 'Are two discounts of 20% and 10% the same as 30%?',
    a: <>No. The second discount comes off the already reduced price: 1000 → 800 → 720, a total of 28%. The single equivalent discount is <InlineMath math="a + b - \frac{ab}{100} = 20 + 10 - 2 = 28\%" />.</>,
  },
  {
    q: 'What is the difference between markup and margin?',
    a: <>Both use the same gain (selling price − cost). Markup divides it by the cost; margin divides it by the selling price. Buying at 80 and selling at 100 is a 25% markup but a 20% margin.</>,
  },
];

export default function PercentagePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="Percentage Calculator" subtitle="Change, Profit & Loss, Discount">
        A <strong>percentage</strong> is a number out of 100: <InlineMath math="x\% \text{ of } y = \frac{x}{100} \times y" />. The same idea gives percent change, profit and loss (on cost price), discounts (on marked price), and markup and margin.
      </MethodHeader>

      <FormulaBox label="THE KEY FORMULAS" tag="6 TOOLS">
        <Formula math={`\\begin{gathered} \\% \\text{ change} = \\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100 \\\\ \\text{Profit \\%} = \\frac{SP - CP}{CP} \\times 100 \\\\ SP = MP \\times \\left(1 - \\frac{d}{100}\\right) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Find the Base', text: <>Percent of what? Change: the old value. Profit/loss: the cost price. Discount: the marked price.</> },
            { title: '2. Divide by the Base', text: <>Difference ÷ base, then × 100 to turn it into a percentage.</> },
            { title: '3. One Step at a Time', text: <>For successive changes, apply each % to the new amount, never add the percentages.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A shopkeeper buys a jacket for ₹800, marks it 25% above the cost price, and then gives a 10% discount. Find the selling price and the profit percentage.
        </ExampleProblem>

        <ExampleStep n={1} title="MARKED PRICE">
          <MathPanel>
            <BlockMath math="MP = 800 + 25\% \text{ of } 800 = 800 \times 1.25 = 1000" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="SELLING PRICE AFTER THE DISCOUNT">
          <StepText>The discount is taken on the marked price, not the cost price:</StepText>
          <MathPanel>
            <BlockMath math="SP = 1000 \times \left(1 - \frac{10}{100}\right) = 1000 \times 0.9 = 900" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="PROFIT PERCENTAGE">
          <MathPanel>
            <BlockMath math="\text{Profit} = SP - CP = 900 - 800 = 100" />
            <BlockMath math="\text{Profit \%} = \frac{100}{800} \times 100 = 12.5\%" />
          </MathPanel>
          <StepText>Notice it is not 25% − 10% = 15%: the two percentages have different bases.</StepText>
        </ExampleStep>

        <Conclusion result="SP = ₹900, profit = 12.5%" math={<BlockMath math="SP = 900, \qquad \text{Profit} = 12.5\%" />}>
          The calculator below opens on this sale (CP 800, SP 900). Switch tool to try successive discounts.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Percentage Calculator">
        <PercentageCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['compound-interest', 'emi']} />
    </MethodPage>
  );
}
