'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FirstPrinciplesCalculator from './algorithems.first-principles-derivative';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What does "from first principles" mean?',
    a: <>Finding the derivative straight from its definition, the limit of <InlineMath math="\frac{f(x+h) - f(x)}{h}" /> as <InlineMath math="h \to 0" />, without using rules like the power rule. It is the slope of the chord from x to x + h, as the two points come together.</>,
  },
  {
    q: 'Why can we not just put h = 0?',
    a: <>Because the fraction becomes <InlineMath math="\frac{0}{0}" />, which has no value. We first simplify so that h cancels from the bottom; after that, putting h = 0 is allowed.</>,
  },
  {
    q: 'Which standard limits are used?',
    a: <><InlineMath math="\lim_{\theta \to 0} \frac{\sin\theta}{\theta} = 1" /> for sin and cos, <InlineMath math="\lim_{h \to 0} \frac{e^h - 1}{h} = 1" /> for eˣ, and <InlineMath math="\lim_{t \to 0} \frac{\ln(1 + t)}{t} = 1" /> for ln x.</>,
  },
];

export default function FirstPrinciplesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Derivative from First Principles" subtitle="The Limit Definition, Step by Step">
        The <strong>derivative</strong> of f at x is the limit of the slope of a chord: <InlineMath math="f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" />. Expand, cancel, divide by h, then let h go to 0.
      </MethodHeader>

      <FormulaBox label="THE DEFINITION" tag="h → 0">
        <Formula math={`f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}`} />
        <FormulaSteps
          steps={[
            { title: '1. Write f(x + h)', text: <>Replace every x by (x + h) and expand.</> },
            { title: '2. Subtract and divide', text: <>Take away f(x) and divide by h; h must cancel from the bottom.</> },
            { title: '3. Let h → 0', text: <>Every term still containing h disappears. What is left is f′(x).</> },
          ]}
        />
        <SymbolKey rows={EX['first-principles-derivative'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['first-principles-derivative'].example} />
      <CommonMistakes items={EX['first-principles-derivative'].mistakes} />

      <Lab heading="Interactive First Principles Calculator">
        <FirstPrinciplesCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'limit', 'implicit']} />
    </MethodPage>
  );
}
