'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.difference-equation-z-transform';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the equation uses y(n − 1)?", a: <>Replace n by n + 1 (or n + 2) so the lowest term is y(n); the starting values are then y(0), y(1).</> },
  { q: "How is the answer checked?", a: <>The recurrence is run step by step from the starting values and compared with the formula.</> },
  { q: "Where does the Fibonacci formula come from?", a: <>Y = z/(z² − z − 1) has poles at (1 ± √5)/2, which gives Binet&apos;s formula.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Difference Equation Solver (Z-Transform)" subtitle="Shift Rule, Partial Fractions and a Check">
        A linear <strong>difference equation</strong> links <InlineMath math={"y(n)"} />, <InlineMath math={"y(n + 1)"} />, … like a differential equation links <InlineMath math={"y, y'"} />. The <strong>Z-transform</strong> turns it into algebra for <InlineMath math={"Y(z)"} />, with the starting values built in.
      </MethodHeader>
      <FormulaBox label="THE SHIFT RULE" tag="y(0), y(1) GIVEN">
        <Formula math={"\\mathcal{Z}\\{y(n + 1)\\} = zY - zy(0), \\qquad \\mathcal{Z}\\{y(n + 2)\\} = z^2Y - z^2y(0) - zy(1)"} />
        <FormulaSteps steps={[
          { title: "1. Transform", text: <>Each shifted term, and the right side.</> },
          { title: "2. Solve", text: <>For Y(z): plain algebra.</> },
          { title: "3. Invert", text: <>Partial fractions of Y(z)/z.</> },
        ]} />
        <SymbolKey rows={EX['difference-equation-z-transform'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['difference-equation-z-transform'].example} />
      <CommonMistakes items={EX['difference-equation-z-transform'].mistakes} />
      <Lab heading="Interactive Difference Equations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["z-transform","inverse-z","recurrence-relations"]} />
    </MethodPage>
  );
}
