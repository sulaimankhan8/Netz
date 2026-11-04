'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RationalExpressionsCalculator from './algorithems.rational-expressions-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Can I cancel the x in (x + 2)/(x + 3)?', a: <>No. You can only cancel <strong>factors</strong> (things multiplied), never terms (things added). Factor first; if the same bracket is on top and bottom, then cancel it.</> },
  { q: 'Why keep x ≠ 3 after cancelling (x − 3)?', a: <>The original expression is undefined at x = 3, so the simplified one must exclude it too. They are equal everywhere else.</> },
  { q: 'How do I add fractions with different denominators?', a: <>Factor each denominator, take the lowest common denominator (each factor to its highest power), rewrite every fraction over it, then add the tops.</> },
];

export default function RationalExpressionsPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Rational Expressions" subtitle="Simplify, Add, Subtract, Multiply & Divide">
        A <strong>rational expression</strong> is a fraction of polynomials. To simplify, factor the top and the bottom and cancel common factors, keeping the values that make a denominator zero excluded.
      </MethodHeader>
      <FormulaBox label="THE IDEA" tag="cancel factors">
        <Formula math={`\\frac{x^2 - 1}{x^2 + 2x + 1} = \\frac{(x - 1)(x + 1)}{(x + 1)^2} = \\frac{x - 1}{x + 1}, \\quad x \\neq -1`} />
        <FormulaSteps steps={[
          { title: '1. Restrictions', text: <>Find every x that makes a denominator 0.</> },
          { title: '2. One fraction', text: <>For sums, use the lowest common denominator.</> },
          { title: '3. Factor and cancel', text: <>Cancel only common factors.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Simplify <InlineMath math="\frac{1}{x - 1} + \frac{1}{x + 1}" />.</ExampleProblem>
        <ExampleStep n={1} title="COMMON DENOMINATOR"><MathPanel><BlockMath math="\frac{(x + 1) + (x - 1)}{(x - 1)(x + 1)}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ADD THE TOPS"><MathPanel><BlockMath math="= \frac{2x}{(x - 1)(x + 1)}, \quad x \neq \pm 1" /></MathPanel><StepText>Nothing cancels: 2x has no factor in common with the bottom.</StepText></ExampleStep>
        <Conclusion result="2x / ((x − 1)(x + 1))" math={<BlockMath math="\frac{2x}{x^2 - 1}" />}>Try more in the calculator below.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Rational Expressions Calculator"><RationalExpressionsCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['factoring', 'inequalities', 'linear-equation']} />
    </MethodPage>
  );
}
