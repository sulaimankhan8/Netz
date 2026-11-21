'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bernoulli-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why z = y^(1−n)?', a: <>Divide by yⁿ: <InlineMath math="y^{-n}y' + Py^{1-n} = Q" />. With <InlineMath math="z = y^{1-n}" />, <InlineMath math="z' = (1-n)y^{-n}y'" />, so the equation becomes linear in z.</> },
  { q: 'What if n = 0 or n = 1?', a: <>Then it is already linear (n = 0) or separable (n = 1); no substitution is needed.</> },
  { q: 'Is the answer explicit?', a: <>It is usually left as <InlineMath math="y^{1-n} = \ldots" />, as textbooks do; you can take the root to get y.</> },
];

export default function BernoulliPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Bernoulli's Equation" subtitle="dy/dx + Py = Qyⁿ, Made Linear">
        <strong>Bernoulli&apos;s equation</strong> <InlineMath math="\frac{dy}{dx} + Py = Qy^n" /> becomes linear with <InlineMath math="z = y^{1-n}" />. Solve that with the integrating factor and put y back.
      </MethodHeader>
      <FormulaBox label="THE SUBSTITUTION" tag="z = y^(1−n)">
        <Formula math={'\\frac{dz}{dx} + (1-n)Pz = (1-n)Q'} />
        <FormulaSteps steps={[
          { title: '1. Find n', text: <>The power of y on the right.</> },
          { title: '2. z = y^(1−n)', text: <>A linear equation in z.</> },
          { title: '3. Solve', text: <>Integrating factor, then put z back.</> },
        ]} />
        <SymbolKey rows={EX['bernoulli-equation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['bernoulli-equation'].example} />
      <CommonMistakes items={EX['bernoulli-equation'].mistakes} />
      <Lab heading="Interactive Bernoulli Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['linear-ode', 'exact-ode', 'ode-solver']} />
    </MethodPage>
  );
}
