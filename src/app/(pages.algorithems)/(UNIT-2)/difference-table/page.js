'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DifferenceTableCalculator from './algorithems.difference-table';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between Δ, ∇ and δ?',
    a: <>They are the same subtractions, labelled from different ends. Forward: <InlineMath math="\Delta y_i = y_{i+1} - y_i" />. Backward: <InlineMath math="\nabla y_i = y_i - y_{i-1}" />. Central: <InlineMath math="\delta y_{i+1/2} = y_{i+1} - y_i" />. So <InlineMath math="\Delta y_0 = \nabla y_1 = \delta y_{1/2}" />.</>,
  },
  {
    q: 'What is the shift operator E?',
    a: <><InlineMath math="E\,y_i = y_{i+1}" />. The others follow from it: <InlineMath math="\Delta = E - 1" />, <InlineMath math="\nabla = 1 - E^{-1}" /> and <InlineMath math="\delta = E^{1/2} - E^{-1/2}" />.</>,
  },
  {
    q: 'Why do the differences become constant?',
    a: <>For a polynomial of degree n with equally spaced x, the nth differences are constant and the higher ones are 0. So the table tells you the lowest degree of polynomial that fits the data.</>,
  },
];

export default function DifferenceTablePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • EQUAL INTERVAL INTERPOLATION" title="Finite Difference Table" subtitle="Forward, Backward & Central">
        A <strong>finite difference table</strong> lists the values y and their differences: <InlineMath math="\Delta y_i = y_{i+1} - y_i" />, then the differences of those, and so on. It is the starting point of Newton&apos;s, Gauss&apos;s, Stirling&apos;s and Bessel&apos;s formulas.
      </MethodHeader>

      <FormulaBox label="THE OPERATORS" tag="EQUAL SPACING h">
        <Formula math={`\\begin{gathered} \\Delta y_i = y_{i+1} - y_i, \\quad \\nabla y_i = y_i - y_{i-1}, \\quad \\delta y_{i + \\frac{1}{2}} = y_{i+1} - y_i \\\\ E = 1 + \\Delta, \\quad \\nabla = 1 - E^{-1}, \\quad \\delta = E^{1/2} - E^{-1/2} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Check the Spacing', text: <>The x values must go up in equal steps h.</> },
            { title: '2. Subtract Neighbours', text: <>Each column is the difference of the one before: lower minus upper.</> },
            { title: '3. Stop When Constant', text: <>When a column is constant (the next is all 0), you have found the degree.</> },
          ]}
        />
        <SymbolKey rows={[
          { s: '\\Delta y_i', t: 'Forward difference: the next y minus this y. Written on row i.', e: '\\Delta y_0 = 8 - 1 = 7' },
          { s: '\\nabla y_i', t: 'Backward difference: this y minus the previous y. The same numbers, labelled on the lower row.', e: '\\nabla y_1 = 7' },
          { s: '\\delta y_{i+\\frac12}', t: 'Central difference: labelled halfway between the two rows.', e: '\\delta y_{\\frac12} = 7' },
          { s: '\\Delta^2 y_i', t: 'A difference of differences. The k-th differences of a degree-k polynomial are constant.', e: '\\Delta^2 y_0 = 19 - 7 = 12' },
          { s: 'E,\\ \\Delta,\\ \\nabla', t: 'Operators: E shifts to the next value (E y_i = y₍ᵢ₊₁₎), and E = 1 + Δ.', e: 'E y_0 = y_1' },
        ]} />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Make the forward difference table for x = 1, 2, 3, 4, 5 and y = 1, 8, 27, 64, 125, and find the degree of the polynomial.
        </ExampleProblem>

        <ExampleStep n={1} title="FIRST DIFFERENCES">
          <MathPanel>
            <BlockMath math="\Delta y: \ 8 - 1 = 7, \quad 27 - 8 = 19, \quad 64 - 27 = 37, \quad 125 - 64 = 61" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="HIGHER DIFFERENCES">
          <MathPanel>
            <BlockMath math="\Delta^2 y: \ 12, \ 18, \ 24 \qquad \Delta^3 y: \ 6, \ 6 \qquad \Delta^4 y: \ 0" />
          </MathPanel>
          <StepText>The third differences are constant and the fourth is 0.</StepText>
        </ExampleStep>

        <Conclusion result="Constant third differences: a cubic" math={<BlockMath math="\Delta^3 y = 6 \implies \text{degree } 3 \ (\text{here } y = x^3)" />}>
          The calculator below opens on this data. Switch the notation to see the same numbers labelled ∇ or δ.
        </Conclusion>
      </WorkedExample>

      <CommonMistakes items={[
        { m: <>Subtracting upper minus lower.</>, f: <>Always lower minus upper: <InlineMath math="\Delta y_0 = y_1 - y_0" />.</> },
        { m: <>Writing the differences in the wrong rows.</>, f: <>Forward differences go on the upper row of each pair; backward on the lower row; central halfway between.</> },
        { m: <>Thinking Δ, ∇ and δ give different numbers.</>, f: <>They are the same numbers with different labels: <InlineMath math="\Delta y_0 = \nabla y_1 = \delta y_{\frac12}" />.</> },
        { m: <>Unequal x steps.</>, f: <>These tables need equally spaced x values; otherwise use divided differences.</> },
        { m: <>Sign slips with negative entries.</>, f: <>Bracket them: <InlineMath math="-0.37 - (-0.80) = 0.43" />.</> },
        { m: <>Misreading the degree.</>, f: <>If the k-th differences are constant (and the next are 0), the data come from a polynomial of degree k.</> },
      ]} />

      <Lab heading="Interactive Difference Table">
        <DifferenceTableCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['newton-forward', 'newton-backward', 'stirling', 'bessel']} />
    </MethodPage>
  );
}
