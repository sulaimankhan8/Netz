'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.horner-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, IterationPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is \"Horner's scheme\"?", a: <>Evaluating p(c) as (…(aₙc + aₙ₋₁)c + …)c + a₀: n multiplications instead of many powers. The same table does synthetic division.</> },
  { q: "Why multiply the roots by 10?", a: <>After diminishing, the root is 0.d…; multiplying by 10 makes it d.…, so the next digit is a whole-number sign change.</> },
  { q: "Are the digits rounded?", a: <>No, they are exact digits: the root is between the answer and the answer plus one unit in the last place.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Horner's Method Calculator" subtitle="A Real Root Digit by Digit, by Diminishing the Roots">
        <strong>Horner&apos;s method</strong> finds a root one digit at a time. Shift the polynomial so the root lies between 0 and 1 (<strong>diminish the roots</strong> by synthetic division), multiply the roots by 10, and read the next digit from a sign change.
      </MethodHeader>
      <FormulaBox label="ONE DIGIT" tag="SYNTHETIC DIVISION">
        <Formula math={"p(x) \\to p(x + d) \\ \\text{(diminish by } d\\text{)}, \\qquad a_k \\to 10^k a_k \\ \\text{(multiply the roots by 10)}"} />
        <FormulaSteps steps={[
          { title: "1. Whole part", text: <>Sign change between a and a + 1.</> },
          { title: "2. Diminish", text: <>By a, then ×10.</> },
          { title: "3. Next digit", text: <>Sign change again; repeat.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'p(x)', t: 'The polynomial whose root we want, written by its coefficients from the highest power down (zeros included).', e: 'x^3 + 0x^2 + 3x - 5' },
          { s: 'd', t: 'The digit found at this stage: the whole part first, then one decimal place per stage.', e: 'd = 1,\\ 1,\\ 5,\\ 4' },
          { s: 'p(x + d)', t: 'The polynomial with its roots made smaller by d (diminished). Done by repeated synthetic division by d.', e: 'x^3 + 3x^2 + 6x - 1' },
          { s: '10^k a_k', t: 'Multiplying the roots by 10: multiply the second coefficient by 10, the third by 100, the fourth by 1000, …', e: '1,\\ 30,\\ 600,\\ -1000' },
          { s: 'q(d)', t: 'The new polynomial at whole numbers d. Where its sign changes between d and d + 1, the next digit is d.', e: 'q(1) = -369,\\ q(2) = 328' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the positive root of <InlineMath math="x^3 + 3x - 5 = 0" /> to 3 decimal places.</ExampleProblem>
        <ExampleStep n={1} title="WHOLE PART">
          <MathPanel><BlockMath math={"p(1) = 1 + 3 - 5 = -1, \\qquad p(2) = 8 + 6 - 5 = 9 \\quad\\Rightarrow\\quad 1 < x < 2"} /></MathPanel>
          <StepText>The whole part is 1.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="DIMINISH THE ROOTS BY 1 (SYNTHETIC DIVISION)">
          <StepText>Divide the coefficients <InlineMath math="1,\ 0,\ 3,\ -5" /> by 1 three times; each time the last number is the next coefficient (read from the bottom up):</StepText>
          <MathPanel>
            <BlockMath math={"\\begin{array}{r|rrrr} 1 & 1 & 0 & 3 & -5 \\\\ & & 1 & 1 & 4 \\\\ \\hline & 1 & 1 & 4 & \\boxed{-1} \\\\ & & 1 & 2 & \\\\ \\hline & 1 & 2 & \\boxed{6} & \\\\ & & 1 & & \\\\ \\hline & \\boxed{1} & \\boxed{3} & & \\end{array}"} />
            <BlockMath math={"p(x + 1) = x^3 + 3x^2 + 6x - 1"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="FIRST DECIMAL PLACE">
          <StepText>Multiply the roots by 10 (coefficients × 1, 10, 100, 1000), then look for the sign change:</StepText>
          <MathPanel>
            <BlockMath math={"q(x) = x^3 + 30x^2 + 600x - 1000"} />
            <BlockMath math={"q(1) = 1 + 30 + 600 - 1000 = -369, \\qquad q(2) = 8 + 120 + 1200 - 1000 = 328"} />
          </MathPanel>
          <StepText>The sign changes between 1 and 2, so the first decimal is <strong>1</strong>. Diminish by 1 again: <InlineMath math="x^3 + 33x^2 + 663x - 369" />.</StepText>
        </ExampleStep>
        <ExampleStep n={4} title="SECOND AND THIRD DECIMAL PLACES" space={4}>
          <IterationPanel label="Second decimal:">
            <BlockMath math={"\\times 10: \\ x^3 + 330x^2 + 66300x - 369000, \\qquad q(5) = -29125, \\ q(6) = 40896 \\Rightarrow \\text{digit } 5"} />
            <BlockMath math={"\\text{diminish by } 5: \\ x^3 + 345x^2 + 69675x - 29125"} />
          </IterationPanel>
          <IterationPanel label="Third decimal:">
            <BlockMath math={"\\times 10: \\ x^3 + 3450x^2 + 6967500x - 29125000, \\qquad q(4) = -1199736, \\ q(5) = 5798875 \\Rightarrow \\text{digit } 4"} />
          </IterationPanel>
        </ExampleStep>
        <ExampleStep n={5} title="SUMMARY TABLE">
          <StepTable
            columns={[{ key: 'stage', label: 'Stage', bold: true }, { key: 'poly', label: 'Polynomial after this stage' }, { key: 'signs', label: 'Sign change' }, { key: 'digit', label: 'Digit', highlight: true }]}
            rows={[
              { stage: 'Whole part', poly: 'x³ + 3x − 5', signs: 'p(1) = −1, p(2) = 9', digit: '1' },
              { stage: '1st decimal', poly: 'x³ + 30x² + 600x − 1000', signs: 'q(1) = −369, q(2) = 328', digit: '1' },
              { stage: '2nd decimal', poly: 'x³ + 330x² + 66300x − 369000', signs: 'q(5) = −29125, q(6) = 40896', digit: '5' },
              { stage: '3rd decimal', poly: 'x³ + 3450x² + 6967500x − 29125000', signs: 'q(4) = −1199736, q(5) = 5798875', digit: '4' },
            ]}
            rowKey={(r) => r.stage}
          />
        </ExampleStep>
        <Conclusion result="x ≈ 1.154" math={<BlockMath math={"x = 1.154\\ldots, \\qquad p(1.154) = -0.0012 \\approx 0"} />}>The digits are exact (not rounded): the root lies between 1.154 and 1.155. The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Leaving out missing powers.</>, f: <><InlineMath math="x^3 + 3x - 5" /> has no <InlineMath math="x^2" /> term: write its coefficient as 0, i.e. <InlineMath math="1,\ 0,\ 3,\ -5" />.</> },
        { m: <>Multiplying every coefficient by 10.</>, f: <>To multiply the roots by 10, multiply the coefficients by <InlineMath math="1, 10, 100, 1000" /> from the top power down.</> },
        { m: <>Reading the diminished coefficients in the wrong order.</>, f: <>The boxed remainders, read from the last division back to the first, are the coefficients from the highest power down.</> },
        { m: <>Rounding the final digit.</>, f: <>Each digit is exact: write 1.154, not 1.155.</> },
        { m: <>Forgetting to diminish after finding a digit.</>, f: <>Each stage is: multiply the roots by 10, find the digit d, diminish by d.</> },
        { m: <>Writing only the final answer.</>, f: <>Show each synthetic division, the sign change for each digit, and the table.</> },
      ]} />
      <Lab heading="Interactive Horner's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bisection","newton-raphson","graeffe-root-squaring"]} />
    </MethodPage>
  );
}
