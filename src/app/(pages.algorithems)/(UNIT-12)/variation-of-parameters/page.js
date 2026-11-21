'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.variation-of-parameters';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When should I use variation of parameters?', a: <>When the right side is not a simple xᵏ, eᵃˣ, sin or cos — for example sec x, tan x or eˣ/x — so the shortcut rules for the particular integral don&apos;t apply.</> },
  { q: 'What is the Wronskian?', a: <><InlineMath math="W = y_1y_2' - y_2y_1'" />, built from the two parts of the CF. It is never 0 for a proper pair y₁, y₂.</> },
  { q: 'Do I need constants in the integrals?', a: <>No: any constant would just add a multiple of y₁ or y₂, which the CF already has.</> },
];

export default function VariationPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Variation of Parameters" subtitle="The Particular Integral for Any Right Side">
        For <InlineMath math="y'' + py' + qy = R(x)" /> with CF <InlineMath math="C_1y_1 + C_2y_2" />, <strong>variation of parameters</strong> gives <InlineMath math="\text{PI} = -y_1\int \frac{y_2R}{W}dx + y_2\int \frac{y_1R}{W}dx" />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="WRONSKIAN">
        <Formula math={'W = y_1y_2\' - y_2y_1\', \\qquad \\text{PI} = -y_1\\int \\frac{y_2R}{W}\\,dx + y_2\\int \\frac{y_1R}{W}\\,dx'} />
        <FormulaSteps steps={[
          { title: '1. CF', text: <>Find y₁ and y₂.</> },
          { title: '2. W', text: <>The Wronskian.</> },
          { title: '3. Two integrals', text: <>Then combine into the PI.</> },
        ]} />
        <SymbolKey rows={EX['variation-of-parameters'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['variation-of-parameters'].example} />
      <CommonMistakes items={EX['variation-of-parameters'].mistakes} />
      <Lab heading="Interactive Variation of Parameters Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['ode-cc', 'cauchy-euler', 'ode-solver']} />
    </MethodPage>
  );
}
