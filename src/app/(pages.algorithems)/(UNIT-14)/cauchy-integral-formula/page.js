'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cauchy-integral-formula';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the point is outside C?", a: <>Then g(z)/(z − a) is analytic inside C and the integral is 0, by Cauchy&apos;s theorem.</> },
  { q: "What if there are two points inside?", a: <>Split the contour around each point (or use partial fractions) and add the parts. This is the residue theorem.</> },
  { q: "Which way round is C?", a: <>Once, anticlockwise. Going clockwise changes the sign.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Cauchy's Integral Formula Calculator" subtitle="Contour Integrals Around a Circle">
        If <InlineMath math={"g"} /> is analytic inside and on a closed curve <InlineMath math={"C"} /> and <InlineMath math={"a"} /> lies inside, then <InlineMath math={"\\oint_C \\frac{g(z)}{z - a}dz = 2\\pi i\\,g(a)"} />. Its derivative form handles higher powers of <InlineMath math={"(z - a)"} />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="a INSIDE C">
        <Formula math={"\\oint_C \\frac{g(z)}{(z - a)^{n+1}}\\,dz = \\frac{2\\pi i}{n!}\\,g^{(n)}(a)"} />
        <FormulaSteps steps={[
          { title: "1. Points", text: <>Where the bottom is zero.</> },
          { title: "2. Inside?", text: <>Only points inside C count.</> },
          { title: "3. Formula", text: <>2πi g(a), or the derivative form.</> },
        ]} />
        <SymbolKey rows={EX['cauchy-integral-formula'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['cauchy-integral-formula'].example} />
      <CommonMistakes items={EX['cauchy-integral-formula'].mistakes} />
      <Lab heading="Interactive Cauchy Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["residues","laurent-series","cauchy-riemann"]} />
    </MethodPage>
  );
}
