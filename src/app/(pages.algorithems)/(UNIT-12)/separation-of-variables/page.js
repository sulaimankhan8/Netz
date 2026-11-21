'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.separation-of-variables';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why must the separation constant be negative?", a: <>With a positive or zero constant the only X with X(0) = X(L) = 0 is X = 0. A negative one gives X = sin(nπx/L).</> },
  { q: "What does each term of the heat solution do?", a: <>Each mode decays like e^{'{'}−c²n²π²t/L²{'}'}, the higher ones much faster, so the temperature soon looks like the first sine.</> },
  { q: "How is the Laplace case different?", a: <>The y part satisfies Y″ = λY, giving sinh(nπy/a); the coefficient is divided by sinh(nπb/a) to match the top edge.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Separation of Variables Calculator" subtitle="Heat, Wave and Laplace Equations with Fourier Series">
        Write <InlineMath math={"u = X(x)T(t)"} />: the PDE splits into two ODEs linked by a constant. The boundary conditions allow only <InlineMath math={"X = \\sin\\frac{n\\pi x}{L}"} />, and the starting shape is matched by a <strong>Fourier sine series</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE SOLUTIONS" tag="u = 0 AT THE ENDS">
        <Formula math={"\\text{heat: } \\sum b_n \\sin\\frac{n\\pi x}{L}e^{-c^2n^2\\pi^2t/L^2}, \\quad \\text{wave: } \\sum \\left(a_n\\cos\\frac{n\\pi ct}{L} + b_n\\sin\\frac{n\\pi ct}{L}\\right)\\sin\\frac{n\\pi x}{L}"} />
        <FormulaSteps steps={[
          { title: "1. Separate", text: <>u = X(x)T(t).</> },
          { title: "2. Eigenfunctions", text: <>X = sin(nπx/L) from u = 0 at both ends.</> },
          { title: "3. Fourier", text: <>bₙ = (2/L)∫ f sin(nπx/L) dx.</> },
        ]} />
        <SymbolKey rows={EX['separation-of-variables'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['separation-of-variables'].example} />
      <CommonMistakes items={EX['separation-of-variables'].mistakes} />
      <Lab heading="Interactive Separation of Variables Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","heat-equation","pde-constant-coefficients"]} />
    </MethodPage>
  );
}
