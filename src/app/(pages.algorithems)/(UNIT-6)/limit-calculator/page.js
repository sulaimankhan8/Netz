'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LimitCalculator from './algorithems.limit-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is a limit?',
    a: <>The value a function gets closer and closer to as x approaches a point, even if the function is not defined at that point. <InlineMath math="\frac{x^2 - 4}{x - 2}" /> has no value at x = 2, but it gets as close as you like to 4.</>,
  },
  {
    q: "When can you use L'Hôpital's rule?",
    a: <>Only for the forms <InlineMath math="\frac{0}{0}" /> and <InlineMath math="\frac{\infty}{\infty}" />. Then <InlineMath math="\lim \frac{f(x)}{g(x)} = \lim \frac{f'(x)}{g'(x)}" />: differentiate the top and the bottom separately (not with the quotient rule). Repeat if the form is still 0/0 or ∞/∞.</>,
  },
  {
    q: 'Why is the limit of sin x / x equal to 1?',
    a: <>It is a standard limit, true when x is in radians: near 0 the curve <InlineMath math="\sin x" /> and the line <InlineMath math="y = x" /> are almost the same. L&apos;Hôpital&apos;s rule confirms it: <InlineMath math="\lim_{x\to0} \frac{\cos x}{1} = 1" />.</>,
  },
  {
    q: 'When does a limit not exist?',
    a: <>When the left and right limits are different (like <InlineMath math="\frac{|x|}{x}" /> at 0, which gives −1 and 1), when the values grow without bound in opposite directions (like <InlineMath math="\frac{1}{x}" /> at 0), or when they never settle (like <InlineMath math="\sin\frac{1}{x}" /> at 0).</>,
  },
];

export default function LimitPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Limit Calculator" subtitle="Substitution, Factoring & L'Hôpital">
        A <strong>limit</strong> is the value <InlineMath math="f(x)" /> approaches as <InlineMath math="x" /> approaches a point. Try substituting first; if that gives <InlineMath math="\frac{0}{0}" />, factor and cancel, or use <strong>L&apos;Hôpital&apos;s rule</strong>.
      </MethodHeader>

      <FormulaBox label="THE ORDER TO TRY" tag="0/0 · ∞/∞">
        <Formula math={`\\begin{gathered} \\lim_{x \\to a} f(x) = f(a) \\ \\text{(if defined)} \\\\ \\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)} \\ \\text{(for } \\tfrac{0}{0} \\text{ or } \\tfrac{\\infty}{\\infty}\\text{)} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Substitute', text: <>Put x = a in. A normal number is the answer.</> },
            { title: '2. Simplify 0/0', text: <>Factor and cancel, or rationalise a square root, then substitute again.</> },
            { title: "3. L'Hôpital", text: <>Still 0/0 or ∞/∞? Differentiate top and bottom separately and try again.</> },
          ]}
        />
        <SymbolKey rows={EX['limit-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['limit-calculator'].example} />
      <CommonMistakes items={EX['limit-calculator'].mistakes} />

      <Lab heading="Interactive Limit Calculator">
        <LimitCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'quadratic', 'taylor']} />
    </MethodPage>
  );
}
