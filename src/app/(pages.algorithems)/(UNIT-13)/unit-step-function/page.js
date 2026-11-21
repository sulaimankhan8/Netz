'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.unit-step-function';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I write a piecewise function with unit steps?', a: <>A piece g(t) on a &lt; t &lt; b is <InlineMath math="g(t)[u(t - a) - u(t - b)]" />. Add the pieces. The calculator does this for you.</> },
  { q: 'What is the Laplace transform of the Dirac delta?', a: <><InlineMath math="\mathcal{L}\{\delta(t - a)\} = e^{-as}" />, and 1 for δ(t). The delta is an instant kick of total size 1.</> },
  { q: 'Why divide by 1 − e^(−sT) for periodic functions?', a: <>The integral over each period repeats, shrunk by e^(−sT) each time; adding the geometric series gives the factor <InlineMath math="\frac{1}{1 - e^{-sT}}" />.</> },
];

export default function UnitStepPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="Unit Step, Impulse and Periodic Functions" subtitle="Laplace Transforms of Switched and Repeating Signals">
        Transform piecewise functions with the <strong>unit step</strong> u(t − a) and the second shifting theorem, impulses with δ(t − a), and <strong>periodic functions</strong> from one period.
      </MethodHeader>
      <FormulaBox label="THE RULES" tag="SECOND SHIFT">
        <Formula math={'\\mathcal{L}\\{f(t - a)u(t - a)\\} = e^{-as}F(s), \\quad \\mathcal{L}\\{\\delta(t - a)\\} = e^{-as}, \\quad \\mathcal{L}\\{f\\} = \\frac{\\int_0^T e^{-st}f\\,dt}{1 - e^{-sT}}'} />
        <FormulaSteps steps={[
          { title: '1. Unit steps', text: <>Write each piece with u(t − a).</> },
          { title: '2. Shift', text: <>Each u(t − a) gives e^(−as).</> },
          { title: '3. Periodic', text: <>One period, then divide.</> },
        ]} />
        <SymbolKey rows={EX['unit-step-function'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['unit-step-function'].example} />
      <CommonMistakes items={EX['unit-step-function'].mistakes} />
      <Lab heading="Interactive Unit Step Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'inverse-laplace', 'laplace-ode']} />
    </MethodPage>
  );
}
