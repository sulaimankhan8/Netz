'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import BetaGammaCalculator from './algorithems.beta-gamma-function';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why is Γ(1/2) = √π?', a: <>Substituting x = t² turns Γ(1/2) into <InlineMath math="2\int_0^\infty e^{-t^2}\,dt" />, the Gaussian integral, which equals √π.</> },
  { q: 'How is the gamma function related to factorials?', a: <>For whole numbers, <InlineMath math="\Gamma(n) = (n - 1)!" />. The rule Γ(n + 1) = nΓ(n) extends factorials to fractions, such as Γ(7/2) = 15√π/8.</> },
  { q: 'When do I use the sin–cos formula?', a: <>For <InlineMath math="\int_0^{\pi/2}\sin^p\theta\cos^q\theta\,d\theta" /> with any powers, even fractions. For whole powers it gives the same answer as the Wallis (reduction) formula.</> },
];

export default function BetaGammaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Beta and Gamma Functions" subtitle="Γ(n), B(m, n) and the Integrals They Solve">
        The <strong>gamma function</strong> extends factorials, <InlineMath math="\Gamma(n) = \int_0^\infty x^{n-1}e^{-x}\,dx" />, and the <strong>beta function</strong> is <InlineMath math="B(m, n) = \frac{\Gamma(m)\Gamma(n)}{\Gamma(m + n)}" />. Together they evaluate many definite integrals exactly.
      </MethodHeader>
      <FormulaBox label="KEY RESULTS" tag="Γ AND B">
        <Formula math={'\\Gamma(n + 1) = n\\Gamma(n), \\quad \\Gamma\\left(\\tfrac{1}{2}\\right) = \\sqrt{\\pi}, \\quad \\int_0^{\\pi/2}\\sin^p\\theta\\cos^q\\theta\\,d\\theta = \\frac{1}{2}B\\left(\\tfrac{p+1}{2}, \\tfrac{q+1}{2}\\right)'} />
        <FormulaSteps steps={[
          { title: '1. Reduce', text: <>Use Γ(n + 1) = nΓ(n) down to Γ(1) or Γ(1/2).</> },
          { title: '2. Beta', text: <>Write B with three gammas.</> },
          { title: '3. Integrals', text: <>Match a standard form, read off m and n.</> },
        ]} />
        <SymbolKey rows={EX['beta-gamma-function'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['beta-gamma-function'].example} />
      <CommonMistakes items={EX['beta-gamma-function'].mistakes} />
      <Lab heading="Interactive Beta & Gamma Calculator"><BetaGammaCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['integral', 'triple-integral', 'double-integral']} />
    </MethodPage>
  );
}
