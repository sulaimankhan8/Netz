'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TripleIntegralCalculator from './algorithems.triple-integral-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I find a volume with a triple integral?', a: <>Integrate 1 over the solid: <InlineMath math="V = \iiint dV" />. The tetrahedron x + y + z ≤ 1 in the first octant has volume 1/6.</> },
  { q: 'What are dV in cylindrical and spherical coordinates?', a: <>Cylindrical: <InlineMath math="dV = r\,dr\,d\theta\,dz" />. Spherical: <InlineMath math="dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta" />. Include these factors in the integrand.</> },
  { q: 'Which limits may contain letters?', a: <>The innermost limits may use both outer letters, the middle limits only the outermost letter, and the outermost limits must be numbers.</> },
];

export default function TripleIntegralPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIPLE INTEGRALS" title="Triple Integral Calculator" subtitle="Cartesian, Cylindrical and Spherical">
        Evaluate a <strong>triple integral</strong> from the inside out: integrate in the innermost variable with the other two held constant, then the middle, then the outermost. Volumes, masses and averages over solids.
      </MethodHeader>
      <FormulaBox label="ITERATED INTEGRAL" tag="INSIDE OUT">
        <Formula math={'\\iiint_V f\\,dV = \\int_a^b\\int_{y_1(x)}^{y_2(x)}\\int_{z_1(x, y)}^{z_2(x, y)} f\\,dz\\,dy\\,dx'} />
        <FormulaSteps steps={[
          { title: '1. Innermost', text: <>In z; x and y are constants.</> },
          { title: '2. Middle', text: <>In y; x is a constant.</> },
          { title: '3. Outermost', text: <>In x, between numbers.</> },
        ]} />
        <SymbolKey rows={EX['triple-integral-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['triple-integral-calculator'].example} />
      <CommonMistakes items={EX['triple-integral-calculator'].mistakes} />
      <Lab heading="Interactive Triple Integral Calculator"><TripleIntegralCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['double-integral', 'jacobian', 'beta-gamma']} />
    </MethodPage>
  );
}
